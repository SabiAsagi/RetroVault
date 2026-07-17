import { PrismaClient } from '@prisma/client';
import { igdbImageUrl } from '../src/lib/igdb';
import {
  createStats,
  readPositiveInt,
  releaseStatusFromIgdb,
  shortText,
  toIsoDate,
  toYear,
  walkIgdbById,
} from './igdb-sync-utils';

const prisma = new PrismaClient();

type IgdbNamedEntity = {
  id?: number;
  name?: string;
  abbreviation?: string;
};

type IgdbReleaseDate = {
  date?: number;
  y?: number;
  human?: string;
  platform?: IgdbNamedEntity;
  status?: { name?: string };
};

type IgdbInvolvedCompany = {
  company?: IgdbNamedEntity;
  developer?: boolean;
  publisher?: boolean;
};

type IgdbGame = {
  id: number;
  name?: string;
  slug?: string;
  summary?: string;
  storyline?: string;
  first_release_date?: number;
  rating?: number;
  rating_count?: number;
  total_rating?: number;
  hypes?: number;
  url?: string;
  genres?: IgdbNamedEntity[];
  platforms?: IgdbNamedEntity[];
  release_dates?: IgdbReleaseDate[];
  cover?: { url?: string };
  screenshots?: Array<{ url?: string }>;
  involved_companies?: IgdbInvolvedCompany[];
  game_status?: { name?: string };
  videos?: Array<{ video_id?: string }>;
};

type CompanyRole = 'DEVELOPER' | 'PUBLISHER';

type CompanyRecord = {
  id: string;
  type: string;
};

function parseIgdbMarker(value?: string | null): number | null {
  const match = value?.match(/^IGDB:(\d+)$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function normalizedRating(game: IgdbGame): number | null {
  const raw = game.total_rating ?? game.rating;
  return typeof raw === 'number' ? Number((raw / 10).toFixed(1)) : null;
}

function earliestReleaseForPlatform(game: IgdbGame, platform: IgdbNamedEntity): IgdbReleaseDate | null {
  const releases = (game.release_dates ?? [])
    .filter((release) => {
      if (platform.id && release.platform?.id) {
        return platform.id === release.platform.id;
      }

      return release.platform?.name?.toLowerCase() === platform.name?.toLowerCase();
    })
    .sort((a, b) => {
      const aValue = a.date ?? (a.y ?? 9999) * 31_536_000;
      const bValue = b.date ?? (b.y ?? 9999) * 31_536_000;
      return aValue - bValue;
    });

  return releases[0] ?? null;
}

async function syncGames() {
  console.log('Starting IGDB game sync...');

  const stats = createStats();
  const maxItems = readPositiveInt('IGDB_SYNC_MAX_GAMES', 0);
  const minYear = readPositiveInt('IGDB_SYNC_MIN_YEAR', 1950);
  const minTimestamp = Math.floor(Date.UTC(minYear, 0, 1) / 1000);
  const includeAdult = process.env.IGDB_SYNC_INCLUDE_ADULT === 'true';

  const platformRecords = await prisma.platform.findMany({
    select: {
      id: true,
      name: true,
      additionalInput: true,
    },
  });

  const platformByIgdbId = new Map<number, string>();
  const platformByName = new Map<string, string>();

  for (const platform of platformRecords) {
    const igdbId = parseIgdbMarker(platform.additionalInput);
    if (igdbId) platformByIgdbId.set(igdbId, platform.id);
    platformByName.set(platform.name.toLowerCase(), platform.id);
  }

  const companyRecords = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      type: true,
    },
  });

  const companyByName = new Map<string, CompanyRecord>(
    companyRecords.map((company) => [company.name.toLowerCase(), { id: company.id, type: company.type }]),
  );

  async function ensureCompany(name: string | undefined, role: CompanyRole): Promise<string | null> {
    const normalizedName = name?.trim();
    if (!normalizedName) return null;

    const key = normalizedName.toLowerCase();
    const cached = companyByName.get(key);

    if (cached) {
      if (cached.type !== role && cached.type !== 'BOTH') {
        await prisma.company.update({
          where: { id: cached.id },
          data: { type: 'BOTH' },
        });
        cached.type = 'BOTH';
      }

      return cached.id;
    }

    const company = await prisma.company.create({
      data: {
        name: normalizedName,
        type: role,
        status: 'APPROVED',
      },
      select: {
        id: true,
        type: true,
      },
    });

    companyByName.set(key, company);
    return company.id;
  }

  const filters = [
    'version_parent = null',
    'parent_game = null',
    'platforms != null',
    `first_release_date >= ${minTimestamp}`,
  ];

  if (!includeAdult) {
    filters.push('themes != (42)');
  }

  await walkIgdbById<IgdbGame>({
    endpoint: 'games',
    maxItems,
    where: filters.join(' & '),
    fields: [
      'id',
      'name',
      'slug',
      'summary',
      'storyline',
      'first_release_date',
      'rating',
      'rating_count',
      'total_rating',
      'hypes',
      'url',
      'genres.name',
      'platforms.id',
      'platforms.name',
      'platforms.abbreviation',
      'release_dates.date',
      'release_dates.y',
      'release_dates.human',
      'release_dates.platform.id',
      'release_dates.platform.name',
      'release_dates.status.name',
      'cover.url',
      'screenshots.url',
      'involved_companies.company.name',
      'involved_companies.developer',
      'involved_companies.publisher',
      'game_status.name',
      'videos.video_id',
    ].join(','),
    onBatch: async (games) => {
      for (const igdbGame of games) {
        const title = igdbGame.name?.trim();
        if (!title) {
          stats.skipped += 1;
          continue;
        }

        try {
          const developerName = igdbGame.involved_companies?.find(
            (company) => company.developer && company.company?.name,
          )?.company?.name;
          const publisherName = igdbGame.involved_companies?.find(
            (company) => company.publisher && company.company?.name,
          )?.company?.name;

          const developerId = await ensureCompany(developerName, 'DEVELOPER');
          const publisherId = await ensureCompany(publisherName, 'PUBLISHER');
          const coverImageUrl = igdbGame.cover?.url
            ? igdbImageUrl(igdbGame.cover.url, 't_cover_big')
            : null;
          const screenshotUrls = [
            ...new Set(
              (igdbGame.screenshots ?? [])
                .map((screenshot) =>
                  screenshot.url
                    ? igdbImageUrl(screenshot.url, 't_screenshot_big')
                    : null,
                )
                .filter((url): url is string => Boolean(url)),
            ),
          ].slice(0, 6);
          const trailerId = igdbGame.videos?.find((video) => video.video_id)?.video_id;
          const platforms = igdbGame.platforms ?? [];

          if (platforms.length === 0) {
            stats.skipped += 1;
            continue;
          }

          for (const igdbPlatform of platforms) {
            const platformId =
              (igdbPlatform.id ? platformByIgdbId.get(igdbPlatform.id) : null) ??
              (igdbPlatform.name ? platformByName.get(igdbPlatform.name.toLowerCase()) : null) ??
              (igdbPlatform.abbreviation
                ? platformByName.get(igdbPlatform.abbreviation.toLowerCase())
                : null);

            if (!platformId) {
              stats.skipped += 1;
              console.warn(
                `[SKIPPED] ${title}: platform not found (${igdbPlatform.name ?? igdbPlatform.id})`,
              );
              continue;
            }

            const platformRelease = earliestReleaseForPlatform(igdbGame, igdbPlatform);
            const releaseTimestamp = platformRelease?.date ?? igdbGame.first_release_date ?? null;
            const releaseYear = platformRelease?.y ?? toYear(releaseTimestamp);
            const releaseDate = toIsoDate(releaseTimestamp) ?? platformRelease?.human ?? null;
            const referenceUrl =
              igdbGame.url ?? `https://www.igdb.com/games/${igdbGame.slug ?? igdbGame.id}`;

            const data = {
              title,
              originalTitle: title,
              platformId,
              developerId,
              publisherId,
              genre: igdbGame.genres?.[0]?.name ?? 'Unknown',
              releaseYear,
              releaseDate,
              description: igdbGame.summary ?? igdbGame.storyline ?? null,
              shortDescription: shortText(igdbGame.summary ?? igdbGame.storyline),
              coverImageUrl,
              rating: normalizedRating(igdbGame),
              popularity: Math.max(
                0,
                Math.round((igdbGame.rating_count ?? 0) + (igdbGame.hypes ?? 0)),
              ),
              referenceUrl,
              trailerUrl: trailerId ? `https://www.youtube.com/watch?v=${trailerId}` : null,
              releaseStatus: releaseStatusFromIgdb(
                platformRelease?.status?.name ?? igdbGame.game_status?.name,
                releaseTimestamp,
              ),
              status: 'APPROVED',
              deletedAt: null,
            };

            const existing = await prisma.game.findFirst({
              where: {
                platformId,
                OR: [
                  { referenceUrl },
                  {
                    title: { equals: title, mode: 'insensitive' },
                    releaseYear,
                  },
                ],
              },
              select: {
                id: true,
              },
            });

            let gameId: string;

            if (existing) {
              const updated = await prisma.game.update({
                where: { id: existing.id },
                data,
                select: { id: true },
              });
              gameId = updated.id;
              stats.updated += 1;
            } else {
              const created = await prisma.game.create({
                data,
                select: { id: true },
              });
              gameId = created.id;
              stats.created += 1;
            }

            if (screenshotUrls.length > 0) {
              await prisma.screenshot.deleteMany({
                where: { gameId },
              });
              await prisma.screenshot.createMany({
                data: screenshotUrls.map((imageUrl) => ({
                  gameId,
                  imageUrl,
                })),
              });
            }
          }
        } catch (error) {
          stats.errors += 1;
          console.error(`Failed to sync game ${igdbGame.id} (${title}):`, error);
        }
      }
    },
  });

  const platformCounts = await prisma.game.groupBy({
    by: ['platformId'],
    _count: { _all: true },
  });

  for (const count of platformCounts) {
    await prisma.platform.update({
      where: { id: count.platformId },
      data: { gamesCount: count._count._all },
    });
  }

  console.log('IGDB game sync completed:', stats);
}

syncGames()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

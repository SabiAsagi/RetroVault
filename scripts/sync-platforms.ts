import { PrismaClient } from '@prisma/client';
import { igdbImageUrl } from '../src/lib/igdb';
import {
  createStats,
  platformTypeFromIgdb,
  readPositiveInt,
  releaseStatusFromIgdb,
  toIsoDate,
  toYear,
  walkIgdbById,
} from './igdb-sync-utils';

const prisma = new PrismaClient();

type IgdbPlatformVersionCompany = {
  company?: { name?: string };
  manufacturer?: boolean;
};

type IgdbPlatformReleaseDate = {
  date?: number;
  y?: number;
};

type IgdbPlatformVersion = {
  name?: string;
  summary?: string;
  cpu?: string;
  graphics?: string;
  memory?: string;
  media?: string;
  main_manufacturer?: IgdbPlatformVersionCompany;
  companies?: IgdbPlatformVersionCompany[];
  platform_version_release_dates?: IgdbPlatformReleaseDate[];
};

type IgdbPlatform = {
  id: number;
  name?: string;
  abbreviation?: string;
  alternative_name?: string;
  generation?: number;
  summary?: string;
  url?: string;
  platform_logo?: { url?: string };
  platform_type?: { name?: string };
  versions?: IgdbPlatformVersion[];
};

function earliestPlatformRelease(versions: IgdbPlatformVersion[]) {
  const dates = versions
    .flatMap((version) => version.platform_version_release_dates ?? [])
    .filter((release) => release.date || release.y)
    .sort((a, b) => {
      const aValue = a.date ?? (a.y ?? 9999) * 31_536_000;
      const bValue = b.date ?? (b.y ?? 9999) * 31_536_000;
      return aValue - bValue;
    });

  return dates[0] ?? null;
}

function findManufacturer(versions: IgdbPlatformVersion[]): string {
  for (const version of versions) {
    const candidates = [
      version.main_manufacturer,
      ...(version.companies ?? []).filter((company) => company.manufacturer),
    ];

    for (const candidate of candidates) {
      const name = candidate?.company?.name?.trim();
      if (name) return name;
    }
  }

  return 'Unknown';
}

async function syncPlatforms() {
  console.log('Starting IGDB platform sync...');

  const stats = createStats();
  const maxItems = readPositiveInt('IGDB_SYNC_MAX_PLATFORMS', 0);

  await walkIgdbById<IgdbPlatform>({
    endpoint: 'platforms',
    maxItems,
    fields: [
      'id',
      'name',
      'abbreviation',
      'alternative_name',
      'generation',
      'summary',
      'url',
      'platform_logo.url',
      'platform_type.name',
      'versions.name',
      'versions.summary',
      'versions.cpu',
      'versions.graphics',
      'versions.memory',
      'versions.media',
      'versions.main_manufacturer.company.name',
      'versions.main_manufacturer.manufacturer',
      'versions.companies.company.name',
      'versions.companies.manufacturer',
      'versions.platform_version_release_dates.date',
      'versions.platform_version_release_dates.y',
    ].join(','),
    onBatch: async (platforms) => {
      for (const igdbPlatform of platforms) {
        try {
          const name = igdbPlatform.name?.trim();
          if (!name) {
            stats.skipped += 1;
            continue;
          }

          const versions = igdbPlatform.versions ?? [];
          const primaryVersion = versions[0];
          const earliestRelease = earliestPlatformRelease(versions);
          const releaseTimestamp = earliestRelease?.date ?? null;
          const releaseYear = earliestRelease?.y ?? toYear(releaseTimestamp);
          const logoUrl = igdbPlatform.platform_logo?.url
            ? igdbImageUrl(igdbPlatform.platform_logo.url, 't_cover_big')
            : null;
          const variants = versions
            .map((version) => version.name?.trim())
            .filter((versionName): versionName is string => Boolean(versionName && versionName !== name));

          const data = {
            name,
            manufacturer: findManufacturer(versions),
            generation: igdbPlatform.generation ?? null,
            releaseYear,
            releaseDate: toIsoDate(releaseTimestamp),
            type: platformTypeFromIgdb(igdbPlatform.platform_type?.name),
            variants: variants.length > 0 ? JSON.stringify(variants) : null,
            imageUrl: logoUrl,
            logoUrl,
            description: igdbPlatform.summary ?? primaryVersion?.summary ?? null,
            specs_cpu: primaryVersion?.cpu ?? null,
            specs_gpu: primaryVersion?.graphics ?? null,
            specs_memory: primaryVersion?.memory ?? null,
            mediaFormat: primaryVersion?.media ?? null,
            releaseStatus: releaseStatusFromIgdb(null, releaseTimestamp),
            additionalInput: `IGDB:${igdbPlatform.id}`,
            status: 'APPROVED',
          };

          const existing = await prisma.platform.findFirst({
            where: {
              OR: [
                { additionalInput: `IGDB:${igdbPlatform.id}` },
                { name: { equals: name, mode: 'insensitive' } },
              ],
            },
            select: { id: true },
          });

          if (existing) {
            await prisma.platform.update({
              where: { id: existing.id },
              data,
            });
            stats.updated += 1;
          } else {
            await prisma.platform.create({ data });
            stats.created += 1;
          }
        } catch (error) {
          stats.errors += 1;
          console.error(`Failed to sync platform ${igdbPlatform.id}:`, error);
        }
      }
    },
  });

  console.log('IGDB platform sync completed:', stats);
}

syncPlatforms()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

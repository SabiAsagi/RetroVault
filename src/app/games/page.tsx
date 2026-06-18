import ArchiveWrapper from "@/components/wrappers/ArchiveWrapper";
import { getUserCollection } from "@/app/actions/collection";
import { prisma } from "@/lib/prisma";

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ platform?: string, developer?: string, publisher?: string, q?: string }> }) {
  const { platform, developer, publisher, q } = await searchParams;
  
  const where: any = {};
  if (platform) where.platform = { name: platform };
  if (developer) where.developer = { name: developer };
  if (publisher) where.publisher = { name: publisher };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { developer: { name: { contains: q, mode: 'insensitive' } } },
      { publisher: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  // Only fetch first page of games (server-side)
  const [gamesRaw, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy: [{ views: 'desc' }, { popularity: 'desc' }],
      take: 30,
      select: {
        id: true,
        title: true,
        releaseYear: true,
        genre: true,
        country: true,
        coverImageUrl: true,
        popularity: true,
        views: true,
        rating: true,
        releaseStatus: true,
        installSize: true,
        platform: { select: { name: true, type: true, discontinued: true } },
        developer: { select: { name: true } },
        publisher: { select: { name: true } },
      }
    }),
    prisma.game.count({ where }),
  ]);

  const games = gamesRaw.map(g => ({
    id: g.id,
    title: g.title,
    releaseYear: g.releaseYear,
    platform: g.platform.name,
    genre: g.genre,
    country: g.country || '',
    developer: g.developer?.name || '',
    publisher: g.publisher?.name || '',
    era: `${Math.floor(g.releaseYear / 10) * 10}s`,
    imageUrl: g.coverImageUrl || '',
    popularity: g.popularity,
    views: g.views,
    rating: g.rating || 0,
    rarity: 'Common',
    releaseStatus: g.releaseStatus,
    platformType: g.platform.type,
    platformDiscontinued: g.platform.discontinued || false,
    installSize: g.installSize || null,
  }));

  // Get filter options using direct tables where possible to avoid expensive distinct queries
  const [platforms, allGenres, allCountries, companies] = await Promise.all([
    prisma.platform.findMany({ select: { name: true } }),
    prisma.game.findMany({ select: { genre: true }, distinct: ['genre'] }),
    prisma.game.findMany({ where: { country: { not: null } }, select: { country: true }, distinct: ['country'] }),
    prisma.company.findMany({ select: { name: true } }),
  ]);

  const filterOptions = {
    platforms: platforms.map(p => p.name).sort(),
    genres: [...new Set(allGenres.map(g => g.genre))].filter(Boolean).sort(),
    countries: [...new Set(allCountries.map(c => c.country))].filter(Boolean).sort() as string[],
    developers: companies.map(c => c.name).sort() as string[],
  };

  const collection = await getUserCollection();

  return <ArchiveWrapper 
    initialGames={games as any[]} 
    initialCollection={collection} 
    initialSearchQuery={q} 
    initialTotal={total}
    initialFilterOptions={filterOptions}
  />;
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '30');
  const sort = searchParams.get('sort') || 'popularity';
  const search = searchParams.get('q') || '';
  const platforms = searchParams.get('platforms')?.split(',').filter(Boolean) || [];
  const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
  const countries = searchParams.get('countries')?.split(',').filter(Boolean) || [];
  const developers = searchParams.get('developers')?.split(',').filter(Boolean) || [];
  const publishers = searchParams.get('publishers')?.split(',').filter(Boolean) || [];

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { developer: { name: { contains: search, mode: 'insensitive' } } },
      { publisher: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (platforms.length > 0) {
    where.platform = { name: { in: platforms } };
  }

  if (genres.length > 0) {
    where.genre = { in: genres };
  }

  if (countries.length > 0) {
    const countryOr = [
      { country: { in: countries } },
      { developer: { country: { in: countries } } },
      { publisher: { country: { in: countries } } },
    ];
    if (where.AND) {
      where.AND.push({ OR: countryOr });
    } else {
      where.AND = [{ OR: countryOr }];
    }
  }

  if (developers.length > 0) {
    where.developer = { name: { in: developers } };
  }

  if (publishers.length > 0) {
    where.publisher = { name: { in: publishers } };
  }

  let orderBy: any;
  switch (sort) {
    case 'year-asc': orderBy = { releaseYear: 'asc' }; break;
    case 'year-desc': orderBy = { releaseYear: 'desc' }; break;
    case 'name-asc': orderBy = { title: 'asc' }; break;
    case 'name-desc': orderBy = { title: 'desc' }; break;
    case 'rating': orderBy = { rating: 'desc' }; break;
    case 'popularity':
    default: orderBy = [{ views: 'desc' }, { popularity: 'desc' }]; break;
  }

  const [games, total, allPlatforms, allGenres, allCountries, allDevelopers] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    // Filter options - only fetch once when no filters applied (first load)
    platforms.length === 0 && genres.length === 0 && countries.length === 0 && developers.length === 0 && publishers.length === 0 && !search
      ? prisma.game.findMany({ select: { platform: { select: { name: true } } }, distinct: ['platformId'] })
      : Promise.resolve(null),
    platforms.length === 0 && genres.length === 0 && countries.length === 0 && developers.length === 0 && publishers.length === 0 && !search
      ? prisma.game.findMany({ select: { genre: true }, distinct: ['genre'] })
      : Promise.resolve(null),
    platforms.length === 0 && genres.length === 0 && countries.length === 0 && developers.length === 0 && publishers.length === 0 && !search
      ? prisma.company.findMany({ where: { country: { not: null } }, select: { country: true }, distinct: ['country'] })
      : Promise.resolve(null),
    platforms.length === 0 && genres.length === 0 && countries.length === 0 && developers.length === 0 && publishers.length === 0 && !search
      ? prisma.game.findMany({ where: { developerId: { not: null } }, select: { developer: { select: { name: true } } }, distinct: ['developerId'] })
      : Promise.resolve(null),
  ]);

  const formattedGames = games.map(g => ({
    id: g.id,
    title: g.title,
    releaseYear: g.releaseYear,
    platform: g.platform.name,
    genre: g.genre,
    country: g.country || '',
    developer: g.developer?.name || '',
    publisher: g.publisher?.name || '',
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

  const response: any = {
    games: formattedGames,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };

  // Include filter options only on initial load
  if (allPlatforms) {
    response.filterOptions = {
      platforms: [...new Set(allPlatforms.map(p => p.platform.name))].sort(),
      genres: [...new Set(allGenres!.map(g => g.genre))].filter(Boolean).sort(),
      countries: [...new Set(allCountries!.map(c => c.country))].filter(Boolean).sort(),
      developers: [...new Set(allDevelopers!.map(d => d.developer?.name).filter(Boolean))].sort(),
      publishers: [...new Set(allDevelopers!.map(d => d.developer?.name).filter(Boolean))].sort(), // companies are both
    };
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    }
  });
}

import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { games as sampleGames, platforms as samplePlatforms } from '@/data-extended';

const TOKEN_HASH = '1aef05922939a1515085063adc6ef8baa4ecbd35512b8121adce6e6ddfda77e9';

function isAuthorized(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  return createHash('sha256').update(token).digest('hex') === TOKEN_HASH;
}

async function upsertCompany(name: string | undefined, companyType: 'DEVELOPER' | 'PUBLISHER') {
  if (!name) return null;

  const existing = await prisma.company.findUnique({ where: { name } });
  const nextType =
    !existing || existing.type === companyType || existing.type === 'BOTH'
      ? existing?.type ?? companyType
      : 'BOTH';

  return prisma.company.upsert({
    where: { name },
    update: { type: nextType, status: 'APPROVED' },
    create: { name, type: companyType, status: 'APPROVED' },
  });
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await Promise.all([
    prisma.platform.count(),
    prisma.company.count(),
    prisma.game.count(),
  ]);

  if (existing.some((count) => count > 0)) {
    return NextResponse.json(
      {
        error: 'Archive tables are not empty. Rebuild aborted to prevent duplicate or mixed data.',
        counts: { platforms: existing[0], companies: existing[1], games: existing[2] },
      },
      { status: 409 },
    );
  }

  const platformRecords = [];
  for (const platform of samplePlatforms as any[]) {
    platformRecords.push(
      await prisma.platform.create({
        data: {
          name: platform.name,
          manufacturer: platform.manufacturer || 'Unknown',
          generation: platform.generation || null,
          releaseYear: platform.releaseYear || 2000,
          type: platform.type || 'HOME',
          variants: platform.variants || null,
          imageUrl: platform.imageUrl || null,
          description: platform.description || null,
          innovationPoint: platform.innovationPoint || null,
          status: 'APPROVED',
        },
      }),
    );
  }

  let createdGames = 0;
  for (const gameData of sampleGames as any[]) {
    const platform = platformRecords.find((record) => record.name === gameData.platform);
    if (!platform) continue;

    const developer = await upsertCompany(gameData.developer, 'DEVELOPER');
    const publisher = await upsertCompany(gameData.publisher, 'PUBLISHER');
    const releaseYear = Number(gameData.releaseYear) || platform.releaseYear || 2000;

    await prisma.game.create({
      data: {
        title: gameData.title,
        platformId: platform.id,
        developerId: developer?.id,
        publisherId: publisher?.id,
        genre: gameData.genre || 'Unknown',
        releaseYear,
        releaseDate: gameData.releaseDate || null,
        country: gameData.country || null,
        coverImageUrl: gameData.imageUrl || null,
        description: gameData.description || null,
        historicalContext: gameData.historicalContext || null,
        popularity: gameData.popularity || 0,
        rating: gameData.rating || 0,
        status: 'APPROVED',
      },
    });
    createdGames += 1;
  }

  const counts = await Promise.all([
    prisma.platform.count(),
    prisma.company.count(),
    prisma.game.count(),
  ]);

  return NextResponse.json({
    ok: true,
    created: {
      platforms: platformRecords.length,
      companies: counts[1],
      games: createdGames,
    },
    counts: { platforms: counts[0], companies: counts[1], games: counts[2] },
  });
}

"use server";
import { prisma } from "@/lib/prisma";

export async function getTimelineEvents() {
  const events = await prisma.timelineEvent.findMany({
    orderBy: [
      { year: 'asc' },
      { sortOrder: 'asc' }
    ]
  });
  return events;
}

export async function getPlatformsForTimeline() {
  return await prisma.platform.findMany({
    where: { status: 'APPROVED' },
    orderBy: { releaseYear: 'asc' }
  });
}

export async function getTopGamesForTimeline() {
  // Single query: fetch all games ordered by year+popularity, then group in JS
  const allGames = await prisma.game.findMany({
    where: { releaseYear: { gte: 1970 } },
    orderBy: [{ releaseYear: 'asc' }, { popularity: 'desc' }],
    select: {
      id: true,
      title: true,
      releaseYear: true,
      genre: true,
      coverImageUrl: true,
      popularity: true,
      views: true,
      platform: { select: { name: true } },
    },
  });

  // Group by year, keep top 20 per year
  const yearCountMap = new Map<number, number>();
  const filtered = allGames.filter(g => {
    const count = yearCountMap.get(g.releaseYear) || 0;
    if (count >= 20) return false;
    yearCountMap.set(g.releaseYear, count + 1);
    return true;
  });

  return filtered.map(g => ({
    id: g.id,
    title: g.title,
    releaseYear: g.releaseYear,
    platform: g.platform.name,
    genre: g.genre,
    imageUrl: g.coverImageUrl || '',
    popularity: g.popularity,
    views: g.views,
  })) as any[];
}


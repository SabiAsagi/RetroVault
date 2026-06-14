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
  const minYear = 1970;
  const maxYear = new Date().getFullYear();
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  
  const results = await Promise.all(years.map(year => 
    prisma.game.findMany({
      where: { releaseYear: year },
      orderBy: { popularity: 'desc' },
      take: 20, // Top 20 games per year
      include: { platform: true }
    })
  ));
  
  const games = results.flat();
  return games.map(g => ({
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


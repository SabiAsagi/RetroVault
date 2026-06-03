"use server";
import { prisma } from "@/lib/prisma";
import { Game } from "@/types";

export async function getGamesFromDB(query: string = ""): Promise<Game[]> {
  const games = await prisma.game.findMany({
    where: query ? {
      OR: [
        { title: { contains: query } },
        { platform: { name: { contains: query } } }
      ]
    } : undefined,
    include: {
      platform: true,
      developer: true,
      publisher: true,
    },
    orderBy: {
      releaseYear: 'asc'
    }
  });

  return games.map(g => ({
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
    description: g.description || '',
    popularity: g.popularity,
    rating: g.rating || 0,
    rarity: 'Common'
  })) as unknown as Game[];
}

export async function getGameById(id: string): Promise<Game | null> {
  const g = await prisma.game.findUnique({
    where: { id },
    include: {
      platform: true,
      developer: true,
      publisher: true,
    }
  });

  if (!g) return null;

  return {
    id: g.id,
    title: g.title,
    releaseYear: g.releaseYear,
    releaseDate: g.releaseDate || undefined,
    platform: g.platform.name,
    genre: g.genre,
    country: g.country || '',
    developer: g.developer?.name || '',
    publisher: g.publisher?.name || '',
    era: `${Math.floor(g.releaseYear / 10) * 10}s`,
    imageUrl: g.coverImageUrl || '',
    description: g.description || '',
    historicalContext: g.historicalContext || '',
    popularity: g.popularity,
    rating: g.rating || 0,
    rarity: 'Common'
  } as unknown as Game;
}

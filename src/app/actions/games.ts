"use server";
import { prisma } from "@/lib/prisma";
import { Game } from "@/types";
import { parseGameSlug } from "@/lib/slug";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    rarity: 'Common',
    releaseStatus: g.releaseStatus,
    platformType: g.platform.type,
    platformDiscontinued: g.platform.discontinued || false
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
    rarity: 'Common',
    releaseStatus: g.releaseStatus,
    platformType: g.platform.type,
    platformDiscontinued: g.platform.discontinued || false,
    originalTitle: g.originalTitle || undefined,
    shortDescription: g.shortDescription || undefined,
    pcSpecsMin: g.pcSpecsMin || undefined,
    pcSpecsRec: g.pcSpecsRec || undefined,
    installSize: g.installSize || undefined
  } as unknown as Game;
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const { year, title } = parseGameSlug(slug);
  
  const g = await prisma.game.findFirst({
    where: { 
      title,
      ...(year !== null ? { releaseYear: year } : {})
    },
    include: {
      platform: true,
      developer: true,
      publisher: true,
    }
  });

  if (g) {
    await prisma.game.update({
      where: { id: g.id },
      data: { views: { increment: 1 } }
    });
  }

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
    rarity: 'Common',
    releaseStatus: g.releaseStatus,
    platformType: g.platform.type,
    platformDiscontinued: g.platform.discontinued || false,
    originalTitle: g.originalTitle || undefined,
    shortDescription: g.shortDescription || undefined,
    pcSpecsMin: g.pcSpecsMin || undefined,
    pcSpecsRec: g.pcSpecsRec || undefined,
    installSize: g.installSize || undefined
  } as unknown as Game;
}

export async function getGameReviews(gameId: string) {
  return prisma.review.findMany({
    where: { gameId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, nickname: true, image: true }
      }
    }
  });
}

export async function createReview(gameId: string, rating: number, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const userId = (session.user as any).id as string;
  
  // Upsert review
  const review = await prisma.review.upsert({
    where: {
      userId_gameId: { userId, gameId }
    },
    update: { rating, content },
    create: { userId, gameId, rating, content }
  });

  // Update Game Rating
  const allReviews = await prisma.review.findMany({ where: { gameId }, select: { rating: true } });
  const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
  await prisma.game.update({
    where: { id: gameId },
    data: { rating: Number(avg.toFixed(1)) }
  });

  return review;
}

export async function deleteReview(reviewId: string, gameId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id as string;

  await prisma.review.delete({
    where: { id: reviewId, userId }
  });

  // Update Game Rating
  const allReviews = await prisma.review.findMany({ where: { gameId }, select: { rating: true } });
  const avg = allReviews.length > 0 ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length : 0;
  await prisma.game.update({
    where: { id: gameId },
    data: { rating: Number(avg.toFixed(1)) }
  });
}

"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CollectionItem } from "@/types";

export async function getUserCollection(): Promise<CollectionItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const items = await prisma.collectionItem.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: 'asc' }
  });

  return items.map(item => ({
    id: item.id,
    gameId: item.gameId,
    status: item.ownershipStatus as any,
    ownershipStatus: item.ownershipStatus as any,
    purchaseType: item.purchaseType as any || null,
    condition: item.condition as any || null,
    region: item.region as any || null,
    purchaseDate: item.purchaseDate || '',
    purchasePrice: item.purchasePrice || undefined,
    memo: item.memo || '',
    playStartDate: item.playStartDate || undefined,
    clearDate: item.clearDate || undefined,
    playTime: item.playTime || undefined,
    playStatus: item.playStatus as any || '미플레이',
    rating: item.rating || 0,
    visibility: item.visibility as any || 'public',
    sortIndex: item.sortOrder
  }));
}

export async function updateCollectionItem(gameId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not logged in");

  await prisma.collectionItem.upsert({
    where: {
      userId_gameId: { userId: session.user.id, gameId }
    },
    update: data,
    create: {
      userId: session.user.id,
      gameId,
      ownershipStatus: data.ownershipStatus || '위시리스트',
      ...data
    }
  });
}

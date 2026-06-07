"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CollectionItem } from "@/types";
import { revalidatePath } from "next/cache";

export async function getUserCollection(): Promise<CollectionItem[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const items = await prisma.collectionItem.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: 'asc' },
    include: { groups: true }
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
    sortIndex: item.sortOrder,
    groupId: item.groups?.[0]?.groupId || ''
  }));
}

export async function updateCollectionItem(gameId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not logged in");

  const { groupId, ...itemData } = data;

  const item = await prisma.collectionItem.upsert({
    where: {
      userId_gameId: { userId: session.user.id, gameId }
    },
    update: itemData,
    create: {
      userId: session.user.id,
      gameId,
      ownershipStatus: itemData.ownershipStatus || '위시리스트',
      ...itemData
    }
  });

  if (groupId) {
    // Check if group exists and belongs to user
    const group = await prisma.collectionGroup.findFirst({
      where: { id: groupId, userId: session.user.id }
    });

    if (group) {
      // Remove from old groups first
      await prisma.collectionGroupItem.deleteMany({
        where: { itemId: item.id }
      });
      await prisma.collectionGroupItem.upsert({
        where: {
          groupId_itemId: { groupId: group.id, itemId: item.id }
        },
        update: {},
        create: {
          groupId: group.id,
          itemId: item.id
        }
      });
    }
  } else {
    await prisma.collectionGroupItem.deleteMany({
      where: { itemId: item.id }
    });
  }

  revalidatePath('/community');
}

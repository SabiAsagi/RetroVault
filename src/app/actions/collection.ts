"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CollectionItem } from "@/types";
import { revalidatePath } from "next/cache";
import { DEFAULT_OWNERSHIP_STATUS, DEFAULT_PLAY_STATUS } from "@/constants/collection";
import { z } from 'zod';

const collectionUpdateSchema = z.object({
  ownershipStatus: z.enum(['위시리스트', '미개봉', '전부 보유', '일부 누락', '보유중(실물)', '보유중(디지털)', '구독플랜']).optional(),
  status: z.enum(['위시리스트', '미개봉', '전부 보유', '일부 누락', '보유중(실물)', '보유중(디지털)', '구독플랜']).optional(),
  purchaseType: z.enum(['패키지', '다운로드', '구독']).nullable().optional(),
  condition: z.enum(['Mint', 'Excellent', 'Good', 'Fair', 'Poor']).nullable().optional(),
  region: z.enum(['KOR', 'JPN', 'USA', 'EUR', 'OTHER']).nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  purchasePrice: z.number().int().nonnegative().nullable().optional(),
  memo: z.string().nullable().optional(),
  playStartDate: z.string().nullable().optional(),
  clearDate: z.string().nullable().optional(),
  playTime: z.number().int().nonnegative().nullable().optional(),
  playStatus: z.enum(['미플레이', '플레이중', '엔딩 완료', '중단', '반복 플레이중']).optional(),
  rating: z.number().int().min(0).max(5).nullable().optional(),
  visibility: z.enum(['public', 'private', 'friends']).optional(),
  groupId: z.string().optional(),
}).strict();

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
    playStatus: item.playStatus as any || DEFAULT_PLAY_STATUS,
    rating: item.rating || 0,
    visibility: item.visibility as any || 'public',
    sortIndex: item.sortOrder,
    groupId: item.groups?.[0]?.groupId || ''
  }));
}

export async function updateCollectionItem(gameId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not logged in");

  const { groupId, status, ...itemData } = collectionUpdateSchema.parse(data);
  if (status !== undefined && itemData.ownershipStatus === undefined) {
    itemData.ownershipStatus = status;
  }

  const item = await prisma.collectionItem.upsert({
    where: {
      userId_gameId: { userId: session.user.id, gameId }
    },
    update: itemData,
    create: {
      userId: session.user.id,
      gameId,
      ownershipStatus: itemData.ownershipStatus || DEFAULT_OWNERSHIP_STATUS,
      visibility: 'private',
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
  } else if (groupId === '') {
    await prisma.collectionGroupItem.deleteMany({
      where: { itemId: item.id }
    });
  }

  revalidatePath('/collection');
  revalidatePath('/community');
}

export async function batchUpdateCollectionItems(gameIds: string[], data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not logged in");

  const { groupId, status, ...itemData } = collectionUpdateSchema.parse(data);
  if (status !== undefined && itemData.ownershipStatus === undefined) {
    itemData.ownershipStatus = status;
  }

  // Use Promise.all to update all items because of complex upsert/group logic
  await Promise.all(gameIds.map(async (gameId) => {
    const item = await prisma.collectionItem.upsert({
      where: {
        userId_gameId: { userId: session.user.id, gameId }
      },
      update: itemData,
      create: {
        userId: session.user.id,
        gameId,
        ownershipStatus: itemData.ownershipStatus || DEFAULT_OWNERSHIP_STATUS,
        visibility: 'private',
        ...itemData
      }
    });

    if (groupId !== undefined) {
      if (groupId === '') {
        await prisma.collectionGroupItem.deleteMany({
          where: { itemId: item.id }
        });
      } else {
        const group = await prisma.collectionGroup.findFirst({
          where: { id: groupId, userId: session.user.id }
        });

        if (group) {
          await prisma.collectionGroupItem.deleteMany({
            where: { itemId: item.id }
          });
          await prisma.collectionGroupItem.create({
            data: {
              groupId: group.id,
              itemId: item.id
            }
          });
        }
      }
    }
  }));

  revalidatePath('/collection');
  revalidatePath('/community');
}

export async function reorderCollectionItems(gameIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Not logged in');
  if (!Array.isArray(gameIds) || gameIds.some(id => typeof id !== 'string' || !id) ||
      new Set(gameIds).size !== gameIds.length) {
    throw new Error('Invalid collection order');
  }

  // Each update is scoped to the signed-in owner. A missing item rolls back the order.
  await prisma.$transaction(gameIds.map((gameId, sortOrder) =>
    prisma.collectionItem.update({
      where: { userId_gameId: { userId: session.user.id, gameId } },
      data: { sortOrder },
    })
  ));
  revalidatePath('/collection');
  revalidatePath('/community');
}

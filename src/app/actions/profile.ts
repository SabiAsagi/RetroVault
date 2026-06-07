"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateProfile(data: { nickname?: string; bio?: string; image?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Not logged in");

  // Check if nickname is taken by someone else
  if (data.nickname) {
    const existing = await prisma.user.findFirst({
      where: {
        nickname: data.nickname,
        id: { not: session.user.id }
      }
    });
    if (existing) {
      throw new Error("Nickname is already taken");
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nickname: data.nickname,
      bio: data.bio,
      image: data.image,
    }
  });
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      bio: true,
      image: true,
      role: true,
      createdAt: true,
      profileLikes: true,
      profileViews: true,
    }
  });

  if (!user) return null;

  const publicCollection = await prisma.collectionItem.findMany({
    where: { 
      userId, 
      visibility: { not: 'private' } // public and friends
    },
    orderBy: { sortOrder: 'asc' }
  });

  const publicGroups = await prisma.collectionGroup.findMany({
    where: { userId, isPublic: true },
    orderBy: { likes: 'desc' },
    include: { items: true }
  });

  return { user, collection: publicCollection, collectionGroups: publicGroups };
}

export async function getUserProfileByNickname(nickname: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { nickname: nickname },
        { name: nickname }, // Fallback to name if missing nickname
        { id: nickname } // Fallback for 'me' or legacy id links
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      bio: true,
      image: true,
      role: true,
      createdAt: true,
      profileLikes: true,
      profileViews: true,
    }
  });

  if (!user) return null;

  const publicCollection = await prisma.collectionItem.findMany({
    where: { 
      userId: user.id, 
      visibility: { not: 'private' } // public and friends
    },
    orderBy: { sortOrder: 'asc' }
  });

  const publicGroups = await prisma.collectionGroup.findMany({
    where: { userId: user.id, isPublic: true },
    orderBy: { likes: 'desc' },
    include: { items: true }
  });

  return { user, collection: publicCollection, collectionGroups: publicGroups };
}

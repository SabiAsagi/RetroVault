"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getFriends() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { friends: [], requests: [] };

  const userId = (session.user as any).id;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: userId },
        { friendId: userId }
      ]
    },
    include: {
      user: { select: { id: true, nickname: true, image: true } },
      friend: { select: { id: true, nickname: true, image: true } }
    }
  });

  const friends = friendships.filter(f => f.status === 'ACCEPTED').map(f => {
    return f.userId === userId ? f.friend : f.user;
  });

  const requests = friendships.filter(f => f.status === 'PENDING' && f.friendId === userId);

  return { friends, requests };
}

export async function sendFriendRequest(targetUserId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const userId = (session.user as any).id;
  
  if (userId === targetUserId) throw new Error("자신에게 친구 요청을 보낼 수 없습니다.");

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: userId, friendId: targetUserId },
        { userId: targetUserId, friendId: userId }
      ]
    }
  });

  if (existing) {
    throw new Error("이미 친구이거나 요청이 진행 중입니다.");
  }

  await prisma.friendship.create({
    data: {
      userId: userId,
      friendId: targetUserId,
      status: 'PENDING'
    }
  });
  
  revalidatePath('/friends');
  return { success: true };
}

export async function acceptFriendRequest(friendshipId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const userId = (session.user as any).id;

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || friendship.friendId !== userId) throw new Error("Unauthorized");

  await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: 'ACCEPTED' }
  });

  revalidatePath('/friends');
  return { success: true };
}

export async function rejectFriendRequest(friendshipId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const userId = (session.user as any).id;

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship || (friendship.friendId !== userId && friendship.userId !== userId)) throw new Error("Unauthorized");

  await prisma.friendship.delete({
    where: { id: friendshipId }
  });

  revalidatePath('/friends');
  return { success: true };
}

export async function removeFriend(targetUserId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  
  const userId = (session.user as any).id;

  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userId: userId, friendId: targetUserId },
        { userId: targetUserId, friendId: userId }
      ]
    }
  });

  revalidatePath('/friends');
  return { success: true };
}

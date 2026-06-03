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

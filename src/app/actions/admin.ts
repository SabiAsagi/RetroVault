"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { logAdminAction } from "./admin-dashboard";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MODERATOR") {
    throw new Error("Unauthorized");
  }
  return (session.user as any).id as string;
}

export async function createGame(data: any) {
  const adminId = await requireAdmin();
  // Find or create platform
  let platform = await prisma.platform.findFirst({ where: { name: data.platform } });
  if (!platform) {
    platform = await prisma.platform.create({
      data: {
        name: data.platform,
        manufacturer: "Unknown",
        releaseYear: data.releaseYear,
      }
    });
  }

  let developerId = undefined;
  if (data.developer) {
    let company = await prisma.company.findFirst({ where: { name: data.developer } });
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: data.developer,
          foundedYear: data.releaseYear || 1990,
          country: data.country || "Unknown",
        }
      });
    }
    developerId = company.id;
  }

  const created = await prisma.game.create({
    data: {
      title: data.title,
      platformId: platform.id,
      developerId: developerId,
      releaseYear: data.releaseYear,
      genre: data.genre || "Unknown",
      country: data.country || "",
      coverImageUrl: data.imageUrl || "",
      description: data.description || "",
      historicalContext: data.historicalContext || "",
      popularity: data.popularity || 50,
      rating: data.rating || 0,
    }
  });

  await logAdminAction(adminId, "CREATE", "GAME", created.id, undefined, JSON.stringify(created));

  revalidatePath('/games');
  return created;
}

export async function updateGame(id: string, data: any) {
  const adminId = await requireAdmin();
  
  // If platform changed, ensure platform exists
  let platformId = undefined;
  if (data.platform) {
    let platform = await prisma.platform.findFirst({ where: { name: data.platform } });
    if (!platform) {
      platform = await prisma.platform.create({
        data: {
          name: data.platform,
          manufacturer: "Unknown",
          releaseYear: data.releaseYear || 2000,
        }
      });
    }
    platformId = platform.id;
  }

  let developerId = undefined;
  if (data.developer) {
    let company = await prisma.company.findFirst({ where: { name: data.developer } });
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: data.developer,
          foundedYear: data.releaseYear || 1990,
          country: data.country || "Unknown",
        }
      });
    }
    developerId = company.id;
  }

  const updateData: any = {
    title: data.title,
    releaseYear: data.releaseYear,
    genre: data.genre,
    country: data.country,
    coverImageUrl: data.imageUrl,
    description: data.description,
    historicalContext: data.historicalContext,
    popularity: data.popularity,
    rating: data.rating,
  };

  if (platformId) {
    updateData.platformId = platformId;
  }
  if (developerId) {
    updateData.developerId = developerId;
  }

  const updated = await prisma.game.update({
    where: { id },
    data: updateData
  });

  await logAdminAction(adminId, "UPDATE", "GAME", updated.id, undefined, JSON.stringify(updateData));

  revalidatePath('/games');
  return updated;
}

export async function deleteGame(id: string) {
  const adminId = await requireAdmin();
  await prisma.game.delete({ where: { id } });
  await logAdminAction(adminId, "DELETE", "GAME", id);
  revalidatePath('/games');
}

export async function createTimelineEvent(data: any) {
  const adminId = await requireAdmin();
  const created = await prisma.timelineEvent.create({
    data: {
      year: data.year,
      title: data.title,
      type: data.type || "event",
      description: data.description || "",
      imageUrl: data.imageUrl || null,
      innovation: data.innovation || null,
      era: data.era || "",
      country: data.country || null,
      isVisible: data.isVisible ?? true,
      sortOrder: data.sortOrder || 0,
      relatedGameId: data.relatedGameId || null,
      relatedPlatformId: data.relatedPlatformId || null,
    }
  });
  await logAdminAction(adminId, "CREATE", "TIMELINE", created.id, undefined, JSON.stringify(created));
  revalidatePath('/timeline');
  return created;
}

export async function updateTimelineEvent(id: string, data: any) {
  const adminId = await requireAdmin();
  const updated = await prisma.timelineEvent.update({
    where: { id },
    data: {
      year: data.year,
      title: data.title,
      type: data.type,
      description: data.description,
      imageUrl: data.imageUrl,
      innovation: data.innovation,
      era: data.era,
      country: data.country,
      isVisible: data.isVisible,
      sortOrder: data.sortOrder,
      relatedGameId: data.relatedGameId || null,
      relatedPlatformId: data.relatedPlatformId || null,
    }
  });
  await logAdminAction(adminId, "UPDATE", "TIMELINE", updated.id, undefined, JSON.stringify(data));
  revalidatePath('/timeline');
  return updated;
}

export async function deleteTimelineEvent(id: string) {
  const adminId = await requireAdmin();
  await prisma.timelineEvent.delete({ where: { id } });
  await logAdminAction(adminId, "DELETE", "TIMELINE", id);
  revalidatePath('/timeline');
}

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

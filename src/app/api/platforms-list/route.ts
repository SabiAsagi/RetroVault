import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlatformSlug } from "@/lib/slug";

export async function GET() {
  const platforms = await prisma.platform.findMany({
    orderBy: { releaseYear: 'asc' },
    include: { _count: { select: { games: true } } }
  });

  const result = platforms.map(p => ({
    ...p,
    slug: getPlatformSlug(p)
  }));

  return NextResponse.json(result);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlatformSlug } from "@/lib/slug";

export async function GET() {
  const platforms = await prisma.platform.findMany({
    orderBy: { releaseYear: 'asc' },
    select: {
      id: true,
      name: true,
      manufacturer: true,
      generation: true,
      releaseYear: true,
      type: true,
      imageUrl: true,
      launchPrice: true,
      totalSales: true,
      discontinued: true,
      views: true,
      _count: { select: { games: true } }
    }
  });

  const result = platforms.map(p => ({
    ...p,
    slug: getPlatformSlug(p as any)
  }));

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    }
  });
}

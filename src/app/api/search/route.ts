import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type'); // 'game' | 'platform' | 'company'

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    let games: any[] = [];
    let platforms: any[] = [];
    let companies: any[] = [];

    if (type === 'game' || !type) {
      games = await prisma.game.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        select: { id: true, title: true, releaseYear: true, platform: { select: { name: true } }, coverImageUrl: true },
        take: type ? 10 : 4
      });
    }
    
    if (type === 'platform' || !type) {
      platforms = await prisma.platform.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, manufacturer: true },
        take: type ? 10 : 3
      });
    }
    
    if (type === 'company' || !type) {
      companies = await prisma.company.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, type: true },
        take: type ? 10 : 3
      });
    }

    return NextResponse.json({ games, platforms, companies });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}

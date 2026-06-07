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
    let results: any[] = [];

    if (type === 'game') {
      const games = await prisma.game.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        select: { id: true, title: true, releaseYear: true, platform: { select: { name: true } } },
        take: 10
      });
      results = games.map(g => ({
        id: g.id,
        name: `${g.title} (${g.platform.name})`,
        data: g
      }));
    } else if (type === 'platform') {
      const platforms = await prisma.platform.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, manufacturer: true },
        take: 10
      });
      results = platforms.map(p => ({
        id: p.id,
        name: p.name,
        data: p
      }));
    } else if (type === 'company') {
      const companies = await prisma.company.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, type: true },
        take: 10
      });
      results = companies.map(c => ({
        id: c.id,
        name: c.name,
        data: c
      }));
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}

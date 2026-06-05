import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ games: [], companies: [], users: [], groups: [] });
  }

  try {
    const games = await prisma.game.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { genre: { contains: q, mode: 'insensitive' } },
        ]
      },
      include: { platform: true },
      take: 5
    });

    const companies = await prisma.company.findMany({
      where: { name: { contains: q, mode: 'insensitive' } },
      take: 3
    });

    const users = await prisma.user.findMany({
      where: { nickname: { contains: q, mode: 'insensitive' } },
      take: 3
    });

    const groups = await prisma.collectionGroup.findMany({
      where: { 
        isPublic: true,
        name: { contains: q, mode: 'insensitive' } 
      },
      include: { user: true },
      take: 3
    });

    return NextResponse.json({ games, companies, users, groups });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

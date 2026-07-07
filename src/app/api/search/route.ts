import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type SearchType = 'game' | 'platform' | 'company' | 'user' | 'collection';

const emptyResults = {
  games: [],
  platforms: [],
  companies: [],
  users: [],
  groups: [],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const type = searchParams.get('type') as SearchType | null;
  const scopedLimit = type ? 10 : undefined;

  if (q.length < 2) {
    return NextResponse.json(emptyResults);
  }

  try {
    const [games, platforms, companies, users, groups] = await Promise.all([
      type === 'game' || !type
        ? prisma.game.findMany({
            where: {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { originalTitle: { contains: q, mode: 'insensitive' } },
                { genre: { contains: q, mode: 'insensitive' } },
                { platform: { name: { contains: q, mode: 'insensitive' } } },
                { developer: { name: { contains: q, mode: 'insensitive' } } },
                { publisher: { name: { contains: q, mode: 'insensitive' } } },
              ],
            },
            select: {
              id: true,
              title: true,
              releaseYear: true,
              platform: { select: { name: true } },
              coverImageUrl: true,
            },
            take: scopedLimit || 4,
          })
        : Promise.resolve([]),

      type === 'platform' || !type
        ? prisma.platform.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { name_ko: { contains: q, mode: 'insensitive' } },
                { manufacturer: { contains: q, mode: 'insensitive' } },
                { manufacturer_ko: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              name: true,
              releaseYear: true,
              manufacturer: true,
            },
            take: scopedLimit || 3,
          })
        : Promise.resolve([]),

      type === 'company' || !type
        ? prisma.company.findMany({
            where: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { name_ko: { contains: q, mode: 'insensitive' } },
                { country: { contains: q, mode: 'insensitive' } },
                { country_ko: { contains: q, mode: 'insensitive' } },
                { flagshipFranchises: { contains: q, mode: 'insensitive' } },
                { flagshipFranchises_ko: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              name: true,
              foundedAt: true,
              type: true,
              logoUrl: true,
            },
            take: scopedLimit || 3,
          })
        : Promise.resolve([]),

      type === 'user' || !type
        ? prisma.user.findMany({
            where: {
              isBanned: false,
              OR: [
                { nickname: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } },
              ],
            },
            select: {
              id: true,
              nickname: true,
              name: true,
              image: true,
            },
            take: scopedLimit || 3,
          })
        : Promise.resolve([]),

      type === 'collection' || !type
        ? prisma.collectionGroup.findMany({
            where: {
              isPublic: true,
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { user: { nickname: { contains: q, mode: 'insensitive' } } },
                { user: { name: { contains: q, mode: 'insensitive' } } },
              ],
            },
            select: {
              id: true,
              name: true,
              userId: true,
              user: { select: { id: true, nickname: true, name: true, image: true } },
            },
            take: scopedLimit || 3,
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({ games, platforms, companies, users, groups });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const groups = await prisma.collectionGroup.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            item: {
              include: {
                game: {
                  include: { platform: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Failed to fetch collection groups:', error);
    return NextResponse.json({ error: 'Failed to fetch collection groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, isPublic } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const group = await prisma.collectionGroup.create({
      data: {
        userId: session.user.id,
        name,
        description,
        isPublic: isPublic ?? true,
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Failed to create collection group:', error);
    return NextResponse.json({ error: 'Failed to create collection group' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { friendId: session.user.id }
      ]
    },
    include: {
      user: { select: { id: true, nickname: true, name: true, image: true } },
      friend: { select: { id: true, nickname: true, name: true, image: true } }
    }
  });

  return NextResponse.json(friendships);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { friendId } = await request.json();
  if (session.user.id === friendId) return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: session.user.id, friendId: friendId },
        { userId: friendId, friendId: session.user.id }
      ]
    }
  });

  if (existing) {
    return NextResponse.json({ error: 'Friendship already exists' }, { status: 400 });
  }

  const friendship = await prisma.friendship.create({
    data: {
      userId: session.user.id,
      friendId,
      status: 'PENDING'
    }
  });

  return NextResponse.json(friendship);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await request.json(); // status: ACCEPTED or REJECTED(delete)

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (friendship.friendId !== session.user.id) {
    return NextResponse.json({ error: 'Only the receiver can accept/reject' }, { status: 403 });
  }

  if (status === 'ACCEPTED') {
    const updated = await prisma.friendship.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });
    return NextResponse.json(updated);
  } else if (status === 'REJECTED') {
    await prisma.friendship.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
}

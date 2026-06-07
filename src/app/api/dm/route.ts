import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'received'; // 'received' | 'sent'

  try {
    const messages = await prisma.directMessage.findMany({
      where: type === 'received' 
        ? { receiverId: session.user.id }
        : { senderId: session.user.id },
      include: {
        sender: { select: { id: true, nickname: true, image: true } },
        receiver: { select: { id: true, nickname: true, image: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dm = await prisma.directMessage.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      }
    });

    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_DM',
        message: `${(session.user as any).nickname || session.user.name || '알 수 없는 유저'}님이 새로운 쪽지를 보냈습니다.`,
        link: '/profile' // Or wherever the DM UI is
      }
    });

    return NextResponse.json(dm);
  } catch (error) {
    console.error('DM Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

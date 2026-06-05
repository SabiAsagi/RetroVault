import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    return NextResponse.json(dm);
  } catch (error) {
    console.error('DM Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

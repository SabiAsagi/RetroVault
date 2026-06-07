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
    const { targetType, targetId, proposedData, reason } = await request.json();

    if (!targetType || !targetId || !proposedData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const editRequest = await prisma.editRequest.create({
      data: {
        targetType, // 'GAME' | 'PLATFORM' | 'COMPANY'
        targetId,
        proposedData: JSON.stringify(proposedData),
        reason,
        status: 'PENDING',
        requestedById: session.user.id
      }
    });

    return NextResponse.json(editRequest);
  } catch (error) {
    console.error('Edit Request Error:', error);
    return NextResponse.json({ error: 'Failed to submit edit request' }, { status: 500 });
  }
}

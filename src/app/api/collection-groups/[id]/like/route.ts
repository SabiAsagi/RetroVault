import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    // Increment likes
    const updatedGroup = await prisma.collectionGroup.update({
      where: { id },
      data: {
        likes: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, likes: updatedGroup.likes });
  } catch (error) {
    console.error('Error incrementing likes:', error);
    return NextResponse.json({ error: 'Failed to increment likes' }, { status: 500 });
  }
}

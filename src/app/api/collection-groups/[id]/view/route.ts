import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Increment views
    const updatedGroup = await prisma.collectionGroup.update({
      where: { id },
      data: {
        views: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, views: updatedGroup.views });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
  }
}

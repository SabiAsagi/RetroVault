import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = context.params;

  try {
    const group = await prisma.collectionGroup.findUnique({
      where: { id }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    // Verify item belongs to user
    const item = await prisma.collectionItem.findUnique({
      where: { id: itemId }
    });

    if (!item || item.userId !== session.user.id) {
      return NextResponse.json({ error: 'Item not found or forbidden' }, { status: 403 });
    }

    const groupItem = await prisma.collectionGroupItem.create({
      data: {
        groupId: id,
        itemId
      }
    });

    return NextResponse.json(groupItem);
  } catch (error) {
    console.error('Failed to add item to collection group:', error);
    return NextResponse.json({ error: 'Failed to add item to collection group' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = context.params;
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');

  if (!itemId) {
    return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
  }

  try {
    const group = await prisma.collectionGroup.findUnique({
      where: { id }
    });

    if (!group || group.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.collectionGroupItem.delete({
      where: {
        groupId_itemId: {
          groupId: id,
          itemId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove item from collection group:', error);
    return NextResponse.json({ error: 'Failed to remove item from collection group' }, { status: 500 });
  }
}

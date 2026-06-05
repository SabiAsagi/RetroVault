import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: Request, context: { params: { id: string } }) {
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
    const { name, description, isPublic } = body;

    const updatedGroup = await prisma.collectionGroup.update({
      where: { id },
      data: {
        name: name ?? group.name,
        description: description ?? group.description,
        isPublic: isPublic ?? group.isPublic,
      }
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Failed to update collection group:', error);
    return NextResponse.json({ error: 'Failed to update collection group' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
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

    await prisma.collectionGroup.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete collection group:', error);
    return NextResponse.json({ error: 'Failed to delete collection group' }, { status: 500 });
  }
}

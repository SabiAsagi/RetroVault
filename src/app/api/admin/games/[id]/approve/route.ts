import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MODERATOR") {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const game = await prisma.game.update({
      where: { id },
      data: { status: 'APPROVED' }
    });

    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: "UPDATE",
        targetType: "GAME",
        targetId: id,
        afterJson: JSON.stringify({ status: 'APPROVED' })
      }
    });

    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to approve game' }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findFirst({
      where: { OR: [{ id }, { nickname: id }] }
    });
    
    if (!user) return new NextResponse("Not Found", { status: 404 });

    await prisma.user.update({
      where: { id: user.id },
      data: { profileViews: { increment: 1 } }
    });

    return NextResponse.json({ success: true, views: user.profileViews + 1 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

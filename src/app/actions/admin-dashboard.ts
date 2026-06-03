"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MODERATOR") {
    throw new Error("Unauthorized");
  }
  return (session.user as any).id as string;
}

export async function getAdminDashboardStats() {
  await requireAdmin();
  const [gameCount, collectionCount, userCount, pendingReports] = await Promise.all([
    prisma.game.count(),
    prisma.collectionItem.count(),
    prisma.user.count(),
    prisma.report.count({ where: { status: "PENDING" } })
  ]);
  
  return {
    gameCount,
    collectionCount,
    userCount,
    pendingReports
  };
}

export async function getUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      role: true,
      createdAt: true
    }
  });
}

export async function getReports() {
  await requireAdmin();
  return prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      reporter: {
        select: { name: true, nickname: true, email: true }
      }
    }
  });
}

export async function resolveReport(reportId: string, status: "APPROVED" | "REJECTED", adminMemo: string) {
  const adminId = await requireAdmin();
  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      adminMemo,
      resolvedAt: new Date()
    }
  });

  // Log the action
  await prisma.adminLog.create({
    data: {
      adminId,
      action: "UPDATE",
      targetType: "REPORT",
      targetId: reportId,
      afterJson: JSON.stringify({ status, adminMemo })
    }
  });

  revalidatePath('/admin');
  return report;
}

export async function getAdminLogs() {
  await requireAdmin();
  return prisma.adminLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit to 100 recent logs
    include: {
      admin: {
        select: { name: true, nickname: true, email: true }
      }
    }
  });
}

export async function logAdminAction(adminId: string, action: string, targetType: string, targetId: string, beforeJson?: string, afterJson?: string) {
  try {
    if (!adminId) return;
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        beforeJson,
        afterJson
      }
    });
  } catch (e) {
    console.error("Failed to log admin action", e);
  }
}

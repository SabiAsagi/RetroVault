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

export async function getCompanies() {
  await requireAdmin();
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { developedGames: true, publishedGames: true }
      }
    }
  });

  return companies.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    country: c.country,
    gamesCount: c._count.developedGames + c._count.publishedGames,
    hq: c.country || 'Unknown'
  }));
}

export async function getGameRequests() {
  await requireAdmin();
  return prisma.game.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: 'desc' },
    include: {
      requestedBy: {
        select: { name: true, nickname: true, email: true }
      },
      platform: {
        select: { name: true }
      }
    }
  });
}

export async function getPlatformRequests() {
  await requireAdmin();
  return prisma.platform.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: 'desc' },
    include: {
      requestedBy: {
        select: { name: true, nickname: true, email: true }
      }
    }
  });
}

export async function getCompanyRequests() {
  await requireAdmin();
  return prisma.company.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: 'desc' },
    include: {
      requestedBy: {
        select: { name: true, nickname: true, email: true }
      }
    }
  });
}

export async function getPlatforms() {
  await requireAdmin();
  return prisma.platform.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { games: true }
      }
    }
  });
}

export async function getEditRequests() {
  await requireAdmin();
  return prisma.editRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: 'desc' },
    include: {
      requestedBy: {
        select: { name: true, nickname: true, email: true }
      }
    }
  });
}

export async function resolveEditRequest(requestId: string, status: "APPROVED" | "REJECTED", adminMemo: string) {
  const adminId = await requireAdmin();
  const request = await prisma.editRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error("Request not found");

  if (status === "APPROVED") {
    const data = JSON.parse(request.proposedData);
    if (request.targetType === "GAME") {
      await prisma.game.update({ where: { id: request.targetId }, data });
    } else if (request.targetType === "PLATFORM") {
      await prisma.platform.update({ where: { id: request.targetId }, data });
    } else if (request.targetType === "COMPANY") {
      await prisma.company.update({ where: { id: request.targetId }, data });
    }
  }

  const updatedRequest = await prisma.editRequest.update({
    where: { id: requestId },
    data: { status, adminMemo }
  });

  await prisma.adminLog.create({
    data: {
      adminId,
      action: "UPDATE",
      targetType: "EDIT_REQUEST",
      targetId: requestId,
      afterJson: JSON.stringify({ status, adminMemo })
    }
  });

  revalidatePath('/admin');
  return updatedRequest;
}


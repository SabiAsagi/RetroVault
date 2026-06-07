"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { logAdminAction } from "./admin-dashboard";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
    throw new Error("Unauthorized");
  }
  return (session.user as any).id as string;
}

// ── COMPANY ACTIONS ──
export async function createCompany(data: any) {
  const adminId = await requireAdmin();
  const created = await prisma.company.create({
    data: {
      name: data.name,
      type: data.type || "DEVELOPER",
      country: data.country || "",
      logoUrl: data.logoUrl || null,
      description: data.description || "",
      foundedAt: data.foundedAt || null,
      websiteUrl: data.websiteUrl || null,
    }
  });
  await logAdminAction(adminId, "CREATE", "COMPANY", created.id, undefined, JSON.stringify(created));
  revalidatePath('/admin');
  return created;
}

export async function updateCompany(id: string, data: any) {
  const adminId = await requireAdmin();
  const updated = await prisma.company.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      country: data.country,
      logoUrl: data.logoUrl,
      description: data.description,
      foundedAt: data.foundedAt,
      websiteUrl: data.websiteUrl,
    }
  });
  await logAdminAction(adminId, "UPDATE", "COMPANY", updated.id, undefined, JSON.stringify(data));
  revalidatePath('/admin');
  return updated;
}

export async function deleteCompany(id: string) {
  const adminId = await requireAdmin();
  await prisma.company.delete({ where: { id } });
  await logAdminAction(adminId, "DELETE", "COMPANY", id);
  revalidatePath('/admin');
}

// ── PLATFORM ACTIONS ──
export async function createPlatform(data: any) {
  const adminId = await requireAdmin();
  const created = await prisma.platform.create({
    data: {
      name: data.name,
      manufacturer: data.manufacturer || "",
      generation: Number(data.generation) || 1,
      releaseYear: Number(data.releaseYear) || 0,
      type: data.type || "HOME",
      description: data.description || "",
      imageUrl: data.imageUrl || null,
      country: data.country || null,
      specs: data.specs || null,
      additionalInput: data.additionalInput || null,
      gamesCount: data.gamesCount || null,
      launchPrice: data.launchPrice || null,
      totalSales: data.totalSales || null,
      discontinued: data.discontinued === true,
      status: "APPROVED"
    }
  });
  await logAdminAction(adminId, "CREATE", "PLATFORM", created.id, undefined, JSON.stringify(created));
  revalidatePath('/admin');
  return created;
}

export async function updatePlatform(id: string, data: any) {
  const adminId = await requireAdmin();
  const updated = await prisma.platform.update({
    where: { id },
    data: {
      name: data.name,
      manufacturer: data.manufacturer || "",
      generation: Number(data.generation) || 1,
      releaseYear: Number(data.releaseYear) || 0,
      type: data.type || "HOME",
      description: data.description || "",
      imageUrl: data.imageUrl || null,
      country: data.country || null,
      specs: data.specs || null,
      additionalInput: data.additionalInput || null,
      gamesCount: data.gamesCount || null,
      launchPrice: data.launchPrice || null,
      totalSales: data.totalSales || null,
      discontinued: data.discontinued === true,
    }
  });
  await logAdminAction(adminId, "UPDATE", "PLATFORM", updated.id, undefined, JSON.stringify(data));
  revalidatePath('/admin');
  return updated;
}

export async function deletePlatform(id: string) {
  const adminId = await requireAdmin();
  await prisma.platform.delete({ where: { id } });
  await logAdminAction(adminId, "DELETE", "PLATFORM", id);
  revalidatePath('/admin');
}


// ── USER ACTIONS ──
export async function updateUserProfileFromAdmin(userId: string, data: any) {
  const adminId = await requireAdmin();
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Only ADMIN can edit users.");
  }

  const updateData: any = {
    nickname: data.nickname,
    email: data.email,
  };
  
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  
  await logAdminAction(adminId, "UPDATE", "USER_PROFILE", userId);
  revalidatePath('/admin');
  return updated;
}
export async function updateUserRole(userId: string, role: string) {
  const adminId = await requireAdmin();
  // Only ADMIN can change roles to ADMIN or MANAGER
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Only ADMIN can change user roles.");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  await logAdminAction(adminId, "UPDATE", "USER_ROLE", userId, undefined, JSON.stringify({ role }));
  revalidatePath('/admin');
  return updated;
}

export async function toggleUserBan(userId: string, isBanned: boolean) {
  const adminId = await requireAdmin();
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isBanned }
  });
  await logAdminAction(adminId, "UPDATE", "USER_BAN", userId, undefined, JSON.stringify({ isBanned }));
  revalidatePath('/admin');
  return updated;
}

export async function deleteUser(userId: string) {
  const adminId = await requireAdmin();
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Only ADMIN can delete users.");
  }
  await prisma.user.delete({ where: { id: userId } });
  await logAdminAction(adminId, "DELETE", "USER", userId);
  revalidatePath('/admin');
}

// ── GAME REQUEST ACTIONS ──
export async function approveGameRequest(gameId: string) {
  const adminId = await requireAdmin();
  const updated = await prisma.game.update({
    where: { id: gameId },
    data: { status: 'APPROVED' }
  });
  await logAdminAction(adminId, "UPDATE", "GAME_APPROVE", gameId);
  revalidatePath('/admin');
  return updated;
}

export async function rejectGameRequest(gameId: string, reason?: string) {
  const adminId = await requireAdmin();
  const updated = await prisma.game.update({ 
    where: { id: gameId },
    data: { status: 'REJECTED', rejectReason: reason || "관리자에 의해 반려되었습니다." }
  });
  await logAdminAction(adminId, "UPDATE", "GAME_REJECT", gameId);
  revalidatePath('/admin');
  return updated;
}

export async function approvePlatformRequest(platformId: string) {
  const adminId = await requireAdmin();
  const updated = await prisma.platform.update({
    where: { id: platformId },
    data: { status: 'APPROVED' }
  });
  await logAdminAction(adminId, "UPDATE", "PLATFORM_APPROVE", platformId);
  revalidatePath('/admin');
  return updated;
}

export async function rejectPlatformRequest(platformId: string, reason?: string) {
  const adminId = await requireAdmin();
  const updated = await prisma.platform.update({ 
    where: { id: platformId },
    data: { status: 'REJECTED', rejectReason: reason || "관리자에 의해 반려되었습니다." }
  });
  await logAdminAction(adminId, "UPDATE", "PLATFORM_REJECT", platformId);
  revalidatePath('/admin');
  return updated;
}

export async function approveCompanyRequest(companyId: string) {
  const adminId = await requireAdmin();
  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { status: 'APPROVED' }
  });
  await logAdminAction(adminId, "UPDATE", "COMPANY_APPROVE", companyId);
  revalidatePath('/admin');
  return updated;
}

export async function rejectCompanyRequest(companyId: string, reason?: string) {
  const adminId = await requireAdmin();
  const updated = await prisma.company.update({ 
    where: { id: companyId },
    data: { status: 'REJECTED', rejectReason: reason || "관리자에 의해 반려되었습니다." }
  });
  await logAdminAction(adminId, "UPDATE", "COMPANY_REJECT", companyId);
  revalidatePath('/admin');
  return updated;
}

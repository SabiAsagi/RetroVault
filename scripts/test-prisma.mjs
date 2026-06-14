import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing getUsers...");
    await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    
    console.log("Testing getReports...");
    await prisma.report.findMany({ include: { reporter: true } });

    console.log("Testing getAdminLogs...");
    await prisma.adminLog.findMany({ include: { admin: true } });

    console.log("Testing getCompanies...");
    await prisma.company.findMany({ include: { _count: { select: { developedGames: true, publishedGames: true } } } });

    console.log("Testing getGameRequests...");
    await prisma.game.findMany({ where: { status: "PENDING" }, include: { requestedBy: true, platform: true } });

    console.log("Testing getPlatformRequests...");
    await prisma.platform.findMany({ where: { status: "PENDING" }, include: { requestedBy: true } });

    console.log("Testing getCompanyRequests...");
    await prisma.company.findMany({ where: { status: "PENDING" }, include: { requestedBy: true } });

    console.log("Testing getPlatforms...");
    await prisma.platform.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { games: true } } } });

    console.log("Testing getEditRequests...");
    await prisma.editRequest.findMany({ where: { status: "PENDING" }, include: { requestedBy: true } });

    console.log("All queries executed successfully!");
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

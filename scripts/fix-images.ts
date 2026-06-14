import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing image URLs for platforms and companies...');

  let platformCount = 0;
  const platforms = await prisma.platform.findMany({
    where: { imageUrl: { contains: 't_cover_big' } }
  });

  for (const p of platforms) {
    if (p.imageUrl) {
      await prisma.platform.update({
        where: { id: p.id },
        data: { imageUrl: p.imageUrl.replace('t_cover_big', 't_720p') }
      });
      platformCount++;
    }
  }

  let companyCount = 0;
  const companies = await prisma.company.findMany({
    where: { logoUrl: { contains: 't_cover_big' } }
  });

  for (const c of companies) {
    if (c.logoUrl) {
      await prisma.company.update({
        where: { id: c.id },
        data: { logoUrl: c.logoUrl.replace('t_cover_big', 't_720p') }
      });
      companyCount++;
    }
  }

  console.log(`Updated images for ${platformCount} platforms and ${companyCount} companies.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

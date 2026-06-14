import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running bulk update for images...');
  
  await prisma.$executeRawUnsafe(`UPDATE "Platform" SET "imageUrl" = REPLACE("imageUrl", 't_cover_big', 't_720p') WHERE "imageUrl" LIKE '%t_cover_big%';`);
  await prisma.$executeRawUnsafe(`UPDATE "Company" SET "logoUrl" = REPLACE("logoUrl", 't_cover_big', 't_720p') WHERE "logoUrl" LIKE '%t_cover_big%';`);
  
  console.log('Bulk update done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

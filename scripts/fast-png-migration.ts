import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fast PNG Migration starting...');
  
  // Update Platforms
  await prisma.$executeRawUnsafe(`
    UPDATE "Platform"
    SET "imageUrl" = REPLACE(REPLACE(REPLACE("imageUrl", 't_thumb', 't_720p'), 't_cover_big', 't_720p'), '.jpg', '.png')
    WHERE "imageUrl" LIKE '%igdb.com%';
  `);

  // Update Companies
  await prisma.$executeRawUnsafe(`
    UPDATE "Company"
    SET "logoUrl" = REPLACE(REPLACE(REPLACE("logoUrl", 't_thumb', 't_720p'), 't_cover_big', 't_720p'), '.jpg', '.png')
    WHERE "logoUrl" LIKE '%igdb.com%';
  `);

  console.log('Fast PNG Migration completed instantly.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

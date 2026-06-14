import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Reverting hardware images back to logos...');

  // Move logoUrl back to imageUrl, overwriting any hardware photos
  await prisma.$executeRawUnsafe(`UPDATE "Platform" SET "imageUrl" = "logoUrl" WHERE "logoUrl" IS NOT NULL;`);

  console.log('Successfully reverted imageUrl to logos.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

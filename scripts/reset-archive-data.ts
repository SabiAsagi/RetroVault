import * as dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function resetArchiveData() {
  if (!process.argv.includes('--yes')) {
    throw new Error(
      'Archive reset was not confirmed. Run `npm run sync:fresh` or `npm run sync:reset -- --yes`.',
    );
  }

  console.log('Removing current platform, company, and game archive data...');

  await prisma.$transaction(async (tx) => {
    await tx.collectionGroupItem.deleteMany();
    await tx.review.deleteMany();
    await tx.screenshot.deleteMany();
    await tx.collectionItem.deleteMany();

    await tx.timelineEvent.updateMany({
      data: {
        relatedGameId: null,
        relatedPlatformId: null,
      },
    });

    await tx.editRequest.deleteMany({
      where: {
        targetType: {
          in: ['GAME', 'PLATFORM', 'COMPANY', 'game', 'platform', 'company'],
        },
      },
    });

    await tx.report.deleteMany({
      where: {
        targetType: {
          in: ['GAME', 'PLATFORM', 'COMPANY', 'game', 'platform', 'company'],
        },
      },
    });

    await tx.game.deleteMany();
    await tx.platform.deleteMany();
    await tx.company.deleteMany();
  });

  console.log('Archive data reset completed.');
}

resetArchiveData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

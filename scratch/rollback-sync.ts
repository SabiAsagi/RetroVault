import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function rollback() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  
  // Find games created in the last 2 hours
  const gamesToRollback = await prisma.game.findMany({
    where: {
      createdAt: {
        gte: twoHoursAgo
      }
    }
  });

  console.log(`Found ${gamesToRollback.length} games to rollback.`);

  if (gamesToRollback.length > 0) {
    const result = await prisma.game.deleteMany({
      where: {
        id: {
          in: gamesToRollback.map(g => g.id)
        }
      }
    });
    console.log(`Rollback completed. Deleted ${result.count} games.`);
  }
}

rollback()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

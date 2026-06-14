import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGames() {
  const games = await prisma.game.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      platform: true,
      developer: true,
      publisher: true
    }
  });

  console.log(JSON.stringify(games.map(g => ({
    title: g.title,
    platform: g.platform?.name,
    developer: g.developer?.name,
    publisher: g.publisher?.name,
  })), null, 2));

  // Also check platforms image
  const platforms = await prisma.platform.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { name: true, imageUrl: true }
  });

  console.log('Platforms:', JSON.stringify(platforms, null, 2));
}

checkGames().finally(() => prisma.$disconnect());

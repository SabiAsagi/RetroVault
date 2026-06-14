import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing getGamesFromDB...");
    const games = await prisma.game.findMany({
      include: { platform: true, developer: true, publisher: true },
      orderBy: { releaseYear: 'asc' }
    });
    
    games.map(g => ({
      id: g.id,
      title: g.title,
      releaseYear: g.releaseYear,
      platform: g.platform.name,
      genre: g.genre,
      country: g.country || '',
      developer: g.developer?.name || '',
      publisher: g.publisher?.name || '',
      era: `${Math.floor(g.releaseYear / 10) * 10}s`,
      imageUrl: g.coverImageUrl || '',
      description: g.description || '',
      popularity: g.popularity,
      views: g.views,
      rating: g.rating || 0,
      rarity: 'Common',
      releaseStatus: g.releaseStatus,
      platformType: g.platform.type,
      platformDiscontinued: g.platform.discontinued || false
    }));
    console.log("getGamesFromDB works! Games count:", games.length);
  } catch (e) {
    console.error("Prisma error in getGamesFromDB:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dedupeGames() {
  console.log('Fetching all games...');
  const allGames = await prisma.game.findMany({
    include: {
      collectedBy: true,
      screenshots: true,
    }
  });

  const gameGroups = new Map<string, typeof allGames>();

  for (const game of allGames) {
    // Generate a unique key
    const key = `${game.title}|${game.platformId}|${game.releaseYear}`;
    if (!gameGroups.has(key)) {
      gameGroups.set(key, []);
    }
    gameGroups.get(key)!.push(game);
  }

  let deletedCount = 0;
  let updatedCollectionCount = 0;

  for (const [key, games] of gameGroups.entries()) {
    if (games.length > 1) {
      console.log(`Found duplicates for ${key} (${games.length} copies)`);
      
      // Keep the first one, delete the rest
      const keptGame = games[0];
      const duplicates = games.slice(1);

      for (const dup of duplicates) {
        // Move CollectionItems to keptGame
        if (dup.collectedBy.length > 0) {
          for (const collectionItem of dup.collectedBy) {
            try {
              // Try to update gameId. If user already has the keptGame in collection,
              // it will fail unique constraint (userId, gameId), so we just delete this redundant collection item.
              await prisma.collectionItem.update({
                where: { id: collectionItem.id },
                data: { gameId: keptGame.id }
              });
              updatedCollectionCount++;
            } catch (err) {
              console.log(`Failed to migrate collection item ${collectionItem.id}, maybe user already has the kept game. Deleting redundant collection item.`);
              await prisma.collectionItem.delete({
                where: { id: collectionItem.id }
              });
            }
          }
        }

        // Move Screenshots to keptGame
        if (dup.screenshots.length > 0) {
          await prisma.screenshot.updateMany({
            where: { gameId: dup.id },
            data: { gameId: keptGame.id }
          });
        }

        // Now delete the duplicate game
        await prisma.game.delete({
          where: { id: dup.id }
        });
        deletedCount++;
      }
    }
  }

  console.log(`Deduplication finished. Deleted ${deletedCount} duplicate games. Updated ${updatedCollectionCount} collection items.`);
}

dedupeGames()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

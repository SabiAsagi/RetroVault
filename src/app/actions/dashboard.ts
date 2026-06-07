"use server";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `-${month}-${day}`; // Matches YYYY-MM-DD

  let isRandom = false;

  let historyGame = await prisma.game.findFirst({
    where: { 
      releaseDate: { contains: dateStr } 
    }
  });

  if (!historyGame) {
    // Fallback to a random game if no release today
    const totalGames = await prisma.game.count();
    const skip = Math.max(0, Math.floor(Math.random() * totalGames));
    historyGame = await prisma.game.findFirst({
      skip,
      take: 1
    });
    isRandom = true;
  }

  // Get most popular collection groups (sorted by likes + views)
  const allGroups = await prisma.collectionGroup.findMany({
    where: { isPublic: true },
    include: {
      user: true,
      items: {
        take: 3,
        include: {
          item: {
            include: {
              game: {
                include: { platform: true }
              }
            }
          }
        }
      }
    }
  });

  const popularGroups = allGroups
    .sort((a, b) => (b.likes + b.views) - (a.likes + a.views))
    .slice(0, 12);

  const popularCollections = popularGroups.map(group => ({
    id: group.id,
    user: group.user.nickname || group.user.name || 'User',
    title: group.name,
    likes: group.likes,
    views: group.views,
    games: group.items.map(i => ({
      ...i.item.game,
      imageUrl: i.item.game.coverImageUrl || '',
      platform: (i.item.game as any).platform?.name || 'Unknown'
    }) as any)
  }));

  return { historyGame: { ...historyGame, isRandom }, popularCollections };
}

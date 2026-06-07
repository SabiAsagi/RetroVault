"use server";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `-${month}-${day}`; // Matches YYYY-MM-DD

  let historyGame = await prisma.game.findFirst({
    where: { 
      releaseDate: { contains: dateStr } 
    }
  });

  if (!historyGame) {
    historyGame = await prisma.game.findFirst({
      orderBy: { releaseYear: 'asc' }
    });
  }

  // Get most popular collection groups
  const popularGroups = await prisma.collectionGroup.findMany({
    where: { isPublic: true },
    orderBy: { likes: 'desc' },
    take: 3,
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

  return { historyGame, popularCollections };
}

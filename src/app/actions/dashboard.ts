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

  // Get users who have public collections but maybe no public group
  const usersWithPublicItems = await prisma.user.findMany({
    where: { collections: { some: { visibility: 'public' } } },
    include: {
      collections: {
        where: { visibility: 'public' },
        take: 3,
        include: { game: { include: { platform: true } } }
      }
    }
  });

  const popularCollections = [
    ...popularGroups.map(group => ({
      id: group.id, // Group ID!
      user: group.user.nickname || group.user.name || 'User',
      userImage: group.user.image || null,
      title: group.name,
      likes: group.likes,
      views: group.views,
      type: 'group', // mark as group
      games: group.items.map(i => ({
        ...i.item.game,
        imageUrl: i.item.game.coverImageUrl || '',
        platform: (i.item.game as any).platform?.name || 'Unknown'
      }) as any)
    })),
    ...usersWithPublicItems
      .map(u => ({
        id: u.nickname || u.name || u.id,
        user: u.nickname || u.name || 'User',
        userImage: u.image || null,
        title: `${u.nickname || u.name}님의 기본 컬렉션`,
        likes: (u as any).profileLikes || 0,
        views: (u as any).profileViews || 0,
        type: 'user', // mark as user profile collection
        games: u.collections.map(c => ({
          ...c.game,
          imageUrl: c.game.coverImageUrl || '',
          platform: (c.game as any).platform?.name || 'Unknown'
        }))
      }))
  ].slice(0, 12);

  return { historyGame: { ...historyGame, isRandom }, popularCollections };
}

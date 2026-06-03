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

  // Get users with the most collection items
  const popularUsers = await prisma.user.findMany({
    take: 3,
    orderBy: {
      collections: { _count: 'desc' }
    },
    include: {
      _count: { select: { collections: true } },
      collections: {
        take: 3,
        include: { 
          game: {
            include: { platform: true }
          }
        }
      }
    }
  });

  // Default fallback if no users have collections
  let popularCollections = popularUsers
    .filter(u => u._count.collections > 0)
    .map((user, idx) => {
      return {
        id: user.id,
        user: user.nickname || user.name || `User${idx + 1}`,
        title: `${user.nickname || user.name || `User${idx + 1}`}님의 베스트 컬렉션`,
        likes: user._count.collections * 15 + Math.floor(Math.random() * 50),
        views: user._count.collections * 45 + Math.floor(Math.random() * 100),
        games: user.collections?.map(c => ({
          ...c.game,
          imageUrl: c.game.coverImageUrl || '',
          platform: (c.game as any).platform?.name || 'Unknown'
        }) as any) || []
      };
    });

  return { historyGame, popularCollections };
}

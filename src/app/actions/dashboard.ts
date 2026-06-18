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
    },
    select: {
      id: true, title: true, releaseYear: true, releaseDate: true,
      coverImageUrl: true, genre: true, country: true, popularity: true, views: true,
      releaseStatus: true,
      platform: { select: { name: true, type: true, discontinued: true } },
      developer: { select: { name: true } },
      publisher: { select: { name: true } },
    }
  });

  if (!historyGame) {
    // Fallback to a deterministic random game per day if no release today
    const totalGames = await prisma.game.count();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const pseudoRandom = Math.abs(Math.sin(seed) * 10000) % 1;
    const skip = Math.max(0, Math.floor(pseudoRandom * totalGames));
    
    historyGame = await prisma.game.findFirst({
      skip,
      take: 1,
      select: {
        id: true, title: true, releaseYear: true, releaseDate: true,
        coverImageUrl: true, genre: true, country: true, popularity: true, views: true,
        releaseStatus: true,
        platform: { select: { name: true, type: true, discontinued: true } },
        developer: { select: { name: true } },
        publisher: { select: { name: true } },
      }
    });
    isRandom = true;
  }

  // Parallelize all independent queries
  const [recentGamesRaw, popularGamesRaw, popularGroups, usersWithPublicItems] = await Promise.all([
    // Recent games (최신 출시연도 6개)
    prisma.game.findMany({
      orderBy: { releaseYear: 'desc' },
      take: 6,
      select: {
        id: true, title: true, releaseYear: true, coverImageUrl: true,
        genre: true, popularity: true, views: true, releaseStatus: true,
        platform: { select: { name: true, type: true, discontinued: true } },
        developer: { select: { name: true } },
        publisher: { select: { name: true } },
      }
    }),
    // Popular games (인기도 상위 4개)
    prisma.game.findMany({
      orderBy: { popularity: 'desc' },
      take: 4,
      select: {
        id: true, title: true, releaseYear: true, coverImageUrl: true,
        genre: true, popularity: true, views: true, rating: true, releaseStatus: true,
        platform: { select: { name: true, type: true, discontinued: true } },
        developer: { select: { name: true } },
        publisher: { select: { name: true } },
      }
    }),
    // Popular collection groups
    prisma.collectionGroup.findMany({
      where: { isPublic: true },
      orderBy: [{ likes: 'desc' }, { views: 'desc' }],
      take: 12,
      include: {
        user: { select: { id: true, nickname: true, name: true, image: true } },
        items: {
          take: 3,
          include: {
            item: {
              include: {
                game: {
                  select: {
                    id: true, title: true, coverImageUrl: true, releaseYear: true, genre: true,
                    platform: { select: { name: true } }
                  }
                }
              }
            }
          }
        }
      }
    }),
    // Users with public collections
    prisma.user.findMany({
      where: { collections: { some: { visibility: 'public' } } },
      take: 12,
      select: {
        id: true, nickname: true, name: true, image: true,
        profileLikes: true, profileViews: true,
        collections: {
          where: { visibility: 'public' },
          take: 3,
          include: { 
            game: { 
              select: { 
                id: true, title: true, coverImageUrl: true, releaseYear: true, genre: true,
                platform: { select: { name: true } } 
              } 
            } 
          }
        }
      }
    }),
  ]);

  const recentGames = recentGamesRaw.map(g => ({
    id: g.id, title: g.title, releaseYear: g.releaseYear,
    platform: g.platform.name, genre: g.genre,
    imageUrl: g.coverImageUrl || '', popularity: g.popularity, views: g.views,
    releaseStatus: g.releaseStatus, platformType: g.platform.type,
    platformDiscontinued: g.platform.discontinued || false,
    developer: g.developer?.name || '', publisher: g.publisher?.name || '',
  }));

  const popularGames = popularGamesRaw.map(g => ({
    id: g.id, title: g.title, releaseYear: g.releaseYear,
    platform: g.platform.name, genre: g.genre,
    imageUrl: g.coverImageUrl || '', popularity: g.popularity, views: g.views,
    rating: g.rating || 0, rarity: 'Common',
    releaseStatus: g.releaseStatus, platformType: g.platform.type,
    platformDiscontinued: g.platform.discontinued || false,
    developer: g.developer?.name || '', publisher: g.publisher?.name || '',
  }));

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
        likes: u.profileLikes || 0,
        views: u.profileViews || 0,
        type: 'user', // mark as user profile collection
        games: u.collections.map(c => ({
          ...c.game,
          imageUrl: c.game.coverImageUrl || '',
          platform: (c.game as any).platform?.name || 'Unknown'
        }))
      }))
  ].slice(0, 12);

  const formattedHistoryGame = historyGame ? {
    id: historyGame.id,
    title: historyGame.title,
    releaseYear: historyGame.releaseYear,
    platform: historyGame.platform.name,
    genre: historyGame.genre,
    country: historyGame.country || '',
    imageUrl: historyGame.coverImageUrl || '',
    popularity: historyGame.popularity,
    views: historyGame.views,
    releaseStatus: historyGame.releaseStatus,
    platformType: historyGame.platform.type,
    platformDiscontinued: historyGame.platform.discontinued || false,
    developer: historyGame.developer?.name || '',
    publisher: historyGame.publisher?.name || '',
    isRandom,
  } : null;

  return { historyGame: formattedHistoryGame, recentGames, popularGames, popularCollections };
}

"use server";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { currentTimelineYear, TIMELINE_GAMES_PER_YEAR, TIMELINE_START_YEAR, type TimelineGame, type TimelineNarrative } from '@/lib/timeline';
import { getGameSlug, getPlatformSlug } from '@/lib/slug';

// Keep the existing admin consumer's complete records behind its role check.
export async function getTimelineEvents() {
  const session=await getServerSession(authOptions);
  if(!session?.user?.role || !['ADMIN','MODERATOR','MANAGER','INFO_MANAGER','USER_MANAGER'].includes(session.user.role)) return [];
  return prisma.timelineEvent.findMany({orderBy:[{year:'asc'},{sortOrder:'asc'}]});
}

export async function getPublicTimelineEvents(): Promise<TimelineNarrative[]> {
  const events=await prisma.timelineEvent.findMany({
    where:{isVisible:true,year:{gte:TIMELINE_START_YEAR,lte:currentTimelineYear()}},
    orderBy:[{year:'asc'},{sortOrder:'asc'},{id:'asc'}],
    select:{id:true,year:true,title:true,type:true,description:true,country:true,
      game:{select:{title:true,releaseYear:true,status:true,deletedAt:true}},
      platform:{select:{name:true,releaseYear:true,status:true}},
    },
  });
  return events.map(({game,platform,...e})=>({...e,
    ...(game?.status==='APPROVED'&&!game.deletedAt?{gameHref:`/games/${getGameSlug(game)}`} : {}),
    ...(platform?.status==='APPROVED'?{platformHref:`/platforms/${getPlatformSlug(platform)}`} : {}),
  }));
}

export async function getPlatformsForTimeline() {
  return prisma.platform.findMany({
    where:{status:'APPROVED',releaseYear:{gte:TIMELINE_START_YEAR,lte:currentTimelineYear()}},
    orderBy:[{releaseYear:'asc'},{name:'asc'}],
    select:{id:true,name:true,releaseYear:true,releaseDate:true,manufacturer:true,description:true,imageUrl:true},
  });
}

export async function getTopGamesForTimeline(): Promise<TimelineGame[]> {
  // Bound parameters and a per-year window avoid transferring the whole game database.
  return prisma.$queryRaw<TimelineGame[]>(Prisma.sql`
    WITH ranked AS (
      SELECT g."id",g."title",g."releaseYear",g."releaseDate",g."genre",
        COALESCE(g."coverImageUrl",'') AS "imageUrl",g."popularity",g."views",p."name" AS "platform",
        ROW_NUMBER() OVER (PARTITION BY g."releaseYear" ORDER BY g."popularity" DESC,g."views" DESC,g."title" ASC,g."id" ASC) AS "rankPosition"
      FROM "Game" g JOIN "Platform" p ON p."id"=g."platformId"
      WHERE g."status"='APPROVED' AND g."deletedAt" IS NULL AND p."status"='APPROVED'
        AND g."releaseStatus"='RELEASED' AND g."isAdult"=false
        AND (g."ageRating" IS NULL OR g."ageRating" NOT IN ('19','19+','R18'))
        AND g."releaseYear" BETWEEN ${TIMELINE_START_YEAR} AND ${currentTimelineYear()}
        AND (g."releaseYear"<>1970 OR (g."releaseDate" LIKE '1970-%' AND g."releaseDate" NOT LIKE '1970-01-01%'))
    )
    SELECT "id","title","releaseYear","releaseDate","genre","imageUrl","popularity","views","platform"
    FROM ranked WHERE "rankPosition"<=${TIMELINE_GAMES_PER_YEAR}
    ORDER BY "releaseYear" ASC,"rankPosition" ASC
  `);
}

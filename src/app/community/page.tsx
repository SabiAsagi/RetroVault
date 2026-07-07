import { prisma } from "@/lib/prisma";
import Community from "@/components/Community";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const publicUsers = await prisma.user.findMany({
    where: {
      collections: { some: { visibility: 'public' } }
    },
    include: {
      collections: {
        where: { visibility: 'public' },
        include: {
          game: true
        },
        take: 6
      },
      _count: {
        select: { collections: { where: { visibility: 'public' } } }
      }
    },
    orderBy: {
      collections: { _count: 'desc' }
    }
  });

  const publicGroups = await prisma.collectionGroup.findMany({
    where: { isPublic: true },
    include: {
      user: true,
      items: {
        include: {
          item: {
            include: { game: true }
          }
        },
        take: 6
      },
      _count: { select: { items: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <Suspense fallback={<div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-mint border-t-transparent rounded-full animate-spin"></div></div>}>
      <Community users={publicUsers} groups={publicGroups} />
    </Suspense>
  );
}

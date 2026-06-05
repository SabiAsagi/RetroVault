import { getGamesFromDB } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";
import { getUserProfile } from "@/app/actions/profile";
import Profile from "@/components/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";
import { redirect } from "next/navigation";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user && id === "me") return <LoginRequired />;

  const games = await getGamesFromDB();

  if (id === "me" || id === session?.user?.id) {
    const collection = await getUserCollection();
    return <Profile games={games} collection={collection} />;
  } else {
    const profileData = await getUserProfile(id);
    if (!profileData) {
      return <div className="p-8 text-center text-text-primary">존재하지 않는 유저입니다.</div>;
    }
    
    // Convert prisma items to standard items for Profile component
    const publicCollection = profileData.collection.map(item => ({
      id: item.id,
      gameId: item.gameId,
      status: item.ownershipStatus as any,
      ownershipStatus: item.ownershipStatus as any,
      purchaseType: item.purchaseType as any || null,
      condition: item.condition as any || null,
      region: item.region as any || null,
      purchaseDate: item.purchaseDate || '',
      purchasePrice: item.purchasePrice || undefined,
      memo: item.memo || '',
      playStartDate: item.playStartDate || undefined,
      clearDate: item.clearDate || undefined,
      playTime: item.playTime || undefined,
      playStatus: item.playStatus as any || '미플레이',
      rating: item.rating || 0,
      visibility: item.visibility as any || 'public',
      sortIndex: item.sortOrder
    }));

    return <Profile games={games} collection={publicCollection} viewedUser={profileData.user as any} />;
  }
}

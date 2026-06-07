import { getGamesFromDB } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";
import { getUserProfileByNickname } from "@/app/actions/profile";
import Profile from "@/components/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";
import { redirect } from "next/navigation";

export default async function ProfilePage({ params }: { params: Promise<{ nickname: string }> }) {
  const { nickname: rawNickname } = await params;
  const decodedNickname = decodeURIComponent(rawNickname);
  const session = await getServerSession(authOptions);
  
  const games = await getGamesFromDB();

  const targetIdentifier = decodedNickname === "me" ? session?.user?.id : decodedNickname;
  
  if (!targetIdentifier) {
    return <LoginRequired />;
  }

  const profileData = await getUserProfileByNickname(targetIdentifier);
  
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

  const isOwnProfile = decodedNickname === "me" || profileData.user.id === session?.user?.id;

  if (isOwnProfile) {
    // For own profile, we might want to show private items as well, so we fetch their full collection
    const fullCollection = await getUserCollection();
    return <Profile games={games} collection={fullCollection} viewedUser={profileData.user as any} collectionGroups={profileData.collectionGroups} />;
  }

  return <Profile games={games} collection={publicCollection} viewedUser={profileData.user as any} collectionGroups={profileData.collectionGroups} />;
}

import { getGamesFromDB } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";
import Profile from "@/components/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user && id === "me") return <LoginRequired />;

  // In MVP, we just show the logged in user's profile for now, or mock others
  // If params.id === "me", we fetch current user's data
  const games = await getGamesFromDB();
  const collection = await getUserCollection();

  return <Profile games={games} collection={collection} />;
}

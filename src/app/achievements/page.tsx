import { getGamesFromDB } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";
import Achievements from "@/components/Achievements";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <LoginRequired />;

  const games = await getGamesFromDB();
  const collection = await getUserCollection();

  return <Achievements games={games} collection={collection} />;
}

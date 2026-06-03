import DashboardWrapper from "@/components/wrappers/DashboardWrapper";
import { getGamesFromDB } from "./actions/games";
import { getUserCollection } from "./actions/collection";

export default async function Home() {
  const games = await getGamesFromDB();
  const collection = await getUserCollection();

  return <DashboardWrapper initialGames={games} initialCollection={collection} />;
}

import DashboardWrapper from "@/components/wrappers/DashboardWrapper";
import { getGamesFromDB } from "./actions/games";
import { getUserCollection } from "./actions/collection";
import { getDashboardData } from "./actions/dashboard";

export default async function Home() {
  const games = await getGamesFromDB();
  const collection = await getUserCollection();
  const { historyGame, popularCollections } = await getDashboardData();

  return <DashboardWrapper 
    initialGames={games} 
    initialCollection={collection} 
    historyGame={historyGame as any}
    popularCollections={popularCollections}
  />;
}

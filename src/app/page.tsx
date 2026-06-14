import DashboardWrapper from "@/components/wrappers/DashboardWrapper";
import { getUserCollection } from "./actions/collection";
import { getDashboardData } from "./actions/dashboard";

export default async function Home() {
  const collection = await getUserCollection();
  const { historyGame, recentGames, popularGames, popularCollections } = await getDashboardData();

  return <DashboardWrapper 
    initialCollection={collection} 
    historyGame={historyGame as any}
    recentGames={recentGames as any[]}
    popularGames={popularGames as any[]}
    popularCollections={popularCollections}
  />;
}

import WikiHome from '@/components/WikiHome';
import { getUserCollection } from './actions/collection';
import { getDashboardData } from './actions/dashboard';
export default async function Home() {
  const [collection, data] = await Promise.all([getUserCollection(), getDashboardData()]);
  const games = data.popularGames.length ? data.popularGames : data.recentGames;
  return <WikiHome games={games as any} ownedIds={collection.map(item => item.gameId)} historyGame={data.historyGame as any} />;
}

import CollectionWrapper from "@/components/wrappers/CollectionWrapper";
import { getCollectionGames, getGamesFromDB } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";

export default async function CollectionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <LoginRequired />;
  }

  const [archiveGames, ownedGames, collection] = await Promise.all([
    getGamesFromDB(), getCollectionGames(), getUserCollection(),
  ]);
  // Keep every owned game visible even when it falls outside the archive's first page.
  const games = Array.from(new Map([...archiveGames, ...ownedGames].map(game => [game.id, game])).values());

  return <CollectionWrapper initialGames={games} initialCollection={collection} />;
}

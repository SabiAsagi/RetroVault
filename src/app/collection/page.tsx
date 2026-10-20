import CollectionWrapper from "@/components/wrappers/CollectionWrapper";
import { getCollectionGames } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginRequired from "@/components/LoginRequired";

export default async function CollectionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <LoginRequired />;
  }

  const [games, collection] = await Promise.all([
    getCollectionGames(), getUserCollection(),
  ]);

  return <CollectionWrapper initialGames={games} initialCollection={collection} />;
}

import ArchiveWrapper from "@/components/wrappers/ArchiveWrapper";
import { getGamesFromDB } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";

export default async function GamesPage() {
  const games = await getGamesFromDB();
  const collection = await getUserCollection();

  return <ArchiveWrapper initialGames={games} initialCollection={collection} />;
}

import ArchiveWrapper from "@/components/wrappers/ArchiveWrapper";
import { getGamesFromDB } from "@/app/actions/games";
import { getUserCollection } from "@/app/actions/collection";
import Link from "next/link";

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ platform?: string, developer?: string, publisher?: string }> }) {
  const { platform, developer, publisher } = await searchParams;
  
  // Use getGamesFromDB or Prisma directly if it doesn't support structured filters
  // getGamesFromDB currently only takes a string `query`.
  // Let's modify getGamesFromDB or do the query here.
  let queryOptions = {};
  if (platform) queryOptions = { platform: { name: platform } };
  if (developer) queryOptions = { developer: { name: developer } };
  if (publisher) queryOptions = { publisher: { name: publisher } };

  // For simplicity, we can fetch all and filter in memory since we are passing to ArchiveWrapper
  let games = await getGamesFromDB();
  
  if (platform) games = games.filter(g => g.platform === platform);
  if (developer) games = games.filter(g => g.developer === developer);
  if (publisher) games = games.filter(g => g.publisher === publisher);

  const collection = await getUserCollection();

  return <ArchiveWrapper initialGames={games} initialCollection={collection} />;
}

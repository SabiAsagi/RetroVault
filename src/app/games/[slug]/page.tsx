import { getGameBySlug } from "@/app/actions/games";
import { notFound } from "next/navigation";
import GameDetailClient from "./GameDetailClient";

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return <GameDetailClient game={game} />;
}

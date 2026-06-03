import { getGameById } from "@/app/actions/games";
import { notFound } from "next/navigation";
import GameDetailClient from "./GameDetailClient";

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await getGameById(id);

  if (!game) {
    notFound();
  }

  return <GameDetailClient game={game} />;
}

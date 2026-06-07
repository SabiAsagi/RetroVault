"use client";
import GameCard from "./GameCard";

export default function GameGrid({ games }: { games: any[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          isOwned={false} 
          onAddToCollection={() => {}} 
        />
      ))}
    </div>
  );
}

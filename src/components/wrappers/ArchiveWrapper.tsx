"use client";
import React, { useState } from 'react';
import { useSessionStorage } from "@/hooks/useSessionStorage";
import Archive from '@/components/Archive';
import { Game, CollectionItem } from '@/types';
import { getGameSlug } from '@/lib/slug';
import { updateCollectionItem } from '@/app/actions/collection';
import { useRouter } from 'next/navigation';
import CollectionAddModal from '@/components/CollectionAddModal';

interface Props {
  initialGames: Game[];
  initialCollection: CollectionItem[];
  initialSearchQuery?: string;
}

export default function ArchiveWrapper({ initialGames, initialCollection, initialSearchQuery }: Props) {
  const [collection, setCollection] = useState<CollectionItem[]>(initialCollection);
  const [searchQuery, setSearchQuery] = useSessionStorage("archive-search", initialSearchQuery || "");
  const [gameToAdd, setGameToAdd] = useState<Game | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery, setSearchQuery]);

  const isOwned = (gameId: string) => collection.some(item => item.gameId === gameId);

  const handleAddToCollection = async (gameId: string) => {
    if (isOwned(gameId)) return;
    const game = initialGames.find(g => g.id === gameId);
    if (game) {
      setGameToAdd(game);
    }
  };

  const handleSelectGame = (game: Game) => {
    router.push(`/games/${getGameSlug(game)}`);
  };

  return (
    <div className="pt-4">

      <Archive
        games={initialGames}
        isLoading={false}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOwned={isOwned}
        onAddToCollection={handleAddToCollection}
        onSelectGame={handleSelectGame}
        initialEra={null}
      />

      {gameToAdd && (
        <CollectionAddModal 
          game={gameToAdd} 
          onClose={() => setGameToAdd(null)} 
          onSuccess={() => {
            // Refetch or update optimistic state
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

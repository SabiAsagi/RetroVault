"use client";
import React, { useState, useCallback } from 'react';
import { useSessionStorage } from "@/hooks/useSessionStorage";
import Archive from '@/components/Archive';
import { Game, CollectionItem } from '@/types';
import { getGameSlug } from '@/lib/slug';
import { useRouter } from 'next/navigation';
import CollectionAddModal from '@/components/CollectionAddModal';

interface Props {
  initialGames: Game[];
  initialCollection: CollectionItem[];
  initialSearchQuery?: string;
  initialTotal?: number;
  initialFilterOptions?: {
    platforms: string[];
    genres: string[];
    countries: string[];
    developers: string[];
    publishers: string[];
  };
}

export default function ArchiveWrapper({ initialGames, initialCollection, initialSearchQuery, initialTotal, initialFilterOptions }: Props) {
  const [collection, setCollection] = useState<CollectionItem[]>(initialCollection);
  const [searchQuery, setSearchQuery] = useSessionStorage("archive-search", initialSearchQuery || "");
  const [gameToAdd, setGameToAdd] = useState<Game | null>(null);
  const [games, setGames] = useState<Game[]>(initialGames);
  const [total, setTotal] = useState(initialTotal || initialGames.length);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState(initialFilterOptions);
  const router = useRouter();

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery, setSearchQuery]);

  const isOwned = (gameId: string) => collection.some(item => item.gameId === gameId);

  const fetchGames = useCallback(async (params: {
    page: number;
    sort: string;
    search: string;
    platforms: string[];
    genres: string[];
    countries: string[];
    developers: string[];
    publishers: string[];
  }) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(params.page));
      searchParams.set('pageSize', '30');
      searchParams.set('sort', params.sort);
      if (params.search) searchParams.set('q', params.search);
      if (params.platforms.length > 0) searchParams.set('platforms', params.platforms.join(','));
      if (params.genres.length > 0) searchParams.set('genres', params.genres.join(','));
      if (params.countries.length > 0) searchParams.set('countries', params.countries.join(','));
      if (params.developers.length > 0) searchParams.set('developers', params.developers.join(','));
      if (params.publishers.length > 0) searchParams.set('publishers', params.publishers.join(','));

      const res = await fetch(`/api/games?${searchParams.toString()}`);
      const data = await res.json();
      setGames(data.games);
      setTotal(data.total);
      if (data.filterOptions) {
        setFilterOptions(data.filterOptions);
      }
    } catch (err) {
      console.error('Failed to fetch games:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddToCollection = async (gameId: string) => {
    if (isOwned(gameId)) return;
    const game = games.find(g => g.id === gameId);
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
        games={games}
        total={total}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFetchGames={fetchGames}
        isOwned={isOwned}
        onAddToCollection={handleAddToCollection}
        onSelectGame={handleSelectGame}
        initialEra={null}
        filterOptions={filterOptions}
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

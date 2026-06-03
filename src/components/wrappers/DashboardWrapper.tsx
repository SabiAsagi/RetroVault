"use client";
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { Game, CollectionItem } from '@/types';
import { updateCollectionItem } from '@/app/actions/collection';
import { useRouter } from 'next/navigation';

interface Props {
  initialGames: Game[];
  initialCollection: CollectionItem[];
  historyGame?: Game | null;
  popularCollections?: any[];
}

export default function DashboardWrapper({ initialGames, initialCollection, historyGame, popularCollections }: Props) {
  const [collection, setCollection] = useState<CollectionItem[]>(initialCollection);
  const router = useRouter();

  const isOwned = (gameId: string) => collection.some(item => item.gameId === gameId);

  const handleAddToCollection = async (gameId: string) => {
    if (isOwned(gameId)) return;
    
    // Optimistic UI
    const newItem: CollectionItem = {
      id: `temp_${Date.now()}`,
      gameId,
      status: '위시리스트',
      ownershipStatus: '위시리스트',
      sortIndex: collection.length,
      purchaseDate: '',
      memo: '',
      rating: 0,
    };
    setCollection([...collection, newItem]);

    // Server action
    try {
      await updateCollectionItem(gameId, { ownershipStatus: '위시리스트' });
    } catch (e) {
      console.error(e);
      // Revert if failed (simplistic approach for MVP)
      setCollection(collection.filter(i => i.id !== newItem.id));
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'archive') router.push('/games');
    else if (tab === 'timeline') router.push('/timeline');
    else if (tab === 'vault') router.push('/collection');
  };

  const handleSelectGame = (game: Game) => {
    // Basic interaction for MVP
    alert(`${game.title} selected! Game details page coming soon in MVP.`);
  };

  return (
    <Dashboard
      games={initialGames}
      collection={collection}
      historyGame={historyGame}
      popularCollections={popularCollections}
      isOwned={isOwned}
      onAddToCollection={handleAddToCollection}
      onSelectGame={handleSelectGame}
      onTabChange={handleTabChange as any}
      onEraFilter={() => {}}
    />
  );
}

"use client";
import React, { useState } from 'react';
import MyVault from '@/components/MyVault';
import { Game, CollectionItem } from '@/types';
import { updateCollectionItem } from '@/app/actions/collection';

interface Props {
  initialGames: Game[];
  initialCollection: CollectionItem[];
}

export default function CollectionWrapper({ initialGames, initialCollection }: Props) {
  const [collection, setCollection] = useState<CollectionItem[]>(initialCollection);

  const isOwned = (gameId: string) => collection.some(item => item.gameId === gameId);

  const handleAddToCollection = async (gameId: string) => {
    if (isOwned(gameId)) return;
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
    try {
      await updateCollectionItem(gameId, { ownershipStatus: '위시리스트' });
    } catch (e) {
      console.error(e);
      setCollection(collection.filter(i => i.id !== newItem.id));
    }
  };

  const updateField = async (gameId: string, key: string, value: any) => {
    const original = [...collection];
    setCollection(prev =>
      prev.map(item => {
        if (item.gameId !== gameId) return item;
        const updated = { ...item, [key]: value };
        if (key === 'status') updated.ownershipStatus = value;
        if (key === 'ownershipStatus') updated.status = value;
        return updated as any;
      })
    );
    try {
      const data: any = { [key]: value };
      if (key === 'status') data.ownershipStatus = value;
      await updateCollectionItem(gameId, data);
    } catch (e) {
      console.error(e);
      setCollection(original);
    }
  };

  const reorderCollection = (sourceIndex: number, destinationIndex: number) => {
    setCollection(prev => {
      const sorted = [...prev].sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
      const [movedItem] = sorted.splice(sourceIndex, 1);
      sorted.splice(destinationIndex, 0, movedItem);
      // We are skipping the server sync for reordering in MVP for simplicity
      return sorted.map((item, index) => ({ ...item, sortIndex: index }));
    });
  };

  const handleSelectGame = (game: Game) => {
    alert(`${game.title} selected! Game details page coming soon.`);
  };

  return (
    <MyVault
      games={initialGames}
      collection={collection}
      isOwned={isOwned}
      onAddToCollection={handleAddToCollection}
      onSelectGame={handleSelectGame}
      onUpdateStatus={(id, s) => updateField(id, 'status', s)}
      onUpdateMemo={(id, m) => updateField(id, 'memo', m)}
      onUpdateRating={(id, r) => updateField(id, 'rating', r)}
      onReorder={reorderCollection}
    />
  );
}

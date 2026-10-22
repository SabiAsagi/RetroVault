"use client";
import React, { useRef, useState } from 'react';
import MyVault from '@/components/MyVault';
import { Game, CollectionItem } from '@/types';
import { reorderCollectionItems, updateCollectionItem } from '@/app/actions/collection';
import { DEFAULT_OWNERSHIP_STATUS } from '@/constants/collection';
import { useRouter } from 'next/navigation';
import { getGameSlug } from '@/lib/slug';
import { useToast } from '@/contexts/ToastContext';

interface Props {
  initialGames: Game[];
  initialCollection: CollectionItem[];
}

export default function CollectionWrapper({ initialGames, initialCollection }: Props) {
  const [collection, setCollection] = useState<CollectionItem[]>(initialCollection);
  const router = useRouter();
  const { showToast } = useToast();
  const savingOrder = useRef(false);

  React.useEffect(() => {
    setCollection(initialCollection);
  }, [initialCollection]);

  const isOwned = (gameId: string) => collection.some(item => item.gameId === gameId);

  const handleAddToCollection = async (gameId: string) => {
    if (isOwned(gameId)) return;
    const newItem: CollectionItem = {
      id: `temp_${Date.now()}`,
      gameId,
      status: DEFAULT_OWNERSHIP_STATUS,
      ownershipStatus: DEFAULT_OWNERSHIP_STATUS,
      sortIndex: collection.length,
      purchaseDate: '',
      memo: '',
      rating: 0,
    };
    setCollection(prev => [...prev, newItem]);
    try {
      await updateCollectionItem(gameId, { ownershipStatus: DEFAULT_OWNERSHIP_STATUS });
    } catch (e) {
      console.error(e);
      setCollection(prev => prev.filter(i => i.id !== newItem.id));
      showToast('컬렉션에 추가하지 못했습니다. 다시 시도해주세요.', 'error');
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
      const data = { [key === 'status' ? 'ownershipStatus' : key]: value };
      await updateCollectionItem(gameId, data);
    } catch (e) {
      console.error(e);
      setCollection(original);
      showToast('변경사항을 저장하지 못했습니다. 다시 시도해주세요.', 'error');
    }
  };

  const reorderCollection = async (sourceIndex: number, destinationIndex: number) => {
    if (savingOrder.current || sourceIndex === destinationIndex ||
        sourceIndex < 0 || destinationIndex < 0 ||
        sourceIndex >= collection.length || destinationIndex >= collection.length) return;
    savingOrder.current = true;
    const originalOrder = new Map(collection.map(item => [item.gameId, item.sortIndex]));
    const sorted = [...collection].sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
    const [movedItem] = sorted.splice(sourceIndex, 1);
    sorted.splice(destinationIndex, 0, movedItem);
    setCollection(sorted.map((item, index) => ({ ...item, sortIndex: index })));
    try {
      await reorderCollectionItems(sorted.map(item => item.gameId));
    } catch (error) {
      console.error(error);
      setCollection(prev => prev.map(item => originalOrder.has(item.gameId)
        ? { ...item, sortIndex: originalOrder.get(item.gameId) }
        : item));
      showToast('정렬 순서를 저장하지 못했습니다. 다시 시도해주세요.', 'error');
    } finally {
      savingOrder.current = false;
    }
  };

  const handleSelectGame = (game: Game) => {
    router.push(`/games/${getGameSlug(game)}`);
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
      onUpdateVisibility={(id, v) => updateField(id, 'visibility', v)}
      onReorder={reorderCollection}
    />
  );
}

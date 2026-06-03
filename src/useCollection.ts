/**
 * useCollection.ts — LocalStorage 기반 컬렉션 관리 훅
 * 백엔드 API를 완전히 제거하고 localStorage로 대체합니다.
 */
import { useState, useEffect, useCallback } from 'react';
import { CollectionItem, OwnershipStatus, Condition, Region, PurchaseType, Visibility } from './types';
import { defaultCollectionItems } from './data';

const STORAGE_KEY = 'retrovault_collection';

function loadFromStorage(): CollectionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CollectionItem[];
  } catch {}
  // 최초 방문 시 샘플 데이터로 초기화
  saveToStorage(defaultCollectionItems);
  return defaultCollectionItems;
}

function saveToStorage(items: CollectionItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('localStorage write failed', e);
  }
}

export function useCollection() {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 초기 로드
  useEffect(() => {
    const data = loadFromStorage();
    setCollection(data);
    setLoading(false);
  }, []);

  // 변경 시 자동 저장
  useEffect(() => {
    if (!loading) {
      saveToStorage(collection);
    }
  }, [collection, loading]);

  // ── CREATE ────────────────────────────────────────────────────────────────

  const addToCollection = useCallback((gameId: string, status: OwnershipStatus = '위시리스트') => {
    setCollection(prev => {
      if (prev.some(item => item.gameId === gameId)) return prev;
      const newItem: CollectionItem = {
        id: `c_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        gameId,
        status,
        ownershipStatus: status,
        purchaseDate: new Date().toISOString().split('T')[0],
        memo: '',
        rating: 0,
        visibility: 'private',
        sortIndex: prev.length,
      };
      return [...prev, newItem];
    });
  }, []);

  // ── DELETE ────────────────────────────────────────────────────────────────

  const removeFromCollection = useCallback((gameId: string) => {
    setCollection(prev => prev.filter(item => item.gameId !== gameId));
  }, []);

  // ── UPDATE helpers ────────────────────────────────────────────────────────

  const updateField = useCallback(<K extends keyof CollectionItem>(gameId: string, key: K, value: CollectionItem[K]) => {
    setCollection(prev =>
      prev.map(item => {
        if (item.gameId !== gameId) return item;
        const updated = { ...item, [key]: value };
        // status와 ownershipStatus 동기화
        if (key === 'status') updated.ownershipStatus = value as OwnershipStatus;
        if (key === 'ownershipStatus') updated.status = value as OwnershipStatus;
        return updated;
      })
    );
  }, []);

  const updateStatus = useCallback((gameId: string, status: OwnershipStatus) => {
    updateField(gameId, 'status', status);
  }, [updateField]);

  const updateMemo = useCallback((gameId: string, memo: string) => {
    updateField(gameId, 'memo', memo);
  }, [updateField]);

  const updateRating = useCallback((gameId: string, rating: number) => {
    updateField(gameId, 'rating', rating);
  }, [updateField]);

  const updateCondition = useCallback((gameId: string, condition: Condition) => {
    updateField(gameId, 'condition', condition);
  }, [updateField]);

  const updateRegion = useCallback((gameId: string, region: Region) => {
    updateField(gameId, 'region', region);
  }, [updateField]);

  const updatePurchaseType = useCallback((gameId: string, purchaseType: PurchaseType) => {
    updateField(gameId, 'purchaseType', purchaseType);
  }, [updateField]);

  const updatePurchasePrice = useCallback((gameId: string, purchasePrice: number) => {
    updateField(gameId, 'purchasePrice', purchasePrice);
  }, [updateField]);

  const updatePurchaseDate = useCallback((gameId: string, purchaseDate: string) => {
    updateField(gameId, 'purchaseDate', purchaseDate);
  }, [updateField]);

  const updatePlayTime = useCallback((gameId: string, playTime: number) => {
    updateField(gameId, 'playTime', playTime);
  }, [updateField]);

  const updatePlayStartDate = useCallback((gameId: string, playStartDate: string) => {
    updateField(gameId, 'playStartDate', playStartDate);
  }, [updateField]);

  const updateClearDate = useCallback((gameId: string, clearDate: string) => {
    updateField(gameId, 'clearDate', clearDate);
  }, [updateField]);

  const updateVisibility = useCallback((gameId: string, visibility: Visibility) => {
    updateField(gameId, 'visibility', visibility);
  }, [updateField]);

  const reorderCollection = useCallback((sourceIndex: number, destinationIndex: number) => {
    setCollection(prev => {
      // Sort by current sortIndex or array index to get correct visual order
      const sorted = [...prev].sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
      
      const [movedItem] = sorted.splice(sourceIndex, 1);
      sorted.splice(destinationIndex, 0, movedItem);
      
      // Re-assign sortIndex for all items based on new sorted order
      return sorted.map((item, index) => ({ ...item, sortIndex: index }));
    });
  }, []);

  // ── QUERY ─────────────────────────────────────────────────────────────────

  const isInCollection = useCallback((gameId: string) => {
    return collection.some(item => item.gameId === gameId);
  }, [collection]);

  const getCollectionItem = useCallback((gameId: string) => {
    return collection.find(item => item.gameId === gameId);
  }, [collection]);

  // ── ADMIN UTILITIES ───────────────────────────────────────────────────────

  const resetToSample = useCallback(() => {
    saveToStorage(defaultCollectionItems);
    setCollection(defaultCollectionItems);
  }, []);

  const clearAll = useCallback(() => {
    saveToStorage([]);
    setCollection([]);
  }, []);

  return {
    collection,
    loading,
    addToCollection,
    removeFromCollection,
    updateStatus,
    updateMemo,
    updateRating,
    updateCondition,
    updateRegion,
    updatePurchaseType,
    updatePurchasePrice,
    updatePurchaseDate,
    updatePlayTime,
    updatePlayStartDate,
    updateClearDate,
    updateVisibility,
    reorderCollection,
    isInCollection,
    getCollectionItem,
    resetToSample,
    clearAll,
  };
}

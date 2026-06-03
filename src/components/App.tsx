"use client";
import { useState, useCallback, useEffect } from 'react';
import { Tab, Game, Era } from '../types';
import { useCollection } from '../useCollection';
import { fetchGames } from '../api';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import Archive from './Archive';
import MyVault from './MyVault';
import Timeline from './Timeline';
import Stats from './Stats';
import Achievements from './Achievements';
import Profile from './Profile';
import Admin from './Admin';
import GameDetailModal from './GameDetailModal';
import Settings from './Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [archiveEraFilter, setArchiveEraFilter] = useState<Era | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [isGamesLoading, setIsGamesLoading] = useState<boolean>(true);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load games
  useEffect(() => {
    const loadGames = async () => {
      setIsGamesLoading(true);
      const { games: fetchedGames } = await fetchGames(debouncedSearchQuery);
      setGames(fetchedGames);
      setIsGamesLoading(false);
    };
    loadGames();
  }, [debouncedSearchQuery]);

  const {
    collection, loading: collectionLoading,
    addToCollection, removeFromCollection,
    updateStatus, updateMemo, updateRating,
    updateCondition, updateRegion, updatePurchaseType,
    updatePurchasePrice, updatePurchaseDate,
    updatePlayTime, updatePlayStartDate, updateClearDate, updateVisibility,
    reorderCollection,
    isInCollection, getCollectionItem,
    resetToSample, clearAll,
  } = useCollection();

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    if (tab !== 'archive') setArchiveEraFilter(null);
  }, []);

  const handleSelectGame = useCallback((game: Game) => setSelectedGame(game), []);
  const handleEraFilter = useCallback((era: Era) => setArchiveEraFilter(era), []);

  const handleAddToCollection = useCallback((gameId: string) => {
    if (!isInCollection(gameId)) addToCollection(gameId, '패키지 보유');
  }, [isInCollection, addToCollection]);

  const handleAddToWishlist = useCallback((gameId: string) => {
    if (!isInCollection(gameId)) addToCollection(gameId, '위시리스트');
  }, [isInCollection, addToCollection]);

  return (
    <div className="min-h-screen bg-vault-bg">
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="pb-16 sm:pb-0 page-enter">
        {activeTab === 'dashboard' && (
          <Dashboard
            games={games}
            collection={collection}
            isOwned={isInCollection}
            onAddToCollection={handleAddToCollection}
            onSelectGame={handleSelectGame}
            onTabChange={handleTabChange as (tab: 'archive' | 'vault' | 'timeline') => void}
            onEraFilter={handleEraFilter}
          />
        )}
        {activeTab === 'archive' && (
          <Archive
            games={games}
            isLoading={isGamesLoading}
            searchQuery={searchQuery}
            isOwned={isInCollection}
            onAddToCollection={handleAddToCollection}
            onSelectGame={handleSelectGame}
            initialEra={archiveEraFilter}
          />
        )}
        {activeTab === 'timeline' && <Timeline games={games} timelineEvents={[]} onSelectGame={handleSelectGame} />}
        {activeTab === 'vault' && (
          <MyVault
            games={games}
            collection={collection}
            isOwned={isInCollection}
            onAddToCollection={handleAddToCollection}
            onSelectGame={handleSelectGame}
            onUpdateStatus={updateStatus}
            onUpdateMemo={updateMemo}
            onUpdateRating={updateRating}
            onReorder={reorderCollection}
          />
        )}
        {activeTab === 'stats' && <Stats games={games} collection={collection} />}
        {activeTab === 'achievements' && <Achievements collection={collection} games={games} />}
        {activeTab === 'profile' && (
          <Profile collection={collection} games={games} />
        )}
        {activeTab === 'settings' && (
          <Settings />
        )}
        {activeTab === 'admin' && (
          <Admin
            collection={collection}
            games={games}
            timelineEvents={[]}
            onResetToSample={resetToSample}
            onClearAll={clearAll}
          />
        )}
      </main>

      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          games={games}
          collectionItem={getCollectionItem(selectedGame.id)}
          isOwned={isInCollection(selectedGame.id)}
          onClose={() => setSelectedGame(null)}
          onAddToCollection={handleAddToCollection}
          onAddToWishlist={handleAddToWishlist}
          onRemoveFromCollection={removeFromCollection}
          onUpdateStatus={updateStatus}
          onUpdateMemo={updateMemo}
          onUpdateRating={updateRating}
          onSelectGame={handleSelectGame}
          onUpdateCondition={updateCondition}
          onUpdateRegion={updateRegion}
          onUpdatePurchaseType={updatePurchaseType}
          onUpdatePurchasePrice={updatePurchasePrice}
          onUpdatePurchaseDate={updatePurchaseDate}
          onUpdatePlayTime={updatePlayTime}
          onUpdatePlayStartDate={updatePlayStartDate}
          onUpdateClearDate={updateClearDate}
          onUpdateVisibility={updateVisibility}
        />
      )}
    </div>
  );
}

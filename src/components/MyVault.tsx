import { useState, useRef, useMemo, useEffect } from 'react';
import { Game, CollectionItem, OwnershipStatus, VaultViewMode, Visibility } from '../types';
import { LayoutGrid, BookOpen, List, Package, Check, Eye, EyeOff, Users, Store, MonitorPlay, Zap, GripVertical, Star, Library, Plus, Share2, Search, Folder } from 'lucide-react';
import GameCard, { BoxArtPlaceholder } from './GameCard';

import ShareCollectionModal from './ShareCollectionModal';
import CollectionSearchModal from './CollectionSearchModal';
import CollectionAddModal from './CollectionAddModal';
import CollectionGroupModal from './CollectionGroupModal';
import { useToast } from '../contexts/ToastContext';

interface MyVaultProps {
  games: Game[];
  collection: CollectionItem[];
  isOwned: (gameId: string) => boolean;
  onAddToCollection: (gameId: string) => void;
  onSelectGame: (game: Game) => void;
  onUpdateStatus: (gameId: string, status: OwnershipStatus) => void;
  onUpdateMemo?: (gameId: string, memo: string) => void;
  onUpdateRating?: (gameId: string, rating: number) => void;
  onUpdateVisibility?: (gameId: string, visibility: any) => void;
  onReorder?: (sourceIndex: number, destinationIndex: number) => void;
}

type ExhibitionTheme = 'basic' | 'glass' | 'crt' | 'shop';

const platformColors: Record<string, { bg: string; spine: string; text: string }> = {
  'Atari 2600': { bg: '#8B4513', spine: '#6B3410', text: '#FFD89B' },
  'NES': { bg: '#C41E3A', spine: '#8B1528', text: '#FFB5C0' },
  'Game Boy': { bg: '#7B8D6E', spine: '#5A6B4E', text: '#D4E0C8' },
  'Super Famicom': { bg: '#6B6B9E', spine: '#4A4A7E', text: '#C8C8E8' },
  'PlayStation': { bg: '#003087', spine: '#002060', text: '#80A8E0' },
  'Nintendo 64': { bg: '#2D2D2D', spine: '#1A1A1A', text: '#B0B0B0' },
  'Dreamcast': { bg: '#FF6B00', spine: '#CC5500', text: '#FFD4AA' },
  'PlayStation 2': { bg: '#00439C', spine: '#003070', text: '#80B0E0' },
  'Nintendo DS': { bg: '#A8A8A8', spine: '#808080', text: '#E0E0E0' },
  'Nintendo Switch': { bg: '#E60012', spine: '#B0000E', text: '#FFB0B5' },
};

export default function MyVault({ 
  games, collection, isOwned, onAddToCollection, onSelectGame, 
  onUpdateStatus, onUpdateMemo, onUpdateRating, onUpdateVisibility, onReorder 
}: MyVaultProps) {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<VaultViewMode>('shelf');
  const [theme, setTheme] = useState<ExhibitionTheme>('basic');
  const [visibilityFilter, setVisibilityFilter] = useState<Visibility | 'all'>('all');
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);


  const [shareOpen, setShareOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [gameToAdd, setGameToAdd] = useState<Game | null>(null);
  const [itemToEdit, setItemToEdit] = useState<{item: CollectionItem, game: Game} | null>(null);

  // Fetch groups
  useEffect(() => {
    fetch('/api/collection-groups')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setGroups(data);
      })
      .catch(console.error);
  }, [groupModalOpen]);

  // Sort collection by sortIndex if available
  const sortedCollection = useMemo(() => {
    return [...collection].sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
  }, [collection]);

  const filteredCollection = sortedCollection.filter(c => {
    if (visibilityFilter !== 'all' && c.visibility !== visibilityFilter) return false;
    if (selectedGroup !== 'all') {
      const group = groups.find(g => g.id === selectedGroup);
      if (group && !group.items?.some((i: any) => i.itemId === c.id)) return false;
    }
    return true;
  });

  const displayItems = filteredCollection.map((c, index) => ({
    item: c,
    game: games.find(g => g.id === c.gameId)!,
    originalIndex: sortedCollection.findIndex(sc => sc.id === c.id) // needed for reorder mapping
  })).filter(x => !!x.game);

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      if (onReorder) {
        onReorder(draggedIndex, dragOverIndex);
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };


  // Render Theme specific classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'glass': return 'bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.05)]';
      case 'crt': return 'bg-vault-bg border-2 border-neon-purple/50 shadow-[0_0_15px_rgba(167,139,250,0.3)] relative crt-flicker overflow-hidden';
      case 'shop': return 'bg-vault-surface-light border-y-4 border-amber shadow-lg';
      case 'basic':
      default: return 'bg-vault-surface border border-vault-border rounded-xl';
    }
  };

  const getShelfBoardClasses = () => {
    switch (theme) {
      case 'glass': return 'h-2 bg-gradient-to-b from-white/20 to-white/5 rounded backdrop-blur-lg border-t border-white/30 shadow-[0_5px_15px_rgba(0,0,0,0.5)]';
      case 'crt': return 'h-2 bg-neon-purple shadow-[0_0_10px_rgba(167,139,250,0.8)] border-y border-white/20';
      case 'shop': return 'shelf-wood h-4 rounded-b-md shadow-md border-b border-[#3A1F04]';
      case 'basic':
      default: return 'h-3 bg-vault-border rounded-sm shadow-sm';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6 page-enter">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-vault-surface border border-vault-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center border border-mint/20">
            <Package className="text-mint" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-text-primary leading-none mb-1">내 컬렉션</h2>
            <p className="text-xs text-text-muted">총 {collection.length}개의 게임을 보유 중입니다</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Action Buttons */}
          <div className="flex gap-2 mr-2">
            <button 
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber/10 border border-amber/20 text-amber text-xs font-bold rounded-lg hover:bg-amber/20 transition-colors"
            >
              <Search size={14} /> 추가하기
            </button>

            <button 
              onClick={() => setGroupModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-text-secondary/10 border border-text-secondary/20 text-text-primary text-xs font-bold rounded-lg hover:bg-text-secondary/20 transition-colors"
            >
              <Folder size={14} /> 그룹 관리
            </button>

            <button 
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-bold rounded-lg hover:bg-neon-blue/20 transition-colors"
            >
              <Share2 size={14} /> 공유하기
            </button>
          </div>

          {/* Visibility Filter */}
          <div className="flex bg-vault-bg rounded-lg border border-vault-border p-1">
            {(['all', 'public', 'friends', 'private'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVisibilityFilter(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  visibilityFilter === v ? 'bg-vault-surface-light text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {v === 'all' ? '전체' : v === 'public' ? <><Eye size={12}/>공개</> : v === 'friends' ? <><Users size={12}/>친구</> : <><EyeOff size={12}/>비공개</>}
              </button>
            ))}
          </div>

          {/* Group Filter */}
          {groups.length > 0 && (
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-xs font-bold text-text-primary focus:outline-none focus:border-mint/50 cursor-pointer"
            >
              <option value="all">전체 그룹</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          )}

          {/* Theme Selector */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ExhibitionTheme)}
            className="bg-vault-surface-light border border-vault-border rounded-lg px-3 py-2 text-sm font-bold text-text-primary focus:outline-none focus:border-mint/50 cursor-pointer"
          >
            <option value="basic">🗄️ 기본 선반</option>
            <option value="glass">💎 유리 진열장</option>
            <option value="crt">📺 CRT 게임방</option>
            <option value="shop">🏪 레트로 게임샵</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-vault-bg rounded-lg border border-vault-border p-1">
            <button
              onClick={() => setViewMode('shelf')}
              title="선반 보기"
              className={`p-2 rounded-md transition-colors ${viewMode === 'shelf' ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-text-primary'}`}
            >
              <BookOpen size={16} />
            </button>
            <button
              onClick={() => setViewMode('spine')}
              title="패키지 옆면 보기"
              className={`p-2 rounded-md transition-colors ${viewMode === 'spine' ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-text-primary'}`}
            >
              <Library size={16} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              title="카드 보기"
              className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-text-primary'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="리스트 보기"
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-text-primary'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Collection Display */}
      {collection.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-vault-surface border border-vault-border rounded-xl">
          <Package className="text-text-muted mb-4" size={56} />
          <h3 className="text-text-primary font-bold text-xl mb-2">컬렉션이 비어있습니다</h3>
          <p className="text-text-muted text-sm mb-6">아카이브에서 게임을 검색하고 추가하여 나만의 게임 박물관을 만들어보세요.</p>
          <button 
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-amber/20 border border-amber/30 text-amber font-bold rounded-xl hover:bg-amber/30 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Search size={18} /> 첫 게임 추가하기
          </button>
        </div>
      ) : (
        <div className={`p-6 transition-all duration-500 rounded-xl ${getThemeClasses()}`}>
          {theme === 'crt' && <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />}
          {theme === 'crt' && <div className="absolute inset-0 pointer-events-none scanlines z-10 opacity-30" />}
          
          {viewMode === 'shelf' && (
            <div className="space-y-12 relative z-20">
              {/* Split items into rows of 10 for shelves */}
              {Array.from({ length: Math.ceil(displayItems.length / 10) }).map((_, rowIndex) => {
              const rowItems = displayItems.slice(rowIndex * 10, (rowIndex + 1) * 10);
              return (
                <div key={rowIndex} className="relative">
                  <div className="grid grid-cols-10 gap-2 sm:gap-4 lg:gap-6 px-4 md:px-8 pb-1 min-h-[120px] sm:min-h-[180px] items-end">
                    {rowItems.map((data, localIdx) => {
                      const { item, game, originalIndex } = data;
                      const isDragged = draggedIndex === originalIndex;
                      const isDragOver = dragOverIndex === originalIndex;

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(originalIndex)}
                          onDragEnter={() => handleDragEnter(originalIndex)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                          onClick={() => setItemToEdit({ item, game })}
                          className={`relative group cursor-pointer transition-all duration-300 transform perspective-1000
                            ${isDragged ? 'opacity-50 scale-95' : 'hover:-translate-y-4 hover:scale-105 hover:z-30'}
                            ${isDragOver ? 'translate-x-4 border-l-2 border-mint pl-2' : ''}
                          `}
                        >
                          <div className="w-full aspect-[3/4] rounded-md overflow-hidden shadow-[5px_5px_15px_rgba(0,0,0,0.5)] border border-vault-border/50 bg-vault-bg relative group-hover:-translate-y-2 group-hover:scale-[1.1] group-hover:z-30 group-hover:shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-all duration-300 origin-bottom">
                            {game.imageUrl ? (
                              <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                            ) : (
                              <BoxArtPlaceholder game={game} />
                            )}
                            
                            {/* Drag handle overlay on hover */}
                            <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-start pt-1">
                              <GripVertical size={14} className="text-text-primary/50" />
                            </div>
                            
                            {/* Reflection effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Shelf Board */}
                  <div className={getShelfBoardClasses()} />
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'spine' && (
          <div className="space-y-12 relative z-20">
            {/* Split items into rows of 12 for spine view as they are thinner */}
            {Array.from({ length: Math.ceil(displayItems.length / 12) }).map((_, rowIndex) => {
              const rowItems = displayItems.slice(rowIndex * 12, (rowIndex + 1) * 12);
              return (
                <div key={rowIndex} className="relative">
                  <div className="flex gap-2 px-4 md:px-8 pb-1 min-h-[160px] items-end overflow-x-auto custom-scrollbar">
                    {rowItems.map((data) => {
                      const { item, game, originalIndex } = data;
                      const isDragged = draggedIndex === originalIndex;
                      const isDragOver = dragOverIndex === originalIndex;
                      const colors = platformColors[game.platform] || { bg: '#3A4E66', spine: '#2A3A50', text: '#8899AA' };

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(originalIndex)}
                          onDragEnter={() => handleDragEnter(originalIndex)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                          onClick={() => setItemToEdit({ item, game })}
                          className={`relative group cursor-pointer shrink-0 transition-all duration-300
                            ${isDragged ? 'opacity-50 scale-95' : 'hover:-translate-y-2 hover:z-30'}
                            ${isDragOver ? 'translate-x-2 border-l border-mint pl-1' : ''}
                          `}
                          title={game.title}
                        >
                          <div
                            className="relative w-10 sm:w-12 h-32 sm:h-40 rounded-sm flex flex-col items-center justify-center shadow-[3px_3px_10px_rgba(0,0,0,0.5)] group-hover:shadow-[0_15px_25px_rgba(0,0,0,0.8)] transition-all"
                            style={{
                              background: `linear-gradient(90deg, ${colors.spine}, ${colors.bg}, ${colors.spine})`,
                              borderLeft: `2px solid ${colors.spine}`,
                              borderRight: `1px solid ${colors.spine}`,
                            }}
                          >
                            {/* Spine text */}
                            <div
                              className="absolute inset-x-1 inset-y-2 flex items-center justify-center"
                              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                            >
                              <span
                                className="font-pixel text-[5px] sm:text-[6px] leading-tight text-center whitespace-nowrap"
                                style={{ color: colors.text }}
                              >
                                {game.title.length > 22 ? game.title.slice(0, 22) + '…' : game.title}
                              </span>
                            </div>
                            
                            {/* Drag handle overlay on hover */}
                            <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-start pt-1">
                              <GripVertical size={12} className="text-text-primary/50" />
                            </div>
                            
                            {/* Hover shine */}
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors rounded-sm pointer-events-none" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Shelf Board */}
                  <div className={getShelfBoardClasses()} />
                </div>
              );
            })}
          </div>
        )}


        {viewMode === 'card' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 relative z-20">
            {displayItems.map((data) => {
              const { item, game, originalIndex } = data;
              const isDragged = draggedIndex === originalIndex;
              const isDragOver = dragOverIndex === originalIndex;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(originalIndex)}
                  onDragEnter={() => handleDragEnter(originalIndex)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`transition-all duration-200
                    ${isDragged ? 'opacity-50 scale-95' : ''}
                    ${isDragOver ? 'scale-105 border-mint border-2 rounded-xl' : ''}
                  `}
                >
                  <GameCard game={game} isOwned={true} onAddToCollection={onAddToCollection} onClick={() => setItemToEdit({ item, game })} />
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-2 relative z-20">
            {displayItems.map((data) => {
              const { item, game, originalIndex } = data;
              const isDragged = draggedIndex === originalIndex;
              const isDragOver = dragOverIndex === originalIndex;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(originalIndex)}
                  onDragEnter={() => handleDragEnter(originalIndex)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => setItemToEdit({ item, game })}
                  className={`flex items-center gap-4 px-4 py-3 bg-vault-bg/80 border border-vault-border rounded-xl cursor-pointer hover:border-mint/50 transition-all group
                    ${isDragged ? 'opacity-50' : ''}
                    ${isDragOver ? 'border-mint border-2 translate-y-1' : ''}
                  `}
                >
                  <div className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary p-1">
                    <GripVertical size={16} />
                  </div>
                  
                  <div className="w-12 h-16 rounded overflow-hidden shadow-md shrink-0">
                    {game.imageUrl ? (
                      <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                    ) : (
                      <BoxArtPlaceholder game={game} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-mint transition-colors">{game.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-text-secondary bg-vault-surface px-1.5 py-0.5 rounded">{game.platform}</span>
                      <span className="text-[10px] text-text-secondary">{item.ownershipStatus}</span>
                      {item.rating > 0 && <span className="text-[10px] text-amber flex items-center gap-0.5"><Star size={10} className="fill-amber" />{item.rating}</span>}
                    </div>
                  </div>
                  
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-xs text-text-muted">{item.purchaseDate}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-text-secondary">
                      {item.visibility === 'public' ? <Eye size={10} /> : item.visibility === 'friends' ? <Users size={10} /> : <EyeOff size={10} />}
                      {item.visibility === 'public' ? '공개' : item.visibility === 'friends' ? '친구만' : '비공개'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}



      <ShareCollectionModal 
        isOpen={shareOpen} 
        onClose={() => setShareOpen(false)} 
        visibility={visibilityFilter === 'all' ? 'public' : visibilityFilter} 
      />

      <CollectionSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        games={games}
        onSelectGame={(game) => {
          setSearchModalOpen(false);
          setGameToAdd(game);
        }}
      />

      {gameToAdd && (
        <CollectionAddModal
          game={gameToAdd}
          onClose={() => setGameToAdd(null)}
          onSuccess={() => {
            showToast(`'${gameToAdd.title}'이(가) 컬렉션에 추가되었습니다!`);
            setGameToAdd(null);
          }}
        />
      )}

      {itemToEdit && (
        <CollectionAddModal
          game={itemToEdit.game}
          initialItem={itemToEdit.item}
          onClose={() => setItemToEdit(null)}
          onSuccess={() => {
            showToast(`'${itemToEdit.game.title}' 정보가 수정되었습니다!`);
            setItemToEdit(null);
          }}
        />
      )}

      <CollectionGroupModal 
        isOpen={groupModalOpen} 
        onClose={() => setGroupModalOpen(false)} 
        collection={collection} 
        games={games} 
      />
    </div>
  );
}

"use client";
import { useState, useMemo } from 'react';
import { Game } from '@/types';
import { Search, X, Plus } from 'lucide-react';

interface CollectionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[]; // Pass the global games list for client-side search
  onSelectGame: (game: Game) => void;
}

export default function CollectionSearchModal({ isOpen, onClose, games, onSelectGame }: CollectionSearchModalProps) {
  const [query, setQuery] = useState('');

  const filteredGames = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return games.filter(g => 
      g.title.toLowerCase().includes(q) || 
      g.platform.toLowerCase().includes(q)
    ).slice(0, 10); // Limit to top 10 results
  }, [query, games]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh] bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Header */}
        <div className="p-4 border-b border-vault-border bg-vault-surface-light flex items-center gap-3">
          <Search className="text-text-muted" size={20} />
          <input
            type="text"
            autoFocus
            placeholder="아카이브에서 게임 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-text-primary focus:outline-none text-lg"
          />
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 transition-colors shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto flex-1 p-2">
          {query.trim() === '' ? (
            <div className="text-center p-8 text-text-muted text-sm">
              게임 제목이나 플랫폼을 입력하여 검색하세요.
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center p-8 text-text-muted text-sm">
              "{query}" 검색 결과가 없습니다.<br/>
              <span className="text-xs mt-2 block opacity-70">새로운 게임이라면 관리자에게 추가를 요청하세요.</span>
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredGames.map(game => (
                <li key={game.id}>
                  <button
                    onClick={() => onSelectGame(game)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-vault-bg/50 border border-transparent hover:border-vault-border transition-colors group"
                  >
                    {game.imageUrl ? (
                      <img src={game.imageUrl} alt={game.title} className="w-10 h-10 object-cover rounded shadow shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-vault-bg rounded border border-vault-border flex items-center justify-center shrink-0">
                        <span className="text-[8px] text-text-muted">No Img</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-mint transition-colors">{game.title}</h4>
                      <p className="text-xs text-text-secondary mt-0.5">{game.platform} · {game.releaseYear}</p>
                    </div>
                    <div className="shrink-0 p-2 bg-mint/10 text-mint rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={16} />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

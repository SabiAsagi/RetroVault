"use client";
import { useState, useEffect } from 'react';
import { Game } from '@/types';
import { Search, X, Plus } from 'lucide-react';

interface CollectionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: Game) => void;
}

export default function CollectionSearchModal({ isOpen, onClose, onSelectGame }: CollectionSearchModalProps) {
  const [query, setQuery] = useState('');
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setFilteredGames([]);
      setLoading(false);
      setError(false);
      return;
    }
    const controller = new AbortController();
    setFilteredGames([]);
    setLoading(true);
    setError(false);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim(), pageSize: '10' });
        const response = await fetch(`/api/games?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        if (!Array.isArray(data.games)) throw new Error('Invalid search results');
        if (!controller.signal.aborted) setFilteredGames(data.games);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, query, attempt]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="컬렉션에 추가할 게임 검색" onKeyDown={event => { if (event.key === 'Escape') onClose(); }} className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh] bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Header */}
        <div className="p-4 border-b border-vault-border bg-vault-surface-light flex items-center gap-3">
          <Search className="text-text-muted" size={20} />
          <input
            type="text"
            autoFocus
            placeholder="아카이브에서 게임 검색..."
            aria-label="컬렉션에 추가할 게임 제목 또는 플랫폼"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-text-primary focus:outline-none text-lg"
          />
          <button onClick={onClose} aria-label="검색 닫기" className="text-text-muted hover:text-text-primary p-1 transition-colors shrink-0">
            <X size={24} />
          </button>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto flex-1 p-2">
          {query.trim() === '' ? (
            <div className="text-center p-8 text-text-muted text-sm">
              게임 제목이나 플랫폼을 입력하여 검색하세요.
            </div>
          ) : loading ? (
            <p role="status" className="p-8 text-center text-sm text-text-muted">전체 아카이브에서 검색 중입니다...</p>
          ) : error ? (
            <div role="alert" className="p-8 text-center text-sm text-text-secondary">
              <p>검색 결과를 불러오지 못했어요.</p>
              <button onClick={() => setAttempt(value => value + 1)} className="mt-3 min-h-11 rounded-lg border border-vault-border px-4 text-mint">다시 시도</button>
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

import { useState, useMemo, useEffect } from 'react';
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { Game, Rarity, SortOption, Era } from '../types';
import { Filter, Search, X, LayoutGrid, List, Monitor } from 'lucide-react';
import Link from 'next/link';
import GameCard from './GameCard';

interface ArchiveProps {
  games: Game[];
  isLoading: boolean;
  searchQuery: string;
  isOwned: (gameId: string) => boolean;
  onAddToCollection: (gameId: string) => void;
  onSelectGame: (game: Game) => void;
  initialEra?: Era | null;
  onSearchChange?: (q: string) => void;
}

const rarities: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Legendary'];
const eraList: Era[] = [
  '2nd Gen (1976-1992)', '3rd Gen (1983-2003)', '4th Gen (1987-2004)',
  '5th Gen (1993-2006)', '6th Gen (1998-2013)', '7th Gen (2005-2017)',
  '8th Gen (2012-2020)', '9th Gen (2020-)',
];
const eraLabels: Record<Era, string> = {
  '1st Gen (1972-1980)': '1세대',
  '2nd Gen (1976-1992)': '2세대',
  '3rd Gen (1983-2003)': '3세대',
  '4th Gen (1987-2004)': '4세대',
  '5th Gen (1993-2006)': '5세대',
  '6th Gen (1998-2013)': '6세대',
  '7th Gen (2005-2017)': '7세대',
  '8th Gen (2012-2020)': '8세대',
  '9th Gen (2020-)': '9세대',
};

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'year-asc', label: '출시연도 ↑' },
  { value: 'year-desc', label: '출시연도 ↓' },
  { value: 'name-asc', label: '이름 A→Z' },
  { value: 'name-desc', label: '이름 Z→A' },
  { value: 'rarity', label: '희귀도순' },
  { value: 'popularity', label: '인기도순' },
  { value: 'rating', label: '평점순' },
];

type ViewMode = 'grid' | 'list';

export default function Archive({ games, isLoading, searchQuery, isOwned, onAddToCollection, onSelectGame, initialEra, onSearchChange }: ArchiveProps) {
  const allPlatforms = useMemo(() => [...new Set(games.map(g => g.platform))].filter(Boolean).sort(), [games]);
  const allGenres = useMemo(() => [...new Set(games.map(g => g.genre))].filter(Boolean).sort(), [games]);
  const allCountries = useMemo(() => [...new Set(games.map(g => g.country).filter(Boolean))].sort(), [games]);
  const allDevelopers = useMemo(() => [...new Set(games.map(g => g.developer).filter(Boolean))].sort(), [games]);

  const allInstallSizes = useMemo(() => [...new Set(games.map(g => g.installSize).filter(Boolean))].sort(), [games]);

  const [viewMode, setViewMode] = useSessionStorage<ViewMode>('archive-view', 'grid');
  const [showFilters, setShowFilters] = useSessionStorage('archive-filters-open', true);
  const [platformFilters, setPlatformFilters] = useSessionStorage<string[]>('archive-platforms', []);
  const [genreFilter, setGenreFilter] = useSessionStorage('archive-genre', '');
  const [rarityFilter, setRarityFilter] = useSessionStorage('archive-rarity', '');
  const [eraFilter, setEraFilter] = useSessionStorage<string>('archive-era', initialEra || '');
  const [countryFilter, setCountryFilter] = useSessionStorage('archive-country', '');
  const [developerFilter, setDeveloperFilter] = useSessionStorage('archive-developer', '');
  const [installSizeFilter, setInstallSizeFilter] = useSessionStorage('archive-installsize', '');
  const [sortBy, setSortBy] = useSessionStorage<SortOption>('archive-sort', 'popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, platformFilters, genreFilter, rarityFilter, eraFilter, sortBy, countryFilter, installSizeFilter, developerFilter]);

  useEffect(() => {
    if (initialEra) { setEraFilter(initialEra); setShowFilters(true); }
  }, [initialEra]);

  const filtered = useMemo(() => {
    let result = [...games];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => g.title.toLowerCase().includes(q) || g.developer?.toLowerCase().includes(q) || g.publisher?.toLowerCase().includes(q));
    }
    if (platformFilters.length > 0) result = result.filter(g => platformFilters.includes(g.platform));
    if (genreFilter) result = result.filter(g => g.genre === genreFilter);
    if (rarityFilter) result = result.filter(g => g.rarity === rarityFilter);
    if (eraFilter) result = result.filter(g => g.era === eraFilter);
    if (countryFilter) result = result.filter(g => g.country === countryFilter);
    if (developerFilter) result = result.filter(g => g.developer === developerFilter);
    if (installSizeFilter) result = result.filter(g => g.installSize === installSizeFilter);

    const rarityOrder: Record<Rarity, number> = { Legendary: 0, Rare: 1, Uncommon: 2, Common: 3 };
    switch (sortBy) {
      case 'year-asc':    result.sort((a, b) => a.releaseYear - b.releaseYear); break;
      case 'year-desc':   result.sort((a, b) => b.releaseYear - a.releaseYear); break;
      case 'name-asc':    result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'name-desc':   result.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'rarity':      result.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]); break;
      case 'popularity':  result.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)); break;
      case 'rating':      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
    }
    return result;
  }, [games, searchQuery, platformFilters, genreFilter, rarityFilter, eraFilter, sortBy, countryFilter, installSizeFilter]);

  const hasFilters = platformFilters.length > 0 || genreFilter || rarityFilter || eraFilter || countryFilter || developerFilter || installSizeFilter;

  const clearFilters = () => { setPlatformFilters([]); setGenreFilter(''); setRarityFilter(''); setEraFilter(''); setCountryFilter(''); setDeveloperFilter(''); setInstallSizeFilter(''); };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">
      {onSearchChange && (
        <div className="mb-6 flex justify-end">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="제목, 개발사, 퍼블리셔 검색..."
              className="w-full bg-vault-surface border border-vault-border rounded-xl px-10 py-3 text-text-primary focus:outline-none focus:border-mint transition-colors"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-full md:w-56 shrink-0 space-y-6">
            <div className="flex items-center justify-between bg-vault-surface border border-vault-border p-3 rounded-lg">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Filter size={16} className="text-mint" /> 상세 필터
              </h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-text-muted hover:text-coral transition-colors">초기화</button>
              )}
            </div>
            
            <div className="bg-vault-surface border border-vault-border rounded-xl p-4 space-y-4 shadow-sm sticky top-20">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">플랫폼 (다중 선택)</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {allPlatforms.map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={platformFilters.includes(p)}
                        onChange={(e) => {
                          if (e.target.checked) setPlatformFilters([...platformFilters, p]);
                          else setPlatformFilters(platformFilters.filter(f => f !== p));
                        }}
                        className="rounded border-vault-border bg-vault-bg text-mint focus:ring-mint focus:ring-offset-vault-surface"
                      />
                      <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">장르</label>
                <FilterSelect value={genreFilter} onChange={setGenreFilter} options={allGenres} />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">개발사</label>
                <FilterSelect value={developerFilter} onChange={setDeveloperFilter} options={allDevelopers as string[]} />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">희귀도</label>
                <FilterSelect value={rarityFilter} onChange={setRarityFilter} options={rarities} />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">시대</label>
                <FilterSelect value={eraFilter} onChange={setEraFilter} options={eraList} labelMap={eraLabels} />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">국가</label>
                <FilterSelect value={countryFilter} onChange={setCountryFilter} options={allCountries as string[]} />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-2">용량</label>
                <FilterSelect value={installSizeFilter} onChange={setInstallSizeFilter} options={allInstallSizes as string[]} />
              </div>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary">게임 아카이브</h2>
                <span className="text-xs text-text-muted bg-vault-surface border border-vault-border px-2 py-0.5 rounded-full">
                  {filtered.length}개
                </span>
              </div>
              <Link href="/request?tab=game" className="text-xs px-3 py-1.5 bg-amber/10 text-amber font-bold border border-amber/30 rounded-lg hover:bg-amber/20 transition-colors">
                + 게임 추가 건의
              </Link>
              <Link href="/request/edit?tab=game" className="text-xs px-3 py-1.5 bg-vault-surface text-text-secondary font-bold border border-vault-border rounded-lg hover:text-text-primary transition-colors flex items-center gap-1">
                ✏️ 수정 건의
              </Link>
            </div>
            <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
              showFilters || hasFilters
                ? 'bg-mint/10 text-mint border-mint/30'
                : 'bg-vault-surface text-text-secondary border-vault-border hover:border-vault-border-light'
            }`}
          >
            <Filter size={12} />
            필터
            {hasFilters && (
              <button onClick={e => { e.stopPropagation(); clearFilters(); }} className="ml-0.5 cursor-pointer">
                <X size={10} />
              </button>
            )}
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="bg-vault-surface border border-vault-border rounded-lg px-2 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-mint/50 cursor-pointer"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* View mode */}
          <div className="flex bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-text-secondary'}`}
              title="그리드 뷰"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-text-secondary'}`}
              title="리스트 뷰"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>


      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
              <div className="w-full aspect-[3/4] skeleton" />
              <div className="p-2.5 space-y-1.5">
                <div className="h-3 skeleton rounded w-4/5" />
                <div className="h-2.5 skeleton rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-vault-surface border border-vault-border flex items-center justify-center mb-4">
            <Search className="text-text-muted" size={28} />
          </div>
          <h3 className="text-text-primary font-bold text-lg mb-1">검색 결과 없음</h3>
          <p className="text-text-muted text-sm mb-4">다른 키워드나 필터를 사용해보거나, 찾는 게임이 없다면 추가를 요청해보세요.</p>
          <div className="flex items-center justify-center gap-4">
            {hasFilters && (
              <button onClick={clearFilters} className="px-4 py-2 text-sm text-mint border border-mint/30 rounded-lg hover:bg-mint/10 cursor-pointer transition-colors">
                필터 초기화
              </button>
            )}
            <a href="/games/request" className="px-4 py-2 text-sm text-text-primary bg-neon-blue rounded-lg hover:bg-neon-blue-dim transition-colors flex items-center gap-2">
              게임 추가 요청하기
            </a>
          </div>
        </div>
      ) : (
        (() => {
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const paginatedGames = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {paginatedGames.map(game => (
                  <GameCard key={game.id} game={game} isOwned={isOwned(game.id)} onAddToCollection={onAddToCollection} onClick={onSelectGame} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedGames.map(game => (
                  <ListRow key={game.id} game={game} isOwned={isOwned(game.id)} onAddToCollection={onAddToCollection} onClick={onSelectGame} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-vault-surface border border-vault-border rounded-lg text-sm text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vault-surface-light transition-colors"
                >
                  이전
                </button>
                <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-md no-scrollbar">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    // Show current page, first, last, and +/- 2 pages around current
                    if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === p ? 'bg-mint text-vault-bg font-bold' : 'bg-vault-surface text-text-secondary border border-vault-border hover:border-mint/50'}`}
                        >
                          {p}
                        </button>
                      );
                    } else if (p === currentPage - 3 || p === currentPage + 3) {
                      return <span key={i} className="text-text-muted px-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-vault-surface border border-vault-border rounded-lg text-sm text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vault-surface-light transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </>
        );
      })()
      )}
        </main>
      </div>
    </div>
  );
}

function ListRow({ game, isOwned, onAddToCollection, onClick }: { game: Game; isOwned: boolean; onAddToCollection: (id: string) => void; onClick: (g: Game) => void }) {
  return (
    <div
      onClick={() => onClick(game)}
      className="flex items-center gap-3 px-4 py-3 bg-vault-surface border border-vault-border rounded-lg hover:border-vault-border-light hover:bg-vault-surface-light cursor-pointer transition-all group"
    >
      <div className="w-10 h-14 rounded shrink-0 overflow-hidden bg-vault-surface-light">
        <div className="w-full h-full flex items-center justify-center">
          <span className="font-pixel text-[5px] text-text-muted text-center px-1 break-words">{game.title.slice(0, 6)}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-mint transition-colors">{game.title}</h3>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-text-secondary">{game.platform}</span>
          <span className="text-xs text-text-muted">{game.releaseYear}</span>
          <span className="text-xs text-text-muted">{game.genre}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[9px] px-1.5 py-0.5 rounded hidden sm:inline`}>
          {game.rarity}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onAddToCollection(game.id); }}
          className={`p-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
            isOwned ? 'bg-mint/10 text-mint border-mint/30' : 'bg-vault-surface text-text-muted border-vault-border hover:text-mint hover:border-mint/20'
          }`}
        >
          {isOwned ? '보유' : '+ 추가'}
        </button>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options, labelMap, label }: any) {
  return (
    <div className="flex flex-col">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-vault-bg border border-vault-border rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-mint/50 cursor-pointer"
      >
        <option value="">전체 {label || ''}</option>
        {options.map((o: any) => (
          <option key={o} value={o}>
            {labelMap ? labelMap[o] || o : o}
          </option>
        ))}
      </select>
    </div>
  );
}

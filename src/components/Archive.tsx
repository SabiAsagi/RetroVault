import { useEffect, useMemo, useRef, useState } from 'react';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { Game, SortOption, Era } from '../types';
import { Filter, Search, X, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import MultiSelectFilter from './MultiSelectFilter';
import GameCard, { BoxArtPlaceholder } from './GameCard';

interface ArchiveProps {
  games: Game[];
  total: number;
  isLoading: boolean;
  searchQuery: string;
  isOwned: (gameId: string) => boolean;
  onAddToCollection: (gameId: string) => void;
  onSelectGame: (game: Game) => void;
  initialEra?: Era | null;
  onSearchChange?: (q: string) => void;
  onFetchGames: (params: {
    page: number;
    sort: string;
    search: string;
    platforms: string[];
    genres: string[];
    countries: string[];
    developers: string[];
  }) => void;
  filterOptions?: {
    platforms: string[];
    genres: string[];
    countries: string[];
    developers: string[];
  };
}

const genreLabels: Record<string, string> = {
  Action: '액션',
  Adventure: '어드벤처',
  RPG: '롤플레잉',
  Strategy: '전략',
  Simulation: '시뮬레이션',
  Sports: '스포츠',
  Racing: '레이싱',
  Fighting: '격투',
  Puzzle: '퍼즐',
  Shooter: '슈팅',
  Platformer: '플랫포머',
  액션: '액션',
  어드벤처: '어드벤처',
  롤플레잉: '롤플레잉',
  전략: '전략',
  시뮬레이션: '시뮬레이션',
  스포츠: '스포츠',
  레이싱: '레이싱',
  격투: '격투',
  퍼즐: '퍼즐',
  슈팅: '슈팅',
  플랫포머: '플랫포머',
};

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: '인기순' },
  { value: 'name-asc', label: '이름 A-Z' },
  { value: 'name-desc', label: '이름 Z-A' },
  { value: 'year-desc', label: '최신순' },
  { value: 'year-asc', label: '오래된순' },
  { value: 'rating', label: '평점순' },
];

type ViewMode = 'grid' | 'list';

export default function Archive({
  games,
  total,
  isLoading,
  searchQuery,
  isOwned,
  onAddToCollection,
  onSelectGame,
  onSearchChange,
  onFetchGames,
  filterOptions,
}: ArchiveProps) {
  const allPlatforms = useMemo(() => filterOptions?.platforms || [], [filterOptions]);
  const allGenres = useMemo(() => filterOptions?.genres || [], [filterOptions]);
  const allCountries = useMemo(() => filterOptions?.countries || [], [filterOptions]);
  const allDevelopers = useMemo(() => filterOptions?.developers || [], [filterOptions]);

  const [viewMode, setViewMode] = useSessionStorage<ViewMode>('archive-view', 'grid');
  const [showFilters, setShowFilters] = useSessionStorage('archive-filters-open', true);
  const [platformFilters, setPlatformFilters] = useSessionStorage<string[]>('archive-platforms', []);
  const [genreFilter, setGenreFilter] = useSessionStorage<string[]>('archive-genre', []);
  const [countryFilter, setCountryFilter] = useSessionStorage<string[]>('archive-country', []);
  const [developerFilter, setDeveloperFilter] = useSessionStorage<string[]>('archive-developer', []);
  const [sortBy, setSortBy] = useSessionStorage<SortOption>('archive-sort', 'popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const itemsPerPage = 30;

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, platformFilters, genreFilter, countryFilter, developerFilter, sortBy]);

  useEffect(() => {
    onFetchGames({
      page: currentPage,
      sort: sortBy,
      search: debouncedSearch,
      platforms: platformFilters,
      genres: genreFilter,
      countries: countryFilter,
      developers: developerFilter,
    });
  }, [currentPage, sortBy, debouncedSearch, platformFilters, genreFilter, countryFilter, developerFilter, onFetchGames]);

  const hasFilters = platformFilters.length > 0 || genreFilter.length > 0 || countryFilter.length > 0 || developerFilter.length > 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const clearFilters = () => {
    setPlatformFilters([]);
    setGenreFilter([]);
    setCountryFilter([]);
    setDeveloperFilter([]);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6">

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <aside className={`w-full md:w-64 shrink-0 bg-vault-surface border border-vault-border rounded-xl p-5 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h3 className="font-bold text-text-primary">카테고리</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="min-h-10 min-w-10 p-2 hover:bg-vault-surface-light rounded transition-colors text-text-muted hover:text-text-primary flex items-center justify-center"
              aria-label="필터 닫기"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <MultiSelectFilter label="플랫폼" values={platformFilters} onChange={setPlatformFilters} options={allPlatforms} />
            <MultiSelectFilter label="장르" values={genreFilter} onChange={setGenreFilter} options={allGenres} labelMap={genreLabels} />
            <MultiSelectFilter label="개발사" values={developerFilter} onChange={setDeveloperFilter} options={allDevelopers as string[]} />
            <MultiSelectFilter label="국가" values={countryFilter} onChange={setCountryFilter} options={allCountries as string[]} />

            {hasFilters && (
              <button onClick={clearFilters} className="w-full min-h-11 text-xs px-3 py-2.5 border border-vault-border rounded hover:bg-coral/10 hover:text-coral hover:border-coral/30 transition-colors font-bold mt-4">
                초기화
              </button>
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-text-primary whitespace-nowrap">게임 아카이브</h2>
                <span className="text-xs text-text-muted bg-vault-surface border border-vault-border px-2 py-0.5 rounded-full">
                  {total}개
                </span>
              </div>
              <Link href="/request?tab=game" className="min-h-10 inline-flex items-center text-xs px-3 py-2 bg-amber/10 text-amber font-bold border border-amber/30 rounded-lg hover:bg-amber/20 transition-colors whitespace-nowrap">
                + 추가 건의
              </Link>
              <Link href="/request/edit?tab=game" className="min-h-10 inline-flex items-center text-xs px-3 py-2 bg-vault-surface text-text-secondary font-bold border border-vault-border rounded-lg hover:text-text-primary transition-colors gap-1 whitespace-nowrap">
                정보 수정 건의
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex md:hidden items-center gap-1.5 min-h-11 px-3 py-2 rounded-lg text-xs border transition-all cursor-pointer ${
                  showFilters || hasFilters
                    ? 'bg-mint/10 text-mint border-mint/30'
                    : 'bg-vault-surface text-text-secondary border-vault-border hover:border-vault-border-light'
                }`}
              >
                <Filter size={14} />
                카테고리
                {hasFilters && (
                  <span onClick={(e) => { e.stopPropagation(); clearFilters(); }} className="ml-0.5 -mr-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-coral/10 hover:text-coral transition-colors">
                    <X size={10} />
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="min-h-11 flex-1 sm:flex-none bg-vault-surface border border-vault-border rounded-lg px-3 py-2 text-xs text-text-secondary focus:outline-none focus:border-mint/50 cursor-pointer"
                aria-label="정렬 방식"
              >
                {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>

              <div className="flex min-h-11 bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`min-h-11 min-w-11 p-2 transition-colors cursor-pointer flex items-center justify-center ${viewMode === 'grid' ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-text-secondary'}`}
                  title="그리드 보기"
                  aria-label="그리드 보기"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`min-h-11 min-w-11 p-2 transition-colors cursor-pointer flex items-center justify-center ${viewMode === 'list' ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-text-secondary'}`}
                  title="리스트 보기"
                  aria-label="리스트 보기"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
                  <div className="w-full aspect-[3/4] skeleton" />
                  <div className="p-2.5 space-y-1.5">
                    <div className="h-3 skeleton rounded w-4/5" />
                    <div className="h-2.5 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : games.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-vault-surface border border-vault-border flex items-center justify-center mb-4">
                <Search className="text-text-muted" size={28} />
              </div>
              <h3 className="text-text-primary font-bold text-lg mb-1">검색 결과 없음</h3>
              <p className="text-text-muted text-sm mb-4">다른 키워드나 필터를 사용해보거나, 찾는 게임이 없다면 추가를 요청해보세요.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {hasFilters && (
                  <button onClick={clearFilters} className="min-h-11 px-4 py-2.5 text-sm text-mint border border-mint/30 rounded-lg hover:bg-mint/10 cursor-pointer transition-colors">
                    필터 초기화
                  </button>
                )}
                <a href="/games/request" className="min-h-11 px-4 py-2.5 text-sm text-text-primary bg-neon-blue rounded-lg hover:bg-neon-blue-dim transition-colors flex items-center gap-2">
                  게임 추가 요청하기
                </a>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {games.map((game) => (
                    <GameCard key={game.id} game={game} isOwned={isOwned(game.id)} onAddToCollection={onAddToCollection} onClick={onSelectGame} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {games.map((game) => (
                    <ListRow key={game.id} game={game} isOwned={isOwned(game.id)} onAddToCollection={onAddToCollection} onClick={onSelectGame} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="min-h-11 px-4 py-2.5 bg-vault-surface border border-vault-border rounded-lg text-sm text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vault-surface-light transition-colors"
                  >
                    이전
                  </button>
                  <div className="flex items-center gap-1 overflow-x-auto max-w-[220px] sm:max-w-md no-scrollbar">
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`min-w-11 h-11 px-2 flex items-center justify-center rounded-lg text-sm transition-colors ${currentPage === page ? 'bg-mint text-vault-bg font-bold' : 'bg-vault-surface text-text-secondary border border-vault-border hover:border-mint/50'}`}
                          >
                            {page}
                          </button>
                        );
                      }
                      if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="text-text-muted px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="min-h-11 px-4 py-2.5 bg-vault-surface border border-vault-border rounded-lg text-sm text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vault-surface-light transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function ListRow({ game, isOwned, onAddToCollection, onClick }: { game: Game; isOwned: boolean; onAddToCollection: (id: string) => void; onClick: (game: Game) => void }) {
  return (
    <div
      onClick={() => onClick(game)}
      className="flex items-center gap-3 px-4 py-3 bg-vault-surface border border-vault-border rounded-lg hover:border-vault-border-light hover:bg-vault-surface-light cursor-pointer transition-all group"
    >
      <div className="w-10 h-14 rounded shrink-0 overflow-hidden bg-vault-surface-light">
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
        ) : (
          <BoxArtPlaceholder game={game} />
        )}
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
        <span className="text-[9px] px-1.5 py-0.5 rounded hidden sm:inline">
          {game.rarity}
        </span>
        <button
          onClick={(event) => { event.stopPropagation(); onAddToCollection(game.id); }}
          className={`min-h-10 px-3 py-2 rounded-lg text-xs border transition-all cursor-pointer ${
            isOwned ? 'bg-mint/10 text-mint border-mint/30' : 'bg-vault-surface text-text-muted border-vault-border hover:text-mint hover:border-mint/20'
          }`}
        >
          {isOwned ? '보유' : '+ 추가'}
        </button>
      </div>
    </div>
  );
}
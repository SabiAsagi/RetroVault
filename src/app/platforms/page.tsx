"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { useSearchParams } from "next/navigation";
import { Database, Calendar, Monitor, Filter, X, LayoutGrid, List, Search, Gamepad2, Eye } from "lucide-react";
import Link from "next/link";
import MultiSelectFilter from "@/components/MultiSelectFilter";

interface Platform {
  id: string;
  name: string;
  manufacturer: string;
  generation: number | null;
  releaseYear: number;
  type: string;
  imageUrl: string | null;
  description: string | null;
  launchPrice: string | null;
  totalSales: string | null;
  discontinued: boolean | null;
  views?: number;
  _count: { games: number };
  slug: string;
}

type SortOption = 'popularity' | 'name-asc' | 'name-desc' | 'year-desc' | 'year-asc' | 'games-desc';
type ViewMode = 'grid' | 'list';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: '인기도순' },
  { value: 'name-asc', label: '이름 A→Z' },
  { value: 'name-desc', label: '이름 Z→A' },
  { value: 'year-desc', label: '최신 출시연도순' },
  { value: 'year-asc', label: '과거 출시연도순' },
  { value: 'games-desc', label: '게임 수순' },
];

export default function PlatformsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div></div>}>
      <PlatformsContent />
    </Suspense>
  );
}

function PlatformsContent() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('q')?.trim() || '';

  const [viewMode, setViewMode] = useSessionStorage<ViewMode>('platforms-view', 'grid');
  const [showFilters, setShowFilters] = useSessionStorage('platforms-filters-open', false);
  const [manufacturerFilter, setManufacturerFilter] = useSessionStorage<string[]>('platforms-manufacturer', []);
  const [generationFilter, setGenerationFilter] = useSessionStorage<string[]>('platforms-gen', []);
  const [typeFilter, setTypeFilter] = useSessionStorage<string[]>('platforms-type', []);
  const [sortBy, setSortBy] = useSessionStorage<SortOption>('platforms-sort', 'popularity');
  const [activeManufacturerTab, setActiveManufacturerTab] = useSessionStorage('platforms-tab', '');
  const [currentPage, setCurrentPage] = useSessionStorage('platforms-page', 1);
  const itemsPerPage = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [manufacturerFilter, generationFilter, typeFilter, sortBy, activeManufacturerTab, setCurrentPage]);

  useEffect(() => {
    fetch('/api/platforms-list')
      .then(res => res.json())
      .then(data => { setPlatforms(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allManufacturers = useMemo(() => [...new Set(platforms.map(p => p.manufacturer))].filter(Boolean).sort(), [platforms]);
  const allGenerations = useMemo(() => [...new Set(platforms.map(p => p.generation).filter(g => g !== null))].sort((a, b) => (a as number) - (b as number)) as number[], [platforms]);
  const allTypes = useMemo(() => [...new Set(platforms.map(p => p.type))].filter(Boolean).sort(), [platforms]);

  const filtered = useMemo(() => {
    let result = [...platforms];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.manufacturer?.toLowerCase().includes(q));
    }
    if (activeManufacturerTab) result = result.filter(p => p.manufacturer === activeManufacturerTab);
    if (manufacturerFilter.length > 0) result = result.filter(p => manufacturerFilter.includes(p.manufacturer));
    if (generationFilter.length > 0) result = result.filter(p => generationFilter.includes(String(p.generation)));
    if (typeFilter.length > 0) result = result.filter(p => typeFilter.includes(p.type));

    switch (sortBy) {
      case 'popularity': 
        result.sort((a, b) => {
          const viewDiff = (b.views || 0) - (a.views || 0);
          if (viewDiff !== 0) return viewDiff;
          return (b._count?.games || 0) - (a._count?.games || 0);
        }); break;
      case 'year-asc': result.sort((a, b) => a.releaseYear - b.releaseYear); break;
      case 'year-desc': result.sort((a, b) => b.releaseYear - a.releaseYear); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'games-desc': result.sort((a, b) => b._count.games - a._count.games); break;
    }
    return result;
  }, [platforms, activeManufacturerTab, manufacturerFilter, generationFilter, typeFilter, sortBy, searchQuery]);

  const hasFilters = manufacturerFilter.length > 0 || generationFilter.length > 0 || typeFilter.length > 0 || activeManufacturerTab;
  const clearFilters = () => { setManufacturerFilter([]); setGenerationFilter([]); setTypeFilter([]); setActiveManufacturerTab(''); };

  // Manufacturer tabs (top 8 by platform count)
  const manufacturerTabs = useMemo(() => {
    const counts = allManufacturers.map(m => ({ name: m, count: platforms.filter(p => p.manufacturer === m).length }));
    return counts.sort((a, b) => b.count - a.count).slice(0, 8);
  }, [allManufacturers, platforms]);

  const typeLabels: Record<string, string> = { HOME: '가정용', HANDHELD: '휴대용', HYBRID: '하이브리드', ARCADE: '아케이드', PC: 'PC' };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 page-enter">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Sidebar Filters */}
        <aside className={`w-full md:w-64 shrink-0 bg-vault-surface border border-vault-border rounded-xl p-5 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h3 className="font-bold text-text-primary">카테고리</h3>
            <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-vault-surface-light rounded transition-colors text-text-muted hover:text-text-primary">
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-6">
            <MultiSelectFilter label="제조사" values={manufacturerFilter} onChange={setManufacturerFilter} options={allManufacturers} />
            <MultiSelectFilter label="세대" values={generationFilter} onChange={setGenerationFilter} options={allGenerations.map(String)} labelMap={Object.fromEntries(allGenerations.map(g => [String(g), `${g}세대`]))} />
            <MultiSelectFilter label="타입" values={typeFilter} onChange={setTypeFilter} options={allTypes} labelMap={typeLabels} />
            
            {hasFilters && (
              <button onClick={clearFilters} className="w-full text-xs px-3 py-2 border border-vault-border rounded hover:bg-coral/10 hover:text-coral hover:border-coral/30 transition-colors font-bold mt-4 cursor-pointer">
                초기화
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-text-primary whitespace-nowrap">콘솔/플랫폼 아카이브</h2>
              <span className="text-xs text-text-muted bg-vault-surface border border-vault-border px-2 py-0.5 rounded-full">
                {filtered.length}개
              </span>
            </div>
            <Link href="/request?tab=platform" className="text-xs px-3 py-1.5 bg-neon-purple/10 text-neon-purple font-bold border border-neon-purple/30 rounded-lg hover:bg-neon-purple/20 transition-colors whitespace-nowrap">
              + 추가 건의
            </Link>
            <Link href="/request/edit?tab=platform" className="text-xs px-3 py-1.5 bg-vault-surface text-text-secondary font-bold border border-vault-border rounded-lg hover:text-text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
              ✏️ 수정 건의
            </Link>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
              showFilters || hasFilters ? 'bg-neon-purple/10 text-neon-purple border-neon-purple/30' : 'bg-vault-surface text-text-secondary border-vault-border hover:border-vault-border-light'
            }`}
          >
            <Filter size={12} />
            카테고리
            {hasFilters && (
              <button onClick={e => { e.stopPropagation(); clearFilters(); }} className="ml-0.5 cursor-pointer">
                <X size={10} />
              </button>
            )}
          </button>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="bg-vault-surface border border-vault-border rounded-lg px-2 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-neon-purple/50 cursor-pointer"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-neon-purple/10 text-neon-purple' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-neon-purple/10 text-neon-purple' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <List size={14} />
            </button>
          </div>
          </div>
        </div>
      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
              <div className="w-full aspect-[4/3] skeleton" />
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
          <p className="text-text-muted text-sm mb-4">다른 키워드나 필터를 사용해보세요.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="px-4 py-2 text-sm text-neon-purple border border-neon-purple/30 rounded-lg hover:bg-neon-purple/10 cursor-pointer transition-colors">
              필터 초기화
            </button>
          )}
        </div>
      ) : (() => {
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const paginatedPlatforms = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {paginatedPlatforms.map(p => (
                  <PlatformCard key={p.id} platform={p} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedPlatforms.map(p => (
                  <PlatformListRow key={p.id} platform={p} />
                ))}
              </div>
            )}
            
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-vault-surface border border-vault-border rounded-lg text-sm text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vault-surface-light transition-colors cursor-pointer"
                >
                  이전
                </button>
                <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-md no-scrollbar">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)) {
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer ${currentPage === p ? 'bg-neon-purple text-vault-bg font-bold' : 'bg-vault-surface text-text-secondary border border-vault-border hover:border-neon-purple/50'}`}
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
                  className="px-4 py-2 bg-vault-surface border border-vault-border rounded-lg text-sm text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vault-surface-light transition-colors cursor-pointer"
                >
                  다음
                </button>
              </div>
            )}
          </>
        );
      })()}
        </main>
      </div>
    </div>
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  const [imgError, setImgError] = useState(false);
  return (
    <Link href={`/platforms/${platform.slug}`} className="block group">
      <div className="game-card bg-vault-surface border border-vault-border rounded-lg overflow-hidden cursor-pointer">
        <div className="platform-card__visual rounded-t-lg">
          {!imgError && platform.imageUrl ? (
            <div className="w-full aspect-[4/3] flex items-center justify-center p-4">
              <img 
                src={platform.imageUrl} 
                alt={platform.name} 
                className="max-w-full max-h-full object-contain platform-card__logo" 
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] flex items-center justify-center">
              <Monitor size={32} className="text-neon-purple/40 platform-card__logo" />
            </div>
          )}
          <div className="absolute top-2 left-2 platform-card__badges">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
              {platform.type === 'HOME' ? '가정용' : platform.type === 'HANDHELD' ? '휴대용' : platform.type}
            </span>
          </div>
          {platform.generation && (
            <div className="absolute top-2 right-2 platform-card__badges">
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-vault-bg/80 text-text-secondary border border-vault-border">
                {platform.generation}세대
              </span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 right-2 platform-card__title">
            <p className="text-xs font-bold text-text-primary truncate group-hover:text-neon-purple transition-colors">{platform.name}</p>
            <p className="text-[10px] text-text-secondary truncate platform-card__manufacturer">{platform.manufacturer}</p>
          </div>
        </div>
        <div className="p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">{platform.releaseYear}년</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Gamepad2 size={10} className="text-neon-purple" />
                <span className="text-[10px] font-bold text-text-secondary">{platform._count.games}개</span>
              </div>
              <div className="flex items-center gap-1 bg-vault-surface-light px-1.5 py-0.5 rounded border border-vault-border">
                <Eye size={10} className="text-text-muted" />
                <span className="text-[10px] font-bold text-text-secondary">{platform.views ?? 0}</span>
              </div>
            </div>
          </div>
          {platform.discontinued !== null && (
            <div className="mt-1">
              <span className={`text-[9px] ${platform.discontinued ? 'text-coral' : 'text-mint'}`}>
                {platform.discontinued ? '단종' : '현역'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function PlatformListRow({ platform }: { platform: Platform }) {
  const [imgError, setImgError] = useState(false);
  return (
    <Link href={`/platforms/${platform.slug}`} className="block group">
      <div className="flex items-center gap-3 px-4 py-3 bg-vault-surface border border-vault-border rounded-lg hover:border-vault-border-light hover:bg-vault-surface-light cursor-pointer transition-all">
        <div className="w-10 h-10 rounded shrink-0 overflow-hidden flex items-center justify-center" style={{ background: 'var(--platform-logo-bg)' }}>
          {!imgError && platform.imageUrl ? (
            <img 
              src={platform.imageUrl} 
              alt={platform.name} 
              className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500 platform-card__logo" 
              onError={() => setImgError(true)}
            />
          ) : (
            <Monitor size={16} className="text-text-muted platform-card__logo" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-neon-purple transition-colors">{platform.name}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-text-secondary">{platform.manufacturer}</span>
            <span className="text-xs text-text-muted">{platform.releaseYear}년</span>
            {platform.generation && <span className="text-xs text-text-muted">{platform.generation}세대</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-vault-surface-light px-1.5 py-0.5 rounded border border-vault-border">
            <Eye size={10} className="text-text-muted" />
            <span className="text-[10px] font-bold text-text-secondary">{platform.views ?? 0}</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
            {platform._count.games}게임
          </span>
        </div>
      </div>
    </Link>
  );
}

function FilterSelect({ label, value, onChange, options, labelMap }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; labelMap?: Record<string, string>;
}) {
  return (
    <div>
      <label className="text-[10px] text-text-muted block mb-1 font-medium">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-vault-bg border border-vault-border rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-neon-purple/50 cursor-pointer"
      >
        <option value="">전체</option>
        {options.map(o => (
          <option key={o} value={o}>{labelMap ? (labelMap[o] ?? o) : o}</option>
        ))}
      </select>
    </div>
  );
}

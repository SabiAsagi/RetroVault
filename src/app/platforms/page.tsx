"use client";
import { useState, useMemo, useEffect } from "react";
import { Database, Calendar, Monitor, Filter, X, LayoutGrid, List, Search, Gamepad2 } from "lucide-react";
import Link from "next/link";

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
  _count: { games: number };
  slug: string;
}

type SortOption = 'year-asc' | 'year-desc' | 'name-asc' | 'name-desc' | 'games-desc';
type ViewMode = 'grid' | 'list';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'year-asc', label: '출시연도 ↑' },
  { value: 'year-desc', label: '출시연도 ↓' },
  { value: 'name-asc', label: '이름 A→Z' },
  { value: 'name-desc', label: '이름 Z→A' },
  { value: 'games-desc', label: '게임 수순' },
];

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [generationFilter, setGenerationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('year-asc');
  const [activeManufacturerTab, setActiveManufacturerTab] = useState('');

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
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.manufacturer.toLowerCase().includes(q));
    }
    if (activeManufacturerTab) result = result.filter(p => p.manufacturer === activeManufacturerTab);
    if (manufacturerFilter) result = result.filter(p => p.manufacturer === manufacturerFilter);
    if (generationFilter) result = result.filter(p => String(p.generation) === generationFilter);
    if (typeFilter) result = result.filter(p => p.type === typeFilter);

    switch (sortBy) {
      case 'year-asc': result.sort((a, b) => a.releaseYear - b.releaseYear); break;
      case 'year-desc': result.sort((a, b) => b.releaseYear - a.releaseYear); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'games-desc': result.sort((a, b) => b._count.games - a._count.games); break;
    }
    return result;
  }, [platforms, searchQuery, activeManufacturerTab, manufacturerFilter, generationFilter, typeFilter, sortBy]);

  const hasFilters = manufacturerFilter || generationFilter || typeFilter || activeManufacturerTab;
  const clearFilters = () => { setManufacturerFilter(''); setGenerationFilter(''); setTypeFilter(''); setActiveManufacturerTab(''); };

  // Manufacturer tabs (top 8 by platform count)
  const manufacturerTabs = useMemo(() => {
    const counts = allManufacturers.map(m => ({ name: m, count: platforms.filter(p => p.manufacturer === m).length }));
    return counts.sort((a, b) => b.count - a.count).slice(0, 8);
  }, [allManufacturers, platforms]);

  const typeLabels: Record<string, string> = { HOME: '가정용', HANDHELD: '휴대용', HYBRID: '하이브리드', ARCADE: '아케이드', PC: 'PC' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 page-enter">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="콘솔 검색..."
          className="w-full max-w-md bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-neon-purple"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text-primary">콘솔 아카이브</h2>
            <span className="text-xs text-text-muted bg-vault-surface border border-vault-border px-2 py-0.5 rounded-full">
              {filtered.length}개
            </span>
          </div>
          <Link href="/request" className="text-xs px-3 py-1.5 bg-neon-purple/10 text-neon-purple font-bold border border-neon-purple/30 rounded-lg hover:bg-neon-purple/20 transition-colors">
            + 콘솔 추가 건의
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
              showFilters || hasFilters ? 'bg-neon-purple/10 text-neon-purple border-neon-purple/30' : 'bg-vault-surface text-text-secondary border-vault-border hover:border-vault-border-light'
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

      {/* Manufacturer Quick Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        <button
          onClick={() => setActiveManufacturerTab('')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer ${
            !activeManufacturerTab ? 'bg-neon-purple/10 text-neon-purple border-neon-purple/30 font-medium' : 'bg-vault-surface text-text-muted border-vault-border hover:border-vault-border-light'
          }`}
        >
          <Monitor size={11} />
          전체 ({platforms.length})
        </button>
        {manufacturerTabs.map(m => (
          <button
            key={m.name}
            onClick={() => setActiveManufacturerTab(prev => prev === m.name ? '' : m.name)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer whitespace-nowrap ${
              activeManufacturerTab === m.name
                ? 'bg-neon-blue/10 text-neon-blue border-neon-blue/30 font-medium'
                : 'bg-vault-surface text-text-muted border-vault-border hover:border-vault-border-light'
            }`}
          >
            {m.name} ({m.count})
          </button>
        ))}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-vault-surface border border-vault-border rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <FilterSelect label="제조사" value={manufacturerFilter} onChange={setManufacturerFilter} options={allManufacturers} />
            <FilterSelect label="세대" value={generationFilter} onChange={setGenerationFilter} options={allGenerations.map(String)} labelMap={Object.fromEntries(allGenerations.map(g => [String(g), `${g}세대`]))} />
            <FilterSelect label="타입" value={typeFilter} onChange={setTypeFilter} options={allTypes} labelMap={typeLabels} />
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
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
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(p => (
            <PlatformCard key={p.id} platform={p} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <PlatformListRow key={p.id} platform={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlatformCard({ platform }: { platform: Platform }) {
  return (
    <Link href={`/platforms/${platform.slug}`} className="block group">
      <div className="game-card bg-vault-surface border border-vault-border rounded-lg overflow-hidden cursor-pointer">
        <div className="relative">
          {platform.imageUrl ? (
            <img src={platform.imageUrl} alt={platform.name} className="w-full aspect-[4/3] object-cover" />
          ) : (
            <div className="w-full aspect-[4/3] bg-vault-surface-light flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #2a1a4e 0%, #1a1a3e 100%)' }}>
              <Monitor size={32} className="text-neon-purple/40" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
              {platform.type === 'HOME' ? '가정용' : platform.type === 'HANDHELD' ? '휴대용' : platform.type}
            </span>
          </div>
          {platform.generation && (
            <div className="absolute top-2 right-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-vault-bg/80 text-text-secondary border border-vault-border">
                {platform.generation}세대
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-vault-bg/90 to-transparent opacity-80" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-xs font-bold text-text-primary truncate group-hover:text-neon-purple transition-colors">{platform.name}</p>
            <p className="text-[10px] text-text-secondary truncate">{platform.manufacturer}</p>
          </div>
        </div>
        <div className="p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">{platform.releaseYear}년</span>
            <div className="flex items-center gap-1">
              <Gamepad2 size={10} className="text-neon-purple" />
              <span className="text-[10px] font-bold text-text-secondary">{platform._count.games}개</span>
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
  return (
    <Link href={`/platforms/${platform.slug}`} className="block group">
      <div className="flex items-center gap-3 px-4 py-3 bg-vault-surface border border-vault-border rounded-lg hover:border-vault-border-light hover:bg-vault-surface-light cursor-pointer transition-all">
        <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-vault-surface-light flex items-center justify-center">
          {platform.imageUrl ? (
            <img src={platform.imageUrl} alt={platform.name} className="w-full h-full object-cover" />
          ) : (
            <Monitor size={16} className="text-text-muted" />
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

"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { useSearchParams } from "next/navigation";
import { DirectoryHeading, DirectoryFilters, DirectoryTabs, DirectoryToolbar, DirectoryResults } from '@/components/DirectoryUI';
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
  const routeQuery = searchParams?.get('q')?.trim() || '';
  const [searchQuery, setSearchQuery] = useState(routeQuery);
  useEffect(() => { setSearchQuery(routeQuery); }, [routeQuery]);
  const [loadError, setLoadError] = useState(false);

  const [viewMode, setViewMode] = useSessionStorage<ViewMode>('platforms-view', 'grid');
  const [showFilters, setShowFilters] = useSessionStorage('platforms-filters-open', false);
  const [manufacturerFilter, setManufacturerFilter] = useSessionStorage<string[]>('platforms-manufacturer', []);
  const [generationFilter, setGenerationFilter] = useSessionStorage<string[]>('platforms-gen', []);
  const [typeFilter, setTypeFilter] = useSessionStorage<string[]>('platforms-type', []);
  const [sortBy, setSortBy] = useSessionStorage<SortOption>('platforms-sort', 'popularity');
  const [activeManufacturerTab, setActiveManufacturerTab] = useSessionStorage('platforms-tab', '');
  const [currentPage, setCurrentPage] = useSessionStorage('platforms-page', 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [manufacturerFilter, generationFilter, typeFilter, sortBy, activeManufacturerTab, setCurrentPage, searchQuery]);

  useEffect(() => {
    fetch('/api/platforms-list')
      .then(res => { if (!res.ok) throw new Error('Load failed'); return res.json(); })
      .then(data => { setPlatforms(data); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
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

  return <div className="directory-shell page-enter">
    <DirectoryHeading kind="platform" total={platforms.length} loading={loading} query={searchQuery} onQuery={setSearchQuery} />
    <DirectoryTabs value={activeManufacturerTab} onChange={setActiveManufacturerTab} tabs={[{ value: '', label: '전체 기기' }, ...manufacturerTabs.map(m => ({ value: m.name, label: m.name }))]} />
    <div className="directory-layout">
      <DirectoryFilters open={showFilters} onClose={() => setShowFilters(false)} active={!!hasFilters} onClear={clearFilters}>
        <MultiSelectFilter label="제조사" values={manufacturerFilter} onChange={setManufacturerFilter} options={allManufacturers} />
        <MultiSelectFilter label="세대" values={generationFilter} onChange={setGenerationFilter} options={allGenerations.map(String)} labelMap={Object.fromEntries(allGenerations.map(g => [String(g), `${g}세대`]))} />
        <MultiSelectFilter label="기종" values={typeFilter} onChange={setTypeFilter} options={allTypes} labelMap={typeLabels} />
      </DirectoryFilters>
      <main className="directory-main">
        <DirectoryToolbar count={filtered.length} loading={loading} view={viewMode} onView={setViewMode} sort={sortBy} onSort={v => setSortBy(v as SortOption)} options={sortOptions} filtersOpen={showFilters} onFilters={() => setShowFilters(!showFilters)} />
        <DirectoryResults kind="platform" view={viewMode} loading={loading} error={loadError} page={currentPage} onPage={setCurrentPage} onReset={() => { clearFilters(); setSearchQuery(''); }} items={filtered.map(p => ({ id: p.id, name: p.name, href: `/platforms/${p.slug}`, image: p.imageUrl, category: typeLabels[p.type] || p.type, meta: p.manufacturer || '제조사 정보 확인 중', facts: [p.releaseYear ? `${p.releaseYear}년 출시` : '출시 연도 확인 중', p.generation ? `${p.generation}세대` : ''].filter(Boolean).join(' · '), games: `등록된 게임 ${p._count.games.toLocaleString('ko-KR')}개`, status: p.discontinued === true ? '단종' : p.discontinued === false ? '생산 중' : null }))} />
      </main>
    </div>
  </div>;
}

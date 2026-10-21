"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { useSearchParams } from "next/navigation";
import { archiveCountryLabels } from '@/lib/archive-labels';
import { DirectoryHeading, DirectoryFilters, DirectoryTabs, DirectoryToolbar, DirectoryResults } from '@/components/DirectoryUI';
import MultiSelectFilter from "@/components/MultiSelectFilter";

interface Company {
  id: string;
  name: string;
  type: string;
  country: string | null;
  logoUrl: string | null;
  description: string | null;
  foundedAt: string | null;
  companyStatus: string | null;
  flagshipFranchises: string | null;
  keyFigures: string | null;
  views?: number;
  _count: { developedGames: number; publishedGames: number };
  slug: string;
}

type SortOption = 'popularity' | 'name-asc' | 'name-desc' | 'founded-desc' | 'founded-asc' | 'games-desc';
type ViewMode = 'grid' | 'list';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: '인기도순' },
  { value: 'name-asc', label: '이름 A→Z' },
  { value: 'name-desc', label: '이름 Z→A' },
  { value: 'founded-desc', label: '최신 설립연도순' },
  { value: 'founded-asc', label: '과거 설립연도순' },
  { value: 'games-desc', label: '게임 수순' },
];

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-amber border-t-transparent rounded-full animate-spin"></div></div>}>
      <CompaniesContent />
    </Suspense>
  );
}

function CompaniesContent() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const routeQuery = searchParams?.get('q')?.trim() || '';
  const [searchQuery, setSearchQuery] = useSessionStorage('companies-search', routeQuery);
  useEffect(() => { if (searchParams?.has('q')) setSearchQuery(routeQuery); }, [routeQuery, searchParams, setSearchQuery]);
  const [loadError, setLoadError] = useState(false);

  const [viewMode, setViewMode] = useSessionStorage<ViewMode>('companies-view', 'grid');
  const [showFilters, setShowFilters] = useSessionStorage('companies-filters-open', false);
  const [typeFilter, setTypeFilter] = useSessionStorage<string[]>('companies-type', []);
  const [countryFilter, setCountryFilter] = useSessionStorage<string[]>('companies-country', []);
  const [statusFilter, setStatusFilter] = useSessionStorage<string[]>('companies-status', []);
  const [sortBy, setSortBy] = useSessionStorage<SortOption>('companies-sort', 'popularity');
  const [activeTypeTab, setActiveTypeTab] = useSessionStorage('companies-tab', '');

  useEffect(() => {
    fetch('/api/companies-list')
      .then(res => { if (!res.ok) throw new Error('Load failed'); return res.json(); })
      .then(data => { setCompanies(data); setLoading(false); })
      .catch(() => { setLoadError(true); setLoading(false); });
  }, []);

  const allTypes = useMemo(() => [...new Set(companies.map(c => c.type))].filter(Boolean).sort(), [companies]);
  const allCountries = useMemo(() => [...new Set(companies.map(c => c.country).filter(Boolean))].sort() as string[], [companies]);
  const allStatuses = useMemo(() => [...new Set(companies.map(c => c.companyStatus).filter(Boolean))].sort() as string[], [companies]);
  const [currentPage, setCurrentPage] = useSessionStorage('companies-page', 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTypeTab, typeFilter, countryFilter, statusFilter, sortBy, setCurrentPage, searchQuery]);

  const devCount = useMemo(() => companies.filter(c => c.type === 'DEVELOPER' || c.type === 'BOTH').length, [companies]);
  const pubCount = useMemo(() => companies.filter(c => c.type === 'PUBLISHER' || c.type === 'BOTH').length, [companies]);

  const filtered = useMemo(() => {
    let result = [...companies];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.country?.toLowerCase().includes(q) || (archiveCountryLabels[c.country || ''] || '').includes(q));
    }
    if (activeTypeTab === 'DEVELOPER') result = result.filter(c => c.type === 'DEVELOPER' || c.type === 'BOTH');
    if (activeTypeTab === 'PUBLISHER') result = result.filter(c => c.type === 'PUBLISHER' || c.type === 'BOTH');
    if (typeFilter.length > 0) result = result.filter(c => typeFilter.includes(c.type));
    if (countryFilter.length > 0) result = result.filter(c => countryFilter.includes(c.country || ''));
    if (statusFilter.length > 0) result = result.filter(c => statusFilter.includes(c.companyStatus || ''));

    switch (sortBy) {
      case 'popularity': 
        result.sort((a, b) => {
          const viewDiff = (b.views || 0) - (a.views || 0);
          if (viewDiff !== 0) return viewDiff;
          return (b._count?.developedGames || 0) + (b._count?.publishedGames || 0) - ((a._count?.developedGames || 0) + (a._count?.publishedGames || 0));
        }); break;
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'games-desc': result.sort((a, b) => (b._count.developedGames + b._count.publishedGames) - (a._count.developedGames + a._count.publishedGames)); break;
      case 'founded-desc': result.sort((a, b) => (b.foundedAt || '0000').localeCompare(a.foundedAt || '0000')); break;
      case 'founded-asc': result.sort((a, b) => (a.foundedAt || '9999').localeCompare(b.foundedAt || '9999')); break;
    }
    return result;
  }, [companies, activeTypeTab, typeFilter, countryFilter, statusFilter, sortBy, searchQuery]);


  const hasFilters = typeFilter.length > 0 || countryFilter.length > 0 || statusFilter.length > 0 || !!activeTypeTab;
  const clearFilters = () => { setTypeFilter([]); setCountryFilter([]); setStatusFilter([]); setActiveTypeTab(''); };

  const typeLabels: Record<string, string> = { DEVELOPER: '개발사', PUBLISHER: '유통사', BOTH: '개발/유통' };

  const statusLabels: Record<string, string> = { ACTIVE: "운영 중", DEFUNCT: "운영 종료", ACQUIRED: "인수·합병", MERGED: "합병" };
  return <div className="directory-shell page-enter">
    <DirectoryHeading kind="company" total={companies.length} loading={loading} query={searchQuery} onQuery={setSearchQuery} />
    <DirectoryTabs value={activeTypeTab} onChange={setActiveTypeTab} tabs={[{ value: '', label: '전체 제작사' }, { value: 'DEVELOPER', label: `개발사 ${devCount.toLocaleString('ko-KR')}` }, { value: 'PUBLISHER', label: `유통사 ${pubCount.toLocaleString('ko-KR')}` }]} />
    <div className="directory-layout">
      <DirectoryFilters open={showFilters} onClose={() => setShowFilters(false)} active={hasFilters} onClear={clearFilters}>
        <MultiSelectFilter label="역할" values={typeFilter} onChange={setTypeFilter} options={allTypes} labelMap={typeLabels} />
        <MultiSelectFilter label="국가" values={countryFilter} onChange={setCountryFilter} options={allCountries} labelMap={archiveCountryLabels} />
        <MultiSelectFilter label="운영 상태" values={statusFilter} onChange={setStatusFilter} options={allStatuses} labelMap={statusLabels} />
      </DirectoryFilters>
      <main className="directory-main">
        <DirectoryToolbar count={filtered.length} loading={loading} view={viewMode} onView={setViewMode} sort={sortBy} onSort={v => setSortBy(v as SortOption)} options={sortOptions} filtersOpen={showFilters} onFilters={() => setShowFilters(!showFilters)} />
        <DirectoryResults kind="company" view={viewMode} loading={loading} error={loadError} page={currentPage} onPage={setCurrentPage} onReset={() => { clearFilters(); setSearchQuery(''); }} items={filtered.map(c => ({ id: c.id, name: c.name, href: `/companies/${c.slug}`, image: c.logoUrl, category: typeLabels[c.type] || c.type, meta: archiveCountryLabels[c.country || ''] || c.country || '국가 정보 확인 중', facts: c.foundedAt ? `${c.foundedAt.substring(0,4)}년 설립` : '설립 연도 확인 중', games: `개발 ${c._count.developedGames.toLocaleString('ko-KR')} · 유통 ${c._count.publishedGames.toLocaleString('ko-KR')}`, status: c.companyStatus ? statusLabels[c.companyStatus] || c.companyStatus : null }))} />
      </main>
    </div>
  </div>;
}

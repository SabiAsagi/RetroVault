"use client";
import { useState, useMemo, useEffect } from "react";
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { Building2, Filter, X, LayoutGrid, List, Search, Gamepad2, Eye } from 'lucide-react';
import Link from "next/link";
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useSessionStorage("companies-search", "");

  const [viewMode, setViewMode] = useSessionStorage<ViewMode>('companies-view', 'grid');
  const [showFilters, setShowFilters] = useSessionStorage('companies-filters-open', false);
  const [typeFilter, setTypeFilter] = useSessionStorage<string[]>('companies-type', []);
  const [countryFilter, setCountryFilter] = useSessionStorage<string[]>('companies-country', []);
  const [statusFilter, setStatusFilter] = useSessionStorage<string[]>('companies-status', []);
  const [sortBy, setSortBy] = useSessionStorage<SortOption>('companies-sort', 'popularity');
  const [activeTypeTab, setActiveTypeTab] = useSessionStorage('companies-tab', '');

  useEffect(() => {
    fetch('/api/companies-list')
      .then(res => res.json())
      .then(data => { setCompanies(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allTypes = useMemo(() => [...new Set(companies.map(c => c.type))].filter(Boolean).sort(), [companies]);
  const allCountries = useMemo(() => [...new Set(companies.map(c => c.country).filter(Boolean))].sort() as string[], [companies]);
  const allStatuses = useMemo(() => [...new Set(companies.map(c => c.companyStatus).filter(Boolean))].sort() as string[], [companies]);
  const [currentPage, setCurrentPage] = useSessionStorage('companies-page', 1);
  const itemsPerPage = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTypeTab, typeFilter, countryFilter, statusFilter, sortBy, setCurrentPage]);

  const devCount = useMemo(() => companies.filter(c => c.type === 'DEVELOPER' || c.type === 'BOTH').length, [companies]);
  const pubCount = useMemo(() => companies.filter(c => c.type === 'PUBLISHER' || c.type === 'BOTH').length, [companies]);

  const filtered = useMemo(() => {
    let result = [...companies];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.country || '').toLowerCase().includes(q) ||
        (c.flagshipFranchises || '').toLowerCase().includes(q)
      );
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
  }, [companies, searchQuery, activeTypeTab, typeFilter, countryFilter, statusFilter, sortBy]);


  const hasFilters = typeFilter.length > 0 || countryFilter.length > 0 || statusFilter.length > 0;
  const clearFilters = () => { setTypeFilter([]); setCountryFilter([]); setStatusFilter([]); };

  const typeLabels: Record<string, string> = { DEVELOPER: '개발사', PUBLISHER: '유통사', BOTH: '개발/유통' };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 page-enter">
      {/* Search */}
      <div className="mb-6 flex justify-end">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="회사 검색..."
            className="w-full bg-vault-surface border border-vault-border rounded-xl px-10 py-3 text-text-primary focus:outline-none focus:border-amber transition-colors"
          />
        </div>
      </div>

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
            <MultiSelectFilter label="타입" values={typeFilter} onChange={setTypeFilter} options={allTypes} labelMap={typeLabels} />
            <MultiSelectFilter label="국가" values={countryFilter} onChange={setCountryFilter} options={allCountries} />
            <MultiSelectFilter label="상태" values={statusFilter} onChange={setStatusFilter} options={allStatuses} />
            
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
              <h2 className="text-lg font-bold text-text-primary whitespace-nowrap">게임 제작사 아카이브</h2>
              <span className="text-xs text-text-muted bg-vault-surface border border-vault-border px-2 py-0.5 rounded-full">
                {filtered.length}개
              </span>
            </div>
            <Link href="/request?tab=company" className="text-xs px-3 py-1.5 bg-amber/10 text-amber font-bold border border-amber/30 rounded-lg hover:bg-amber/20 transition-colors whitespace-nowrap">
              + 추가 건의
            </Link>
            <Link href="/request/edit?tab=company" className="text-xs px-3 py-1.5 bg-vault-surface text-text-secondary font-bold border border-vault-border rounded-lg hover:text-text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
              ✏️ 수정 건의
            </Link>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex md:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
              showFilters || hasFilters
                ? 'bg-amber/10 text-amber border-amber/30'
                : 'bg-vault-surface text-text-secondary border-vault-border hover:border-vault-border-light'
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
            className="bg-vault-surface border border-vault-border rounded-lg px-2 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-amber/50 cursor-pointer"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-amber/10 text-amber' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-amber/10 text-amber' : 'text-text-muted hover:text-text-secondary'}`}
            >
              <List size={14} />
            </button>
          </div>
          </div>
        </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-vault-surface border border-vault-border rounded-lg overflow-hidden">
              <div className="w-full aspect-square skeleton" />
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
            <button onClick={clearFilters} className="px-4 py-2 text-sm text-amber border border-amber/30 rounded-lg hover:bg-amber/10 cursor-pointer transition-colors">
              필터 초기화
            </button>
          )}
        </div>
      ) : (() => {
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const paginatedCompanies = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {paginatedCompanies.map(c => (
                  <CompanyCard key={c.id} company={c} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedCompanies.map(c => (
                  <CompanyListRow key={c.id} company={c} />
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
                          className={`min-w-[32px] h-8 px-2 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer ${currentPage === p ? 'bg-amber text-vault-bg font-bold' : 'bg-vault-surface text-text-secondary border border-vault-border hover:border-amber/50'}`}
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

function CompanyCard({ company }: { company: Company }) {
  const typeLabels: Record<string, string> = { DEVELOPER: '개발사', PUBLISHER: '유통사', BOTH: '개발/유통' };
  const totalGames = company._count.developedGames + company._count.publishedGames;

  return (
    <Link href={`/companies/${company.slug}`} className="block group">
      <div className="game-card bg-vault-surface border border-vault-border rounded-lg overflow-hidden cursor-pointer">
        <div className="relative">
          <div className="w-full aspect-square bg-vault-surface-light dark:bg-vault-surface flex items-center justify-center p-4">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
            ) : (
              <Building2 size={32} className="text-amber/40" />
            )}
          </div>
          <div className="absolute top-2 left-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber/20 text-amber border border-amber/30">
              {typeLabels[company.type] || company.type}
            </span>
          </div>
          {company.country && (
            <div className="absolute top-2 right-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-vault-bg/80 text-text-secondary border border-vault-border">
                {company.country}
              </span>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="text-xs font-semibold text-text-primary line-clamp-2 break-words h-8 group-hover:text-amber transition-colors leading-tight" title={company.name}>
            {company.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-text-muted">{company.foundedAt ? `${company.foundedAt.substring(0,4)}년 설립` : ''}</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Gamepad2 size={10} className="text-amber" />
                <span className="text-[10px] font-bold text-text-secondary">{totalGames}개</span>
              </div>
              <div className="flex items-center gap-1 bg-vault-surface-light px-1.5 py-0.5 rounded border border-vault-border">
                <Eye size={10} className="text-text-muted" />
                <span className="text-[10px] font-bold text-text-secondary">{company.views ?? 0}</span>
              </div>
            </div>
          </div>
          {company.companyStatus && (
            <div className="mt-1">
              <span className={`text-[9px] ${company.companyStatus === '운영 중' || company.companyStatus === '활동 중' ? 'text-mint' : 'text-text-muted'}`}>
                {company.companyStatus}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function CompanyListRow({ company }: { company: Company }) {
  const typeLabels: Record<string, string> = { DEVELOPER: '개발사', PUBLISHER: '유통사', BOTH: '개발/유통' };
  const totalGames = company._count.developedGames + company._count.publishedGames;

  return (
    <Link href={`/companies/${company.slug}`} className="block group">
      <div className="flex items-center gap-3 px-4 py-3 bg-vault-surface border border-vault-border rounded-lg hover:border-vault-border-light hover:bg-vault-surface-light cursor-pointer transition-all">
        <div className="w-10 h-10 rounded shrink-0 overflow-hidden bg-vault-surface-light flex items-center justify-center p-1">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
          ) : (
            <Building2 size={16} className="text-text-muted" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-amber transition-colors">{company.name}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-text-secondary">{typeLabels[company.type] || company.type}</span>
            {company.country && <span className="text-xs text-text-muted">{company.country}</span>}
            {company.foundedAt && <span className="text-xs text-text-muted">{company.foundedAt.substring(0,4)}년</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-vault-surface-light px-1.5 py-0.5 rounded border border-vault-border">
            <Eye size={10} className="text-text-muted" />
            <span className="text-[10px] font-bold text-text-secondary">{company.views ?? 0}</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber/10 text-amber border border-amber/20">
            {totalGames}게임
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
        className="w-full bg-vault-bg border border-vault-border rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-amber/50 cursor-pointer"
      >
        <option value="">전체</option>
        {options.map(o => (
          <option key={o} value={o}>{labelMap ? (labelMap[o] ?? o) : o}</option>
        ))}
      </select>
    </div>
  );
}

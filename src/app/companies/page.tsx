"use client";
import { useState, useMemo, useEffect } from "react";
import { Building2, Filter, X, LayoutGrid, List, Search, Gamepad2, Globe } from "lucide-react";
import Link from "next/link";

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
  _count: { developedGames: number; publishedGames: number };
  slug: string;
}

type SortOption = 'name-asc' | 'name-desc' | 'games-desc' | 'founded-asc' | 'founded-desc';
type ViewMode = 'grid' | 'list';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: '이름 A→Z' },
  { value: 'name-desc', label: '이름 Z→A' },
  { value: 'games-desc', label: '게임 수순' },
  { value: 'founded-asc', label: '설립연도 ↑' },
  { value: 'founded-desc', label: '설립연도 ↓' },
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [activeTypeTab, setActiveTypeTab] = useState('');

  useEffect(() => {
    fetch('/api/companies-list')
      .then(res => res.json())
      .then(data => { setCompanies(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const allTypes = useMemo(() => [...new Set(companies.map(c => c.type))].filter(Boolean).sort(), [companies]);
  const allCountries = useMemo(() => [...new Set(companies.map(c => c.country).filter(Boolean))].sort() as string[], [companies]);
  const allStatuses = useMemo(() => [...new Set(companies.map(c => c.companyStatus).filter(Boolean))].sort() as string[], [companies]);

  const typeTabs = useMemo(() => {
    const counts = allTypes.map(t => ({ name: t, count: companies.filter(c => c.type === t).length }));
    return counts.sort((a, b) => b.count - a.count);
  }, [allTypes, companies]);

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
    if (activeTypeTab) result = result.filter(c => c.type === activeTypeTab);
    if (typeFilter) result = result.filter(c => c.type === typeFilter);
    if (countryFilter) result = result.filter(c => c.country === countryFilter);
    if (statusFilter) result = result.filter(c => c.companyStatus === statusFilter);

    switch (sortBy) {
      case 'name-asc': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'games-desc': result.sort((a, b) => (b._count.developedGames + b._count.publishedGames) - (a._count.developedGames + a._count.publishedGames)); break;
      case 'founded-asc': result.sort((a, b) => (a.foundedAt || '9999').localeCompare(b.foundedAt || '9999')); break;
      case 'founded-desc': result.sort((a, b) => (b.foundedAt || '0000').localeCompare(a.foundedAt || '0000')); break;
    }
    return result;
  }, [companies, searchQuery, activeTypeTab, typeFilter, countryFilter, statusFilter, sortBy]);

  const hasFilters = typeFilter || countryFilter || statusFilter || activeTypeTab;
  const clearFilters = () => { setTypeFilter(''); setCountryFilter(''); setStatusFilter(''); setActiveTypeTab(''); };

  const typeLabels: Record<string, string> = { DEVELOPER: '개발사', PUBLISHER: '유통사', BOTH: '개발/유통' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 page-enter">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="제작사 검색..."
          className="w-full max-w-md bg-vault-surface border border-vault-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-amber"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text-primary">게임 제작사 아카이브</h2>
            <span className="text-xs text-text-muted bg-vault-surface border border-vault-border px-2 py-0.5 rounded-full">
              {filtered.length}개
            </span>
          </div>
          <Link href="/request?tab=company" className="text-xs px-3 py-1.5 bg-neon-blue/10 text-neon-blue font-bold border border-neon-blue/30 rounded-lg hover:bg-neon-blue/20 transition-colors">
            + 제작사 추가 건의
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
              showFilters || hasFilters ? 'bg-amber/10 text-amber border-amber/30' : 'bg-vault-surface text-text-secondary border-vault-border hover:border-vault-border-light'
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

      {/* Type Quick Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        <button
          onClick={() => setActiveTypeTab('')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer ${
            !activeTypeTab ? 'bg-amber/10 text-amber border-amber/30 font-medium' : 'bg-vault-surface text-text-muted border-vault-border hover:border-vault-border-light'
          }`}
        >
          <Building2 size={11} />
          전체 ({companies.length})
        </button>
        {typeTabs.map(t => (
          <button
            key={t.name}
            onClick={() => setActiveTypeTab(prev => prev === t.name ? '' : t.name)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer whitespace-nowrap ${
              activeTypeTab === t.name
                ? 'bg-neon-blue/10 text-neon-blue border-neon-blue/30 font-medium'
                : 'bg-vault-surface text-text-muted border-vault-border hover:border-vault-border-light'
            }`}
          >
            {typeLabels[t.name] || t.name} ({t.count})
          </button>
        ))}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-vault-surface border border-vault-border rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <FilterSelect label="타입" value={typeFilter} onChange={setTypeFilter} options={allTypes} labelMap={typeLabels} />
            <FilterSelect label="국가" value={countryFilter} onChange={setCountryFilter} options={allCountries} />
            <FilterSelect label="상태" value={statusFilter} onChange={setStatusFilter} options={allStatuses} />
          </div>
        </div>
      )}

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
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(c => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <CompanyListRow key={c.id} company={c} />
          ))}
        </div>
      )}
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
          <div className="w-full aspect-square bg-vault-surface-light flex items-center justify-center p-4" style={{ background: 'linear-gradient(145deg, #3a2a10 0%, #1a1a2e 100%)' }}>
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
            <div className="flex items-center gap-1">
              <Gamepad2 size={10} className="text-amber" />
              <span className="text-[10px] font-bold text-text-secondary">{totalGames}개</span>
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

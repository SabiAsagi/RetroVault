"use client";
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Filter, LayoutGrid, List, Monitor, Search, X } from 'lucide-react';

export type DirectoryKind = 'platform' | 'company';
export interface DirectoryEntry {
  id: string; name: string; href: string; image?: string | null;
  category: string; meta: string; facts: string; games: string; status?: string | null;
}
const labels = { platform: '플랫폼', company: '제작사' };
export function EntityLogo({ src, name, kind }: { src?: string | null; name: string; kind: DirectoryKind }) {
  const [failed, setFailed] = useState(false);
  const Icon = kind === 'platform' ? Monitor : Building2;
  return <div className="directory-logo">{src && !failed ? <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} /> : <div className="directory-logo-fallback"><Icon size={36} aria-hidden="true" /><span>{name.slice(0, 2)}</span></div>}</div>;
}
export function DirectoryHeading({ kind, total, loading, query, onQuery }: { kind: DirectoryKind; total: number; loading: boolean; query: string; onQuery: (value: string) => void }) {
  const Icon = kind === 'platform' ? Monitor : Building2;
  return <section className="directory-heading">
    <div><p className="directory-eyebrow"><Icon size={16} aria-hidden="true" /> 게임 위키 / {labels[kind]} 기록</p>
      <h1>{labels[kind]} 아카이브</h1>
      <p className="directory-lead">{kind === 'platform' ? '게임이 머물던 기기들, 그 안에 담긴 이야기.' : '좋아하는 게임 뒤에는, 만드는 사람들이 있어요.'}</p>
      <p className="directory-description">{kind === 'platform' ? '제조사와 세대를 따라 기기를 살펴보고, 발매된 게임으로 이어가 보세요.' : '개발사와 유통사의 기록을 읽고, 함께 만든 게임을 만나보세요.'}</p>
    </div>
    <div className="directory-heading-side"><span>차곡차곡 모은 {labels[kind]} 기록</span><strong>{loading ? '불러오는 중' : total.toLocaleString('ko-KR')}<small>{!loading && '개 문서'}</small></strong><Link href={`/request?tab=${kind}`}>빠진 정보 알려주기 <ArrowRight size={15} /></Link></div>
    <label className="directory-search"><Search size={21} aria-hidden="true" /><span className="sr-only">{labels[kind]} 검색</span><input type="search" value={query} onChange={e => onQuery(e.target.value)} placeholder={kind === 'platform' ? '플랫폼 이름이나 제조사를 찾아보세요' : '제작사 이름이나 국가를 찾아보세요'} /></label>
  </section>;
}
export function DirectoryFilters({ open, onClose, onClear, active, children }: { open: boolean; onClose: () => void; onClear: () => void; active: boolean; children: ReactNode }) {
  return <aside id="directory-filters" className={`directory-filters ${open ? 'is-open' : ''}`}><div className="directory-filter-heading"><h2>기록 좁혀보기</h2><button className="directory-mobile-close" onClick={onClose} aria-label="필터 닫기"><X size={18} /></button></div><p>관심 있는 조건을 골라보세요.</p><div className="directory-filter-fields">{children}</div>{active && <button className="directory-reset" onClick={onClear}>선택한 필터 초기화</button>}<div className="directory-filter-note">하나의 문서에서<br />다음 게임의 실마리를 찾아요.</div></aside>;
}
export function DirectoryTabs({ tabs, value, onChange }: { tabs: { value: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  return <div className="directory-tabs" role="group" aria-label="빠른 분류">{tabs.map(t => <button key={t.value} aria-pressed={value === t.value} onClick={() => onChange(t.value)}>{t.label}</button>)}</div>;
}
export function DirectoryToolbar({ count, loading, view, onView, sort, onSort, options, filtersOpen, onFilters }: { count: number; loading: boolean; view: string; onView: (v: 'grid' | 'list') => void; sort: string; onSort: (v: string) => void; options: { value: string; label: string }[]; filtersOpen: boolean; onFilters: () => void }) {
  return <div className="directory-toolbar"><p>{loading ? '기록을 불러오고 있어요…' : <>찾은 기록 <strong>{count.toLocaleString('ko-KR')}</strong>개</>}</p><div className="directory-tools"><button className="directory-filter-toggle" onClick={onFilters} aria-expanded={filtersOpen} aria-controls="directory-filters"><Filter size={16} /> 필터</button><label><span className="sr-only">정렬 기준</span><select value={sort} onChange={e => onSort(e.target.value)}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label><div className="directory-view" role="group" aria-label="보기 방식"><button onClick={() => onView('grid')} aria-pressed={view === 'grid'} aria-label="카드로 보기"><LayoutGrid size={18} /></button><button onClick={() => onView('list')} aria-pressed={view === 'list'} aria-label="목록으로 보기"><List size={18} /></button></div></div></div>;
}
export function DirectoryResults({ kind, items, view, loading, error, page, onPage, onReset }: { kind: DirectoryKind; items: DirectoryEntry[]; view: string; loading: boolean; error: boolean; page: number; onPage: (page: number) => void; onReset: () => void }) {
  const pages = Math.max(1, Math.ceil(items.length / 30));
  const current = Math.min(Math.max(page, 1), pages);
  const visible = items.slice((current - 1) * 30, current * 30);
  if (error) return <div className="directory-empty" role="alert"><h2>기록을 불러오지 못했어요.</h2><p>잠시 후 다시 시도해주세요.</p><button onClick={() => window.location.reload()}>다시 불러오기</button></div>;
  if (loading) return <div className="directory-grid" aria-label="문서 불러오는 중" aria-busy="true">{Array.from({ length: 6 }, (_, i) => <div className="directory-skeleton skeleton" key={i} />)}</div>;
  if (!items.length) return <div className="directory-empty"><Search size={32} aria-hidden="true" /><h2>아직 맞는 기록을 찾지 못했어요.</h2><p>이름을 짧게 입력하거나 선택한 조건을 줄여보세요.</p><button onClick={onReset}>검색과 필터 초기화</button></div>;
  return <><div className={view === 'grid' ? 'directory-grid' : 'directory-list'}>{visible.map(item => <Link key={item.id} href={item.href} className={`directory-card ${view === 'list' ? 'is-list' : ''}`}><EntityLogo src={item.image} name={item.name} kind={kind} /><div className="directory-card-body"><div className="directory-card-tags"><span>{item.category}</span>{item.status && <small>{item.status}</small>}</div><h2 title={item.name}>{item.name}</h2><p className="directory-card-meta">{item.meta}</p><p className="directory-card-facts">{item.facts}</p><div className="directory-card-footer"><span>{item.games}</span><ArrowRight size={17} aria-hidden="true" /></div></div></Link>)}</div>{pages > 1 && <nav className="directory-pagination" aria-label="문서 페이지"><button disabled={current === 1} onClick={() => onPage(current - 1)}>이전</button><form key={`${current}-${pages}`} onSubmit={e => { e.preventDefault(); const value = Number(new FormData(e.currentTarget).get('page')); if (Number.isInteger(value) && value >= 1 && value <= pages) onPage(value); }}><label><span className="sr-only">이동할 페이지</span><input name="page" aria-label="이동할 페이지" type="number" min={1} max={pages} defaultValue={current} required /></label><span> / {pages.toLocaleString('ko-KR')}</span><button type="submit">이동</button></form><button disabled={current === pages} onClick={() => onPage(current + 1)}>다음</button></nav>}<div className="directory-contribute"><span>함께 채워가는 게임 위키</span><Link href={`/request/edit?tab=${kind}`}>정보 추가·수정 제안 <ArrowRight size={15} /></Link></div></>;
}

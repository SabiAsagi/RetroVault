'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Disc3, History, Monitor } from 'lucide-react';
import { getGameSlug, getPlatformSlug } from '@/lib/slug';
import { timelineRecordCount, type TimelineYear } from '@/lib/timeline';

function Cover({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return <span className="chronicle-rail-cover">{src && !failed ? <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} /> : <Disc3 size={28} aria-hidden="true" />}<span className="sr-only">{title} 표지</span></span>;
}

export default function TimelineRail({ years, selectedYear, dense, searching }: { years: TimelineYear[]; selectedYear: number; dense: boolean; searching: boolean }) {
  const rail = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<number[]>([]);
  const visible = searching ? years.filter(y => timelineRecordCount(y) > 0) : years;
  useEffect(() => {
    const container = rail.current;
    const card = container?.querySelector<HTMLElement>(`#year-card-${selectedYear}`);
    if (container && card) container.scrollTo({ left: card.offsetLeft - container.offsetLeft, behavior: 'instant' });
  }, [selectedYear, dense, searching]);
  if (!visible.length) return <div className="chronicle-empty"><h2>맞는 기록을 찾지 못했어요.</h2><p>검색어를 줄이거나 기록 종류를 다시 선택해주세요.</p></div>;
  return <>
    <p className="chronicle-rail-hint" id="chronicle-rail-help">연도를 나란히 살펴보세요. 아래 가로 스크롤·터치 밀기 또는 연도 이동을 이용할 수 있어요.</p>
    <div ref={rail} className={`chronicle-rail ${dense ? 'is-compact' : ''}`} role="region" aria-label="가로 연대기" aria-describedby="chronicle-rail-help" tabIndex={0}>
      {visible.map(y => <section key={y.year} id={`year-card-${y.year}`} className={`chronicle-rail-year ${timelineRecordCount(y) ? '' : 'is-empty'}`} aria-labelledby={`rail-heading-${y.year}`}>
        <div className="chronicle-rail-dot" aria-hidden="true"><span>{String(y.year).slice(-2)}</span></div>
        <div className="chronicle-rail-card" tabIndex={0} aria-label={`${y.year}년 기록 스크롤`}>
          <h2 id={`rail-heading-${y.year}`}>{y.year}<small>게임 {y.games.length} · 기기 {y.platforms.length} · 사건 {y.events.length}</small></h2>
          {y.platforms.length > 0 && <div className="chronicle-rail-section"><h3><Monitor size={15} aria-hidden="true" />기종 발매</h3>{y.platforms.slice(0, expanded.includes(y.year) ? undefined : 4).map(p => <Link className="chronicle-rail-platform" key={p.id} href={`/platforms/${getPlatformSlug(p)}`}><h4>{p.name}</h4>{p.description && <p>{p.description}</p>}<small>기기 문서 읽기 →</small></Link>)}{y.platforms.length > 4 && <button className="chronicle-more" aria-expanded={expanded.includes(y.year)} onClick={() => setExpanded(v => v.includes(y.year) ? v.filter(a => a !== y.year) : [...v, y.year])}>{expanded.includes(y.year) ? '기기 접기' : `기기 ${y.platforms.length - 4}개 더 보기`}</button>}</div>}
          {y.games.length > 0 && <div className="chronicle-rail-section"><h3><Disc3 size={15} aria-hidden="true" />게임 기록</h3><div className="chronicle-rail-games">{y.games.map(g => <Link key={g.id} href={`/games/${getGameSlug(g)}`}><Cover src={g.imageUrl} title={g.title} /><h4>{g.title}</h4><p>{g.platform}</p></Link>)}</div></div>}
          {y.events.length > 0 && <div className="chronicle-rail-section"><h3><History size={15} aria-hidden="true" />주요 사건</h3>{y.events.map(e => <article className="chronicle-rail-event" key={e.id}><h4>{e.title}</h4>{e.description && e.description !== e.title && <details><summary>사건 설명 읽기</summary><p>{e.description}</p></details>}{e.gameHref && <Link href={e.gameHref}>관련 게임 →</Link>}{e.platformHref && <Link href={e.platformHref}>관련 기기 →</Link>}</article>)}</div>}
          {!timelineRecordCount(y) && <p className="chronicle-note">이 해의 기록은 아직 모으고 있어요.</p>}
        </div>
      </section>)}
    </div>
    <p className="chronicle-note">게임은 연도별 인기도·조회순 최대 20개의 일부 기록입니다. 전체 발매작 목록은 아니에요.</p>
  </>;
}

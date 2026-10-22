'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Disc3, History, List, Monitor, Search, X } from 'lucide-react';
import { getGameSlug, getPlatformSlug } from '@/lib/slug';
import { manufacturerLabel } from '@/lib/archive-labels';
import { filterTimeline, parseTimelineYear, timelineRecordCount, timelineYears, TIMELINE_START_YEAR, type TimelineFilters, type TimelineGame, type TimelinePlatform, type TimelineNarrative } from '@/lib/timeline';

const defaultFilters:TimelineFilters={games:true,platforms:true,events:true,query:''};
function rememberYear(year:number){const url=new URL(window.location.href);url.searchParams.set('year',String(year));url.hash='';window.history.replaceState(window.history.state,'',url);}
function TimelineThumb({src,name,platform=false}:{src?:string|null;name:string;platform?:boolean}){
  const [failed,setFailed]=useState(false);const Icon=platform?Monitor:Disc3;
  return <span className="chronicle-thumb">{src&&!failed?<img src={src} alt={name} loading="lazy" onError={()=>setFailed(true)}/>:<Icon size={26} aria-hidden="true"/>}</span>;
}

export default function Timeline({games,platforms,timelineEvents,currentYear,initialYear}:{games:TimelineGame[];platforms:TimelinePlatform[];timelineEvents:TimelineNarrative[];currentYear:number;initialYear:number}){
  const [selectedYear,setSelectedYear]=useState(initialYear);
  const [decade,setDecade]=useState(Math.floor(initialYear/10)*10);
  const [filters,setFilters]=useState(defaultFilters);
  const [dense,setDense]=useState(false);
  const [allPlatforms,setAllPlatforms]=useState(false);
  const content=useRef<HTMLDivElement>(null),yearHeading=useRef<HTMLHeadingElement>(null);
  const years=useMemo(()=>timelineYears(games,platforms,timelineEvents,currentYear),[games,platforms,timelineEvents,currentYear]);
  const filtered=useMemo(()=>filterTimeline(years,filters),[years,filters]);
  const matchingYears=useMemo(()=>filtered.filter(y=>timelineRecordCount(y)>0),[filtered]);
  const selected=filtered.find(y=>y.year===selectedYear)!;
  const decades=Array.from({length:Math.floor((currentYear-TIMELINE_START_YEAR)/10)+1},(_,i)=>TIMELINE_START_YEAR+i*10);
  const decadeYears=filtered.filter(y=>y.year>=decade&&y.year<decade+10);
  const searching=Boolean(filters.query.trim());
  const count=selected?timelineRecordCount(selected):0;

  function chooseYear(year:number,scroll=true){
    setSelectedYear(year);setDecade(Math.floor(year/10)*10);setAllPlatforms(false);rememberYear(year);
    if(scroll) requestAnimationFrame(()=>{yearHeading.current?.focus({preventScroll:true});content.current?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  }
  useEffect(()=>{
    const legacy=window.location.hash.match(/^#year-card-(\d{4})$/);
    const year=parseTimelineYear(legacy?.[1],currentYear);
    if(year!==null){setSelectedYear(year);setDecade(Math.floor(year/10)*10);requestAnimationFrame(()=>content.current?.scrollIntoView({block:'start',behavior:'instant'}));}
    const restore=()=>{const y=parseTimelineYear(new URLSearchParams(window.location.search).get('year'),currentYear);if(y!==null){setSelectedYear(y);setDecade(Math.floor(y/10)*10);setAllPlatforms(false);}};
    window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore);
  },[currentYear]);
  useEffect(()=>{
    if(searching&&matchingYears.length&&selected&&timelineRecordCount(selected)===0){const y=matchingYears[0].year;setSelectedYear(y);setDecade(Math.floor(y/10)*10);setAllPlatforms(false);rememberYear(y);}
  },[searching,matchingYears,selected]);

  const previous=searching?[...matchingYears].reverse().find(y=>y.year<selectedYear)?.year:selectedYear>TIMELINE_START_YEAR?selectedYear-1:undefined;
  const next=searching?matchingYears.find(y=>y.year>selectedYear)?.year:selectedYear<currentYear?selectedYear+1:undefined;
  const changeFilter=(key:'games'|'platforms'|'events',value:boolean)=>setFilters(prev=>({...prev,[key]:value}));
  return <div className={`chronicle page-enter ${dense?'is-dense':''}`}>
    <header className="chronicle-hero"><div><p className="directory-eyebrow"><Clock size={16} aria-hidden="true"/> 게임 위키 / 시대의 기록</p><h1>게임의 시간을 산책해요</h1><p className="chronicle-lead">처음 만난 기기부터 오래 기억한 게임까지,<br/>한 해의 기록을 차근차근 꺼내보세요.</p></div><div className="chronicle-stamp">차곡차곡 모은 시간<strong>{TIMELINE_START_YEAR}—{currentYear}</strong>기기 · 게임 · 사건을 함께</div></header>
    <nav className="chronicle-decades" aria-label="시대 선택">{decades.map(d=><button key={d} aria-pressed={decade===d} disabled={searching&&!matchingYears.some(y=>y.year>=d&&y.year<d+10)} onClick={()=>{const y=filtered.find(y=>y.year>=d&&y.year<d+10&&timelineRecordCount(y)>0)?.year??d;chooseYear(y,false);}}>{d}s</button>)}</nav>
    <section className="chronicle-tools" aria-label="연대기 검색과 표시 설정"><label className="chronicle-search"><Search size={19} aria-hidden="true"/><span className="sr-only">연대기 기록 검색</span><input type="search" value={filters.query} placeholder="불러온 기록에서 게임·기기·사건 찾기" onChange={e=>setFilters(prev=>({...prev,query:e.target.value}))}/>{filters.query&&<button aria-label="검색어 지우기" onClick={()=>setFilters(prev=>({...prev,query:''}))}><X size={16}/></button>}</label><label className="chronicle-jump">연도 이동<select value={selectedYear} onChange={e=>chooseYear(Number(e.target.value))}>{filtered.map(y=><option key={y.year} value={y.year} disabled={searching&&timelineRecordCount(y)===0}>{y.year}년</option>)}</select></label><div className="chronicle-density" role="group" aria-label="기록 표시 밀도"><button aria-pressed={dense} onClick={()=>setDense(true)}><List size={15}/>간단히</button><button aria-pressed={!dense} onClick={()=>setDense(false)}><BookOpen size={15}/>자세히</button></div><div className="chronicle-categories"><label><input type="checkbox" checked={filters.games} onChange={e=>changeFilter('games',e.target.checked)}/>게임</label><label><input type="checkbox" checked={filters.platforms} onChange={e=>changeFilter('platforms',e.target.checked)}/>기기</label><label><input type="checkbox" checked={filters.events} onChange={e=>changeFilter('events',e.target.checked)}/>사건</label><span role="status">{searching?`${matchingYears.length}개 연도에서 검색됨`:'등록 자료 기준 · 게임은 연도별 최대 20개'}</span></div></section>
    <div className="chronicle-layout"><aside className="chronicle-year-nav" aria-label="연도 선택"><h2>{decade}년대</h2><p>한 해를 골라 기록을 꺼내요.</p><div className="chronicle-years">{decadeYears.map(y=><button key={y.year} aria-pressed={selectedYear===y.year} aria-label={`${y.year}년, 기록 ${timelineRecordCount(y)}개`} onClick={()=>chooseYear(y.year)} disabled={searching&&timelineRecordCount(y)===0}>{y.year}<small>{timelineRecordCount(y).toLocaleString()}개 기록</small></button>)}</div><Link href="/contact">빠진 기록 알려주기 →</Link></aside>
      <div className="chronicle-content" ref={content} id={`year-card-${selectedYear}`}><header className="chronicle-year-heading"><div><h2 ref={yearHeading} tabIndex={-1}>{selectedYear}<span>년의 기록</span></h2><p aria-live="polite">게임 {selected?.games.length??0} · 기기 {selected?.platforms.length??0} · 사건 {selected?.events.length??0}</p></div><div className="chronicle-pager"><button disabled={previous===undefined} onClick={()=>previous!==undefined&&chooseYear(previous)} aria-label="이전 연도"><ArrowLeft size={18}/></button><button disabled={next===undefined} onClick={()=>next!==undefined&&chooseYear(next)} aria-label="다음 연도"><ArrowRight size={18}/></button></div></header>
        {!count?<div className="chronicle-empty"><h3>{!filters.games&&!filters.platforms&&!filters.events?'살펴볼 기록 종류를 골라주세요.':searching?'맞는 기록을 찾지 못했어요.':'이 해의 기록은 아직 모으고 있어요.'}</h3><p>{searching?'검색은 현재 불러온 일부 게임과 기기·사건에서 찾습니다. 검색어를 줄이거나 종류를 다시 선택해보세요.':'연도가 비어 있어도 게임의 시간은 이어져요. 다른 해를 살펴보거나 알고 있는 기록을 보태주세요.'}</p><button onClick={()=>setFilters(defaultFilters)}>검색·표시 설정 초기화</button><Link href="/contact">기록 보태기 →</Link></div>:<>
        {filters.platforms&&<section className="chronicle-section"><h3 className="chronicle-section-heading"><Monitor size={19} aria-hidden="true"/>이 해에 등장한 기기<small>{selected.platforms.length}개</small></h3>{selected.platforms.length?<><div className="chronicle-platforms">{selected.platforms.slice(0,allPlatforms?undefined:6).map(p=><Link key={p.id} href={`/platforms/${getPlatformSlug(p)}`} className="chronicle-platform"><TimelineThumb key={p.imageUrl} src={p.imageUrl} name={p.name} platform/><div className="chronicle-row-copy"><h4>{p.name}</h4><p>{manufacturerLabel(p.manufacturer)} · 문서 읽기 →</p>{p.description&&<p className="chronicle-snippet">{p.description}</p>}</div></Link>)}</div>{selected.platforms.length>6&&<button className="chronicle-more" aria-expanded={allPlatforms} onClick={()=>setAllPlatforms(v=>!v)}>{allPlatforms?'기기 기록 접기':`기기 ${selected.platforms.length-6}개 더 보기`}</button>}</>:<p className="chronicle-note">이 해에 연결된 기기 문서가 아직 없어요.</p>}</section>}
        {filters.games&&<section className="chronicle-section"><h3 className="chronicle-section-heading"><Disc3 size={19} aria-hidden="true"/>이 해의 게임 기록<small>{selected.games.length}개</small></h3>{selected.games.length?<div className="chronicle-games">{selected.games.map(g=><Link key={g.id} href={`/games/${getGameSlug(g)}`} className="chronicle-game"><TimelineThumb key={g.imageUrl} src={g.imageUrl} name={g.title}/><div className="chronicle-row-copy"><h4>{g.title}</h4><p>{g.platform} · 게임 문서 →</p></div></Link>)}</div>:<p className="chronicle-note">이 해에 연결된 게임 기록이 아직 없어요.</p>}<p className="chronicle-note">연도별 인기도·조회순으로 최대 20개의 게임을 불러옵니다. 전체 발매작이나 역사적 대표작을 뜻하지 않아요.</p></section>}
        {filters.events&&<section className="chronicle-section"><h3 className="chronicle-section-heading"><History size={19} aria-hidden="true"/>함께 읽는 사건<small>{selected.events.length}개</small></h3>{selected.events.length?<div className="chronicle-events">{selected.events.map(e=><article key={e.id} className="chronicle-event"><h4>{e.title}</h4>{e.country&&<span className="chronicle-note">{e.country}</span>}{e.description&&e.description!==e.title&&(dense||e.description.length>220?<details><summary>사건 설명 펼치기</summary><p>{e.description}</p></details>:<p>{e.description}</p>)}{e.gameHref&&<Link href={e.gameHref}>관련 게임 문서 →</Link>}{e.platformHref&&<Link href={e.platformHref}>관련 기기 문서 →</Link>}</article>)}</div>:<p className="chronicle-note">이 해의 사건은 아직 모으고 있어요. 알고 있는 기록이 있다면 함께 보태주세요.</p>}</section>}
        </>}
        <p className="chronicle-note">문서에 등록된 출시연도를 기준으로 모았습니다. 연도 미확인·미래 연도 기록과 날짜가 없거나 1970-01-01인 1970년 기기·게임은 제외합니다. 사건은 공개된 등록 기록이며 별도로 검증한 역사 해설은 아닙니다.</p><div className="directory-contribute"><span>한 해의 이야기를 함께 채워요.</span><Link href="/contact">연대기 자료 알려주기 →</Link></div>
      </div></div>
  </div>;
}

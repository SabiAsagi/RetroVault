import { useState, useMemo, useEffect, useRef } from 'react';
import { Game, Platform, TimelineEvent } from '../types';
import { BoxArtPlaceholder } from './GameCard';
import { 
  Calendar, Search, Filter, Monitor, Zap, Disc, Clock, 
  ZoomIn, ZoomOut, Maximize, Minimize, X
} from 'lucide-react';

interface TimelineProps {
  games: Game[];
  timelineEvents: TimelineEvent[];
  platforms: Platform[];
  onSelectGame: (game: Game) => void;
}

interface YearData {
  year: number;
  games: Game[];
  consoles: Platform[];
  events: string[];
}

export default function Timeline({ games, timelineEvents, platforms, onSelectGame }: TimelineProps) {
  const [zoomLevel, setZoomLevel] = useState<'dense' | 'comfortable'>('comfortable');
  const [jumpYear, setJumpYear] = useState<string>('');
  const [expandedYears, setExpandedYears] = useState<number[]>([]);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [showConsoles, setShowConsoles] = useState(true);
  const [showGames, setShowGames] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Aggregate Data
  const timelineData = useMemo(() => {
    const minYear = 1970;
    const maxYear = new Date().getFullYear();
    const dataByYear: Record<number, YearData> = {};

    for (let y = minYear; y <= maxYear; y++) {
      dataByYear[y] = { year: y, games: [], consoles: [], events: [] };
    }

    // Add Platforms
    if (showConsoles) {
      platforms.forEach(p => {
        if (p.releaseYear >= minYear && p.releaseYear <= maxYear) {
          dataByYear[p.releaseYear].consoles.push(p);
        }
      });
    }

    // Add Games
    if (showGames) {
      games.forEach(g => {
        if (g.releaseYear >= minYear && g.releaseYear <= maxYear) {
          dataByYear[g.releaseYear].games.push(g);
        }
      });
    }

    // Add explicit timeline events
    if (showEvents && timelineEvents) {
      timelineEvents.forEach(evt => {
        if (evt.year >= minYear && evt.year <= maxYear) {
          dataByYear[evt.year].events.push(evt.description || evt.title);
          
          if (evt.type === 'console' && showConsoles) {
            dataByYear[evt.year].consoles.push({
              id: evt.id,
              name: evt.title,
              releaseYear: evt.year,
              manufacturer: '',
              generation: evt.era || '',
              description: evt.description || '',
              innovationPoint: evt.innovation || undefined
            } as any);
          }
        }
      });
    }

    // Clean up duplicate events within a year
    Object.keys(dataByYear).forEach(yStr => {
      const y = Number(yStr);
      dataByYear[y].events = [...new Set(dataByYear[y].events)];
      // Sort games by popularity
      dataByYear[y].games.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    });

    return Object.values(dataByYear).sort((a, b) => a.year - b.year);
  }, [games, platforms, timelineEvents, showConsoles, showGames, showEvents]);

  const hasFilters = !showConsoles || !showGames || !showEvents;

  // Jump to year functionality
  const handleJumpToYear = (yearStr: string) => {
    setJumpYear(yearStr);
    if (!yearStr) return;
    
    const element = document.getElementById(`year-card-${yearStr}`);
    if (element && scrollRef.current) {
      // Scroll horizontally
      const container = scrollRef.current;
      const scrollLeft = element.offsetLeft - container.offsetLeft - 24; // 24px padding
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current && e.deltaY !== 0 && !e.shiftKey) {
        e.preventDefault();
        scrollRef.current.scrollBy({ left: e.deltaY * 1.5, behavior: 'smooth' });
      }
    };
    
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 h-[calc(100vh-64px)] flex flex-col page-enter">
      
      {/* Header & Controls */}
      <div className="mb-6 space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-text-primary flex items-center gap-2 mb-1">
              <Clock size={20} className="text-neon-purple" />
              레트로 타임라인
            </h2>
            <p className="text-sm text-text-secondary">게임 역사를 연도별로 탐험하고 시대의 흐름을 확인하세요.</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Zoom Controls */}
            <div className="flex items-center bg-vault-surface border border-vault-border rounded-lg overflow-hidden p-0.5">
              <button 
                onClick={() => setZoomLevel('dense')}
                className={`p-1.5 rounded transition-all flex items-center justify-center ${zoomLevel === 'dense' ? 'bg-mint/20 text-mint' : 'text-text-muted hover:text-text-primary'}`}
                title="조밀하게 보기"
              >
                <ZoomOut size={16} />
              </button>
              <button 
                onClick={() => setZoomLevel('comfortable')}
                className={`p-1.5 rounded transition-all flex items-center justify-center ${zoomLevel === 'comfortable' ? 'bg-mint/20 text-mint' : 'text-text-muted hover:text-text-primary'}`}
                title="넓게 보기"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Jump to Year */}
            <div className="flex items-center bg-vault-surface border border-vault-border rounded-lg pl-3 pr-1 py-1">
              <Calendar size={14} className="text-text-muted mr-2" />
              <select 
                value={jumpYear}
                onChange={e => handleJumpToYear(e.target.value)}
                className="bg-transparent text-sm text-text-primary focus:outline-none cursor-pointer w-20 appearance-none"
              >
                <option value="" className="bg-vault-surface text-text-primary">이동...</option>
                {timelineData.map(d => (
                  <option key={d.year} value={d.year} className="bg-vault-surface text-text-primary">{d.year}년</option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                showFilters || hasFilters
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                  : 'bg-vault-surface text-text-secondary border border-vault-border hover:border-vault-border-light hover:text-text-primary'
              }`}
            >
              <Filter size={16} />
              통합 필터 {hasFilters && <span className="w-2 h-2 rounded-full bg-neon-blue ml-1" />}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-vault-surface border border-vault-border rounded-lg flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-primary font-bold">
              <input type="checkbox" checked={showConsoles} onChange={e => setShowConsoles(e.target.checked)} className="rounded text-neon-blue focus:ring-neon-blue bg-vault-bg border-vault-border" />
              <Monitor size={14} className="text-neon-blue" /> 콘솔 발매
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-primary font-bold">
              <input type="checkbox" checked={showGames} onChange={e => setShowGames(e.target.checked)} className="rounded text-mint focus:ring-mint bg-vault-bg border-vault-border" />
              <Disc size={14} className="text-mint" /> 주요 게임
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-text-primary font-bold">
              <input type="checkbox" checked={showEvents} onChange={e => setShowEvents(e.target.checked)} className="rounded text-amber focus:ring-amber bg-vault-bg border-vault-border" />
              <Zap size={14} className="text-amber" /> 주요 사건
            </label>
            
            {hasFilters && (
              <div className="ml-auto">
                <button 
                  onClick={() => { setShowConsoles(true); setShowGames(true); setShowEvents(true); }}
                  className="text-xs text-text-muted hover:text-coral transition-colors flex items-center gap-1"
                >
                  <X size={12} /> 필터 초기화
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Horizontal Timeline Container ── */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-x-auto overflow-y-hidden flex gap-4 pb-6 pt-2 scroll-smooth custom-scrollbar snap-x snap-mandatory ${isDragging ? 'cursor-grabbing select-none snap-none' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {/* Connection Line Background */}
        <div className="absolute top-[35%] left-0 right-0 h-0.5 bg-vault-border-light -z-10 hidden md:block" />

        {timelineData.map((data) => {
          const isEmpty = data.games.length === 0 && data.consoles.length === 0 && data.events.length === 0;
          const cardWidth = zoomLevel === 'dense' ? 'w-64' : 'w-80';
          
          return (
            <div 
              key={data.year} 
              id={`year-card-${data.year}`}
              className={`shrink-0 flex flex-col snap-center relative group transition-all duration-300 ${cardWidth} ${isEmpty ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}
            >
              {/* Timeline dot & line segment */}
              <div className="flex items-center justify-center mb-4 z-10 shrink-0">
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-vault-border via-vault-border-light to-vault-border top-4 -z-10" />
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black bg-vault-bg transition-colors shadow-lg
                  ${!isEmpty ? 'border-neon-purple text-neon-purple shadow-[0_0_15px_rgba(167,139,250,0.3)]' : 'border-vault-border text-text-muted'}
                `}>
                  '{data.year.toString().slice(2)}
                </div>
              </div>

              {/* Card Container */}
              <div className={`flex-1 overflow-y-auto custom-scrollbar bg-vault-surface border rounded-xl p-4 transition-all
                ${!isEmpty ? 'border-vault-border hover:border-neon-purple/50 shadow-md' : 'border-vault-border/50 bg-vault-surface/50'}
              `}>
                <h3 className={`text-2xl font-black mb-4 flex items-center gap-2 
                  ${!isEmpty ? 'text-text-primary' : 'text-text-muted'}
                `}>
                  {data.year}
                  {!isEmpty && <span className="h-px flex-1 bg-gradient-to-r from-vault-border to-transparent" />}
                </h3>

                <div className="space-y-6">
                  {/* Consoles */}
                  {data.consoles.length > 0 && (() => {
                    const CORE_PONG_CONSOLES = ['Odyssey', 'Electrotennis', 'Pong', 'Telstar', 'Channel F', 'Color TV Game', '2600', 'VCS', 'Telejogo'];
                    
                    const isExpanded = expandedYears.includes(data.year);
                    const coreConsoles = data.consoles.filter(c => 
                      data.year > 1979 || CORE_PONG_CONSOLES.some(k => c.name.toLowerCase().includes(k.toLowerCase()))
                    );
                    const pongClones = data.consoles.filter(c => 
                      data.year <= 1979 && !CORE_PONG_CONSOLES.some(k => c.name.toLowerCase().includes(k.toLowerCase()))
                    );

                    const visibleConsoles = isExpanded ? data.consoles : coreConsoles;
                    const hiddenCount = data.consoles.length - coreConsoles.length;

                    return (
                      <div>
                        <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Monitor size={12} className="text-neon-blue" /> 기종 발매
                        </h4>
                        <div className="space-y-2">
                          {visibleConsoles.map(console => (
                            <div key={console.id} className="p-2 rounded bg-vault-surface-light border border-vault-border">
                              <p className="text-xs font-bold text-neon-blue mb-0.5">{console.name}</p>
                              <p className="text-[10px] text-text-secondary">{console.innovationPoint || console.description}</p>
                            </div>
                          ))}
                          
                          {!isExpanded && hiddenCount > 0 && (
                            <button 
                              onClick={() => setExpandedYears(prev => [...prev, data.year])}
                              className="w-full p-2 mt-1 rounded bg-vault-surface hover:bg-vault-surface-light border border-dashed border-vault-border text-[10px] font-bold text-text-muted hover:text-neon-blue transition-colors flex items-center justify-center gap-1"
                            >
                              ▼ {data.year}년 유사 콘솔 클론 ({hiddenCount}종 더 보기)
                            </button>
                          )}
                          {isExpanded && hiddenCount > 0 && (
                            <button 
                              onClick={() => setExpandedYears(prev => prev.filter(y => y !== data.year))}
                              className="w-full p-1.5 mt-1 rounded text-[10px] font-bold text-text-muted hover:text-coral transition-colors flex items-center justify-center gap-1"
                            >
                              ▲ 접기
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Games */}
                  {data.games.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Disc size={12} className="text-mint" /> 주요 게임
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {data.games.map(game => (
                          <div 
                            key={game.id} 
                            onClick={() => onSelectGame(game)}
                            className="bg-vault-bg border border-vault-border rounded p-1.5 cursor-pointer hover:border-mint/50 transition-colors group/game"
                          >
                            <div className="aspect-[3/4] mb-1.5 overflow-hidden rounded bg-vault-surface border border-vault-border/50 shadow-sm relative">
                              {game.imageUrl ? (
                                <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover opacity-80 group-hover/game:opacity-100 transition-opacity" />
                              ) : (
                                <BoxArtPlaceholder game={game} />
                              )}
                              {/* Overlay hint */}
                              <div className="absolute inset-0 bg-mint/10 opacity-0 group-hover/game:opacity-100 transition-opacity flex items-center justify-center">
                                <Search size={14} className="text-mint" />
                              </div>
                            </div>
                            <h5 className="text-[9px] font-bold text-text-primary leading-tight truncate group-hover/game:text-mint">{game.title}</h5>
                            <p className="text-[8px] text-text-muted truncate mt-0.5">{game.platform}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {data.events.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Zap size={12} className="text-amber" /> 주요 사건
                      </h4>
                      <ul className="space-y-1.5">
                        {data.events.map((evt, idx) => (
                          <li key={idx} className="text-xs text-text-secondary pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-amber/50">
                            {evt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isEmpty && (
                    <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                      <Clock size={24} className="text-text-muted mb-2" />
                      <p className="text-xs text-text-muted">기록된 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {/* End padding for scroll */}
        <div className="shrink-0 w-8" />
      </div>
    </div>
  );
}

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
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [platformFilter, setPlatformFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract all available filters
  const allPlatforms = useMemo(() => [...new Set(games.map(g => g.platform))].filter(Boolean).sort(), [games]);
  const allGenres = useMemo(() => [...new Set(games.map(g => g.genre))].filter(Boolean).sort(), [games]);
  const allCountries = useMemo(() => [...new Set(games.map(g => g.country).filter(Boolean))].sort(), [games]);

  // Aggregate Data
  const timelineData = useMemo(() => {
    const minYear = 1970;
    const maxYear = new Date().getFullYear();
    const dataByYear: Record<number, YearData> = {};

    for (let y = minYear; y <= maxYear; y++) {
      dataByYear[y] = { year: y, games: [], consoles: [], events: [] };
    }

    // Add Platforms
    platforms.forEach(p => {
      if (p.releaseYear >= minYear && p.releaseYear <= maxYear) {
        dataByYear[p.releaseYear].consoles.push(p);
      }
    });

    // Add Games & Events
    games.forEach(g => {
      // Filter games based on current filter state
      let match = true;
      if (platformFilter && g.platform !== platformFilter) match = false;
      if (genreFilter && g.genre !== genreFilter) match = false;
      if (countryFilter && g.country !== countryFilter) match = false;

      if (match && g.releaseYear >= minYear && g.releaseYear <= maxYear) {
        dataByYear[g.releaseYear].games.push(g);
      }

    });

    // Add explicit timeline events
    if (timelineEvents) {
      timelineEvents.forEach(evt => {
        if (evt.year >= minYear && evt.year <= maxYear) {
          dataByYear[evt.year].events.push(evt.description || evt.title);
          
          if (evt.type === 'console') {
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
  }, [games, platformFilter, genreFilter, countryFilter]);

  const hasFilters = platformFilter || genreFilter || countryFilter;

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
              게임 필터 {hasFilters && <span className="w-2 h-2 rounded-full bg-neon-blue ml-1" />}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 bg-vault-surface border border-vault-border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-[10px] text-text-muted block mb-1 font-medium">플랫폼</label>
              <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50">
                <option value="">전체 플랫폼</option>
                {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1 font-medium">장르</label>
              <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50">
                <option value="">전체 장르</option>
                {allGenres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1 font-medium">국가</label>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-neon-blue/50">
                <option value="">전체 국가</option>
                {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            {hasFilters && (
              <div className="md:col-span-3 flex justify-end">
                <button 
                  onClick={() => { setPlatformFilter(''); setGenreFilter(''); setCountryFilter(''); }}
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
        className="flex-1 overflow-x-auto overflow-y-hidden flex gap-4 pb-6 pt-2 scroll-smooth custom-scrollbar snap-x snap-mandatory"
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
                  {data.consoles.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Monitor size={12} className="text-neon-blue" /> 기종 발매
                      </h4>
                      <div className="space-y-2">
                        {data.consoles.map(console => (
                          <div key={console.id} className="p-2 rounded bg-vault-surface-light border border-vault-border">
                            <p className="text-xs font-bold text-neon-blue mb-0.5">{console.name}</p>
                            <p className="text-[10px] text-text-secondary">{console.innovationPoint || console.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

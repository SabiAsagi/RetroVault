export const TIMELINE_START_YEAR = 1970;
export const TIMELINE_GAMES_PER_YEAR = 20;
export interface TimelineGame { id: string; title: string; releaseYear: number; platform: string; genre: string; imageUrl: string; popularity: number; views: number; releaseDate?: string | null }
export interface TimelinePlatform { id: string; name: string; releaseYear: number; releaseDate?: string | null; manufacturer: string; description?: string | null; imageUrl?: string | null }
export interface TimelineNarrative { id: string; year: number; title: string; type: string; description: string; country?: string | null; gameHref?: string; platformHref?: string }
export interface TimelineYear { year: number; games: TimelineGame[]; platforms: TimelinePlatform[]; events: TimelineNarrative[] }
export interface TimelineFilters { games: boolean; platforms: boolean; events: boolean; query: string }
export function currentTimelineYear() { return Number(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Seoul', year: 'numeric' }).format(new Date())); }
export function eligibleTimelineYear(year: number, currentYear: number, date?: string | null) {
  if (!Number.isInteger(year) || year < TIMELINE_START_YEAR || year > currentYear) return false;
  // Legacy imports mix unknown dates into the Unix epoch; exclude that placeholder.
  return year !== 1970 || Boolean(date?.startsWith('1970-') && !date.startsWith('1970-01-01'));
}
export function timelineYears(games: TimelineGame[], platforms: TimelinePlatform[], events: TimelineNarrative[], currentYear: number): TimelineYear[] {
  const years = new Map<number, TimelineYear>();
  for (let year = TIMELINE_START_YEAR; year <= currentYear; year++) years.set(year, { year, games: [], platforms: [], events: [] });
  const seenGames=new Set<string>(),seenPlatforms=new Set<string>(),seenEvents=new Set<string>();
  for(const g of games) if(!seenGames.has(g.id)&&eligibleTimelineYear(g.releaseYear,currentYear,g.releaseDate)){ years.get(g.releaseYear)?.games.push(g);seenGames.add(g.id); }
  for(const p of platforms) if(!seenPlatforms.has(p.id)&&eligibleTimelineYear(p.releaseYear,currentYear,p.releaseDate)){ years.get(p.releaseYear)?.platforms.push(p);seenPlatforms.add(p.id); }
  for(const e of events) if(!seenEvents.has(e.id)&&years.has(e.year)){ years.get(e.year)!.events.push(e);seenEvents.add(e.id); }
  for(const y of years.values()) y.games.sort((a,b)=>(b.popularity-a.popularity)||(b.views-a.views)||a.title.localeCompare(b.title)).splice(TIMELINE_GAMES_PER_YEAR);
  return [...years.values()];
}
export function filterTimeline(years: TimelineYear[], filters: TimelineFilters): TimelineYear[] {
  const q=filters.query.normalize('NFKC').trim().toLocaleLowerCase();
  const matches=(...parts:(string|null|undefined)[])=>!q||parts.some(p=>p?.normalize('NFKC').toLocaleLowerCase().includes(q));
  return years.map(y=>({...y,
    games:filters.games?y.games.filter(g=>matches(g.title,g.platform,g.genre)):[],
    platforms:filters.platforms?y.platforms.filter(p=>matches(p.name,p.manufacturer)):[],
    events:filters.events?y.events.filter(e=>matches(e.title,e.description,e.country)):[],
  }));
}
export const timelineRecordCount = (y: TimelineYear) => y.games.length+y.platforms.length+y.events.length;
export function parseTimelineYear(value: string|null|undefined,currentYear: number): number|null {
  if(!value || !/^\d{4}$/.test(value)) return null;
  const year=Number(value);return year>=TIMELINE_START_YEAR&&year<=currentYear?year:null;
}

import TimelineWrapper from '@/components/wrappers/TimelineWrapper';
import { getPublicTimelineEvents, getPlatformsForTimeline, getTopGamesForTimeline } from '@/app/actions/timeline';
import { currentTimelineYear, parseTimelineYear } from '@/lib/timeline';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'연대기 | 게임의 시간을 산책해요 · 겜자취',description:'시대와 연도를 골라 게임·플랫폼·사건의 기록을 함께 읽어보세요.',alternates:{canonical:'https://retrovault.kro.kr/timeline'}};
export default async function TimelinePage({searchParams}:{searchParams:Promise<{year?:string}>}) {
  const year=currentTimelineYear();const requested=await searchParams;
  const [games,events,platforms]=await Promise.all([getTopGamesForTimeline(),getPublicTimelineEvents(),getPlatformsForTimeline()]);
  return <TimelineWrapper initialGames={games} initialTimelineEvents={events} initialPlatforms={platforms} currentYear={year} initialYear={parseTimelineYear(requested.year,year)??1990}/>;
}

import TimelineWrapper from "@/components/wrappers/TimelineWrapper";
import { getTimelineEvents, getPlatformsForTimeline, getTopGamesForTimeline } from "@/app/actions/timeline";

export default async function TimelinePage() {
  const games = await getTopGamesForTimeline();
  const timelineEvents = await getTimelineEvents();
  const platforms = await getPlatformsForTimeline();

  return <TimelineWrapper initialGames={games} initialTimelineEvents={timelineEvents} initialPlatforms={platforms as any} />;
}

import TimelineWrapper from "@/components/wrappers/TimelineWrapper";
import { getGamesFromDB } from "@/app/actions/games";
import { getTimelineEvents, getPlatformsForTimeline } from "@/app/actions/timeline";

export default async function TimelinePage() {
  const games = await getGamesFromDB();
  const timelineEvents = await getTimelineEvents();
  const platforms = await getPlatformsForTimeline();

  return <TimelineWrapper initialGames={games} initialTimelineEvents={timelineEvents} initialPlatforms={platforms as any} />;
}

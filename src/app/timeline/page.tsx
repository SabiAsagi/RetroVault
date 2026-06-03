import TimelineWrapper from "@/components/wrappers/TimelineWrapper";
import { getGamesFromDB } from "@/app/actions/games";
import { getTimelineEvents } from "@/app/actions/timeline";

export default async function TimelinePage() {
  const games = await getGamesFromDB();
  const timelineEvents = await getTimelineEvents();

  return <TimelineWrapper initialGames={games} initialTimelineEvents={timelineEvents} />;
}

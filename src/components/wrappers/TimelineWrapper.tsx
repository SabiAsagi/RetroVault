"use client";
import Timeline from '@/components/Timeline';
import type { TimelineGame, TimelinePlatform, TimelineNarrative } from '@/lib/timeline';
export default function TimelineWrapper(props:{initialGames:TimelineGame[];initialTimelineEvents:TimelineNarrative[];initialPlatforms:TimelinePlatform[];currentYear:number;initialYear:number;initialView:'timeline'|'year'}) {
  return <Timeline games={props.initialGames} timelineEvents={props.initialTimelineEvents} platforms={props.initialPlatforms} currentYear={props.currentYear} initialYear={props.initialYear} initialView={props.initialView}/>;
}

"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Timeline from '@/components/Timeline';
import { Game, TimelineEvent, Platform } from '@/types';
import { getGameSlug } from '@/lib/slug';

interface Props {
  initialGames: Game[];
  initialTimelineEvents: TimelineEvent[];
  initialPlatforms: Platform[];
}

export default function TimelineWrapper({ initialGames, initialTimelineEvents, initialPlatforms }: Props) {
  const router = useRouter();

  const handleSelectGame = (game: Game) => {
    router.push(`/games/${getGameSlug(game)}`);
  };

  return <Timeline games={initialGames} timelineEvents={initialTimelineEvents} platforms={initialPlatforms} onSelectGame={handleSelectGame} />;
}

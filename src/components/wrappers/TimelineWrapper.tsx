"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Timeline from '@/components/Timeline';
import { Game, TimelineEvent, Platform } from '@/types';

interface Props {
  initialGames: Game[];
  initialTimelineEvents: TimelineEvent[];
  initialPlatforms: Platform[];
}

export default function TimelineWrapper({ initialGames, initialTimelineEvents, initialPlatforms }: Props) {
  const router = useRouter();

  const handleSelectGame = (game: Game) => {
    router.push(`/games/${game.id}`);
  };

  return <Timeline games={initialGames} timelineEvents={initialTimelineEvents} platforms={initialPlatforms} onSelectGame={handleSelectGame} />;
}

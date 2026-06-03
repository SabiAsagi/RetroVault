"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Timeline from '@/components/Timeline';
import { Game, TimelineEvent } from '@/types';

interface Props {
  initialGames: Game[];
  initialTimelineEvents: TimelineEvent[];
}

export default function TimelineWrapper({ initialGames, initialTimelineEvents }: Props) {
  const router = useRouter();

  const handleSelectGame = (game: Game) => {
    router.push(`/games/${game.id}`);
  };

  return <Timeline games={initialGames} timelineEvents={initialTimelineEvents} onSelectGame={handleSelectGame} />;
}

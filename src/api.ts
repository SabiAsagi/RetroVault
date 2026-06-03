/**
 * api.ts — 로컬 데이터 전용 (백엔드 없음)
 * RAWG API 연동이 제거되고 data.ts의 샘플 데이터를 반환합니다.
 */
import { Game } from './types';
import { GameDataService } from './services/GameDataService';

export interface FetchGamesResult {
  games: Game[];
  status: 'local' | 'api' | 'cached' | 'override';
}

function filterGames(allGames: Game[], query: string): Game[] {
  if (!query.trim()) return allGames;
  const q = query.toLowerCase();
  return allGames.filter(
    g =>
      g.title.toLowerCase().includes(q) ||
      g.platform.toLowerCase().includes(q) ||
      (g.publisher || '').toLowerCase().includes(q) ||
      (g.developer || '').toLowerCase().includes(q) ||
      (g.genre || '').toLowerCase().includes(q) ||
      (g.country || '').toLowerCase().includes(q)
  );
}

export async function fetchGames(query: string = ''): Promise<FetchGamesResult> {
  const allGames = await GameDataService.getAllGames();
  const filtered = filterGames(allGames, query);
  
  // Status is a mix, we just return 'cached' to represent the pipeline
  return { games: filtered, status: 'cached' };
}

import { Game } from '../types';
import { games as mockApiGames } from '../data';

/**
 * GameDataService
 * 외부 API -> 내부 DB 캐시 -> 관리자 보완 (Admin Overrides) 파이프라인 시뮬레이션
 */
export const GameDataService = {
  /**
   * 1. 외부 API(또는 기본 정적 파일)에서 원본 데이터를 가져옵니다.
   */
  async fetchExternalApiGames(): Promise<Game[]> {
    // 실제로는 IGDB, RAWG 등 외부 API 호출을 수행하는 로직
    await new Promise(r => setTimeout(r, 100)); // Network delay simulation
    return JSON.parse(JSON.stringify(mockApiGames)); // Deep copy to prevent mutating static data
  },

  /**
   * 2. 내부 DB(현재는 localStorage)에 저장된 Admin Overrides를 가져옵니다.
   */
  getAdminOverrides(): Record<string, Partial<Game>> {
    try {
      const stored = localStorage.getItem('retrovault_admin_overrides');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Failed to load admin overrides', e);
      return {};
    }
  },

  /**
   * 3. 관리자 Override 데이터를 저장합니다. (Create/Update 대응)
   */
  setAdminOverride(gameId: string, overrideData: Partial<Game>) {
    const overrides = this.getAdminOverrides();
    // 신규 게임 추가(Create) 시 id가 포함되어 넘어옴, 기존 수정 시 Partial
    overrides[gameId] = { ...overrides[gameId], ...overrideData };
    localStorage.setItem('retrovault_admin_overrides', JSON.stringify(overrides));
  },

  /**
   * 4. 게임 데이터 삭제 시뮬레이션 (삭제된 ID 목록 관리)
   */
  getDeletedGameIds(): string[] {
    try {
      const stored = localStorage.getItem('retrovault_deleted_games');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  setDeletedGameId(gameId: string) {
    const deleted = this.getDeletedGameIds();
    if (!deleted.includes(gameId)) {
      deleted.push(gameId);
      localStorage.setItem('retrovault_deleted_games', JSON.stringify(deleted));
    }
  },

  /**
   * 5. 전체 파이프라인을 거쳐 최종 게임 목록을 반환합니다.
   * [External API] + [Admin New Games] -> [Admin Overrides 적용] -> [Deleted 필터링]
   */
  async getAllGames(): Promise<Game[]> {
    const externalGames = await this.fetchExternalApiGames();
    const overrides = this.getAdminOverrides();
    const deletedIds = this.getDeletedGameIds();

    // 1. 기존 데이터에 Override 병합
    const mergedGames = externalGames.map(game => {
      if (overrides[game.id]) {
        return { ...game, ...overrides[game.id] };
      }
      return game;
    });

    // 2. 외부 API에 없는 신규 관리자 생성 게임 추가
    const existingIds = new Set(mergedGames.map(g => g.id));
    Object.keys(overrides).forEach(id => {
      if (!existingIds.has(id)) {
        // 필수 필드가 있다고 가정 (Admin에서 생성한 완전한 객체)
        mergedGames.push(overrides[id] as Game);
      }
    });

    // 3. 삭제된 게임 필터링 후 반환
    return mergedGames.filter(g => !deletedIds.includes(g.id));
  }
};

import { CollectionItem, Game } from '../types';

export interface Emblem {
  id: string;
  name: string;
  description: string;
  iconName: string; // Used to pick Lucide icon
  targetCount: number;
  currentCount: number;
  isUnlocked: boolean;
  colorClass: string;
  reward: string;
}

export function calculateEmblems(collection: CollectionItem[], games: Game[]): Emblem[] {
  const collectionGames = collection
    .map(c => ({ item: c, game: games.find(g => g.id === c.gameId) }))
    .filter((cg): cg is { item: CollectionItem; game: NonNullable<typeof cg.game> } => !!cg.game);

  // 1. 컬렉터 (Collector): 게임 50개 등록
  const totalCount = collectionGames.length;

  // 2. 역사가 (Historian): 게임 평가(rating > 0) 또는 메모 작성 20회
  const historyCount = collectionGames.filter(cg => (cg.item.rating && cg.item.rating > 0) || (cg.item.memo && cg.item.memo.trim().length > 0)).length;

  // 3. 전설 (Legend): 동일 시리즈 5개 이상
  const seriesGroups: Record<string, number> = {};
  collectionGames.forEach(cg => {
    let seriesName = cg.game.title;
    if (cg.game.title.includes(':')) {
      seriesName = cg.game.title.split(':')[0].trim();
    } else if (cg.game.title.includes(' ')) {
      // Heuristic for games without colon like "Super Mario Bros."
      if (cg.game.title.startsWith('Super Mario')) seriesName = 'Super Mario';
      if (cg.game.title.startsWith('Pokémon')) seriesName = 'Pokémon';
    }
    seriesGroups[seriesName] = (seriesGroups[seriesName] || 0) + 1;
  });
  const maxSeriesCount = Math.max(0, ...Object.values(seriesGroups));

  // 4. 8-bit 입문자 (8-bit Beginner): 1980~1989년 게임 5개 이상
  const count80s = collectionGames.filter(cg => cg.game.releaseYear >= 1980 && cg.game.releaseYear <= 1989).length;

  // 5. 디스크 시대 수집가 (Disc Era Collector): PlayStation, PlayStation 2, Dreamcast 게임 10개 이상
  const discPlatforms = ['PlayStation', 'PlayStation 2', 'Dreamcast'];
  const countDisc = collectionGames.filter(cg => discPlatforms.includes(cg.game.platform)).length;

  // 6. 봉인 보관자 (Sealed Keeper): 미개봉 상태 3개 이상
  const countSealed = collectionGames.filter(cg => cg.item.status === '미개봉').length;

  const createEmblem = (
    id: string, name: string, description: string, iconName: string, 
    currentCount: number, targetCount: number, colorClass: string, reward: string
  ): Emblem => ({
    id, name, description, iconName, reward,
    currentCount: Math.min(currentCount, targetCount),
    targetCount,
    isUnlocked: currentCount >= targetCount,
    colorClass
  });

  return [
    createEmblem(
      'collector', '컬렉터', '게임 50개 이상 등록', 
      'star', totalCount, 50, 'text-mint border-mint', '컬렉션 페이지 전용 "Collector" 장식'
    ),
    createEmblem(
      'historian', '역사가', '게임 평가 및 메모 20회 작성', 
      'history', historyCount, 20, 'text-neon-blue border-neon-blue', '프로필 "역사가" 배지 및 특별 테마'
    ),
    createEmblem(
      'legend', '전설', '동일 시리즈 게임 5개 이상 수집', 
      'layers', maxSeriesCount, 5, 'text-amber border-amber', '마스터피스 아이콘 해금'
    ),
    createEmblem(
      'beginner-8bit', '8-bit 입문자', '1980년대 게임 5개 등록', 
      'gamepad', count80s, 5, 'text-neon-purple border-neon-purple', '8-bit 픽셀 엠블럼 테마'
    ),
    createEmblem(
      'disc-era', '디스크 시대 수집가', 'CD 기반 콘솔 게임 10개 등록', 
      'disc', countDisc, 10, 'text-[#00439C] border-[#00439C]', '회전하는 디스크 프로필 테두리'
    ),
    createEmblem(
      'sealed-keeper', '봉인 보관자', '미개봉 게임 3개 등록', 
      'package', countSealed, 3, 'text-coral border-coral', '프로필 "봉인" 스티커 에셋'
    )
  ];
}

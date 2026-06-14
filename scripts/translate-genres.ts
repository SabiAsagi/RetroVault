import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IGDB 장르명 → 한글 매핑
const GENRE_TRANSLATIONS: Record<string, string> = {
  // IGDB 공식 장르
  'Point-and-click': '포인트 앤 클릭',
  'Fighting': '격투',
  'Shooter': '슈팅',
  'Music': '음악/리듬',
  'Platform': '플랫포머',
  'Puzzle': '퍼즐',
  'Racing': '레이싱',
  'Real Time Strategy (RTS)': '실시간 전략 (RTS)',
  'Role-playing (RPG)': '롤플레잉 (RPG)',
  'Simulator': '시뮬레이션',
  'Sport': '스포츠',
  'Strategy': '전략',
  'Turn-based strategy (TBS)': '턴제 전략 (TBS)',
  'Tactical': '택티컬',
  'Hack and slash/Beat \'em up': '핵 앤 슬래시 / 벨트스크롤',
  'Quiz/Trivia': '퀴즈/트리비아',
  'Pinball': '핀볼',
  'Adventure': '어드벤처',
  'Indie': '인디',
  'Arcade': '아케이드',
  'Visual Novel': '비주얼 노벨',
  'Card & Board Game': '카드/보드 게임',
  'MOBA': 'MOBA',
  'Maze': '미로',
  'Beat \'em up': '벨트스크롤 액션',
  'Action RPG': '액션 RPG (ARPG)',
  'Run and Gun': '런앤건',

  // 일반적인 영문 장르명
  'Action': '액션',
  'RPG': '롤플레잉',
  'Simulation': '시뮬레이션',
  'Sports': '스포츠',
  'Platformer': '플랫포머',
  'Action-Adventure': '액션 어드벤처',
  'Survival': '서바이벌',
  'Horror': '호러',
  'Survival Horror': '서바이벌 호러',
  'Stealth': '잠입 액션',
  'Open World': '오픈 월드',
  'Sandbox': '샌드박스',
  'Battle Royale': '배틀로얄',
  'Roguelike': '로그라이크',
  'Roguelite': '로그라이트',
  'Metroidvania': '메트로배니아',
  'Tower Defense': '타워 디펜스',
  'Rhythm': '리듬',
  'Educational': '교육용',
  'Party': '파티',
  'Trivia': '퀴즈',
  'Board Game': '보드 게임',
  'Card Game': '카드 게임',
  'Word Game': '워드 게임',
  'MMO': 'MMO',
  'MMORPG': 'MMORPG',
  // 형식별 구분
  'Card Game': '카드 게임',
  'Board Game': '보드 게임',
  'TCG': 'TCG',
  'Console Game': '콘솔 게임',
  'PC Game': 'PC 게임',
  'Web Game': '웹 게임',
  'Browser Game': '웹 게임',
  'Online Game': '온라인 게임',
  'Mobile Game': '모바일 게임',
  'Social Game': '소셜 게임',
  'Flash Game': '플래시 게임',
  'Singleplayer': '싱글 플레이어',
  'Multiplayer': '멀티 플레이어',
  'PvP': 'PvP',
  'PvE': 'PvE',
  'Deathmatch': '데스매치',
  'Last Man Standing': '라스트 맨 스탠딩',

  // 판매 에디션 및 형식별 구분
  'Expansion': '확장판',
  'Expansion Pack': '확장팩',
  'Free to Play': '부분 유료화 (F2P)',
  'F2P': '부분 유료화 (F2P)',
  'Freemium': '부분 유료화',
  'Episodic': '에피소딕 (분할 판매)',
  'Collector\'s Edition': '컬렉터스 에디션',
  'Limited Edition': '한정판',
  'Remake': '리메이크',
  'Remaster': '리마스터',
  'Port': '이식작',

  // 기타 일반 장르
  'Flight': '비행 시뮬레이션',
  'Driving': '드라이빙',
  'Wrestling': '프로레슬링',
  'Baseball': '야구',
  'Basketball': '농구',
  'Football': '미식축구',
  'Soccer': '축구',
  'Golf': '골프',
  'Tennis': '테니스',
  'Fishing': '낚시',
  'Hunting': '사냥',
  'Unknown': '미분류',
};

async function main() {
  console.log('게임 장르를 한국어로 변환 중...');

  // 현재 DB에 있는 고유 장르 목록 확인
  const genres = await prisma.game.findMany({
    select: { genre: true },
    distinct: ['genre'],
  });

  const uniqueGenres = [...new Set(genres.map(g => g.genre))].filter(Boolean);
  console.log(`\n현재 DB 장르 목록 (${uniqueGenres.length}개):`);
  uniqueGenres.forEach(g => console.log(`  - ${g}`));

  let totalUpdated = 0;

  for (const genre of uniqueGenres) {
    const translation = GENRE_TRANSLATIONS[genre];
    if (translation && translation !== genre) {
      // 이미 한글인 경우 스킵
      if (genre === translation) {
        console.log(`⏭️ 이미 한글: ${genre}`);
        continue;
      }

      const result = await prisma.game.updateMany({
        where: { genre },
        data: { genre: translation },
      });

      console.log(`✅ ${genre} → ${translation} (${result.count}개 게임 업데이트)`);
      totalUpdated += result.count;
    } else if (!translation) {
      console.log(`⚠️ 번역 없음: ${genre}`);
    }
  }

  console.log(`\n완료! 총 ${totalUpdated}개 게임의 장르가 한글화되었습니다.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

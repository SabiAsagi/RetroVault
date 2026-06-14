import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IGDB country codes (ISO 3166-1 numeric) → 한글 국가명
const COUNTRY_MAP: Record<number, string> = {
  392: '일본', 840: '미국', 826: '영국', 250: '프랑스', 276: '독일',
  124: '캐나다', 410: '대한민국', 156: '중국', 158: '대만', 752: '스웨덴',
  578: '노르웨이', 246: '핀란드', 380: '이탈리아', 724: '스페인', 36: '호주',
  528: '네덜란드', 616: '폴란드', 203: '체코', 804: '우크라이나', 643: '러시아',
  56: '벨기에', 40: '오스트리아', 756: '스위스', 710: '남아프리카', 76: '브라질',
  484: '멕시코', 32: '아르헨티나', 356: '인도', 702: '싱가포르', 554: '뉴질랜드',
  208: '덴마크', 352: '아이슬란드', 372: '아일랜드', 442: '룩셈부르크',
  792: '터키', 376: '이스라엘', 364: '이란', 818: '이집트',
  764: '태국', 360: '인도네시아', 458: '말레이시아', 608: '필리핀', 704: '베트남',
};

const COMPANY_TRANSLATIONS: Record<string, any> = {
  // ── 일본 대형 퍼블리셔/개발사 ──────────────────────────────────────────
  'Nintendo': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '슈퍼 마리오, 젤다의 전설, 포켓몬스터, 동물의 숲, 스플래툰, 파이어 엠블렘',
    keyFigures: '미야모토 시게루, 이와타 사토루(故), 후루카와 슌타로',
    subsidiaries: 'Retro Studios, Next Level Games, Monolith Soft, NDcube',
    description: '1889년 화투 제조사로 시작하여 세계 최대의 게임 회사로 성장한 일본 교토의 기업. 마리오, 젤다, 포켓몬스터 등 세계에서 가장 유명한 게임 프랜차이즈를 다수 보유하고 있으며, 독자적인 하드웨어 전략으로 게임 산업의 역사를 이끌어왔습니다.',
  },
  'Sony Interactive Entertainment': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '갓 오브 워, 언차티드, 라스트 오브 어스, 호라이즌, 스파이더맨',
    keyFigures: '쿠타라기 켄, 짐 라이언, 허먼 헐스트',
    subsidiaries: 'Naughty Dog, Insomniac Games, Guerrilla Games, Santa Monica Studio, Sucker Punch, Polyphony Digital, Bluepoint Games, Housemarque, Firesprite, Bungie',
    description: '소니 그룹 산하의 게임 사업 부문. 플레이스테이션 브랜드를 통해 PS1부터 PS5까지 역대급 콘솔 하드웨어를 출시해 왔으며, 산하 스튜디오들의 뛰어난 싱글 플레이어 독점작으로 유명합니다.',
  },
  'Sega': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '소닉 더 헤지혹, 용과 같이(류가 고토쿠), 페르소나, 토탈 워, 풋볼 매니저',
    keyFigures: '나카 유지, 스즈키 유, 나가오시 하루키',
    subsidiaries: 'Atlus, Ryu Ga Gotoku Studio, Creative Assembly, Sports Interactive, Amplitude Studios',
    description: '한때 "세가 vs 닌텐도"로 대표되는 콘솔 전쟁의 주인공이었던 일본 게임 회사. 드림캐스트를 마지막으로 하드웨어 사업을 접고 현재는 서드파티 게임 퍼블리셔로 활동하며, Atlus 인수 후 페르소나/진 여신전생 시리즈도 보유하고 있습니다.',
  },
  'Capcom': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '몬스터 헌터, 바이오하자드(레지던트 이블), 스트리트 파이터, 데빌 메이 크라이, 에이스 어터니',
    keyFigures: '츠지모토 하루히로, 이츠노 히데아키, 오노 요시노리',
    description: '1979년 설립된 일본 오사카의 게임 회사. 아케이드 게임에서 시작하여 스트리트 파이터로 격투 게임 장르를 정의했으며, 몬스터 헌터와 바이오하자드 시리즈로 전 세계적인 성공을 거두고 있습니다.',
  },
  'Konami': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '메탈기어 솔리드, 사일런트 힐, 악마성 드라큘라(캐슬바니아), 위닝일레븐(eFootball), 유희왕',
    keyFigures: '코지마 히데오(퇴사), 고즈키 히데키',
    description: '1969년 설립된 일본 게임 및 엔터테인먼트 기업. 메탈기어 솔리드, 사일런트 힐, 악마성 드라큘라 등 전설적인 시리즈를 보유하고 있으며, 현재는 모바일 및 디지털 엔터테인먼트 사업에 주력하고 있습니다.',
  },
  'Square Enix': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '파이널 판타지, 드래곤 퀘스트, 킹덤 하츠, NieR',
    keyFigures: '사카구치 히로노부(퇴사), 요시다 나오키, 키타세 요시노리',
    subsidiaries: 'Luminous Productions',
    description: '2003년 스퀘어(파이널 판타지)와 에닉스(드래곤 퀘스트)가 합병하여 탄생한 일본의 대형 게임 회사. JRPG 장르의 양대 산맥을 모두 보유한 유일한 기업으로, 파이널 판타지 시리즈는 전 세계적으로 사랑받고 있습니다.',
  },
  'Bandai Namco Entertainment': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '테일즈, 철권, 소울칼리버, 에이스 컴뱃, 건담, 다크 소울(퍼블리싱), 팩맨',
    keyFigures: '하라다 카츠히로, 미야사코 히데타카(From Software)',
    subsidiaries: 'Bandai Namco Studios',
    description: '2006년 반다이(장난감)와 남코(게임)가 합병하여 설립. 철권, 팩맨 같은 고전 IP부터 건담 같은 애니메이션 게임화까지 폭넓은 포트폴리오를 갖추고 있으며, 다크 소울/엘든 링의 퍼블리셔로도 유명합니다.',
  },
  'Bandai Namco Games': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '테일즈, 철권, 소울칼리버, 에이스 컴뱃, 건담, 팩맨',
    keyFigures: '하라다 카츠히로',
    description: 'Bandai Namco Entertainment의 전신. 반다이와 남코의 합병으로 탄생한 게임 부문으로, 이후 Bandai Namco Entertainment로 사명이 변경되었습니다.',
  },
  'Atlus': {
    country: '일본',
    companyStatus: '운영 중 (세가 산하)',
    flagshipFranchises: '페르소나, 진 여신전생, 에트리안 오디세이, 13기병 방위권',
    keyFigures: '하시노 카츠라, 소에지마 시게노리, 메구로 쇼지',
    description: '1986년 설립된 일본 게임 회사. 페르소나 시리즈와 진 여신전생 시리즈로 유명하며, 독특한 세계관과 스타일리시한 연출, 뛰어난 음악으로 열광적인 팬층을 보유하고 있습니다. 현재 세가의 자회사입니다.',
  },
  'KOEI TECMO Games': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '삼국무쌍, 진삼국무쌍, 닌자 가이덴, 데드 오어 얼라이브, 아틀리에',
    keyFigures: '시부사와 코우(에리카와 요이치)',
    subsidiaries: 'Team Ninja, Gust, Omega Force',
    description: '2010년 코에이(삼국지, 대항해시대)와 테크모(닌자 가이덴, DOA)가 합병하여 설립. 무쌍 시리즈와 역사 시뮬레이션 게임의 대명사이며, Team Ninja의 액션 게임도 높은 평가를 받고 있습니다.',
  },
  'SNK': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '더 킹 오브 파이터즈(KOF), 메탈슬러그, 사무라이 쇼다운, 페이탈 퓨리',
    keyFigures: '카와사키 에이이치',
    description: '네오지오 하드웨어와 함께 수많은 아케이드 명작을 탄생시킨 일본 게임 회사. 한때 도산했으나 부활하여, 현재 사우디 아라비아의 MiSK 재단 산하에서 KOF, 사무라이 쇼다운 등의 신작을 개발하고 있습니다.',
  },
  'From Software': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '다크 소울, 엘든 링, 세키로, 블러드본, 아머드 코어',
    keyFigures: '미야자키 히데타카',
    description: '1986년 설립. 킹스 필드에서 시작하여 데몬즈 소울, 다크 소울을 거쳐 "소울라이크" 장르를 창시한 일본 게임 개발사. 엘든 링은 조지 R.R. 마틴과의 협업으로 글로벌 게임 어워드를 석권했습니다.',
  },
  'PlatinumGames': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '베요네타, NieR: 오토마타, 아스트랄 체인',
    keyFigures: '카미야 히데키, 이나바 아츠시',
    description: '2006년 클로버 스튜디오(갓 핸드, 오카미) 출신 개발자들이 설립한 액션 게임 전문 개발사. 캐릭터 액션 게임의 최고봉으로 평가받으며, 현란하고 중독성 있는 전투 시스템이 특징입니다.',
  },
  'Level-5': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '레이튼 교수, 이나즈마 일레븐, 요괴워치, 니노쿠니',
    keyFigures: '히노 아키히로',
    description: '1998년 설립. 드래곤 퀘스트 VIII의 개발로 주목받았으며, 레이튼 교수와 요괴워치 시리즈로 대성공을 거뒀습니다. 스튜디오 지브리와 협업한 니노쿠니도 높은 평가를 받았습니다.',
  },
  'HAL Laboratory': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '별의 커비, 대난투 스매시 브라더스',
    keyFigures: '사쿠라이 마사히로, 이와타 사토루(故)',
    description: '닌텐도와 긴밀한 파트너십을 맺고 있는 일본 게임 개발사. 별의 커비 시리즈의 개발사로 유명하며, 대난투 스매시 브라더스의 첫 작품도 이곳에서 탄생했습니다. 故 닌텐도 사장 이와타 사토루가 한때 사장을 역임했습니다.',
  },
  'Intelligent Systems': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '파이어 엠블렘, 종이 마리오, 어드밴스 워즈',
    description: '닌텐도 산하의 개발사로, 파이어 엠블렘 시리즈와 종이 마리오 시리즈를 개발하고 있습니다. 전략 시뮬레이션 RPG 장르의 선구자적 존재입니다.',
  },
  'Game Freak': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '포켓몬스터',
    keyFigures: '타지리 사토시, 마스다 준이치, 오모리 시게루',
    description: '포켓몬스터 시리즈의 메인 개발사. 1989년 설립되어 포켓몬스터 레드/그린(1996)부터 현재까지 세계 최대 미디어 프랜차이즈의 게임 부문을 담당하고 있습니다.',
  },
  'Treasure': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '건스타 히어로즈, 이카루가, 실루엣 미라쥬, 가디언 히어로즈',
    description: '1992년 코나미 출신 개발자들이 설립한 게임 개발사. 건스타 히어로즈, 이카루가 등 장인 정신이 깃든 하드코어 액션/슈팅 게임으로 높은 평가를 받고 있으며, 독특한 게임 디자인으로 유명합니다.',
  },
  'Falcom': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '이스, 영웅전설(궤적 시리즈), 도쿄 재너두',
    keyFigures: '콘도 토시히로',
    description: '1981년 설립된 일본의 노포 RPG 개발사. 이스 시리즈와 영웅전설/궤적 시리즈로 유명하며, 뛰어난 음악과 스토리, 빠른 액션 전투로 충성도 높은 팬층을 보유하고 있습니다.',
  },
  'Nihon Falcom': {
    country: '일본',
    companyStatus: '운영 중',
    flagshipFranchises: '이스, 영웅전설(궤적 시리즈), 도쿄 재너두',
    keyFigures: '콘도 토시히로',
    description: '1981년 설립된 일본의 노포 RPG 개발사. 이스 시리즈와 영웅전설/궤적 시리즈로 유명하며, 뛰어난 음악과 스토리, 빠른 액션 전투로 충성도 높은 팬층을 보유하고 있습니다.',
  },

  // ── 미국 대형 퍼블리셔/개발사 ──────────────────────────────────────────
  'Microsoft Studios': {
    country: '미국',
    companyStatus: '운영 중',
    flagshipFranchises: '헤일로, 기어스 오브 워, 포르자, 마인크래프트, 엘더스크롤, 폴아웃, 디아블로',
    keyFigures: '필 스펜서',
    subsidiaries: 'Bethesda, Activision Blizzard, Obsidian, Ninja Theory, Double Fine, id Software',
    description: '마이크로소프트의 게임 퍼블리싱 부문 (현 Xbox Game Studios). Xbox 브랜드와 Game Pass 서비스를 운영하며, 2023년 Activision Blizzard를 역대 최대 규모로 인수하여 세계 3대 게임 기업이 되었습니다.',
  },
  'Xbox Game Studios': {
    country: '미국',
    companyStatus: '운영 중',
    flagshipFranchises: '헤일로, 기어스 오브 워, 포르자, 마인크래프트, 엘더스크롤, 폴아웃',
    keyFigures: '필 스펜서, 매트 부티',
    subsidiaries: 'Bethesda, Obsidian, Ninja Theory, Double Fine, The Coalition, Turn 10',
    description: 'Microsoft Studios에서 리브랜딩된 마이크로소프트의 게임 퍼블리싱 부문. Xbox 생태계를 위한 독점 타이틀을 개발/퍼블리싱합니다.',
  },
  'Activision': {
    country: '미국',
    companyStatus: '인수됨 (Microsoft)',
    flagshipFranchises: '콜 오브 듀티, 크래시 밴디쿳, 토니 호크, 스파이로',
    keyFigures: '바비 코틱(퇴임)',
    description: '1979년 세계 최초의 서드파티 게임 퍼블리셔로 설립. 콜 오브 듀티 시리즈로 FPS 장르를 대표하며, 2023년 마이크로소프트에 약 690억 달러에 인수되었습니다.',
  },
  'Activision Blizzard': {
    country: '미국',
    companyStatus: '인수됨 (Microsoft)',
    flagshipFranchises: '콜 오브 듀티, 월드 오브 워크래프트, 오버워치, 디아블로, 캔디 크러시',
    keyFigures: '바비 코틱(퇴임)',
    subsidiaries: 'Blizzard Entertainment, King, Infinity Ward, Treyarch, Raven Software',
    description: '2008년 Activision과 Vivendi Games(Blizzard 모회사)가 합병하여 설립. 2023년 마이크로소프트에 인수되어 현재 Xbox 산하에서 운영됩니다.',
  },
  'Electronic Arts': {
    country: '미국',
    companyStatus: '운영 중',
    flagshipFranchises: 'EA SPORTS FC(FIFA), 매든 NFL, 배틀필드, 더 심즈, 에이펙스 레전드, 스타워즈 제다이',
    keyFigures: '앤드류 윌슨',
    subsidiaries: 'DICE, Respawn Entertainment, BioWare, Maxis, Criterion',
    description: '1982년 설립된 세계 최대 규모의 게임 퍼블리셔 중 하나. 스포츠 게임의 대명사이자, 배틀필드, 더 심즈 등 다양한 장르의 메가 프랜차이즈를 보유하고 있습니다.',
  },
  'Blizzard Entertainment': {
    country: '미국',
    companyStatus: '운영 중 (Microsoft/Activision Blizzard 산하)',
    flagshipFranchises: '월드 오브 워크래프트, 디아블로, 오버워치, 스타크래프트, 하스스톤',
    keyFigures: '마이크 이바라',
    description: '1991년 설립. 워크래프트, 스타크래프트, 디아블로라는 3대 IP로 PC 게임의 황금기를 이끌었으며, WoW로 MMORPG를 대중화시켰습니다. 한국에서도 스타크래프트/오버워치로 엄청난 인기를 끌었습니다.',
  },
  'Bethesda Softworks': {
    country: '미국',
    companyStatus: '운영 중 (Microsoft 산하)',
    flagshipFranchises: '엘더스크롤, 폴아웃, 둠, 스타필드, 울펜슈타인',
    keyFigures: '토드 하워드',
    subsidiaries: 'Bethesda Game Studios, id Software, MachineGames, Arkane Studios, Tango Gameworks',
    description: '1986년 설립. 엘더스크롤과 폴아웃 시리즈로 오픈 월드 RPG의 대명사가 되었으며, 2021년 마이크로소프트에 인수되었습니다.',
  },
  'Rockstar Games': {
    country: '미국',
    companyStatus: '운영 중',
    flagshipFranchises: 'Grand Theft Auto(GTA), 레드 데드 리뎀션, 맥스 페인, 불리',
    keyFigures: '샘 하우저, 댄 하우저(퇴사)',
    subsidiaries: 'Rockstar North, Rockstar San Diego, Rockstar New England',
    description: '1998년 설립. GTA 시리즈로 오픈 월드 액션 게임의 기준을 세웠으며, GTA V는 역사상 가장 많이 팔린 게임 중 하나입니다. Take-Two Interactive의 자회사입니다.',
  },
  'Epic Games': {
    country: '미국',
    companyStatus: '운영 중',
    flagshipFranchises: '포트나이트, 언리얼 토너먼트, 기어스 오브 워(이관)',
    keyFigures: '팀 스위니',
    description: '1991년 설립. 언리얼 엔진이라는 게임 산업 표준 엔진을 개발하고 있으며, 포트나이트로 배틀로얄 장르의 대중화와 게임 내 문화 현상을 이끌었습니다. Epic Games Store도 운영하고 있습니다.',
  },
  'Valve': {
    country: '미국',
    companyStatus: '운영 중',
    flagshipFranchises: '하프라이프, 포탈, 카운터 스트라이크, 도타 2, 레프트 4 데드, 팀 포트리스',
    keyFigures: '게이브 뉴웰',
    description: '1996년 설립. 하프라이프로 FPS 스토리텔링의 기준을 세웠고, Steam이라는 세계 최대 PC 게임 디지털 유통 플랫폼을 운영합니다. 최근 Steam Deck으로 휴대용 PC 게이밍 시장도 개척하고 있습니다.',
  },
  'id Software': {
    country: '미국',
    companyStatus: '운영 중 (Microsoft/Bethesda 산하)',
    flagshipFranchises: '둠, 퀘이크, 울펜슈타인(원작)',
    keyFigures: '존 카맥(퇴사), 존 로메로(퇴사), 휴고 마틴',
    description: '1991년 설립. 둠과 퀘이크로 FPS 장르를 창시하고 3D 게임 엔진의 기술 혁신을 이끈 전설적인 개발사. id Tech 엔진으로 현재도 기술적 선두를 유지하고 있습니다.',
  },
  'Bungie': {
    country: '미국',
    companyStatus: '운영 중 (Sony 산하)',
    flagshipFranchises: '헤일로(이관), 데스티니',
    keyFigures: '제이슨 존스',
    description: '1991년 설립. 헤일로 시리즈로 Xbox의 성공을 견인한 후 독립하여 데스티니 시리즈를 개발. 2022년 소니에 인수되었으며, 라이브 서비스 게임의 노하우를 보유하고 있습니다.',
  },
  'Naughty Dog': {
    country: '미국',
    companyStatus: '운영 중 (Sony 산하)',
    flagshipFranchises: '언차티드, 라스트 오브 어스, 크래시 밴디쿳(이관), 잭 앤 덱스터',
    keyFigures: '닐 드럭만',
    description: '1984년 설립. 소니 산하의 최정예 개발 스튜디오로, 언차티드와 라스트 오브 어스 시리즈로 시네마틱 액션 어드벤처의 최고봉을 보여주고 있습니다.',
  },
  'Insomniac Games': {
    country: '미국',
    companyStatus: '운영 중 (Sony 산하)',
    flagshipFranchises: '마블 스파이더맨, 라쳇 앤 클랭크, 레지스탕스',
    keyFigures: '테드 프라이스',
    description: '1994년 설립. 마블 스파이더맨 시리즈의 대성공으로 주목받은 소니 산하 개발사. 라쳇 앤 클랭크 시리즈부터 이어온 쾌적한 액션 게임 제작 노하우를 보유하고 있습니다.',
  },

  // ── 유럽 ─────────────────────────────────────────────────────────────
  'Ubisoft': {
    country: '프랑스',
    companyStatus: '운영 중',
    flagshipFranchises: '어쌔신 크리드, 파 크라이, 톰 클랜시 시리즈, 저스트 댄스, 레이맨',
    keyFigures: '이브 기유모',
    subsidiaries: 'Ubisoft Montreal, Ubisoft Quebec, Massive Entertainment, Blue Byte',
    description: '1986년 프랑스에서 설립된 세계 최대 규모의 유럽 게임 회사. 어쌔신 크리드 시리즈를 필두로 오픈 월드 게임에 강점을 보이며, 전 세계에 걸친 대규모 개발 네트워크를 운영하고 있습니다.',
  },
  'CD Projekt': {
    country: '폴란드',
    companyStatus: '운영 중',
    flagshipFranchises: '위쳐, 사이버펑크 2077',
    keyFigures: '마르친 이윈스키, 미하우 노바코프스키',
    subsidiaries: 'CD Projekt RED',
    description: '1994년 폴란드에서 설립. 위쳐 시리즈로 유럽산 RPG의 새로운 기준을 세웠으며, GOG.com이라는 DRM 프리 디지털 유통 플랫폼도 운영합니다. 사이버펑크 2077은 출시 초기 논란이 있었으나 이후 대규모 업데이트로 재평가를 받았습니다.',
  },
  'CD Projekt RED': {
    country: '폴란드',
    companyStatus: '운영 중',
    flagshipFranchises: '위쳐, 사이버펑크 2077',
    keyFigures: '미하우 노바코프스키',
    description: 'CD Projekt의 게임 개발 부문. 위쳐 3: 와일드 헌트는 역대 최고의 RPG 중 하나로 평가받으며, 뛰어난 스토리텔링과 오픈 월드 디자인으로 전 세계 게이머의 사랑을 받았습니다.',
  },
  'Rare': {
    country: '영국',
    companyStatus: '운영 중 (Microsoft 산하)',
    flagshipFranchises: '동키콩 컨트리(이관), 밴조-카주이, 퍼펙트 다크, 골든아이 007, Sea of Thieves',
    description: '1985년 영국에서 설립. 닌텐도 시절 동키콩 컨트리, 골든아이 007 등을 개발했으며, 2002년 마이크로소프트에 인수된 후 Sea of Thieves로 라이브 서비스 게임의 성공 사례를 만들었습니다.',
  },
  'Guerrilla Games': {
    country: '네덜란드',
    companyStatus: '운영 중 (Sony 산하)',
    flagshipFranchises: '호라이즌 제로 던, 호라이즌 포비든 웨스트, 킬존',
    description: '2000년 네덜란드 암스테르담에서 설립된 소니 산하 개발사. 킬존 시리즈로 알려졌으나, 호라이즌 제로 던의 대성공으로 오픈 월드 액션 RPG 분야에서 두각을 나타내고 있습니다.',
  },
  'Remedy Entertainment': {
    country: '핀란드',
    companyStatus: '운영 중',
    flagshipFranchises: '맥스 페인(이관), 앨런 웨이크, 컨트롤, 퀀텀 브레이크',
    keyFigures: '셈 레이크',
    description: '1995년 핀란드에서 설립. 뛰어난 스토리텔링과 혁신적인 게임 메카닉으로 유명한 개발사. 앨런 웨이크, 컨트롤 등 독특한 세계관의 액션 게임을 제작합니다.',
  },

  // ── 한국 ─────────────────────────────────────────────────────────────
  'Nexon': {
    country: '대한민국',
    companyStatus: '운영 중',
    flagshipFranchises: '메이플스토리, 던전앤파이터, 카트라이더, 바람의 나라, 블루 아카이브',
    keyFigures: '김정주(故), 오웬 마호니',
    description: '1994년 설립된 한국의 대형 게임 회사. 세계 최초 그래픽 MMORPG 바람의 나라를 개발했으며, 무료 게임(F2P) 모델을 개척했습니다. 현재 일본 상장 기업으로 글로벌 운영 중입니다.',
  },
  'NCSoft': {
    country: '대한민국',
    companyStatus: '운영 중',
    flagshipFranchises: '리니지, 리니지2, 아이온, 블레이드 & 소울, 길드 워',
    keyFigures: '김택진',
    subsidiaries: 'ArenaNet',
    description: '1997년 설립. 리니지 시리즈로 MMORPG의 역사를 쓴 한국의 대표 게임 회사. 리니지와 리니지2는 한국 온라인 게임 문화의 상징이 되었습니다.',
  },
  'Smilegate': {
    country: '대한민국',
    companyStatus: '운영 중',
    flagshipFranchises: '크로스파이어, 로스트아크, 에픽세븐',
    keyFigures: '권혁빈',
    subsidiaries: 'Smilegate RPG',
    description: '2002년 설립. 크로스파이어는 전 세계(특히 중국)에서 가장 많은 유저를 보유한 FPS 중 하나이며, 로스트아크는 한국산 MMORPG/ARPG의 새로운 기준을 제시했습니다.',
  },
  'Krafton': {
    country: '대한민국',
    companyStatus: '운영 중',
    flagshipFranchises: 'PUBG(배틀그라운드), 테라(서비스 종료), 다크 앤 다커',
    keyFigures: '장병규, 김창한',
    subsidiaries: 'PUBG Studios, Striking Distance Studios, Unknown Worlds',
    description: '배틀그라운드(PUBG)를 개발하여 배틀로얄 장르의 세계적인 붐을 일으킨 한국 게임 회사. 크래프톤으로 사명을 변경하고 KOSPI에 상장했습니다.',
  },
  'Pearl Abyss': {
    country: '대한민국',
    companyStatus: '운영 중',
    flagshipFranchises: '검은사막, 도깨비',
    keyFigures: '김대일',
    description: '2010년 설립. 검은사막 온라인으로 뛰어난 그래픽과 자유도 높은 오픈 월드 MMORPG를 선보여 한국뿐만 아니라 전 세계적인 인기를 얻고 있습니다.',
  },
  'Kakao Games': {
    country: '대한민국',
    companyStatus: '운영 중',
    flagshipFranchises: '오딘, 아레스, 가디언 테일즈',
    description: '카카오 그룹의 게임 사업 부문. 자체 개발 및 퍼블리싱을 병행하며, 다양한 모바일/PC 게임을 서비스하고 있습니다.',
  },
  'Netmarble': {
    country: '대한민국',
    companyStatus: '운영 중',
    flagshipFranchises: '리니지2 레볼루션, 나이트 크로니클, 세븐나이츠, 모두의마블',
    keyFigures: '방준혁',
    description: '2000년 설립된 한국의 대형 모바일 게임 회사. 리니지2 레볼루션으로 모바일 MMORPG의 가능성을 증명했으며, 글로벌 게임 시장에서 활발히 활동하고 있습니다.',
  },
};

async function main() {
  console.log('회사(Company) 데이터를 한국어 설정으로 번역 및 업데이트 중...');

  const dbCompanies = await prisma.company.findMany();

  let updated = 0;
  let countryUpdated = 0;
  let skipped = 0;

  for (const company of dbCompanies) {
    const trans = COMPANY_TRANSLATIONS[company.name];
    if (trans) {
      const data: any = {};
      
      // 항상 업데이트
      if (trans.country) data.country = trans.country;
      if (trans.description) data.description = trans.description;
      if (trans.companyStatus) data.companyStatus = trans.companyStatus;
      
      // 비어있는 경우에만 채우기
      if (!company.flagshipFranchises && trans.flagshipFranchises) data.flagshipFranchises = trans.flagshipFranchises;
      if (!company.keyFigures && trans.keyFigures) data.keyFigures = trans.keyFigures;
      if (!company.subsidiaries && trans.subsidiaries) data.subsidiaries = trans.subsidiaries;
      
      // 기존에 데이터가 있어도 한글 데이터로 덮어쓰기
      if (trans.flagshipFranchises) data.flagshipFranchises = trans.flagshipFranchises;
      if (trans.keyFigures) data.keyFigures = trans.keyFigures;
      if (trans.subsidiaries) data.subsidiaries = trans.subsidiaries;

      if (Object.keys(data).length > 0) {
        await prisma.company.update({
          where: { id: company.id },
          data
        });
        console.log(`✅ Updated: ${company.name}`);
        updated++;
      }
    } else {
      // 번역 매핑에 없더라도, country가 숫자 코드인 경우 한글로 변환 시도
      if (company.country && /^\d+$/.test(company.country)) {
        const code = parseInt(company.country);
        const koreanCountry = COUNTRY_MAP[code];
        if (koreanCountry) {
          await prisma.company.update({
            where: { id: company.id },
            data: { country: koreanCountry }
          });
          console.log(`🌏 Country code updated: ${company.name} (${company.country} → ${koreanCountry})`);
          countryUpdated++;
        }
      }
      skipped++;
    }
  }

  console.log(`\n완료! 번역 업데이트: ${updated}개, 국가코드 변환: ${countryUpdated}개, 스킵: ${skipped}개`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

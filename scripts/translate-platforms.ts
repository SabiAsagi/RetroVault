import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLATFORM_TRANSLATIONS: Record<string, any> = {
  // ── Sony ────────────────────────────────────────────────────────────────
  'PlayStation': {
    name: '플레이스테이션 (PS1)',
    country: '일본',
    launchPrice: '39,800엔 (약 299달러)',
    specs: 'MIPS R3000A (33.8MHz), 2MB RAM, 1MB VRAM',
    mediaFormat: 'CD-ROM',
    discontinued: true,
    description: '소니 컴퓨터 엔터테인먼트가 1994년 출시한 5세대 가정용 게임기. 3D 그래픽을 대중화시키며 CD-ROM 매체를 채택해 비디오 게임 산업의 판도를 바꾼 전설적인 콘솔입니다.'
  },
  'PlayStation 2': {
    name: '플레이스테이션 2 (PS2)',
    country: '일본',
    launchPrice: '39,800엔 (약 299달러)',
    specs: 'Emotion Engine (294MHz), 32MB RAM, 4MB VRAM',
    mediaFormat: 'DVD-ROM, CD-ROM',
    discontinued: true,
    description: '소니가 2000년 출시한 6세대 게임기. DVD 플레이어 기능을 탑재해 엄청난 인기를 끌었으며, 전 세계 1억 5천만 대 이상 판매되어 역사상 가장 많이 팔린 게임기로 기록되어 있습니다.'
  },
  'PlayStation 3': {
    name: '플레이스테이션 3 (PS3)',
    country: '일본',
    launchPrice: '499달러 (20GB), 599달러 (60GB)',
    specs: 'Cell Broadband Engine (3.2GHz), 256MB XDR RAM, 256MB GDDR3 VRAM',
    mediaFormat: '블루레이 디스크, DVD, CD',
    discontinued: true,
    description: '2006년 출시된 7세대 콘솔. 블루레이 디스크를 채택하고 고성능 Cell 프로세서를 탑재하여 HD 그래픽 시대를 열었으나, 초기 비싼 가격과 개발의 어려움으로 고전하기도 했습니다.'
  },
  'PlayStation 4': {
    name: '플레이스테이션 4 (PS4)',
    country: '일본',
    launchPrice: '399달러',
    specs: 'AMD Jaguar 8-core (1.6GHz), 8GB GDDR5 RAM',
    mediaFormat: '블루레이 디스크, DVD',
    discontinued: false,
    description: '2013년 출시된 8세대 콘솔. 개발자 친화적인 PC 기반 아키텍처를 도입하여 성공을 거두었으며, 훌륭한 독점작들과 함께 전 세계적으로 큰 인기를 얻은 소니의 주력 콘솔입니다.'
  },
  'PlayStation 5': {
    name: '플레이스테이션 5 (PS5)',
    country: '일본',
    launchPrice: '499달러 (디스크), 399달러 (디지털)',
    specs: 'AMD Zen 2 8-core (3.5GHz), 16GB GDDR6 RAM, 825GB Custom SSD',
    mediaFormat: 'Ultra HD 블루레이',
    discontinued: false,
    description: '2020년 출시된 9세대 콘솔. 초고속 커스텀 SSD와 듀얼센스 컨트롤러의 햅틱 피드백, 적응형 트리거를 통해 차세대 게임 경험과 혁신적인 로딩 속도를 제공합니다.'
  },
  'PlayStation Portable': {
    name: '플레이스테이션 포터블 (PSP)',
    country: '일본',
    launchPrice: '19,800엔 (약 249달러)',
    specs: 'MIPS R4000 (333MHz), 32MB RAM',
    mediaFormat: 'UMD (Universal Media Disc)',
    discontinued: true,
    description: '소니의 첫 휴대용 게임기. 2004년 출시되어 당시로서는 파격적인 그래픽 성능과 멀티미디어(음악, 영화) 재생 기능을 자랑했습니다.'
  },
  'PlayStation Vita': {
    name: '플레이스테이션 비타 (PS Vita)',
    country: '일본',
    launchPrice: '24,980엔 (약 249달러)',
    specs: 'ARM Cortex-A9 4-core, 512MB RAM, 128MB VRAM',
    mediaFormat: 'PS Vita 전용 카드',
    discontinued: true,
    description: 'PSP의 후속작으로 2011년 출시. OLED 터치 스크린과 듀얼 아날로그 스틱, 후면 터치패드 등 뛰어난 스펙을 가졌으나 스마트폰의 부상과 독점작 부족으로 아쉬운 성적을 남겼습니다.'
  },

  // ── Nintendo ────────────────────────────────────────────────────────────
  'Nintendo Entertainment System': {
    name: '패밀리 컴퓨터 / NES',
    country: '일본',
    launchPrice: '14,800엔 (약 199달러)',
    specs: 'Ricoh 2A03 (1.79MHz), 2KB RAM, 2KB VRAM',
    mediaFormat: '롬 카트리지',
    discontinued: true,
    description: '1983년 닌텐도가 출시한 8비트 콘솔. 아타리 쇼크로 무너진 게임 시장을 되살리며 십자키(D-Pad)와 슈퍼 마리오 브라더스 등 현대 게임의 기틀을 확립한 전설적인 기기입니다.'
  },
  'Super Nintendo Entertainment System': {
    name: '슈퍼 패미컴 / SNES',
    country: '일본',
    launchPrice: '25,000엔 (약 199달러)',
    specs: 'Ricoh 5A22 (3.58MHz), 128KB RAM, 64KB VRAM',
    mediaFormat: '롬 카트리지',
    discontinued: true,
    description: '1990년 출시된 16비트 게임기. 16비트 시대의 황금기를 이끌었으며 뛰어난 사운드 칩과 확대/축소/회전(모드 7) 기능을 바탕으로 수많은 명작 RPG와 액션 게임들을 배출했습니다.'
  },
  'Nintendo 64': {
    name: '닌텐도 64 (N64)',
    country: '일본',
    launchPrice: '25,000엔 (약 199달러)',
    specs: 'VR4300 (93.75MHz), 4MB Rambus RDRAM',
    mediaFormat: '롬 카트리지',
    discontinued: true,
    description: '1996년 출시된 닌텐도의 64비트 게임기. 3D 아날로그 스틱을 최초로 도입하였고 슈퍼 마리오 64, 젤다의 전설 시간의 오카리나 등 3D 게임의 방향성을 제시한 명작들을 낳았습니다.'
  },
  'Nintendo GameCube': {
    name: '닌텐도 게임큐브',
    country: '일본',
    launchPrice: '25,000엔 (약 199달러)',
    specs: 'IBM PowerPC "Gekko" (485MHz), 43MB RAM',
    mediaFormat: '미니 DVD',
    discontinued: true,
    description: '2001년 출시. 닌텐도 최초로 광학 매체(미니 DVD)를 도입했으며 콤팩트한 큐브 형태의 디자인이 특징입니다. 성능은 뛰어났으나 PS2와의 경쟁에서 고전했습니다.'
  },
  'Wii': {
    name: 'Wii (위)',
    country: '일본',
    launchPrice: '25,000엔 (약 249달러)',
    specs: 'IBM PowerPC "Broadway" (729MHz), 88MB RAM',
    mediaFormat: 'Wii 옵티컬 디스크',
    discontinued: true,
    description: '2006년 출시. 모션 컨트롤러인 Wii 리모컨을 통해 직관적인 체감형 조작을 선보이며 전 세계적인 신드롬을 일으킨, 닌텐도 최고의 흥행 콘솔 중 하나입니다.'
  },
  'Wii U': {
    name: 'Wii U (위 유)',
    country: '일본',
    launchPrice: '26,250엔 (약 299달러)',
    specs: 'IBM PowerPC "Espresso" (1.24GHz), 2GB RAM',
    mediaFormat: 'Wii U 옵티컬 디스크',
    discontinued: true,
    description: '2012년 출시. 태블릿 형태의 Wii U 게임패드를 특징으로 비대칭 게임플레이를 시도했으나, 모호한 컨셉과 서드파티 부족으로 닌텐도 역사상 가장 부진한 판매량을 기록했습니다.'
  },
  'Nintendo Switch': {
    name: '닌텐도 스위치',
    country: '일본',
    launchPrice: '29,980엔 (약 299달러)',
    specs: 'NVIDIA Tegra X1, 4GB LPDDR4',
    mediaFormat: '스위치 게임 카드',
    discontinued: false,
    description: '2017년 출시된 닌텐도의 하이브리드 콘솔. 거치형과 휴대형을 자유롭게 오가는 혁신적인 폼팩터와 압도적인 퍼스트파티 라인업으로 대성공을 거두고 있습니다.'
  },
  'Game Boy': {
    name: '게임보이',
    country: '일본',
    launchPrice: '12,500엔 (약 89달러)',
    specs: 'Custom 8-bit Sharp LR35902 (4.19MHz), 8KB RAM',
    mediaFormat: '게임보이 카트리지',
    discontinued: true,
    description: '1989년 출시된 전설적인 휴대용 게임기. 흑백 도트 매트릭스 액정과 건전지 구동으로 압도적인 배터리 타임을 달성하며 테트리스, 포켓몬스터 등과 함께 전 세계를 휩쓸었습니다.'
  },
  'Game Boy Color': {
    name: '게임보이 컬러 (GBC)',
    country: '일본',
    launchPrice: '6,800엔 (약 79달러)',
    specs: 'Sharp LR35902 (8.38MHz), 32KB RAM',
    mediaFormat: '게임보이 컬러 카트리지',
    discontinued: true,
    description: '1998년 출시. 기존 게임보이와 완벽한 하위호환을 지원하면서 컬러 디스플레이를 탑재해 포켓몬스터 금/은과 함께 엄청난 인기를 누렸습니다.'
  },
  'Game Boy Advance': {
    name: '게임보이 어드밴스 (GBA)',
    country: '일본',
    launchPrice: '9,800엔 (약 99달러)',
    specs: 'ARM7TDMI (16.78MHz), 32KB + 96KB VRAM, 256KB WRAM',
    mediaFormat: 'GBA 카트리지',
    discontinued: true,
    description: '2001년 출시된 32비트 휴대용 게임기. 16비트 슈퍼 패미컴을 뛰어넘는 2D 그래픽 성능을 주머니 속에 구현한 궁극의 2D 게임용 핸드헬드입니다.'
  },
  'Nintendo DS': {
    name: '닌텐도 DS',
    country: '일본',
    launchPrice: '15,000엔 (약 149달러)',
    specs: 'ARM946E-S (67MHz) + ARM7TDMI (33MHz), 4MB RAM',
    mediaFormat: '닌텐도 DS 카드',
    discontinued: true,
    description: '2004년 출시. 듀얼 스크린과 터치 스크린, 마이크 입력이라는 파격적인 조작 체계와 뇌단련, 닌텐독스 등의 캐주얼 소프트웨어로 역대 가장 많이 팔린 휴대용 게임기가 되었습니다.'
  },
  'Nintendo 3DS': {
    name: '닌텐도 3DS',
    country: '일본',
    launchPrice: '25,000엔 (약 249달러)',
    specs: 'ARM11 MPCore 2-core (268MHz), 128MB RAM',
    mediaFormat: '닌텐도 3DS 카드',
    discontinued: true,
    description: '2011년 출시. 특수 안경 없이도 3D 입체 화면을 볼 수 있는 디스플레이를 탑재. 엇갈림 통신 등 소셜 기능이 크게 강화되었습니다.'
  },

  // ── Sega ────────────────────────────────────────────────────────────────
  'Sega Mega Drive/Genesis': {
    name: '메가 드라이브 / 제네시스',
    country: '일본',
    launchPrice: '21,000엔 (약 189달러)',
    specs: 'Motorola 68000 (7.6MHz), Zilog Z80 (3.58MHz), 64KB RAM',
    mediaFormat: '롬 카트리지',
    discontinued: true,
    description: '1988년 세가가 출시한 16비트 게임기. 소닉 더 헤지혹을 앞세워 닌텐도의 슈퍼 패미컴과 미국 시장(제네시스)에서 치열한 콘솔 전쟁을 벌였던 세가의 최고 전성기 기기입니다.'
  },
  'Sega Saturn': {
    name: '세가 새턴',
    country: '일본',
    launchPrice: '44,800엔 (약 399달러)',
    specs: 'Dual Hitachi SH-2 (28.6MHz), 2MB RAM',
    mediaFormat: 'CD-ROM',
    discontinued: true,
    description: '1994년 출시된 32비트 게임기. 강력한 2D 성능과 아케이드 이식작들로 일본 내에서 팬층을 구축했으나, 복잡한 듀얼 CPU 구조와 비싼 가격으로 글로벌 경쟁에서는 밀려났습니다.'
  },
  'Dreamcast': {
    name: '드림캐스트',
    country: '일본',
    launchPrice: '29,800엔 (약 199달러)',
    specs: 'Hitachi SH-4 (200MHz), 16MB RAM, 8MB VRAM',
    mediaFormat: 'GD-ROM',
    discontinued: true,
    description: '1998년 세가가 사운을 걸고 출시한 마지막 가정용 콘솔. 최초로 모뎀을 기본 탑재하여 온라인 플레이를 지원했으나, PS2의 돌풍에 밀려 세가는 결국 하드웨어 사업을 접게 됩니다.'
  },
  'Sega Master System/Mark III': {
    name: '세가 마스터 시스템 / 마크 3',
    country: '일본',
    launchPrice: '15,000엔 (약 199달러)',
    specs: 'Zilog Z80A (3.58MHz), 8KB RAM, 16KB VRAM',
    mediaFormat: '롬 카트리지',
    discontinued: true,
    description: '1985년 세가가 패미컴에 대항해 출시한 8비트 게임기. 일본과 북미에선 부진했으나, 유럽과 남미(특히 브라질)에서는 패미컴을 뛰어넘는 인기를 구가했습니다.'
  },
  'Sega Game Gear': {
    name: '세가 게임기어',
    country: '일본',
    launchPrice: '19,800엔 (약 149달러)',
    specs: 'Zilog Z80 (3.58MHz), 8KB RAM, 16KB VRAM',
    mediaFormat: '게임기어 카트리지',
    type: 'HANDHELD',
    discontinued: true,
    description: '1990년 세가가 게임보이에 대항하여 출시한 휴대용 게임기. 풀 컬러 백라이트 LCD를 탑재한 최초의 핸드헬드 중 하나였으나, 짧은 배터리 수명이 약점이었습니다.'
  },

  // ── Microsoft ──────────────────────────────────────────────────────────
  'Xbox': {
    name: '엑스박스 (Xbox)',
    country: '미국',
    launchPrice: '299달러',
    specs: 'Custom Intel Pentium III (733MHz), 64MB DDR SDRAM',
    mediaFormat: 'DVD-ROM',
    discontinued: true,
    description: '2001년 마이크로소프트가 처음으로 선보인 콘솔. PC 기반의 강력한 하드웨어와 내장 하드디스크, 그리고 Xbox Live를 통한 브로드밴드 온라인 게임 환경을 정립했습니다.'
  },
  'Xbox 360': {
    name: '엑스박스 360 (Xbox 360)',
    country: '미국',
    launchPrice: '299달러 (Core), 399달러 (Premium)',
    specs: 'Custom IBM PowerPC 3-core (3.2GHz), 512MB GDDR3 RAM',
    mediaFormat: 'DVD-ROM',
    discontinued: true,
    description: '2005년 출시. 도전 과제 시스템과 완성된 온라인 서비스(Xbox Live)로 멀티플레이 게임의 표준이 되었으며, 서구권에서 PS3를 압도하며 MS 콘솔의 전성기를 이끌었습니다.'
  },
  'Xbox One': {
    name: '엑스박스 원 (Xbox One)',
    country: '미국',
    launchPrice: '499달러 (Kinect 포함)',
    specs: 'Custom AMD 8-core (1.75GHz), 8GB DDR3 RAM',
    mediaFormat: '블루레이 디스크',
    discontinued: true,
    description: '2013년 출시. 초반 미디어 센터 지향 정책과 키넥트 강제 포함으로 인한 높은 가격으로 고전했으나, 이후 게임패스(Game Pass)라는 구독형 서비스 모델을 안착시키는 계기가 되었습니다.'
  },
  'Xbox Series X|S': {
    name: '엑스박스 시리즈 X/S',
    country: '미국',
    launchPrice: '499달러 (X), 299달러 (S)',
    specs: 'Custom AMD Zen 2 8-core, 16GB RAM (X) / 10GB RAM (S)',
    mediaFormat: 'Ultra HD 블루레이 (X), 디지털 전용 (S)',
    discontinued: false,
    description: '2020년 출시된 9세대 콘솔. 고성능 거치기(X)와 가성비 디지털 전용기(S) 투트랙 전략을 사용하며, 게임패스와 결합하여 압도적인 접근성을 제공합니다.'
  },

  // ── PC ─────────────────────────────────────────────────────────────────
  'PC': {
    name: 'PC (개인용 컴퓨터)',
    country: '미국 등',
    launchPrice: '다양함',
    specs: '다양함',
    mediaFormat: '디지털 다운로드, CD/DVD, 플로피 등',
    discontinued: false,
    description: '특정 제조사의 콘솔이 아닌, 마이크로소프트 Windows, macOS, Linux 등을 운영체제로 사용하는 개방형 플랫폼. 마우스와 키보드라는 조작 체계로 장르의 다양성과 최강의 그래픽 퍼포먼스를 자랑합니다.'
  },
  'PC (Microsoft Windows)': {
    name: 'PC (Windows)',
    country: '미국',
    launchPrice: '다양함',
    specs: '다양함',
    mediaFormat: '디지털 다운로드, CD/DVD',
    type: 'PC',
    discontinued: false,
    description: '마이크로소프트 Windows 운영체제 기반 PC 게임 플랫폼. Steam, Epic Games Store 등 디지털 유통 서비스를 통해 세계 최대의 게임 라이브러리를 보유하고 있습니다.'
  },
  'Mac': {
    name: 'Mac (매킨토시)',
    country: '미국',
    launchPrice: '다양함',
    specs: '다양함',
    mediaFormat: '디지털 다운로드',
    type: 'PC',
    discontinued: false,
    description: '애플의 macOS 운영체제 기반 컴퓨터 플랫폼. Apple Silicon 전환 이후 게임 성능이 크게 향상되었으나 Windows에 비해 게임 라이브러리가 제한적입니다.'
  },
  'Linux': {
    name: 'Linux',
    country: '국제',
    launchPrice: '무료 (오픈소스)',
    specs: '다양함',
    mediaFormat: '디지털 다운로드',
    type: 'PC',
    discontinued: false,
    description: '오픈소스 Linux 커널 기반 PC 플랫폼. Valve의 Proton 호환 레이어와 Steam Deck의 등장으로 Linux 게이밍 생태계가 크게 성장했습니다.'
  },

  // ── Atari ──────────────────────────────────────────────────────────────
  'Atari 2600': {
    name: '아타리 2600',
    manufacturer: 'Atari',
    country: '미국',
    launchPrice: '199달러',
    specs: 'MOS 6507 (1.19MHz), 128B RAM',
    mediaFormat: '롬 카트리지',
    type: 'HOME',
    generation: 2,
    discontinued: true,
    description: '1977년 아타리가 출시한 2세대 가정용 게임기. 교체 가능한 카트리지 시스템을 대중화하여 가정용 비디오 게임 시장을 본격적으로 열었습니다. 스페이스 인베이더, 팩맨 등 수많은 아케이드 이식작이 발매되었습니다.'
  },
  'Atari 5200': {
    name: '아타리 5200',
    manufacturer: 'Atari',
    country: '미국',
    launchPrice: '269달러',
    specs: 'MOS 6502C (1.79MHz), 16KB RAM',
    mediaFormat: '롬 카트리지',
    type: 'HOME',
    generation: 2,
    discontinued: true,
    description: '1982년 출시. 아타리 2600의 후속 콘솔로 향상된 그래픽과 아날로그 조이스틱을 특징으로 했으나, 하위 호환성 부재와 취약한 컨트롤러 설계로 상업적 성공을 거두지 못했습니다.'
  },
  'Atari 7800': {
    name: '아타리 7800',
    manufacturer: 'Atari',
    country: '미국',
    launchPrice: '140달러',
    specs: '6502C (1.79MHz), 4KB RAM',
    mediaFormat: '롬 카트리지',
    type: 'HOME',
    generation: 3,
    discontinued: true,
    description: '1986년 출시. 아타리 2600과의 완벽한 하위호환을 지원하며 NES에 도전했으나, 닌텐도의 서드파티 독점 계약으로 소프트웨어 확보에 실패하여 시장에서 밀려났습니다.'
  },
  'Atari Jaguar': {
    name: '아타리 재규어',
    manufacturer: 'Atari',
    country: '미국',
    launchPrice: '249달러',
    specs: 'Motorola 68000 (13.3MHz) + Tom & Jerry 칩셋, 2MB RAM',
    mediaFormat: '롬 카트리지',
    type: 'HOME',
    generation: 5,
    discontinued: true,
    description: '1993년 출시된 아타리의 마지막 가정용 콘솔. "최초의 64비트 게임기"를 표방했으나 개발 도구 부족과 소프트웨어 라인업 빈약으로 실패하며, 아타리의 하드웨어 시대가 막을 내렸습니다.'
  },
  'Atari Lynx': {
    name: '아타리 링스',
    manufacturer: 'Atari',
    country: '미국',
    launchPrice: '179달러',
    specs: 'MOS 65SC02 (4MHz) + Custom "Suzy" 16-bit, 64KB RAM',
    mediaFormat: '링스 카트리지',
    type: 'HANDHELD',
    generation: 4,
    discontinued: true,
    description: '1989년 출시. 세계 최초의 컬러 LCD 휴대용 게임기로, 하드웨어 확대/축소/회전 기능을 갖추었으나 크고 무거운 본체와 짧은 배터리 수명으로 게임보이와의 경쟁에서 패배했습니다.'
  },
  'Atari ST/STE': {
    name: '아타리 ST',
    manufacturer: 'Atari',
    country: '미국',
    launchPrice: '799달러',
    specs: 'Motorola 68000 (8MHz), 512KB~4MB RAM',
    mediaFormat: '플로피 디스크',
    type: 'PC',
    discontinued: true,
    description: '1985년 출시된 아타리의 16비트 가정용 컴퓨터. 내장 MIDI 포트로 음악 제작 분야에서 큰 인기를 끌었으며, 유럽에서는 게임용 PC로도 사랑받았습니다.'
  },

  // ── NEC / 허드슨 ──────────────────────────────────────────────────────
  'TurboGrafx-16/PC Engine': {
    name: 'PC 엔진 / 터보그래픽스-16',
    manufacturer: 'NEC / Hudson',
    country: '일본',
    launchPrice: '24,800엔 (약 199달러)',
    specs: 'HuC6280 (7.16MHz), 8KB RAM, 64KB VRAM',
    mediaFormat: 'HuCARD, CD-ROM',
    type: 'HOME',
    generation: 4,
    discontinued: true,
    description: '1987년 NEC와 허드슨이 공동 개발한 콘솔. 세계 최초로 CD-ROM 주변기기(CD-ROM²)를 제공하며 음성과 대용량 데이터 활용을 선보였습니다. 일본에서는 큰 인기를 끌었으나 북미에서는 부진했습니다.'
  },
  'TurboGrafx-16': {
    name: 'PC 엔진 / 터보그래픽스-16',
    manufacturer: 'NEC / Hudson',
    country: '일본',
    launchPrice: '24,800엔 (약 199달러)',
    specs: 'HuC6280 (7.16MHz), 8KB RAM, 64KB VRAM',
    mediaFormat: 'HuCARD, CD-ROM',
    type: 'HOME',
    generation: 4,
    discontinued: true,
    description: '1987년 NEC와 허드슨이 공동 개발한 콘솔. 세계 최초로 CD-ROM 주변기기(CD-ROM²)를 제공하며 음성과 대용량 데이터 활용을 선보였습니다. 슈팅 게임의 보고로 불리는 명기입니다.'
  },
  'PC Engine SuperGrafx': {
    name: 'PC 엔진 슈퍼그래픽스',
    manufacturer: 'NEC / Hudson',
    country: '일본',
    launchPrice: '39,800엔',
    specs: 'HuC6280A (7.16MHz), 32KB RAM, 128KB VRAM',
    mediaFormat: 'HuCARD',
    type: 'HOME',
    generation: 4,
    discontinued: true,
    description: '1989년 출시된 PC 엔진의 상위 호환 모델. 듀얼 배경 레이어와 확장 RAM을 탑재했으나, 전용 타이틀이 5개에 불과하여 역사적 희귀 기기로 남았습니다.'
  },

  // ── SNK ────────────────────────────────────────────────────────────────
  'Neo Geo AES': {
    name: '네오지오 AES',
    manufacturer: 'SNK',
    country: '일본',
    launchPrice: '58,000엔 (약 649달러)',
    specs: 'Motorola 68000 (12MHz) + Z80 (4MHz), 64KB RAM',
    mediaFormat: '네오지오 롬 카트리지',
    type: 'HOME',
    generation: 4,
    discontinued: true,
    description: '1990년 SNK가 출시한 가정용 네오지오. 아케이드와 완전히 동일한 하드웨어로 "100 MEGA SHOCK!"이라는 슬로건 아래 아케이드 퍼펙트 이식을 실현했지만, 높은 가격이 진입 장벽이었습니다.'
  },
  'Neo Geo MVS': {
    name: '네오지오 MVS',
    manufacturer: 'SNK',
    country: '일본',
    launchPrice: '업소용',
    specs: 'Motorola 68000 (12MHz) + Z80 (4MHz), 64KB RAM',
    mediaFormat: '네오지오 MVS 카트리지',
    type: 'ARCADE',
    generation: 4,
    discontinued: true,
    description: 'SNK의 아케이드 시스템. 멀티 카트리지 슬롯을 채용하여 오퍼레이터가 여러 게임을 하나의 캐비닛에서 운용할 수 있었으며, KOF, 메탈슬러그 등 수많은 명작을 배출했습니다.'
  },
  'Neo Geo Pocket Color': {
    name: '네오지오 포켓 컬러',
    manufacturer: 'SNK',
    country: '일본',
    launchPrice: '8,900엔 (약 69달러)',
    specs: 'Toshiba TLCS-900H (6.144MHz), 12KB RAM',
    mediaFormat: '네오지오 포켓 카트리지',
    type: 'HANDHELD',
    generation: 5,
    discontinued: true,
    description: '1999년 SNK가 출시한 휴대용 게임기. 훌륭한 마이크로 스위치 조이스틱과 품질 높은 게임으로 호평받았으나, SNK의 경영 악화로 단명했습니다.'
  },
  'Neo Geo CD': {
    name: '네오지오 CD',
    manufacturer: 'SNK',
    country: '일본',
    launchPrice: '49,800엔',
    specs: 'Motorola 68000 (12MHz), 7MB RAM',
    mediaFormat: 'CD-ROM',
    type: 'HOME',
    generation: 4,
    discontinued: true,
    description: '1994년 출시된 네오지오의 CD-ROM 버전. 카트리지 대비 저렴한 소프트웨어 가격이 장점이었으나, 1배속 CD-ROM으로 인한 긴 로딩 시간이 치명적인 단점이었습니다.'
  },

  // ── 3DO / Philips ──────────────────────────────────────────────────────
  '3DO Interactive Multiplayer': {
    name: '3DO',
    manufacturer: '3DO Company (제조: 파나소닉, 골드스타 등)',
    country: '미국',
    launchPrice: '699달러',
    specs: 'ARM60 (12.5MHz), 2MB DRAM, 1MB VRAM',
    mediaFormat: 'CD-ROM',
    type: 'HOME',
    generation: 5,
    discontinued: true,
    description: '1993년 출시. EA 창립자 트립 호킨스가 설계한 오픈 라이선스 콘솔로, 여러 제조사가 하드웨어를 생산했습니다. 높은 가격과 소프트웨어 부족으로 상업적으로 실패했습니다.'
  },
  'Philips CD-i': {
    name: '필립스 CD-i',
    manufacturer: 'Philips',
    country: '네덜란드',
    launchPrice: '699달러',
    specs: 'Motorola 68070 (15.5MHz), 1MB RAM',
    mediaFormat: 'CD-i 디스크',
    type: 'HOME',
    generation: 4,
    discontinued: true,
    description: '1991년 필립스가 출시한 인터랙티브 CD 플레이어. 닌텐도와의 결렬된 협약으로 인해 악명 높은 젤다/마리오 타이틀이 발매되었으나, 게임기로서는 실패했습니다.'
  },

  // ── 기타 (Coleco, Mattel, Bandai) ──────────────────────────────────────
  'ColecoVision': {
    name: '콜레코비전',
    manufacturer: 'Coleco',
    country: '미국',
    launchPrice: '175달러',
    specs: 'Zilog Z80A (3.58MHz), 1KB RAM, 16KB VRAM',
    mediaFormat: '롬 카트리지',
    type: 'HOME',
    generation: 2,
    discontinued: true,
    description: '1982년 출시. 아케이드에 가까운 그래픽 품질과 동키콩 번들로 큰 인기를 끌었으나, 1983년 비디오 게임 대붕괴(아타리 쇼크)의 여파로 단명했습니다.'
  },
  'Intellivision': {
    name: '인텔리비전',
    manufacturer: 'Mattel',
    country: '미국',
    launchPrice: '299달러',
    specs: 'GI CP1610 (894KHz), 1456B RAM',
    mediaFormat: '롬 카트리지',
    type: 'HOME',
    generation: 2,
    discontinued: true,
    description: '1979년 마텔이 출시한 2세대 가정용 게임기. 아타리 2600의 강력한 경쟁자로, 스포츠 게임과 교육용 소프트에 강점을 보였으며 최초로 합성 음성을 지원한 콘솔 중 하나입니다.'
  },
  'WonderSwan': {
    name: '원더스완',
    manufacturer: 'Bandai',
    country: '일본',
    launchPrice: '4,800엔',
    specs: 'NEC V30MZ (3.072MHz), 16KB RAM',
    mediaFormat: '원더스완 카트리지',
    type: 'HANDHELD',
    generation: 5,
    discontinued: true,
    description: '1999년 반다이가 출시한 휴대용 게임기. 게임보이의 아버지 요코이 군페이가 설계에 참여했으며, 파이널 판타지 리메이크 등으로 일본에서만 인기를 끌었습니다.'
  },
  'WonderSwan Color': {
    name: '원더스완 컬러',
    manufacturer: 'Bandai',
    country: '일본',
    launchPrice: '6,800엔',
    specs: 'NEC V30MZ (3.072MHz), 64KB RAM',
    mediaFormat: '원더스완 카트리지',
    type: 'HANDHELD',
    generation: 5,
    discontinued: true,
    description: '2000년 출시된 원더스완의 컬러 버전. 기존 원더스완과의 하위호환을 지원하며 TFT 컬러 화면을 탑재했으나, GBA의 등장으로 곧 시장에서 밀려났습니다.'
  },

  // ── 모바일 / 기타 ──────────────────────────────────────────────────────
  'iOS': {
    name: 'iOS (아이폰/아이패드)',
    manufacturer: 'Apple',
    country: '미국',
    launchPrice: '다양함',
    specs: '다양함 (Apple A시리즈 칩)',
    mediaFormat: '디지털 다운로드 (App Store)',
    type: 'HANDHELD',
    discontinued: false,
    description: '애플의 모바일 운영체제 기반 게임 플랫폼. App Store를 통해 수십만 개의 모바일 게임을 제공하며, Apple Arcade 구독 서비스도 운영하고 있습니다.'
  },
  'Android': {
    name: '안드로이드 (Android)',
    manufacturer: 'Google / 다양한 제조사',
    country: '미국',
    launchPrice: '다양함',
    specs: '다양함',
    mediaFormat: '디지털 다운로드 (Google Play)',
    type: 'HANDHELD',
    discontinued: false,
    description: '구글의 모바일 운영체제 기반 게임 플랫폼. Google Play 스토어를 통해 세계 최대 규모의 모바일 게임 생태계를 형성하고 있습니다.'
  },

  // ── Arcade ──────────────────────────────────────────────────────────────
  'Arcade': {
    name: '아케이드',
    manufacturer: '다양한 제조사',
    country: '국제',
    launchPrice: '업소용',
    specs: '다양함',
    mediaFormat: '전용 기판',
    type: 'ARCADE',
    discontinued: false,
    description: '오락실(게임센터)에서 동전을 넣어 플레이하는 업소용 비디오 게임. 팩맨, 스트리트 파이터, 메탈슬러그 등 수많은 명작의 원류이며, 비디오 게임 역사의 기반이 된 플랫폼입니다.'
  },

  // ── Commodore ────────────────────────────────────────────────────────────
  'Commodore C64/128/MAX': {
    name: '코모도어 64',
    manufacturer: 'Commodore',
    country: '미국',
    launchPrice: '595달러',
    specs: 'MOS 6510 (1.023MHz), 64KB RAM',
    mediaFormat: '카트리지, 카세트 테이프, 플로피 디스크',
    type: 'PC',
    discontinued: true,
    description: '1982년 출시. 역사상 가장 많이 팔린 단일 모델 가정용 컴퓨터(약 1,700만 대). SID 사운드 칩으로 뛰어난 음악 재생이 가능했으며, 특히 유럽에서 게임 플랫폼으로 큰 인기를 끌었습니다.'
  },
  'Amiga': {
    name: '아미가 (Amiga)',
    manufacturer: 'Commodore',
    country: '미국',
    launchPrice: '1,295달러 (Amiga 1000)',
    specs: 'Motorola 68000 (7.16MHz), 256KB~2MB RAM',
    mediaFormat: '플로피 디스크',
    type: 'PC',
    discontinued: true,
    description: '1985년 출시된 코모도어의 16/32비트 컴퓨터. 시대를 앞선 멀티미디어 성능과 뛰어난 그래픽/사운드로 유럽 게이머와 데모씬 커뮤니티의 사랑을 받았습니다.'
  },

  // ── Sinclair / MSX ──────────────────────────────────────────────────────
  'ZX Spectrum': {
    name: 'ZX 스펙트럼',
    manufacturer: 'Sinclair Research',
    country: '영국',
    launchPrice: '125파운드 (16K), 175파운드 (48K)',
    specs: 'Zilog Z80A (3.5MHz), 16~128KB RAM',
    mediaFormat: '카세트 테이프',
    type: 'PC',
    discontinued: true,
    description: '1982년 영국에서 출시된 8비트 가정용 컴퓨터. 저렴한 가격으로 영국 가정에 컴퓨터를 보급시키며, 영국 게임 산업의 토대를 마련한 전설적인 기기입니다.'
  },
  'MSX': {
    name: 'MSX',
    manufacturer: 'Microsoft / ASCII (규격), 다양한 제조사',
    country: '일본',
    launchPrice: '다양함',
    specs: 'Zilog Z80A (3.58MHz), 8~64KB RAM',
    mediaFormat: '롬 카트리지, 카세트 테이프, 플로피 디스크',
    type: 'PC',
    discontinued: true,
    description: '1983년 출시된 통일 규격 가정용 컴퓨터. 일본, 한국, 유럽, 남미 등에서 인기를 끌었으며 메탈기어, 마성전설, 알에스타 등 수많은 명작 게임을 배출했습니다.'
  },
  'MSX2': {
    name: 'MSX2',
    manufacturer: 'Microsoft / ASCII (규격), 다양한 제조사',
    country: '일본',
    launchPrice: '다양함',
    specs: 'Zilog Z80A (3.58MHz), 64~256KB RAM',
    mediaFormat: '롬 카트리지, 플로피 디스크',
    type: 'PC',
    discontinued: true,
    description: '1985년 출시된 MSX의 후속 규격. 향상된 그래픽(V9938 VDP)과 확장 RAM으로 RPG, 어드벤처 게임에서 뛰어난 표현력을 발휘했습니다.'
  },
};

async function main() {
  console.log('콘솔(플랫폼) 데이터를 한국어 설정으로 번역 및 업데이트 중...');

  const dbPlatforms = await prisma.platform.findMany();

  let updated = 0;
  let skipped = 0;

  for (const plat of dbPlatforms) {
    const trans = PLATFORM_TRANSLATIONS[plat.name];
    if (trans) {
      const data: any = {};
      
      // 항상 업데이트할 필드
      if (trans.name) data.name = trans.name;
      if (trans.country) data.country = trans.country;
      if (trans.description) data.description = trans.description;
      if (trans.discontinued !== undefined) data.discontinued = trans.discontinued;
      
      // 없는 경우에만 채워넣을 필드
      if (!plat.launchPrice && trans.launchPrice) data.launchPrice = trans.launchPrice;
      if (!plat.specs && trans.specs) data.specs = trans.specs;
      if (!plat.mediaFormat && trans.mediaFormat) data.mediaFormat = trans.mediaFormat;
      if (trans.launchPrice) data.launchPrice = trans.launchPrice;
      if (trans.specs) data.specs = trans.specs;
      if (trans.mediaFormat) data.mediaFormat = trans.mediaFormat;
      
      // manufacturer와 type, generation은 값이 있으면 업데이트
      if (trans.manufacturer) data.manufacturer = trans.manufacturer;
      if (trans.type) data.type = trans.type;
      if (trans.generation) data.generation = trans.generation;

      try {
        await prisma.platform.update({
          where: { id: plat.id },
          data
        });
        console.log(`✅ Updated: ${plat.name} → ${data.name || plat.name}`);
        updated++;
      } catch (e: any) {
        if (e.code === 'P2002' && e.meta?.target?.includes('name')) {
          console.log(`⚠️ 중복 이름 에러 (${plat.name} → ${data.name}). 이름 변경을 제외하고 재시도...`);
          delete data.name;
          await prisma.platform.update({
            where: { id: plat.id },
            data
          });
          console.log(`✅ Updated (without name): ${plat.name}`);
          updated++;
        } else {
          throw e;
        }
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n완료! 업데이트: ${updated}개, 스킵(번역 없음): ${skipped}개`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

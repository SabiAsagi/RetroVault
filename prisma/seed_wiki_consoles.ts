import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

interface ConsoleData {
  name: string;
  manufacturer: string;
  generation: number;
  releaseYear: number;
  totalSales: string;
  description: string;
  specs: string;
  additionalInput: string;
  launchPrice: string;
  country: string;
  discontinued: boolean;
}

// 위키피디아 콘솔 목록 데이터를 기반으로 한글화 및 스펙/상세정보를 사전 매핑한 거대한 딕셔너리
const enrichedData: Record<string, Partial<ConsoleData>> = {
  // 1세대 (1st Generation)
  'Magnavox Odyssey': {
    description: '세계 최초의 가정용 비디오 게임 콘솔. 래스터 비디오 디스플레이를 사용하여 화면에 점을 출력하고, TV 화면에 셀로판 오버레이를 씌워 게임을 플레이했습니다.',
    specs: '트랜지스터 및 다이오드 기반 (CPU 없음)',
    additionalInput: '라이트 건 (Shooting Gallery)',
    launchPrice: '$99',
    country: '미국 (Magnavox)',
    discontinued: true,
  },
  'Pong': { // Atari Pong
    name: 'Home Pong',
    description: '아케이드에서 대성공을 거둔 퐁(Pong)의 가정용 이식판. 아타리와 시어스(Sears)를 통해 판매되며 1세대 콘솔의 대중화를 이끌었습니다.',
    specs: '전용 퐁 칩(Pong-in-a-chip)',
    additionalInput: '내장형 패들 컨트롤러',
    launchPrice: '$98',
    country: '미국 (Atari)',
    discontinued: true,
  },
  'Coleco Telstar': {
    description: 'AY-3-8500 칩을 기반으로 한 콜레코의 1세대 콘솔 시리즈. 매우 다양한 파생 모델이 출시되었습니다.',
    specs: 'AY-3-8500 (General Instrument)',
    additionalInput: '내장 패들',
    launchPrice: '$50',
    country: '미국 (Coleco)',
    discontinued: true,
  },
  'Color TV-Game': {
    description: '닌텐도가 일본 내에서 출시한 최초의 가정용 게임기 시리즈. 컬러 화면을 지원하며 퐁 스타일의 게임들을 다수 수록했습니다.',
    specs: '커스텀 칩',
    additionalInput: '내장 다이얼/패들',
    launchPrice: '8,300엔 ~ 48,000엔',
    country: '일본 (Nintendo)',
    discontinued: true,
  },
  'APF TV Fun': {
    description: 'APF Electronics에서 출시한 초기 퐁 클론 콘솔 중 하나.',
    specs: 'AY-3-8500 칩',
    additionalInput: '내장 다이얼',
    launchPrice: '불명',
    country: '미국 (APF)',
    discontinued: true,
  },

  // 2세대 (2nd Generation)
  'Fairchild Channel F': {
    description: '세계 최초로 교환 가능한 ROM 카트리지 방식을 채택한 2세대 콘솔. 초기 게임기 시장의 혁신을 가져왔습니다.',
    specs: 'Fairchild F8 CPU @ 1.79 MHz, 64 bytes RAM',
    additionalInput: '복합 8방향 조이스틱',
    launchPrice: '$169.95',
    country: '미국 (Fairchild)',
    discontinued: true,
  },
  'Atari 2600': {
    description: '카트리지 교환식 콘솔을 대중화시킨 전설적인 기기. 스페이스 인베이더 등의 히트작으로 북미 시장을 지배했으나, 아타리 쇼크의 원인이 되기도 했습니다.',
    specs: 'MOS Technology 6507 @ 1.19 MHz, 128 bytes RAM',
    additionalInput: '패들 컨트롤러, 드라이빙 컨트롤러, 트랙볼',
    launchPrice: '$199',
    country: '미국 (Atari)',
    discontinued: true,
  },
  'Magnavox Odyssey 2': {
    description: '오디세이의 후속작으로, 멤브레인 키보드를 본체에 내장하여 교육용 컴퓨터의 기능도 일부 갖춘 콘솔입니다.',
    specs: 'Intel 8048 @ 1.78 MHz, 64 bytes RAM',
    additionalInput: '음성 합성 모듈 (The Voice)',
    launchPrice: '$179',
    country: '미국 (Magnavox)',
    discontinued: true,
  },
  'Intellivision': {
    description: '마텔이 아타리 2600에 대항하기 위해 출시한 콘솔. 16비트 마이크로프로세서를 탑재하여 당대 최고 수준의 그래픽과 사운드를 자랑했습니다.',
    specs: 'General Instrument CP1610 (16-bit) @ 894 kHz, 1.45 KB RAM',
    additionalInput: '인텔리보이스(음성 모듈), 엔터테인먼트 컴퓨터 시스템',
    launchPrice: '$299',
    country: '미국 (Mattel)',
    discontinued: true,
  },
  'ColecoVision': {
    description: '아케이드 게임과 거의 동일한 수준의 그래픽을 가정에서 즐길 수 있도록 한 2세대 후기 명기. 동키콩의 뛰어난 이식으로 유명합니다.',
    specs: 'Zilog Z80A @ 3.58 MHz, 8 KB RAM, 16 KB VRAM',
    additionalInput: '확장 모듈(아타리 2600 호환 어댑터 포함), 롤러 컨트롤러',
    launchPrice: '$175',
    country: '미국 (Coleco)',
    discontinued: true,
  },
  'Atari 5200': {
    description: '아타리 2600의 진정한 후속작. 그러나 거대한 크기와 조작하기 불편한 컨트롤러, 2600과의 하위호환성 부재로 실패했습니다.',
    specs: 'MOS 6502C @ 1.79 MHz, 16 KB RAM',
    additionalInput: '트랙볼 (Trak-Ball)',
    launchPrice: '$269',
    country: '미국 (Atari)',
    discontinued: true,
  },
  'Vectrex': {
    description: '유일하게 벡터 모니터를 자체 내장하고 출시된 가정용 비디오 게임 콘솔. 부드러운 선 그래픽이 특징이었습니다.',
    specs: 'Motorola 68A09 @ 1.5 MHz, 1 KB RAM, 내장 9인치 벡터 흑백 모니터',
    additionalInput: '3D 이미저, 라이트 펜',
    launchPrice: '$199',
    country: '미국 (Milton Bradley / GCE)',
    discontinued: true,
  },
  'SG-1000': {
    description: '세가(Sega)가 패미컴과 같은 날 출시한 자사 최초의 가정용 카트리지 콘솔.',
    specs: 'NEC 780C (Z80 클론) @ 3.58 MHz, 1 KB RAM',
    additionalInput: '오토바이 핸들형 컨트롤러',
    launchPrice: '15,000엔',
    country: '일본 (Sega)',
    discontinued: true,
  },

  // 3세대 (3rd Generation)
  'Nintendo Entertainment System': {
    name: 'Nintendo Entertainment System / Famicom',
    description: '아타리 쇼크로 무너진 비디오 게임 시장을 부활시킨 전설적인 8비트 콘솔. 십자키와 A/B 버튼이 표준이 되었습니다.',
    specs: 'Ricoh 2A03 (6502 파생) @ 1.79 MHz, 2 KB RAM, 2 KB VRAM',
    additionalInput: '패미컴 디스크 시스템, 재퍼(광선총), 로봇(R.O.B.)',
    launchPrice: '14,800엔 (일본) / $199 (북미)',
    country: '일본 (Nintendo)',
    discontinued: true,
  },
  'Sega Master System': {
    description: '패미컴에 대항하기 위해 세가가 내놓은 8비트 콘솔. 북미와 일본에서는 고전했으나, 유럽과 남미(특히 브라질)에서 대성공을 거두었습니다.',
    specs: 'Zilog Z80A @ 3.58 MHz, 8 KB RAM, 16 KB VRAM',
    additionalInput: '라이트 페이저(광선총), 3D 글래스',
    launchPrice: '$199.99',
    country: '일본 (Sega)',
    discontinued: true,
  },
  'Atari 7800': {
    description: '아타리가 5200의 실패를 만회하기 위해 내놓은 콘솔. 아타리 2600 게임을 완벽하게 지원했습니다.',
    specs: 'Custom 6502C @ 1.79 MHz, 4 KB RAM',
    additionalInput: '광선총 (XG-1)',
    launchPrice: '$140',
    country: '미국 (Atari)',
    discontinued: true,
  },
  'Atari XEGS': {
    description: '아타리 8비트 컴퓨터 라인업을 콘솔 형태로 재포장하여 출시한 기기.',
    specs: 'MOS 6502C @ 1.79 MHz, 64 KB RAM',
    additionalInput: '전용 키보드, XG-1 라이트 건',
    launchPrice: '$159',
    country: '미국 (Atari)',
    discontinued: true,
  },

  // 4세대 (4th Generation)
  'TurboGrafx-16': {
    name: 'PC Engine / TurboGrafx-16',
    description: 'NEC와 허드슨이 공동 개발한 콘솔. 8비트 CPU에 16비트 그래픽 칩을 조합하여 아케이드 게임을 훌륭히 이식했으며, 세계 최초로 CD-ROM 애드온을 도입했습니다.',
    specs: 'Hudson Soft HuC6280 (8-bit) @ 7.16 MHz, 8 KB RAM, 64 KB VRAM',
    additionalInput: 'CD-ROM², 멀티탭',
    launchPrice: '24,800엔 (일본) / $199 (북미)',
    country: '일본 (NEC / Hudson Soft)',
    discontinued: true,
  },
  'Sega Genesis': {
    name: 'Sega Genesis / Mega Drive',
    description: '세가의 16비트 비디오 게임 콘솔. 아케이드 게임의 완벽한 이식과 "소닉 더 헤지혹"의 성공으로 북미 시장에서 닌텐도와 치열하게 경쟁했습니다.',
    specs: 'Motorola 68000 @ 7.6 MHz + Zilog Z80 @ 3.58 MHz, 64 KB RAM, 64 KB VRAM',
    additionalInput: 'Sega CD (Mega-CD), 32X, 마우스, 광선총(Menacer)',
    launchPrice: '21,000엔 (일본) / $189 (북미)',
    country: '일본 (Sega)',
    discontinued: true,
  },
  'Super Nintendo Entertainment System': {
    name: 'Super Nintendo Entertainment System / Super Famicom',
    description: '패미컴의 후속작으로 뛰어난 그래픽과 확대/축소/회전 기능(Mode 7), DSP 사운드를 갖춘 16비트 시대의 제왕입니다.',
    specs: 'Ricoh 5A22 @ 3.58 MHz, 128 KB RAM, 64 KB VRAM, Sony SPC700 오디오',
    additionalInput: '슈퍼 게임보이, 마우스, 슈퍼 스코프, 사테라뷰',
    launchPrice: '25,000엔 (일본) / $199 (북미)',
    country: '일본 (Nintendo)',
    discontinued: true,
  },
  'Neo Geo': {
    name: 'Neo Geo AES',
    description: 'SNK의 4세대 비디오 게임 콘솔. 아케이드 기판(MVS)을 그대로 가정용으로 옮겨놓아 "오락실을 집으로"라는 꿈을 완벽하게 실현시켰습니다.',
    specs: 'Motorola 68000 @ 12 MHz + Zilog Z80 @ 4 MHz, 64 KB RAM, 68 KB VRAM',
    additionalInput: '아케이드 스틱',
    launchPrice: '$649',
    country: '일본 (SNK)',
    discontinued: true,
  },
  'Philips CD-i': {
    description: '필립스와 소니가 공동 개발한 대화형 멀티미디어 CD 플레이어. 닌텐도와의 계약으로 젤다 및 마리오 게임이 출시된 것으로 유명합니다.',
    specs: 'Philips SCC68070 (16-bit) @ 15.5 MHz, 1 MB RAM',
    additionalInput: 'MPEG-1 풀 모션 비디오 카드, 리모컨',
    launchPrice: '$700',
    country: '네덜란드 (Philips)',
    discontinued: true,
  },

  // 5세대 (5th Generation)
  '3DO Interactive Multiplayer': {
    name: '3DO',
    description: '트립 호킨스가 주도하여 만든 멀티미디어 규격. 파나소닉, Sanyo, GoldStar 등에서 하드웨어를 제작했으나 비싼 가격으로 실패했습니다.',
    specs: 'ARM60 (32-bit) @ 12.5 MHz, 2 MB RAM, 1 MB VRAM',
    additionalInput: '비디오 CD 모듈, 마우스',
    launchPrice: '$699',
    country: '미국 (The 3DO Company)',
    discontinued: true,
  },
  'Amiga CD32': {
    description: '코모도어에서 Amiga 1200 컴퓨터를 기반으로 제작한 32비트 CD 기반 콘솔.',
    specs: 'Motorola 68020 @ 14.18 MHz, 2 MB RAM',
    additionalInput: '키보드, 마우스',
    launchPrice: '$399',
    country: '캐나다/미국 (Commodore)',
    discontinued: true,
  },
  'Atari Jaguar': {
    description: '아타리가 64비트 시스템임을 앞세워 마케팅한 콘솔. 복잡한 멀티 칩 구조와 써드파티 부족으로 부진했으며, 결국 아타리의 마지막 가정용 콘솔이 되었습니다.',
    specs: 'Motorola 68000 @ 13.29 MHz + Custom 32-bit RISC chips, 2 MB RAM',
    additionalInput: 'Jaguar CD, ProController',
    launchPrice: '$249',
    country: '미국 (Atari Corporation)',
    discontinued: true,
  },
  'Sega Saturn': {
    description: '듀얼 CPU 구조를 채택한 세가의 32비트 콘솔. 2D 성능은 타의 추종을 불허했으나, 3D 개발의 난해함과 북미 시장에서의 패착으로 고전했습니다.',
    specs: '2× Hitachi SH-2 (32-bit) @ 28.6 MHz, 2 MB RAM, 1.5 MB VRAM',
    additionalInput: '3D 컨트롤 패드, 액션 리플레이, 마우스',
    launchPrice: '44,800엔 (일본) / $399 (북미)',
    country: '일본 (Sega)',
    discontinued: true,
  },
  'PlayStation': {
    description: '소니의 게임 시장 첫 진출작. 뛰어난 3D 처리 능력, 개발하기 쉬운 환경, 서드파티의 폭넓은 지지로 5세대를 제패했습니다.',
    specs: 'MIPS R3000A-compatible (32-bit) @ 33.8 MHz, 2 MB RAM, 1 MB VRAM',
    additionalInput: '듀얼쇼크(DualShock), 메모리 카드, 포켓스테이션',
    launchPrice: '39,800엔 (일본) / $299 (북미)',
    country: '일본 (Sony Computer Entertainment)',
    discontinued: true,
  },
  'Nintendo 64': {
    description: 'CD 매체가 아닌 카트리지를 고수한 닌텐도의 64비트 콘솔. 슈퍼 마리오 64와 젤다의 전설 시간의 오카리나 등 3D 게임의 방향성을 제시한 명작들을 배출했습니다.',
    specs: 'NEC VR4300 (64-bit) @ 93.75 MHz, 4 MB RDRAM (확장팩으로 8MB)',
    additionalInput: '익스팬션 팩, 럼블 팩, 64DD',
    launchPrice: '25,000엔 (일본) / $199 (북미)',
    country: '일본 (Nintendo)',
    discontinued: true,
  },
  'Apple Bandai Pippin': {
    description: '애플이 디자인하고 반다이가 제조한 매킨토시 아키텍처 기반의 멀티미디어 콘솔.',
    specs: 'PowerPC 603 @ 66 MHz, 6 MB RAM',
    additionalInput: '애플잭 컨트롤러, 키보드',
    launchPrice: '$599',
    country: '미국/일본 (Apple / Bandai)',
    discontinued: true,
  },

  // 6세대 (6th Generation)
  'Dreamcast': {
    description: '시대를 앞서간 세가의 마지막 콘솔. 최초로 모뎀을 기본 내장하여 온라인 플레이를 지원했으나 소니의 플레이스테이션 2 발표 이후 쇠락했습니다.',
    specs: 'Hitachi SH-4 (32-bit) @ 200 MHz, 16 MB RAM, 8 MB VRAM',
    additionalInput: '비주얼 메모리(VMU), 아케이드 스틱, 마라카스, 마우스, 낚시 컨트롤러',
    launchPrice: '29,800엔 (일본) / $199 (북미)',
    country: '일본 (Sega)',
    discontinued: true,
  },
  'PlayStation 2': {
    description: 'DVD 플레이어 기능을 포함하여 전 세계적으로 가장 많이 팔린 비디오 게임 콘솔(약 1억 5,500만 대 이상). 엄청난 라이브러리를 자랑합니다.',
    specs: 'Emotion Engine (128-bit) @ 294 MHz, 32 MB RDRAM, 4 MB VRAM',
    additionalInput: '듀얼쇼크 2, 아이토이(EyeToy), 네트워크 어댑터, 하드 디스크 드라이브',
    launchPrice: '39,800엔 (일본) / $299 (북미)',
    country: '일본 (Sony Computer Entertainment)',
    discontinued: true,
  },
  'Nintendo GameCube': {
    description: '닌텐도 최초로 광 매체(미니 DVD)를 도입한 콘솔. 작고 귀여운 디자인과 훌륭한 퍼스트파티 타이틀을 보유했습니다.',
    specs: 'IBM PowerPC Gekko @ 485 MHz, 24 MB 1T-SRAM, 16 MB A-Memory',
    additionalInput: '게임보이 플레이어, 웨이브버드(무선 패드), 모뎀 어댑터',
    launchPrice: '25,000엔 (일본) / $199 (북미)',
    country: '일본 (Nintendo)',
    discontinued: true,
  },
  'Xbox': {
    description: '마이크로소프트의 콘솔 시장 첫 진출작. PC 아키텍처를 기반으로 내장 하드 디스크 드라이브와 Xbox Live 온라인 서비스를 성공적으로 도입했습니다.',
    specs: 'Intel Pentium III Custom @ 733 MHz, 64 MB DDR SDRAM, 8 GB 내장 HDD',
    additionalInput: 'Xbox Live 헤드셋, DVD 리모컨',
    launchPrice: '$299',
    country: '미국 (Microsoft)',
    discontinued: true,
  },

  // 7세대 (7th Generation)
  'Xbox 360': {
    description: 'HD 시대를 본격적으로 연 마이크로소프트의 역작. 완성도 높은 Xbox Live와 도전 과제(Achievement) 시스템으로 현대 콘솔의 기초를 다졌습니다.',
    specs: 'IBM PowerPC Xenon @ 3.2 GHz, 512 MB GDDR3 RAM',
    additionalInput: '키넥트(Kinect), HD DVD 플레이어, 무선 어댑터',
    launchPrice: '$299 (Core) / $399 (Premium)',
    country: '미국 (Microsoft)',
    discontinued: true,
  },
  'PlayStation 3': {
    description: '강력한 Cell 브로드밴드 엔진과 블루레이 디스크 드라이브를 채택한 기기. 초기 높은 가격과 개발의 어려움으로 고전했으나 독점작들로 만회했습니다.',
    specs: 'Cell Broadband Engine @ 3.2 GHz, 256 MB XDR RAM, 256 MB GDDR3 VRAM',
    additionalInput: '듀얼쇼크 3, 플레이스테이션 무브, 플레이스테이션 아이',
    launchPrice: '$499 (20GB) / $599 (60GB)',
    country: '일본 (Sony Computer Entertainment)',
    discontinued: true,
  },
  'Wii': {
    description: '모션 컨트롤을 채택하여 비디오 게임에 익숙하지 않은 라이트 유저와 가족 단위의 시장을 개척, 7세대 하드웨어 판매량 1위를 달성했습니다.',
    specs: 'IBM PowerPC Broadway @ 729 MHz, 88 MB RAM',
    additionalInput: '위 리모컨(Wii Remote), 눈차크, 밸런스 보드, 클래식 컨트롤러',
    launchPrice: '25,000엔 (일본) / $249.99 (북미)',
    country: '일본 (Nintendo)',
    discontinued: true,
  },

  // 8세대 (8th Generation)
  'Wii U': {
    description: '화면이 달린 위 U 게임패드를 통해 비대칭 멀티플레이를 시도한 기기. 상업적으로 큰 실패를 거뒀으나 이후 닌텐도 스위치의 밑거름이 되었습니다.',
    specs: 'IBM PowerPC Espresso @ 1.24 GHz, 2 GB DDR3 RAM',
    additionalInput: '위 U 게임패드, 아미보(amiibo), 위 리모컨 지원',
    launchPrice: '$299.99 (Basic) / $349.99 (Deluxe)',
    country: '일본 (Nintendo)',
    discontinued: true,
  },
  'PlayStation 4': {
    description: '강력하고 개발하기 쉬운 PC 아키텍처로 돌아온 소니의 콘솔. 쉐어 기능 등 소셜 연동을 강화하며 8세대를 압도적으로 주도했습니다.',
    specs: 'Custom AMD Jaguar 8-core @ 1.6 GHz, 8 GB GDDR5 RAM',
    additionalInput: 'PlayStation VR, 듀얼쇼크 4, 카메라',
    launchPrice: '$399',
    country: '일본 (Sony Interactive Entertainment)',
    discontinued: true,
  },
  'Xbox One': {
    description: '초기 키넥트 강제 동봉과 올인원 미디어 기기 포지셔닝으로 부진했으나, 이후 하위호환과 게임패스(Game Pass)를 도입하며 생태계를 확장했습니다.',
    specs: 'Custom AMD Jaguar 8-core @ 1.75 GHz, 8 GB DDR3 RAM',
    additionalInput: '키넥트(Xbox One 버전), 엘리트 컨트롤러',
    launchPrice: '$499 (키넥트 포함)',
    country: '미국 (Microsoft)',
    discontinued: true,
  },
  'Nintendo Switch': {
    description: '가정용 콘솔과 휴대용 게임기의 장점을 결합한 하이브리드 콘솔. 젤다의 전설 브레스 오브 더 와일드 등 명작들의 견인으로 대성공을 거두었습니다.',
    specs: 'Custom Nvidia Tegra X1, 4 GB LPDDR4 RAM, 32/64 GB eMMC 내장 메모리',
    additionalInput: '조이콘(Joy-Con), 링콘, 프로 컨트롤러',
    launchPrice: '29,980엔 (일본) / $299.99 (북미)',
    country: '일본 (Nintendo)',
    discontinued: false,
  },

  // 9세대 (9th Generation)
  'PlayStation 5': {
    description: '초고속 커스텀 SSD와 햅틱 피드백을 지원하는 듀얼센스 컨트롤러로 새로운 차원의 몰입감 있는 게임 경험을 제공함.',
    specs: 'Custom AMD Zen 2 8-core @ 3.5 GHz, 16 GB GDDR6 RAM, 825GB Custom NVMe SSD',
    additionalInput: 'PlayStation VR2, PlayStation Portal',
    launchPrice: '$499 (디스크) / $399 (디지털)',
    country: '일본 (Sony Interactive Entertainment)',
    discontinued: false,
  },
  'Xbox Series X': {
    description: '초고속 SSD와 완벽한 하위 호환성, 그리고 마이크로소프트의 게임 구독 서비스인 \'게임패스(Game Pass)\' 생태계를 이끄는 고성능 콘솔.',
    specs: 'Custom AMD Zen 2 8-core @ 3.8 GHz, 16 GB GDDR6 RAM, 1 TB Custom NVMe SSD',
    additionalInput: '확장 스토리지 카드',
    launchPrice: '$499',
    country: '미국 (Microsoft)',
    discontinued: false,
  },
  'Xbox Series S': {
    description: 'Xbox Series X의 보급형 모델로, 디지털 다운로드 전용이며 해상도는 1440p를 목표로 설계되었습니다. 가격 경쟁력이 뛰어납니다.',
    specs: 'Custom AMD Zen 2 8-core @ 3.6 GHz, 10 GB GDDR6 RAM, 512 GB Custom NVMe SSD',
    additionalInput: '확장 스토리지 카드',
    launchPrice: '$299',
    country: '미국 (Microsoft)',
    discontinued: false,
  }
};

const URL = 'https://en.wikipedia.org/wiki/List_of_home_video_game_consoles';

function parseNumber(str: string): number {
  if (!str) return 0;
  const match = str.replace(/,/g, '').match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

async function main() {
  console.log('Fetching Wikipedia console list...');
  
  try {
    const response = await fetch(URL);
    const data = await response.text();
    const $ = cheerio.load(data);
    
    // Select all tables with class 'wikitable'
    // The first table usually contains the main list of consoles.
    const rows = $('table.wikitable').first().find('tbody tr').toArray();
    
    console.log(`Found ${rows.length} rows. Parsing...`);
    
    let processedCount = 0;

    for (let i = 1; i < rows.length; i++) { // Skip header row
      const cols = $(rows[i]).find('td, th');
      
      // Wikipedia table columns: Console Name, Manufacturer, Released, Generation, Units sold
      let name = $(cols[0]).text().trim().replace(/\[.*?\]/g, '');
      const manufacturer = $(cols[1]).text().trim().replace(/\[.*?\]/g, '');
      const releaseStr = $(cols[2]).text().trim().replace(/\[.*?\]/g, '');
      const generationStr = $(cols[3]).text().trim().replace(/\[.*?\]/g, '');
      const sales = $(cols[4]).text().trim().replace(/\[.*?\]/g, '');

      // Normalize name if needed
      name = name.split('\n')[0].trim();
      
      const releaseYear = parseNumber(releaseStr);
      let generation = parseNumber(generationStr);
      if (generation === 0) generation = 1;

      // Skip invalid rows
      if (!name || name === 'Console') continue;

      // Lookup enriched data
      const enriched = enrichedData[name] || {};
      
      // Merge
      const finalName = enriched.name || name;
      const description = enriched.description || `${manufacturer}에서 ${releaseYear}년에 출시한 ${generation}세대 콘솔입니다.`;
      const specs = enriched.specs || '알 수 없음';
      const additionalInput = enriched.additionalInput || '해당 없음';
      const launchPrice = enriched.launchPrice || '불명';
      const country = enriched.country || (manufacturer ? `불명 (${manufacturer})` : '불명');
      const discontinued = enriched.discontinued !== undefined ? enriched.discontinued : true;
      const gamesCount = undefined;
      const media = (specs.includes('블루레이') || specs.includes('디스크') || specs.includes('CD')) ? '디스크 / 다운로드' : '카트리지';
      
      const combinedSpecs = `${specs}${specs !== '알 수 없음' ? ` | 미디어: ${media}` : ''}`;

      await prisma.platform.upsert({
        where: { name: finalName },
        update: {
          manufacturer,
          generation,
          releaseYear,
          totalSales: sales,
          description,
          specs: combinedSpecs,
          additionalInput,
          launchPrice,
          country,
          discontinued,
          gamesCount
        },
        create: {
          name: finalName,
          manufacturer,
          generation,
          releaseYear,
          type: "HOME",
          totalSales: sales,
          description,
          specs: combinedSpecs,
          additionalInput,
          launchPrice,
          country,
          discontinued,
          gamesCount
        }
      });
      processedCount++;
    }
    
    console.log(`Successfully processed and upserted ${processedCount} consoles!`);
  } catch (err) {
    console.error('Error fetching/parsing Wikipedia:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

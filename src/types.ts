// ─── Enums & Literal Types ────────────────────────────────────────────────────

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export type OwnershipStatus =
  | '미개봉'
  | '전부 보유'
  | '일부 누락';

export type PlayStatus =
  | '미플레이'
  | '플레이중'
  | '엔딩 완료'
  | '중단'
  | '반복 플레이중';

export type PurchaseType = '패키지' | '다운로드' | '구독';

export type Condition = 'Mint' | 'Excellent' | 'Good' | 'Fair' | 'Poor';

export type Region = 'KOR' | 'JPN' | 'USA' | 'EUR' | 'OTHER';

export type Visibility = 'public' | 'private' | 'friends';

export type Generation =
  | '1세대 (1972–1980)'
  | '2세대 (1976–1992)'
  | '3세대 (1983–2003)'
  | '4세대 (1987–2004)'
  | '5세대 (1993–2006)'
  | '6세대 (1998–2013)'
  | '7세대 (2005–2017)'
  | '8세대 (2012–2020)'
  | '9세대 (2020–)';

/** 구형 호환용 — 새 코드에서는 Generation 사용 권장 */
export type Era =
  | '1st Gen (1972-1980)'
  | '2nd Gen (1976-1992)'
  | '3rd Gen (1983-2003)'
  | '4th Gen (1987-2004)'
  | '5th Gen (1993-2006)'
  | '6th Gen (1998-2013)'
  | '7th Gen (2005-2017)'
  | '8th Gen (2012-2020)'
  | '9th Gen (2020-)';

export type Tab = 'dashboard' | 'archive' | 'timeline' | 'vault' | 'stats' | 'achievements' | 'profile' | 'admin' | 'settings';
export type VaultViewMode = 'card' | 'shelf' | 'spine' | 'list';
export type SortOption = 'year-asc' | 'year-desc' | 'name-asc' | 'name-desc' | 'rarity' | 'popularity' | 'rating';
export type DataSourceStatus = 'local' | 'api' | 'cached' | 'override';
export type ThemeMode = 'dark' | 'light' | 'retro';

// ─── Storage Buckets ──────────────────────────────────────────────────────────

export type StorageBucket = 
  | 'game-covers' 
  | 'developer-logos' 
  | 'publisher-logos' 
  | 'screenshots' 
  | 'user-uploads';

export interface ImageAsset {
  url: string;
  bucket: StorageBucket;
  path: string;
}

// ─── Platform ─────────────────────────────────────────────────────────────────

export interface Platform {
  id: string;
  name: string;
  manufacturer: string;
  releaseYear: number;
  generation: Generation;
  era: Era; // 구형 호환
  color: string;
  imageUrl: string;
  description: string;
  innovationPoint: string;
  unitsSoldMillions?: number;
  discontinuedYear?: number;
  cpuSpec?: string;
  launchPrice?: string;
  totalSales?: string;
  discontinued?: boolean;
}

/** 구형 호환용 alias */
export type Console = Platform;

// ─── Game ─────────────────────────────────────────────────────────────────────

export interface RelatedEvent {
  year: number;
  description: string;
}

export interface Game {
  id: string;
  title: string;
  releaseYear: number;
  releaseDate?: string; // e.g. "1997-01-31"
  platform: string;
  genre: string;
  country?: string; // "JP" | "US" | "EU" ...
  developer?: string;
  publisher: string;
  developerLogoUrl?: string;
  publisherLogoUrl?: string;
  coverImageUrl?: string;
  /** 구형 호환 */
  imageUrl: string;
  screenshots?: string[];
  description: string;
  historicalContext?: string;
  historicalNote?: string; // 구형 호환
  relatedEvents?: RelatedEvent[];
  competingPlatforms?: string[];
  sameEraGames?: string[]; // game ids
  popularity?: number; // 0~100
  rating?: number; // 0~5
  era: Era;
  rarity: Rarity;
}

// ─── CollectionItem ───────────────────────────────────────────────────────────

export interface CollectionItem {
  id: string;
  gameId: string;
  /** 구형 호환 */
  status: OwnershipStatus;
  ownershipStatus: OwnershipStatus;
  purchaseType?: PurchaseType;
  condition?: Condition;
  region?: Region;
  purchaseDate: string;
  purchasePrice?: number; // KRW
  memo: string;
  playStartDate?: string;
  clearDate?: string;
  playTime?: number; // hours
  playStatus?: PlayStatus;
  rating: number; // 0~5
  visibility?: Visibility;
  sortIndex?: number;
  currentPrice?: number;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  type: string;
  description: string;
  imageUrl: string | null;
  innovation: string | null;
  era: string;
  country: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  relatedGameId: string | null;
  relatedPlatformId: string | null;
}

import type { Condition, OwnershipStatus, PlayStatus, PurchaseType, Region, Visibility } from '@/types';

export const OWNERSHIP_STATUS = {
  WISHLIST: '위시리스트',
  SEALED: '미개봉',
  COMPLETE: '전부 보유',
  INCOMPLETE: '일부 누락',
  PHYSICAL: '보유중(실물)',
  DIGITAL: '보유중(디지털)',
  SUBSCRIPTION: '구독플랜',
} as const satisfies Record<string, OwnershipStatus>;

export const DEFAULT_OWNERSHIP_STATUS = OWNERSHIP_STATUS.WISHLIST;
export const DEFAULT_COLLECTION_MODAL_OWNERSHIP_STATUS = OWNERSHIP_STATUS.SEALED;

export const OWNERSHIP_STATUS_OPTIONS: readonly OwnershipStatus[] = [
  OWNERSHIP_STATUS.WISHLIST,
  OWNERSHIP_STATUS.SEALED,
  OWNERSHIP_STATUS.COMPLETE,
  OWNERSHIP_STATUS.INCOMPLETE,
  OWNERSHIP_STATUS.PHYSICAL,
  OWNERSHIP_STATUS.DIGITAL,
  OWNERSHIP_STATUS.SUBSCRIPTION,
];

export const PACKAGE_OWNERSHIP_STATUS_OPTIONS: readonly OwnershipStatus[] = [
  OWNERSHIP_STATUS.SEALED,
  OWNERSHIP_STATUS.COMPLETE,
  OWNERSHIP_STATUS.INCOMPLETE,
];

export const PLAY_STATUS = {
  UNPLAYED: '미플레이',
  PLAYING: '플레이중',
  CLEARED: '엔딩 완료',
  DROPPED: '중단',
  REPLAYING: '반복 플레이중',
} as const satisfies Record<string, PlayStatus>;

export const DEFAULT_PLAY_STATUS = PLAY_STATUS.UNPLAYED;

export const PLAY_STATUS_OPTIONS: readonly PlayStatus[] = [
  PLAY_STATUS.UNPLAYED,
  PLAY_STATUS.PLAYING,
  PLAY_STATUS.CLEARED,
  PLAY_STATUS.DROPPED,
  PLAY_STATUS.REPLAYING,
];

export const PURCHASE_TYPE_OPTIONS: readonly PurchaseType[] = ['패키지', '다운로드', '구독'];
export const DEFAULT_PURCHASE_TYPE: PurchaseType = '패키지';

export const CONDITION_OPTIONS: readonly Condition[] = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'];
export const DEFAULT_CONDITION: Condition = 'Excellent';

export const REGION_OPTIONS: readonly { value: Region; label: string }[] = [
  { value: 'KOR', label: '한국판' },
  { value: 'JPN', label: '일본판' },
  { value: 'USA', label: '북미판' },
  { value: 'EUR', label: '유럽판' },
  { value: 'OTHER', label: '기타' },
];
export const DEFAULT_REGION: Region = 'KOR';

export const VISIBILITY_OPTIONS: readonly Visibility[] = ['public', 'friends', 'private'];
export const DEFAULT_VISIBILITY: Visibility = 'public';

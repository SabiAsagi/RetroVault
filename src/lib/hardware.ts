import data from '@/data/hardware-catalog.json';

export type HardwareKind = 'model' | 'edition' | 'bundle' | 'color' | 'accessory';
export interface HardwareEntry {
  id: string; platformKey: string; name: string; kinds: HardwareKind[];
  releaseDate: string; region: string; summary: string; sourceUrl: string;
  sourceLabel: string; image: string; checkedAt: string; model?: string; color?: string;
  additionalSources?: { label: string; url: string }[]; parentId?: string; gameQuery?: string; contents?: string[]; notes?: string[]; compatibility?: string[];
}
export const hardwareCatalog = data as HardwareEntry[];
export const hardwareKindLabels: Record<HardwareKind, string> = { model: '기본·개선 모델', edition: '한정 디자인', bundle: '게임 동봉 패키지', color: '본체 색상', accessory: '주변기기' };
export const getHardware = (id: string) => hardwareCatalog.find(entry => entry.id === id);
export interface HardwareRecord { catalogId: string; status: 'OWNED' | 'WISHLIST'; quantity: number; memo: string }

const families = [
  ['PlayStation', 'PlayStation 2', 'PlayStation 3', 'PlayStation 4', 'PlayStation 5'],
  ['PlayStation Portable', 'PlayStation Vita'],
  ['Nintendo DS', 'Nintendo DS Lite', 'Nintendo DSi', 'Nintendo DSi XL'],
  ['Nintendo 3DS', 'Nintendo 3DS XL', 'New Nintendo 3DS', 'New Nintendo 3DS XL', 'Nintendo 2DS', 'New Nintendo 2DS XL'],
  ['Game Boy', 'Game Boy Color', 'Game Boy Advance', 'Game Boy Advance SP', 'Game Boy Micro'],
  ['Xbox', 'Xbox 360', 'Xbox One', 'Xbox Series X|S'],
  ['Nintendo Switch', 'Nintendo Switch 2'],
];
export function getPlatformFamily(name: string): string[] { return families.find(f => f.includes(name)) || [name]; }
export function getHardwarePlatformKey(name: string): string | null {
  if (name === 'PlayStation 5') return 'ps5';
  if (name === 'PlayStation 4') return 'ps4';
  if (['Nintendo DS', 'Nintendo DS Lite'].includes(name)) return 'ds';
  return null;
}
export function hardwareForPlatform(name: string): HardwareEntry[] {
  const key = getHardwarePlatformKey(name);
  return key ? hardwareCatalog.filter(e => e.platformKey === key) : [];
}

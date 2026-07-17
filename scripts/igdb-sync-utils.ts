import * as dotenv from 'dotenv';
import path from 'path';
import { fetchIgdb } from '../src/lib/igdb';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const IGDB_PAGE_SIZE = 500;

export type SyncStats = {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
};

export function createStats(): SyncStats {
  return { created: 0, updated: 0, skipped: 0, errors: 0 };
}

export function readPositiveInt(name: string, fallback = 0): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a positive integer or 0.`);
  }

  return value;
}

export function toIsoDate(timestamp?: number | null): string | null {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

export function toYear(timestamp?: number | null): number {
  if (!timestamp) return 0;
  return new Date(timestamp * 1000).getUTCFullYear();
}

export function shortText(value?: string | null, maxLength = 240): string | null {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function walkIgdbById<T extends { id: number }>(options: {
  endpoint: string;
  fields: string;
  where?: string;
  maxItems?: number;
  onBatch: (items: T[]) => Promise<void>;
}): Promise<number> {
  let cursor = 0;
  let processed = 0;
  const maxItems = options.maxItems ?? 0;

  while (maxItems === 0 || processed < maxItems) {
    const remaining = maxItems === 0 ? IGDB_PAGE_SIZE : maxItems - processed;
    const limit = Math.min(IGDB_PAGE_SIZE, remaining);
    const filters = [`id > ${cursor}`];

    if (options.where?.trim()) {
      filters.push(`(${options.where.trim()})`);
    }

    const query = `
      fields ${options.fields};
      where ${filters.join(' & ')};
      sort id asc;
      limit ${limit};
    `;

    const items = (await fetchIgdb(options.endpoint, query)) as T[];
    if (items.length === 0) break;

    await options.onBatch(items);

    processed += items.length;
    cursor = items[items.length - 1].id;
    console.log(`[${options.endpoint}] processed ${processed}${maxItems ? ` / ${maxItems}` : ''}`);

    if (items.length < limit) break;
  }

  return processed;
}

const COUNTRY_BY_ISO_NUMERIC: Record<number, string> = {
  36: 'Australia',
  40: 'Austria',
  56: 'Belgium',
  76: 'Brazil',
  124: 'Canada',
  156: 'China',
  158: 'Taiwan',
  203: 'Czechia',
  208: 'Denmark',
  246: 'Finland',
  250: 'France',
  276: 'Germany',
  380: 'Italy',
  392: 'Japan',
  410: 'South Korea',
  484: 'Mexico',
  528: 'Netherlands',
  554: 'New Zealand',
  578: 'Norway',
  616: 'Poland',
  643: 'Russia',
  702: 'Singapore',
  724: 'Spain',
  752: 'Sweden',
  756: 'Switzerland',
  804: 'Ukraine',
  826: 'United Kingdom',
  840: 'United States',
};

export function countryFromIsoNumeric(code?: number | null): string | null {
  if (!code) return null;
  return COUNTRY_BY_ISO_NUMERIC[code] ?? null;
}

export function platformTypeFromIgdb(name?: string | null): string {
  const value = name?.toLowerCase() ?? '';

  if (value.includes('portable')) return 'HANDHELD';
  if (value.includes('arcade')) return 'ARCADE';
  if (value.includes('computer') || value.includes('operating system')) return 'PC';
  if (value.includes('console')) return 'HOME';
  return 'OTHER';
}

export function releaseStatusFromIgdb(name?: string | null, releaseTimestamp?: number | null): string {
  const value = name?.toLowerCase() ?? '';

  if (value.includes('cancel')) return 'CANCELLED';
  if (value.includes('rumor')) return 'RUMORED';
  if (value.includes('early')) return 'EARLY_ACCESS';
  if (value.includes('delist') || value.includes('offline')) return 'DELISTED';
  if (releaseTimestamp && releaseTimestamp * 1000 > Date.now()) return 'UPCOMING';
  return 'RELEASED';
}

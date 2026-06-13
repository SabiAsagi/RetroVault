import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables for scripts
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getIgdbToken(): Promise<string> {
  const now = Date.now();
  // Buffer of 60 seconds before expiration
  if (accessToken && tokenExpiresAt > now + 60000) {
    return accessToken;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('IGDB_CLIENT_ID or IGDB_CLIENT_SECRET is missing in .env.local');
  }

  const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
    method: 'POST',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch IGDB token: ${res.status} ${text}`);
  }

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;
  
  return accessToken!;
}

// 1초당 최대 4요청(250ms 간격) Rate limit 준수를 위한 큐
let lastRequestTime = 0;
const RATE_LIMIT_MS = 260; // Slightly more than 250ms to be safe

export async function fetchIgdb(endpoint: string, query: string): Promise<any[]> {
  const token = await getIgdbToken();
  const clientId = process.env.IGDB_CLIENT_ID!;

  // Rate limiting logic
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLast));
  }
  lastRequestTime = Date.now();

  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    body: query,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB API Error (${endpoint}): ${res.status} ${text}`);
  }

  return res.json();
}

export function igdbImageUrl(url: string, size: 't_cover_small' | 't_cover_big' | 't_720p' | 't_screenshot_big' = 't_cover_big'): string {
  if (!url) return '';
  // Convert //images.igdb.com/igdb/image/upload/t_thumb/... -> https://images.igdb.com/igdb/image/upload/t_cover_big/...
  let fullUrl = url.startsWith('//') ? 'https:' + url : url;
  return fullUrl.replace(/t_[a-z_]+/, size);
}

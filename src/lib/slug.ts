export function getGameSlug(game: { releaseYear?: number | null, title: string }) {
  const year = game.releaseYear || '0000';
  return `${year}-${game.title}`;
}

export function parseGameSlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  const firstDashIndex = decoded.indexOf('-');
  if (firstDashIndex === -1) return { year: null, title: decoded };
  return {
    year: parseInt(decoded.substring(0, firstDashIndex), 10),
    title: decoded.substring(firstDashIndex + 1)
  };
}

export function getPlatformSlug(platform: { releaseYear?: number | null, name: string }) {
  const year = platform.releaseYear || '0000';
  return `${year}-${platform.name}`;
}

export function parsePlatformSlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  const firstDashIndex = decoded.indexOf('-');
  if (firstDashIndex === -1) return { year: null, name: decoded };
  return {
    year: parseInt(decoded.substring(0, firstDashIndex), 10),
    name: decoded.substring(firstDashIndex + 1)
  };
}

export function getCompanySlug(company: { foundedAt?: string | null, name: string }) {
  const year = company.foundedAt ? company.foundedAt.substring(0, 4) : '0000';
  return `${year}-${company.name}`;
}

export function parseCompanySlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  const firstDashIndex = decoded.indexOf('-');
  if (firstDashIndex === -1) return { year: null, name: decoded };
  return {
    year: parseInt(decoded.substring(0, firstDashIndex), 10),
    name: decoded.substring(firstDashIndex + 1)
  };
}

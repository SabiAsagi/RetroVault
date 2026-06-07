export function getGameSlug(game: { releaseYear?: number | null, title: string }) {
  const year = game.releaseYear || '0000';
  return encodeURIComponent(`${year}-${game.title.replace(/\//g, '~')}`);
}

export function parseGameSlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  const firstDashIndex = decoded.indexOf('-');
  if (firstDashIndex === -1) return { year: null, title: decoded.replace(/~/g, '/') };
  return {
    year: parseInt(decoded.substring(0, firstDashIndex), 10),
    title: decoded.substring(firstDashIndex + 1).replace(/~/g, '/')
  };
}

export function getPlatformSlug(platform: { releaseYear?: number | null, name: string }) {
  const year = platform.releaseYear || '0000';
  return encodeURIComponent(`${year}-${platform.name.replace(/\//g, '~')}`);
}

export function parsePlatformSlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  const firstDashIndex = decoded.indexOf('-');
  if (firstDashIndex === -1) return { year: null, name: decoded.replace(/~/g, '/') };
  return {
    year: parseInt(decoded.substring(0, firstDashIndex), 10),
    name: decoded.substring(firstDashIndex + 1).replace(/~/g, '/')
  };
}

export function getCompanySlug(company: { foundedAt?: string | Date | null, name: string }) {
  let yearStr = '0000';
  if (company.foundedAt) {
    if (company.foundedAt instanceof Date) {
      yearStr = company.foundedAt.getFullYear().toString();
    } else {
      yearStr = company.foundedAt.toString().substring(0, 4);
    }
  }
  return encodeURIComponent(`${yearStr}-${company.name.replace(/\//g, '~')}`);
}

export function parseCompanySlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  const firstDashIndex = decoded.indexOf('-');
  if (firstDashIndex === -1) return { year: null, name: decoded.replace(/~/g, '/') };
  return {
    year: parseInt(decoded.substring(0, firstDashIndex), 10),
    name: decoded.substring(firstDashIndex + 1).replace(/~/g, '/')
  };
}

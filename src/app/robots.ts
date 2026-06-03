import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/admin', '/private'],
    },
    sitemap: 'https://retrovault.kr/sitemap.xml',
  };
}

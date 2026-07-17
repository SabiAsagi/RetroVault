import { PrismaClient } from '@prisma/client';
import { igdbImageUrl } from '../src/lib/igdb';
import {
  countryFromIsoNumeric,
  createStats,
  readPositiveInt,
  toIsoDate,
  walkIgdbById,
} from './igdb-sync-utils';

const prisma = new PrismaClient();

type IgdbCompany = {
  id: number;
  name?: string;
  description?: string;
  country?: number;
  start_date?: number;
  url?: string;
  developed?: number[];
  published?: number[];
  logo?: { url?: string };
  websites?: Array<{ url?: string; trusted?: boolean }>;
  status?: { name?: string };
};

function companyType(company: IgdbCompany): 'DEVELOPER' | 'PUBLISHER' | 'BOTH' {
  const develops = (company.developed?.length ?? 0) > 0;
  const publishes = (company.published?.length ?? 0) > 0;

  if (develops && !publishes) return 'DEVELOPER';
  if (!develops && publishes) return 'PUBLISHER';
  return 'BOTH';
}

function officialWebsite(company: IgdbCompany): string | null {
  const trusted = company.websites?.find((website) => website.trusted && website.url)?.url;
  return trusted ?? company.websites?.find((website) => website.url)?.url ?? company.url ?? null;
}

async function syncCompanies() {
  console.log('Starting IGDB company sync...');

  const stats = createStats();
  const maxItems = readPositiveInt('IGDB_SYNC_MAX_COMPANIES', 0);

  await walkIgdbById<IgdbCompany>({
    endpoint: 'companies',
    maxItems,
    fields: [
      'id',
      'name',
      'description',
      'country',
      'start_date',
      'url',
      'developed',
      'published',
      'logo.url',
      'websites.url',
      'websites.trusted',
      'status.name',
    ].join(','),
    onBatch: async (companies) => {
      for (const igdbCompany of companies) {
        try {
          const name = igdbCompany.name?.trim();
          if (!name) {
            stats.skipped += 1;
            continue;
          }

          const data = {
            name,
            type: companyType(igdbCompany),
            country: countryFromIsoNumeric(igdbCompany.country),
            logoUrl: igdbCompany.logo?.url
              ? igdbImageUrl(igdbCompany.logo.url, 't_cover_big')
              : null,
            description: igdbCompany.description ?? null,
            foundedAt: toIsoDate(igdbCompany.start_date),
            websiteUrl: officialWebsite(igdbCompany),
            companyStatus: igdbCompany.status?.name?.toUpperCase() ?? null,
            status: 'APPROVED',
          };

          const existing = await prisma.company.findFirst({
            where: {
              name: { equals: name, mode: 'insensitive' },
            },
            select: { id: true },
          });

          if (existing) {
            await prisma.company.update({
              where: { id: existing.id },
              data,
            });
            stats.updated += 1;
          } else {
            await prisma.company.create({ data });
            stats.created += 1;
          }
        } catch (error) {
          stats.errors += 1;
          console.error(`Failed to sync company ${igdbCompany.id}:`, error);
        }
      }
    },
  });

  console.log('IGDB company sync completed:', stats);
}

syncCompanies()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

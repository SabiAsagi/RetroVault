import { PrismaClient } from '@prisma/client';
import { fetchIgdb, igdbImageUrl } from '../src/lib/igdb';

const prisma = new PrismaClient();

async function syncCompanies() {
  console.log('Starting IGDB Companies Sync...');
  
  let offset = 0;
  const limit = 200;
  let totalUpdated = 0;
  let totalCreated = 0;

  while (true) {
    const query = `
      fields name, description, logo.url, country, start_date, developed.name, published.name;
      limit ${limit};
      offset ${offset};
    `;

    console.log(`Fetching companies from IGDB (offset: ${offset})...`);
    const companies = await fetchIgdb('companies', query);

    if (companies.length === 0) {
      break;
    }

    for (const igdbCompany of companies) {
      try {
        const name = igdbCompany.name;
        if (!name) continue;

        const logoUrl = igdbCompany.logo?.url ? igdbImageUrl(igdbCompany.logo.url, 't_cover_big') : null;
        const description = igdbCompany.description;
        // IGDB country is an integer code, mapping it to string might be complex, so we just convert to string or ignore. Let's ignore or store the code.
        // Actually IGDB country code is ISO 3166-1 numeric code. We can just leave country null if we don't map it.
        const foundedAt = igdbCompany.start_date 
          ? new Date(igdbCompany.start_date * 1000).getFullYear().toString()
          : null;

        let type = 'BOTH';
        const hasDeveloped = igdbCompany.developed && igdbCompany.developed.length > 0;
        const hasPublished = igdbCompany.published && igdbCompany.published.length > 0;
        
        if (hasDeveloped && !hasPublished) type = 'DEVELOPER';
        else if (!hasDeveloped && hasPublished) type = 'PUBLISHER';

        const existingCompany = await prisma.company.findFirst({
          where: { name: { equals: name, mode: 'insensitive' } }
        });

        if (existingCompany) {
          const updates: any = {};
          if (!existingCompany.logoUrl && logoUrl) updates.logoUrl = logoUrl;
          if (!existingCompany.description && description) updates.description = description;
          if (!existingCompany.foundedAt && foundedAt) updates.foundedAt = foundedAt;

          if (Object.keys(updates).length > 0) {
            await prisma.company.update({
              where: { id: existingCompany.id },
              data: updates
            });
            console.log(`[UPDATED] ${name}`);
            totalUpdated++;
          }
        } else {
          await prisma.company.create({
            data: {
              name,
              type,
              logoUrl,
              description,
              foundedAt,
              status: 'APPROVED'
            }
          });
          console.log(`[CREATED] ${name}`);
          totalCreated++;
        }
      } catch (err: any) {
        console.error(`Error processing company ${igdbCompany.name}:`, err.message);
      }
    }

    offset += limit;
  }

  console.log(`Sync completed! Updated: ${totalUpdated}, Created: ${totalCreated}`);
}

syncCompanies()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

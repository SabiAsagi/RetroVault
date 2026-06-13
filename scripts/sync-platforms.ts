import { PrismaClient } from '@prisma/client';
import { fetchIgdb, igdbImageUrl } from '../src/lib/igdb';

const prisma = new PrismaClient();

async function syncPlatforms() {
  console.log('Starting IGDB Platforms Sync...');
  
  let offset = 0;
  const limit = 200;
  let totalUpdated = 0;
  let totalCreated = 0;

  while (true) {
    const query = `
      fields name, abbreviation, alternative_name, generation, summary, platform_logo.url, platform_family.name;
      limit ${limit};
      offset ${offset};
    `;

    console.log(`Fetching platforms from IGDB (offset: ${offset})...`);
    const platforms = await fetchIgdb('platforms', query);

    if (platforms.length === 0) {
      break;
    }

    for (const igdbPlatform of platforms) {
      try {
        const name = igdbPlatform.name;
        if (!name) continue;

        const imageUrl = igdbPlatform.platform_logo?.url ? igdbImageUrl(igdbPlatform.platform_logo.url, 't_cover_big') : null;
        const description = igdbPlatform.summary;
        const generation = igdbPlatform.generation || null;
        const releaseYear = 0; // first_release_date is not available on platforms endpoint

        const existingPlatform = await prisma.platform.findFirst({
          where: { name: { equals: name, mode: 'insensitive' } }
        });

        if (existingPlatform) {
          // Update missing fields
          const updates: any = {};
          if (!existingPlatform.imageUrl && imageUrl) updates.imageUrl = imageUrl;
          if (!existingPlatform.description && description) updates.description = description;
          if (!existingPlatform.generation && generation) updates.generation = generation;

          if (Object.keys(updates).length > 0) {
            await prisma.platform.update({
              where: { id: existingPlatform.id },
              data: updates
            });
            console.log(`[UPDATED] ${name}`);
            totalUpdated++;
          }
        } else {
          // Create new platform
          await prisma.platform.create({
            data: {
              name,
              manufacturer: 'Unknown', // IGDB doesn't provide this directly in this query
              releaseYear: releaseYear === 0 ? 1970 : releaseYear,
              generation,
              imageUrl,
              description,
              status: 'APPROVED',
              type: 'HOME'
            }
          });
          console.log(`[CREATED] ${name}`);
          totalCreated++;
        }
      } catch (err: any) {
        console.error(`Error processing platform ${igdbPlatform.name}:`, err.message);
      }
    }

    offset += limit;
  }

  console.log(`Sync completed! Updated: ${totalUpdated}, Created: ${totalCreated}`);
}

syncPlatforms()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import { fetchIgdb, igdbImageUrl } from '../src/lib/igdb';

const prisma = new PrismaClient();

async function syncGames() {
  console.log('Starting IGDB Games Sync...');
  
  let offset = 0;
  const limit = 500;
  let totalUpdated = 0;
  let totalCreated = 0;

  // Load platforms mapping to avoid querying DB for every game
  const platforms = await prisma.platform.findMany({ select: { id: true, name: true } });
  const platformMap = new Map(platforms.map(p => [p.name.toLowerCase(), p.id]));
  
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  const companyMap = new Map(companies.map(c => [c.name.toLowerCase(), c.id]));

  while (true) {
    const query = `
      fields name, summary, first_release_date, genres.name, platforms.name, platforms.abbreviation, cover.url, screenshots.url, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, rating, rating_count;
      limit ${limit};
      offset ${offset};
    `;

    console.log(`Fetching games from IGDB (offset: ${offset})...`);
    const games = await fetchIgdb('games', query);

    if (games.length === 0) {
      break;
    }

    for (const igdbGame of games) {
      try {
        const title = igdbGame.name;
        if (!title) continue;

        const releaseYear = igdbGame.first_release_date 
          ? new Date(igdbGame.first_release_date * 1000).getFullYear() 
          : 0;

        const coverImageUrl = igdbGame.cover?.url ? igdbImageUrl(igdbGame.cover.url, 't_cover_big') : null;
        const screenshotsUrls = igdbGame.screenshots?.map((s: any) => igdbImageUrl(s.url, 't_screenshot_big')) || [];
        const description = igdbGame.summary;
        const genre = igdbGame.genres && igdbGame.genres.length > 0 ? igdbGame.genres[0].name : 'Unknown';

        // Match company
        let developerId = null;
        let publisherId = null;
        if (igdbGame.involved_companies) {
          for (const ic of igdbGame.involved_companies) {
            if (!ic.company?.name) continue;
            const cId = companyMap.get(ic.company.name.toLowerCase());
            if (cId) {
              if (ic.developer && !developerId) developerId = cId;
              if (ic.publisher && !publisherId) publisherId = cId;
            }
          }
        }

        // Match platform
        let platformId = null;
        if (igdbGame.platforms) {
          for (const p of igdbGame.platforms) {
            if (!p.name) continue;
            const pId = platformMap.get(p.name.toLowerCase()) || (p.abbreviation ? platformMap.get(p.abbreviation.toLowerCase()) : null);
            if (pId) {
              platformId = pId;
              break;
            }
          }
        }

        const existingGame = await prisma.game.findFirst({
          where: { 
            title: { equals: title, mode: 'insensitive' },
            releaseYear: releaseYear
          },
          include: { screenshots: true }
        });

        if (existingGame) {
          const updates: any = {};
          if (!existingGame.coverImageUrl && coverImageUrl) updates.coverImageUrl = coverImageUrl;
          if (!existingGame.description && description) updates.description = description;
          if (!existingGame.developerId && developerId) updates.developerId = developerId;
          if (!existingGame.publisherId && publisherId) updates.publisherId = publisherId;

          if (Object.keys(updates).length > 0) {
            await prisma.game.update({
              where: { id: existingGame.id },
              data: updates
            });
            console.log(`[UPDATED] ${title}`);
            totalUpdated++;
          }

          // Add missing screenshots
          if (screenshotsUrls.length > 0 && existingGame.screenshots.length === 0) {
            await prisma.screenshot.createMany({
              data: screenshotsUrls.map((url: string) => ({
                gameId: existingGame.id,
                imageUrl: url
              })),
              skipDuplicates: true
            });
          }

        } else {
          if (!platformId) {
            // Find or create 'Unknown' platform
            let unknownPlatformId = platformMap.get('unknown');
            if (!unknownPlatformId) {
              const unknownPlatform = await prisma.platform.upsert({
                where: { name: 'Unknown' },
                update: {},
                create: {
                  name: 'Unknown',
                  manufacturer: 'Unknown',
                  releaseYear: 1970,
                  type: 'OTHER',
                }
              });
              unknownPlatformId = unknownPlatform.id;
              platformMap.set('unknown', unknownPlatformId);
            }
            platformId = unknownPlatformId;
          }

          const newGame = await prisma.game.create({
            data: {
              title,
              releaseYear: releaseYear === 0 ? 1970 : releaseYear,
              genre,
              description,
              coverImageUrl,
              developerId,
              publisherId,
              platformId,
              status: 'APPROVED',
              screenshots: screenshotsUrls.length > 0 ? {
                create: screenshotsUrls.map((url: string) => ({ imageUrl: url }))
              } : undefined
            }
          });
          console.log(`[CREATED] ${title}`);
          totalCreated++;
        }
      } catch (err: any) {
        console.error(`Error processing game ${igdbGame.name}:`, err.message);
      }
    }

    offset += limit;
  }

  console.log(`Sync completed! Updated: ${totalUpdated}, Created: ${totalCreated}`);
}

syncGames()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

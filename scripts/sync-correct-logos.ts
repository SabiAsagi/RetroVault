import { PrismaClient } from '@prisma/client';
import { fetchIgdb } from '../src/lib/igdb';

const prisma = new PrismaClient();

function getHighResPngUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Convert IGDB url to 720p PNG
  let finalUrl = url.replace('t_thumb', 't_720p').replace('t_cover_big', 't_720p');
  // Add https if missing
  if (finalUrl.startsWith('//')) {
    finalUrl = 'https:' + finalUrl;
  }
  // Convert jpg/jpeg to png for transparency
  finalUrl = finalUrl.replace(/\.jpg$/i, '.png').replace(/\.jpeg$/i, '.png');
  return finalUrl;
}

async function main() {
  console.log('Starting logo synchronization and transparency (PNG) migration...');

  const platforms = await prisma.platform.findMany();
  console.log(`Found ${platforms.length} platforms in DB.`);

  // 1. Process Platforms
  let updatedPlatforms = 0;
  for (const plat of platforms) {
    if (!plat.imageUrl && !plat.name) continue;

    // Search IGDB for this exact platform name to get the versions
    try {
      // First try exact match or close match by fetching via search
      const query = `search "${plat.name}"; fields name, platform_logo.url, versions.name, versions.platform_logo.url; limit 1;`;
      const igdbRes = await fetchIgdb('platforms', query);

      let newUrl = null;

      if (igdbRes && igdbRes.length > 0) {
        const igdbPlat = igdbRes[0];
        
        // Find "Initial version" or "Original" in versions
        let targetLogoUrl = igdbPlat.platform_logo?.url;
        
        if (igdbPlat.versions && igdbPlat.versions.length > 0) {
          const originalVersion = igdbPlat.versions.find((v: any) => 
            v.name?.toLowerCase().includes('initial version') || 
            v.name?.toLowerCase().includes('original') ||
            v.name === igdbPlat.name
          );
          
          if (originalVersion && originalVersion.platform_logo?.url) {
            targetLogoUrl = originalVersion.platform_logo.url;
          }
        }

        if (targetLogoUrl) {
          newUrl = getHighResPngUrl(targetLogoUrl);
        }
      }

      // If IGDB didn't find it, just format the existing URL
      if (!newUrl && plat.imageUrl) {
        newUrl = getHighResPngUrl(plat.imageUrl);
      }

      // Update DB if URL changed
      if (newUrl && newUrl !== plat.imageUrl) {
        await prisma.platform.update({
          where: { id: plat.id },
          data: { imageUrl: newUrl }
        });
        updatedPlatforms++;
      }
      
      // Delay to respect IGDB API limit (4 req/sec)
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (e) {
      // If IGDB lookup fails, just convert existing URL to PNG
      if (plat.imageUrl) {
        const newUrl = getHighResPngUrl(plat.imageUrl);
        if (newUrl && newUrl !== plat.imageUrl) {
          await prisma.platform.update({
            where: { id: plat.id },
            data: { imageUrl: newUrl }
          });
          updatedPlatforms++;
        }
      }
    }
  }

  console.log(`Successfully updated ${updatedPlatforms} platforms.`);

  // 2. Process Companies
  const companies = await prisma.company.findMany();
  console.log(`Found ${companies.length} companies in DB. Converting logos to PNG...`);
  
  let updatedCompanies = 0;
  for (const comp of companies) {
    if (comp.logoUrl) {
      const newUrl = getHighResPngUrl(comp.logoUrl);
      if (newUrl && newUrl !== comp.logoUrl) {
        await prisma.company.update({
          where: { id: comp.id },
          data: { logoUrl: newUrl }
        });
        updatedCompanies++;
      }
    }
  }
  
  console.log(`Successfully updated ${updatedCompanies} companies.`);
  console.log('Migration complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

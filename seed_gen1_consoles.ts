import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Fetching Wikipedia page...');
  const res = await fetch('https://en.wikipedia.org/wiki/List_of_first_generation_home_video_game_consoles');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const consoles = [];
  // Select only the first generation console table
  $('table#genonecon tbody tr').each((i, el) => {
    if (i === 0) return; // skip header
    const tds = $(el).find('td, th');
    
    // Columns:
    // 0: Console, 1: Manufacturer, 2: Logo, 3: Year, 4: Country, 
    // 5: Description, 6: Image, 7: CPU, 8: Additional input, 9: Games count, 10: External reference
    
    const nameNode = $(tds[0]).find('i, a').first();
    const rawName = nameNode.length > 0 ? nameNode.text().trim() : $(tds[0]).text().trim();
    let name = rawName.replace(/\[.*?\]/g, '').trim();
    
    let manufacturer = $(tds[1]).text().trim().replace(/\[.*?\]/g, '');
    let yearRaw = $(tds[3]).text().trim().replace(/\[.*?\]/g, '');
    let country = $(tds[4]).text().trim().replace(/\[.*?\]/g, '');
    let description = $(tds[5]).text().trim().replace(/\[.*?\]/g, '');
    let cpu = $(tds[7]).text().trim().replace(/\[.*?\]/g, '');
    let additionalInput = $(tds[8]).text().trim().replace(/\[.*?\]/g, '');
    let gamesCount = $(tds[9]).text().trim().replace(/\[.*?\]/g, '');
    
    if (!name) return;

    if (!manufacturer) {
        manufacturer = "제조사 불명";
    }

    // Extract year
    let releaseYear = 0;
    const yearMatch = yearRaw.match(/\b(197\d|198\d)\b/);
    if (yearMatch) {
      releaseYear = parseInt(yearMatch[1], 10);
    }

    consoles.push({ 
      name, 
      manufacturer, 
      releaseYear, 
      description,
      country,
      cpu,
      additionalInput,
      gamesCount
    });
  });

  console.log(`Total found: ${consoles.length}`);

  // Deduplicate by name
  const uniqueConsoles = new Map();
  for (const c of consoles) {
    let finalName = c.name;
    let counter = 2;
    while (uniqueConsoles.has(finalName)) {
      finalName = `${c.name} (${c.manufacturer !== "제조사 불명" ? c.manufacturer : `Ver.${counter}`})`;
      if (uniqueConsoles.has(finalName)) {
         finalName = `${c.name} (${c.manufacturer} ${counter})`;
      }
      counter++;
    }
    uniqueConsoles.set(finalName, { ...c, name: finalName });
  }

  const finalData = Array.from(uniqueConsoles.values());
  console.log(`Unique consoles to insert: ${finalData.length}`);

  console.log('Inserting into database...');
  let successCount = 0;
  for (const data of finalData) {
    try {
      await prisma.platform.upsert({
        where: { name: data.name },
        update: {
          manufacturer: data.manufacturer,
          releaseYear: data.releaseYear,
          description: data.description,
          country: data.country,
          specs: data.cpu,
          additionalInput: data.additionalInput,
          gamesCount: data.gamesCount,
        },
        create: {
          name: data.name,
          manufacturer: data.manufacturer,
          generation: 1,
          releaseYear: data.releaseYear,
          type: "HOME",
          status: "APPROVED",
          description: data.description,
          country: data.country,
          specs: data.cpu,
          additionalInput: data.additionalInput,
          gamesCount: data.gamesCount,
        }
      });
      successCount++;
    } catch (err) {
      console.error(`Failed to insert ${data.name}:`, err);
    }
  }

  console.log(`Successfully inserted/updated ${successCount} consoles.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

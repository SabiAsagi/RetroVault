import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
  { name: 'FM Towns Marty', year: 1993 },
  { name: 'Sega CD', year: 1991 },
  { name: 'Mega-CD', year: 1991 },
  { name: 'Neo Geo CD', year: 1994 },
  { name: 'Casio Loopy', year: 1995 },
  { name: 'Evercade VS', year: 2021 },
  { name: 'Xavix PORT', year: 2004 },
  { name: 'Commodore 64 GS', year: 1990 },
  { name: 'Pioneer LaserActive', year: 1993 },
  { name: 'LaserActive', year: 1993 }
];

async function main() {
  console.log('Starting timeline fix...');
  for (const update of updates) {
    const platforms = await prisma.platform.findMany({
      where: {
        name: { contains: update.name }
      }
    });
    
    for (const platform of platforms) {
      await prisma.platform.update({
        where: { id: platform.id },
        data: { releaseYear: update.year }
      });
      console.log(`Updated platform ${platform.name} to year ${update.year}`);
    }

    const events = await prisma.timelineEvent.findMany({
      where: {
        title: { contains: update.name },
        type: 'CONSOLE_RELEASE'
      }
    });

    for (const event of events) {
      await prisma.timelineEvent.update({
        where: { id: event.id },
        data: { year: update.year }
      });
      console.log(`Updated event ${event.title} to year ${update.year}`);
    }
  }
  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

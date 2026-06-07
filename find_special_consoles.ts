import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const searchTerms = [
  "Odyssey",
  "Game Brain",
  "Telstar Arcade",
  "Telstar Marksman",
  "Ameprod",
  "Gameroom Tele-Pong",
  "TV Tennis",
  "Cassette Vision",
  "Wonder Wizard",
  "Telescore 750",
  "VideoSport MK2",
  "Video 2000",
  "Video 3000",
  "Video 3001",
  "Video 2400",
  "Video 2501",
  "Video 2800",
  "Telejogo",
  "Turnir",
  "Ping-O-Tronic"
];

async function run() {
  for (const term of searchTerms) {
    const platforms = await prisma.platform.findMany({
      where: { name: { contains: term, mode: 'insensitive' } },
      select: { name: true, manufacturer: true }
    });
    console.log(`\nSearch: "${term}"`);
    console.log(platforms);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());

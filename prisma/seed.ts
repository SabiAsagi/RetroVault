import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { games as sampleGames, platforms as samplePlatforms } from '../src/data-extended';

const prisma = new PrismaClient();

const isProduction = process.env.NODE_ENV === 'production';
const seedDemoUsers = process.env.SEED_DEMO_USERS === 'true';

async function upsertCompany(name: string | undefined, companyType: 'DEVELOPER' | 'PUBLISHER') {
  if (!name) return null;

  const existing = await prisma.company.findUnique({ where: { name } });
  const nextType =
    !existing || existing.type === companyType || existing.type === 'BOTH'
      ? existing?.type ?? companyType
      : 'BOTH';

  return prisma.company.upsert({
    where: { name },
    update: { type: nextType },
    create: { name, type: companyType },
  });
}

async function seedPlatforms() {
  const platformRecords = [];

  for (const platform of samplePlatforms as any[]) {
    const created = await prisma.platform.upsert({
      where: { name: platform.name },
      update: {
        manufacturer: platform.manufacturer || 'Unknown',
        generation: platform.generation || null,
        releaseYear: platform.releaseYear || 2000,
        type: platform.type || 'HOME',
        variants: platform.variants || null,
        imageUrl: platform.imageUrl || null,
        description: platform.description || null,
        innovationPoint: platform.innovationPoint || null,
      },
      create: {
        name: platform.name,
        manufacturer: platform.manufacturer || 'Unknown',
        generation: platform.generation || null,
        releaseYear: platform.releaseYear || 2000,
        type: platform.type || 'HOME',
        variants: platform.variants || null,
        imageUrl: platform.imageUrl || null,
        description: platform.description || null,
        innovationPoint: platform.innovationPoint || null,
      },
    });

    platformRecords.push(created);
  }

  console.log(`Seeded ${platformRecords.length} platforms`);
  return platformRecords;
}

async function seedGames(platformRecords: Awaited<ReturnType<typeof seedPlatforms>>) {
  const gameRecords = [];

  for (const gameData of sampleGames as any[]) {
    const platform = platformRecords.find((record) => record.name === gameData.platform);
    if (!platform) continue;

    const developerRecord = await upsertCompany(gameData.developer, 'DEVELOPER');
    const publisherRecord = await upsertCompany(gameData.publisher, 'PUBLISHER');
    const releaseYear = Number(gameData.releaseYear) || platform.releaseYear || 2000;

    const createdGame = await prisma.game.upsert({
      where: {
        title_platformId_releaseYear: {
          title: gameData.title,
          platformId: platform.id,
          releaseYear,
        },
      },
      update: {
        developerId: developerRecord?.id,
        publisherId: publisherRecord?.id,
        genre: gameData.genre || 'Unknown',
        country: gameData.country || null,
        coverImageUrl: gameData.imageUrl || null,
        description: gameData.description || null,
        historicalContext: gameData.historicalContext || null,
        popularity: gameData.popularity || 0,
        rating: gameData.rating || 0,
      },
      create: {
        title: gameData.title,
        platformId: platform.id,
        developerId: developerRecord?.id,
        publisherId: publisherRecord?.id,
        genre: gameData.genre || 'Unknown',
        releaseYear,
        releaseDate: gameData.releaseDate || null,
        country: gameData.country || null,
        coverImageUrl: gameData.imageUrl || null,
        description: gameData.description || null,
        historicalContext: gameData.historicalContext || null,
        popularity: gameData.popularity || 0,
        rating: gameData.rating || 0,
      },
    });

    gameRecords.push(createdGame);
  }

  console.log(`Seeded ${gameRecords.length} games`);
  return gameRecords;
}

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || (!isProduction ? 'admin@retrovault.kr' : undefined);
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || (!isProduction ? 'admin1234' : undefined);

  if (!adminEmail || !adminPassword) {
    console.warn('Skipped admin seed. Set ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD to create one.');
    return null;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      name: 'System Admin',
      nickname: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);
  return admin;
}

async function seedDemoAccounts(gameRecords: Awaited<ReturnType<typeof seedGames>>) {
  if (!seedDemoUsers) {
    console.log('Skipped demo users. Set SEED_DEMO_USERS=true to create them.');
    return;
  }

  const demoUsers = [
    { email: 'user1@retrovault.kr', nickname: 'retro_user', role: 'USER', collectionSize: 3 },
    { email: 'user2@retrovault.kr', nickname: 'handheld_fan', role: 'USER', collectionSize: 0 },
    { email: 'collector@retrovault.kr', nickname: 'vault_collector', role: 'USER', collectionSize: 10 },
    { email: 'mod@retrovault.kr', nickname: 'retro_mod', role: 'MODERATOR', collectionSize: 0 },
    { email: 'demo@retrovault.kr', nickname: 'Demo', role: 'USER', collectionSize: 5 },
  ];

  for (const demoUser of demoUsers) {
    const password = demoUser.nickname === 'Demo' ? 'demo1234' : 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        password: hashedPassword,
        role: demoUser.role,
      },
      create: {
        email: demoUser.email,
        name: demoUser.nickname,
        nickname: demoUser.nickname,
        password: hashedPassword,
        role: demoUser.role,
      },
    });

    for (const game of gameRecords.slice(0, demoUser.collectionSize)) {
      await prisma.collectionItem.upsert({
        where: { userId_gameId: { userId: user.id, gameId: game.id } },
        update: {},
        create: {
          userId: user.id,
          gameId: game.id,
          ownershipStatus: 'OWNED',
          purchaseType: 'PHYSICAL',
          condition: 'OPENED',
          visibility: 'PUBLIC',
        },
      });
    }
  }

  console.log('Seeded demo users and collections');
}

async function seedTimelineEvents() {
  const timelineEvents = [
    {
      year: 1972,
      title: 'Magnavox Odyssey launches',
      type: 'console',
      description: 'The first commercial home video game console reaches consumers.',
      innovation: 'Home console market begins',
      era: '1st Gen (1972-1980)',
      sortOrder: 10,
    },
    {
      year: 1983,
      title: 'Atari Shock',
      type: 'event',
      description: 'The North American video game market crashes after oversupply and weak quality control.',
      innovation: 'Platform licensing and quality control become industry priorities',
      era: '2nd Gen (1976-1992)',
      sortOrder: 20,
    },
    {
      year: 1985,
      title: 'Super Mario Bros. release',
      type: 'game',
      description: 'Nintendo helps rebuild the console market with a defining side-scrolling platform game.',
      innovation: 'Precise platforming and mascot-led console identity',
      era: '3rd Gen (1983-2003)',
      sortOrder: 30,
    },
  ];

  for (const event of timelineEvents) {
    const existing = await prisma.timelineEvent.findFirst({
      where: {
        year: event.year,
        title: event.title,
      },
    });

    if (existing) {
      await prisma.timelineEvent.update({
        where: { id: existing.id },
        data: event,
      });
    } else {
      await prisma.timelineEvent.create({ data: event });
    }
  }

  console.log(`Seeded ${timelineEvents.length} timeline events`);
}

async function main() {
  console.log('Start seeding RetroVault data...');

  const platformRecords = await seedPlatforms();
  const gameRecords = await seedGames(platformRecords);
  await seedAdminUser();
  await seedDemoAccounts(gameRecords);
  await seedTimelineEvents();

  console.log('Seeding finished.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

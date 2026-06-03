import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { games as sampleGames, platforms as samplePlatforms } from '../src/data-extended.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Platforms
  const platformRecords = [];
  for (const p of samplePlatforms) {
    const created = await prisma.platform.upsert({
      where: { name: p.name },
      update: {},
      create: {
        name: p.name,
        manufacturer: p.manufacturer || 'Unknown',
        generation: p.generation || null,
        releaseYear: p.releaseYear || 2000,
        type: p.type || 'HOME',
        variants: p.variants || null,
        imageUrl: p.imageUrl,
        description: p.description,
        innovationPoint: p.innovationPoint,
      }
    });
    platformRecords.push(created);
  }
  console.log(`Created/Ensured ${platformRecords.length} platforms`);

  // 2. Create Companies and Games
  const gameRecords = [];
  for (const gameData of sampleGames) {
    const platform = platformRecords.find(p => p.name === gameData.platform);
    if (!platform) continue;

    // Handle Developer
    let developerRecord = null;
    if (gameData.developer) {
      developerRecord = await prisma.company.upsert({
        where: { name: gameData.developer },
        update: {},
        create: {
          name: gameData.developer,
          type: 'DEVELOPER',
        }
      });
    }

    // Handle Publisher
    let publisherRecord = null;
    if (gameData.publisher) {
      publisherRecord = await prisma.company.upsert({
        where: { name: gameData.publisher },
        update: {},
        create: {
          name: gameData.publisher,
          type: 'PUBLISHER',
        }
      });
    }

    // Handle Game
    const createdGame = await prisma.game.upsert({
      where: {
        title_platformId_releaseYear: {
          title: gameData.title,
          platformId: platform.id,
          releaseYear: gameData.releaseYear,
        }
      },
      update: {
        developerId: developerRecord?.id,
        publisherId: publisherRecord?.id,
        genre: gameData.genre || 'Unknown',
        country: gameData.country,
        coverImageUrl: gameData.imageUrl,
        description: gameData.description,
        historicalContext: gameData.historicalContext,
        popularity: gameData.popularity || 0,
        rating: gameData.rating || 0,
      },
      create: {
        title: gameData.title,
        platformId: platform.id,
        developerId: developerRecord?.id,
        publisherId: publisherRecord?.id,
        genre: gameData.genre || 'Unknown',
        releaseYear: gameData.releaseYear,
        releaseDate: gameData.releaseDate,
        country: gameData.country,
        coverImageUrl: gameData.imageUrl,
        description: gameData.description,
        historicalContext: gameData.historicalContext,
        popularity: gameData.popularity || 0,
        rating: gameData.rating || 0,
      }
    });
    gameRecords.push(createdGame);
  }
  console.log(`Created games from sample data`);

  // 3. Create Users
  const testUsers = [
    { email: 'user1@retrovault.kr', nickname: 'retro_user', role: 'USER' },
    { email: 'user2@retrovault.kr', nickname: 'handheld_fan', role: 'USER' },
    { email: 'collector@retrovault.kr', nickname: 'vault_collector', role: 'USER' },
    { email: 'mod@retrovault.kr', nickname: 'retro_mod', role: 'MODERATOR' },
    { email: process.env.ADMIN_INITIAL_EMAIL || 'admin@retrovault.kr', nickname: 'admin', role: 'ADMIN' },
    { email: 'demo@retrovault.kr', nickname: 'Demo', role: 'USER' },
  ];

  for (const u of testUsers) {
    const password = u.nickname === 'admin' 
      ? (process.env.ADMIN_INITIAL_PASSWORD || 'admin1234')
      : (u.nickname === 'Demo' ? 'demo1234' : 'password123');
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashedPassword,
        role: u.role,
      },
      create: {
        email: u.email,
        name: u.nickname === 'admin' ? 'System Admin' : u.nickname,
        nickname: u.nickname,
        password: hashedPassword,
        role: u.role,
      },
    });
    
    // Add dummy collection based on role
    if (u.nickname === 'vault_collector' && gameRecords.length > 0) {
      for (let i = 0; i < Math.min(10, gameRecords.length); i++) {
        await prisma.collectionItem.upsert({
          where: { userId_gameId: { userId: user.id, gameId: gameRecords[i].id } },
          update: {},
          create: { userId: user.id, gameId: gameRecords[i].id, ownershipStatus: '패키지-보유' }
        });
      }
    } else if (u.nickname === 'retro_user' && gameRecords.length > 0) {
      for (let i = 0; i < Math.min(3, gameRecords.length); i++) {
        await prisma.collectionItem.upsert({
          where: { userId_gameId: { userId: user.id, gameId: gameRecords[i].id } },
          update: {},
          create: { userId: user.id, gameId: gameRecords[i].id, ownershipStatus: '엔딩-완료' }
        });
      }
    }
  }
  
  console.log(`Created test users with dummy collections`);

  // 4. Create Timeline Events (Sample)
  const timelineData = [
    {
      year: 1983,
      title: '비디오 게임 대붕괴 (Atari Shock)',
      type: 'event',
      description: '북미 비디오 게임 시장이 E.T. 등 품질이 떨어지는 게임들의 범람으로 붕괴하다.',
      innovation: '이후 닌텐도에 의한 엄격한 라이선스 제도가 확립되는 계기',
      era: '2nd Gen (1976-1992)',
    },
    {
      year: 1985,
      title: '슈퍼 마리오 브라더스 발매',
      type: 'game',
      description: '플랫포머 장르의 교과서이자 역사상 가장 중요한 비디오 게임 중 하나 발매.',
      innovation: '사이드스크롤 점프 액션의 표준화',
      era: '3rd Gen (1983-2003)',
    }
  ];

  for (const t of timelineData) {
    await prisma.timelineEvent.create({
      data: {
        year: t.year,
        title: t.title,
        type: t.type,
        description: t.description,
        innovation: t.innovation,
        era: t.era,
      }
    });
  }
  console.log('Created timeline events');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

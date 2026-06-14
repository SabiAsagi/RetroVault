import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const HARDWARE_IMAGES: Record<string, string> = {
  'PlayStation 2 (PS2)': 'https://upload.wikimedia.org/wikipedia/commons/3/30/PlayStation_2_with_Memory_Card_and_Controller.jpg',
  'PlayStation 3 (PS3)': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Sony-PlayStation-3-CECHA01-wController-L.jpg',
  'PlayStation 4 (PS4)': 'https://upload.wikimedia.org/wikipedia/commons/8/8c/PS4-Console-wDS4.jpg',
  'PlayStation 5 (PS5)': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/PlayStation_5_and_DualSense_with_transparent_background.png',
  '플레이스테이션 포터블 (PSP)': 'https://upload.wikimedia.org/wikipedia/commons/4/46/Psp-1000.jpg',
  '플레이스테이션 비타 (PS Vita)': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/PlayStation_Vita_transparent.png',
  '플레이스테이션 (PS1)': 'https://upload.wikimedia.org/wikipedia/commons/9/95/PSX-Console-wController.jpg',
  '패밀리 컴퓨터 / NES': 'https://upload.wikimedia.org/wikipedia/commons/8/82/NES-Console-Set.jpg',
  '슈퍼 패미컴 / SNES': 'https://upload.wikimedia.org/wikipedia/commons/3/31/SNES-Mod1-Console-Set.jpg',
  '닌텐도 64 (N64)': 'https://upload.wikimedia.org/wikipedia/commons/0/02/N64-Console-Set.jpg',
  '닌텐도 게임큐브': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/GameCube-Console-Set.jpg',
  'Wii (위)': 'https://upload.wikimedia.org/wikipedia/commons/8/83/Wii_console.png',
  'Wii U (위 유)': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Wii_U_Console_and_Gamepad.png',
  '닌텐도 스위치': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Nintendo_Switch_Console.png',
  '게임보이': 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Game-Boy-FL.jpg',
  '게임보이 컬러 (GBC)': 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Game-Boy-Color-Light-Green.jpg',
  '게임보이 어드밴스 (GBA)': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Game-Boy-Advance-Purple.jpg',
  '닌텐도 DS': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Nintendo-DS-Fat-Blue.jpg',
  '닌텐도 3DS': 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Nintendo-3DS-AquaOpen.png',
  '메가 드라이브 / 제네시스': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Sega-Genesis-Mk2-6button.jpg',
  '세가 새턴': 'https://upload.wikimedia.org/wikipedia/commons/1/18/Sega-Saturn-Console-Set-Mk1.jpg',
  '드림캐스트': 'https://upload.wikimedia.org/wikipedia/commons/8/81/Dreamcast-Console-Set.jpg',
  '세가 마스터 시스템 / 마크 3': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Sega-Master-System-Set.jpg',
  '엑스박스 (Xbox)': 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Xbox-Console-wDuke-L.jpg',
  '엑스박스 360 (Xbox 360)': 'https://upload.wikimedia.org/wikipedia/commons/0/03/Xbox-360-Pro-wController.jpg',
  '엑스박스 원 (Xbox One)': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Xbox-One-Console-wController-FL.jpg',
  '엑스박스 시리즈 X/S': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Xbox_Series_X_%281%29.jpg'
};

async function main() {
  console.log('Migrating logos to logoUrl and setting hardware images...');

  // 1. Move imageUrl to logoUrl for all platforms
  await prisma.$executeRawUnsafe(`UPDATE "Platform" SET "logoUrl" = "imageUrl" WHERE "imageUrl" IS NOT NULL;`);
  
  // 2. Clear imageUrl for all platforms
  await prisma.$executeRawUnsafe(`UPDATE "Platform" SET "imageUrl" = NULL;`);
  
  // 3. Set specific hardware images for popular platforms
  let updateCount = 0;
  for (const [name, url] of Object.entries(HARDWARE_IMAGES)) {
    const plat = await prisma.platform.findFirst({ where: { name } });
    if (plat) {
      await prisma.platform.update({
        where: { id: plat.id },
        data: { imageUrl: url }
      });
      updateCount++;
    }
  }

  console.log(`Successfully migrated logos and updated ${updateCount} hardware images.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const IGDB_CORRECTIONS: Record<string, string> = {
  '게임보이 어드밴스 (GBA)': 'https://images.igdb.com/igdb/image/upload/t_720p/pl73.jpg',
  '플레이스테이션 3 (PS3)': 'https://images.igdb.com/igdb/image/upload/t_720p/pl6l.jpg',
  '게임보이': 'https://images.igdb.com/igdb/image/upload/t_720p/pl7n.jpg',
  '닌텐도 64 (N64)': 'https://images.igdb.com/igdb/image/upload/t_720p/pl77.jpg',
  '닌텐도 스위치': 'https://images.igdb.com/igdb/image/upload/t_720p/pl6b.jpg'
};

async function main() {
  console.log('Fixing wrong IGDB logos...');

  for (const [name, url] of Object.entries(IGDB_CORRECTIONS)) {
    const plat = await prisma.platform.findFirst({ where: { name } });
    if (plat) {
      await prisma.platform.update({
        where: { id: plat.id },
        data: { imageUrl: url }
      });
      console.log(`Fixed logo for ${name}`);
    }
  }

  console.log('Successfully fixed known wrong IGDB logos.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

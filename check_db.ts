import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const platforms = await prisma.platform.findMany({where: {name: {contains: 'Atari'}}});
  console.log('Platforms:', platforms.map(p => `${p.name}: ${p.releaseYear}`));
  
  const companies = await prisma.company.findMany({where: {name: {contains: 'Atari'}}});
  console.log('Companies:', companies.map(c => `${c.name}: ${c.foundedAt}`));
}
main().catch(console.error);

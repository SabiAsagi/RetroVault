import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing totalSales and specs data for all platforms...');

  const platforms = await prisma.platform.findMany();
  let updatedCount = 0;

  for (const plat of platforms) {
    let newTotalSales = plat.totalSales;
    let newSpecs = plat.specs;
    let newName = plat.name;
    let changed = false;

    // 1. Fix totalSales being specs
    if (newTotalSales && typeof newTotalSales === 'string') {
      const salesLower = newTotalSales.toLowerCase();
      
      // If it looks like a spec (contains MHz, GHz, CPU, RAM, processor, bit, Intel, ARM, Motorola, etc.)
      // and does NOT look like sales (million, 만 대)
      const isSpec = /(mhz|ghz|cpu|ram|processor|bit|intel|arm|motorola|mos|hitachi|ibm|core|architecture)/i.test(salesLower) || salesLower === '?';
      const isSales = /(million|만 대|sales)/i.test(salesLower);

      if (isSpec && !isSales) {
        // Move it to specs
        if (salesLower !== '?' && !newSpecs) {
          newSpecs = newTotalSales;
        } else if (salesLower !== '?' && newSpecs && !newSpecs.includes(newTotalSales)) {
          // If specs already exists, just combine them if it's different
          newSpecs = `${newSpecs} | ${newTotalSales}`;
        }
        
        newTotalSales = null;
        changed = true;
      }
    }

    // 2. Fix empty strings to null for cleanliness
    if (newTotalSales === '?' || newTotalSales === '') {
      newTotalSales = null;
      changed = true;
    }
    if (newSpecs === '?' || newSpecs === '') {
      newSpecs = null;
      changed = true;
    }

    if (changed) {
      await prisma.platform.update({
        where: { id: plat.id },
        data: {
          totalSales: newTotalSales,
          specs: newSpecs
        }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully fixed data for ${updatedCount} platforms.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const platforms = await prisma.platform.findMany({
    where: { generation: 1 },
    select: { country: true, additionalInput: true, description: true }
  });

  const countries = new Set();
  const inputs = new Set();
  const descriptions = new Set();

  platforms.forEach(p => {
    if (p.country) countries.add(p.country);
    if (p.additionalInput) inputs.add(p.additionalInput);
    if (p.description) descriptions.add(p.description);
  });

  console.log("Countries:");
  console.log(Array.from(countries));
  console.log("Additional Inputs:");
  console.log(Array.from(inputs));
  console.log("Descriptions (sample 10):");
  console.log(Array.from(descriptions).slice(0, 10));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

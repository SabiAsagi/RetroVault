import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      'Skipped admin seed. Set ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD to create one.',
    );
    return;
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
}

async function main() {
  console.log('Starting RetroVault account seed...');
  await seedAdminUser();
  console.log('Account seed finished. Archive data is synced only from IGDB.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

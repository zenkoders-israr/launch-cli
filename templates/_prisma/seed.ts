import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashed = await bcrypt.hash('Admin@123456', 12);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashed,
    },
  });

  console.log('✅ Admin user seeded: admin@example.com');
}

main()
  .catch((err: Error) => {
    console.error('Seeding failed:', err.message ?? 'Unknown error');
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { AppDataSource } from '../typeorm.config';
import * as bcrypt from 'bcryptjs';

async function seed() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  console.log('🌱 Seeding database...');

  const existing = await queryRunner.query(
    `SELECT id FROM users WHERE email = $1`,
    ['admin@example.com'],
  );

  if (existing.length === 0) {
    const hashed = await bcrypt.hash('Admin@123456', 12);
    await queryRunner.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
      ['Admin', 'admin@example.com', hashed],
    );
    console.log('✅ Admin user seeded');
  } else {
    console.log('⏭️  Admin user already exists, skipping');
  }

  await AppDataSource.destroy();
  console.log('✅ Seeding complete');
}

seed().catch((err: Error) => {
  console.error('Seeding failed:', err.message ?? 'Unknown error');
  process.exit(1);
});

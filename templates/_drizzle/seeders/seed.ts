import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { users } from '../schema';
import { eq } from 'drizzle-orm';

dotenv.config();

async function seed() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const db = drizzle(pool);

  console.log('🌱 Seeding database...');

  const existing = await db.select().from(users).where(eq(users.email, 'admin@example.com'));

  if (existing.length === 0) {
    const hashed = await bcrypt.hash('Admin@123456', 12);
    await db.insert(users).values({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashed,
    });
    console.log('✅ Admin user seeded');
  } else {
    console.log('⏭️  Admin user already exists, skipping');
  }

  await pool.end();
  console.log('✅ Seeding complete');
}

seed().catch((err: Error) => {
  console.error('Seeding failed:', err.message ?? 'Unknown error');
  process.exit(1);
});

import bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Seed — create default admin if none exists
//
// Reads:
//   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS
// from .env
// ─────────────────────────────────────────────────────────────
async function seedAdmin(): Promise<void> {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('Missing ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    console.log(`ℹ️  Admin already exists: ${normalizedEmail} (id=${existing.id})`);
    return;
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const admin = await prisma.admin.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    },
  });

  console.log('✅ Seeded admin:');
  console.log(`   id:    ${admin.id}`);
  console.log(`   name:  ${admin.name}`);
  console.log(`   email: ${admin.email}`);
  console.log(`   password: ${password}   ← change after first login`);
}

// ─────────────────────────────────────────────────────────────
// Entrypoint
// ─────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  try {
    await seedAdmin();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
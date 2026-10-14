import bcrypt from 'bcrypt';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Admin Seed Configuration
//
// Reads credentials from environment variables. Falls back to
// safe defaults for local development.
// ─────────────────────────────────────────────────────────────
const ADMIN_NAME = (process.env.ADMIN_NAME ?? 'Admin User').trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'admin@example.com')
  .toLowerCase()
  .trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'adminpassword';
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

// ─────────────────────────────────────────────────────────────
// Password validation
//
// Enforced BEFORE hashing so the seed fails fast on a weak
// password rather than silently creating an insecure account.
// ─────────────────────────────────────────────────────────────
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).{12,128}$/;

const PASSWORD_RULES = [
  'Must be 12–128 characters long',
  'Must contain at least one lowercase letter (a–z)',
  'Must contain at least one uppercase letter (A–Z)',
  'Must contain at least one digit (0–9)',
  'Must contain at least one special character (!@#$%^&*()_+-=[]{};\':"\\|,.<>/?`~)',
];

function assertStrongPassword(password: string): void {
  if (!PASSWORD_REGEX.test(password)) {
    console.error('❌ ADMIN_PASSWORD failed the strength requirements:');
    console.error(`   Received length: ${password.length}`);
    for (const rule of PASSWORD_RULES) {
      console.error(`   • ${rule}`);
    }
    throw new Error('ADMIN_PASSWORD is not strong enough.');
  }
}

// ─────────────────────────────────────────────────────────────
// Seed the admin
//
// Idempotent: if the admin already exists it is left untouched.
// Re-running the seed will never overwrite an existing password.
// ─────────────────────────────────────────────────────────────
async function seedAdmin(): Promise<void> {
  console.log('🔐 Seeding admin account...');
  console.log(`   name:  ${ADMIN_NAME}`);
  console.log(`   email: ${ADMIN_EMAIL}`);

  // Validate password strength before doing any DB work.
  assertStrongPassword(ADMIN_PASSWORD);

  const existing = await prisma.admin.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, name: true, email: true },
  });

  if (existing) {
    console.log(`ℹ️  Admin already exists: ${existing.email} (id=${existing.id})`);
    console.log('   Skipping — existing admin left untouched.');
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_SALT_ROUNDS);

  const admin = await prisma.admin.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  console.log('✅ Admin seeded successfully:');
  console.log(`   id:    ${admin.id}`);
  console.log(`   name:  ${admin.name}`);
  console.log(`   email: ${admin.email}`);
}

// ─────────────────────────────────────────────────────────────
// Entrypoint
// ─────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  try {
    console.log('🌱 Starting database seed...\n');

    await seedAdmin();

    console.log('\n🎉 Seed complete.');
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
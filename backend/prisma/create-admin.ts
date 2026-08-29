/**
 * Create or update a QuranPilot admin account at runtime.
 *
 *   cd backend
 *   npm run admin:create -- --email=you@example.com --password='YourPass1' --name=Admin
 *
 * Production (API container):
 *   sudo docker compose --env-file deploy/production.env -f docker-compose.prod.yml \
 *     exec api npx ts-node prisma/create-admin.ts --email=you@example.com --password='YourPass1' --name=Admin
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
const BCRYPT_ROUNDS = 12;
const prisma = new PrismaClient();

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((value) => value.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
    return process.argv[idx + 1];
  }
  return undefined;
}

async function main() {
  const email = (arg('email') || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = arg('password') || process.env.ADMIN_PASSWORD || '';
  const name = (arg('name') || process.env.ADMIN_NAME || 'Admin').trim() || 'Admin';

  if (!email || !email.includes('@')) {
    console.error('Usage: npm run admin:create -- --email=you@example.com --password=\'YourPass1\' [--name=Admin]');
    process.exit(1);
  }
  if (!PASSWORD_REGEX.test(password)) {
    console.error('Password must be 8–128 characters and include upper, lower, and a number.');
    process.exit(1);
  }

  await prisma.$executeRawUnsafe(
    'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN NOT NULL DEFAULT false',
  );

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const existing = await prisma.user.findUnique({ where: { email } });
  const user = existing
    ? await prisma.user.update({
        where: { email },
        data: { name, passwordHash, isAdmin: true },
        select: { id: true, email: true, name: true },
      })
    : await prisma.user.create({
        data: { email, name, passwordHash, isAdmin: true },
        select: { id: true, email: true, name: true },
      });

  console.log(existing ? 'Updated admin account' : 'Created admin account');
  console.log(`  id:    ${user.id}`);
  console.log(`  email: ${user.email}`);
  console.log(`  name:  ${user.name}`);
  console.log('Sign in at /login then open /admin');
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

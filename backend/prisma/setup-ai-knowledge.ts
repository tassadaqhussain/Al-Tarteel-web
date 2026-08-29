/**
 * Enable pgvector extension and embedding column.
 * Safe to run multiple times (idempotent).
 *
 * Usage: npm run ai:setup
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const sqlPath = join(__dirname, 'sql', 'setup-pgvector.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log('Applying pgvector setup...');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(`${statement};`);
  }

  console.log('pgvector setup complete.');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

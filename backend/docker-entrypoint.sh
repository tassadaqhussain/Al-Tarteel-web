#!/bin/sh
set -e
echo "Waiting for database..."
# Wait for Postgres to accept connections (avoid looping prisma)
until node -e "
  const net = require('net');
  const s = net.createConnection(5432, 'postgres', () => { s.destroy(); process.exit(0); });
  s.on('error', () => process.exit(1));
  s.setTimeout(3000, () => { s.destroy(); process.exit(1); });
" 2>/dev/null; do
  sleep 2
done
echo "Running schema sync..."
npx prisma db push --skip-generate
echo "Database ready."
exec "$@"

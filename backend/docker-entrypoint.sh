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

# Download full Quran when missing (runs in background so API can start)
if [ "${SKIP_QURAN_DOWNLOAD:-0}" != "1" ]; then
  echo "Checking Quran completeness (auto-download if missing)..."
  (
    npx ts-node prisma/download-quran.ts \
      && echo "Quran download finished." \
      && (command -v redis-cli >/dev/null 2>&1 && redis-cli -h redis DEL quran:surahs:all >/dev/null 2>&1 || true) \
      || echo "Warning: Quran download failed."
  ) &
fi

exec "$@"

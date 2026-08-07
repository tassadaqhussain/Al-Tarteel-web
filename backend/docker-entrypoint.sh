#!/bin/sh
set -e
echo "Waiting for database..."
# Wait for Postgres to accept connections (avoid looping prisma)
until node -e "
  const net = require('net');
  const s = net.createConnection(5432, 'postgres', () => { s.destroy(); process.exit(0); });
  s.on('error', () => process.exit(1));
  s.setTimeout(3000, () => { s.destroy(); process.exit(1); });
    10|" 2>/dev/null; do
  sleep 2
done
echo "Running schema sync..."
npx prisma db push --skip-generate
echo "Database ready."

# One background job only (parallel ts-node jobs often OOM-kill the API on 2–4GB VPSes).
# Reciters first (needed for live audio), then Quran download if enabled.
(
  echo "Seeding reciters..."
  if npx ts-node prisma/import-reciters.ts; then
    echo "Reciters seed finished."
  else
    echo "Warning: reciter seed failed."
  fi

  if [ "${SKIP_QURAN_DOWNLOAD:-0}" != "1" ]; then
    echo "Checking Quran completeness (auto-download if missing)..."
    if npx ts-node prisma/download-quran.ts; then
      echo "Quran download finished."
      command -v redis-cli >/dev/null 2>&1 && redis-cli -h redis DEL quran:surahs:all >/dev/null 2>&1 || true
    else
      echo "Warning: Quran download failed."
    fi
  fi
) &

exec "$@"

#!/bin/sh
set -e
echo "Waiting for database..."
# Wait for Postgres to accept connections (avoid looping prisma forever)
tries=0
max_tries=60
until node -e "
  const net = require('net');
  const s = net.createConnection(5432, 'postgres', () => { s.destroy(); process.exit(0); });
  s.on('error', (e) => { console.error('db wait:', e && e.message ? e.message : e); process.exit(1); });
  s.setTimeout(3000, () => { s.destroy(); console.error('db wait: timeout'); process.exit(1); });
"; do
  tries=$((tries + 1))
  if [ "$tries" -ge "$max_tries" ]; then
    echo "ERROR: Postgres not reachable at postgres:5432 after ${max_tries} attempts."
    echo "Check: docker compose ps postgres && docker compose logs postgres --tail 50"
    exit 1
  fi
  echo "Postgres not ready yet (attempt ${tries}/${max_tries})..."
  sleep 2
done
echo "Running schema sync..."
npx prisma db push --skip-generate
echo "Database ready."

# Heavy seed jobs OOM-kill Nest on ~2GB VPSes if run at boot.
# Default OFF — run manually after API is healthy:
#   docker compose exec api npx ts-node prisma/import-reciters.ts
#   docker compose exec api npx ts-node prisma/download-quran.ts
# Opt-in: ENABLE_BOOT_SEED=1 (and SKIP_QURAN_DOWNLOAD=0 to also download Quran).
if [ "${ENABLE_BOOT_SEED:-0}" = "1" ]; then
  (
    echo "Boot seed enabled — seeding reciters..."
    if npx ts-node prisma/import-reciters.ts; then
      echo "Reciters seed finished."
    else
      echo "Warning: reciter seed failed."
    fi

    if [ "${SKIP_QURAN_DOWNLOAD:-0}" != "1" ]; then
      echo "Checking Quran completeness..."
      if npx ts-node prisma/download-quran.ts; then
        echo "Quran download finished."
        command -v redis-cli >/dev/null 2>&1 && redis-cli -h redis DEL quran:surahs:all >/dev/null 2>&1 || true
      else
        echo "Warning: Quran download failed."
      fi
    fi
  ) &
else
  echo "Boot seed skipped (ENABLE_BOOT_SEED!=1). API will start immediately."
fi

exec "$@"

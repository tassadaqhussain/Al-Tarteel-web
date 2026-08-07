#!/bin/sh
set -e

echo "Waiting for database..."

# Prefer host from DATABASE_URL (Compose sets postgresql://...@postgres:5432/...)
DB_HOST="postgres"
DB_PORT="5432"
if [ -n "${DATABASE_URL:-}" ]; then
  # postgresql://user:pass@host:port/db
  _rest="${DATABASE_URL#*@}"
  _hostport="${_rest%%/*}"
  _host="${_hostport%%:*}"
  _port="${_hostport##*:}"
  if [ -n "${_host}" ] && [ "${_host}" != "${_hostport}" ] || [ -n "${_host}" ]; then
    DB_HOST="${_host}"
  fi
  case "${_port}" in
    ''|*"@"*|*"/"*) ;;
    *) DB_PORT="${_port}" ;;
  esac
fi

echo "DB target: ${DB_HOST}:${DB_PORT}"

# DNS sanity (best-effort)
if command -v getent >/dev/null 2>&1; then
  getent hosts "${DB_HOST}" || echo "WARNING: getent hosts ${DB_HOST} failed"
fi

export DB_HOST DB_PORT
node <<'NODE'
const net = require('net');
const host = process.env.DB_HOST || 'postgres';
const port = Number(process.env.DB_PORT || 5432);
const max = 60;

function tryOnce() {
  return new Promise((resolve, reject) => {
    const s = net.connect({ host, port }, () => {
      s.end();
      resolve();
    });
    s.setTimeout(3000, () => {
      s.destroy();
      reject(new Error('timeout'));
    });
    s.on('error', (err) => reject(err));
  });
}

(async () => {
  for (let i = 1; i <= max; i += 1) {
    try {
      await tryOnce();
      console.log(`Postgres reachable at ${host}:${port}`);
      process.exit(0);
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      console.error(`Postgres not ready (${i}/${max}) ${host}:${port} — ${msg}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error(`ERROR: could not reach Postgres at ${host}:${port}`);
  process.exit(1);
})();
NODE

echo "Running schema sync..."
npx prisma db push --skip-generate
echo "Database ready."

# Heavy seed jobs OOM-kill Nest on ~2GB VPSes if run at boot.
# Default OFF — run manually after API is healthy.
if [ "${ENABLE_BOOT_SEED:-0}" = "1" ]; then
  (
    echo "Boot seed enabled — seeding reciters..."
    npx ts-node prisma/import-reciters.ts \
      && echo "Reciters seed finished." \
      || echo "Warning: reciter seed failed."

    if [ "${SKIP_QURAN_DOWNLOAD:-0}" != "1" ]; then
      echo "Checking Quran completeness..."
      npx ts-node prisma/download-quran.ts \
        && echo "Quran download finished." \
        && (command -v redis-cli >/dev/null 2>&1 && redis-cli -h redis DEL quran:surahs:all >/dev/null 2>&1 || true) \
        || echo "Warning: Quran download failed."
    fi
  ) &
else
  echo "Boot seed skipped (ENABLE_BOOT_SEED!=1). API will start immediately."
fi

exec "$@"

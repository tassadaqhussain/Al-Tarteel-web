#!/usr/bin/env bash
# Build and run QuranPilot on production (quranpilot.com).
#
# First time on a new VPS (nginx, Docker, SSL):
#   sudo bash scripts/deploy-production.sh -y
#
# Everyday start / redeploy (this script):
#   cd /var/www/quranpilot
#   sudo bash scripts/run-production.sh -y
#   sudo bash scripts/run-production.sh -y --pull
#   sudo bash scripts/run-production.sh -y --import-content
#
# Options:
#   --env PATH           deploy env file (default: deploy/production.env)
#   --pull               git fetch + reset --hard to origin before building
#   --no-build           start existing images only
#   --import-content     after API is up, import translations/tafsir/study
#   --import-audio       mirror compact spoken-translation audio (EN + Urdu Shamshad + Pashto)
#   --full-audio-import  all Arabic reciters + all translations + WBW (needs lots of disk)
#   --all-translations   with --import-audio: all EN/UR/FA packs (not just compact)
#   -y, --yes            non-interactive
#   -h, --help
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

ENV_FILE="${REPO_ROOT}/deploy/production.env"
ASSUME_YES=0
DO_PULL=0
NO_BUILD=0
IMPORT_CONTENT=0
IMPORT_AUDIO=0
FULL_AUDIO_IMPORT=0
ALL_TRANSLATIONS=0

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  sed -n '2,24p' "$0"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENV_FILE="${2:-}"; shift 2 ;;
    --pull) DO_PULL=1; shift ;;
    --no-build) NO_BUILD=1; shift ;;
    --import-content) IMPORT_CONTENT=1; shift ;;
    --import-audio) IMPORT_AUDIO=1; shift ;;
    --full-audio-import) FULL_AUDIO_IMPORT=1; IMPORT_AUDIO=1; shift ;;
    --all-translations) ALL_TRANSLATIONS=1; IMPORT_AUDIO=1; shift ;;
    --skip-audio-import) IMPORT_AUDIO=0; shift ;;
    -y|--yes) ASSUME_YES=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown option: $1 (see --help)" ;;
  esac
done

[[ "$(id -u)" -eq 0 ]] || die "Run as root: sudo bash scripts/run-production.sh -y"

[[ -f "${ENV_FILE}" ]] || die "Missing ${ENV_FILE}
Copy deploy/production.env.example, set DOMAIN / CERTBOT_EMAIL / JWT_SECRET,
or run: sudo bash scripts/deploy-production.sh -y"

command -v docker >/dev/null 2>&1 || die "Docker is not installed. First run: sudo bash scripts/deploy-production.sh -y"
docker compose version >/dev/null 2>&1 || die "Docker Compose plugin missing"

# shellcheck source=load-env-file.sh
source "${SCRIPT_DIR}/load-env-file.sh"
load_env_file "${ENV_FILE}" || die "Failed to load ${ENV_FILE}"

DOMAIN="${DOMAIN:-quranpilot.com}"
APP_DIR="${APP_DIR:-$REPO_ROOT}"
WEB_PORT="${WEB_PORT:-3010}"
API_PORT="${API_PORT:-4010}"
COMPOSE_FILE="${APP_DIR}/docker-compose.prod.yml"

[[ -d "${APP_DIR}" ]] || die "APP_DIR does not exist: ${APP_DIR}"
[[ -f "${COMPOSE_FILE}" ]] || die "Missing ${COMPOSE_FILE}"

if [[ ! -f "${APP_DIR}/backend/.env" ]]; then
  warn "backend/.env missing — copying from .env.example"
  [[ -f "${APP_DIR}/backend/.env.example" ]] || die "Missing backend/.env.example"
  cp "${APP_DIR}/backend/.env.example" "${APP_DIR}/backend/.env"
fi

if [[ "${ASSUME_YES}" != "1" ]]; then
  echo
  echo "  Domain:   ${DOMAIN}"
  echo "  App dir:  ${APP_DIR}"
  echo "  Pull:     $([[ "${DO_PULL}" == "1" ]] && echo yes || echo no)"
  echo "  Build:    $([[ "${NO_BUILD}" == "1" ]] && echo skip || echo api then web)"
  echo "  Content:  $([[ "${IMPORT_CONTENT}" == "1" ]] && echo import || echo skip)"
  if [[ "${IMPORT_AUDIO}" == "1" ]]; then
    if [[ "${FULL_AUDIO_IMPORT}" == "1" ]]; then
      echo "  Audio:    full mirror"
    elif [[ "${ALL_TRANSLATIONS}" == "1" ]]; then
      echo "  Audio:    all spoken translations + Pashto"
    else
      echo "  Audio:    compact (EN + Urdu Shamshad + Pashto)"
    fi
  else
    echo "  Audio:    skip (pass --import-audio when disk allows)"
  fi
  echo
  read -r -p "Start production stack? [y/N] " reply
  [[ "${reply}" =~ ^[Yy]$ ]] || die "Aborted"
fi

cd "${APP_DIR}"

if [[ "${DO_PULL}" == "1" ]]; then
  log "git fetch + reset --hard to origin"
  git fetch origin
  git reset --hard "@{u}"
fi

log "Sync public URLs"
bash "${APP_DIR}/scripts/sync-public-env.sh"
load_env_file "${ENV_FILE}" || true

if [[ -z "${SITEMAP_LASTMOD:-}" ]] && command -v git >/dev/null 2>&1; then
  SITEMAP_LASTMOD="$(git -C "${APP_DIR}" log -1 --format=%cI 2>/dev/null || true)"
  export SITEMAP_LASTMOD
fi
if [[ -z "${NEXT_PUBLIC_BUILD_DATE:-}" && -n "${SITEMAP_LASTMOD:-}" ]]; then
  NEXT_PUBLIC_BUILD_DATE="${SITEMAP_LASTMOD}"
  export NEXT_PUBLIC_BUILD_DATE
fi

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
COMPOSE=(docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}")

mkdir -p "${APP_DIR}/backend/storage/audio" "${APP_DIR}/backend/storage/tts"

if [[ "${NO_BUILD}" != "1" ]]; then
  log "Build images (api, then web)"
  "${COMPOSE[@]}" build api
  "${COMPOSE[@]}" build web
fi

log "Start stack"
"${COMPOSE[@]}" up -d --remove-orphans
ok "Containers started"

log "Waiting for web + API"
ready_web=0
ready_api=0
for _ in $(seq 1 180); do
  if [[ "${ready_web}" -eq 0 ]] && curl -fsS --max-time 5 "http://127.0.0.1:${WEB_PORT}/" >/dev/null 2>&1; then
    ok "Web → 127.0.0.1:${WEB_PORT}"
    ready_web=1
  fi
  if [[ "${ready_api}" -eq 0 ]] && curl -fsS --max-time 5 "http://127.0.0.1:${API_PORT}/api/v1/quran/surahs" >/dev/null 2>&1; then
    ok "API → 127.0.0.1:${API_PORT}"
    ready_api=1
  fi
  [[ "${ready_web}" -eq 1 && "${ready_api}" -eq 1 ]] && break
  sleep 3
done
if [[ "${ready_web}" -ne 1 ]]; then
  "${COMPOSE[@]}" logs web --tail=80 || true
  die "Web not ready on 127.0.0.1:${WEB_PORT}"
fi
if [[ "${ready_api}" -ne 1 ]]; then
  echo "API curl: $(curl -sS -o /tmp/qp-api-wait.txt -w '%{http_code}' --max-time 5 "http://127.0.0.1:${API_PORT}/api/v1/quran/surahs" || true)"
  echo "----- api logs -----"
  "${COMPOSE[@]}" logs api --tail=120 || true
  echo "----- api ps -----"
  "${COMPOSE[@]}" ps api || true
  die "API not ready on 127.0.0.1:${API_PORT}"
fi

log "Sync Prisma schema (creates new analytics tables if needed)"
"${COMPOSE[@]}" exec -T api npx prisma db push --skip-generate || warn "Prisma db push skipped"

log "Download all 6236 ayahs into Postgres (skips if already complete)"
"${COMPOSE[@]}" exec -T api npm run quran:download
"${COMPOSE[@]}" exec -T api npm run reciters:import

log "Backfill IndoPak script text (skips if already complete)"
bash "${APP_DIR}/scripts/import-indopak.sh" || warn "IndoPak import failed (Uthmani fallback still works)"

if [[ "${IMPORT_CONTENT}" == "1" ]]; then
  log "Import translations, tafsir, and study content"
  bash "${APP_DIR}/scripts/import-all-content.sh" --no-audio
  "${COMPOSE[@]}" restart api
fi

AUDIO_MARKER="${APP_DIR}/deploy/.audio-imported"
# Opt-in only: multi-GB mirrors must not run on every redeploy (small VPS disks fill fast).
if [[ "${IMPORT_AUDIO}" == "1" ]]; then
  mkdir -p "${APP_DIR}/backend/storage/audio"
  AUDIO_FREE_KB="$(df -Pk "${APP_DIR}/backend/storage/audio" 2>/dev/null | awk 'NR==2 {print $4}')"
  AUDIO_FREE_MB=$(( ${AUDIO_FREE_KB:-0} / 1024 ))
  if [[ "${FULL_AUDIO_IMPORT}" == "1" ]]; then
    NEED_MB=40000
    log "Mirror full audio set (Arabic + translations + WBW) — ${AUDIO_FREE_MB} MB free"
    AUDIO_IMPORT_ARGS=(--audio-only)
  elif [[ "${ALL_TRANSLATIONS}" == "1" ]]; then
    NEED_MB=10000
    log "Mirror all spoken-translation audio (EN/UR/FA + Pashto) — ${AUDIO_FREE_MB} MB free"
    AUDIO_IMPORT_ARGS=(--audio-only --translations-only)
  else
    NEED_MB=4000
    log "Mirror compact spoken-translation audio (EN + Urdu Shamshad + Pashto) — ${AUDIO_FREE_MB} MB free"
    AUDIO_IMPORT_ARGS=(--audio-only --translations-only --compact)
  fi
  if [[ "${AUDIO_FREE_MB}" -lt "${NEED_MB}" ]]; then
    warn "Skipping audio mirror: need ≥ ${NEED_MB} MB free, have ${AUDIO_FREE_MB} MB"
    warn "Free disk (e.g. remove incomplete packs / docker prune), then: sudo bash scripts/run-production.sh -y --import-audio"
  elif API_PORT="${API_PORT}" bash "${APP_DIR}/scripts/import-all-content.sh" "${AUDIO_IMPORT_ARGS[@]}"; then
    mkdir -p "$(dirname "${AUDIO_MARKER}")"
    date -u +%FT%TZ > "${AUDIO_MARKER}" || warn "Could not write ${AUDIO_MARKER}"
    ok "Audio mirrored under backend/storage/audio"
    "${COMPOSE[@]}" restart api || warn "API restart skipped"
  else
    warn "Audio mirror failed — retry after freeing disk: sudo bash scripts/run-production.sh -y --import-audio"
  fi
fi

if [[ -f "${APP_DIR}/scripts/ensure-production-ssl.sh" ]]; then
  bash "${APP_DIR}/scripts/ensure-production-ssl.sh" --env "${ENV_FILE}" || warn "SSL check failed (site may still work on apex)"
fi

NGINX_FILTER="${APP_DIR}/deploy/nginx/next-action-filter.conf"
if [[ -f "${NGINX_FILTER}" ]] && command -v nginx >/dev/null 2>&1; then
  cp "${NGINX_FILTER}" /etc/nginx/conf.d/00-next-action-filter.conf \
    || warn "Could not install nginx Next-Action filter (disk full?)"
  nginx -t >/dev/null 2>&1 && systemctl reload nginx >/dev/null 2>&1 || true
fi

PUBLIC_ORIGIN="${FRONTEND_URL:-https://${DOMAIN}}"

if [[ -n "${INDEXNOW_KEY:-}" && "${SKIP_INDEXNOW:-0}" != "1" ]]; then
  log "Submitting sitemaps to IndexNow"
  if command -v node >/dev/null 2>&1; then
    INDEXNOW_KEY="${INDEXNOW_KEY}" SITE_URL="${PUBLIC_ORIGIN}" \
      node "${APP_DIR}/frontend/scripts/submit-indexnow.mjs" \
      || warn "IndexNow submission failed (non-blocking)"
  else
    "${COMPOSE[@]}" exec -T -e "INDEXNOW_KEY=${INDEXNOW_KEY}" -e "SITE_URL=${PUBLIC_ORIGIN}" \
      web node --input-type=module - < "${APP_DIR}/frontend/scripts/submit-indexnow.mjs" \
      || warn "IndexNow submission failed (non-blocking)"
  fi
fi

log "Production is running — ${DOMAIN}"
cat <<EOF

  Website:  ${PUBLIC_ORIGIN}
  API:      ${PUBLIC_ORIGIN}/api/v1
  Local:    http://127.0.0.1:${WEB_PORT}  (web)
            http://127.0.0.1:${API_PORT}/api/v1  (api)

  Logs:     ${COMPOSE[*]} logs -f --tail=100
  Stop:     ${COMPOSE[*]} stop

EOF

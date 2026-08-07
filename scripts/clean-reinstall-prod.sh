#!/usr/bin/env bash
# Clean production reinstall — wipes Postgres + Redis volumes, rebuilds, reloads Quran.
#
# Usage (from repo root on the VPS, as root or with sudo):
#   sudo bash scripts/clean-reinstall-prod.sh
#   sudo bash scripts/clean-reinstall-prod.sh --env /path/to/production.env
#   sudo bash scripts/clean-reinstall-prod.sh --no-logs
#
# WARNING: Deletes ALL database and redis data (users, bookmarks, donations, etc.).
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/production.env"
FOLLOW_LOGS=1

# shellcheck source=sync-public-env.sh
source "${SCRIPT_DIR}/sync-public-env.sh"

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
clean-reinstall-prod.sh — wipe volumes and rebuild production stack

  1. Load deploy/production.env
  2. Auto-sync FRONTEND_URL / CORS / API / AUDIO URLs from DOMAIN
  3. docker compose down -v  (DELETES postgres + redis data)
  4. Build api, then web (sequential — avoids OOM)
  5. Up containers (SKIP_QURAN_DOWNLOAD=0 → downloads Quran)
  6. Follow API logs (Ctrl+C to detach; containers keep running)

Options:
  --env PATH    Path to production.env (default: deploy/production.env)
  --no-logs     Do not follow logs after up
  -h, --help    Show help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENV_FILE="${2:-}"; shift 2 ;;
    --no-logs) FOLLOW_LOGS=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown option: $1 (see --help)" ;;
  esac
done

[[ "$(id -u)" -eq 0 ]] || die "Run as root: sudo bash scripts/clean-reinstall-prod.sh"

cd "${REPO_ROOT}"
[[ -f docker-compose.prod.yml ]] || die "Missing docker-compose.prod.yml in ${REPO_ROOT}"
[[ -f "${ENV_FILE}" ]] || die "Missing ${ENV_FILE} — copy from deploy/production.env.example"

log "Loading ${ENV_FILE}"
set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

log "Auto-sync public URL env vars from DOMAIN"
sync_public_urls "${ENV_FILE}" "${REPO_ROOT}/backend/.env"
# Re-load so compose interpolation sees persisted values
set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a
export SKIP_QURAN_DOWNLOAD=0
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export JWT_SECRET="${JWT_SECRET:-change-me-in-production}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-quran_secret}"
export AI_PROMPT_LIMIT="${AI_PROMPT_LIMIT:-3}"
export NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="${NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:-}"
export NEXT_PUBLIC_BING_SITE_VERIFICATION="${NEXT_PUBLIC_BING_SITE_VERIFICATION:-}"
ok "FRONTEND_URL=${FRONTEND_URL}"
ok "CORS_ORIGINS=${CORS_ORIGINS}"
ok "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}"
ok "AUDIO_PUBLIC_BASE_URL=${AUDIO_PUBLIC_BASE_URL}"

warn "This will DELETE Postgres + Redis volumes (all app data)."
warn "Domain: ${DOMAIN}"
warn "Repo:   ${REPO_ROOT}"
printf 'Type YES to continue: '
read -r CONFIRM
[[ "${CONFIRM}" == "YES" ]] || die "Aborted (typed: ${CONFIRM:-empty})"

log "Stopping stack and deleting volumes"
docker compose -f docker-compose.prod.yml down -v
ok "Volumes removed"

log "Building api"
docker compose -f docker-compose.prod.yml build api
ok "api image ready"

log "Building web"
docker compose -f docker-compose.prod.yml build web
ok "web image ready"

log "Starting stack (Quran download runs in background on API boot)"
docker compose -f docker-compose.prod.yml up -d
ok "Containers started"

log "Quick status"
docker compose -f docker-compose.prod.yml ps

if [[ "${FOLLOW_LOGS}" -eq 1 ]]; then
  log "Following API logs — wait for “Quran download finished.” (Ctrl+C to stop following)"
  docker compose -f docker-compose.prod.yml logs -f api
fi

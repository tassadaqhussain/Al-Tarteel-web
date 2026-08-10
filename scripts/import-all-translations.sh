#!/usr/bin/env bash
# Download word-by-word meanings + full ayah translations from Quran Foundation.
#
# Local (host Node + Postgres on localhost:5435):
#   ./scripts/import-all-translations.sh
#
# Production Docker (recommended on the VPS):
#   sudo ./scripts/import-all-translations.sh
#   sudo ./scripts/import-all-translations.sh --ayahs-only
#   sudo ./scripts/import-all-translations.sh --words-only --langs=en,ur,bn
#
# The script prefers running inside the running `api` container so DATABASE_URL
# comes from docker-compose (postgres hostname), and QF keys come from the
# container env_file (backend/.env) — no need to source .env on the host.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="${ROOT}/backend"
COMPOSE_PROD="${ROOT}/docker-compose.prod.yml"
COMPOSE_DEV="${ROOT}/docker-compose.yml"
ENV_PROD="${ROOT}/deploy/production.env"

WORDS_ONLY=0
AYAHS_ONLY=0
LANGS=""
FORCE_HOST=0
SURAH_ARGS=()

for arg in "$@"; do
  case "$arg" in
    --words-only) WORDS_ONLY=1 ;;
    --ayahs-only) AYAHS_ONLY=1 ;;
    --host) FORCE_HOST=1 ;;
    --langs=*) LANGS="${arg#--langs=}" ;;
    --help|-h)
      sed -n '2,18p' "$0"
      exit 0
      ;;
    *)
      if [[ "$arg" =~ ^[0-9]+$ ]]; then
        SURAH_ARGS+=("$arg")
      else
        echo "Unknown argument: $arg" >&2
        exit 1
      fi
      ;;
  esac
done

WBW_LANGS="${LANGS:-en,ur,bn,id,tr,fa,hi}"

compose_cmd=()
detect_compose() {
  local try_cmds=()
  if [[ -f "${COMPOSE_PROD}" ]] && command -v docker >/dev/null 2>&1; then
    if [[ -f "${ENV_PROD}" ]]; then
      try_cmds+=("docker compose --env-file ${ENV_PROD} -f ${COMPOSE_PROD}")
    fi
    try_cmds+=("docker compose -f ${COMPOSE_PROD}")
  fi
  if [[ -f "${COMPOSE_DEV}" ]] && command -v docker >/dev/null 2>&1; then
    try_cmds+=("docker compose -f ${COMPOSE_DEV}")
  fi

  local candidate
  for candidate in "${try_cmds[@]}"; do
    # shellcheck disable=SC2206
    compose_cmd=($candidate)
    if "${compose_cmd[@]}" exec -T api true >/dev/null 2>&1; then
      return 0
    fi
  done
  compose_cmd=()
  return 1
}

run_in_api() {
  # -T: no TTY (safe over SSH / sudo). Env already injected by Compose.
  "${compose_cmd[@]}" exec -T api "$@"
}

run_words() {
  local args=(npm run words:import -- --langs="${WBW_LANGS}")
  if [[ "${#SURAH_ARGS[@]}" -gt 0 ]]; then
    args+=("${SURAH_ARGS[@]}")
  fi
  echo "==> Word-by-word meanings (${WBW_LANGS})"
  if [[ "${#compose_cmd[@]}" -gt 0 ]]; then
    run_in_api "${args[@]}"
  else
    (cd "${BACKEND}" && "${args[@]}")
  fi
  echo
}

run_ayahs() {
  if [[ "${#SURAH_ARGS[@]}" -gt 0 ]]; then
    echo "Note: ayah translation import always does all 114 surahs (surah args apply to WBW only)."
  fi
  if [[ -n "${LANGS}" ]]; then
    echo "==> Ayah translations (Selected Translations picker) for: ${LANGS}"
    if [[ "${#compose_cmd[@]}" -gt 0 ]]; then
      run_in_api npm run translations:import -- --langs="${LANGS}"
    else
      (cd "${BACKEND}" && npm run translations:import -- --langs="${LANGS}")
    fi
  else
    echo "==> Ayah translations (Selected Translations picker) for ALL languages"
    # Use translations:import (not :all) so older API images without the alias still work.
    if [[ "${#compose_cmd[@]}" -gt 0 ]]; then
      run_in_api npm run translations:import
    else
      (cd "${BACKEND}" && npm run translations:import)
    fi
  fi
  echo
}

load_host_env() {
  if [[ ! -f "${BACKEND}/.env" ]]; then
    echo "Missing ${BACKEND}/.env — for Docker prod this is unusual; for host runs copy backend/.env.example." >&2
    exit 1
  fi
  if [[ ! -r "${BACKEND}/.env" ]]; then
    echo "Cannot read ${BACKEND}/.env (permission denied)." >&2
    echo "Fix: sudo chown \"\$USER:\" backend/.env   OR run via Docker: sudo ./scripts/import-all-translations.sh" >&2
    exit 1
  fi
  # Parse KEY=VALUE without executing the file (safer than source).
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    if [[ "$line" =~ ^(DATABASE_URL|QF_CLIENT_ID|QF_CLIENT_SECRET|QF_API_BASE_URL|QF_AUTH_BASE_URL)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      val="${BASH_REMATCH[2]}"
      val="${val%\"}"; val="${val#\"}"
      val="${val%\'}"; val="${val#\'}"
      export "${key}=${val}"
    fi
  done < "${BACKEND}/.env"

  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "DATABASE_URL is not set in backend/.env" >&2
    echo "On production, prefer Docker mode (api container already has DATABASE_URL)." >&2
    echo "  sudo docker compose --env-file deploy/production.env -f docker-compose.prod.yml ps" >&2
    exit 1
  fi
  if [[ -z "${QF_CLIENT_ID:-}" || -z "${QF_CLIENT_SECRET:-}" ]]; then
    echo "QF_CLIENT_ID and QF_CLIENT_SECRET are required in backend/.env" >&2
    exit 1
  fi
}

echo "==> QuranPilot translation import (reader Selected Translations + WBW)"

USE_DOCKER=0
if [[ "${FORCE_HOST}" -eq 0 ]] && detect_compose; then
  USE_DOCKER=1
  echo "    Mode: Docker (${compose_cmd[*]} exec api …)"
  # Sanity: QF credentials must be present inside the container (from backend/.env env_file).
  if ! run_in_api node -e "if(!process.env.QF_CLIENT_ID||!process.env.QF_CLIENT_SECRET)process.exit(2)"; then
    echo "QF_CLIENT_ID / QF_CLIENT_SECRET missing inside api container." >&2
    echo "Put them in backend/.env (Compose env_file), then: docker compose ... up -d api" >&2
    exit 1
  fi
  DB_HOST="$(run_in_api node -e "const u=process.env.DATABASE_URL||''; const m=u.match(/@([^/:]+)/); process.stdout.write(m?m[1]:'');")"
  echo "    DATABASE_URL host: ${DB_HOST:-unknown}"
else
  echo "    Mode: host Node (backend/)"
  load_host_env
  echo "    DATABASE_URL host: $(printf '%s' "$DATABASE_URL" | sed -E 's#.*@([^/:]+).*#\1#')"
fi
echo

if [[ "$AYAHS_ONLY" -eq 0 ]]; then
  run_words
fi

if [[ "$WORDS_ONLY" -eq 0 ]]; then
  run_ayahs
fi

if [[ "${USE_DOCKER}" -eq 1 ]]; then
  echo "Done. Restart API cache if needed:"
  echo "  ${compose_cmd[*]} restart api"
else
  echo "Done. Restart API if it is already running so caches refresh."
fi

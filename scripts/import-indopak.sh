#!/usr/bin/env bash
# Backfill IndoPak script text from Quran.com API into Postgres.
#
# Production (recommended):
#   sudo bash scripts/import-indopak.sh
#
# Local (Postgres on localhost:5435):
#   ./scripts/import-indopak.sh --host
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="${ROOT}/backend"
COMPOSE_PROD="${ROOT}/docker-compose.prod.yml"
COMPOSE_DEV="${ROOT}/docker-compose.yml"
ENV_PROD="${ROOT}/deploy/production.env"
FORCE_HOST=0
EXTRA_ARGS=()

for arg in "$@"; do
  case "$arg" in
    --host) FORCE_HOST=1 ;;
    --force) EXTRA_ARGS+=(--force) ;;
    --help|-h)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

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
  "${compose_cmd[@]}" exec -T api "$@"
}

echo "==> IndoPak text import"
if [[ "${FORCE_HOST}" == "1" ]]; then
  (cd "${BACKEND}" && npx ts-node -r dotenv/config prisma/import-indopak.ts "${EXTRA_ARGS[@]}")
elif detect_compose; then
  echo "    Running inside api container"
  run_in_api npx ts-node -r dotenv/config prisma/import-indopak.ts "${EXTRA_ARGS[@]}"
else
  echo "No running api container — using host Node + backend/.env" >&2
  (cd "${BACKEND}" && npx ts-node -r dotenv/config prisma/import-indopak.ts "${EXTRA_ARGS[@]}")
fi

echo "==> Done"

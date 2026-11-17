#!/usr/bin/env bash
# Import translations + tafsir into Postgres and optionally start the audio mirror.
#
#   ./scripts/import-all-content.sh
#   ./scripts/import-all-content.sh --no-audio
#   ./scripts/import-all-content.sh --audio-only
#   ./scripts/import-all-content.sh --audio-only --translations-only
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NO_AUDIO=0
AUDIO_ONLY=0
SKIP_WBW_AUDIO=0
TRANSLATIONS_ONLY_AUDIO=0
EXTRA=()
API_PORT="${API_PORT:-4010}"

for arg in "$@"; do
  case "$arg" in
    --no-audio) NO_AUDIO=1 ;;
    --audio-only) AUDIO_ONLY=1 ;;
    --skip-wbw-audio) SKIP_WBW_AUDIO=1 ;;
    --translations-only) TRANSLATIONS_ONLY_AUDIO=1 ;;
    *) EXTRA+=("$arg") ;;
  esac
done

run_audio_mirror() {
  local audio_args=("$@")
  local api_url="http://127.0.0.1:${API_PORT}/api/v1"
  mkdir -p "${ROOT}/backend/storage/audio"

  echo "==> Audio mirror into backend/storage/audio (skip existing files)"
  if command -v node >/dev/null 2>&1; then
    (cd "${ROOT}/backend" && node scripts/download-all-audio.mjs --api="${api_url}" "${audio_args[@]+"${audio_args[@]}"}")
    return
  fi

  # Production image omits scripts/; use a throwaway Node container against the host API.
  if ! command -v docker >/dev/null 2>&1; then
    echo "Need Node.js or Docker to mirror audio." >&2
    return 1
  fi
  echo "    (host Node missing — using docker.io/library/node:22-slim)"
  docker run --rm --network host \
    -v "${ROOT}:/repo" \
    -w /repo/backend \
    node:22-slim \
    node scripts/download-all-audio.mjs --api="${api_url}" "${audio_args[@]+"${audio_args[@]}"}"
}

if [[ "${AUDIO_ONLY}" -eq 0 ]]; then
  echo "==> Arabic Quran text (all 6236 ayahs)"
  if [[ -f "${ROOT}/docker-compose.prod.yml" ]] && docker compose --env-file "${ROOT}/deploy/production.env" -f "${ROOT}/docker-compose.prod.yml" exec -T api true >/dev/null 2>&1; then
    docker compose --env-file "${ROOT}/deploy/production.env" -f "${ROOT}/docker-compose.prod.yml" exec -T api npm run quran:download
  elif docker compose -f "${ROOT}/docker-compose.yml" exec -T api true >/dev/null 2>&1; then
    docker compose -f "${ROOT}/docker-compose.yml" exec -T api npm run quran:download
  else
    (cd "${ROOT}/backend" && npm run quran:download)
  fi

  echo "==> Translations + word-by-word meanings"
  "${ROOT}/scripts/import-all-translations.sh" "${EXTRA[@]+"${EXTRA[@]}"}"

  echo "==> Tafsir catalog and texts"
  COMPOSE_PROD="${ROOT}/docker-compose.prod.yml"
  ENV_PROD="${ROOT}/deploy/production.env"
  if [[ -f "${COMPOSE_PROD}" ]] && docker compose --env-file "${ENV_PROD}" -f "${COMPOSE_PROD}" exec -T api true >/dev/null 2>&1; then
    docker compose --env-file "${ENV_PROD}" -f "${COMPOSE_PROD}" exec -T api npm run tafsir:import
    echo "==> Hadith, lessons, and related Q&A"
    docker compose --env-file "${ENV_PROD}" -f "${COMPOSE_PROD}" exec -T api npm run study:import
  elif docker compose -f "${ROOT}/docker-compose.yml" exec -T api true >/dev/null 2>&1; then
    docker compose -f "${ROOT}/docker-compose.yml" exec -T api npm run tafsir:import
    echo "==> Hadith, lessons, and related Q&A"
    docker compose -f "${ROOT}/docker-compose.yml" exec -T api npm run study:import
  else
    (cd "${ROOT}/backend" && npm run tafsir:import)
    echo "==> Hadith, lessons, and related Q&A"
    (cd "${ROOT}/backend" && npm run study:import)
  fi
fi

if [[ "${NO_AUDIO}" -eq 0 ]]; then
  AUDIO_ARGS=()
  if [[ "${TRANSLATIONS_ONLY_AUDIO}" -eq 1 ]]; then
    AUDIO_ARGS+=(--translations-only)
  elif [[ "${SKIP_WBW_AUDIO}" -eq 1 ]]; then
    AUDIO_ARGS+=(--skip-wbw)
  fi
  run_audio_mirror "${AUDIO_ARGS[@]+"${AUDIO_ARGS[@]}"}"
fi

echo "Done. Restart the API so reciter/tafsir caches refresh."

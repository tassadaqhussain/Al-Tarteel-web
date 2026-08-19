#!/usr/bin/env bash
# Import translations + tafsir into Postgres and optionally start the audio mirror.
#
#   ./scripts/import-all-content.sh
#   ./scripts/import-all-content.sh --no-audio
#   ./scripts/import-all-content.sh --audio-only
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NO_AUDIO=0
AUDIO_ONLY=0
SKIP_WBW_AUDIO=0
EXTRA=()

for arg in "$@"; do
  case "$arg" in
    --no-audio) NO_AUDIO=1 ;;
    --audio-only) AUDIO_ONLY=1 ;;
    --skip-wbw-audio) SKIP_WBW_AUDIO=1 ;;
    *) EXTRA+=("$arg") ;;
  esac
done

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
  echo "==> Audio mirror into backend/storage/audio (skip existing files)"
  AUDIO_ARGS=()
  if [[ "${SKIP_WBW_AUDIO}" -eq 1 ]]; then
    AUDIO_ARGS+=(--skip-wbw)
  fi
  (cd "${ROOT}/backend" && node scripts/download-all-audio.mjs "${AUDIO_ARGS[@]+"${AUDIO_ARGS[@]}"}")
fi

echo "Done. Restart the API so reciter/tafsir caches refresh."

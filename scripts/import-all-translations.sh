#!/usr/bin/env bash
# Download word-by-word meanings + full ayah translations from Quran Foundation.
#
# Prerequisites:
#   - Postgres reachable via backend/.env DATABASE_URL
#   - QF_CLIENT_ID / QF_CLIENT_SECRET set in backend/.env
#   - Quran text already seeded (surahs/ayahs present)
#
# Usage:
#   ./scripts/import-all-translations.sh
#   ./scripts/import-all-translations.sh --words-only
#   ./scripts/import-all-translations.sh --ayahs-only
#   ./scripts/import-all-translations.sh --langs=en,ur,bn
#   ./scripts/import-all-translations.sh --words-only 1 2 114   # selected surahs (WBW only)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="${ROOT}/backend"

WORDS_ONLY=0
AYAHS_ONLY=0
LANGS=""
SURAH_ARGS=()

for arg in "$@"; do
  case "$arg" in
    --words-only) WORDS_ONLY=1 ;;
    --ayahs-only) AYAHS_ONLY=1 ;;
    --langs=*) LANGS="${arg#--langs=}" ;;
    --help|-h)
      sed -n '2,16p' "$0"
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

if [[ ! -f "${BACKEND}/.env" ]]; then
  echo "Missing ${BACKEND}/.env — copy from backend/.env.example and set DATABASE_URL + QF credentials." >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a
source "${BACKEND}/.env"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set in backend/.env" >&2
  exit 1
fi
if [[ -z "${QF_CLIENT_ID:-}" || -z "${QF_CLIENT_SECRET:-}" ]]; then
  echo "QF_CLIENT_ID and QF_CLIENT_SECRET are required in backend/.env" >&2
  exit 1
fi

cd "${BACKEND}"

WBW_LANGS="${LANGS:-en,ur,bn,id,tr,fa,hi}"

echo "==> QuranPilot translation import"
echo "    DATABASE_URL host: $(printf '%s' "$DATABASE_URL" | sed -E 's#.*@([^/:]+).*#\1#')"
echo

if [[ "$AYAHS_ONLY" -eq 0 ]]; then
  echo "==> Word-by-word meanings (${WBW_LANGS})"
  if [[ "${#SURAH_ARGS[@]}" -gt 0 ]]; then
    npm run words:import -- --langs="${WBW_LANGS}" "${SURAH_ARGS[@]}"
  else
    npm run words:import -- --langs="${WBW_LANGS}"
  fi
  echo
fi

if [[ "$WORDS_ONLY" -eq 0 ]]; then
  if [[ "${#SURAH_ARGS[@]}" -gt 0 ]]; then
    echo "Note: ayah translation import always does all 114 surahs (surah args apply to WBW only)."
  fi
  if [[ -n "$LANGS" ]]; then
    echo "==> Ayah translations for languages: ${LANGS}"
    npm run translations:import -- --langs="${LANGS}"
  else
    echo "==> Ayah translations for ALL available languages/resources"
    npm run translations:import:all
  fi
  echo
fi

echo "Done. Restart API if it is already running so caches refresh."

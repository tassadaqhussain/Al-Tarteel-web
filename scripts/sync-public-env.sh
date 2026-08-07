#!/usr/bin/env bash
# Derive and persist public URL env vars from DOMAIN / WWW_DOMAIN.
# Safe to source or execute.
#
# Execute:
#   sudo bash scripts/sync-public-env.sh
#   set -a && source deploy/production.env && set +a
#   sudo docker compose -f docker-compose.prod.yml up -d
#
# Or source helpers:
#   source scripts/sync-public-env.sh
#   sync_public_urls "/path/to/deploy/production.env" "/path/to/backend/.env"
#
set -euo pipefail

_sync_upsert_env() {
  local key="$1" value="$2" file="$3"
  local tmp
  [[ -n "${file}" ]] || return 0
  mkdir -p "$(dirname "${file}")"
  touch "${file}"
  tmp="$(mktemp)"
  if grep -qE "^${key}=" "${file}" 2>/dev/null; then
    while IFS= read -r line || [[ -n "${line}" ]]; do
      case "${line}" in
        "${key}="*) printf '%s=%s\n' "${key}" "${value}" ;;
        *) printf '%s\n' "${line}" ;;
      esac
    done < "${file}" > "${tmp}"
    mv "${tmp}" "${file}"
  else
    printf '%s=%s\n' "${key}" "${value}" >> "${file}"
    rm -f "${tmp}"
  fi
}

# Sets / exports FRONTEND_URL, CORS_ORIGINS, NEXT_PUBLIC_API_URL, AUDIO_PUBLIC_BASE_URL
# and writes them into production.env (+ optional backend/.env).
sync_public_urls() {
  local prod_env="${1:-}"
  local backend_env="${2:-}"

  local domain www origin cors
  domain="${DOMAIN:-quranpilot.com}"
  www="${WWW_DOMAIN:-}"
  origin="https://${domain}"
  cors="${origin}"
  if [[ -n "${www}" ]]; then
    cors="${cors},https://${www}"
  fi

  # Always overwrite derived compose vars from DOMAIN (blank values cause Docker warnings).
  FRONTEND_URL="${origin}"
  CORS_ORIGINS="${cors}"
  NEXT_PUBLIC_API_URL="${origin}/api/v1"
  AUDIO_PUBLIC_BASE_URL="${origin}/api/v1/audio/files"
  DOMAIN="${domain}"

  export DOMAIN FRONTEND_URL CORS_ORIGINS NEXT_PUBLIC_API_URL AUDIO_PUBLIC_BASE_URL

  if [[ -n "${prod_env}" ]]; then
    _sync_upsert_env "DOMAIN" "${DOMAIN}" "${prod_env}"
    _sync_upsert_env "FRONTEND_URL" "${FRONTEND_URL}" "${prod_env}"
    _sync_upsert_env "CORS_ORIGINS" "${CORS_ORIGINS}" "${prod_env}"
    _sync_upsert_env "NEXT_PUBLIC_API_URL" "${NEXT_PUBLIC_API_URL}" "${prod_env}"
    _sync_upsert_env "AUDIO_PUBLIC_BASE_URL" "${AUDIO_PUBLIC_BASE_URL}" "${prod_env}"
  fi

  if [[ -n "${backend_env}" ]]; then
    _sync_upsert_env "FRONTEND_URL" "${FRONTEND_URL}" "${backend_env}"
    _sync_upsert_env "CORS_ORIGINS" "${CORS_ORIGINS}" "${backend_env}"
    _sync_upsert_env "AUDIO_PUBLIC_BASE_URL" "${AUDIO_PUBLIC_BASE_URL}" "${backend_env}"
  fi
}

# When executed (not sourced), run sync using repo paths.
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
  ENV_FILE="${REPO_ROOT}/deploy/production.env"
  BACKEND_ENV="${REPO_ROOT}/backend/.env"

  if [[ -f "${ENV_FILE}" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
    set +a
  elif [[ -f "${REPO_ROOT}/deploy/production.env.example" ]]; then
    cp "${REPO_ROOT}/deploy/production.env.example" "${ENV_FILE}"
    set -a
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
    set +a
    echo "Created ${ENV_FILE} from example"
  else
    echo "Missing ${ENV_FILE}" >&2
    exit 1
  fi

  sync_public_urls "${ENV_FILE}" "${BACKEND_ENV}"
  echo "Synced public URLs into:"
  echo "  ${ENV_FILE}"
  echo "  ${BACKEND_ENV}"
  echo "  FRONTEND_URL=${FRONTEND_URL}"
  echo "  CORS_ORIGINS=${CORS_ORIGINS}"
  echo "  NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}"
  echo "  AUDIO_PUBLIC_BASE_URL=${AUDIO_PUBLIC_BASE_URL}"
fi

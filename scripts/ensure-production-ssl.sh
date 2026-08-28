#!/usr/bin/env bash
# Ensure Let's Encrypt covers apex + www and HTTPS www redirects to apex.
# Safe to run on every deploy (no-op when already correct).
#
# Usage (root on production host):
#   sudo bash scripts/ensure-production-ssl.sh
#   sudo bash scripts/ensure-production-ssl.sh --env deploy/production.env
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/deploy/production.env"

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENV_FILE="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '2,8p' "$0"
      exit 0
      ;;
    *) warn "Unknown option: $1"; shift ;;
  esac
done

[[ "$(id -u)" -eq 0 ]] || { warn "SSL helper skipped (not root)"; exit 0; }
command -v certbot >/dev/null 2>&1 || { warn "SSL helper skipped (certbot missing)"; exit 0; }
command -v nginx >/dev/null 2>&1 || { warn "SSL helper skipped (nginx missing)"; exit 0; }
[[ -f "${ENV_FILE}" ]] || { warn "SSL helper skipped (missing ${ENV_FILE})"; exit 0; }

# shellcheck source=load-env-file.sh
source "${SCRIPT_DIR}/load-env-file.sh"
load_env_file "${ENV_FILE}" || exit 0

DOMAIN="${DOMAIN:-quranpilot.com}"
WWW_DOMAIN="${WWW_DOMAIN:-www.quranpilot.com}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
SITE_NAME="${SITE_NAME:-quranpilot}"
SKIP_SSL="${SKIP_SSL:-0}"

[[ "${SKIP_SSL}" == "1" ]] && { warn "SSL helper skipped (SKIP_SSL=1)"; exit 0; }
[[ -n "${CERTBOT_EMAIL}" && "${CERTBOT_EMAIL}" != "admin@example.com" ]] || {
  warn "SSL helper skipped (set CERTBOT_EMAIL in ${ENV_FILE})"
  exit 0
}

domain_resolves() {
  local host="$1"
  if command -v dig >/dev/null 2>&1; then
    dig +short "${host}" A 2>/dev/null | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' && return 0
    dig +short "${host}" AAAA 2>/dev/null | grep -Eq '^[0-9a-fA-F:]+$' && return 0
    return 1
  fi
  getent ahosts "${host}" 2>/dev/null | grep -Eq '[[:space:]]STREAM' && return 0
  return 1
}

cert_includes_domain() {
  local host="$1"
  certbot certificates 2>/dev/null | grep -Fq " ${host}" && return 0
  certbot certificates 2>/dev/null | grep -Fq "DNS:${host}" && return 0
  return 1
}

install_www_redirect() {
  local snippet="${REPO_ROOT}/deploy/nginx/www-redirect.conf.snippet"
  local target="/etc/nginx/conf.d/${SITE_NAME}-www-redirect.conf"
  [[ -f "${snippet}" ]] || return 0
  if cert_includes_domain "${WWW_DOMAIN}"; then
    sed \
      -e "s/quranpilot\\.com/${DOMAIN}/g" \
      -e "s/www\\.quranpilot\\.com/${WWW_DOMAIN}/g" \
      "${snippet}" > "${target}"
    ok "Wrote ${target}"
    nginx -t && systemctl reload nginx
    ok "HTTPS www → https://${DOMAIN}"
  fi
}

log "Checking SSL for ${DOMAIN}${WWW_DOMAIN:+ + ${WWW_DOMAIN}}"

apex_ok=0
www_ok=0
cert_includes_domain "${DOMAIN}" && apex_ok=1
cert_includes_domain "${WWW_DOMAIN}" && www_ok=1

if [[ "${apex_ok}" -eq 1 && "${www_ok}" -eq 1 ]]; then
  ok "Certificate already covers apex and www"
  install_www_redirect
  certbot renew --nginx --quiet 2>/dev/null || true
  exit 0
fi

if ! domain_resolves "${DOMAIN}"; then
  warn "${DOMAIN} does not resolve — cannot issue SSL"
  exit 0
fi

if [[ -n "${WWW_DOMAIN}" ]] && ! domain_resolves "${WWW_DOMAIN}"; then
  warn "${WWW_DOMAIN} does not resolve — will issue/renew apex only"
  WWW_DOMAIN=""
fi

if [[ "${apex_ok}" -eq 1 && -n "${WWW_DOMAIN}" && "${www_ok}" -eq 0 ]]; then
  log "Expanding certificate to include ${WWW_DOMAIN}"
  if certbot --nginx --non-interactive --agree-tos \
    --email "${CERTBOT_EMAIL}" --expand --redirect \
    -d "${DOMAIN}" -d "${WWW_DOMAIN}"; then
    ok "Certificate expanded for ${WWW_DOMAIN}"
    install_www_redirect
    exit 0
  fi
  warn "Could not expand certificate — www may show browser SSL errors"
  warn "Retry manually: sudo certbot --nginx --expand -d ${DOMAIN} -d ${WWW_DOMAIN}"
  exit 0
fi

if [[ "${apex_ok}" -eq 0 ]]; then
  log "Issuing certificate"
  args=(-d "${DOMAIN}")
  [[ -n "${WWW_DOMAIN}" ]] && args+=(-d "${WWW_DOMAIN}")
  if certbot --nginx --non-interactive --agree-tos \
    --email "${CERTBOT_EMAIL}" --redirect \
    "${args[@]}"; then
    ok "Certificate issued"
    install_www_redirect
  else
    warn "Certbot failed — site may be HTTP only until DNS/firewall is fixed"
  fi
fi

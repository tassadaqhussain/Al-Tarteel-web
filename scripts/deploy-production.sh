#!/usr/bin/env bash
# Full production deploy — QuranPilot (quranpilot.com)
#
# Installs missing packages (nginx, certbot, docker, curl), creates the
# quranpilot.com Nginx vhost if needed, starts Docker stack, issues SSL.
#
# Usage (Ubuntu/Debian VPS as root):
#   cd /path/to/Al-Tarteel-web
#   sudo bash scripts/deploy-production.sh -y
#
# Options:
#   --env PATH                deploy env file (default: deploy/production.env)
#   --force-vhost             overwrite existing Nginx site
#   --skip-ssl                HTTP only
#   --skip-docker-install     do not attempt Docker Engine install
#   -y, --yes                 non-interactive
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

ENV_FILE="${REPO_ROOT}/deploy/production.env"
CLI_FORCE_VHOST=0
CLI_SKIP_SSL=0
ASSUME_YES=0
SKIP_DOCKER_INSTALL=0

DEFAULT_DOMAIN="quranpilot.com"
DEFAULT_WWW_DOMAIN="www.quranpilot.com"
DEFAULT_SITE_NAME="quranpilot"

log()  { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
deploy-production.sh — full production install + deploy for quranpilot.com

  1. Install nginx / certbot / curl if missing
  2. Install Docker Engine + Compose if missing
  3. Create Nginx vhost for quranpilot.com (+ www) if missing
  4. Build/start docker-compose.prod.yml
  5. Issue Let's Encrypt SSL (certbot --nginx) with HTTPS redirect

Options:
  --env PATH              Path to production.env
  --force-vhost           Recreate Nginx site even if it exists
  --skip-ssl              Skip Certbot
  --skip-docker-install   Fail if Docker is missing instead of installing
  -y, --yes               Non-interactive
  -h, --help              Show help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENV_FILE="${2:-}"; shift 2 ;;
    --force-vhost) CLI_FORCE_VHOST=1; shift ;;
    --skip-ssl) CLI_SKIP_SSL=1; shift ;;
    --skip-docker-install) SKIP_DOCKER_INSTALL=1; shift ;;
    -y|--yes) ASSUME_YES=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown option: $1 (see --help)" ;;
  esac
done

[[ "$(id -u)" -eq 0 ]] || die "Run as root: sudo bash scripts/deploy-production.sh -y"

PKG=""
if command -v apt-get >/dev/null 2>&1; then
  PKG=apt
elif command -v dnf >/dev/null 2>&1; then
  PKG=dnf
elif command -v yum >/dev/null 2>&1; then
  PKG=yum
else
  die "Unsupported OS — need apt (Debian/Ubuntu) or dnf/yum (RHEL family)"
fi

export DEBIAN_FRONTEND=noninteractive
apt_update_once=0

ensure_apt_updated() {
  if [[ "${PKG}" == "apt" && "${apt_update_once}" -eq 0 ]]; then
    log "Updating apt package index"
    apt-get update -y
    apt_update_once=1
  fi
}

install_pkgs() {
  local pkgs=("$@")
  [[ ${#pkgs[@]} -eq 0 ]] && return 0
  log "Installing packages: ${pkgs[*]}"
  case "${PKG}" in
    apt)
      ensure_apt_updated
      apt-get install -y "${pkgs[@]}"
      ;;
    dnf) dnf install -y "${pkgs[@]}" ;;
    yum) yum install -y "${pkgs[@]}" ;;
  esac
}

# ---------------------------------------------------------------------------
# Ensure production.env (defaults → quranpilot.com)
# ---------------------------------------------------------------------------
if [[ ! -f "${ENV_FILE}" ]]; then
  example="${REPO_ROOT}/deploy/production.env.example"
  [[ -f "${example}" ]] || die "Missing ${example}"
  log "Creating ${ENV_FILE} with quranpilot.com defaults"
  mkdir -p "$(dirname "${ENV_FILE}")"
  cp "${example}" "${ENV_FILE}"
  sed -i.bak \
    -e "s|^DOMAIN=.*|DOMAIN=${DEFAULT_DOMAIN}|" \
    -e "s|^WWW_DOMAIN=.*|WWW_DOMAIN=${DEFAULT_WWW_DOMAIN}|" \
    -e "s|^SITE_NAME=.*|SITE_NAME=${DEFAULT_SITE_NAME}|" \
    -e "s|^APP_DIR=.*|APP_DIR=${REPO_ROOT}|" \
    "${ENV_FILE}" && rm -f "${ENV_FILE}.bak"
  if grep -qE '^JWT_SECRET=change-me' "${ENV_FILE}"; then
    secret="$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
    sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=${secret}|" "${ENV_FILE}" && rm -f "${ENV_FILE}.bak"
  fi
  warn "Edit CERTBOT_EMAIL in ${ENV_FILE} if SSL will run"
  ok "Wrote ${ENV_FILE}"
else
  ok "Using env file: ${ENV_FILE}"
fi

# shellcheck disable=SC1090
set -a
# shellcheck source=/dev/null
source "${ENV_FILE}"
set +a

DOMAIN="${DOMAIN:-$DEFAULT_DOMAIN}"
WWW_DOMAIN="${WWW_DOMAIN:-$DEFAULT_WWW_DOMAIN}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
APP_DIR="${APP_DIR:-$REPO_ROOT}"
SITE_NAME="${SITE_NAME:-$DEFAULT_SITE_NAME}"
WEB_PORT="${WEB_PORT:-3010}"
API_PORT="${API_PORT:-4010}"
SKIP_QURAN_DOWNLOAD="${SKIP_QURAN_DOWNLOAD:-0}"
JWT_SECRET="${JWT_SECRET:-change-me-in-production}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-quran_secret}"

FORCE_VHOST="${FORCE_VHOST:-0}"
SKIP_SSL="${SKIP_SSL:-0}"
# CLI wins
[[ "${CLI_FORCE_VHOST}" == "1" ]] && FORCE_VHOST=1
[[ "${CLI_SKIP_SSL}" == "1" ]] && SKIP_SSL=1

SERVER_NAMES="${DOMAIN}"
CERTBOT_DOMAINS=(-d "${DOMAIN}")
if [[ -n "${WWW_DOMAIN}" ]]; then
  SERVER_NAMES="${DOMAIN} ${WWW_DOMAIN}"
  CERTBOT_DOMAINS+=(-d "${WWW_DOMAIN}")
fi

PUBLIC_ORIGIN="https://${DOMAIN}"
FRONTEND_URL="${PUBLIC_ORIGIN}"
CORS_ORIGINS="${PUBLIC_ORIGIN}"
if [[ -n "${WWW_DOMAIN}" ]]; then
  CORS_ORIGINS="${CORS_ORIGINS},https://${WWW_DOMAIN}"
fi
NEXT_PUBLIC_API_URL="${PUBLIC_ORIGIN}/api/v1"
AUDIO_PUBLIC_BASE_URL="${PUBLIC_ORIGIN}/api/v1/audio/files"

export FRONTEND_URL CORS_ORIGINS NEXT_PUBLIC_API_URL AUDIO_PUBLIC_BASE_URL
export JWT_SECRET SKIP_QURAN_DOWNLOAD POSTGRES_PASSWORD WEB_PORT API_PORT

NGINX_AVAILABLE="/etc/nginx/sites-available/${SITE_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${SITE_NAME}"
NGINX_CONF_D="/etc/nginx/conf.d/${SITE_NAME}.conf"
NGINX_TPL="${REPO_ROOT}/deploy/nginx/quranpilot.conf.tpl"
CERTBOT_WEBROOT="/var/www/certbot"
COMPOSE_FILE="${APP_DIR}/docker-compose.prod.yml"

if [[ "${ASSUME_YES}" != "1" ]]; then
  echo
  echo "  Domain:     ${DOMAIN}"
  echo "  WWW:        ${WWW_DOMAIN:-"(none)"}"
  echo "  App dir:    ${APP_DIR}"
  echo "  Site:       ${SITE_NAME}"
  echo "  SSL:        $([[ "${SKIP_SSL}" == "1" ]] && echo skip || echo certbot)"
  echo "  Email:      ${CERTBOT_EMAIL:-"(not set)"}"
  echo
  read -r -p "Continue full production deploy? [y/N] " reply
  [[ "${reply}" =~ ^[Yy]$ ]] || die "Aborted"
fi

# ---------------------------------------------------------------------------
log "Ensuring system packages (nginx, certbot, curl, …)"
MISSING=()
command -v curl >/dev/null 2>&1 || MISSING+=(curl)
command -v openssl >/dev/null 2>&1 || MISSING+=(openssl)
command -v nginx >/dev/null 2>&1 || MISSING+=(nginx)

if [[ "${SKIP_SSL}" != "1" ]]; then
  if ! command -v certbot >/dev/null 2>&1; then
    case "${PKG}" in
      apt) MISSING+=(certbot python3-certbot-nginx) ;;
      dnf|yum) MISSING+=(certbot python3-certbot-nginx) ;;
    esac
  elif [[ "${PKG}" == "apt" ]] && ! dpkg -l python3-certbot-nginx 2>/dev/null | grep -q '^ii'; then
    MISSING+=(python3-certbot-nginx)
  fi
fi

if [[ ${#MISSING[@]} -gt 0 ]]; then
  install_pkgs "${MISSING[@]}"
else
  ok "Required packages already present"
fi

command -v curl >/dev/null 2>&1 || die "curl missing after install"
command -v nginx >/dev/null 2>&1 || die "nginx missing after install"
if [[ "${SKIP_SSL}" != "1" ]]; then
  command -v certbot >/dev/null 2>&1 || die "certbot missing after install"
fi

systemctl enable nginx >/dev/null 2>&1 || true
systemctl start nginx >/dev/null 2>&1 || true
ok "Nginx is running"

# ---------------------------------------------------------------------------
install_docker() {
  log "Installing Docker Engine + Compose plugin"
  case "${PKG}" in
    apt)
      ensure_apt_updated
      apt-get install -y ca-certificates curl gnupg
      install -m 0755 -d /etc/apt/keyrings
      if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
        curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg
      fi
      # shellcheck disable=SC1091
      . /etc/os-release
      local docker_os="${ID}"
      [[ "${ID}" == "debian" || "${ID}" == "ubuntu" ]] || docker_os="ubuntu"
      echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${docker_os} ${VERSION_CODENAME} stable" \
        > /etc/apt/sources.list.d/docker.list
      apt-get update -y
      apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
      ;;
    dnf)
      dnf -y install dnf-plugins-core
      dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo || true
      dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin \
        || dnf install -y docker docker-compose
      ;;
    yum)
      yum install -y yum-utils
      yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo || true
      yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin \
        || yum install -y docker
      ;;
  esac
  systemctl enable docker
  systemctl start docker
  ok "Docker installed"
}

if ! command -v docker >/dev/null 2>&1; then
  [[ "${SKIP_DOCKER_INSTALL}" == "1" ]] && die "Docker is not installed"
  install_docker
else
  ok "Docker present: $(docker --version)"
fi

if ! docker compose version >/dev/null 2>&1; then
  [[ "${SKIP_DOCKER_INSTALL}" == "1" ]] && die "Docker Compose plugin missing"
  warn "Installing Docker Compose plugin"
  case "${PKG}" in
    apt) install_pkgs docker-compose-plugin ;;
    dnf|yum) install_pkgs docker-compose-plugin || true ;;
  esac
  docker compose version >/dev/null 2>&1 || die "Could not install docker compose plugin"
fi
ok "Docker Compose OK"
systemctl enable docker >/dev/null 2>&1 || true
systemctl start docker >/dev/null 2>&1 || true

# ---------------------------------------------------------------------------
if command -v ufw >/dev/null 2>&1; then
  log "Configuring UFW (22/80/443)"
  ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22/tcp >/dev/null 2>&1 || true
  ufw allow 80/tcp >/dev/null 2>&1 || true
  ufw allow 443/tcp >/dev/null 2>&1 || true
  ok "UFW rules for 80/443 ensured"
elif command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active --quiet firewalld; then
  log "Configuring firewalld (http/https)"
  firewall-cmd --permanent --add-service=http >/dev/null 2>&1 || true
  firewall-cmd --permanent --add-service=https >/dev/null 2>&1 || true
  firewall-cmd --reload >/dev/null 2>&1 || true
  ok "firewalld http/https open"
fi

# ---------------------------------------------------------------------------
upsert_env() {
  local key="$1" value="$2" file="$3"
  local tmp
  tmp="$(mktemp)"
  if [[ -f "${file}" ]] && grep -qE "^${key}=" "${file}"; then
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

[[ -d "${APP_DIR}" ]] || die "APP_DIR does not exist: ${APP_DIR}"
[[ -f "${COMPOSE_FILE}" ]] || die "Missing ${COMPOSE_FILE}"
[[ -f "${NGINX_TPL}" ]] || die "Missing Nginx template ${NGINX_TPL}"

if [[ ! -f "${APP_DIR}/backend/.env" ]]; then
  if [[ -f "${APP_DIR}/backend/.env.example" ]]; then
    warn "backend/.env missing — copying from .env.example"
    cp "${APP_DIR}/backend/.env.example" "${APP_DIR}/backend/.env"
  else
    touch "${APP_DIR}/backend/.env"
  fi
fi

# ---------------------------------------------------------------------------
log "Nginx vhost for ${DOMAIN}"
mkdir -p "${CERTBOT_WEBROOT}/.well-known/acme-challenge"
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled 2>/dev/null || true
mkdir -p /etc/nginx/conf.d 2>/dev/null || true
chown -R www-data:www-data "${CERTBOT_WEBROOT}" 2>/dev/null \
  || chown -R nginx:nginx "${CERTBOT_WEBROOT}" 2>/dev/null \
  || true

render_vhost() {
  sed \
    -e "s/__DOMAIN__/${DOMAIN}/g" \
    -e "s/__SERVER_NAMES__/${SERVER_NAMES}/g" \
    -e "s/__WEB_PORT__/${WEB_PORT}/g" \
    -e "s/__API_PORT__/${API_PORT}/g" \
    "${NGINX_TPL}"
}

USE_SITES_AVAILABLE=0
[[ -d /etc/nginx/sites-available ]] && USE_SITES_AVAILABLE=1

write_vhost() {
  if [[ "${USE_SITES_AVAILABLE}" -eq 1 ]]; then
    render_vhost > "${NGINX_AVAILABLE}"
    ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"
    ok "Wrote & enabled ${NGINX_AVAILABLE}"
  else
    render_vhost > "${NGINX_CONF_D}"
    ok "Wrote ${NGINX_CONF_D}"
  fi
}

VHOST_PATH="${NGINX_AVAILABLE}"
[[ "${USE_SITES_AVAILABLE}" -eq 1 ]] || VHOST_PATH="${NGINX_CONF_D}"

if [[ -f "${VHOST_PATH}" && "${FORCE_VHOST}" != "1" ]]; then
  ok "Vhost already exists: ${VHOST_PATH} (use --force-vhost to recreate)"
  if [[ "${USE_SITES_AVAILABLE}" -eq 1 && ! -e "${NGINX_ENABLED}" ]]; then
    ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"
    ok "Enabled existing site"
  fi
else
  write_vhost
fi

[[ -e /etc/nginx/sites-enabled/default ]] && rm -f /etc/nginx/sites-enabled/default && warn "Disabled default Nginx site"
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

nginx -t
systemctl reload nginx || systemctl restart nginx
ok "Nginx serving ${DOMAIN} → web:${WEB_PORT} api:${API_PORT}"

# ---------------------------------------------------------------------------
log "Sync public URLs into backend/.env"
BACKEND_ENV="${APP_DIR}/backend/.env"
upsert_env "FRONTEND_URL" "${FRONTEND_URL}" "${BACKEND_ENV}"
upsert_env "CORS_ORIGINS" "${CORS_ORIGINS}" "${BACKEND_ENV}"
upsert_env "AUDIO_PUBLIC_BASE_URL" "${AUDIO_PUBLIC_BASE_URL}" "${BACKEND_ENV}"
upsert_env "JWT_SECRET" "${JWT_SECRET}" "${BACKEND_ENV}"
ok "backend/.env updated"

# ---------------------------------------------------------------------------
log "Docker Compose — build & start"
cd "${APP_DIR}"
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
ok "Containers up"

log "Waiting for web/API"
ready_web=0
ready_api=0
for _ in $(seq 1 90); do
  if [[ "${ready_web}" -eq 0 ]] && curl -fsS "http://127.0.0.1:${WEB_PORT}/" >/dev/null 2>&1; then
    ok "Web OK → 127.0.0.1:${WEB_PORT}"
    ready_web=1
  fi
  if [[ "${ready_api}" -eq 0 ]] && curl -fsS "http://127.0.0.1:${API_PORT}/api/v1/quran/surahs" >/dev/null 2>&1; then
    ok "API OK → 127.0.0.1:${API_PORT}"
    ready_api=1
  fi
  [[ "${ready_web}" -eq 1 && "${ready_api}" -eq 1 ]] && break
  sleep 2
done
[[ "${ready_web}" -eq 1 ]] || warn "Web not ready — docker compose -f docker-compose.prod.yml logs web --tail=80"
[[ "${ready_api}" -eq 1 ]] || warn "API not ready — docker compose -f docker-compose.prod.yml logs api --tail=80"

# ---------------------------------------------------------------------------
if [[ "${SKIP_SSL}" == "1" ]]; then
  warn "SSL skipped. Open http://${DOMAIN} until you re-run without --skip-ssl."
else
  if [[ -z "${CERTBOT_EMAIL}" || "${CERTBOT_EMAIL}" == "admin@example.com" ]]; then
    die "Set CERTBOT_EMAIL in ${ENV_FILE} to a real address for Let's Encrypt"
  fi

  log "SSL for ${SERVER_NAMES}"
  if certbot certificates 2>/dev/null | grep -qE "Domains:.*[[:space:]]${DOMAIN}([[:space:]]|$)"; then
    ok "Certificate already exists for ${DOMAIN}"
    certbot renew --nginx --quiet || warn "certbot renew reported an issue"
  else
    certbot --nginx --non-interactive --agree-tos \
      --email "${CERTBOT_EMAIL}" --redirect \
      "${CERTBOT_DOMAINS[@]}" \
      || die "Certbot failed. Ensure DNS for ${DOMAIN} points here and ports 80/443 are open."
    ok "SSL issued for ${DOMAIN} (+ HTTPS redirect)"
  fi

  systemctl enable certbot.timer >/dev/null 2>&1 || true
  systemctl start certbot.timer >/dev/null 2>&1 || true
  nginx -t && systemctl reload nginx
  ok "HTTPS live: ${PUBLIC_ORIGIN}"
fi

# ---------------------------------------------------------------------------
log "Deploy complete — ${DOMAIN}"
cat <<EOF

  Website:   ${PUBLIC_ORIGIN}
  WWW:       ${WWW_DOMAIN:+https://${WWW_DOMAIN}}
  API:       ${PUBLIC_ORIGIN}/api/v1
  Vhost:     ${VHOST_PATH}
  Compose:   docker compose -f docker-compose.prod.yml

EOF

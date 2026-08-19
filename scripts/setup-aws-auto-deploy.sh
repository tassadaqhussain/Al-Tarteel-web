#!/usr/bin/env bash
# One-time EC2 setup so GitHub Actions can SSH in and run production deploys.
#
# On the AWS instance (Ubuntu):
#   sudo bash scripts/setup-aws-auto-deploy.sh
#
# Then add the printed values as GitHub repo secrets (Settings → Secrets → Actions).
#
set -euo pipefail

[[ "$(id -u)" -eq 0 ]] || { echo "Run as root: sudo bash scripts/setup-aws-auto-deploy.sh" >&2; exit 1; }

DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
APP_DIR="${APP_DIR:-/var/www/quranpilot}"
KEY_DIR="/home/${DEPLOY_USER}/.ssh"
KEY_PATH="${KEY_DIR}/github_actions_aws"
SUDOERS="/etc/sudoers.d/quranpilot-deploy"

id "${DEPLOY_USER}" >/dev/null 2>&1 || { echo "User ${DEPLOY_USER} does not exist" >&2; exit 1; }
install -d -m 700 -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" "${KEY_DIR}"

if [[ ! -f "${KEY_PATH}" ]]; then
  sudo -u "${DEPLOY_USER}" ssh-keygen -t ed25519 -N '' -f "${KEY_PATH}" -C "github-actions@quranpilot"
fi

AUTH="${KEY_DIR}/authorized_keys"
touch "${AUTH}"
chmod 600 "${AUTH}"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "${AUTH}"
PUB="$(cat "${KEY_PATH}.pub")"
grep -qxF "${PUB}" "${AUTH}" || echo "${PUB}" >> "${AUTH}"

cat > "${SUDOERS}" <<EOF
${DEPLOY_USER} ALL=(root) NOPASSWD: /usr/bin/git
${DEPLOY_USER} ALL=(root) NOPASSWD: /bin/bash ${APP_DIR}/scripts/run-production.sh
${DEPLOY_USER} ALL=(root) NOPASSWD: /bin/bash ${APP_DIR}/scripts/run-production.sh -y
${DEPLOY_USER} ALL=(root) NOPASSWD: /bin/bash ${APP_DIR}/scripts/deploy-production.sh
${DEPLOY_USER} ALL=(root) NOPASSWD: /bin/bash ${APP_DIR}/scripts/deploy-production.sh -y
EOF
chmod 440 "${SUDOERS}"
visudo -cf "${SUDOERS}"

if [[ -d "${APP_DIR}/.git" ]]; then
  sudo -u "${DEPLOY_USER}" mkdir -p /home/"${DEPLOY_USER}"/.ssh
  sudo -u "${DEPLOY_USER}" ssh-keyscan -H github.com >> /home/"${DEPLOY_USER}"/.ssh/known_hosts 2>/dev/null || true
  ssh-keyscan -H github.com >> /root/.ssh/known_hosts 2>/dev/null || true
fi

HOST_IP="$(curl -fsS --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)"
[[ -n "${HOST_IP}" ]] || HOST_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"

cat <<EOF

AWS auto-deploy is ready on this instance.

1. GitHub → Settings → Secrets and variables → Actions → New repository secret:

   AWS_EC2_HOST     = ${HOST_IP:-<this server public IP or Elastic IP>}
   AWS_EC2_USER     = ${DEPLOY_USER}
   AWS_EC2_SSH_KEY  = (paste the private key below, including BEGIN/END lines)
   AWS_EC2_APP_DIR  = ${APP_DIR}   (optional)

2. EC2 security group: allow inbound TCP 22. Key-only SSH (no password).
   GitHub-hosted runners use many IPs, so either allow 22 from 0.0.0.0/0 with
   key auth only, or front SSH with a bastion / Elastic IP allowlist.

3. First app install (once):
     sudo bash ${APP_DIR}/scripts/deploy-production.sh -y

4. After secrets are saved, push to main (or Actions → Deploy to AWS → Run workflow).

----- BEGIN PRIVATE KEY (AWS_EC2_SSH_KEY) -----
$(cat "${KEY_PATH}")
----- END PRIVATE KEY -----

EOF

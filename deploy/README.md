# Production deploy — quranpilot.com

## First time on a VPS (Ubuntu/Debian)

```bash
cd /var/www/quranpilot
sudo bash scripts/deploy-production.sh -y
```

Installs nginx, certbot, and Docker if needed, writes the vhost, builds the
stack, and issues Let's Encrypt SSL.

## Start or redeploy the app

```bash
cd /var/www/quranpilot
sudo bash scripts/run-production.sh -y
sudo bash scripts/run-production.sh -y --pull
sudo bash scripts/run-production.sh -y --import-content
```

`--import-content` loads translations, tafsir, Hadith, lessons, and related Q&A
into Postgres. Add `--import-audio` to also mirror recitation files onto the host
(`backend/storage/audio`).

## Auto-deploy on AWS EC2

After the first install, GitHub Actions SSHs into the instance on every push to `main`.

On the EC2 host (once):

```bash
sudo bash scripts/setup-aws-auto-deploy.sh
```

Add the printed values as GitHub **Actions secrets**:

| Secret | Value |
|--------|--------|
| `AWS_EC2_HOST` | Elastic IP or public DNS |
| `AWS_EC2_USER` | `ubuntu` |
| `AWS_EC2_SSH_KEY` | Private key printed by the setup script |
| `AWS_EC2_APP_DIR` | `/var/www/quranpilot` (optional) |

EC2 security group must allow SSH (22). Then push to `main`, or run **Actions → Deploy to AWS → Run workflow**.

## Before first SSL run

Edit `deploy/production.env`:

```bash
CERTBOT_EMAIL=you@yourmail.com
APP_DIR=/var/www/quranpilot
```

Also put secrets in `backend/.env` (Stripe, Quran Foundation, etc.).

## DNS

Point both to this server:

- `quranpilot.com` → A/AAAA  
- `www.quranpilot.com` → A/AAAA (or CNAME → apex)

If `www` is missing, Certbot still issues a cert for the apex and leaves a retry hint.
Leave `WWW_DOMAIN=` empty in `deploy/production.env` to skip www entirely.

## Useful flags

| Flag | Meaning |
|------|---------|
| `-y` | Non-interactive |
| `--force-vhost` | Overwrite Nginx site |
| `--skip-ssl` | HTTP only |
| `--skip-docker-install` | Don’t auto-install Docker |

## Redeploy

```bash
cd /var/www/quranpilot
sudo bash scripts/run-production.sh -y --pull
```

First-time server bootstrap (nginx + SSL) is still:

```bash
sudo bash scripts/deploy-production.sh -y
```

# Production deploy — quranpilot.com

## One command (Ubuntu/Debian)

```bash
cd /var/www/al-tarteel-web   # repo root
sudo bash scripts/deploy-production.sh -y
```

The script will:

1. **Install** `nginx`, `certbot`, `curl`, and **Docker** if missing  
2. Create `deploy/production.env` (defaults: `quranpilot.com` + `www`) if missing  
3. Create Nginx vhost `/etc/nginx/sites-available/quranpilot` if missing  
4. Proxy `/` → web `:3010`, `/api/` → API `:4010`  
5. `docker compose -f docker-compose.prod.yml up -d --build`  
6. Issue **Let's Encrypt SSL** for `quranpilot.com` + `www.quranpilot.com`

## Before first SSL run

Edit `deploy/production.env`:

```bash
CERTBOT_EMAIL=you@yourmail.com
APP_DIR=/var/www/al-tarteel-web
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
cd /var/www/al-tarteel-web
sudo git pull
sudo bash scripts/deploy-production.sh -y
```

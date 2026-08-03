# Al-Tarteel — Deployment Guide

## Overview

- **Frontend (Next.js)**: Deploy to **Vercel** for SSR/SSG and edge.
- **Backend (NestJS)**: Deploy to **AWS** (EC2/ECS) or any Node host behind **Nginx** (reverse proxy, SSL).

## Frontend (Vercel)

### 1. Connect repository

- Push code to GitHub/GitLab and import the project in [Vercel](https://vercel.com).
- Set **Root Directory** to `frontend` (if using monorepo) or leave blank if the repo is frontend-only.

### 2. Environment variables

In Vercel project → Settings → Environment Variables:

| Variable | Value | Notes |
|----------|--------|--------|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/api/v1` | Your production API base URL |

### 3. Build

- **Build Command**: `pnpm build` or `npm run build`
- **Output**: Next.js default (no override)
- **Install Command**: `pnpm install` or `npm ci`

### 4. Optional: Preview and production

- Use the same `NEXT_PUBLIC_API_URL` for production; for previews you can point to a staging API.

---

## Backend (Node + Nginx)

### 1. Build

```bash
cd backend
pnpm install --frozen-lockfile
pnpm run build
```

### 2. Environment

Create `.env` (or use your secrets manager):

```env
NODE_ENV=production
PORT=4000
API_PREFIX=api/v1
DATABASE_URL="postgresql://user:pass@host:5432/quran_app?schema=public"
REDIS_URL=redis://your-redis-host:6379
JWT_SECRET=<strong-random-secret>
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### 3. Run

```bash
node dist/main.js
```

Or use **PM2**:

```bash
pm2 start dist/main.js --name al-tarteel-api
pm2 save
pm2 startup
```

### 4. Nginx reverse proxy

Example server block (HTTPS with Let’s Encrypt):

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

### 5. Database and Redis

- **PostgreSQL**: Use RDS, managed PostgreSQL, or a VPS. Run migrations:

  ```bash
  pnpm prisma migrate deploy
  pnpm run seed   # if needed
  ```

- **Redis**: Use ElastiCache, Redis Cloud, or a Redis instance on the same VPS. Optional; API works without Redis (no caching).

---

## Docker (optional)

Example backend Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json backend/
RUN npm ci
COPY backend/ .
RUN npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY backend/package*.json ./
COPY backend/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

Run with `docker build -t al-tarteel-api .` and pass `DATABASE_URL` and `REDIS_URL` at runtime.

---

## Checklist

- [ ] Frontend: `NEXT_PUBLIC_API_URL` points to production API.
- [ ] Backend: `CORS_ORIGINS` includes your frontend origin(s).
- [ ] Backend: `JWT_SECRET` is strong and unique.
- [ ] Database: migrations applied; seed run if required.
- [ ] Redis: optional; set `REDIS_URL` if you use it.
- [ ] SSL: Nginx (or load balancer) terminates HTTPS for the API.

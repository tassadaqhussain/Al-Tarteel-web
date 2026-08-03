# Al-Tarteel — Production Quran Web Application

A production-grade Quran web application with Quran.com-level functionality: full reader, verse-by-verse audio, translations, tafsir, search, and optional user features.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Zustand |
| Backend | NestJS 11, Node.js, Prisma ORM |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | JWT (optional) |
| Deployment | Vercel (frontend), AWS/Nginx (backend) |

## Repository Structure

```
├── backend/                 # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed/
│   ├── src/
│   │   ├── quran/
│   │   ├── audio/
│   │   ├── search/
│   │   ├── users/
│   │   └── ...
│   └── package.json
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── stores/
│   │   └── types/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Run with Docker

From the project root:

```bash
docker compose up -d
```

- **Web:** http://localhost:3000  
- **API:** http://localhost:4000/api/v1  
- **API docs:** http://localhost:4000/api/v1/docs  

The API runs migrations on startup (`prisma db push`). To seed the database (e.g. Al-Fatihah + sample data), use a one-off container (works even if the API service is not running):

```bash
docker compose run --rm api npx prisma db seed
```

Or, if the API is already running: `docker compose exec api npx prisma db seed`

---

## Quick Start (local)

### Prerequisites

- Node.js 22+ (20.9+ minimum for Next.js 16)
- pnpm 9+ (or npm/yarn)
- PostgreSQL 15+
- Redis 7+

### 1. Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit .env with your DATABASE_URL, REDIS_URL, JWT_SECRET
```

### 2. Database & seed

```bash
cd backend
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm run seed
```

### 3. Run backend

```bash
cd backend && pnpm run start:dev
```

### 4. Run frontend

```bash
cd frontend && pnpm install && pnpm dev
```

- Frontend: http://localhost:3000  
- API: http://localhost:4000 (or port in backend .env)

## API Base URL

- Development: `http://localhost:4000/api/v1`
- Set `NEXT_PUBLIC_API_URL` in frontend `.env.local` accordingly.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel (frontend) and AWS/Nginx (backend) instructions.

## Data Sources

- Quran text: Tanzil-compatible Uthmani script
- Translations: Verified public-domain or licensed sources
- Audio: Links to trusted CDN/reciter APIs (e.g. everyayah.com, Quran.com API)

## License

See LICENSE file. Quran text and translations follow their respective source licenses.

# QuranPilot — Current Architecture

> Repository: **Al-Tarteel web** · Product: **QuranPilot** · Domain: **quranpilot.com**  
> Last audited: August 2026

## Overview

QuranPilot is a full-stack Quran reading, listening, and learning application. The codebase is a monorepo with a **NestJS 11** API, **Next.js 16** frontend, **PostgreSQL 16** (Prisma ORM), **Redis 7** (optional cache), and **Docker Compose** deployment on AWS EC2 behind Nginx.

```
Browser (quranpilot.com)
        │
        ▼
   Nginx (TLS, /api → API, / → Web)
        │
   ┌────┴────┐
   ▼         ▼
 Next.js    NestJS API (/api/v1)
 (3010)      │
             ├── PostgreSQL (quran content, users, progress)
             ├── Redis (API response cache, optional)
             ├── Quran Foundation API (tafsir, hadith, lessons fallback)
             ├── Quran.com API v4 (initial seed)
             ├── QuranCDN / EveryAyah (audio CDN)
             ├── Google Gemini (Ask AI — direct LLM, no RAG yet)
             └── Stripe (donations)
```

---

## Frontend

| Item | Details |
|------|---------|
| **Path** | `frontend/` |
| **Package** | `quranpilot-web` v1.0.0 |
| **Framework** | Next.js **16.3** App Router, React **19.2**, TypeScript **5.9** |
| **Styling** | Tailwind CSS 3.4, shadcn/ui (Radix primitives), Lucide icons |
| **State** | Zustand stores (`settingsStore`, `authStore`, `bookmarksStore`, `audioStore`, `hifzStore`, etc.) |
| **API client** | `frontend/src/lib/api.ts` — cookie auth (`credentials: 'include'`) |
| **Build** | Next.js `standalone` output via Docker |

### Key routes

| Route | Purpose |
|-------|---------|
| `/`, `/[slug]` | Home + surah reader (114 clean slug URLs) |
| `/search` | Keyword search (Arabic + translations) |
| `/bookmarks`, `/my-quran`, `/profile` | Personal hub |
| `/hifz`, `/hifz/[number]` | Memorization practice |
| `/tajweed`, `/learning-plans` | Tajweed journey + curated plans |
| `/quran-in-year` | 46-week reading calendar |
| `/admin` | Admin dashboard (signup + traffic stats) |
| `(auth)/*` | Login, register, password reset |

### Global UI features

- **Reader**: ayah feed, word-by-word, tajweed, tafsir/hadith/lessons modals, audio sync
- **Ask AI**: `AskAiFab` + `AskAiSheet` — Gemini chat (no retrieval yet)
- **Voice search**: Web Speech API → intent parser → navigation or Ask AI fallback
- **Visit tracking**: `VisitTracker` → `POST /analytics/visit`

### Feature flags

- `DONATE_ENABLED = false` in `frontend/src/lib/features.ts`

---

## Backend

| Item | Details |
|------|---------|
| **Path** | `backend/` |
| **Package** | `al-tarteel-api` v1.0.0 |
| **Framework** | NestJS **11.1**, TypeScript **5.9** |
| **ORM** | Prisma **6.19** |
| **Entry** | `src/main.ts` — prefix `api/v1`, Swagger at `/api/v1/docs` |
| **Schema sync** | `prisma db push` on Docker boot (no migration history yet) |

### Modules

| Module | Path | Purpose |
|--------|------|---------|
| Quran | `src/quran/` | Surahs, ayahs, pages, juz, translations, tafsir, study panels |
| Audio | `src/audio/` | Reciters, ayah audio, word timings, Piper TTS |
| Search | `src/search/` | Keyword search (Prisma `contains`) |
| Auth | `src/auth/` | Register, login, refresh, password reset |
| Users | `src/users/` | Bookmarks, reading history, daily goals/progress |
| Hifz | `src/hifz/` | Recitation check (Levenshtein word alignment) |
| AI | `src/ai/` | Gemini Ask AI (direct generation) |
| Donations | `src/donations/` | Stripe checkout |
| Feedback | `src/feedback/` | Site feedback |
| Analytics | `src/analytics/` | Hashed visitor tracking |
| Admin | `src/admin/` | Overview + user list |
| Cache | `src/cache/` | Redis via `ioredis` (graceful no-op) |

### Authentication

- **JWT** in HttpOnly cookies: `qp_access` (15m), `qp_refresh` (7d)
- Passport JWT strategy: cookie first, then `Authorization: Bearer`
- Admin: `User.isAdmin` OR email in `ADMIN_EMAILS`
- Throttling on auth + AI routes

---

## Database (PostgreSQL)

**Schema file:** `backend/prisma/schema.prisma`

### Core Quran content

| Model | Records | Notes |
|-------|---------|-------|
| Surah | 114 | Metadata, revelation info |
| Ayah | 6,236 | Uthmani + tajweed text, page/juz/hizb |
| Word | ~77k+ | WBW with transliteration, roots, audio |
| Translator | ~10+ | en, ur, bn, id, tr, fa, hi |
| AyahTranslation | per ayah × translator | Approved translation text |
| WordTranslation | per word × language | WBW meanings |
| TafsirSource | multiple | Ibn Kathir, Jalalayn, etc. |
| Tafsir | per ayah × source | Local tafsir text |
| AyahStudySnapshot | per ayah × kind | Hadith, lessons, Q&A JSON |
| Reciter / AudioFile | reciters × ayahs | Local mirror + CDN URLs |

### User & engagement

| Model | Purpose |
|-------|---------|
| User | Account, theme, last-read position, `isAdmin` |
| Bookmark | Saved ayahs with optional note |
| ReadingHistory | Read events |
| UserDailyGoal / DailyProgress | Daily learning goals |
| HifzAttempt / HifzDailyStat | Memorization tracking |
| RefreshToken / PasswordResetToken | Auth sessions |
| SiteVisitor | Daily hashed analytics |
| Feedback | Public feedback submissions |

**No tables yet for:** AI conversations, vector embeddings, learning plans (server-side), spaced repetition schedules.

---

## Quran Data Pipeline

Content is imported into PostgreSQL, then served from the local DB at runtime (QF API as fallback for study panels).

| Script | Source | Target |
|--------|--------|--------|
| `prisma/download-quran.ts` | Quran.com API v4 | Surahs, ayahs, Sahih International |
| `prisma/import-words.ts` | Quran Foundation | Words + WBW translations |
| `prisma/import-reader-translations.ts` | QF | Ayah translations |
| `prisma/import-tafsirs.ts` | QF / Quran.com | Tafsir |
| `prisma/import-verse-study.ts` | QF | Hadith, lessons, Q&A snapshots |
| `prisma/import-reciters.ts` | Config/CDN | Reciter catalog |
| `scripts/download-all-audio.mjs` | CDN | Local MP3 mirror |

---

## Search (Current)

**Location:** `backend/src/search/search.service.ts`

- `GET /search/ayahs?q=` — Prisma `contains` on `Ayah.textUthmani`
- `GET /search/translations?q=` — Prisma `contains` on `AyahTranslation.text`
- No full-text index, no Arabic normalization, **no semantic/vector search**
- Frontend: `/search` page with tabs, autosuggest, voice, spelling correction (`search-intelligence.ts`)

---

## AI (Current)

**Location:** `backend/src/ai/`

- **Provider:** Google Gemini (`GEMINI_API_KEY`, `GEMINI_MODEL`)
- **Endpoint:** `POST /ai/ask` — direct LLM generation with system prompt
- **Limits:** `AI_PROMPT_LIMIT` per IP (in-memory Map, not Redis)
- **No RAG**, no citation validation, no vector retrieval
- **Frontend:** global Ask AI sheet with suggested prompts

---

## Learning & Progress (Current)

| Feature | Storage | Server sync |
|---------|---------|-------------|
| Reading goals | Zustand + `UserDailyGoal` | Yes (authenticated) |
| Quran in a year | Zustand (`quranYearCompletedWeeks`) | Local only |
| Learning plans | Static JSON (`lib/learning-plans.ts`) | None |
| Hifz practice | `HifzAttempt` + local `hifzStore` | Partial |
| Tajweed journey | `tajweedProgressStore` | Local only |
| Bookmarks | `bookmarksStore` + `Bookmark` table | Yes |

**No personalized AI learning coach, no spaced repetition engine, no server-side learning plans.**

---

## Redis

- **Client:** `ioredis` in `CacheService`
- **Optional:** API works without Redis (cache misses go to DB/API)
- **TTL:** `CACHE_TTL_SECONDS=3600`
- **Used for:** Quran surah lists, tafsir/hadith/lessons API cache, reciter list, word timings
- **Not used for:** AI responses, rate limits, semantic search cache (yet)

---

## Docker & Deployment

### Development (`docker-compose.yml`)

| Service | Host port | Image |
|---------|-----------|-------|
| postgres | 5435 | postgres:16-alpine |
| redis | 6381 | redis:7-alpine |
| api | 4010 | `./backend` |
| web | 3010 | `./frontend` |
| tts | internal 5062 | Piper TTS (dev only) |

### Production (`docker-compose.prod.yml`)

- Same stack minus TTS; postgres/redis not exposed
- API/web bound to `127.0.0.1:4010` / `127.0.0.1:3010`
- Nginx terminates TLS, proxies to localhost
- Deploy path: `/var/www/quranpilot` on AWS EC2
- CI: `.github/workflows/deploy-aws.yml` on push to `main`

---

## Environment Variables (Summary)

See `backend/.env.example`, `deploy/production.env.example`, `frontend/.env.example`.

| Category | Key vars |
|----------|----------|
| Server | `PORT`, `API_PREFIX`, `NODE_ENV` |
| Database | `DATABASE_URL` |
| Auth | `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |
| Quran API | `QF_CLIENT_ID`, `QF_CLIENT_SECRET` |
| Cache | `REDIS_URL`, `CACHE_TTL_SECONDS` |
| AI (current) | `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_PROMPT_LIMIT` |
| Admin | `ADMIN_EMAILS`, `ANALYTICS_SALT` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |

---

## Testing

- Jest configured in `package.json` but **no test files exist** in backend or frontend
- Frontend has custom scripts for tajweed/ayah-preview smoke tests

---

## Gaps Relevant to AI Roadmap

1. Ask AI is **not source-grounded** — can hallucinate verses
2. Search is **keyword-only** — no concept/conceptual queries
3. No **vector database** or embedding pipeline
4. No **knowledge source governance** model
5. Learning plans are **static**, not personalized
6. Hifz has basic word matching but **no spaced repetition**
7. No AI conversation history persistence
8. Rate limits and usage tracking are **minimal** (in-memory IP counter)
9. Admin panel lacks **AI analytics**

These gaps are addressed in `AI_ARCHITECTURE.md` and `AI_IMPLEMENTATION_PLAN.md`.

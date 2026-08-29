# Semantic Quran Search (Sprint 1)

QuranPilot semantic search finds relevant ayahs by **meaning**, not just exact keywords. It uses pgvector + approved translation embeddings and runs **alongside** existing keyword search.

## Prerequisites

1. **PostgreSQL with pgvector** — Docker Compose uses `pgvector/pgvector:pg16`
2. **Translations imported** — `npm run translations:import:all`
3. **Gemini API key** — same `GEMINI_API_KEY` used for Ask AI

## Setup

```bash
cd backend

# 1. Apply Prisma schema + pgvector extension
npm run prisma:generate
npx prisma db push
npm run ai:setup

# 2. Index documents + embeddings (~10–15 min for one translator)
npm run ai:index

# Optional: index specific translators only
npm run ai:index -- --slugs=en-sahih-international

# Documents only (skip embedding API calls)
npm run ai:index -- --no-embed
npm run ai:setup   # then embed later via ai:index
```

## API

### Semantic search

```
GET /api/v1/search/semantic?q=patience&language=en&limit=10
```

Query params:

| Param | Default | Description |
|-------|---------|-------------|
| `q` | required | Natural language query |
| `language` | `en` | Document language filter |
| `documentType` | `translation` | `translation`, `tafsir`, `topic` |
| `limit` | 20 | Max 50 |
| `surah` | — | Optional surah number filter |

Response:

```json
{
  "enabled": true,
  "results": [
    {
      "surahNumber": 2,
      "ayahNumber": 153,
      "text": "O you who have believed, seek help through patience and prayer...",
      "arabicText": "يَا أَيُّهَا الَّذِينَ آمَنُوا...",
      "sourceReference": "Al-Baqarah 2:153 (en-sahih-international)",
      "score": 0.82,
      "surah": { "number": 2, "nameSimple": "Al-Baqarah", "nameArabic": "..." }
    }
  ],
  "cached": false
}
```

### Index status

```
GET /api/v1/ai/knowledge/status
GET /api/v1/ai/knowledge/config
```

## Environment variables

See `backend/.env.example`:

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Embedding generation |
| `AI_EMBEDDING_MODEL` | Default `text-embedding-004` |
| `AI_EMBEDDING_DIMENSIONS` | Default `768` |
| `AI_SEMANTIC_SEARCH_ENABLED` | Set `false` to disable |
| `AI_SEMANTIC_MIN_SCORE` | Minimum cosine similarity (0–1) |
| `AI_SEMANTIC_CACHE_TTL` | Redis cache TTL seconds |
| `AI_INDEX_TRANSLATORS` | Comma-separated translator slugs |
| `AI_INDEX_BATCH_SIZE` | Embedding batch size (max 100) |

## Re-indexing

After importing new translations or changing source approval:

```bash
cd backend
npm run ai:index -- --slugs=your-translator-slug
```

Documents are upserted by `content_hash` (SHA-256). Existing rows with unchanged text keep their embeddings.

To force re-embed all documents:

```sql
UPDATE quran_documents SET embedding = NULL, indexed_at = NULL;
```

Then run `npm run ai:index`.

## Knowledge sources

Only documents linked to `knowledge_sources` with `status = 'approved'` are searchable.

Default seeded sources:

- `quran-ar` — canonical Arabic (metadata reference)
- `sahih-international` — English Sahih International

Additional translators are auto-registered during indexing.

## Architecture notes

- Keyword search (`GET /search/ayahs`, `/search/translations`) is unchanged
- Embeddings are stored in `quran_documents.embedding vector(768)`
- Semantic results are cached in Redis when `REDIS_URL` is set
- API starts without Gemini key; semantic endpoint returns 503 until configured

## Local test queries

```bash
curl "http://localhost:4010/api/v1/search/semantic?q=patience&language=en&limit=5"
curl "http://localhost:4010/api/v1/search/semantic?q=parents&language=en&limit=5"
curl "http://localhost:4010/api/v1/search/semantic?q=debt&language=en&limit=5"
```

Compare with keyword search:

```bash
curl "http://localhost:4010/api/v1/search/translations?q=patience&limit=5"
```

## Production

1. Ensure prod Postgres uses `pgvector/pgvector:pg16` (see `docker-compose.prod.yml`)
2. Run `npm run ai:setup` after schema push
3. Run `npm run ai:index` as a one-off job (not at API boot — avoids OOM on small VPS)
4. IVFFlat index is created at setup; rebuild after large re-index for best performance

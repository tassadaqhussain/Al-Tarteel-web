# QuranPilot — AI Database Plan

> PostgreSQL + pgvector · Prisma ORM · August 2026

## Principles

1. **Extend, don't duplicate** — link to existing `Ayah`, `Translator`, `TafsirSource` via foreign keys
2. **Canonical Quran stays in `ayahs`** — `quran_documents` holds searchable copies + embeddings, not replacements
3. **Migrations for all AI tables** — proper `prisma migrate` history starting Sprint 1
4. **pgvector for semantic search** — cosine similarity on 768-dim embeddings
5. **Governance first** — only `approved` sources enter production retrieval

---

## Existing Tables (Reuse)

| Table | AI usage |
|-------|----------|
| `ayahs` | Canonical Arabic; FK from `quran_documents.ayah_id` |
| `ayah_translations` | Source for translation documents |
| `translators` | Linked via `knowledge_sources.external_ref` (slug) |
| `tafsirs` / `tafsir_sources` | Source for tafsir documents |
| `words` / `word_translations` | Vocabulary documents (Sprint 3+) |
| `users` | FK for conversations, usage, learning profiles |
| `hifz_attempts` | Extend for recitation coach (Sprint 5) |
| `bookmarks` | "Save" action from AI responses |

---

## New Tables — Sprint 1

### `knowledge_sources`

Governance registry for all retrievable content.

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PK | |
| `name` | VARCHAR(255) | Display name |
| `slug` | VARCHAR(100) UNIQUE | e.g. `sahih-international`, `ibn-kathir-en` |
| `source_type` | VARCHAR(30) | `quran`, `translation`, `tafsir`, `hadith`, `vocabulary`, `learning_content`, `topic` |
| `language_code` | VARCHAR(10) | `en`, `ur`, `ps`, `ar` |
| `scholar_or_publisher` | VARCHAR(255)? | |
| `reliability_tier` | VARCHAR(30) | `canonical`, `approved`, `reference` |
| `status` | VARCHAR(20) | `draft`, `approved`, `disabled` |
| `external_ref` | VARCHAR(100)? | Links to `translators.slug` or `tafsir_sources.slug` |
| `metadata` | JSONB? | Extra config |
| `document_count` | INT DEFAULT 0 | Updated after indexing |
| `last_indexed_at` | TIMESTAMPTZ? | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes:** `(status, source_type)`, `(language_code)`, `(slug)`

**Seed data (Sprint 1):**
- `quran-ar` — canonical Arabic (reference, not embedded for semantic — used for metadata)
- `sahih-international` — English translation
- Additional translators as imported

---

### `quran_documents`

Searchable chunks with vector embeddings.

| Column | Type | Notes |
|--------|------|-------|
| `id` | SERIAL PK | |
| `surah_number` | INT? | 1–114 |
| `ayah_number` | INT? | 1-based in surah |
| `ayah_id` | INT? FK → `ayahs.id` | |
| `document_type` | VARCHAR(20) | `quran`, `translation`, `tafsir`, `topic` |
| `language` | VARCHAR(10) | |
| `text` | TEXT | Searchable content (never LLM-generated for quran type) |
| `source_id` | INT? FK → `knowledge_sources.id` | |
| `source_reference` | VARCHAR(120) | e.g. `Quran 2:255`, `Sahih International 2:255` |
| `content_hash` | VARCHAR(64) UNIQUE | SHA-256 for idempotent re-index |
| `metadata` | JSONB? | `{ translatorSlug, tafsirSlug, topicTags[] }` |
| `embedding` | vector(768) | pgvector; NULL until indexed |
| `indexed_at` | TIMESTAMPTZ? | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes:**
- `(document_type, language)`
- `(surah_number, ayah_number)`
- `(source_id)`
- `(ayah_id)`
- `IVFFlat (embedding vector_cosine_ops)` — created after bulk index (lists = 100)

---

## New Tables — Sprint 2+

### `ai_conversations`

| Column | Type |
|--------|------|
| `id` | UUID PK |
| `user_id` | INT? FK → users |
| `client_key` | VARCHAR(64)? | hashed IP for anonymous |
| `feature` | VARCHAR(30) | `ask`, `explain`, `search` |
| `locale` | VARCHAR(10) |
| `created_at` | TIMESTAMPTZ |
| `updated_at` | TIMESTAMPTZ |

### `ai_messages`

| Column | Type |
|--------|------|
| `id` | SERIAL PK |
| `conversation_id` | UUID FK |
| `role` | VARCHAR(10) | `user`, `assistant`, `system` |
| `content` | TEXT |
| `retrieved_document_ids` | INT[] |
| `citations` | JSONB |
| `tokens_used` | INT? |
| `latency_ms` | INT? |
| `created_at` | TIMESTAMPTZ |

### `ai_usage`

| Column | Type |
|--------|------|
| `id` | SERIAL PK |
| `user_id` | INT? |
| `client_key` | VARCHAR(64) |
| `feature` | VARCHAR(30) |
| `model` | VARCHAR(80) |
| `input_tokens` | INT |
| `output_tokens` | INT |
| `estimated_cost_usd` | DECIMAL(10,6) |
| `day` | VARCHAR(10) | YYYY-MM-DD |
| `created_at` | TIMESTAMPTZ |

**Index:** `(user_id, day)`, `(client_key, day)`

### `ai_feedback`

| Column | Type |
|--------|------|
| `id` | SERIAL PK |
| `message_id` | INT FK → ai_messages |
| `user_id` | INT? |
| `rating` | SMALLINT | 1 or -1 |
| `comment` | TEXT? |
| `created_at` | TIMESTAMPTZ |

---

## New Tables — Sprint 3 (Learning)

### `learning_profiles`

| Column | Type |
|--------|------|
| `id` | SERIAL PK |
| `user_id` | INT UNIQUE FK |
| `goal` | VARCHAR(40) | read, understand, recite, memorize, arabic, complete |
| `level` | VARCHAR(20) | beginner, intermediate, advanced |
| `daily_minutes` | INT | 5–30 |
| `preferred_language` | VARCHAR(10) |
| `preferred_reciter_slug` | VARCHAR(100)? |
| `learning_days` | JSONB | `[0,1,2,3,4,5,6]` |
| `onboarding_completed` | BOOLEAN |
| `created_at` | TIMESTAMPTZ |
| `updated_at` | TIMESTAMPTZ |

### `learning_plans` / `learning_plan_items` / `learning_progress`

Server-side personalized journeys with deterministic ayah assignments.

---

## New Tables — Sprint 4 (Hifz)

### `memorization_progress`

| Column | Type |
|--------|------|
| `id` | SERIAL PK |
| `user_id` | INT FK |
| `surah_number` | INT |
| `ayah_number` | INT |
| `state` | VARCHAR(20) | NEW, LEARNING, WEAK, GOOD, STRONG, MASTERED |
| `ease_factor` | FLOAT | SM-2 style |
| `interval_days` | INT |
| `next_review_at` | DATE |
| `last_reviewed_at` | TIMESTAMPTZ |
| `repetitions` | INT |

**Unique:** `(user_id, surah_number, ayah_number)`

### `revision_schedule`

Daily queue materialized or computed from `memorization_progress`.

---

## New Tables — Sprint 5 (Recitation)

### `recitation_attempts`

Extends hifz with word-level detail JSON.

| Column | Type |
|--------|------|
| `id` | SERIAL PK |
| `user_id` | INT FK |
| `ayah_id` | INT FK |
| `audio_url` | VARCHAR(500)? | stored recording |
| `transcript` | TEXT |
| `expected_text` | TEXT |
| `accuracy` | FLOAT |
| `word_results` | JSONB | `{ correct[], missing[], extra[], practice[] }` |
| `feedback_tier` | VARCHAR(20) | `word_accuracy` only initially |
| `created_at` | TIMESTAMPTZ |

---

## pgvector Setup

### Docker

Switch Postgres image to `pgvector/pgvector:pg16` in `docker-compose.yml` and `docker-compose.prod.yml`.

### Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Vector column (post Prisma push)

```sql
ALTER TABLE quran_documents
  ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX IF NOT EXISTS quran_documents_embedding_idx
  ON quran_documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Note:** IVFFlat index requires sufficient rows (~1000+) for efficiency. Create index after initial bulk embedding.

---

## Prisma Considerations

Prisma 6 does not natively model `vector` type. Strategy:

1. Define `QuranDocument` without embedding in Prisma schema
2. Manage `embedding` column via raw SQL migration
3. Semantic search uses `$queryRaw` with pgvector operators:

```sql
SELECT id, surah_number, ayah_number, document_type, text, source_reference,
       1 - (embedding <=> $1::vector) AS score
FROM quran_documents
WHERE embedding IS NOT NULL
  AND document_type = ANY($2)
  AND language = $3
ORDER BY embedding <=> $1::vector
LIMIT $4;
```

---

## Data Flow: Indexing

```
npm run ai:index
  │
  ├─ Seed knowledge_sources (idempotent)
  ├─ For each approved translation source:
  │    SELECT ayah_translations JOIN ayahs JOIN surahs
  │    → upsert quran_documents (content_hash)
  ├─ For each approved tafsir source (optional Sprint 1):
  │    SELECT tafsirs → upsert quran_documents
  ├─ Batch embed unindexed documents (EmbeddingProvider)
  └─ UPDATE quran_documents SET embedding = $vector
```

**Re-index:** Admin triggers or `npm run ai:reindex -- --source=sahih-international`

---

## Migration Strategy

| Environment | Approach |
|-------------|----------|
| Local dev | `prisma migrate dev` + `npm run ai:setup` |
| Docker dev | `db push` + entrypoint runs `ai:setup` SQL |
| Production | `prisma migrate deploy` + manual `ai:index` after content import |

Existing production uses `db push`. Sprint 1 adds:
- `backend/prisma/migrations/` with initial AI migration
- `backend/prisma/sql/setup-pgvector.sql` idempotent script
- `npm run ai:setup` to enable extension + vector column

---

## Retention & Privacy

- `ai_messages`: retain 90 days default (configurable)
- `ai_usage`: aggregate monthly; no query text stored at INFO log level
- Anonymous `client_key`: salted hash of IP (same pattern as analytics)

---

## Estimated Row Counts (Full Index)

| Document type | Rows |
|---------------|------|
| translation (1 translator) | ~6,236 |
| translation (5 translators) | ~31,180 |
| tafsir (1 source) | ~6,236 |
| topic (curated, future) | ~500 |
| **Total Sprint 1** | ~12,000–40,000 |

Embedding storage: ~768 × 4 bytes × 40k ≈ 120 MB + index overhead.

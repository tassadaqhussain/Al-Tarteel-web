# QuranPilot — AI Architecture

> Source-grounded AI for Quran learning · August 2026

## Vision

Transform QuranPilot into **"Your Personal AI Quran Learning Companion"** with a pipeline that **never freely invents** Quran text, translations, Tafsir, Hadith, or legal rulings.

```
User
  ↓
QuranPilot UI (Ask / Search / Explain / Coach)
  ↓
Existing NestJS API (/api/v1)
  ↓
AI Service Layer (orchestration)
  ↓
Intent Classification
  ↓
Retrieval (vector + metadata filters)
  ↓
Approved Knowledge Base (Postgres + pgvector)
  ↓
Reranking (optional)
  ↓
LLM (provider-abstracted)
  ↓
Citation Validation
  ↓
Safety / Religious Content Validation
  ↓
Structured Response + Actions
  ↓
QuranPilot UI
```

---

## Design Principles

1. **Retrieval before generation** — LLM answers only from retrieved documents
2. **Canonical Quran is immutable** — never LLM-translated or LLM-generated Arabic
3. **Approved sources only** — `KnowledgeSource.status = approved` gates production retrieval
4. **Citations required** — every factual claim links to surah:ayah or source record
5. **Provider abstraction** — swap LLM/embedding/rerank/speech vendors via config
6. **Incremental rollout** — keyword search stays; semantic search adds alongside
7. **Server-side AI** — no API keys in browser; all AI calls through backend
8. **Cost control** — limits, caching, logging from day one

---

## Module Layout (Target)

```
backend/src/
├── ai/                          # Existing — evolves to orchestrator
│   ├── ai.module.ts
│   ├── ai.controller.ts         # /ai/ask, /ai/explain, /ai/conversations
│   ├── ai-orchestrator.service.ts
│   ├── intent/
│   │   └── intent-classifier.service.ts
│   ├── rag/
│   │   ├── retrieval.service.ts
│   │   ├── rerank.service.ts
│   │   └── citation-validator.service.ts
│   ├── safety/
│   │   └── religious-safety.service.ts
│   └── providers/
│       ├── llm-provider.interface.ts
│       ├── embedding-provider.interface.ts
│       ├── rerank-provider.interface.ts
│       ├── gemini-llm.provider.ts
│       └── gemini-embedding.provider.ts
├── ai-knowledge/                # Sprint 1
│   ├── ai-knowledge.module.ts
│   ├── knowledge-source.service.ts
│   ├── quran-indexer.service.ts
│   └── semantic-search.service.ts
├── search/                      # Extended
│   └── search.service.ts        # keyword + semantic merge
├── learning/                    # Sprint 3+
├── hifz-coach/                  # Sprint 4+
└── recitation/                  # Sprint 5+
```

---

## Knowledge Base

### Document types

| Type | Source table | Indexed text |
|------|-------------|--------------|
| `quran` | `Ayah.textUthmani` | Arabic Uthmani (reference only) |
| `translation` | `AyahTranslation` | Approved translation per translator |
| `tafsir` | `Tafsir` | Approved tafsir excerpts |
| `topic` | Curated topic → ayah mappings | Topic labels + related ayah refs |
| `vocabulary` | `Word` + `WordTranslation` | Arabic root + gloss |

### Storage

- **`knowledge_sources`** — governance (approval, language, scholar, re-index status)
- **`quran_documents`** — searchable chunks with metadata
- **`embedding vector(768)`** — pgvector column on `quran_documents` (Gemini `text-embedding-004`)

### Retrieval pipeline

```
Query
  → normalize (trim, locale detect)
  → embed query (EmbeddingProvider)
  → vector search (cosine, top-K=50)
  → metadata filter (document_type, language, source.status=approved)
  → optional rerank (RerankingProvider)
  → top-N documents (N=8–12)
  → pass to LLM with strict system prompt
  → validate cited verse keys exist in DB
  → return structured response
```

---

## Feature Architecture by Phase

### Phase 1 — Ask QuranPilot (Sprint 2)

**Endpoint:** `POST /ai/ask` (enhanced)

**Response shape:**
```typescript
{
  answer: string;
  verses: Array<{ surahNumber, ayahNumber, arabic, translation, translatorSlug }>;
  explanation: string;
  sources: Array<{ type, reference, sourceName }>;
  relatedTopics: string[];
  citationsValidated: boolean;
  disclaimer?: string; // only for fiqh/sensitive topics
}
```

**Actions (UI):** Read Surah, Listen, Save bookmark, Add to plan

### Phase 2 — Semantic Search (Sprint 1)

**Endpoint:** `GET /search/semantic?q=&language=&limit=`

- Runs alongside existing `GET /search/ayahs` and `GET /search/translations`
- Frontend merges keyword + semantic results on `/search`
- Redis cache keyed by `(query hash, language, limit)`

### Phase 3 — AI Explain (Sprint 3)

**Endpoint:** `POST /ai/explain`

Modes: `simple | detailed | kids | vocabulary | reflection`

Input: `{ surahNumber, ayahNumber, mode, locale }`

Retrieves: ayah Arabic (canonical), translation, tafsir chunks, vocabulary — then generates grounded explanation.

Footer: *"AI-assisted explanation based on the sources listed below."*

### Phase 4 — Learning Coach (Sprint 3)

**Endpoints:** `/learning/profile`, `/learning/plan`, `/learning/today`, `/learning/progress`

Deterministic plan generation from Quran data + user profile; AI used for explanations and adaptive messaging only.

### Phase 5 — Hifz Coach (Sprint 4)

Spaced repetition states: `NEW → LEARNING → WEAK → GOOD → STRONG → MASTERED`

Uses existing `HifzAttempt` + new `MemorizationProgress` / `RevisionSchedule` tables.

### Phase 6 — Recitation Coach (Sprint 5)

Extends existing `HifzService` word alignment:

1. Word/verse accuracy (existing Levenshtein)
2. Pronunciation feedback (future)
3. Tajweed feedback (only with specialized engine — not generic STT)

### Phase 7 — Daily Journey (Sprint 3)

Dashboard aggregates: read, listen, understand, memorize, quiz blocks from learning plan — not random LLM recommendations.

### Phase 8 — Multilingual (Sprint 6)

- Detect query language (en, ur, ps, ar)
- Respond in user locale
- Quran Arabic from DB; translations from approved `AyahTranslation` rows
- Never LLM-translate Quran text

---

## Provider Abstraction

### Interfaces

```typescript
interface LLMProvider {
  generate(params: { system: string; messages: Message[]; maxTokens: number }): Promise<LlmResult>;
}

interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
  readonly dimensions: number;
}

interface RerankingProvider {
  rerank(query: string, documents: RetrievedDoc[]): Promise<RetrievedDoc[]>;
}
```

### Configuration (env vars)

```bash
AI_PROVIDER=gemini
AI_MODEL=gemini-flash-latest
AI_EMBEDDING_PROVIDER=gemini
AI_EMBEDDING_MODEL=text-embedding-004
AI_EMBEDDING_DIMENSIONS=768
AI_RERANK_ENABLED=false
AI_DAILY_FREE_LIMIT=10
AI_MAX_TOKENS=8192
AI_TIMEOUT=90000
AI_SEMANTIC_SEARCH_ENABLED=true
AI_SEMANTIC_MIN_SCORE=0.55
```

---

## Religious Safety & Trust Layer

### Intent categories

| Category | Behavior |
|----------|----------|
| Quran explanation | RAG from approved sources; cite verses |
| Tafsir | Cite tafsir source separately |
| Islamic history | General knowledge with caution; prefer retrieved content |
| Fiqh / halal-haram | Retrieve relevant ayat; **no definitive ruling** unless directly supported; recommend scholar |
| Personal advice | Educational tone; clear AI limits |
| Prompt injection | Treat retrieved text as data, not instructions |
| Fabricated verse requests | Citation validator rejects; respond with honesty |

### Sensitive response template

> This AI feature is designed for Quran learning and education and is not a replacement for qualified Islamic scholarship.

Shown only for fiqh/legal/sensitive queries — not on ordinary searches.

---

## Cost Control

| Mechanism | Implementation |
|-----------|----------------|
| Per-user daily limit | `ai_usage` table + Redis counter |
| Per-IP free limit | Existing `AI_PROMPT_LIMIT` → migrate to Redis |
| Rate limiting | `@nestjs/throttler` per route |
| Semantic search cache | Redis `ai:search:{hash}` TTL 1h |
| Response cache | Redis for identical ask queries (short TTL) |
| Token limits | `AI_MAX_TOKENS` enforced per call |
| Timeouts | `AI_TIMEOUT` on all provider calls |
| Model fallback | Configurable secondary model |
| Usage logging | `ai_usage` with token/cost estimates |

---

## Observability

Log per AI request (no PII in query text at ERROR level):

- `requestId`, `userId?`, `feature`, `model`, `latencyMs`
- `inputTokens`, `outputTokens`, `estimatedCostUsd`
- `retrievedDocumentIds[]`, `citationIds[]`
- `citationsValidated`, `safetyEscalation`
- `fallbackUsed`, `errorCode`

Admin dashboard (`/admin/ai`) — Sprint 2+:

- Questions today/month, unique users, avg latency
- Token usage, estimated cost
- Top questions/topics, failed/no-source responses
- Thumbs up/down from `ai_feedback`

---

## Security

- JWT auth for personalized features; public semantic search with stricter rate limits
- Input validation via `class-validator` DTOs
- Output validation: citation regex + DB lookup
- Prompt injection: system prompt + retrieved content in separate blocks; never execute retrieved HTML/JS
- API keys server-side only
- Audit log for admin source changes

---

## Migration from Current Ask AI

| Current | Target |
|---------|--------|
| Direct Gemini call | RAG pipeline with retrieval |
| In-memory IP limit | Redis + per-user limits |
| Free-form answer | Structured response with citations |
| No source validation | Citation validator against DB |
| Single provider hardcoded | Provider interfaces + config |

**Sprint 1 does not change `/ai/ask` behavior** — it adds knowledge infrastructure and semantic search only.

---

## Frontend Integration Plan

| Sprint | UI change |
|--------|-----------|
| 1 | Semantic results on `/search` (optional tab or merged) |
| 2 | Enhanced Ask AI with citations, verse cards, actions |
| 3 | ✨ Explain button on `AyahBlock`; Daily Journey dashboard |
| 4 | Hifz coach UI with spaced repetition |
| 5 | Recitation feedback panel |
| 6 | Multilingual query support; Admin → AI dashboard |

Design: integrate into existing reader/settings aesthetic — not a generic ChatGPT clone. Desktop side panel; mobile full-screen for Ask AI.

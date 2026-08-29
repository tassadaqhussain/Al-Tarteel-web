-- Idempotent pgvector setup for environments using `prisma db push`
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE quran_documents
  ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX IF NOT EXISTS quran_documents_embedding_idx
  ON quran_documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

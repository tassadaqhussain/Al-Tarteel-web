-- Enable pgvector for semantic Quran search
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "source_type" VARCHAR(30) NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "scholar_or_publisher" VARCHAR(255),
    "reliability_tier" VARCHAR(30) NOT NULL DEFAULT 'approved',
    "status" VARCHAR(20) NOT NULL DEFAULT 'approved',
    "external_ref" VARCHAR(100),
    "metadata" JSONB,
    "document_count" INTEGER NOT NULL DEFAULT 0,
    "last_indexed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quran_documents" (
    "id" SERIAL NOT NULL,
    "surah_number" INTEGER,
    "ayah_number" INTEGER,
    "ayah_id" INTEGER,
    "document_type" VARCHAR(20) NOT NULL,
    "language" VARCHAR(10) NOT NULL,
    "text" TEXT NOT NULL,
    "source_id" INTEGER,
    "source_reference" VARCHAR(120) NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "metadata" JSONB,
    "indexed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quran_documents_pkey" PRIMARY KEY ("id")
);

-- pgvector embedding column (768 dims for Gemini text-embedding-004)
ALTER TABLE "quran_documents" ADD COLUMN IF NOT EXISTS "embedding" vector(768);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_sources_slug_key" ON "knowledge_sources"("slug");

-- CreateIndex
CREATE INDEX "knowledge_sources_status_source_type_idx" ON "knowledge_sources"("status", "source_type");

-- CreateIndex
CREATE INDEX "knowledge_sources_language_code_idx" ON "knowledge_sources"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "quran_documents_content_hash_key" ON "quran_documents"("content_hash");

-- CreateIndex
CREATE INDEX "quran_documents_document_type_language_idx" ON "quran_documents"("document_type", "language");

-- CreateIndex
CREATE INDEX "quran_documents_surah_number_ayah_number_idx" ON "quran_documents"("surah_number", "ayah_number");

-- CreateIndex
CREATE INDEX "quran_documents_source_id_idx" ON "quran_documents"("source_id");

-- CreateIndex
CREATE INDEX "quran_documents_ayah_id_idx" ON "quran_documents"("ayah_id");

-- AddForeignKey
ALTER TABLE "quran_documents" ADD CONSTRAINT "quran_documents_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quran_documents" ADD CONSTRAINT "quran_documents_ayah_id_fkey" FOREIGN KEY ("ayah_id") REFERENCES "ayahs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- IVFFlat index for cosine similarity (run after bulk indexing; safe to create empty)
CREATE INDEX IF NOT EXISTS "quran_documents_embedding_idx"
  ON "quran_documents"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);

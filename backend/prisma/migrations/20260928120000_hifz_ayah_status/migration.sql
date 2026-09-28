-- Per-ayah memorisation status.
-- Purely additive: creates one new table, touches no existing data.

CREATE TABLE "hifz_ayah_status" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "surah_number" INTEGER NOT NULL,
    "ayah_number" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hifz_ayah_status_pkey" PRIMARY KEY ("id")
);

-- One row per user+ayah; marking again overwrites rather than accumulating.
CREATE UNIQUE INDEX "hifz_ayah_status_user_id_surah_number_ayah_number_key"
    ON "hifz_ayah_status"("user_id", "surah_number", "ayah_number");

CREATE INDEX "hifz_ayah_status_user_id_surah_number_idx"
    ON "hifz_ayah_status"("user_id", "surah_number");

ALTER TABLE "hifz_ayah_status"
    ADD CONSTRAINT "hifz_ayah_status_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

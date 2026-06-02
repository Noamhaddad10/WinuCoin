-- ============================================================
-- Migration 005 — Bilingual competition title & description
-- Run this in the Supabase SQL editor.
--
-- Adds four locale-specific columns to public.competitions:
--   title_fr / title_en / description_fr / description_en
--
-- Backfills the existing `title` and `description` values into
-- the FR slots (they are written in French today). The legacy
-- columns `title` and `description` remain — application code
-- keeps them in sync with the canonical (English) value so old
-- consumers continue to work.
--
-- Constraint: at least one localized title must be present.
-- Non-destructive — safe to re-run.
-- ============================================================

-- 1. Add new columns (nullable).
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS title_fr        TEXT,
  ADD COLUMN IF NOT EXISTS title_en        TEXT,
  ADD COLUMN IF NOT EXISTS description_fr  TEXT,
  ADD COLUMN IF NOT EXISTS description_en  TEXT;

-- 2. Backfill: existing data is in French (matches seed + admin usage).
UPDATE public.competitions
SET title_fr = title
WHERE title_fr IS NULL
  AND title IS NOT NULL;

UPDATE public.competitions
SET description_fr = description
WHERE description_fr IS NULL
  AND description IS NOT NULL;

-- 3. Constraint: at least one localized title must be filled.
--    Wrapped in DO block so re-running is safe even if the
--    constraint already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'competitions_title_lang_required'
  ) THEN
    ALTER TABLE public.competitions
      ADD CONSTRAINT competitions_title_lang_required
      CHECK (title_fr IS NOT NULL OR title_en IS NOT NULL);
  END IF;
END$$;

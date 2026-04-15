-- ============================================================
-- Migration 002 — Add is_published to competitions
-- Run this in the Supabase SQL editor.
-- ============================================================

-- Add is_published column (default FALSE so nothing becomes
-- accidentally visible; admin must explicitly publish each one)
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;

-- Update the public RLS policy: only show published + active competitions
DROP POLICY IF EXISTS "competitions: read active" ON public.competitions;

CREATE POLICY "competitions: read active"
  ON public.competitions FOR SELECT
  USING (status = 'active' AND is_published = TRUE);

-- Admins still have unrestricted access (existing policy covers this)

-- Index for the new column
CREATE INDEX IF NOT EXISTS idx_competitions_published
  ON public.competitions(is_published);

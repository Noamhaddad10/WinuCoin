-- ============================================================
-- Migration 003 — Add slug to competitions + update titles
-- Run this in the Supabase SQL editor.
-- ============================================================

-- Add slug column
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_competitions_slug ON public.competitions(slug);

-- ── Seed slugs for existing competitions ──────────────────────
-- Update known competitions by matching on recognisable title fragments.
-- Safe to re-run (UPDATE … WHERE slug IS NULL).

UPDATE public.competitions
SET
  title = 'Gagnez $250,000 en BNB',
  slug  = 'win-250k-bnb'
WHERE lower(title) IN ('bnb', 'gagnez $250,000 en bnb')
  AND slug IS NULL;

UPDATE public.competitions
SET
  title = 'Gagnez $100,000 en ETH',
  slug  = 'win-100k-eth'
WHERE lower(title) IN ('eth', 'gagnez $100,000 en eth')
  AND slug IS NULL;

UPDATE public.competitions
SET
  title = 'Gagnez $100,000 en Bitcoin',
  slug  = 'win-100k-btc'
WHERE lower(title) IN ('bitcoin', 'gagnez $100,000 en bitcoin')
  AND slug IS NULL;

UPDATE public.competitions
SET
  title = 'Gagnez $20,000 en USDT',
  slug  = 'win-20k-usdt'
WHERE lower(title) IN ('usdt', 'gagnez $20,000 en usdt')
  AND slug IS NULL;

UPDATE public.competitions
SET
  title = 'Gagnez 0.01 BTC',
  slug  = 'win-001-btc'
WHERE (lower(title) LIKE '%0.01 btc%' OR lower(title) LIKE '%win 0.01 btc%')
  AND slug IS NULL;

-- Mark the test competition as unpublished so it never shows in production
UPDATE public.competitions
SET is_published = FALSE
WHERE id = '8359cfe7-1a02-4699-a233-f11348fda319';

-- Add a French description to Win 0.01 BTC competition
UPDATE public.competitions
SET description = 'Votre chance de gagner du Bitcoin ! Participez dès maintenant pour seulement $5 par ticket.'
WHERE id = '05a3f65f-8a05-4714-9665-096ac3869106';

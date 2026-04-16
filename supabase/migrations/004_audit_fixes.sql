-- ============================================================
-- Migration 004 — Audit fixes (2026-04-16)
-- Run this in the Supabase SQL editor.
-- ============================================================

-- ── 1. Unique constraint on ticket numbers per competition ───
-- Prevents race-condition duplicates when concurrent webhooks fire.
ALTER TABLE public.tickets
  ADD CONSTRAINT uq_tickets_competition_number UNIQUE (competition_id, ticket_number);

-- ── 2. RLS: allow reading completed+published competitions ──
-- Previously only active+published were readable by normal users.
DROP POLICY IF EXISTS "competitions: read active" ON public.competitions;

CREATE POLICY "competitions: read published"
  ON public.competitions FOR SELECT
  USING (
    is_published = TRUE AND status IN ('active', 'completed')
  );

-- Admin policy remains unchanged (full access).

-- ── 3. Winners: mark existing winners as announced ──────────
UPDATE public.winners SET announced = TRUE WHERE announced = FALSE;

-- ── 4. Winners: let users see their own wins ────────────────
CREATE POLICY "winners: read own"
  ON public.winners FOR SELECT
  USING (
    user_id = (
      SELECT id FROM public.users WHERE auth_id = auth.uid()
    )
  );

-- ── 5. Atomic tickets_sold increment (avoids read-then-write race) ──
CREATE OR REPLACE FUNCTION public.increment_tickets_sold(
  p_competition_id UUID,
  p_count INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_sold INTEGER;
  v_max      INTEGER;
BEGIN
  UPDATE public.competitions
  SET tickets_sold = tickets_sold + p_count
  WHERE id = p_competition_id
  RETURNING tickets_sold, max_tickets INTO v_new_sold, v_max;

  IF v_new_sold >= v_max THEN
    UPDATE public.competitions
    SET status = 'completed'
    WHERE id = p_competition_id;
  END IF;
END;
$$;

-- Restrict the RPC to service_role only (prevent anon/authenticated from
-- calling it directly and inflating tickets_sold without paying).
REVOKE ALL ON FUNCTION public.increment_tickets_sold(UUID, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_tickets_sold(UUID, INTEGER) TO service_role;

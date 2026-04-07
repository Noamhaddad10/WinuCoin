-- ============================================================
-- WinuCoin — Initial Schema
-- ============================================================

-- ── users ────────────────────────────────────────────────────
CREATE TABLE public.users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  phone      TEXT,
  full_name  TEXT,
  role       TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── competitions ─────────────────────────────────────────────
CREATE TABLE public.competitions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  prize_amount     DECIMAL(12, 2) NOT NULL,
  crypto_type      TEXT NOT NULL DEFAULT 'BTC',
  crypto_price_usd DECIMAL(12, 2),
  ticket_price     DECIMAL(10, 2) NOT NULL,
  max_tickets      INTEGER NOT NULL,
  tickets_sold     INTEGER DEFAULT 0,
  end_date         TIMESTAMPTZ NOT NULL,
  status           TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  winner_drawn     BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── payments ─────────────────────────────────────────────────
-- Created before tickets because tickets references payments.
CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES public.users(id),
  competition_id    UUID REFERENCES public.competitions(id),
  amount            DECIMAL(10, 2) NOT NULL,
  ticket_count      INTEGER NOT NULL DEFAULT 1,
  stripe_payment_id TEXT,
  payment_method    TEXT DEFAULT 'card' CHECK (payment_method IN ('card', 'crypto')),
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── tickets ──────────────────────────────────────────────────
CREATE TABLE public.tickets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES public.users(id),
  competition_id UUID REFERENCES public.competitions(id),
  payment_id     UUID REFERENCES public.payments(id),
  ticket_number  INTEGER NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ── winners ──────────────────────────────────────────────────
CREATE TABLE public.winners (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) UNIQUE,
  user_id        UUID REFERENCES public.users(id),
  ticket_id      UUID REFERENCES public.tickets(id),
  announced      BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_users_auth_id        ON public.users(auth_id);
CREATE INDEX idx_tickets_user_id      ON public.tickets(user_id);
CREATE INDEX idx_tickets_competition  ON public.tickets(competition_id);
CREATE INDEX idx_payments_user_id     ON public.payments(user_id);
CREATE INDEX idx_payments_competition ON public.payments(competition_id);
CREATE INDEX idx_competitions_status  ON public.competitions(status);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners      ENABLE ROW LEVEL SECURITY;

-- Helper: check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

-- ── users policies ───────────────────────────────────────────

-- Users can read their own row
CREATE POLICY "users: read own"
  ON public.users FOR SELECT
  USING (auth_id = auth.uid());

-- Admins can read all rows
CREATE POLICY "users: admin read all"
  ON public.users FOR SELECT
  USING (public.is_admin());

-- Users can update their own row (name, phone)
CREATE POLICY "users: update own"
  ON public.users FOR UPDATE
  USING (auth_id = auth.uid());

-- ── competitions policies ────────────────────────────────────

-- Anyone can read active competitions
CREATE POLICY "competitions: read active"
  ON public.competitions FOR SELECT
  USING (status = 'active');

-- Admins can CRUD all competitions
CREATE POLICY "competitions: admin all"
  ON public.competitions FOR ALL
  USING (public.is_admin());

-- ── tickets policies ─────────────────────────────────────────

-- Users can read their own tickets
CREATE POLICY "tickets: read own"
  ON public.tickets FOR SELECT
  USING (
    user_id = (
      SELECT id FROM public.users WHERE auth_id = auth.uid()
    )
  );

-- Admins can read all tickets
CREATE POLICY "tickets: admin read all"
  ON public.tickets FOR SELECT
  USING (public.is_admin());

-- ── payments policies ────────────────────────────────────────

-- Users can read their own payments
CREATE POLICY "payments: read own"
  ON public.payments FOR SELECT
  USING (
    user_id = (
      SELECT id FROM public.users WHERE auth_id = auth.uid()
    )
  );

-- Admins can read all payments
CREATE POLICY "payments: admin read all"
  ON public.payments FOR SELECT
  USING (public.is_admin());

-- ── winners policies ─────────────────────────────────────────

-- Anyone can read announced winners
CREATE POLICY "winners: read announced"
  ON public.winners FOR SELECT
  USING (announced = TRUE);

-- Admins can CRUD all winners
CREATE POLICY "winners: admin all"
  ON public.winners FOR ALL
  USING (public.is_admin());

-- ============================================================
-- Trigger: auto-create user row when a new auth user signs up
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (email) DO UPDATE
    SET auth_id = EXCLUDED.auth_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

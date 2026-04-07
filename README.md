# WinuCoin

Win real cryptocurrency prizes through transparent, provably fair competitions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| i18n | next-intl (English + French) |
| Themes | next-themes (dark / light / system) |
| Payments | Stripe *(Phase 2)* |
| Email | Resend *(Phase 2)* |
| Crypto prices | CoinGecko *(Phase 2)* |

## Project Structure

```
src/
├── app/
│   ├── [locale]/               # i18n routes (en, fr)
│   │   ├── layout.tsx          # Locale layout — html, body, providers
│   │   ├── page.tsx            # Landing page
│   │   ├── login/page.tsx      # Email OTP sign-in
│   │   ├── dashboard/page.tsx  # Protected — user dashboard
│   │   ├── competitions/
│   │   │   ├── page.tsx        # Competition listing
│   │   │   └── [id]/page.tsx   # Competition detail
│   │   └── admin/page.tsx      # Protected (admin role)
│   └── api/
│       └── webhooks/stripe/route.ts  # Stripe webhook (Phase 2)
├── components/
│   ├── auth/       # LoginForm, OTPForm
│   ├── layout/     # Header, Footer, Sidebar
│   ├── providers/  # ThemeProvider
│   └── ui/         # Button, Card, Input, Modal
├── i18n/
│   ├── routing.ts  # defineRouting (locales, defaultLocale)
│   └── request.ts  # getRequestConfig (server-side i18n)
├── lib/
│   └── supabase/
│       ├── client.ts  # Browser client (createBrowserClient)
│       ├── server.ts  # Server client (createServerClient + cookies)
│       └── admin.ts   # Service-role client (bypasses RLS)
├── messages/
│   ├── en.json
│   └── fr.json
└── types/
    └── index.ts
supabase/
└── migrations/
    └── 001_initial.sql   # Full schema + RLS + trigger
```

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd winucoin
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your values in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project Settings → API (keep secret) |

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In the Supabase dashboard, go to **SQL Editor**
3. Run the migration:
   ```
   -- paste contents of supabase/migrations/001_initial.sql
   ```
4. Go to **Authentication → Email** and enable **OTP / Magic Link** (set to 6-digit code)
5. In **Authentication → URL Configuration**, set Site URL to `http://localhost:3000`

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/en`.

## Authentication Flow

WinuCoin uses **email OTP only** (no passwords):

1. User enters their email at `/[locale]/login`
2. Supabase sends a 6-digit one-time code to the email
3. User enters the code — session is created
4. A row in `public.users` is created automatically via a database trigger
5. User is redirected to `/[locale]/dashboard`

## Route Protection

Handled in `src/proxy.ts` (Next.js 16 Proxy, replaces Middleware):

| Route | Protection |
|-------|-----------|
| `/[locale]/dashboard` | Requires authenticated session |
| `/[locale]/admin` | Requires `role = 'admin'` in `public.users` |

To promote a user to admin, run in Supabase SQL Editor:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

## i18n

- Default locale: `en`
- Supported locales: `en`, `fr`
- Translation files: `src/messages/en.json`, `src/messages/fr.json`
- URL structure: `/en/...`, `/fr/...`

## Database Schema

See `supabase/migrations/001_initial.sql` for the complete schema:

- `users` — linked to Supabase `auth.users` via `auth_id`
- `competitions` — prize competitions with ticket tracking
- `payments` — Stripe payment records (Phase 2)
- `tickets` — purchased competition entries
- `winners` — drawn winners per competition
- Row Level Security policies for all tables
- Trigger to auto-create user rows on first sign-in

## Development Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
```

## Roadmap

| Phase | Status | Scope |
|-------|--------|-------|
| Phase 1 | **Current** | Project structure, database schema, authentication |
| Phase 2 | Planned | Stripe payment flow, ticket purchasing |
| Phase 3 | Planned | CoinGecko price feeds, winner draw mechanism |
| Phase 4 | Planned | Resend email notifications, admin competition CRUD |

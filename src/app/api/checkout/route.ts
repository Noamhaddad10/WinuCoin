import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

// ── In-memory rate limiter ──────────────────────────────────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + 60_000 })
    return true
  }

  if (entry.count >= 5) return false
  entry.count++
  return true
}

// ── POST /api/checkout ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // 1. Authenticate
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limit
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute and try again.' },
      { status: 429 },
    )
  }

  // 3. Parse & validate body
  let body: { competition_id?: string; ticket_count?: number; locale?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { competition_id, ticket_count, locale = 'en' } = body

  if (!competition_id || typeof competition_id !== 'string') {
    return NextResponse.json({ error: 'Missing competition_id' }, { status: 400 })
  }

  const count = Number(ticket_count)
  if (!count || count < 1 || count > 50 || !Number.isInteger(count)) {
    return NextResponse.json(
      { error: 'ticket_count must be a whole number between 1 and 50' },
      { status: 400 },
    )
  }

  // 4. Fetch competition and public user profile (admin client bypasses RLS)
  const admin = createAdminClient()

  const [{ data: competition, error: compError }, { data: publicUser }] = await Promise.all([
    admin
      .from('competitions')
      .select('id, slug, title, ticket_price, max_tickets, tickets_sold, status, crypto_type')
      .eq('id', competition_id)
      .single(),
    admin
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle(),
  ])

  if (compError || !competition) {
    return NextResponse.json({ error: 'Competition not found' }, { status: 404 })
  }

  if (!publicUser) {
    console.error('[checkout] No public user row found for auth_id:', user.id)
    return NextResponse.json({ error: 'User profile not found. Please visit your dashboard first.' }, { status: 400 })
  }

  console.log('[checkout] auth_id:', user.id, '→ public user id:', publicUser.id)

  if (competition.status !== 'active') {
    return NextResponse.json({ error: 'This competition is not active' }, { status: 400 })
  }

  const remaining = competition.max_tickets - competition.tickets_sold
  if (count > remaining) {
    return NextResponse.json(
      { error: `Only ${remaining} ticket${remaining === 1 ? '' : 's'} remaining` },
      { status: 400 },
    )
  }

  // 5. Create Stripe Checkout Session
  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${count} ticket${count > 1 ? 's' : ''} — ${competition.title}`,
            description: `${competition.crypto_type} Prize Competition on WinuWallet`,
          },
          unit_amount: Math.round(competition.ticket_price * 100), // cents
        },
        quantity: count,
      },
    ],
    success_url: `${appUrl}/${locale}/competitions/${competition.slug ?? competition_id}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${locale}/competitions/${competition.slug ?? competition_id}`,
    metadata: {
      competition_id,
      ticket_count: String(count),
      user_id: user.id,          // auth user id — used for tickets.user_id
      public_user_id: publicUser.id, // public.users.id — used for payments.user_id
    },
  })

  // 6. Store pending payment
  console.log('[checkout] Inserting pending payment for session:', session.id, 'public_user_id:', publicUser.id)
  const { error: paymentInsertError } = await admin.from('payments').insert({
    user_id: publicUser.id,
    competition_id,
    amount: competition.ticket_price * count,
    ticket_count: count,
    stripe_payment_id: session.id,
    payment_method: 'card',
    status: 'pending',
  })

  if (paymentInsertError) {
    console.error('[checkout] Failed to insert payment record:', paymentInsertError.message, paymentInsertError.details)
  } else {
    console.log('[checkout] Payment record inserted successfully for session:', session.id)
  }

  return NextResponse.json({ url: session.url })
}

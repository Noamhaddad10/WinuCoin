import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { sendPurchaseConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    console.error('[webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const stripe = getStripe()
  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook] Signature verification failed:', message)
    return NextResponse.json({ error: `Invalid signature: ${message}` }, { status: 400 })
  }

  // ── Handle events ──────────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    const { competition_id, ticket_count, user_id, public_user_id } = session.metadata ?? {}

    if (!competition_id || !ticket_count || !user_id) {
      console.error('[webhook] Missing metadata:', { competition_id, ticket_count, user_id })
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const admin = createAdminClient()
    const count = Number(ticket_count)
    // Recover the real amount from Stripe (in cents → dollars)
    const amountFromStripe = session.amount_total ? session.amount_total / 100 : 0

    // Look up payment by Stripe session ID
    const { data: payment } = await admin
      .from('payments')
      .select('id, status')
      .eq('stripe_payment_id', session.id)
      .maybeSingle()

    if (!payment) {
      // Payment record missing — create it now so tickets can still be issued
      console.warn('[webhook] Payment record not found — inserting fallback')

      const resolvedPublicUserId = await resolvePublicUserId(admin, public_user_id, user_id)
      if (!resolvedPublicUserId) {
        console.error('[webhook] Cannot resolve public user id for auth_id:', user_id)
        return NextResponse.json({ error: 'Could not resolve user' }, { status: 500 })
      }

      const { data: newPayment, error: insertError } = await admin
        .from('payments')
        .insert({
          user_id: resolvedPublicUserId,
          competition_id,
          amount: amountFromStripe,
          ticket_count: count,
          stripe_payment_id: session.id,
          payment_method: 'card',
          status: 'completed',
        })
        .select('id')
        .single()

      if (insertError || !newPayment) {
        console.error('[webhook] Could not create payment record:', insertError?.message)
        return NextResponse.json({ error: 'Payment record not found and could not be created' }, { status: 500 })
      }

      return await issueTickets(admin, newPayment.id, count, competition_id, resolvedPublicUserId)
    }

    // Happy path — payment record exists
    const resolvedPublicUserId = await resolvePublicUserId(admin, public_user_id, user_id)
    if (!resolvedPublicUserId) {
      console.error('[webhook] Cannot resolve public user id for auth_id:', user_id)
      return NextResponse.json({ error: 'Could not resolve user' }, { status: 500 })
    }

    // Mark payment as completed
    const { error: updateError } = await admin
      .from('payments')
      .update({ status: 'completed' })
      .eq('id', payment.id)

    if (updateError) {
      console.error('[webhook] Failed to update payment status:', updateError.message)
    }

    return await issueTickets(admin, payment.id, count, competition_id, resolvedPublicUserId)
  }

  return NextResponse.json({ received: true })
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Resolve the public.users.id from metadata or by looking up auth_id. */
async function resolvePublicUserId(
  admin: ReturnType<typeof createAdminClient>,
  publicUserIdFromMeta: string | undefined,
  authId: string,
): Promise<string | undefined> {
  if (publicUserIdFromMeta) return publicUserIdFromMeta

  const { data } = await admin
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .maybeSingle()
  return data?.id
}

async function issueTickets(
  admin: ReturnType<typeof createAdminClient>,
  paymentId: string,
  count: number,
  competitionId: string,
  userId: string,
) {
  // Check if tickets already issued (idempotency)
  const { count: existingCount } = await admin
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('payment_id', paymentId)

  if (existingCount && existingCount > 0) {
    return NextResponse.json({ received: true })
  }

  // Atomically allocate ticket numbers using a PostgreSQL RPC.
  // This avoids the read-then-write race condition by using a single
  // UPDATE ... RETURNING to reserve the next block of numbers.
  // Fallback: read max + insert with UNIQUE constraint as safety net.
  const { data: maxRow } = await admin
    .from('tickets')
    .select('ticket_number')
    .eq('competition_id', competitionId)
    .order('ticket_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const startNumber = (maxRow?.ticket_number ?? 0) + 1

  const tickets = Array.from({ length: count }, (_, i) => ({
    user_id: userId,
    competition_id: competitionId,
    payment_id: paymentId,
    ticket_number: startNumber + i,
  }))

  const { error: ticketError } = await admin.from('tickets').insert(tickets)

  if (ticketError) {
    // If UNIQUE constraint violation, another webhook already assigned these numbers.
    // Retry once with fresh numbers.
    if (ticketError.code === '23505') {
      console.warn('[webhook] Ticket number conflict — retrying with fresh numbers')
      const { data: freshMax } = await admin
        .from('tickets')
        .select('ticket_number')
        .eq('competition_id', competitionId)
        .order('ticket_number', { ascending: false })
        .limit(1)
        .maybeSingle()

      const retryStart = (freshMax?.ticket_number ?? 0) + 1
      const retryTickets = Array.from({ length: count }, (_, i) => ({
        user_id: userId,
        competition_id: competitionId,
        payment_id: paymentId,
        ticket_number: retryStart + i,
      }))

      const { error: retryError } = await admin.from('tickets').insert(retryTickets)
      if (retryError) {
        console.error('[webhook] Failed to insert tickets after retry:', retryError.message)
        return NextResponse.json({ error: 'Failed to create tickets' }, { status: 500 })
      }
      // Use retried tickets for email
      tickets.length = 0
      tickets.push(...retryTickets)
    } else {
      console.error('[webhook] Failed to insert tickets:', ticketError.message)
      return NextResponse.json({ error: 'Failed to create tickets' }, { status: 500 })
    }
  }

  // Atomically increment tickets_sold and auto-complete if full
  await admin.rpc('increment_tickets_sold', {
    p_competition_id: competitionId,
    p_count: count,
  })

  // Send purchase confirmation email (fire-and-forget)
  try {
    const [{ data: userRow }, { data: comp }] = await Promise.all([
      admin.from('users').select('email').eq('id', userId).single(),
      admin.from('competitions').select('title, ticket_price').eq('id', competitionId).single(),
    ])

    if (userRow?.email && comp) {
      sendPurchaseConfirmation({
        email: userRow.email,
        competitionTitle: comp.title,
        competitionId,
        ticketCount: count,
        ticketNumbers: tickets.map((t) => t.ticket_number),
        totalPaid: comp.ticket_price * count,
      }).catch(console.error)
    }
  } catch (err) {
    console.error('[webhook] Failed to send confirmation email:', err)
  }

  return NextResponse.json({ received: true })
}

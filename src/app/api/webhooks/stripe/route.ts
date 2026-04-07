import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { sendPurchaseConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  console.log('[webhook] POST /api/webhooks/stripe received')

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

  console.log('[webhook] Event received:', event.type, event.id)

  // ── Handle events ──────────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    console.log('[webhook] checkout.session.completed - session.id:', session.id)
    console.log('[webhook] session.metadata:', JSON.stringify(session.metadata))
    console.log('[webhook] session.payment_status:', session.payment_status)

    const { competition_id, ticket_count, user_id, public_user_id } = session.metadata ?? {}

    if (!competition_id || !ticket_count || !user_id) {
      console.error('[webhook] Missing metadata. Got:', { competition_id, ticket_count, user_id, public_user_id })
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const admin = createAdminClient()
    const count = Number(ticket_count)

    // Look up payment by Stripe session ID
    console.log('[webhook] Looking up payment with stripe_payment_id:', session.id)
    const { data: payment, error: paymentLookupError } = await admin
      .from('payments')
      .select('id, status')
      .eq('stripe_payment_id', session.id)
      .maybeSingle()

    console.log('[webhook] Payment lookup result:', JSON.stringify(payment), 'error:', paymentLookupError?.message)

    if (!payment) {
      // Payment record missing — create it now so tickets can still be issued
      console.warn('[webhook] Payment record not found — inserting it now')

      // Resolve public user id: use metadata value if present, else look it up by auth_id
      let resolvedPublicUserId = public_user_id
      if (!resolvedPublicUserId) {
        const { data: pubUser } = await admin
          .from('users')
          .select('id')
          .eq('auth_id', user_id)
          .maybeSingle()
        resolvedPublicUserId = pubUser?.id
        console.log('[webhook] Resolved public_user_id via auth_id lookup:', resolvedPublicUserId)
      }

      if (!resolvedPublicUserId) {
        console.error('[webhook] Cannot resolve public user id for auth_id:', user_id)
        return NextResponse.json({ error: 'Could not resolve user' }, { status: 500 })
      }

      const { data: newPayment, error: insertError } = await admin
        .from('payments')
        .insert({
          user_id: resolvedPublicUserId,
          competition_id,
          amount: 0,
          ticket_count: count,
          stripe_payment_id: session.id,
          payment_method: 'card',
          status: 'completed',
        })
        .select('id')
        .single()

      console.log('[webhook] Emergency insert result:', JSON.stringify(newPayment), 'error:', insertError?.message)

      if (insertError || !newPayment) {
        console.error('[webhook] Could not create payment record:', insertError?.message)
        return NextResponse.json({ error: 'Payment record not found and could not be created' }, { status: 500 })
      }

      return await issueTickets(admin, newPayment.id, count, competition_id, resolvedPublicUserId)
    }

    // Resolve public user id for the happy path too
    let resolvedPublicUserId = public_user_id
    if (!resolvedPublicUserId) {
      const { data: pubUser } = await admin
        .from('users')
        .select('id')
        .eq('auth_id', user_id)
        .maybeSingle()
      resolvedPublicUserId = pubUser?.id
      console.log('[webhook] Resolved public_user_id via auth_id lookup:', resolvedPublicUserId)
    }

    if (!resolvedPublicUserId) {
      console.error('[webhook] Cannot resolve public user id for auth_id:', user_id)
      return NextResponse.json({ error: 'Could not resolve user' }, { status: 500 })
    }

    // Mark payment as completed
    console.log('[webhook] Marking payment', payment.id, 'as completed')
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

async function issueTickets(
  admin: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  paymentId: string,
  count: number,
  competitionId: string,
  userId: string,
  userAuthId?: string,
) {
  // Check if tickets already issued (idempotency)
  const { count: existingCount } = await admin
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('payment_id', paymentId)

  if (existingCount && existingCount > 0) {
    console.log('[webhook] Tickets already issued for payment', paymentId, '— skipping')
    return NextResponse.json({ received: true })
  }

  // Get current highest ticket number for this competition
  const { data: maxRow } = await admin
    .from('tickets')
    .select('ticket_number')
    .eq('competition_id', competitionId)
    .order('ticket_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  const startNumber = (maxRow?.ticket_number ?? 0) + 1
  console.log('[webhook] Issuing', count, 'tickets starting at', startNumber)

  // Insert ticket rows
  const tickets = Array.from({ length: count }, (_, i) => ({
    user_id: userId,
    competition_id: competitionId,
    payment_id: paymentId,
    ticket_number: startNumber + i,
  }))

  const { error: ticketError } = await admin.from('tickets').insert(tickets)

  if (ticketError) {
    console.error('[webhook] Failed to insert tickets:', ticketError.message, ticketError.details)
    return NextResponse.json({ error: 'Failed to create tickets' }, { status: 500 })
  }

  console.log('[webhook] Tickets inserted successfully')

  // Update tickets_sold on the competition
  const { data: competition } = await admin
    .from('competitions')
    .select('tickets_sold, max_tickets')
    .eq('id', competitionId)
    .single()

  if (competition) {
    const newSold = competition.tickets_sold + count
    const newStatus = newSold >= competition.max_tickets ? 'completed' : 'active'
    console.log('[webhook] Updating competition tickets_sold to', newSold, 'status:', newStatus)

    await admin
      .from('competitions')
      .update({ tickets_sold: newSold, status: newStatus })
      .eq('id', competitionId)
  }

  // Send purchase confirmation email (fire-and-forget)
  try {
    // Get user email via auth_id
    const { data: userRow } = await admin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    const { data: comp } = await admin
      .from('competitions')
      .select('title, ticket_price')
      .eq('id', competitionId)
      .single()

    if (userRow?.email && comp) {
      const ticketNumbers = tickets.map((t) => t.ticket_number)
      sendPurchaseConfirmation({
        email: userRow.email,
        competitionTitle: comp.title,
        competitionId,
        ticketCount: count,
        ticketNumbers,
        totalPaid: comp.ticket_price * count,
      }).catch(console.error)
    }
  } catch (err) {
    console.error('[webhook] Failed to send confirmation email:', err)
  }

  return NextResponse.json({ received: true })
}

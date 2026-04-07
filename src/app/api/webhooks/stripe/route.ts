// Stripe webhook handler — placeholder for Phase 2
// TODO: verify Stripe signature, handle payment_intent.succeeded and charge.refunded events

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json({ received: true }, { status: 200 })
}

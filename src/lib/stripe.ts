import Stripe from 'stripe'

let _stripe: Stripe | null = null

/** Lazily initialised Stripe client (safe during build when key is absent). */
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return _stripe
}

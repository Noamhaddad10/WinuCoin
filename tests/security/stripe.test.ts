import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const SRC_DIR = path.resolve(__dirname, '../../src')

function getAllFiles(dir: string, exts: string[]): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, exts))
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath)
    }
  }
  return files
}

describe('Stripe security', () => {
  it('no Stripe secret key in client-side components', () => {
    const componentFiles = getAllFiles(path.join(SRC_DIR, 'components'), ['.tsx', '.ts'])
    const violations: string[] = []
    for (const file of componentFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      if (/STRIPE_SECRET_KEY|sk_test|sk_live/.test(content)) {
        violations.push(path.relative(SRC_DIR, file))
      }
    }
    expect(violations).toEqual([])
  })

  it('webhook route verifies stripe signature', () => {
    const webhookFile = path.join(SRC_DIR, 'app/api/webhooks/stripe/route.ts')
    const content = fs.readFileSync(webhookFile, 'utf-8')
    expect(content).toContain('constructEvent')
    expect(content).toContain('stripe-signature')
    expect(content).toContain('STRIPE_WEBHOOK_SECRET')
  })

  it('webhook returns 400 for missing signature', () => {
    const webhookFile = path.join(SRC_DIR, 'app/api/webhooks/stripe/route.ts')
    const content = fs.readFileSync(webhookFile, 'utf-8')
    expect(content).toContain('Missing stripe-signature')
    expect(content).toContain('400')
  })

  it('checkout amount is calculated server-side from competition data', () => {
    const checkoutFile = path.join(SRC_DIR, 'app/api/checkout/route.ts')
    const content = fs.readFileSync(checkoutFile, 'utf-8')
    // The unit_amount should come from competition.ticket_price, not from client
    expect(content).toContain('competition.ticket_price')
    expect(content).toContain('unit_amount')
  })

  it('checkout validates ticket count bounds', () => {
    const checkoutFile = path.join(SRC_DIR, 'app/api/checkout/route.ts')
    const content = fs.readFileSync(checkoutFile, 'utf-8')
    // Must check count >= 1 and count <= 50
    expect(content).toContain('count < 1')
    expect(content).toContain('count > 50')
  })

  it('checkout checks authentication', () => {
    const checkoutFile = path.join(SRC_DIR, 'app/api/checkout/route.ts')
    const content = fs.readFileSync(checkoutFile, 'utf-8')
    expect(content).toContain('Unauthorized')
    expect(content).toContain('401')
  })

  it('checkout implements rate limiting', () => {
    const checkoutFile = path.join(SRC_DIR, 'app/api/checkout/route.ts')
    const content = fs.readFileSync(checkoutFile, 'utf-8')
    expect(content).toContain('checkRateLimit')
    expect(content).toContain('429')
  })

  it('webhook handles idempotency for duplicate events', () => {
    const webhookFile = path.join(SRC_DIR, 'app/api/webhooks/stripe/route.ts')
    const content = fs.readFileSync(webhookFile, 'utf-8')
    // Check for idempotency logic
    expect(content).toContain('existingCount')
    expect(content).toContain('idempoten')
  })
})

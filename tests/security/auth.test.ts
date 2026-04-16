import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const SRC_DIR = path.resolve(__dirname, '../../src')

describe('authentication & authorization', () => {
  it('admin actions require admin role check', () => {
    const actionsFile = path.join(SRC_DIR, 'app/[locale]/admin/actions.ts')
    const content = fs.readFileSync(actionsFile, 'utf-8')

    // Every exported function (except requireAdmin itself) should call requireAdmin
    expect(content).toContain('requireAdmin')

    // createCompetition calls requireAdmin
    const createBlock = content.slice(content.indexOf('createCompetition'))
    expect(createBlock).toContain('await requireAdmin()')

    // updateCompetition calls requireAdmin
    const updateBlock = content.slice(content.indexOf('updateCompetition'))
    expect(updateBlock).toContain('await requireAdmin()')

    // drawWinner calls requireAdmin
    const drawBlock = content.slice(content.indexOf('drawWinner'))
    expect(drawBlock).toContain('await requireAdmin()')

    // updateUserRole calls requireAdmin
    const roleBlock = content.slice(content.indexOf('updateUserRole'))
    expect(roleBlock).toContain('await requireAdmin()')
  })

  it('requireAdmin checks both auth and role', () => {
    const actionsFile = path.join(SRC_DIR, 'app/[locale]/admin/actions.ts')
    const content = fs.readFileSync(actionsFile, 'utf-8')

    // Extract requireAdmin function
    const fnStart = content.indexOf('async function requireAdmin')
    const fnBlock = content.slice(fnStart, content.indexOf('\n}', fnStart) + 2)

    // Must check auth.getUser()
    expect(fnBlock).toContain('getUser')
    // Must check role === 'admin'
    expect(fnBlock).toContain("'admin'")
    // Must throw on unauthorized
    expect(fnBlock).toContain('Unauthorized')
    expect(fnBlock).toContain('Forbidden')
  })

  it('checkout route checks authentication before processing', () => {
    const checkoutFile = path.join(SRC_DIR, 'app/api/checkout/route.ts')
    const content = fs.readFileSync(checkoutFile, 'utf-8')

    // Auth check must come before business logic
    const authIdx = content.indexOf('auth.getUser')
    const stripeIdx = content.indexOf('stripe.checkout')
    expect(authIdx).toBeLessThan(stripeIdx)
  })

  it('signout route exists and signs out user', () => {
    const signoutFile = path.join(SRC_DIR, 'app/api/auth/signout/route.ts')
    const content = fs.readFileSync(signoutFile, 'utf-8')
    expect(content).toContain('signOut')
    expect(content).toContain('303') // redirect status
  })

  it('auth callback route validates code parameter', () => {
    const callbackFile = path.join(SRC_DIR, 'app/auth/callback/route.ts')
    const content = fs.readFileSync(callbackFile, 'utf-8')
    expect(content).toContain("searchParams.get('code')")
    expect(content).toContain('exchangeCodeForSession')
  })

  it('auth callback auto-creates public user row', () => {
    const callbackFile = path.join(SRC_DIR, 'app/auth/callback/route.ts')
    const content = fs.readFileSync(callbackFile, 'utf-8')
    // Should check if user exists and create if not
    expect(content).toContain('existingUser')
    expect(content).toContain("insert")
    expect(content).toContain("role: 'user'")
  })
})

describe('proxy.ts (middleware) protections', () => {
  it('proxy.ts exists', () => {
    const proxyFile = path.join(SRC_DIR, 'proxy.ts')
    expect(fs.existsSync(proxyFile)).toBe(true)
  })

  it('proxy.ts protects /dashboard routes', () => {
    const proxyFile = path.join(SRC_DIR, 'proxy.ts')
    const content = fs.readFileSync(proxyFile, 'utf-8')
    expect(content).toContain('/dashboard')
    expect(content).toContain('login')
  })

  it('proxy.ts protects /admin routes', () => {
    const proxyFile = path.join(SRC_DIR, 'proxy.ts')
    const content = fs.readFileSync(proxyFile, 'utf-8')
    expect(content).toContain('/admin')
    expect(content).toContain("role")
    expect(content).toContain("'admin'")
  })

  it('proxy.ts checks Supabase auth session', () => {
    const proxyFile = path.join(SRC_DIR, 'proxy.ts')
    const content = fs.readFileSync(proxyFile, 'utf-8')
    expect(content).toContain('auth.getUser')
    expect(content).toContain('createServerClient')
  })

  it('proxy.ts skips API routes and auth callback', () => {
    const proxyFile = path.join(SRC_DIR, 'proxy.ts')
    const content = fs.readFileSync(proxyFile, 'utf-8')
    expect(content).toContain('/api/')
    expect(content).toContain('/auth/callback')
  })
})

describe('admin route protections', () => {
  it('admin layout exists', () => {
    const layoutFile = path.join(SRC_DIR, 'app/[locale]/admin/layout.tsx')
    expect(fs.existsSync(layoutFile)).toBe(true)
  })

  it('admin createCompetition validates viability', () => {
    const actionsFile = path.join(SRC_DIR, 'app/[locale]/admin/actions.ts')
    const content = fs.readFileSync(actionsFile, 'utf-8')
    // Must check maxRevenue >= prize_amount
    expect(content).toContain('maxRevenue')
    expect(content).toContain('Viability error')
  })

  it('drawWinner checks competition eligibility', () => {
    const actionsFile = path.join(SRC_DIR, 'app/[locale]/admin/actions.ts')
    const content = fs.readFileSync(actionsFile, 'utf-8')
    expect(content).toContain('winner_drawn')
    expect(content).toContain('Winner already drawn')
    expect(content).toContain('not yet eligible')
  })
})

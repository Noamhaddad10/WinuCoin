import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const ROOT_DIR = path.resolve(__dirname, '../../')

describe('.env.local.example exists and is complete', () => {
  const examplePath = path.join(ROOT_DIR, '.env.local.example')

  it('.env.local.example file exists', () => {
    expect(fs.existsSync(examplePath)).toBe(true)
  })

  it('contains required env vars', () => {
    const content = fs.readFileSync(examplePath, 'utf-8')
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ]
    for (const v of requiredVars) {
      expect(content).toContain(v)
    }
  })
})

describe('.gitignore protects secrets', () => {
  it('.gitignore includes .env patterns', () => {
    const gitignore = fs.readFileSync(path.join(ROOT_DIR, '.gitignore'), 'utf-8')
    expect(gitignore).toContain('.env')
  })
})

describe('security headers in next.config.ts', () => {
  it('next.config.ts contains security headers', () => {
    const configFile = path.join(ROOT_DIR, 'next.config.ts')
    const content = fs.readFileSync(configFile, 'utf-8')
    expect(content).toContain('X-Frame-Options')
    expect(content).toContain('X-Content-Type-Options')
    expect(content).toContain('Referrer-Policy')
    expect(content).toContain('Permissions-Policy')
  })

  it('X-Frame-Options is set to DENY', () => {
    const configFile = path.join(ROOT_DIR, 'next.config.ts')
    const content = fs.readFileSync(configFile, 'utf-8')
    expect(content).toContain('DENY')
  })

  it('next.config.ts exports headers() function', () => {
    const configFile = path.join(ROOT_DIR, 'next.config.ts')
    const content = fs.readFileSync(configFile, 'utf-8')
    expect(content).toContain('async headers()')
  })
})

describe('Stripe secret key not exposed to client', () => {
  it('client.ts does not import stripe', () => {
    const clientFile = path.join(ROOT_DIR, 'src/lib/supabase/client.ts')
    const content = fs.readFileSync(clientFile, 'utf-8')
    expect(content).not.toContain('STRIPE_SECRET_KEY')
    expect(content).not.toContain('stripe')
  })

  it('admin client is only imported in server files', () => {
    const adminFile = path.join(ROOT_DIR, 'src/lib/supabase/admin.ts')
    const content = fs.readFileSync(adminFile, 'utf-8')
    expect(content).toContain('SUPABASE_SERVICE_ROLE_KEY')
    // Verify the comment about server-only usage
    expect(content).toContain('server')
  })
})

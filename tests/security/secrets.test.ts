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

const sourceFiles = getAllFiles(SRC_DIR, ['.ts', '.tsx'])

describe('no hardcoded secrets in source code', () => {
  it('no Stripe live/test secret keys in source files', () => {
    const violations: string[] = []
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      // Match sk_live_ or sk_test_ followed by alphanumeric (actual key)
      if (/sk_(live|test)_[a-zA-Z0-9]{10,}/.test(content)) {
        violations.push(path.relative(SRC_DIR, file))
      }
    }
    expect(violations).toEqual([])
  })

  it('no hardcoded Supabase service role keys', () => {
    const violations: string[] = []
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      // Match eyJ (JWT prefix) that looks like a hardcoded key
      if (/supabase_service_role|service_role_key/.test(content.toLowerCase())) {
        // Only flag if it's not reading from process.env
        const lines = content.split('\n')
        for (const line of lines) {
          if (/service.role/i.test(line) && !line.includes('process.env') && !line.includes('//')) {
            violations.push(path.relative(SRC_DIR, file))
            break
          }
        }
      }
    }
    expect(violations).toEqual([])
  })

  it('no hardcoded JWT secrets', () => {
    const violations: string[] = []
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      if (/jwt_secret\s*[:=]\s*['"][^'"]+['"]/i.test(content)) {
        violations.push(path.relative(SRC_DIR, file))
      }
    }
    expect(violations).toEqual([])
  })

  it('no hardcoded passwords', () => {
    const violations: string[] = []
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      if (/password\s*[:=]\s*['"][^'"]+['"]/i.test(content)) {
        // Exclude type definitions and test files
        if (!content.includes("type='password'") && !content.includes('type="password"')) {
          violations.push(path.relative(SRC_DIR, file))
        }
      }
    }
    expect(violations).toEqual([])
  })
})

describe('NEXT_PUBLIC_ env vars do not contain secrets', () => {
  it('NEXT_PUBLIC_ vars should not reference secret/key/password', () => {
    const envFiles = ['.env.local.example', '.env.local', '.env']
      .map((f) => path.resolve(__dirname, '../../', f))
      .filter(fs.existsSync)

    const violations: string[] = []
    for (const envFile of envFiles) {
      const content = fs.readFileSync(envFile, 'utf-8')
      const lines = content.split('\n')
      for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_') && /secret|service.role|password/i.test(line)) {
          violations.push(`${path.basename(envFile)}: ${line.trim()}`)
        }
      }
    }
    expect(violations).toEqual([])
  })
})

describe('no dangerous patterns in source code', () => {
  it('no eval() or Function() constructor', () => {
    const violations: string[] = []
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      if (/\beval\s*\(/.test(content) || /\bnew\s+Function\s*\(/.test(content)) {
        violations.push(path.relative(SRC_DIR, file))
      }
    }
    expect(violations).toEqual([])
  })

  it('no dangerouslySetInnerHTML without sanitization context', () => {
    const violations: string[] = []
    for (const file of sourceFiles) {
      if (!file.endsWith('.tsx')) continue
      const content = fs.readFileSync(file, 'utf-8')
      if (content.includes('dangerouslySetInnerHTML')) {
        violations.push(path.relative(SRC_DIR, file))
      }
    }
    // If there are any, they should be reviewed manually
    if (violations.length > 0) {
      console.warn('Files using dangerouslySetInnerHTML (manual review required):', violations)
    }
    expect(violations).toEqual([])
  })
})

describe('crypto randomness', () => {
  it('draw winner uses crypto.randomInt, not Math.random', () => {
    const actionsFile = path.resolve(SRC_DIR, 'app/[locale]/admin/actions.ts')
    const content = fs.readFileSync(actionsFile, 'utf-8')
    expect(content).toContain('randomInt')
    expect(content).not.toContain('Math.random')
  })
})

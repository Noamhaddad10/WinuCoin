import { describe, it, expect } from 'vitest'
import en from '@/messages/en.json'
import fr from '@/messages/fr.json'

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, val]) =>
    typeof val === 'object' && val !== null
      ? getAllKeys(val as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}

const enKeys = getAllKeys(en)
const frKeys = getAllKeys(fr)

describe('i18n completeness', () => {
  it('EN and FR have the same number of keys', () => {
    expect(enKeys.length).toBe(frKeys.length)
  })

  it('every EN key exists in FR', () => {
    const missing = enKeys.filter((k) => !frKeys.includes(k))
    if (missing.length > 0) {
      console.log('Missing in FR:', missing)
    }
    expect(missing).toEqual([])
  })

  it('every FR key exists in EN', () => {
    const extra = frKeys.filter((k) => !enKeys.includes(k))
    if (extra.length > 0) {
      console.log('Extra in FR (missing in EN):', extra)
    }
    expect(extra).toEqual([])
  })

  it('no empty translation values in EN', () => {
    const empty = enKeys.filter((k) => getNestedValue(en, k) === '')
    expect(empty).toEqual([])
  })

  it('no empty translation values in FR', () => {
    const empty = frKeys.filter((k) => getNestedValue(fr, k) === '')
    expect(empty).toEqual([])
  })

  it('all EN values are strings', () => {
    const nonString = enKeys.filter((k) => typeof getNestedValue(en, k) !== 'string')
    expect(nonString).toEqual([])
  })

  it('all FR values are strings', () => {
    const nonString = frKeys.filter((k) => typeof getNestedValue(fr, k) !== 'string')
    expect(nonString).toEqual([])
  })

  it('interpolation variables match between EN and FR', () => {
    const varPattern = /\{(\w+)\}/g
    const mismatches: string[] = []

    for (const key of enKeys) {
      const enVal = getNestedValue(en, key) as string
      const frVal = getNestedValue(fr, key) as string
      if (!frVal) continue

      const enVars = [...enVal.matchAll(varPattern)].map((m) => m[1]).sort()
      const frVars = [...frVal.matchAll(varPattern)].map((m) => m[1]).sort()

      if (JSON.stringify(enVars) !== JSON.stringify(frVars)) {
        mismatches.push(`${key}: EN has {${enVars.join(',')}} but FR has {${frVars.join(',')}}`)
      }
    }

    if (mismatches.length > 0) {
      console.log('Variable mismatches:', mismatches)
    }
    expect(mismatches).toEqual([])
  })
})

describe('i18n structure', () => {
  it('has required top-level sections', () => {
    const requiredSections = ['common', 'nav', 'auth', 'landing', 'competitions', 'dashboard', 'admin', 'footer']
    for (const section of requiredSections) {
      expect(en).toHaveProperty(section)
      expect(fr).toHaveProperty(section)
    }
  })

  it('nav section has required keys', () => {
    const requiredNavKeys = ['home', 'competitions', 'dashboard', 'login', 'logout']
    for (const key of requiredNavKeys) {
      expect(en.nav).toHaveProperty(key)
      expect(fr.nav).toHaveProperty(key)
    }
  })

  it('auth section has error messages', () => {
    expect(en.auth.errors).toBeDefined()
    expect(fr.auth.errors).toBeDefined()
    expect(en.auth.errors.invalidEmail).toBeTruthy()
    expect(fr.auth.errors.invalidEmail).toBeTruthy()
  })
})

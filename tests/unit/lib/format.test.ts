import { describe, it, expect } from 'vitest'
import { fmtNumber, fmtUSD, fmtDate, fmtDateTime } from '@/lib/format'

describe('fmtNumber', () => {
  it('formats integers with commas', () => {
    expect(fmtNumber(1234567)).toBe('1,234,567')
  })

  it('formats zero', () => {
    expect(fmtNumber(0)).toBe('0')
  })

  it('formats small numbers without commas', () => {
    expect(fmtNumber(42)).toBe('42')
  })

  it('formats negative numbers', () => {
    expect(fmtNumber(-1000)).toBe('-1,000')
  })

  it('formats decimals', () => {
    expect(fmtNumber(1234.56)).toBe('1,234.56')
  })
})

describe('fmtUSD', () => {
  it('formats with 2 decimal places', () => {
    expect(fmtUSD(1234.5)).toBe('1,234.50')
  })

  it('formats whole numbers with .00', () => {
    expect(fmtUSD(100)).toBe('100.00')
  })

  it('formats zero', () => {
    expect(fmtUSD(0)).toBe('0.00')
  })

  it('rounds to 2 decimal places', () => {
    expect(fmtUSD(99.999)).toBe('100.00')
  })

  it('formats large amounts', () => {
    expect(fmtUSD(65000)).toBe('65,000.00')
  })
})

describe('fmtDate', () => {
  it('formats date in English by default', () => {
    const result = fmtDate('2026-04-07T00:00:00Z')
    expect(result).toMatch(/Apr/)
    expect(result).toMatch(/2026/)
  })

  it('formats date in French', () => {
    const result = fmtDate('2026-04-07T00:00:00Z', 'fr')
    expect(result).toMatch(/avr/)
    expect(result).toMatch(/2026/)
  })

  it('accepts Date objects', () => {
    const date = new Date('2026-12-25T00:00:00Z')
    const result = fmtDate(date)
    expect(result).toMatch(/Dec/)
    expect(result).toMatch(/2026/)
  })
})

describe('fmtDateTime', () => {
  it('includes time in English format', () => {
    const result = fmtDateTime('2026-04-07T15:30:00Z')
    expect(result).toMatch(/Apr/)
    expect(result).toMatch(/2026/)
    // Should contain time portion
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('includes time in French format', () => {
    const result = fmtDateTime('2026-04-07T15:30:00Z', 'fr')
    expect(result).toMatch(/avr/)
    expect(result).toMatch(/2026/)
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('accepts Date objects', () => {
    const date = new Date('2026-06-15T09:00:00Z')
    const result = fmtDateTime(date)
    expect(result).toMatch(/Jun/)
  })
})

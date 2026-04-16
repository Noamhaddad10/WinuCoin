import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCryptoPrices, cryptoAmount } from '@/lib/coingecko'

describe('cryptoAmount', () => {
  it('converts USD to crypto amount', () => {
    const result = cryptoAmount(500, 65000)
    // 500 / 65000 = ~0.00769230...
    expect(parseFloat(result)).toBeCloseTo(0.00769, 4)
  })

  it('handles large prize with small crypto price', () => {
    const result = cryptoAmount(100000, 100)
    // 100000 / 100 = 1000
    expect(parseFloat(result)).toBe(1000)
  })

  it('handles very small amounts with exponential notation', () => {
    const result = cryptoAmount(0.01, 65000)
    // 0.01 / 65000 = ~1.538e-7 → should be in exponential
    expect(result).toContain('e')
  })

  it('strips trailing zeros', () => {
    const result = cryptoAmount(50000, 50000)
    // 50000 / 50000 = 1.0 → should be "1"
    expect(result).toBe('1')
  })
})

describe('getCryptoPrices', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty object for unknown crypto symbols', async () => {
    const result = await getCryptoPrices(['UNKNOWN', 'FAKE'])
    expect(result).toEqual({})
  })

  it('returns empty object on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    const result = await getCryptoPrices(['BTC'])
    expect(result).toEqual({})
    vi.unstubAllGlobals()
  })

  it('returns empty object on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    const result = await getCryptoPrices(['BTC'])
    expect(result).toEqual({})
    vi.unstubAllGlobals()
  })

  it('parses valid CoinGecko response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            bitcoin: { usd: 65000 },
            ethereum: { usd: 3500 },
          }),
      }),
    )
    const result = await getCryptoPrices(['BTC', 'ETH'])
    expect(result).toEqual({ BTC: 65000, ETH: 3500 })
    vi.unstubAllGlobals()
  })

  it('only returns requested symbols', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            bitcoin: { usd: 65000 },
            ethereum: { usd: 3500 },
            solana: { usd: 150 },
          }),
      }),
    )
    const result = await getCryptoPrices(['BTC'])
    expect(result).toEqual({ BTC: 65000 })
    expect(result).not.toHaveProperty('ETH')
    vi.unstubAllGlobals()
  })

  it('calls the correct CoinGecko URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ bitcoin: { usd: 65000 } }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await getCryptoPrices(['BTC'])

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.coingecko.com/api/v3/simple/price'),
      expect.objectContaining({ next: { revalidate: 3600 } }),
    )
    vi.unstubAllGlobals()
  })
})

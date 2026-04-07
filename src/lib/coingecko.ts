const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  USDC: 'usd-coin',
  USDT: 'tether',
  BNB: 'binancecoin',
}

interface CoinGeckoResponse {
  [id: string]: { usd: number }
}

/**
 * Fetch current USD prices for the given crypto symbols.
 * Results are cached by Next.js for 1 hour via the fetch cache.
 */
export async function getCryptoPrices(
  cryptos: string[],
): Promise<Record<string, number>> {
  const ids = cryptos
    .map((c) => COINGECKO_IDS[c])
    .filter(Boolean)
    .join(',')

  if (!ids) return {}

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { next: { revalidate: 3600 } }, // cache for 1 hour
    )

    if (!res.ok) return {}

    const data: CoinGeckoResponse = await res.json()

    const result: Record<string, number> = {}
    for (const [symbol, geckoId] of Object.entries(COINGECKO_IDS)) {
      if (data[geckoId]?.usd && cryptos.includes(symbol)) {
        result[symbol] = data[geckoId].usd
      }
    }
    return result
  } catch {
    return {}
  }
}

/**
 * Convert a USD prize amount to a crypto quantity string.
 * e.g. cryptoAmount(500, 65000) → "0.007692"
 */
export function cryptoAmount(prizeUsd: number, cryptoUsd: number): string {
  const amount = prizeUsd / cryptoUsd
  // Show up to 6 significant figures, strip trailing zeros
  return amount < 0.001
    ? amount.toExponential(4)
    : amount.toPrecision(6).replace(/\.?0+$/, '')
}

// Always use 'en-GB' so server and client produce identical strings,
// avoiding React hydration mismatches regardless of the user's browser locale.
const NUM_FMT = new Intl.NumberFormat('en-GB')
const GBP_FMT = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})
const GBP_FMT_NO_DECIMALS = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Format an integer or float: 1234567 → "1,234,567" */
export function fmtNumber(n: number): string {
  return NUM_FMT.format(n)
}

/** Format a fiat amount as British Pounds: 1234.5 → "£1,234.50" */
export function formatGBP(n: number): string {
  return GBP_FMT.format(n)
}

/**
 * Format a fiat amount as British Pounds without decimals when the value is
 * a whole number (used for headline prize displays).
 * 250000 → "£250,000", 9.99 → "£9.99"
 */
export function formatGBPCompact(n: number): string {
  return Number.isInteger(n) ? GBP_FMT_NO_DECIMALS.format(n) : GBP_FMT.format(n)
}

/**
 * Format a date in the user's locale.
 * - en: "Apr 7, 2026"
 * - fr: "7 avr. 2026"
 */
export function fmtDate(iso: string | Date, locale = 'en-GB'): string {
  const loc = locale === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.DateTimeFormat(loc, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(typeof iso === 'string' ? new Date(iso) : iso)
}

/**
 * Format a date + time in the user's locale.
 * - en: "Apr 7, 2026, 15:00"
 * - fr: "7 avr. 2026, 15:00"
 */
export function fmtDateTime(iso: string | Date, locale = 'en-GB'): string {
  const loc = locale === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.DateTimeFormat(loc, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(typeof iso === 'string' ? new Date(iso) : iso)
}

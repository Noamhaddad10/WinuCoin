// Always use 'en-US' so server and client produce identical strings,
// avoiding React hydration mismatches regardless of the user's browser locale.
const NUM_FMT = new Intl.NumberFormat('en-US')
const CURRENCY_FMT = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Format an integer or float: 1234567 → "1,234,567" */
export function fmtNumber(n: number): string {
  return NUM_FMT.format(n)
}

/** Format a dollar amount: 1234.5 → "1,234.50" */
export function fmtUSD(n: number): string {
  return CURRENCY_FMT.format(n)
}

/**
 * Format a date in the user's locale.
 * - en: "Apr 7, 2026"
 * - fr: "7 avr. 2026"
 */
export function fmtDate(iso: string | Date, locale = 'en-US'): string {
  const loc = locale === 'fr' ? 'fr-FR' : 'en-US'
  return new Intl.DateTimeFormat(loc, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(typeof iso === 'string' ? new Date(iso) : iso)
}

/**
 * Format a date + time in the user's locale.
 * - en: "Apr 7, 2026, 3:00 PM"
 * - fr: "7 avr. 2026, 15:00"
 */
export function fmtDateTime(iso: string | Date, locale = 'en-US'): string {
  const loc = locale === 'fr' ? 'fr-FR' : 'en-US'
  return new Intl.DateTimeFormat(loc, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(typeof iso === 'string' ? new Date(iso) : iso)
}

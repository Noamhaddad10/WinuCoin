'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingCart, LogIn, Loader2, AlertCircle } from 'lucide-react'
import { fmtNumber } from '@/lib/format'
import type { Competition } from '@/types'

interface PurchaseCardProps {
  competition: Competition
  locale: string
  isAuthenticated: boolean
  cryptoPrice: number | null
}

const QUICK_AMOUNTS = [1, 5, 10]

export function PurchaseCard({
  competition,
  locale,
  isAuthenticated,
  cryptoPrice,
}: PurchaseCardProps) {
  const t = useTranslations('competitions')

  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remaining = competition.max_tickets - competition.tickets_sold
  const maxQty = Math.min(remaining, 50)
  const isSoldOut = remaining <= 0
  const isEnded = competition.status !== 'active'
  const isDisabled = isSoldOut || isEnded || !isAuthenticated

  const total = (competition.ticket_price * quantity).toFixed(2)

  function handleQuantityChange(val: number) {
    setQuantity(Math.max(1, Math.min(maxQty, val)))
  }

  async function handleBuy() {
    if (isDisabled) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competition_id: competition.id,
          ticket_count: quantity,
          locale,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Could not connect. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b border-slate-100 p-5 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {t('pricePerTicket')}
        </p>
        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
          ${fmtNumber(competition.ticket_price)}
        </p>
        {!isEnded && !isSoldOut && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('ticketsRemaining', { count: remaining })}
          </p>
        )}
      </div>

      <div className="p-5">
        {isEnded ? (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 dark:bg-zinc-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('endedFull')}</p>
          </div>
        ) : isSoldOut ? (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 dark:bg-zinc-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('soldOutFull')}</p>
          </div>
        ) : (
          <>
            {/* Quantity selector */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('quantity')}
              </label>

              {/* Quick-select buttons */}
              <div className="mt-2 flex gap-2">
                {QUICK_AMOUNTS.filter((n) => n <= maxQty).map((n) => (
                  <button
                    key={n}
                    onClick={() => handleQuantityChange(n)}
                    aria-label={`${n} ticket${n > 1 ? 's' : ''}`}
                    className={[
                      'flex-1 rounded-xl border py-2 text-sm font-semibold transition-all',
                      quantity === n
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-300',
                    ].join(' ')}
                  >
                    {n}
                  </button>
                ))}
                {/* Custom input */}
                <div className="flex-1">
                  <input
                    type="number"
                    min={1}
                    max={maxQty}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    placeholder={t('enterAmount')}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 text-center text-sm font-semibold text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Price summary */}
            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-zinc-800/60">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  ${competition.ticket_price} × {quantity}
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  ${total}
                </span>
              </div>
              {cryptoPrice && (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{t('cryptoPriceLabel', { crypto: competition.crypto_type })}</span>
                  <span>${fmtNumber(cryptoPrice)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('total')}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    ${total}
                  </span>
                </div>
              </div>
            </div>

            {/* Buy / Sign-in button */}
            {isAuthenticated ? (
              <button
                onClick={handleBuy}
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {t('buyTickets')}
                  </>
                )}
              </button>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 py-3.5 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-100 dark:border-indigo-800/40 dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                <LogIn className="h-4 w-4" />
                {t('signInToBuy')}
              </Link>
            )}

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
              {t('securedByStripe')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

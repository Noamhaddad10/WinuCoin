'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Shuffle, Trophy, AlertCircle, Loader2, X } from 'lucide-react'
import { drawWinner } from '@/app/[locale]/admin/actions'
import { fmtNumber, fmtDateTime } from '@/lib/format'
import type { Competition } from '@/types'

interface Ticket {
  id: string
  ticket_number: number
  user_id: string
}

interface Props {
  competition: Competition
  tickets: Ticket[]
  existingWinner: { ticketNumber: number; userEmail: string } | null
}

const ANIM_DURATION = 3000 // ms

export function DrawWinnerClient({ competition, tickets, existingWinner }: Props) {
  const t = useTranslations('admin')
  const [winner, setWinner] = useState(existingWinner)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [highlightedTicket, setHighlightedTicket] = useState<number | null>(null)
  const [animProgress, setAnimProgress] = useState(0) // 0–100
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isEnded =
    competition.status === 'completed' || new Date(competition.end_date) <= new Date()

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  async function handleConfirmedDraw() {
    setShowConfirm(false)
    if (loading || winner || tickets.length === 0) return
    setLoading(true)
    setError('')
    setAnimProgress(0)

    const startTime = Date.now()

    // Animate tickets cycling with slowing speed
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / ANIM_DURATION, 1)
      setAnimProgress(Math.round(progress * 100))

      // Speed slows as progress increases (easing)
      const speed = Math.max(40, 80 * progress)
      const idx = Math.floor(
        (Date.now() / speed) % tickets.length
      )
      setHighlightedTicket(tickets[idx]?.ticket_number ?? null)

      if (elapsed >= ANIM_DURATION) {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }, 60)

    // Run server action in parallel
    const result = await drawWinner(competition.id)

    // Wait for animation to finish if not done yet
    const remaining = ANIM_DURATION - (Date.now() - startTime)
    if (remaining > 0) {
      await new Promise((r) => setTimeout(r, remaining))
    }

    if (intervalRef.current) clearInterval(intervalRef.current)
    setLoading(false)
    setAnimProgress(0)

    if (!result.ok) {
      setError(result.error)
      setHighlightedTicket(null)
      return
    }

    setHighlightedTicket(result.ticketNumber)
    setWinner({ ticketNumber: result.ticketNumber, userEmail: result.userEmail })
  }

  return (
    <div className="space-y-6">
      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Confirm Draw
              </h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to draw a winner for{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {competition.title}
              </strong>
              ? This action cannot be undone.
            </p>
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} in the pool.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedDraw}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
              >
                Draw Winner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competition info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
          {[
            {
              label: 'Prize',
              value: `$${fmtNumber(competition.prize_amount)} ${competition.crypto_type}`,
            },
            { label: 'Tickets sold', value: `${tickets.length} / ${competition.max_tickets}` },
            { label: 'Status', value: competition.status },
            { label: 'End date', value: fmtDateTime(competition.end_date) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3">
              <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Ticket pool */}
      {tickets.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Ticket pool ({tickets.length})
          </p>
          <div className="max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-1.5">
              {tickets.map((ticket) => {
                const isHighlighted = highlightedTicket === ticket.ticket_number
                const isWinner = winner?.ticketNumber === ticket.ticket_number
                return (
                  <span
                    key={ticket.id}
                    className={[
                      'rounded-lg px-2.5 py-1 font-mono text-xs font-bold ring-1 transition-all duration-75',
                      isWinner
                        ? 'scale-110 bg-green-500 text-white ring-green-400 shadow-md'
                        : isHighlighted
                          ? 'scale-110 bg-indigo-600 text-white ring-indigo-500 shadow-md'
                          : 'bg-slate-50 text-slate-600 ring-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:ring-zinc-700',
                    ].join(' ')}
                  >
                    #{ticket.ticket_number}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Loading animation */}
      {loading && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800/40 dark:bg-indigo-950/20">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Drawing winner… {animProgress}%
            </p>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-900">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-75 dark:bg-indigo-400"
              style={{ width: `${animProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Winner display */}
      {winner ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-800/40 dark:bg-green-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <p className="font-semibold text-green-900 dark:text-green-100">{t('winnerTitle')}</p>
          </div>
          <dl className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-green-700 dark:text-green-300">{t('winnerTicket')}</dt>
              <dd className="font-mono text-lg font-bold text-green-900 dark:text-green-100">
                #{winner.ticketNumber}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-green-700 dark:text-green-300">{t('winnerEmail')}</dt>
              <dd className="text-sm font-semibold text-green-900 dark:text-green-100">
                {winner.userEmail}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-green-600 dark:text-green-500">
            Winner email sent · Competition marked as completed
          </p>
        </div>
      ) : !loading ? (
        <>
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {!isEnded ? (
            <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">{t('notEligible')}</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">{t('noTickets')}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('drawDesc')}</p>
              <button
                onClick={() => setShowConfirm(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <Shuffle className="h-4 w-4" />
                {t('drawButton')}
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

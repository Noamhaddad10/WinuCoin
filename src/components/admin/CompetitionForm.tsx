'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, AlertCircle } from 'lucide-react'
import { createCompetition, updateCompetition } from '@/app/[locale]/admin/actions'
import type { Competition } from '@/types'

const CRYPTO_OPTIONS = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB']
const STATUS_OPTIONS = ['active', 'completed', 'cancelled'] as const

interface CompetitionFormProps {
  locale: string
  mode: 'create' | 'edit'
  competition?: Competition
}

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100 dark:placeholder-slate-500'

const labelClass = 'block text-sm font-medium text-slate-700 dark:text-slate-300'

function toDatetimeLocal(iso?: string) {
  if (!iso) return ''
  return iso.slice(0, 16)
}

export function CompetitionForm({ locale, mode, competition }: CompetitionFormProps) {
  const t = useTranslations('admin')

  const action =
    mode === 'create'
      ? createCompetition.bind(null, locale)
      : updateCompetition.bind(null, locale, competition!.id)

  const [error, formAction, isPending] = useActionState(action, '')

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-950/40">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>
          {t('fieldTitle')}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={competition?.title}
          className={`mt-1.5 ${fieldClass}`}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          {t('fieldDescription')}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={competition?.description ?? ''}
          className={`mt-1.5 ${fieldClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="prize_amount" className={labelClass}>
            {t('fieldPrizeAmount')}
          </label>
          <input
            id="prize_amount"
            name="prize_amount"
            type="number"
            min="1"
            step="0.01"
            required
            defaultValue={competition?.prize_amount}
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>

        <div>
          <label htmlFor="crypto_type" className={labelClass}>
            {t('fieldCryptoType')}
          </label>
          <select
            id="crypto_type"
            name="crypto_type"
            required
            defaultValue={competition?.crypto_type ?? 'BTC'}
            className={`mt-1.5 ${fieldClass}`}
          >
            {CRYPTO_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ticket_price" className={labelClass}>
            {t('fieldTicketPrice')}
          </label>
          <input
            id="ticket_price"
            name="ticket_price"
            type="number"
            min="0.01"
            step="0.01"
            required
            defaultValue={competition?.ticket_price}
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>

        <div>
          <label htmlFor="max_tickets" className={labelClass}>
            {t('fieldMaxTickets')}
          </label>
          <input
            id="max_tickets"
            name="max_tickets"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={competition?.max_tickets}
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>
      </div>

      <div className={mode === 'edit' ? 'grid grid-cols-2 gap-4' : ''}>
        <div>
          <label htmlFor="end_date" className={labelClass}>
            {t('fieldEndDate')}
          </label>
          <input
            id="end_date"
            name="end_date"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(competition?.end_date)}
            className={`mt-1.5 ${fieldClass}`}
          />
        </div>

        {mode === 'edit' && (
          <div>
            <label htmlFor="status" className={labelClass}>
              {t('fieldStatus')}
            </label>
            <select
              id="status"
              name="status"
              required
              defaultValue={competition?.status ?? 'active'}
              className={`mt-1.5 ${fieldClass}`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`status${s.charAt(0).toUpperCase() + s.slice(1)}` as 'statusActive')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/60">
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          value="true"
          defaultChecked={competition?.is_published ?? false}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
        />
        <label htmlFor="is_published" className={labelClass}>
          {t('fieldPublished')}
          <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
            {t('fieldPublishedHint')}
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending
            ? mode === 'create'
              ? t('creating')
              : t('updating')
            : mode === 'create'
              ? t('create')
              : t('update')}
        </button>
      </div>
    </form>
  )
}

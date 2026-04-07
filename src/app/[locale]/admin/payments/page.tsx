import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { fmtDate } from '@/lib/format'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return { title: `${t('payments')} — ${t('title')}` }
}

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string; q?: string }>
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800/40',
  completed: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/50 dark:text-green-400 dark:ring-green-800/40',
  failed: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800/40',
  refunded: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:ring-zinc-700',
}

const FILTERS = ['all', 'completed', 'pending', 'failed'] as const

export default async function AdminPaymentsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { status, q } = await searchParams
  const t = await getTranslations('admin')

  const validStatus = ['pending', 'completed', 'failed', 'refunded'].includes(status ?? '')
    ? status
    : undefined

  const admin = createAdminClient()

  let query = admin
    .from('payments')
    .select('id, amount, ticket_count, status, payment_method, created_at, users(email), competitions(title)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (validStatus) query = query.eq('status', validStatus)

  const { data: payments } = await query

  const filtered = q
    ? (payments ?? []).filter((p) => {
        const u = (p.users as unknown as { email: string }[] | null)?.[0] ?? null
        return u?.email?.toLowerCase().includes(q.toLowerCase())
      })
    : (payments ?? [])

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('allPayments')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} {validStatus ? validStatus : 'total'}
        </p>
      </div>

      {/* Filters + Search */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => {
            const isActive = f === 'all' ? !validStatus : validStatus === f
            const href = f === 'all'
              ? `/${locale}/admin/payments${q ? `?q=${q}` : ''}`
              : `/${locale}/admin/payments?status=${f}${q ? `&q=${q}` : ''}`
            return (
              <Link
                key={f}
                href={href}
                className={[
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-400',
                ].join(' ')}
              >
                {t(`filter${f.charAt(0).toUpperCase() + f.slice(1)}` as 'filterAll')}
              </Link>
            )
          })}
        </div>

        <form method="GET" action={`/${locale}/admin/payments`} className="ml-auto">
          {validStatus && <input type="hidden" name="status" value={validStatus} />}
          <input
            name="q"
            defaultValue={q}
            placeholder={t('searchPlaceholder')}
            className="w-56 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </form>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-100 px-5 py-3 dark:border-zinc-800">
          {[t('colUser'), t('colCompetition'), t('colAmount'), t('colTicketCount'), t('colStatus'), t('colDate')].map((h) => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {h}
            </span>
          ))}
        </div>

        {filtered.length > 0 ? (
          filtered.map((p) => {
            const user = (p.users as unknown as { email: string }[] | null)?.[0] ?? null
            const comp = (p.competitions as unknown as { title: string }[] | null)?.[0] ?? null
            return (
              <div
                key={p.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-slate-50 px-5 py-4 last:border-0 dark:border-zinc-800/50"
              >
                <span className="truncate text-sm text-slate-700 dark:text-slate-300">
                  {user?.email ?? '—'}
                </span>
                <span className="truncate text-sm text-slate-600 dark:text-slate-400">
                  {comp?.title ?? '—'}
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  ${p.amount?.toFixed(2)}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{p.ticket_count}</span>
                <span
                  className={[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
                    STATUS_STYLES[p.status] ?? STATUS_STYLES.pending,
                  ].join(' ')}
                >
                  {p.status}
                </span>
                <span className="text-xs text-slate-400">
                  {fmtDate(p.created_at)}
                </span>
              </div>
            )
          })
        ) : (
          <div className="flex min-h-[160px] items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noData')}</p>
          </div>
        )}
      </div>
    </>
  )
}

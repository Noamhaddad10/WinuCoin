import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus, Pencil, Shuffle, ExternalLink } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { fmtNumber, fmtDate } from '@/lib/format'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return { title: `${t('competitions')} — ${t('title')}` }
}

interface PageProps {
  params: Promise<{ locale: string }>
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/50 dark:text-green-400 dark:ring-green-800/40',
  completed: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:ring-zinc-700',
  cancelled: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800/40',
}

export default async function AdminCompetitionsPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations('admin')

  const admin = createAdminClient()
  const { data: competitions } = await admin
    .from('competitions')
    .select('id, title, prize_amount, crypto_type, ticket_price, tickets_sold, max_tickets, status, end_date, winner_drawn')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('allCompetitions')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {competitions?.length ?? 0} total
          </p>
        </div>
        <Link
          href={`/${locale}/admin/competitions/create`}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          {t('newCompetition')}
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-100 px-5 py-3 dark:border-zinc-800">
          {[t('colTitle'), t('colPrize'), t('colTicketPrice'), t('colSold'), t('colStatus'), t('colActions')].map((h) => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {h}
            </span>
          ))}
        </div>

        {competitions && competitions.length > 0 ? (
          competitions.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-slate-50 px-5 py-4 last:border-0 hover:bg-slate-50/50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {c.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {new Date(c.end_date).toLocaleDateString()}
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                ${fmtNumber(c.prize_amount)}
                <span className="ml-1 text-xs font-normal text-slate-400">{c.crypto_type}</span>
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                ${c.ticket_price}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {c.tickets_sold}/{c.max_tickets}
              </span>
              <span
                className={[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
                  STATUS_STYLES[c.status] ?? STATUS_STYLES.completed,
                ].join(' ')}
              >
                {t(`status${c.status.charAt(0).toUpperCase() + c.status.slice(1)}` as 'statusActive')}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/admin/competitions/${c.id}/edit`}
                  title={t('edit')}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-700 dark:hover:text-slate-300"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${locale}/admin/competitions/${c.id}/draw`}
                  title={t('draw')}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                >
                  <Shuffle className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${locale}/competitions/${c.id}`}
                  title={t('viewDetails')}
                  target="_blank"
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-700 dark:hover:text-slate-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="flex min-h-[160px] items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noData')}</p>
          </div>
        )}
      </div>
    </>
  )
}

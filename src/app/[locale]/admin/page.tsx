import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Users, Trophy, DollarSign, Ticket, Plus, Users2, CreditCard } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { StatsCard } from '@/components/ui/StatsCard'
import { fmtUSD, fmtDate } from '@/lib/format'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return { title: t('title') }
}

interface AdminPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin')

  const admin = createAdminClient()

  const [
    { count: competitionCount },
    { count: userCount },
    { count: ticketCount },
    { data: revenueData },
    { data: recentPayments },
  ] = await Promise.all([
    admin.from('competitions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('users').select('*', { count: 'exact', head: true }),
    admin.from('tickets').select('*', { count: 'exact', head: true }),
    admin.from('payments').select('amount').eq('status', 'completed'),
    admin
      .from('payments')
      .select('id, amount, ticket_count, status, created_at, users(email), competitions(title)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Platform overview and management
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label={t('totalUsers')}
          value={userCount ?? 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          label={t('activeCompetitions')}
          value={competitionCount ?? 0}
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatsCard
          label={t('totalRevenue')}
          value={`$${fmtUSD(totalRevenue)}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatsCard
          label={t('totalTickets')}
          value={ticketCount ?? 0}
          icon={<Ticket className="h-5 w-5" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('quickActions')}
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/admin/competitions/create`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            {t('createCompetition')}
          </Link>
          <Link
            href={`/${locale}/admin/users`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800"
          >
            <Users2 className="h-4 w-4" />
            {t('viewUsers')}
          </Link>
          <Link
            href={`/${locale}/admin/payments`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800"
          >
            <CreditCard className="h-4 w-4" />
            {t('viewPayments')}
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {t('recentActivity')}
        </h2>

        {recentPayments && recentPayments.length > 0 ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="grid grid-cols-5 border-b border-slate-100 px-5 py-3 dark:border-zinc-800">
              {['User', 'Competition', 'Amount', 'Tickets', 'Date'].map((h) => (
                <span key={h} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {h}
                </span>
              ))}
            </div>
            {recentPayments.map((p) => {
              const users = (p.users as unknown as { email: string }[] | null)?.[0] ?? null
              const competitions = (p.competitions as unknown as { title: string }[] | null)?.[0] ?? null
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-5 items-center border-b border-slate-50 px-5 py-3.5 last:border-0 dark:border-zinc-800/50"
                >
                  <span className="truncate text-sm text-slate-700 dark:text-slate-300">
                    {users?.email ?? '—'}
                  </span>
                  <span className="truncate text-sm text-slate-600 dark:text-slate-400">
                    {competitions?.title ?? '—'}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    ${p.amount?.toFixed(2)}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {p.ticket_count}
                  </span>
                  <span className="text-xs text-slate-400">
                    {fmtDate(p.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noActivity')}</p>
          </div>
        )}
      </div>
    </>
  )
}

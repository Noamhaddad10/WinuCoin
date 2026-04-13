import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Ticket, Trophy, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { fmtNumber, fmtDate } from '@/lib/format'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { StatsCard } from '@/components/ui/StatsCard'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard')
  return { title: t('title') }
}

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const t = await getTranslations('dashboard')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch or auto-create user profile
  let profile: { id: string; full_name?: string | null; role?: string | null } | null = null
  if (user) {
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('auth_id', user.id)
      .single()

    if (existingProfile) {
      profile = existingProfile
    } else {
      const { data: newProfile } = await supabase
        .from('users')
        .insert({ auth_id: user.id, email: user.email, role: 'user' })
        .select('id, full_name, role')
        .single()
      profile = newProfile
    }
  }

  const isAdmin = profile?.role === 'admin'

  // Fetch tickets using public user id (tickets.user_id FK references public.users.id)
  const [{ data: tickets }, { data: userWins }] = await Promise.all([
    user && profile
      ? supabase
          .from('tickets')
          .select('id, ticket_number, created_at, competition_id, competitions(title)')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [] }),
    user && profile
      ? supabase
          .from('winners')
          .select('id, created_at, competitions(title, prize_amount, crypto_type), tickets(ticket_number)')
          .eq('user_id', profile.id)
      : Promise.resolve({ data: [] }),
  ])

  const uniqueCompetitions = new Set(tickets?.map((t) => t.competition_id) ?? []).size

  // Set of ticket numbers belonging to winning tickets
  const winningTicketNumbers = new Set(
    (userWins ?? []).map((w) => (w.tickets as unknown as { ticket_number: number }[] | null)?.[0]?.ticket_number)
  )

  const displayName = profile?.full_name ?? user?.email ?? ''

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950">
      <Header locale={locale} isAuthenticated isAdmin={isAdmin} />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Sidebar locale={locale} isAdmin={isAdmin} />

        <main id="main-content" className="flex-1 min-w-0">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('welcomeBack')}
              {displayName && (
                <span className="text-indigo-600 dark:text-indigo-400"> {displayName.split('@')[0]}</span>
              )}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('title')}</p>
          </div>

          {/* Winning celebration banner */}
          {userWins && userWins.length > 0 && (
            <div className="mt-6 space-y-3">
              {userWins.map((win) => {
                const comp = (win.competitions as unknown as { title: string; prize_amount: number; crypto_type: string }[] | null)?.[0] ?? null
                const ticket = (win.tickets as unknown as { ticket_number: number }[] | null)?.[0] ?? null
                return (
                  <div
                    key={win.id}
                    className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-800/40 dark:from-amber-950/30 dark:to-yellow-950/20"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xl">
                      🏆
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        You won {fmtNumber(comp?.prize_amount ?? 0)} USD in {comp?.crypto_type}!
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {comp?.title} · Winning ticket{' '}
                        <span className="font-mono font-bold">#{ticket?.ticket_number}</span>
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatsCard
              label={t('activeTickets')}
              value={tickets?.length ?? 0}
              icon={<Ticket className="h-5 w-5" />}
            />
            <StatsCard
              label={t('competitionsEntered')}
              value={uniqueCompetitions}
              icon={<Trophy className="h-5 w-5" />}
            />
            <StatsCard
              label={t('prizesWon')}
              value={userWins?.length ?? 0}
              icon={<Award className="h-5 w-5" />}
            />
          </div>

          {/* Ticket history */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t('yourActivity')}
            </h2>

            {tickets && tickets.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {/* Table header */}
                <div className="grid grid-cols-3 border-b border-slate-100 px-5 py-3 dark:border-zinc-800">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t('ticketNumber')}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Competition
                  </span>
                  <span className="text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t('date')}
                  </span>
                </div>
                {/* Rows */}
                {tickets.map((ticket) => {
                  const isWinner = winningTicketNumbers.has(ticket.ticket_number)
                  return (
                  <div
                    key={ticket.id}
                    className={[
                      'grid grid-cols-3 items-center border-b border-slate-50 px-5 py-3.5 last:border-0',
                      isWinner
                        ? 'bg-amber-50/50 dark:bg-amber-950/10'
                        : 'hover:bg-slate-50/50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30',
                    ].join(' ')}
                  >
                    <span className={[
                      'font-mono text-sm font-medium',
                      isWinner
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-slate-900 dark:text-slate-100',
                    ].join(' ')}>
                      #{ticket.ticket_number}
                      {isWinner && <span className="ml-2">🏆</span>}
                    </span>
                    <Link
                      href={`/${locale}/competitions/${ticket.competition_id}`}
                      className="truncate text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {(ticket.competitions as unknown as { title: string } | null)?.title ?? 'View →'}
                    </Link>
                    <span className="text-right text-xs text-slate-400">
                      {fmtDate(ticket.created_at)}
                    </span>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60">
                  <Ticket className="h-7 w-7 text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{t('noTickets')}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('noActivity')}</p>
                </div>
                <Link
                  href={`/${locale}/competitions`}
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  {t('browseCompetitions')}
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer locale={locale} />
    </div>
  )
}

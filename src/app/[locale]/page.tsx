import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Trophy, CreditCard, Zap, ShieldCheck, BarChart3, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fmtNumber } from '@/lib/format'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CompetitionCard } from '@/components/ui/CompetitionCard'
import { PhoneMockup } from '@/components/ui/PhoneMockup'
import type { Competition } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landing')
  return { title: `WinuWallet — Win Your Wallet` }
}

interface HomePageProps {
  params: Promise<{ locale: string }>
}

function anonymizeEmail(email: string): string {
  const [local] = email.split('@')
  return `${local[0].toUpperCase()}***`
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const t = await getTranslations('landing')

  const supabase = await createClient()
  const admin = createAdminClient()

  const [
    { data: competitions },
    { data: realWinners },
    { count: totalCompetitions },
    { count: totalWinners },
    { data: completedComps },
    { count: totalTickets },
  ] = await Promise.all([
    supabase
      .from('competitions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6),
    admin
      .from('winners')
      .select('id, created_at, users(email), competitions(title, prize_amount, crypto_type), tickets(ticket_number)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('competitions').select('*', { count: 'exact', head: true }),
    admin.from('winners').select('*', { count: 'exact', head: true }),
    supabase.from('competitions').select('prize_amount').eq('winner_drawn', true),
    supabase.from('tickets').select('*', { count: 'exact', head: true }),
  ])

  const totalDistributed = completedComps?.reduce((sum, c) => sum + (c.prize_amount ?? 0), 0) ?? 0

  function fmtDistributed(n: number): string {
    if (n === 0) return '$0'
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
    return `$${n}`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
          {/* Background orbs */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-600/10 animate-float" />
            <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-600/10 animate-float-delayed" />
            <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-300/10 blur-3xl dark:bg-indigo-500/5" />
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-10">

              {/* ── Text content ──────────────────────────────────────── */}
              <div className="flex-1 pl-0 text-center lg:pl-8 lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                  {t('heroBadge')}
                </div>

                {/* Headline */}
                <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl lg:text-7xl">
                  {t('heroTitle')}{' '}
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {t('heroTitleAccent')}
                  </span>
                </h1>

                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 lg:mx-0 lg:text-xl">
                  {t('heroSubtitle')}
                </p>

                {/* CTAs */}
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                  <Link
                    href={`/${locale}/competitions`}
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
                  >
                    {t('cta')}
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex h-13 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800"
                  >
                    {t('ctaSecondary')}
                  </a>
                </div>
              </div>

              {/* ── Phone mockup ──────────────────────────────────────── */}
              <div className="shrink-0">
                <PhoneMockup />
              </div>

            </div>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <div className="border-y border-slate-100 bg-slate-50/80 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-slate-200 dark:divide-zinc-800 sm:grid-cols-4">
            {[
              { value: fmtNumber(totalCompetitions ?? 0), label: t('statsCompetitions') },
              { value: fmtNumber(totalWinners ?? 0), label: t('statsWinners') },
              { value: fmtDistributed(totalDistributed), label: t('statsDistributed') },
              { value: fmtNumber(totalTickets ?? 0), label: t('statsTickets') },
            ].map(({ value, label }) => (
              <div key={label} className="py-7 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Live Competitions ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 px-4 py-24 dark:bg-zinc-950 sm:px-6 lg:px-8">
          {/* Dot pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Dark mode: subtle gradient overlay from zinc-950 to zinc-900 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-zinc-900 dark:block"
          />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex items-end justify-between">
              <div className="relative">
                {/* Dark mode glow behind heading */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-6 -top-6 hidden h-20 w-56 rounded-full bg-indigo-500/10 blur-3xl dark:block"
                />
                <h2 className="relative text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {t('competitionsTitle')}
                </h2>
                {/* Gradient accent underline */}
                <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" />
                <p className="mt-3 text-slate-500 dark:text-slate-400">
                  {t('heroSubtitle').split('.')[0]}.
                </p>
              </div>
              <Link
                href={`/${locale}/competitions`}
                className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 sm:block"
              >
                {t('viewAll')} →
              </Link>
            </div>

            {competitions && competitions.length > 0 ? (
              <>
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {competitions.map((comp: Competition) => (
                    <div key={comp.id} className="h-full">
                      <CompetitionCard competition={comp} locale={locale} />
                    </div>
                  ))}
                </div>

                {competitions.length > 3 && (
                  <div className="mt-10 text-center">
                    <Link
                      href={`/${locale}/competitions`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-6 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-indigo-800/50 dark:bg-zinc-800/60 dark:text-indigo-400 dark:hover:border-indigo-700/60"
                    >
                      {t('viewAll')} →
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-10 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white dark:border-zinc-700/50 dark:bg-zinc-800/50">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('noCompetitions')}</p>
                <Link
                  href={`/${locale}/competitions`}
                  className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {t('viewAll')} →
                </Link>
              </div>
            )}

            <div className="mt-6 text-center sm:hidden">
              <Link
                href={`/${locale}/competitions`}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                {t('viewAll')} →
              </Link>
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="border-t border-slate-100 bg-slate-50 px-4 py-20 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {t('howItWorks')}
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">{t('howItWorksSubtitle')}</p>
            </div>

            <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3">
              {/* Connector line (desktop only) */}
              <div className="pointer-events-none absolute left-1/6 right-1/6 top-8 hidden border-t-2 border-dashed border-indigo-200 dark:border-indigo-900 sm:block" />

              {[
                {
                  step: '01',
                  Icon: Trophy,
                  title: t('step1Title'),
                  desc: t('step1Desc'),
                },
                {
                  step: '02',
                  Icon: CreditCard,
                  title: t('step2Title'),
                  desc: t('step2Desc'),
                },
                {
                  step: '03',
                  Icon: Zap,
                  title: t('step3Title'),
                  desc: t('step3Desc'),
                },
              ].map(({ step, Icon, title, desc }) => (
                <div key={step} className="relative flex flex-col items-center text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-100 dark:bg-zinc-900 dark:ring-zinc-800">
                    <Icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                      {step.slice(1)}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust Section ─────────────────────────────────────────────── */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {t('trustTitle')}
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">{t('trustSubtitle')}</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  Icon: ShieldCheck,
                  title: t('trustFair'),
                  desc: t('trustFairDesc'),
                  color: 'text-indigo-600 dark:text-indigo-400',
                  bg: 'bg-indigo-50 dark:bg-indigo-950/60',
                },
                {
                  Icon: BarChart3,
                  title: t('trustTransparent'),
                  desc: t('trustTransparentDesc'),
                  color: 'text-purple-600 dark:text-purple-400',
                  bg: 'bg-purple-50 dark:bg-purple-950/60',
                },
                {
                  Icon: Lock,
                  title: t('trustSecure'),
                  desc: t('trustSecureDesc'),
                  color: 'text-blue-600 dark:text-blue-400',
                  bg: 'bg-blue-50 dark:bg-blue-950/60',
                },
                {
                  Icon: Zap,
                  title: t('trustInstant'),
                  desc: t('trustInstantDesc'),
                  color: 'text-amber-600 dark:text-amber-400',
                  bg: 'bg-amber-50 dark:bg-amber-950/60',
                },
              ].map(({ Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Recent Winners ─────────────────────────────────────────────── */}
        <section className="border-t border-slate-100 bg-slate-50 px-4 py-20 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {t('winnersTitle')}
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">{t('winnersSubtitle')}</p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {realWinners && realWinners.length > 0 ? (
                realWinners.map((w) => {
                  const user = (w.users as unknown as { email: string }[] | null)?.[0] ?? null
                  const comp = (w.competitions as unknown as { title: string; prize_amount: number; crypto_type: string }[] | null)?.[0] ?? null
                  const ticket = (w.tickets as unknown as { ticket_number: number }[] | null)?.[0] ?? null
                  const daysAgo = Math.floor((Date.now() - new Date(w.created_at).getTime()) / 86400000)
                  return (
                    <div
                      key={w.id}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                        {user ? anonymizeEmail(user.email) : '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          ${fmtNumber(comp?.prize_amount ?? 0)} {comp?.crypto_type}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {comp?.title} · Ticket #{ticket?.ticket_number}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">
                        {daysAgo === 0 ? t('winnerToday') : t('winnerDaysAgo', { days: daysAgo })}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-3 rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('noWinnersYet')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CardCountdownTimer } from '@/components/ui/CardCountdownTimer'
import { PurchaseCard } from '@/components/competitions/PurchaseCard'
import Image from 'next/image'
import { CryptoIcon, getCryptoImageUrl } from '@/components/ui/CryptoIcons'
import { getCryptoPrices, cryptoAmount } from '@/lib/coingecko'
import { fmtNumber, fmtDateTime } from '@/lib/format'

interface CompetitionDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

const CRYPTO_BANNER: Record<string, string> = {
  BTC: 'from-amber-500 via-orange-500 to-orange-600',
  ETH: 'from-indigo-600 via-indigo-700 to-purple-700',
  SOL: 'from-violet-500 via-purple-600 to-blue-600',
  USDT: 'from-emerald-500 via-teal-500 to-teal-600',
  USDC: 'from-blue-500 via-blue-600 to-cyan-600',
  BNB: 'from-yellow-500 via-amber-500 to-orange-500',
}

const CRYPTO_GLOW: Record<string, string> = {
  BTC: 'bg-amber-500/20',
  ETH: 'bg-indigo-500/20',
  SOL: 'bg-violet-500/20',
  USDT: 'bg-emerald-500/20',
  USDC: 'bg-blue-500/20',
  BNB: 'bg-yellow-500/20',
}

export async function generateMetadata({
  params,
}: CompetitionDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('competitions').select('title').eq('id', id).single()
  return { title: data?.title ?? 'Competition' }
}

export default async function CompetitionDetailPage({
  params,
}: CompetitionDetailPageProps) {
  const { locale, id } = await params
  const t = await getTranslations('competitions')

  const supabase = await createClient()

  // Parallel fetches
  const [
    { data: competition },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase.from('competitions').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!competition) notFound()

  // Look up public user id (tickets.user_id FK references public.users.id, not auth.users.id)
  const publicUserId = user
    ? await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle()
        .then(({ data }) => data?.id ?? null)
    : null

  // Fetch crypto price, user tickets, and winner info in parallel
  const [prices, { data: userTickets }, { data: winnerData }] = await Promise.all([
    getCryptoPrices([competition.crypto_type]),
    publicUserId
      ? supabase
          .from('tickets')
          .select('ticket_number')
          .eq('competition_id', id)
          .eq('user_id', publicUserId)
          .order('ticket_number')
      : Promise.resolve({ data: [] }),
    competition.winner_drawn
      ? supabase
          .from('winners')
          .select('tickets(ticket_number), users(email)')
          .eq('competition_id', id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const cryptoPrice = prices[competition.crypto_type] ?? null
  const winnerTicket = (winnerData?.tickets as unknown as { ticket_number: number }[] | null)?.[0] ?? null
  const winnerUser = (winnerData?.users as unknown as { email: string }[] | null)?.[0] ?? null

  const isSoldOut = competition.tickets_sold >= competition.max_tickets
  const isEnded = competition.status !== 'active'
  const progress = Math.min(
    100,
    Math.round((competition.tickets_sold / competition.max_tickets) * 100),
  )

  const bannerGradient = CRYPTO_BANNER[competition.crypto_type] ?? 'from-slate-800 via-indigo-900 to-slate-900'
  const glowColor = CRYPTO_GLOW[competition.crypto_type] ?? 'bg-indigo-500/20'
  const coinImageUrl = getCryptoImageUrl(competition.crypto_type)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950">
      <Header locale={locale} isAuthenticated={!!user} />

      {/* ── Crypto-branded hero banner ─────────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${bannerGradient} px-4 pb-6 pt-4 sm:px-6 lg:px-8`}>
        {/* Subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow orbs */}
        <div className={`pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full ${glowColor} blur-3xl`} />
        <div className={`pointer-events-none absolute -top-20 right-1/3 h-48 w-48 rounded-full ${glowColor} blur-3xl`} />

        {/* Large coin image — right side decoration */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 translate-x-8 rotate-12 opacity-[0.22] sm:translate-x-4 lg:right-16 lg:translate-x-0">
          {coinImageUrl ? (
            <Image
              src={coinImageUrl}
              alt={competition.crypto_type}
              width={240}
              height={240}
              unoptimized
              className="h-48 w-48 drop-shadow-2xl sm:h-56 sm:w-56 lg:h-60 lg:w-60"
            />
          ) : (
            <CryptoIcon
              crypto={competition.crypto_type}
              className="h-48 w-48 text-white sm:h-56 sm:w-56 lg:h-60 lg:w-60"
            />
          )}
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Back link */}
          <Link
            href={`/${locale}/competitions`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </Link>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              {/* Badge row */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    isEnded || isSoldOut
                      ? 'bg-black/20 text-white/70'
                      : 'bg-white/20 text-white',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mr-1.5 h-2 w-2 rounded-full',
                      isEnded || isSoldOut ? 'bg-white/40' : 'bg-green-400 animate-status-pulse',
                    ].join(' ')}
                  />
                  {isEnded ? t('ended') : isSoldOut ? t('soldOut') : t('active')}
                </span>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                  {competition.crypto_type}
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {competition.title}
              </h1>

              {/* Prize — USD primary */}
              <div className="mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/55">
                  {t('prizeFixedLabel')}
                </p>
                <p className="mt-0.5 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl">
                  ${fmtNumber(competition.prize_amount)}
                </p>
                {cryptoPrice && (
                  <p className="mt-1 text-sm text-white/70">
                    ≈{' '}
                    <span className="font-semibold text-white">
                      {cryptoAmount(competition.prize_amount, cryptoPrice)}{' '}
                      {competition.crypto_type}
                    </span>
                    <span className="ml-1.5 text-white/45">{t('prizeApprox')}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              {/* Big countdown */}
              <div className="rounded-xl border border-white/20 bg-black/25 px-4 py-3 backdrop-blur-sm">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">{t('endsIn')}</p>
                <CardCountdownTimer endDate={competition.end_date} dark size="lg" />
              </div>
              {/* Tickets stat */}
              <div className="flex flex-col justify-center rounded-xl border border-white/20 bg-black/25 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  <Users className="mr-1 inline h-3 w-3" />
                  {t('ticketsSold')}
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {fmtNumber(competition.tickets_sold)}
                  <span className="ml-1 text-base font-normal text-white/50">/ {fmtNumber(competition.max_tickets)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/20">
              <div
                className="h-full rounded-full bg-white/70 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-white/45">
              {t('progressSold', {
                percent: progress,
                remaining: fmtNumber(competition.max_tickets - competition.tickets_sold),
              })}
              <span className="mx-2 opacity-40">·</span>
              <span className="opacity-40">{t('prizeDisclaimer')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="mt-10 flex-1 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left column: details */}
            <div className="space-y-6 lg:col-span-2">
              {/* Winner banner */}
              {competition.winner_drawn && winnerTicket && (
                <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 dark:border-amber-800/40 dark:from-amber-950/30 dark:to-yellow-950/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500">
                      <span className="text-lg">🏆</span>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        {t('winnerDrawn')}
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {t('winnerTicketLine', { number: winnerTicket.ticket_number })}
                        {winnerUser && (
                          <> · {winnerUser.email[0].toUpperCase()}***</>
                        )}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* About */}
              {competition.description && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    {t('aboutCompetition')}
                  </h2>
                  <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
                    {competition.description}
                  </p>
                </section>
              )}

              {/* Details table */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-slate-100 p-5 dark:border-zinc-800">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    {t('detailsTitle')}
                  </h2>
                </div>
                <dl className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {[
                    { label: t('detailsCrypto'), value: competition.crypto_type },
                    { label: t('pricePerTicket'), value: `$${competition.ticket_price}` },
                    { label: t('detailsMaxTickets'), value: fmtNumber(competition.max_tickets) },
                    { label: t('ticketsSold'), value: fmtNumber(competition.tickets_sold) },
                    { label: t('endsAt'), value: fmtDateTime(competition.end_date) },
                    ...(cryptoPrice
                      ? [
                          {
                            label: t('cryptoPriceLabel', { crypto: competition.crypto_type }),
                            value: `$${fmtNumber(cryptoPrice)} USD`,
                          },
                        ]
                      : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-5 py-3.5">
                      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
                      <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Rules */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t('rules')}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {t('rulesText')}
                </p>
              </section>

              {/* User's tickets for this competition */}
              {user && userTickets && userTickets.length > 0 && (
                <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800/40 dark:bg-indigo-950/20">
                  <h2 className="font-semibold text-indigo-900 dark:text-indigo-100">
                    {t('yourTickets')}
                  </h2>
                  <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
                    {userTickets.length === 1
                      ? t('youHoldTickets', { count: 1 })
                      : t('youHoldTicketsPlural', { count: userTickets.length })}{' '}
                    {t('youHoldSuffix')}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {userTickets.map((ticket) => (
                      <span
                        key={ticket.ticket_number}
                        className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-700/40"
                      >
                        #{ticket.ticket_number}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {user && userTickets && userTickets.length === 0 && !isEnded && !isSoldOut && (
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {t('noUserTickets')} — {t('enterFromCard')}
                </p>
              )}
            </div>

            {/* Right column: purchase card (sticky on desktop) */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <PurchaseCard
                competition={competition}
                locale={locale}
                isAuthenticated={!!user}
                cryptoPrice={cryptoPrice}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

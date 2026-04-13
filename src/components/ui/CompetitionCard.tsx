'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { CardCountdownTimer } from './CardCountdownTimer'
import { getCryptoImageUrl, CryptoIcon } from './CryptoIcons'
import { fmtNumber } from '@/lib/format'
import type { Competition } from '@/types'

interface CompetitionCardProps {
  competition: Competition
  locale: string
}

const CARD_GRADIENTS: Record<string, string> = {
  BTC: 'from-amber-500 via-orange-500 to-orange-600',
  ETH: 'from-indigo-600 via-indigo-700 to-purple-700',
  SOL: 'from-violet-500 via-purple-600 to-blue-600',
  USDT: 'from-emerald-500 via-teal-500 to-teal-600',
  USDC: 'from-blue-500 via-blue-600 to-cyan-600',
  BNB: 'from-yellow-500 via-amber-500 to-orange-500',
}

const CTA_GRADIENTS: Record<string, string> = {
  BTC: 'from-amber-500 to-orange-600 hover:shadow-amber-500/25',
  ETH: 'from-indigo-600 to-purple-700 hover:shadow-indigo-500/25',
  SOL: 'from-violet-500 to-blue-600 hover:shadow-violet-500/25',
  USDT: 'from-emerald-500 to-teal-600 hover:shadow-emerald-500/25',
  USDC: 'from-blue-500 to-cyan-600 hover:shadow-blue-500/25',
  BNB: 'from-yellow-500 to-orange-500 hover:shadow-yellow-500/25',
}

const PROGRESS_GRADIENTS: Record<string, string> = {
  BTC: 'from-amber-200 to-orange-200',
  ETH: 'from-indigo-200 to-purple-200',
  SOL: 'from-violet-200 to-blue-200',
  USDT: 'from-emerald-200 to-teal-200',
  USDC: 'from-blue-200 to-cyan-200',
  BNB: 'from-yellow-200 to-amber-200',
}

const DEFAULT_CARD = 'from-slate-800 via-indigo-900 to-slate-900'
const DEFAULT_CTA = 'from-indigo-600 to-purple-600 hover:shadow-indigo-500/25'
const DEFAULT_PROGRESS = 'from-indigo-200 to-purple-200'

export function CompetitionCard({ competition, locale }: CompetitionCardProps) {
  const t = useTranslations('competitions')

  const isSoldOut = competition.tickets_sold >= competition.max_tickets
  const progress = Math.min(100, Math.round((competition.tickets_sold / competition.max_tickets) * 100))
  const remaining = competition.max_tickets - competition.tickets_sold
  const isAlmostSoldOut = !isSoldOut && progress >= 80

  const cardGradient = CARD_GRADIENTS[competition.crypto_type] ?? DEFAULT_CARD
  const ctaGradient = CTA_GRADIENTS[competition.crypto_type] ?? DEFAULT_CTA
  const progressGradient = PROGRESS_GRADIENTS[competition.crypto_type] ?? DEFAULT_PROGRESS
  const imageUrl = getCryptoImageUrl(competition.crypto_type)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-700/50 dark:bg-zinc-800/50">
      {/* Crypto-branded header */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${cardGradient} p-4`}>
        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Coin image — right side decoration */}
        <div className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 rotate-12">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={competition.crypto_type}
              width={72}
              height={72}
              unoptimized
              className="h-16 w-16 opacity-20 drop-shadow-lg sm:h-[72px] sm:w-[72px]"
            />
          ) : (
            <CryptoIcon
              crypto={competition.crypto_type}
              className="h-16 w-16 text-white opacity-20"
            />
          )}
        </div>

        {/* Status + crypto badges */}
        <div className="relative flex items-center gap-1.5 flex-wrap">
          {!isSoldOut && competition.status === 'active' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-status-pulse" />
              {t('active')}
            </span>
          )}
          {isAlmostSoldOut && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
              🔥 {remaining} left
            </span>
          )}
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
            {competition.crypto_type}
          </span>
        </div>

        {/* Prize */}
        <div className="relative mt-3">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60">{t('prizePool')}</p>
          <p className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
            ${fmtNumber(competition.prize_amount)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {competition.title}
        </h3>
        <div className="mt-0.5 h-10">
          {competition.description && (
            <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {competition.description}
            </p>
          )}
        </div>

        {/* Live countdown timer */}
        <div className="mt-3">
          <CardCountdownTimer endDate={competition.end_date} />
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{competition.tickets_sold}/{competition.max_tickets}</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t('ticketPrice')}:{' '}
          <strong className="font-semibold text-slate-900 dark:text-slate-100">
            ${competition.ticket_price}
          </strong>
        </p>
      </div>

      {/* CTA */}
      <div className="mt-auto px-4 pb-4">
        <Link
          href={`/${locale}/competitions/${competition.id}`}
          aria-disabled={isSoldOut}
          tabIndex={isSoldOut ? -1 : undefined}
          className={[
            'flex w-full items-center justify-center rounded-xl py-2 text-xs font-semibold transition-all duration-200',
            isSoldOut
              ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500'
              : `bg-gradient-to-r ${ctaGradient} text-white shadow-sm hover:-translate-y-0.5 hover:shadow-lg`,
          ].join(' ')}
        >
          {isSoldOut ? t('soldOut') : t('enterNow')}
        </Link>
      </div>
    </div>
  )
}

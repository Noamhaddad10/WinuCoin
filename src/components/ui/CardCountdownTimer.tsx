'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function getTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

const SKELETON_SENTINEL = '{"_skeleton":true}'

const getServerSnapshot = () => SKELETON_SENTINEL

/** Returns a stable subscribe + getSnapshot pair that ticks every second. */
function useCountdown(endDate: string) {
  const subscribe = useCallback((cb: () => void) => {
    const id = setInterval(cb, 1_000)
    return () => clearInterval(id)
  }, [])
  const getSnapshot = useCallback(() => JSON.stringify(getTimeLeft(endDate)), [endDate])

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  if (raw === SKELETON_SENTINEL) return 'skeleton' as const
  return JSON.parse(raw) as ReturnType<typeof getTimeLeft>
}

interface Props {
  endDate: string
  /** When true, renders dark-background boxes (for use on banners). Default: false (light). */
  dark?: boolean
  /** 'sm' = compact card style. 'lg' = large prominent banner style. Default: 'sm'. */
  size?: 'sm' | 'lg'
}

export function CardCountdownTimer({ endDate, dark = false, size = 'sm' }: Props) {
  const t = useTranslations('competitions')
  const timeLeft = useCountdown(endDate)

  const isLg = size === 'lg'

  // Server render / pre-hydration → skeleton
  if (timeLeft === 'skeleton') {
    const skeletonBox = isLg
      ? `h-16 w-16 animate-pulse rounded-xl ${dark ? 'bg-white/10' : 'bg-slate-100 dark:bg-zinc-800'}`
      : `h-7 w-8 animate-pulse rounded ${dark ? 'bg-white/10' : 'bg-slate-100 dark:bg-zinc-800'}`
    const skeletonLabel = isLg
      ? `mt-1.5 h-3 w-10 animate-pulse rounded ${dark ? 'bg-white/10' : 'bg-slate-100 dark:bg-zinc-800'}`
      : `h-2.5 w-6 animate-pulse rounded ${dark ? 'bg-white/10' : 'bg-slate-100 dark:bg-zinc-800'}`
    return (
      <div className={`flex ${isLg ? 'gap-2' : 'gap-1.5'}`}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div className={skeletonBox} />
            <div className={skeletonLabel} />
          </div>
        ))}
      </div>
    )
  }

  if (!timeLeft) {
    return (
      <span className={`font-semibold ${isLg ? 'text-base' : 'text-xs'} ${dark ? 'text-white/60' : 'text-red-500 dark:text-red-400'}`}>
        {t('expired')}
      </span>
    )
  }

  const units = [
    { value: pad(timeLeft.days), label: t('countdownDays') },
    { value: pad(timeLeft.hours), label: t('countdownHours') },
    { value: pad(timeLeft.minutes), label: t('countdownMin') },
    { value: pad(timeLeft.seconds), label: t('countdownSec') },
  ]

  // Styles per size × dark combination
  const boxClass = isLg
    ? dark
      ? 'min-w-[3.75rem] rounded-xl bg-black/30 px-3 py-2 text-center font-mono text-4xl font-bold tabular-nums leading-none text-white ring-1 ring-white/10'
      : 'min-w-[3.75rem] rounded-xl bg-slate-100 px-3 py-2 text-center font-mono text-4xl font-bold tabular-nums leading-none text-slate-900 dark:bg-zinc-800 dark:text-slate-100'
    : dark
      ? 'rounded bg-black/25 px-1.5 py-1 font-mono text-sm font-bold tabular-nums text-white'
      : 'rounded bg-slate-100 px-1.5 py-1 font-mono text-sm font-bold tabular-nums text-slate-900 dark:bg-zinc-800 dark:text-slate-100'

  const labelClass = isLg
    ? dark
      ? 'mt-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/50'
      : 'mt-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-zinc-500'
    : dark
      ? 'text-[9px] font-medium uppercase tracking-wide text-white/50'
      : 'text-[9px] font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500'

  const gapClass = isLg ? 'gap-2' : 'gap-1.5'

  // Separator (colon) between units for lg size
  const showSeparator = isLg

  return (
    <div className={`flex items-start ${gapClass}`}>
      {units.map(({ value, label }, i) => (
        <div key={i} className="flex items-start">
          <div className="flex flex-col items-center">
            <span className={boxClass}>{value}</span>
            <span className={labelClass}>{label}</span>
          </div>
          {showSeparator && i < 3 && (
            <span className={`mx-0.5 mt-2 text-2xl font-bold ${dark ? 'text-white/30' : 'text-slate-300 dark:text-zinc-600'}`}>
              :
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

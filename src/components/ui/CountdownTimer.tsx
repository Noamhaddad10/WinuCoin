'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function getTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

export function CountdownTimer({ endDate }: { endDate: string }) {
  const t = useTranslations('competitions')
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(getTimeLeft(endDate))
    const id = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 1000)
    return () => clearInterval(id)
  }, [endDate])

  if (!mounted) {
    return <div className="h-6 w-32 animate-pulse rounded bg-slate-100 dark:bg-zinc-800" />
  }

  if (!timeLeft) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
        {t('expired')}
      </span>
    )
  }

  if (timeLeft.days > 0) {
    return (
      <span className="text-sm text-slate-500 dark:text-slate-400">
        <strong className="font-semibold text-slate-900 dark:text-slate-100">{timeLeft.days}</strong>{' '}
        {t('daysLeft')}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1" aria-label="Time remaining">
      {[pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map((unit, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="rounded bg-amber-50 px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
            {unit}
          </span>
          {i < 2 && <span className="text-xs text-slate-400">:</span>}
        </span>
      ))}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy, Ticket, Zap, CreditCard, CheckCircle } from 'lucide-react'
import Link from 'next/link'

/* ─── Individual screen content ─────────────────────────────────────────── */

function Screen1() {
  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-zinc-900">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      {/* Header icon */}
      <div className="mt-4 flex flex-col items-center gap-1 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-50">
          Choose a competition
        </h3>
        <p className="text-center text-[10px] leading-tight text-slate-500 dark:text-zinc-400">
          Browse live competitions and pick a crypto prize
        </p>
      </div>

      {/* Fake competition cards */}
      <div className="mt-4 flex flex-col gap-2 px-3">
        {[
          { coin: 'BTC', name: 'Bitcoin Winner', prize: '$1,000', pct: 68, ticketPrice: '$20', grad: 'from-amber-500 to-orange-500' },
          { coin: 'ETH', name: 'Ethereum Drop', prize: '$500', pct: 35, ticketPrice: '$10', grad: 'from-indigo-500 to-purple-600' },
        ].map((c) => (
          <div
            key={c.coin}
            className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className={`rounded-t-xl bg-gradient-to-r ${c.grad} px-3 py-2`}>
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[9px] font-bold text-white">
                  {c.coin}
                </span>
                <span className="text-xs font-bold text-white">{c.prize}</span>
              </div>
            </div>
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${c.grad}`}
                  style={{ width: `${c.pct}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[9px] text-slate-400">{c.pct}% sold</span>
                <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-300">
                  Ticket {c.ticketPrice}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Screen2() {
  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-zinc-900">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      {/* Header icon */}
      <div className="mt-4 flex flex-col items-center gap-1 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
          <Ticket className="h-6 w-6 text-white" />
        </div>
        <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-50">
          Buy your tickets
        </h3>
        <p className="text-center text-[10px] leading-tight text-slate-500 dark:text-zinc-400">
          Pay securely with your card via Stripe
        </p>
      </div>

      {/* Order summary */}
      <div className="mx-3 mt-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <div className="border-b border-slate-100 px-4 py-2.5 dark:border-zinc-700">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
            Order Summary
          </p>
        </div>
        <div className="px-4 py-3 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-zinc-300">Bitcoin Winner</span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">$1,000</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-slate-500 dark:text-zinc-400">Tickets</span>
            <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              × 3
            </span>
          </div>
          <div className="mt-2 border-t border-dashed border-slate-100 pt-2 dark:border-zinc-700">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-700 dark:text-zinc-200">Total</span>
              <span className="text-slate-900 dark:text-slate-50">$60.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Powered by Stripe note */}
      <div className="mx-3 mt-2 flex items-center gap-1.5">
        <CreditCard className="h-3 w-3 text-slate-400" />
        <span className="text-[9px] text-slate-400 dark:text-zinc-500">Powered by Stripe · Encrypted</span>
      </div>

      {/* Pay button */}
      <div className="mx-3 mt-3">
        <div className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25">
          Pay now →
        </div>
      </div>
    </div>
  )
}

function Screen3() {
  return (
    <div className="flex h-full flex-col items-center bg-slate-50 dark:bg-zinc-900">
      {/* Status bar */}
      <div className="flex w-full items-center justify-between px-5 pt-2 text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      {/* Celebration icon with glow pulse */}
      <div className="relative mt-6 flex flex-col items-center">
        <div className="absolute h-20 w-20 animate-ping rounded-full bg-amber-400/20" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-400/40">
          <Zap className="h-7 w-7 text-white" />
        </div>
      </div>

      <h3 className="mt-4 text-base font-extrabold text-slate-900 dark:text-slate-50">
        You won! 🎉
      </h3>
      <p className="mt-1 text-center text-[10px] leading-tight text-slate-500 dark:text-zinc-400 px-6">
        Crypto is sent to your wallet instantly
      </p>

      {/* Win card */}
      <div className="mx-3 mt-5 w-[calc(100%-1.5rem)] rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 p-4 shadow-xl shadow-orange-500/30">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-white/70">
          Congratulations!
        </p>
        <p className="mt-1 text-xl font-black text-white">0.01 BTC</p>
        <p className="text-[10px] text-white/80">Bitcoin Winner · Ticket #142</p>
        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 backdrop-blur-sm">
          <CheckCircle className="h-3 w-3 text-green-300" />
          <span className="text-[10px] font-semibold text-white">Sent to wallet</span>
          <span className="ml-auto text-[9px] text-green-300">● Confirmed</span>
        </div>
      </div>

      {/* Confetti dots decoration */}
      <div className="mt-4 flex gap-2">
        {['bg-indigo-400', 'bg-amber-400', 'bg-purple-400', 'bg-green-400', 'bg-orange-400'].map(
          (c, i) => (
            <div key={i} className={`h-2 w-2 rounded-full ${c} opacity-70`} />
          ),
        )}
      </div>
    </div>
  )
}

/* ─── Screens config ─────────────────────────────────────────────────────── */

const SCREENS = [
  { id: 0, label: 'Browse', Content: Screen1 },
  { id: 1, label: 'Buy',    Content: Screen2 },
  { id: 2, label: 'Win',    Content: Screen3 },
]

const INTERVAL_MS = 4000

/* ─── Slide variants ─────────────────────────────────────────────────────── */

function buildVariants(direction: 1 | -1) {
  return {
    enter:  { x: direction * 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit:   { x: direction * -100, opacity: 0 },
  }
}

/* ─── Phone shell ─────────────────────────────────────────────────────────── */

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mx-auto w-52 sm:w-60"
      style={{ filter: 'drop-shadow(0 32px 48px rgba(0,0,0,0.25))' }}
    >
      {/* Outer bezel */}
      <div className="relative rounded-[2.8rem] border-4 border-zinc-800 bg-zinc-900 p-2 dark:border-zinc-700">
        {/* Side buttons (decorative) */}
        <div className="pointer-events-none absolute -right-2 top-24 h-14 w-1 rounded-r-full bg-zinc-700" />
        <div className="pointer-events-none absolute -left-2 top-20 h-10 w-1 rounded-l-full bg-zinc-700" />
        <div className="pointer-events-none absolute -left-2 top-34 h-10 w-1 rounded-l-full bg-zinc-700" />

        {/* Screen area */}
        <div className="relative overflow-hidden rounded-[2.2rem] bg-slate-50 dark:bg-zinc-900" style={{ height: 420 }}>
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
            <div className="h-5 w-24 rounded-b-2xl bg-zinc-900" />
          </div>

          {/* Scrolling screen content */}
          <div className="relative h-full w-full overflow-hidden pt-3">
            {children}
          </div>

          {/* Home bar */}
          <div className="absolute bottom-2 left-1/2 z-20 h-1 w-20 -translate-x-1/2 rounded-full bg-zinc-400/60 dark:bg-zinc-600" />
        </div>
      </div>
    </div>
  )
}

/* ─── Main exported component ────────────────────────────────────────────── */

export function PhoneMockup({ locale }: { locale: string }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = (idx: number) => {
    if (idx === current) return
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }

  const advance = () => {
    setDirection(1)
    setCurrent((c) => (c + 1) % SCREENS.length)
  }

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(advance, INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused])

  const { Content } = SCREENS[current]

  const variants = buildVariants(direction)

  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 dark:bg-zinc-950 sm:px-6 lg:px-8">
      {/* Background gradient blob */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-indigo-400/8 blur-3xl dark:bg-indigo-600/8" />
        <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/4 translate-y-1/4 rounded-full bg-purple-400/8 blur-3xl dark:bg-purple-600/8" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-20">

          {/* ── Left: copy + CTA ──────────────────────────────────────── */}
          <div className="flex-1 text-center lg:text-left">
            {/* Label pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/50 dark:text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              How it works
            </div>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
              Your wallet,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                filled with crypto
              </span>
            </h2>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Browse competitions, grab your tickets in seconds, and watch crypto land in your wallet — all from your phone.
            </p>

            {/* Step indicators */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:flex-col lg:justify-start">
              {SCREENS.map(({ id, label }, i) => {
                const descriptions = [
                  'Pick a live competition with a crypto prize',
                  'Pay securely with your card via Stripe',
                  'Crypto sent instantly to your wallet',
                ]
                return (
                  <button
                    key={id}
                    onClick={() => goTo(i)}
                    className={[
                      'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200',
                      current === i
                        ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/40'
                        : 'border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-900',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                        current === i
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                          : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400',
                      ].join(' ')}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p
                        className={[
                          'text-sm font-semibold',
                          current === i
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-slate-700 dark:text-slate-300',
                        ].join(' ')}
                      >
                        {label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{descriptions[i]}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 flex justify-center gap-3 lg:justify-start">
              <Link
                href={`/${locale}/competitions`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
              >
                Browse competitions →
              </Link>
            </div>
          </div>

          {/* ── Right: phone mockup ────────────────────────────────────── */}
          <div
            className="shrink-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <PhoneShell>
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0"
                >
                  <Content />
                </motion.div>
              </AnimatePresence>
            </PhoneShell>

            {/* Progress dots */}
            <div className="mt-5 flex items-center justify-center gap-2">
              {SCREENS.map(({ id }, i) => (
                <button
                  key={id}
                  onClick={() => goTo(i)}
                  aria-label={`Go to screen ${i + 1}`}
                  className={[
                    'h-2 rounded-full transition-all duration-300',
                    current === i
                      ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                      : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-zinc-600 dark:hover:bg-zinc-500',
                  ].join(' ')}
                />
              ))}
            </div>

            {/* Auto-play progress bar */}
            {!paused && (
              <div className="mx-auto mt-2 h-0.5 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                <motion.div
                  key={`progress-${current}`}
                  className="h-full rounded-full bg-indigo-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

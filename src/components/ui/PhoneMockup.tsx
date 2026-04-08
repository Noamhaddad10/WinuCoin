'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, ArrowLeft, Minus, Plus, Lock, Check } from 'lucide-react'
import confetti from 'canvas-confetti'

const SCREEN_DURATION = 5000

/* ─── Stagger helper ─────────────────────────────────────────────────────── */
const sg = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: {
    delay: 0.06 + i * 0.11,
    duration: 0.32,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
})

/* ─── Screen 1 — Browse competitions ────────────────────────────────────── */
function Screen1() {
  const cards = [
    {
      symbol: '₿',
      bg: 'bg-orange-500',
      name: 'Win 1 BTC',
      prize: '$60,000',
      sold: 45,
      total: 100,
      price: '$50',
    },
    {
      symbol: 'Ξ',
      bg: 'bg-indigo-500',
      name: 'Win 0.5 ETH',
      prize: '$1,800',
      sold: 23,
      total: 80,
      price: '$25',
    },
  ]

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      {/* Status bar */}
      <StatusBar />

      {/* Header */}
      <motion.div {...sg(0)} className="flex items-center justify-between px-4 pb-3">
        <span className="text-base font-bold text-slate-900 dark:text-white">Competitions</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
          <Search className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
        </div>
      </motion.div>

      {/* Cards */}
      <div className="flex flex-col gap-3 px-3">
        {cards.map((card, i) => {
          const pct = Math.round((card.sold / card.total) * 100)
          return (
            <motion.div
              key={card.symbol}
              {...sg(i + 1)}
              className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-start gap-3 p-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.bg} font-black text-white shadow-sm`}
                >
                  {card.symbol}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {card.name}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-green-500">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                      LIVE
                    </span>
                  </div>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    {card.prize}
                  </span>
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[9px] text-slate-400">
                      <span>
                        {card.sold}/{card.total} tickets
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-zinc-300">
                        {card.price}/ticket
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-2 text-xs font-bold text-white">
                Enter Now →
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Screen 2 — Purchase tickets ───────────────────────────────────────── */
function Screen2() {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      <StatusBar />

      {/* Back header */}
      <motion.div {...sg(0)} className="flex items-center gap-2 px-4 pb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800">
          <ArrowLeft className="h-3.5 w-3.5 text-slate-600 dark:text-zinc-300" />
        </div>
        <span className="text-base font-bold text-slate-900 dark:text-white">Purchase tickets</span>
      </motion.div>

      <div className="flex flex-col gap-2 px-3">
        {/* Competition */}
        <motion.div
          {...sg(1)}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 font-black text-white">
            ₿
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Win 1 BTC</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Prize pool: $60,000</p>
          </div>
        </motion.div>

        {/* Ticket price */}
        <motion.div
          {...sg(2)}
          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/60"
        >
          <span className="text-sm text-slate-600 dark:text-zinc-300">Ticket price</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">$50</span>
        </motion.div>

        {/* Quantity */}
        <motion.div
          {...sg(3)}
          className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/60"
        >
          <span className="text-sm text-slate-600 dark:text-zinc-300">Quantity</span>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-700">
              <Minus className="h-3 w-3 text-slate-500" />
            </div>
            <span className="w-4 text-center text-sm font-bold text-slate-900 dark:text-white">
              2
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60">
              <Plus className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </motion.div>

        {/* Total */}
        <motion.div
          {...sg(4)}
          className="flex items-center justify-between border-t border-slate-100 px-1 pt-3 dark:border-zinc-700"
        >
          <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Total</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">$100</span>
        </motion.div>

        {/* Pay button */}
        <motion.button
          {...sg(5)}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30"
        >
          <Lock className="h-4 w-4" />
          Pay with Stripe
        </motion.button>

        {/* Card logos */}
        <motion.div {...sg(6)} className="flex items-center justify-center gap-2">
          {['VISA', 'Mastercard', 'PayPal'].map((brand) => (
            <span
              key={brand}
              className="rounded border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-400 dark:border-zinc-600 dark:text-zinc-500"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Screen 3 — Win! ────────────────────────────────────────────────────── */
function Screen3() {
  return (
    <div className="flex h-full flex-col items-center bg-white dark:bg-zinc-900">
      <StatusBar />

      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 14 }}
        className="relative mt-4 flex h-20 w-20 items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatDelay: 1.5 }}
          className="absolute h-20 w-20 rounded-full bg-green-400/20"
        />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 shadow-xl shadow-green-400/40">
          <motion.svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            />
          </motion.svg>
        </div>
      </motion.div>

      {/* Congratulations */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white"
      >
        Congratulations!
      </motion.p>

      {/* Amount with glow pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.52, type: 'spring', stiffness: 160 }}
        className="mt-2 text-center"
      >
        <motion.p
          animate={{
            textShadow: [
              '0 0 0px rgba(99,102,241,0)',
              '0 0 24px rgba(99,102,241,0.7)',
              '0 0 0px rgba(99,102,241,0)',
            ],
          }}
          transition={{ delay: 1, duration: 1.8, repeat: Infinity, repeatDelay: 0.8 }}
          className="text-3xl font-black text-slate-900 dark:text-white"
        >
          You won 1 BTC
        </motion.p>
        <p className="text-sm text-slate-400 dark:text-zinc-400">≈ $60,000</p>
      </motion.div>

      {/* Sent badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.68 }}
        className="mt-4 flex items-center gap-2 rounded-full bg-green-50 px-5 py-2 dark:bg-green-950/40"
      >
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
          Sent to your wallet ✓
        </span>
      </motion.div>

      {/* Transaction hash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.82 }}
        className="mx-3 mt-5 w-[calc(100%-1.5rem)] rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Transaction hash
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-600 dark:text-zinc-300">
          0x7f3a9b2c4e1d5678...8b2c
        </p>
      </motion.div>
    </div>
  )
}

/* ─── Shared status bar ──────────────────────────────────────────────────── */
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 py-2 text-[10px] font-semibold text-zinc-400">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span>▲▲▲</span>
        <span>WiFi</span>
        <span>100%</span>
      </span>
    </div>
  )
}

/* ─── Slide variants ─────────────────────────────────────────────────────── */
const slideVariants = {
  enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (d: number) => ({ x: `${d * -100}%`, opacity: 0 }),
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function PhoneMockup() {
  const [screen, setScreen] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  // 1.6 on desktop, 1.3 on mobile
  const [maxScale, setMaxScale] = useState(1.6)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const confettiInstanceRef = useRef<any>(null)

  /* responsive max zoom */
  useEffect(() => {
    const check = () => setMaxScale(window.innerWidth < 640 ? 1.3 : 1.6)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* initialise confetti bound to the fixed canvas once */
  useEffect(() => {
    if (!confettiCanvasRef.current) return
    confettiInstanceRef.current = confetti.create(confettiCanvasRef.current, {
      resize: true,
      useWorker: false,
    })
    return () => confettiInstanceRef.current?.reset()
  }, [])

  /* auto-advance */
  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1)
      setScreen((s) => (s + 1) % 3)
    }, SCREEN_DURATION)
    return () => clearInterval(t)
  }, [])

  /* confetti burst when screen 3 appears */
  useEffect(() => {
    if (screen !== 2) return
    if (!confettiInstanceRef.current || !phoneRef.current) return

    const fire = confettiInstanceRef.current
    const rect = phoneRef.current.getBoundingClientRect()
    const ox = (rect.left + rect.width / 2) / window.innerWidth
    const oy = (rect.top + rect.height / 2) / window.innerHeight

    const t1 = setTimeout(() => {
      fire({
        particleCount: 110,
        spread: 95,
        origin: { x: ox, y: oy },
        colors: ['#fbbf24', '#a78bfa', '#34d399', '#ffffff', '#f59e0b'],
        startVelocity: 48,
        gravity: 0.9,
        ticks: 220,
        zIndex: 9999,
      })
    }, 300)

    const t2 = setTimeout(() => {
      fire({
        particleCount: 65,
        spread: 135,
        origin: { x: ox, y: oy },
        colors: ['#6366f1', '#ec4899', '#10b981', '#fbbf24'],
        startVelocity: 34,
        gravity: 0.8,
        ticks: 180,
        zIndex: 9999,
      })
    }, 580)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [screen])

  const SCREENS = [Screen1, Screen2, Screen3]
  const CurrentScreen = SCREENS[screen]

  // screen 0  → zoomed + clipped
  // screen 1+ → full phone visible (overflow visible for confetti + shadows)
  const isZoomed = screen === 0

  return (
    <div className="relative">
      {/* Fixed full-viewport confetti canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="pointer-events-none fixed inset-0 z-[9999]"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* ── Clip container ─────────────────────────────────────────────
          Fixed 290 × 600 box. overflow:hidden while zoomed (screen 0)
          so we only see the cropped upper area of the zoomed phone.
          overflow:visible on screens 1-2 to show full frame + glow. */}
      <div
        style={{
          width: 290,
          height: 600,
          position: 'relative',
          overflow: isZoomed ? 'hidden' : 'visible',
        }}
      >
        {/* ── Scale motion div ─────────────────────────────────────────
            Zoomed-in on screen 0 (cinematic close-up), full on 1 & 2.
            transformOrigin at 50% 38% keeps the header area centred. */}
        <motion.div
          animate={{ scale: isZoomed ? maxScale : 1 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: '50% 38%', width: 290 }}
        >
          {/* ── 3D tilt — showcase / Apple-style presentation ────────── */}
          <div
            ref={phoneRef}
            className="relative"
            style={{
              transform:
                'perspective(1200px) rotateY(-15deg) rotateX(5deg) rotateZ(-2deg)',
            }}
          >
            {/* Phone frame */}
            <div
              className="relative rounded-[44px] border-[5px] border-zinc-800 bg-zinc-900 p-[5px] dark:border-zinc-600"
              style={{
                width: 290,
                // Shadow offset towards right/bottom to match the tilt direction
                boxShadow:
                  '22px 52px 80px rgba(0,0,0,0.45), 10px 22px 40px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.05) inset',
              }}
            >
              {/* Side volume buttons */}
              <div className="pointer-events-none absolute -left-[7px] top-[100px] h-7 w-[5px] rounded-l-full bg-zinc-700" />
              <div className="pointer-events-none absolute -left-[7px] top-[140px] h-12 w-[5px] rounded-l-full bg-zinc-700" />
              <div className="pointer-events-none absolute -left-[7px] top-[196px] h-12 w-[5px] rounded-l-full bg-zinc-700" />
              {/* Power button */}
              <div className="pointer-events-none absolute -right-[7px] top-[130px] h-16 w-[5px] rounded-r-full bg-zinc-700" />

              {/* Screen area */}
              <div
                className="relative overflow-hidden rounded-[38px] bg-white dark:bg-zinc-900"
                style={{ height: 580 }}
              >
                {/* Notch */}
                <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
                  <div className="h-6 w-28 rounded-b-[18px] bg-zinc-900" />
                </div>

                {/* Animated screens */}
                <div className="relative h-full overflow-hidden pt-6">
                  <AnimatePresence initial={false} mode="wait" custom={direction}>
                    <motion.div
                      key={screen}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
                      className="absolute inset-0 pt-6"
                    >
                      <CurrentScreen />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 z-20 h-[3px] w-24 -translate-x-1/2 rounded-full bg-zinc-400/50 dark:bg-zinc-600/70" />
              </div>
            </div>

            {/* Ambient glow — offset right to follow the tilt */}
            <div className="pointer-events-none absolute -bottom-10 left-[60%] h-24 w-56 -translate-x-1/2 rounded-full bg-indigo-500/25 blur-2xl dark:bg-indigo-600/35" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

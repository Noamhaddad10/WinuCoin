'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
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

/* ─── Status bar — realistic iOS-style with SVG icons ────────────────────── */
function StatusBar() {
  return (
    <div
      className="relative z-10 flex items-center justify-between px-5 text-slate-900 dark:text-white"
      style={{ paddingTop: 16, paddingBottom: 6 }}
    >
      {/* Time (left side — beside Dynamic Island) */}
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '-0.3px' }}>9:41</span>

      {/* Icons (right side — beside Dynamic Island) */}
      <div className="flex items-center gap-[5px]">
        {/* Signal bars */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.7" fill="currentColor" />
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.7" fill="currentColor" />
          <rect x="9" y="3" width="3" height="9" rx="0.7" fill="currentColor" />
          <rect x="13.5" y="0" width="2.5" height="12" rx="0.7" fill="currentColor" fillOpacity={0.28} />
        </svg>

        {/* WiFi arcs */}
        <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
          <circle cx="7.5" cy="10.8" r="1.3" fill="currentColor" />
          <path
            d="M4.6 8.1C5.4 7.3 6.4 6.8 7.5 6.8s2.1.5 2.9 1.3"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M1.8 5.3C3.4 3.7 5.3 2.8 7.5 2.8s4.1.9 5.7 2.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>

        {/* Battery — 80% charge */}
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <rect x="0.5" y="0.5" width="19" height="11" rx="2.5" stroke="currentColor" strokeWidth="1" />
          <rect x="2" y="2" width="14.4" height="8" rx="1.5" fill="currentColor" />
          <path d="M21 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

/* ─── Slide variants ─────────────────────────────────────────────────────── */
const slideVariants = {
  enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (d: number) => ({ x: `${d * -100}%`, opacity: 0 }),
}

/* ─── Metallic button strip (reused for all 4 physical buttons) ──────────── */
function PhysicalBtn({
  style,
}: {
  style: React.CSSProperties
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        background:
          'linear-gradient(to right, #3c3c4e 0%, #7a7a8c 40%, #6a6a7c 70%, #4a4a5c 100%)',
        ...style,
      }}
    />
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function PhoneMockup() {
  const [screen, setScreen] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const phoneControls = useAnimation()
  const glowControls = useAnimation()
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const confettiInstanceRef = useRef<any>(null)

  /* ── One-time rise animation — only on first mount ───────────────────── */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const mobile = window.innerWidth < 640
    const startRX = mobile ? 50 : 70
    const startTY = mobile ? 30 : 60

    // Snap instantly to "phone lying flat" position + glow visible
    phoneControls.set({
      rotateX: startRX,
      rotateY: -30,
      rotateZ: -5,
      y: startTY,
    })
    glowControls.set({ opacity: 1 })

    // Next frame: begin the rise
    requestAnimationFrame(() => {
      phoneControls.start({
        rotateX: 15,
        rotateY: -25,
        rotateZ: -3,
        y: 0,
        transition: { duration: 3, ease: [0.16, 1, 0.3, 1] },
      })
      glowControls.start({
        opacity: 0,
        transition: { duration: 2.5, ease: [0.4, 0, 0.2, 1] },
      })
    })
  }, []) // empty deps → runs once, never again on screen changes

  /* ── Confetti instance (init once) ──────────────────────────────────── */
  useEffect(() => {
    if (!confettiCanvasRef.current) return
    confettiInstanceRef.current = confetti.create(confettiCanvasRef.current, {
      resize: true,
      useWorker: false,
    })
    return () => confettiInstanceRef.current?.reset()
  }, [])

  /* ── Auto-advance screens ────────────────────────────────────────────── */
  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1)
      setScreen((s) => (s + 1) % 3)
    }, SCREEN_DURATION)
    return () => clearInterval(t)
  }, [])

  /* ── Confetti burst when screen 3 appears ───────────────────────────── */
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

  return (
    <div className="relative">
      {/* Fixed full-viewport confetti canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="pointer-events-none fixed inset-0 z-[9999]"
        style={{ width: '100vw', height: '100vh' }}
      />

      {/* ── Perspective parent (1000px gives natural-looking 3D) ────────── */}
      <div style={{ perspective: '1000px' }}>

        {/* ── Phone — animated rise on mount, then static ─────────────── */}
        <motion.div
          ref={phoneRef}
          animate={phoneControls}
          className="relative"
          style={{ width: 290 }}
        >
          {/* Screen glow — simulates lying-flat screen light, fades on rise */}
          <motion.div
            animate={glowControls}
            className="pointer-events-none absolute -inset-6 rounded-[60px]"
            style={{
              boxShadow: '0 0 80px 20px rgba(139, 92, 246, 0.35)',
              filter: 'blur(6px)',
            }}
          />

          {/* ── iPhone 15 Pro style chassis ─────────────────────────────── */}
          <div
            style={{
              width: 290,
              borderRadius: 44,
              padding: 3,
              // Titanium metallic gradient — works in light + dark
              background:
                'linear-gradient(155deg, #5c5c6e 0%, #8e8ea0 18%, #c2c2d4 38%, #9a9aac 55%, #6a6a7c 75%, #46465a 100%)',
              // Soft depth shadows (bottom-right, matches rotateY(-25deg) tilt)
              // + solid metallic layers simulating the visible right face of the phone body
              boxShadow: [
                // Ambient / depth shadows
                '3px 5px 12px rgba(0,0,0,0.18)',
                '8px 16px 32px rgba(0,0,0,0.13)',
                '18px 36px 64px rgba(0,0,0,0.09)',
                // Solid edge layers — right face coming toward viewer (rotateY(-25deg))
                // Each layer is 1px blur so it stays crisp and looks like a real edge face
                '5px 3px 1px #3e3e52',
                '9px 5px 1px #2e2e44',
                '13px 7px 1px #20202e',
                // Frame gloss lines
                'inset 0 1px 0 rgba(255,255,255,0.16)',
                'inset 0 -1px 0 rgba(0,0,0,0.22)',
              ].join(', '),
            }}
          >
            {/* Dark hairline gap between chassis and glass */}
            <div
              style={{
                borderRadius: 41,
                background: '#080808',
                padding: 2,
              }}
            >
              {/* ── Screen glass ─────────────────────────────────────────── */}
              <div
                className="relative overflow-hidden bg-white dark:bg-zinc-900"
                style={{ borderRadius: 39, height: 580 }}
              >
                {/* Glass diagonal reflection */}
                <div
                  className="pointer-events-none absolute inset-0 z-30"
                  style={{
                    borderRadius: 39,
                    background:
                      'linear-gradient(138deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.04) 45%, transparent 68%)',
                  }}
                />

                {/* Dynamic Island pill */}
                <div
                  className="absolute z-20 flex items-center justify-end"
                  style={{
                    left: '50%',
                    top: 11,
                    transform: 'translateX(-50%)',
                    width: 92,
                    height: 26,
                    borderRadius: 999,
                    background: '#000',
                    paddingRight: 11,
                  }}
                >
                  {/* Front camera dot */}
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#1c1c1c',
                    }}
                  />
                </div>

                {/* Animated screen content */}
                <div className="relative h-full overflow-hidden">
                  <AnimatePresence initial={false} mode="wait" custom={direction}>
                    <motion.div
                      key={screen}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
                      className="absolute inset-0"
                    >
                      <CurrentScreen />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Home bar (iOS-style pill) */}
                <div
                  className="absolute bottom-[7px] left-1/2 z-20 -translate-x-1/2 rounded-full"
                  style={{
                    width: 112,
                    height: 4,
                    background: 'rgba(0,0,0,0.22)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Physical buttons ─────────────────────────────────────────── */}
          {/* Mute / silent switch (left, top) */}
          <PhysicalBtn
            style={{
              left: -3,
              top: 84,
              width: 3,
              height: 20,
              borderRadius: '2px 0 0 2px',
            }}
          />
          {/* Volume up (left) */}
          <PhysicalBtn
            style={{
              left: -3,
              top: 120,
              width: 3,
              height: 32,
              borderRadius: '2px 0 0 2px',
            }}
          />
          {/* Volume down (left) */}
          <PhysicalBtn
            style={{
              left: -3,
              top: 164,
              width: 3,
              height: 32,
              borderRadius: '2px 0 0 2px',
            }}
          />
          {/* Power button (right) */}
          <PhysicalBtn
            style={{
              right: -3,
              top: 128,
              width: 3,
              height: 42,
              borderRadius: '0 2px 2px 0',
              background:
                'linear-gradient(to left, #3c3c4e 0%, #7a7a8c 40%, #6a6a7c 70%, #4a4a5c 100%)',
            }}
          />

          {/* Ambient glow — offset right to follow tilt direction */}
          <div
            className="pointer-events-none absolute rounded-full bg-indigo-500/20 blur-2xl dark:bg-indigo-600/30"
            style={{
              bottom: -44,
              left: '62%',
              transform: 'translateX(-50%)',
              width: 220,
              height: 88,
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

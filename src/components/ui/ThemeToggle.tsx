'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const SUNSET_GRADIENT =
  'linear-gradient(180deg, #87CEEB 0%, #FFB347 22%, #FF7043 42%, #AD1457 62%, #6A1B9A 78%, #120828 100%)'
const SUNRISE_GRADIENT =
  'linear-gradient(180deg, #120828 0%, #6A1B9A 22%, #AD1457 42%, #FF7043 62%, #FFB347 78%, #87CEEB 100%)'

const STARS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  top: `${8 + Math.floor((i * 37) % 45)}%`,
  left: `${5 + Math.floor((i * 53 + 11) % 88)}%`,
  size: i % 3 === 0 ? 3 : 2,
}))

const LS_KEY = 'themeAnimationEnabled'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const themeChangedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
    // Read cached setting from localStorage first (fast, avoids flash)
    const cached = localStorage.getItem(LS_KEY)
    if (cached !== null) {
      setAnimationEnabled(cached === 'true')
    }
    // Then fetch from API to get the authoritative value
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        const enabled = data.enabled ?? true
        setAnimationEnabled(enabled)
        localStorage.setItem(LS_KEY, String(enabled))
      })
      .catch(() => {/* keep cached value */})
  }, [])

  if (!mounted) return <ToggleSkeleton />

  const isDark = resolvedTheme === 'dark'
  const duration = typeof window !== 'undefined' && window.innerWidth < 640 ? 0.8 : 1.2

  function handleToggle() {
    if (animating) return

    if (!animationEnabled) {
      setTheme(isDark ? 'light' : 'dark')
      return
    }

    setAnimating(true)
    setOverlayVisible(true)
    themeChangedRef.current = false

    // Change theme at 55% of the duration
    const themeDelay = duration * 0.55 * 1000
    setTimeout(() => {
      setTheme(isDark ? 'light' : 'dark')
      themeChangedRef.current = true
    }, themeDelay)
  }

  function handleAnimationComplete() {
    // Wait a tiny bit so the new theme's colors are visible before removing overlay
    setTimeout(() => {
      setOverlayVisible(false)
      setAnimating(false)
    }, 80)
  }

  const isSunset = isDark === false // going dark → sunset
  // isDark=true means current theme is dark → toggling to light → sunrise
  // isDark=false means current theme is light → toggling to dark → sunset
  const animationType = isDark ? 'sunrise' : 'sunset'

  return (
    <>
      {/* Animated overlay */}
      <AnimatePresence>
        {overlayVisible && (
          <motion.div
            key="theme-overlay"
            className="fixed inset-0 z-[35] pointer-events-none"
            style={{
              background: animationType === 'sunset' ? SUNSET_GRADIENT : SUNRISE_GRADIENT,
            }}
            initial={animationType === 'sunset' ? { y: '-100%' } : { y: '100%' }}
            animate={{ y: '0%' }}
            exit={animationType === 'sunset' ? { y: '100%' } : { y: '-100%' }}
            transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={handleAnimationComplete}
          >
            {/* Stars — appear only for sunset (going into dark) */}
            {animationType === 'sunset' &&
              STARS.map((star) => (
                <motion.div
                  key={star.id}
                  className="absolute rounded-full bg-white"
                  style={{ top: star.top, left: star.left, width: star.size, height: star.size }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0, 1] }}
                  transition={{ duration, ease: 'easeIn', times: [0, 0.65, 1] }}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={handleToggle}
        disabled={animating}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <SunIcon />
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <MoonIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </>
  )
}

function ToggleSkeleton() {
  return <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" />
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

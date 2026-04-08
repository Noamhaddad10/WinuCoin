'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Sun, Moon, Home } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-9 w-9" />

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-200"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}

interface HeaderProps {
  locale: string
  isAuthenticated?: boolean
  isAdmin?: boolean
}

export function Header({ locale, isAuthenticated: initialAuth, isAdmin: initialAdmin }: HeaderProps) {
  const t = useTranslations()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAdminUser, setIsAdminUser] = useState(initialAdmin ?? false)
  const [authReady, setAuthReady] = useState(false)

  const otherLocale = locale === 'en' ? 'fr' : 'en'
  const localeSwitcherHref = `/${otherLocale}${pathname.replace(/^\/(en|fr)/, '')}`

  useEffect(() => {
    const supabase = createClient()

    async function fetchRole(authUser: User) {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', authUser.id)
        .single()
      setIsAdminUser(data?.role === 'admin')
    }

    // Get initial session
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u)
      if (u) fetchRole(u)
      setAuthReady(true)
    })

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchRole(u)
      } else {
        setIsAdminUser(false)
      }
      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Use server props until client auth is resolved (avoids flash)
  const isAuthenticated = authReady ? !!user : (initialAuth ?? false)
  const isAdmin = authReady ? isAdminUser : (initialAdmin ?? false)

  const navLinks = [
    { label: t('nav.competitions'), href: `/${locale}/competitions` },
    { label: t('nav.howItWorks'), href: `/${locale}#how-it-works` },
  ]

  const navLinkClass =
    'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-100'

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-sm">
              <span className="text-xs font-black text-white">W</span>
            </div>
            <span className="text-base">WinuWallet</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 sm:flex">
            <Link
              href={`/${locale}`}
              title={t('nav.home')}
              aria-label={t('nav.home')}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-200"
            >
              <Home className="h-4 w-4" />
            </Link>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link href={`/${locale}/dashboard`} className={navLinkClass}>
                {t('nav.dashboard')}
              </Link>
            )}
            {isAdmin && (
              <Link href={`/${locale}/admin`} className={navLinkClass}>
                {t('nav.admin')}
              </Link>
            )}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <Link
              href={localeSwitcherHref}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-200"
            >
              {otherLocale.toUpperCase()}
            </Link>
            <ThemeToggle />
            {isAuthenticated ? (
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800"
                >
                  {t('nav.logout')}
                </button>
              </form>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-indigo-500/20"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800 sm:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-white shadow-2xl dark:bg-zinc-950">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-800">
              <Link
                href={`/${locale}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-purple-600">
                  <span className="text-xs font-black text-white">W</span>
                </div>
                WinuWallet
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex flex-col gap-1 p-4">
              <Link
                href={`/${locale}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-zinc-900"
              >
                <Home className="h-4 w-4 shrink-0" />
                {t('nav.home')}
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href={`/${locale}/dashboard`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  {t('nav.dashboard')}
                </Link>
              )}
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  {t('nav.admin')}
                </Link>
              )}
            </nav>

            {/* Drawer footer */}
            <div className="mt-auto border-t border-slate-100 p-4 dark:border-zinc-800">
              <div className="mb-3 flex items-center gap-2">
                <ThemeToggle />
                <Link
                  href={localeSwitcherHref}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
                >
                  {otherLocale.toUpperCase()}
                </Link>
              </div>
              {isAuthenticated ? (
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-900"
                  >
                    {t('nav.logout')}
                  </button>
                </form>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm font-semibold text-white"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { Shield, Mail, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth')
  return { title: t('signIn') }
}

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params
  const t = await getTranslations('auth')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect(`/${locale}`)

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 px-4 dark:from-zinc-950 dark:via-indigo-950/10 dark:to-zinc-950">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-indigo-300/15 blur-3xl dark:bg-indigo-600/8" />
        <div className="animate-float-delayed absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-purple-300/15 blur-3xl dark:bg-purple-600/8" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
            <span className="text-2xl font-black text-white">W</span>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">WinuWallet</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-8 shadow-xl shadow-slate-200/60 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/95 dark:shadow-none">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t('signIn')}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t('signInSubtitle')}</p>

          <div className="mt-6">
            <LoginForm locale={locale} />
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 flex items-center justify-center gap-6">
          {[
            { Icon: Shield, label: t('trustSecure') },
            { Icon: Mail, label: t('trustNoPassword') },
            { Icon: Sparkles, label: t('trustFree') },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

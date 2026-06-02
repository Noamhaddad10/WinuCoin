'use client'

import { useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface OTPFormProps {
  email: string
  locale: string
  onBack: () => void
}

const RESEND_COOLDOWN_SECONDS = 30

export function OTPForm({ email, locale, onBack }: OTPFormProps) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isResending, startResendTransition] = useTransition()

  const [token, setToken] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [resendError, setResendError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setTokenError('')
    setVerifyError('')

    const cleaned = token.replace(/\s/g, '')
    if (!/^\d{6}$/.test(cleaned)) {
      setTokenError(t('errors.invalidOtp'))
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: cleaned,
        type: 'email',
      })

      if (error) {
        setVerifyError(t('errors.verifyFailed'))
        return
      }

      router.push(`/${locale}/dashboard`)
      router.refresh()
    })
  }

  function handleResend() {
    if (cooldown > 0 || isResending) return
    setResendError('')
    setResendSuccess(false)

    startResendTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setResendError(t('errors.resendFailed'))
        return
      }

      setResendSuccess(true)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    })
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-5" noValidate>
      <div className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
        {t('codeSent')} <strong>{email}</strong>
      </div>

      <Input
        label={t('otpLabel')}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder={t('otpPlaceholder')}
        maxLength={6}
        value={token}
        onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
        error={tokenError}
        disabled={isPending}
        required
      />

      {verifyError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">
          {verifyError}
        </p>
      )}

      {resendError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">
          {resendError}
        </p>
      )}

      {resendSuccess && !resendError && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" role="status">
          {t('codeResent')}
        </p>
      )}

      <Button type="submit" loading={isPending} className="w-full" size="lg">
        {isPending ? t('verifying') : t('verify')}
      </Button>

      <div className="flex flex-col items-center gap-2 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-indigo-400 dark:hover:text-indigo-300 dark:disabled:text-slate-500"
        >
          {isResending
            ? t('resending')
            : cooldown > 0
              ? t('resendIn', { seconds: cooldown })
              : t('resendCode')}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {t('changeEmail')}
        </button>
      </div>
    </form>
  )
}

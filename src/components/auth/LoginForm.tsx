'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OTPForm } from './OTPForm'

interface LoginFormProps {
  locale: string
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations('auth')
  const [isPending, startTransition] = useTransition()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [sendError, setSendError] = useState('')

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    setSendError('')

    if (!validateEmail(email)) {
      setEmailError(t('errors.invalidEmail'))
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setSendError(t('errors.sendFailed'))
        return
      }

      setStep('otp')
    })
  }

  if (step === 'otp') {
    return (
      <OTPForm
        email={email}
        locale={locale}
        onBack={() => {
          setStep('email')
          setSendError('')
        }}
      />
    )
  }

  return (
    <form onSubmit={handleSendCode} className="flex flex-col gap-5" noValidate>
      <Input
        label={t('email')}
        type="email"
        autoComplete="email"
        placeholder={t('emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
        disabled={isPending}
        required
      />

      {sendError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300" role="alert">
          {sendError}
        </p>
      )}

      <Button type="submit" loading={isPending} className="w-full" size="lg">
        {isPending ? t('sendingCode') : t('sendCode')}
      </Button>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        {t('noAccount')}
      </p>
    </form>
  )
}

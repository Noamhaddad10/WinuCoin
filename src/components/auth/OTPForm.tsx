'use client'

import { useState, useTransition } from 'react'
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

export function OTPForm({ email, locale, onBack }: OTPFormProps) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [token, setToken] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [verifyError, setVerifyError] = useState('')

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

      router.push(`/${locale}`)
      router.refresh()
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

      <Button type="submit" loading={isPending} className="w-full" size="lg">
        {isPending ? t('verifying') : t('verify')}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="text-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        {t('changeEmail')}
      </button>
    </form>
  )
}

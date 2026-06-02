import { createTranslator } from 'next-intl'
import enMessages from '@/messages/en.json'
import frMessages from '@/messages/fr.json'
import { baseTemplate } from './base'

type Messages = typeof enMessages
const ALL_MESSAGES: Record<string, Messages> = { en: enMessages, fr: frMessages }

export async function welcomeEmail(
  email: string,
  locale: string,
): Promise<{ subject: string; html: string }> {
  const messages = ALL_MESSAGES[locale] ?? ALL_MESSAGES.en
  const t = createTranslator({ locale, messages, namespace: 'emails.welcome' })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const subject = t('subject')
  const html = baseTemplate(
    subject,
    `<h1 class="title">${t('heading')}</h1>
    <p class="subtitle">${t('subtitle')}</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">${t('step1Label')}</span>
        <span class="info-value">${t('step1Value')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${t('step2Label')}</span>
        <span class="info-value">${t('step2Value')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${t('step3Label')}</span>
        <span class="info-value">${t('step3Value')}</span>
      </div>
    </div>

    <p style="font-size:14px;color:#64748b;margin-bottom:8px;">${t('trustNote')}</p>

    <a href="${appUrl}/${locale}/competitions" class="btn">${t('cta')}</a>

    <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
      ${t('footer', { email: `<strong>${email}</strong>` })}
    </p>`,
  )
  return { subject, html }
}

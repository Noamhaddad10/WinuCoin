import { createTranslator } from 'next-intl'
import enMessages from '@/messages/en.json'
import frMessages from '@/messages/fr.json'
import { baseTemplate } from './base'

type Messages = typeof enMessages
const ALL_MESSAGES: Record<string, Messages> = { en: enMessages, fr: frMessages }

interface WinnerAnnouncementOptions {
  email: string
  competitionTitle: string
  prizeAmount: number
  cryptoType: string
  winningTicketNumber: number
  locale: string
}

export async function winnerAnnouncementEmail(
  opts: WinnerAnnouncementOptions,
): Promise<{ subject: string; html: string }> {
  const { email, competitionTitle, prizeAmount, cryptoType, winningTicketNumber, locale } = opts
  const messages = ALL_MESSAGES[locale] ?? ALL_MESSAGES.en
  const t = createTranslator({ locale, messages, namespace: 'emails.winner' })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const numberLocale = locale === 'fr' ? 'fr-FR' : 'en-GB'
  const formattedAmount = new Intl.NumberFormat(numberLocale, {
    style: 'currency',
    currency: 'GBP',
  }).format(prizeAmount)

  const subject = t('subject', { amount: formattedAmount, crypto: cryptoType })

  const html = baseTemplate(
    subject,
    `<h1 class="title">${t('heading')}</h1>
    <p class="subtitle">${t('subtitle', { title: `<strong>${competitionTitle}</strong>` })}</p>

    <div class="win-box">
      <div class="win-emoji">🎉</div>
      <div class="win-prize">${t('winPrize', { amount: formattedAmount, crypto: cryptoType })}</div>
      <div class="win-ticket">${t('winTicket', { number: winningTicketNumber })}</div>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">${t('labelCompetition')}</span>
        <span class="info-value">${competitionTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${t('labelPrize')}</span>
        <span class="info-value">${formattedAmount} ${cryptoType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${t('labelWinningTicket')}</span>
        <span class="info-value">#${winningTicketNumber}</span>
      </div>
    </div>

    <p style="font-size:15px;font-weight:600;color:#0f172a;margin-bottom:8px;">${t('claimTitle')}</p>
    <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:24px;">${t('claimText')}</p>

    <a href="${appUrl}/${locale}/dashboard" class="btn">${t('cta')}</a>

    <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
      ${t('footer', { email: `<strong>${email}</strong>` })}
    </p>`,
  )
  return { subject, html }
}

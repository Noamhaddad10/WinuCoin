import { createTranslator } from 'next-intl'
import enMessages from '@/messages/en.json'
import frMessages from '@/messages/fr.json'
import { baseTemplate } from './base'

function formatGBPForLocale(amount: number, locale: string): string {
  const loc = locale === 'fr' ? 'fr-FR' : 'en-GB'
  return new Intl.NumberFormat(loc, { style: 'currency', currency: 'GBP' }).format(amount)
}

type Messages = typeof enMessages
const ALL_MESSAGES: Record<string, Messages> = { en: enMessages, fr: frMessages }

interface PurchaseConfirmationOptions {
  email: string
  competitionTitle: string
  competitionId: string
  ticketCount: number
  ticketNumbers: number[]
  totalPaid: number
  locale: string
}

export async function purchaseConfirmationEmail(
  opts: PurchaseConfirmationOptions,
): Promise<{ subject: string; html: string }> {
  const { email, competitionTitle, competitionId, ticketCount, ticketNumbers, totalPaid, locale } = opts
  const messages = ALL_MESSAGES[locale] ?? ALL_MESSAGES.en
  const t = createTranslator({ locale, messages, namespace: 'emails.purchase' })
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const subject =
    ticketCount === 1
      ? t('subjectSingle', { title: competitionTitle })
      : t('subjectMultiple', { title: competitionTitle })

  const ticketsHtml = ticketNumbers
    .map((n) => `<span class="ticket">#${n}</span>`)
    .join('')

  const ticketCountText =
    ticketCount === 1
      ? t('ticketsCountSingle', { count: ticketCount })
      : t('ticketsCountPlural', { count: ticketCount })

  const html = baseTemplate(
    subject,
    `<h1 class="title">${t('heading')}</h1>
    <p class="subtitle">${t('subtitle')}</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">${t('labelCompetition')}</span>
        <span class="info-value">${competitionTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${t('labelTickets')}</span>
        <span class="info-value">${ticketCountText}</span>
      </div>
      <div class="info-row">
        <span class="info-label">${t('labelTotalPaid')}</span>
        <span class="info-value">${formatGBPForLocale(totalPaid, locale)}</span>
      </div>
    </div>

    <p style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:10px;">${t('yourTicketNumbers')}</p>
    <div class="ticket-grid">${ticketsHtml}</div>

    <a href="${appUrl}/${locale}/competitions/${competitionId}" class="btn">${t('cta')}</a>

    <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
      ${t('footer', { email: `<strong>${email}</strong>` })}
    </p>`,
  )
  return { subject, html }
}

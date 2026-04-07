import { baseTemplate } from './base'

interface PurchaseConfirmationOptions {
  email: string
  competitionTitle: string
  competitionId: string
  ticketCount: number
  ticketNumbers: number[]
  totalPaid: number
}

export function purchaseConfirmationEmail(opts: PurchaseConfirmationOptions): {
  subject: string
  html: string
} {
  const { email, competitionTitle, competitionId, ticketCount, ticketNumbers, totalPaid } = opts
  const subject = `Your ${ticketCount === 1 ? 'ticket' : 'tickets'} for ${competitionTitle}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const ticketsHtml = ticketNumbers
    .map((n) => `<span class="ticket">#${n}</span>`)
    .join('')

  const html = baseTemplate(
    subject,
    `<h1 class="title">You're entered! 🎟️</h1>
    <p class="subtitle">
      Your payment was confirmed and your tickets are ready. Good luck!
    </p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Competition</span>
        <span class="info-value">${competitionTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tickets purchased</span>
        <span class="info-value">${ticketCount} ticket${ticketCount !== 1 ? 's' : ''}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total paid</span>
        <span class="info-value">$${totalPaid.toFixed(2)}</span>
      </div>
    </div>

    <p style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:10px;">Your ticket numbers:</p>
    <div class="ticket-grid">${ticketsHtml}</div>

    <a href="${appUrl}/en/competitions/${competitionId}" class="btn">
      View Competition →
    </a>

    <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
      Confirmation sent to <strong>${email}</strong>. Keep this email as your receipt.
    </p>`,
  )
  return { subject, html }
}

import { Resend } from 'resend'
import { welcomeEmail } from './email-templates/welcome'
import { purchaseConfirmationEmail } from './email-templates/purchase-confirmation'
import { winnerAnnouncementEmail } from './email-templates/winner-announcement'

const FROM = 'WinuWallet <onboarding@resend.dev>'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY not set — emails will be skipped')
    return null
  }
  return new Resend(key)
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const { error } = await resend.emails.send({ from: FROM, to, subject, html })
  if (error) {
    console.error('[email] Send failed:', error.message ?? JSON.stringify(error))
  } else {
    console.log('[email] Sent:', subject, '→', to)
  }
}

// ── Public helpers ──────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string): Promise<void> {
  const { subject, html } = welcomeEmail(email)
  await send(email, subject, html)
}

export async function sendPurchaseConfirmation(opts: {
  email: string
  competitionTitle: string
  competitionId: string
  ticketCount: number
  ticketNumbers: number[]
  totalPaid: number
}): Promise<void> {
  const { subject, html } = purchaseConfirmationEmail(opts)
  await send(opts.email, subject, html)
}

export async function sendWinnerAnnouncement(opts: {
  email: string
  competitionTitle: string
  prizeAmount: number
  cryptoType: string
  winningTicketNumber: number
}): Promise<void> {
  const { subject, html } = winnerAnnouncementEmail(opts)
  await send(opts.email, subject, html)
}

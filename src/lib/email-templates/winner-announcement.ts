import { baseTemplate } from './base'

interface WinnerAnnouncementOptions {
  email: string
  competitionTitle: string
  prizeAmount: number
  cryptoType: string
  winningTicketNumber: number
}

export function winnerAnnouncementEmail(opts: WinnerAnnouncementOptions): {
  subject: string
  html: string
} {
  const { email, competitionTitle, prizeAmount, cryptoType, winningTicketNumber } = opts
  const subject = `🏆 You won ${new Intl.NumberFormat('en-US').format(prizeAmount)} USD in ${cryptoType}!`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const html = baseTemplate(
    subject,
    `<h1 class="title">Congratulations! You won! 🏆</h1>
    <p class="subtitle">
      Your ticket was drawn as the winner for <strong>${competitionTitle}</strong>.
      Here are your winnings:
    </p>

    <div class="win-box">
      <div class="win-emoji">🎉</div>
      <div class="win-prize">$${new Intl.NumberFormat('en-US').format(prizeAmount)} USD in ${cryptoType}</div>
      <div class="win-ticket">Winning ticket: #${winningTicketNumber}</div>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Competition</span>
        <span class="info-value">${competitionTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Prize</span>
        <span class="info-value">$${new Intl.NumberFormat('en-US').format(prizeAmount)} in ${cryptoType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Winning Ticket</span>
        <span class="info-value">#${winningTicketNumber}</span>
      </div>
    </div>

    <p style="font-size:15px;font-weight:600;color:#0f172a;margin-bottom:8px;">How to claim your prize:</p>
    <p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:24px;">
      Our team will contact you within 48 hours to verify your identity and arrange the prize transfer.
      Please ensure your wallet address is up to date in your account settings.
      Do not share your winning confirmation with anyone.
    </p>

    <a href="${appUrl}/en/dashboard" class="btn">
      Go to My Dashboard →
    </a>

    <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
      This email was sent to <strong>${email}</strong>. If you have questions, reply to this email.
    </p>`,
  )
  return { subject, html }
}

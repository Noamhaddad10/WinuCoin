import { baseTemplate } from './base'

export function welcomeEmail(email: string): { subject: string; html: string } {
  const subject = 'Welcome to WinuWallet 🎉'
  const html = baseTemplate(
    subject,
    `<h1 class="title">Welcome to WinuWallet!</h1>
    <p class="subtitle">
      You're now part of the fairest crypto prize platform on the web.
      Here's how it works:
    </p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">① Choose a Competition</span>
        <span class="info-value">Browse live prizes</span>
      </div>
      <div class="info-row">
        <span class="info-label">② Buy Tickets</span>
        <span class="info-value">Secure card payment</span>
      </div>
      <div class="info-row">
        <span class="info-label">③ Win Crypto</span>
        <span class="info-value">Provably fair draws</span>
      </div>
    </div>

    <p style="font-size:14px;color:#64748b;margin-bottom:8px;">
      Every draw uses cryptographic randomness that is publicly verifiable.
      No hidden tricks — just fair competition.
    </p>

    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/en/competitions" class="btn">
      Browse Competitions →
    </a>

    <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
      You signed up with <strong>${email}</strong>. If this wasn't you, you can safely ignore this email.
    </p>`,
  )
  return { subject, html }
}

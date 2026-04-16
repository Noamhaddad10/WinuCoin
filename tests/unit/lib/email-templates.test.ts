import { describe, it, expect } from 'vitest'
import { welcomeEmail } from '@/lib/email-templates/welcome'
import { purchaseConfirmationEmail } from '@/lib/email-templates/purchase-confirmation'
import { winnerAnnouncementEmail } from '@/lib/email-templates/winner-announcement'
import { baseTemplate } from '@/lib/email-templates/base'

describe('baseTemplate', () => {
  it('wraps content in valid HTML', () => {
    const html = baseTemplate('Test Title', '<p>Hello</p>')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<title>Test Title</title>')
    expect(html).toContain('<p>Hello</p>')
    expect(html).toContain('WinuWallet')
  })

  it('includes footer with current year', () => {
    const html = baseTemplate('Test', '<p>Test</p>')
    const year = new Date().getFullYear()
    expect(html).toContain(String(year))
  })
})

describe('welcomeEmail', () => {
  it('returns subject and html', () => {
    const { subject, html } = welcomeEmail('user@example.com')
    expect(subject).toContain('Welcome')
    expect(html).toContain('user@example.com')
  })

  it('includes welcome message', () => {
    const { html } = welcomeEmail('user@example.com')
    expect(html).toContain('Welcome to WinuWallet')
  })

  it('includes how-it-works steps', () => {
    const { html } = welcomeEmail('user@example.com')
    expect(html).toContain('Choose a Competition')
    expect(html).toContain('Buy Tickets')
    expect(html).toContain('Win Crypto')
  })

  it('includes competitions link', () => {
    const { html } = welcomeEmail('user@example.com')
    expect(html).toContain('/en/competitions')
  })
})

describe('purchaseConfirmationEmail', () => {
  const opts = {
    email: 'buyer@example.com',
    competitionTitle: 'Win 1 BTC',
    competitionId: 'comp-1',
    ticketCount: 3,
    ticketNumbers: [42, 43, 44],
    totalPaid: 30,
  }

  it('returns subject with ticket count', () => {
    const { subject } = purchaseConfirmationEmail(opts)
    expect(subject).toContain('tickets')
    expect(subject).toContain('Win 1 BTC')
  })

  it('uses singular "ticket" for count of 1', () => {
    const { subject } = purchaseConfirmationEmail({ ...opts, ticketCount: 1, ticketNumbers: [42] })
    expect(subject).toContain('ticket')
    expect(subject).not.toContain('tickets')
  })

  it('includes ticket numbers in HTML', () => {
    const { html } = purchaseConfirmationEmail(opts)
    expect(html).toContain('#42')
    expect(html).toContain('#43')
    expect(html).toContain('#44')
  })

  it('includes total paid amount', () => {
    const { html } = purchaseConfirmationEmail(opts)
    expect(html).toContain('$30.00')
  })

  it('includes competition title', () => {
    const { html } = purchaseConfirmationEmail(opts)
    expect(html).toContain('Win 1 BTC')
  })

  it('includes buyer email', () => {
    const { html } = purchaseConfirmationEmail(opts)
    expect(html).toContain('buyer@example.com')
  })
})

describe('winnerAnnouncementEmail', () => {
  const opts = {
    email: 'winner@example.com',
    competitionTitle: 'Win 10 ETH',
    prizeAmount: 35000,
    cryptoType: 'ETH',
    winningTicketNumber: 777,
  }

  it('returns subject with prize details', () => {
    const { subject } = winnerAnnouncementEmail(opts)
    expect(subject).toContain('35,000')
    expect(subject).toContain('ETH')
  })

  it('includes winning ticket number', () => {
    const { html } = winnerAnnouncementEmail(opts)
    expect(html).toContain('#777')
  })

  it('includes prize amount formatted', () => {
    const { html } = winnerAnnouncementEmail(opts)
    expect(html).toContain('35,000')
  })

  it('includes competition title', () => {
    const { html } = winnerAnnouncementEmail(opts)
    expect(html).toContain('Win 10 ETH')
  })

  it('includes claim instructions', () => {
    const { html } = winnerAnnouncementEmail(opts)
    expect(html).toContain('48 hours')
    expect(html).toContain('wallet address')
  })

  it('includes dashboard link', () => {
    const { html } = winnerAnnouncementEmail(opts)
    expect(html).toContain('/en/dashboard')
  })

  it('includes winner email', () => {
    const { html } = winnerAnnouncementEmail(opts)
    expect(html).toContain('winner@example.com')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Resend before importing the module
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}))

// Mock email templates
vi.mock('@/lib/email-templates/welcome', () => ({
  welcomeEmail: vi.fn().mockReturnValue({ subject: 'Welcome', html: '<p>Welcome</p>' }),
}))
vi.mock('@/lib/email-templates/purchase-confirmation', () => ({
  purchaseConfirmationEmail: vi.fn().mockReturnValue({ subject: 'Tickets', html: '<p>Tickets</p>' }),
}))
vi.mock('@/lib/email-templates/winner-announcement', () => ({
  winnerAnnouncementEmail: vi.fn().mockReturnValue({ subject: 'Winner', html: '<p>Winner</p>' }),
}))

describe('email module', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('sendWelcomeEmail does not throw when RESEND_API_KEY is set', async () => {
    const { sendWelcomeEmail } = await import('@/lib/email')
    await expect(sendWelcomeEmail('test@example.com')).resolves.not.toThrow()
  })

  it('sendPurchaseConfirmation does not throw', async () => {
    const { sendPurchaseConfirmation } = await import('@/lib/email')
    await expect(
      sendPurchaseConfirmation({
        email: 'test@example.com',
        competitionTitle: 'Test',
        competitionId: 'comp-1',
        ticketCount: 2,
        ticketNumbers: [1, 2],
        totalPaid: 20,
      }),
    ).resolves.not.toThrow()
  })

  it('sendWinnerAnnouncement does not throw', async () => {
    const { sendWinnerAnnouncement } = await import('@/lib/email')
    await expect(
      sendWinnerAnnouncement({
        email: 'winner@example.com',
        competitionTitle: 'Test',
        prizeAmount: 1000,
        cryptoType: 'BTC',
        winningTicketNumber: 42,
      }),
    ).resolves.not.toThrow()
  })

  it('skips sending when RESEND_API_KEY is not set', async () => {
    const originalKey = process.env.RESEND_API_KEY
    delete process.env.RESEND_API_KEY

    const { sendWelcomeEmail } = await import('@/lib/email')
    // Should not throw, just skip
    await expect(sendWelcomeEmail('test@example.com')).resolves.not.toThrow()

    process.env.RESEND_API_KEY = originalKey
  })
})

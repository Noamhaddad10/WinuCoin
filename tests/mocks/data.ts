import type { Competition, Payment, Ticket, Winner } from '@/types'

export const mockActiveCompetition: Competition = {
  id: 'comp-1',
  slug: 'win-1-btc',
  title: 'Win 1 BTC',
  description: 'Win a full Bitcoin in this exciting competition!',
  prize_amount: 65000,
  crypto_type: 'BTC',
  crypto_price_usd: 65000,
  ticket_price: 10,
  max_tickets: 1000,
  tickets_sold: 420,
  end_date: '2026-12-31T23:59:59Z',
  status: 'active',
  winner_drawn: false,
  is_published: true,
  created_at: '2026-01-01T00:00:00Z',
}

export const mockCompletedCompetition: Competition = {
  ...mockActiveCompetition,
  id: 'comp-2',
  slug: 'win-10-eth',
  title: 'Win 10 ETH',
  status: 'completed',
  tickets_sold: 1000,
  winner_drawn: true,
  end_date: '2026-01-15T23:59:59Z',
}

export const mockSoldOutCompetition: Competition = {
  ...mockActiveCompetition,
  id: 'comp-3',
  slug: 'win-100-sol',
  title: 'Win 100 SOL',
  crypto_type: 'SOL',
  tickets_sold: 1000,
  max_tickets: 1000,
}

export const mockExpiredCompetition: Competition = {
  ...mockActiveCompetition,
  id: 'comp-4',
  slug: 'expired-comp',
  title: 'Expired Competition',
  end_date: '2025-01-01T00:00:00Z',
}

export const mockPayment: Payment = {
  id: 'pay-1',
  user_id: 'public-user-456',
  competition_id: 'comp-1',
  amount: 30,
  ticket_count: 3,
  stripe_payment_id: 'cs_test_abc123',
  payment_method: 'card',
  status: 'completed',
  created_at: '2026-04-01T12:00:00Z',
}

export const mockTicket: Ticket = {
  id: 'ticket-1',
  user_id: 'public-user-456',
  competition_id: 'comp-1',
  payment_id: 'pay-1',
  ticket_number: 1,
  created_at: '2026-04-01T12:00:00Z',
}

export const mockWinner: Winner = {
  id: 'winner-1',
  competition_id: 'comp-2',
  user_id: 'public-user-456',
  ticket_id: 'ticket-1',
  announced: true,
  created_at: '2026-01-16T00:00:00Z',
}

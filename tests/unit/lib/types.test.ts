import { describe, it, expect } from 'vitest'
import type {
  Competition,
  CompetitionStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Ticket,
  Winner,
  User,
  UserRole,
} from '@/types'

describe('TypeScript types are well-defined', () => {
  it('Competition type has all required fields', () => {
    const comp: Competition = {
      id: '1',
      title: 'Test',
      prize_amount: 100,
      crypto_type: 'BTC',
      ticket_price: 10,
      max_tickets: 100,
      tickets_sold: 0,
      end_date: '2026-12-31',
      status: 'active',
      winner_drawn: false,
      is_published: true,
      created_at: '2026-01-01',
    }
    expect(comp.id).toBeDefined()
    expect(comp.status).toBe('active')
  })

  it('CompetitionStatus only allows valid values', () => {
    const validStatuses: CompetitionStatus[] = ['active', 'completed', 'cancelled']
    expect(validStatuses).toHaveLength(3)
  })

  it('Payment type has all required fields', () => {
    const payment: Payment = {
      id: '1',
      user_id: 'u1',
      competition_id: 'c1',
      amount: 50,
      ticket_count: 5,
      payment_method: 'card',
      status: 'pending',
      created_at: '2026-01-01',
    }
    expect(payment.id).toBeDefined()
  })

  it('PaymentMethod only allows valid values', () => {
    const methods: PaymentMethod[] = ['card', 'crypto']
    expect(methods).toHaveLength(2)
  })

  it('PaymentStatus allows all states', () => {
    const statuses: PaymentStatus[] = ['pending', 'completed', 'failed', 'refunded']
    expect(statuses).toHaveLength(4)
  })

  it('Ticket type has all required fields', () => {
    const ticket: Ticket = {
      id: '1',
      user_id: 'u1',
      competition_id: 'c1',
      payment_id: 'p1',
      ticket_number: 42,
      created_at: '2026-01-01',
    }
    expect(ticket.ticket_number).toBe(42)
  })

  it('Winner type has all required fields', () => {
    const winner: Winner = {
      id: '1',
      competition_id: 'c1',
      user_id: 'u1',
      ticket_id: 't1',
      announced: true,
      created_at: '2026-01-01',
    }
    expect(winner.announced).toBe(true)
  })

  it('User type includes role field', () => {
    const user: User = {
      id: '1',
      auth_id: 'auth-1',
      email: 'test@example.com',
      role: 'user',
      created_at: '2026-01-01',
    }
    expect(user.role).toBe('user')
  })

  it('UserRole only allows user and admin', () => {
    const roles: UserRole[] = ['user', 'admin']
    expect(roles).toHaveLength(2)
  })
})

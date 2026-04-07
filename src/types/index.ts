export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  auth_id: string
  email: string
  phone?: string
  full_name?: string
  role: UserRole
  created_at: string
}

export type CompetitionStatus = 'active' | 'completed' | 'cancelled'

export interface Competition {
  id: string
  title: string
  description?: string
  prize_amount: number
  crypto_type: string
  crypto_price_usd?: number
  ticket_price: number
  max_tickets: number
  tickets_sold: number
  end_date: string
  status: CompetitionStatus
  winner_drawn: boolean
  created_at: string
}

export type PaymentMethod = 'card' | 'crypto'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  user_id: string
  competition_id: string
  amount: number
  ticket_count: number
  stripe_payment_id?: string
  payment_method: PaymentMethod
  status: PaymentStatus
  created_at: string
}

export interface Ticket {
  id: string
  user_id: string
  competition_id: string
  payment_id: string
  ticket_number: number
  created_at: string
}

export interface Winner {
  id: string
  competition_id: string
  user_id: string
  ticket_id: string
  announced: boolean
  created_at: string
}

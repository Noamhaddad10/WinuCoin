'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { randomInt } from 'crypto'
import { sendWinnerAnnouncement } from '@/lib/email'

// ── Auth guard ─────────────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Forbidden')
}

// ── Create competition ──────────────────────────────────────────────────────
export async function createCompetition(locale: string, _prevState: string, formData: FormData) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const prize_amount = Number(formData.get('prize_amount'))
  const crypto_type = formData.get('crypto_type') as string
  const ticket_price = Number(formData.get('ticket_price'))
  const max_tickets = Number(formData.get('max_tickets'))
  const end_date = formData.get('end_date') as string

  if (!title?.trim()) return 'Title is required.'
  if (!prize_amount || prize_amount <= 0) return 'Prize amount must be greater than 0.'
  if (!crypto_type) return 'Cryptocurrency is required.'
  if (!ticket_price || ticket_price <= 0) return 'Ticket price must be greater than 0.'
  if (!max_tickets || max_tickets < 1) return 'Maximum tickets must be at least 1.'
  if (!end_date) return 'End date is required.'
  if (new Date(end_date) <= new Date()) return 'End date must be in the future.'

  const maxRevenue = max_tickets * ticket_price
  if (maxRevenue < prize_amount) {
    return `Viability error: max revenue (${max_tickets} × $${ticket_price} = $${maxRevenue}) is less than prize amount ($${prize_amount}). Increase ticket price or max tickets.`
  }

  const is_published = formData.get('is_published') === 'true'

  const admin = createAdminClient()
  const { error } = await admin.from('competitions').insert({
    title: title.trim(),
    description: description?.trim() || null,
    prize_amount,
    crypto_type,
    ticket_price,
    max_tickets,
    tickets_sold: 0,
    end_date,
    status: 'active',
    winner_drawn: false,
    is_published,
  })

  if (error) return `Database error: ${error.message}`

  redirect(`/${locale}/admin/competitions`)
}

// ── Update competition ──────────────────────────────────────────────────────
export async function updateCompetition(
  locale: string,
  id: string,
  _prevState: string,
  formData: FormData,
) {
  await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const prize_amount = Number(formData.get('prize_amount'))
  const crypto_type = formData.get('crypto_type') as string
  const ticket_price = Number(formData.get('ticket_price'))
  const max_tickets = Number(formData.get('max_tickets'))
  const end_date = formData.get('end_date') as string
  const status = formData.get('status') as string

  if (!title?.trim()) return 'Title is required.'
  if (!prize_amount || prize_amount <= 0) return 'Prize amount must be greater than 0.'
  if (!crypto_type) return 'Cryptocurrency is required.'
  if (!ticket_price || ticket_price <= 0) return 'Ticket price must be greater than 0.'
  if (!max_tickets || max_tickets < 1) return 'Maximum tickets must be at least 1.'
  if (!end_date) return 'End date is required.'
  if (!['active', 'completed', 'cancelled'].includes(status)) return 'Invalid status.'

  const maxRevenue = max_tickets * ticket_price
  if (maxRevenue < prize_amount) {
    return `Viability error: max revenue (${max_tickets} × $${ticket_price} = $${maxRevenue}) is less than prize amount ($${prize_amount}). Increase ticket price or max tickets.`
  }

  const is_published = formData.get('is_published') === 'true'

  const admin = createAdminClient()
  const { error } = await admin
    .from('competitions')
    .update({
      title: title.trim(),
      description: description?.trim() || null,
      prize_amount,
      crypto_type,
      ticket_price,
      max_tickets,
      end_date,
      status,
      is_published,
    })
    .eq('id', id)

  if (error) return `Database error: ${error.message}`

  redirect(`/${locale}/admin/competitions`)
}

// ── Draw winner ─────────────────────────────────────────────────────────────
export async function drawWinner(competitionId: string): Promise<
  { ok: true; ticketNumber: number; userEmail: string } | { ok: false; error: string }
> {
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: 'Unauthorized' }
  }

  const admin = createAdminClient()

  // Check competition
  const { data: competition } = await admin
    .from('competitions')
    .select('id, status, winner_drawn, end_date')
    .eq('id', competitionId)
    .single()

  if (!competition) return { ok: false, error: 'Competition not found.' }
  if (competition.winner_drawn) return { ok: false, error: 'Winner already drawn.' }

  const isEnded =
    competition.status === 'completed' || new Date(competition.end_date) <= new Date()
  if (!isEnded) return { ok: false, error: 'Competition is not yet eligible for a draw.' }

  // Get all tickets
  const { data: tickets } = await admin
    .from('tickets')
    .select('id, ticket_number, user_id')
    .eq('competition_id', competitionId)
    .order('ticket_number')

  if (!tickets || tickets.length === 0) {
    return { ok: false, error: 'No tickets found for this competition.' }
  }

  // Cryptographically secure random pick
  const winningIndex = randomInt(0, tickets.length)
  const winningTicket = tickets[winningIndex]

  // Look up winner's email
  const { data: winnerUser } = await admin
    .from('users')
    .select('email')
    .eq('id', winningTicket.user_id)
    .single()

  // Insert into winners table
  const { error: winnerError } = await admin.from('winners').insert({
    competition_id: competitionId,
    user_id: winningTicket.user_id,
    ticket_id: winningTicket.id,
  })

  if (winnerError) return { ok: false, error: `Failed to save winner: ${winnerError.message}` }

  // Mark competition winner_drawn
  const { data: compData } = await admin
    .from('competitions')
    .select('title, prize_amount, crypto_type')
    .eq('id', competitionId)
    .single()

  await admin
    .from('competitions')
    .update({ winner_drawn: true, status: 'completed' })
    .eq('id', competitionId)

  // Send winner email (fire-and-forget)
  if (winnerUser?.email && compData) {
    sendWinnerAnnouncement({
      email: winnerUser.email,
      competitionTitle: compData.title,
      prizeAmount: compData.prize_amount,
      cryptoType: compData.crypto_type,
      winningTicketNumber: winningTicket.ticket_number,
    }).catch(console.error)
  }

  return {
    ok: true,
    ticketNumber: winningTicket.ticket_number,
    userEmail: winnerUser?.email ?? 'Unknown',
  }
}

// ── Update user role ─────────────────────────────────────────────────────────
export async function updateUserRole(
  _prevState: string,
  formData: FormData,
): Promise<string> {
  await requireAdmin()

  const userId = formData.get('user_id') as string
  const role = formData.get('role') as string

  if (!userId) return 'Missing user ID.'
  if (!['user', 'admin'].includes(role)) return 'Invalid role.'

  const admin = createAdminClient()
  const { error } = await admin.from('users').update({ role }).eq('id', userId)

  if (error) return `Error: ${error.message}`
  return ''
}

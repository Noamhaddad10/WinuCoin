'use server'

import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { randomInt } from 'crypto'
import { sendWinnerAnnouncement } from '@/lib/email'
import { localizeCompetition } from '@/lib/competition-i18n'

async function tErrors(locale: string) {
  return getTranslations({ locale, namespace: 'admin.errors' })
}

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
  const t = await tErrors(locale)

  const title_fr = ((formData.get('title_fr') as string) ?? '').trim() || null
  const title_en = ((formData.get('title_en') as string) ?? '').trim() || null
  const description_fr = ((formData.get('description_fr') as string) ?? '').trim() || null
  const description_en = ((formData.get('description_en') as string) ?? '').trim() || null
  // Canonical title used for slug + legacy `title` column.
  const title = title_en ?? title_fr
  const description = description_en ?? description_fr
  const prize_amount = Number(formData.get('prize_amount'))
  const crypto_type = formData.get('crypto_type') as string
  const ticket_price = Number(formData.get('ticket_price'))
  const max_tickets = Number(formData.get('max_tickets'))
  const end_date = formData.get('end_date') as string

  if (!title?.trim()) return t('titleRequired')
  if (!prize_amount || prize_amount <= 0) return t('prizeAmountInvalid')
  if (!crypto_type) return t('cryptoTypeRequired')
  if (!ticket_price || ticket_price <= 0) return t('ticketPriceInvalid')
  if (!max_tickets || max_tickets < 1) return t('maxTicketsInvalid')
  if (!end_date) return t('endDateRequired')
  if (new Date(end_date) <= new Date()) return t('endDateInPast')

  const maxRevenue = max_tickets * ticket_price
  if (maxRevenue < prize_amount) {
    return t('viabilityError', { maxTickets: max_tickets, ticketPrice: ticket_price, maxRevenue, prizeAmount: prize_amount })
  }

  const is_published = formData.get('is_published') === 'true'

  // Auto-generate a URL-friendly slug from the title, with dedup
  let slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  const admin = createAdminClient()

  // Ensure slug is unique — append -2, -3, etc. if needed
  const { data: existing } = await admin
    .from('competitions')
    .select('slug')
    .like('slug', `${slug}%`)
  if (existing && existing.length > 0) {
    const taken = new Set(existing.map((r) => r.slug))
    if (taken.has(slug)) {
      let suffix = 2
      while (taken.has(`${slug}-${suffix}`)) suffix++
      slug = `${slug}-${suffix}`
    }
  }

  const { error } = await admin.from('competitions').insert({
    title: title.trim(),
    title_fr,
    title_en,
    slug,
    description: description ?? null,
    description_fr,
    description_en,
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

  if (error) return t('databaseError', { message: error.message })

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
  const t = await tErrors(locale)

  const title_fr = ((formData.get('title_fr') as string) ?? '').trim() || null
  const title_en = ((formData.get('title_en') as string) ?? '').trim() || null
  const description_fr = ((formData.get('description_fr') as string) ?? '').trim() || null
  const description_en = ((formData.get('description_en') as string) ?? '').trim() || null
  const title = title_en ?? title_fr
  const description = description_en ?? description_fr
  const prize_amount = Number(formData.get('prize_amount'))
  const crypto_type = formData.get('crypto_type') as string
  const ticket_price = Number(formData.get('ticket_price'))
  const max_tickets = Number(formData.get('max_tickets'))
  const end_date = formData.get('end_date') as string
  const status = formData.get('status') as string

  if (!title?.trim()) return t('titleRequired')
  if (!prize_amount || prize_amount <= 0) return t('prizeAmountInvalid')
  if (!crypto_type) return t('cryptoTypeRequired')
  if (!ticket_price || ticket_price <= 0) return t('ticketPriceInvalid')
  if (!max_tickets || max_tickets < 1) return t('maxTicketsInvalid')
  if (!end_date) return t('endDateRequired')
  if (!['active', 'completed', 'cancelled'].includes(status)) return t('invalidStatus')

  const maxRevenue = max_tickets * ticket_price
  if (maxRevenue < prize_amount) {
    return t('viabilityError', { maxTickets: max_tickets, ticketPrice: ticket_price, maxRevenue, prizeAmount: prize_amount })
  }

  const is_published = formData.get('is_published') === 'true'

  const admin = createAdminClient()
  const { error } = await admin
    .from('competitions')
    .update({
      title: title.trim(),
      title_fr,
      title_en,
      description: description ?? null,
      description_fr,
      description_en,
      prize_amount,
      crypto_type,
      ticket_price,
      max_tickets,
      end_date,
      status,
      is_published,
    })
    .eq('id', id)

  if (error) return t('databaseError', { message: error.message })

  redirect(`/${locale}/admin/competitions`)
}

// ── Draw winner ─────────────────────────────────────────────────────────────
export async function drawWinner(
  competitionId: string,
  locale: string,
): Promise<
  { ok: true; ticketNumber: number; userEmail: string } | { ok: false; error: string }
> {
  const t = await tErrors(locale)
  try {
    await requireAdmin()
  } catch {
    return { ok: false, error: t('unauthorized') }
  }

  const admin = createAdminClient()

  // Check competition
  const { data: competition } = await admin
    .from('competitions')
    .select('id, status, winner_drawn, end_date')
    .eq('id', competitionId)
    .single()

  if (!competition) return { ok: false, error: t('competitionNotFound') }
  if (competition.winner_drawn) return { ok: false, error: t('winnerAlreadyDrawn') }

  const isEnded =
    competition.status === 'completed' || new Date(competition.end_date) <= new Date()
  if (!isEnded) return { ok: false, error: t('notEligibleForDraw') }

  // Get all tickets
  const { data: tickets } = await admin
    .from('tickets')
    .select('id, ticket_number, user_id')
    .eq('competition_id', competitionId)
    .order('ticket_number')

  if (!tickets || tickets.length === 0) {
    return { ok: false, error: t('noTicketsForCompetition') }
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

  // Insert into winners table (announced = true so RLS allows user reads)
  const { error: winnerError } = await admin.from('winners').insert({
    competition_id: competitionId,
    user_id: winningTicket.user_id,
    ticket_id: winningTicket.id,
    announced: true,
  })

  if (winnerError) return { ok: false, error: t('saveWinnerFailed', { message: winnerError.message }) }

  // Mark competition winner_drawn
  const { data: compData } = await admin
    .from('competitions')
    .select('title, title_fr, title_en, prize_amount, crypto_type')
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
      competitionTitle: localizeCompetition(compData, locale).title,
      prizeAmount: compData.prize_amount,
      cryptoType: compData.crypto_type,
      winningTicketNumber: winningTicket.ticket_number,
      locale,
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
  locale: string,
  _prevState: string,
  formData: FormData,
): Promise<string> {
  await requireAdmin()
  const t = await tErrors(locale)

  const userId = formData.get('user_id') as string
  const role = formData.get('role') as string

  if (!userId) return t('missingUserId')
  if (!['user', 'admin'].includes(role)) return t('invalidRole')

  const admin = createAdminClient()
  const { error } = await admin.from('users').update({ role }).eq('id', userId)

  if (error) return t('errorWithMessage', { message: error.message })
  return ''
}

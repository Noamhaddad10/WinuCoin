import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { DrawWinnerClient } from '@/components/admin/DrawWinnerClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return { title: `${t('drawTitle')} — ${t('title')}` }
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function DrawWinnerPage({ params }: PageProps) {
  const { locale, id } = await params
  const t = await getTranslations('admin')

  const admin = createAdminClient()

  const [{ data: competition }, { data: tickets }, { data: existingWinner }] = await Promise.all([
    admin.from('competitions').select('*').eq('id', id).single(),
    admin
      .from('tickets')
      .select('id, ticket_number, user_id')
      .eq('competition_id', id)
      .order('ticket_number'),
    admin.from('winners').select('*, users(email), tickets(ticket_number)').eq('competition_id', id).maybeSingle(),
  ])

  if (!competition) notFound()

  const winnerUser = existingWinner?.users as { email: string } | null
  const winnerTicket = existingWinner?.tickets as { ticket_number: number } | null

  return (
    <>
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/admin/competitions`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToAdmin')}
        </Link>
      </div>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('drawTitle')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{competition.title}</p>
      </div>

      <div className="mt-6 max-w-2xl">
        <DrawWinnerClient
          competition={competition}
          tickets={tickets ?? []}
          existingWinner={
            existingWinner
              ? {
                  ticketNumber: winnerTicket?.ticket_number ?? 0,
                  userEmail: winnerUser?.email ?? 'Unknown',
                }
              : null
          }
        />
      </div>
    </>
  )
}

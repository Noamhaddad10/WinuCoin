import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Ticket, LayoutDashboard, ArrowRight } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Purchase Successful' }

interface SuccessPageProps {
  params: Promise<{ locale: string; id: string }>
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale, id } = await params
  const { session_id } = await searchParams
  const t = await getTranslations('checkout')

  if (!session_id) {
    redirect(`/${locale}/competitions/${id}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()

  // Look up payment by Stripe session ID
  const { data: payment } = await admin
    .from('payments')
    .select('id, ticket_count, status')
    .eq('stripe_payment_id', session_id)
    .maybeSingle()

  // Look up the competition
  const { data: competition } = await admin
    .from('competitions')
    .select('title, crypto_type, prize_amount')
    .eq('id', id)
    .maybeSingle()

  // Look up tickets (may not exist yet if webhook hasn't fired)
  const { data: tickets } = payment
    ? await admin
        .from('tickets')
        .select('id, ticket_number')
        .eq('payment_id', payment.id)
        .order('ticket_number')
    : { data: [] }

  const ticketCount = payment?.ticket_count ?? 0
  const ticketsReady = (tickets?.length ?? 0) > 0

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950">
      <Header locale={locale} isAuthenticated={!!user} />

      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-lg">
          {/* Success card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* Green header */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-8 py-10 text-center">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <CheckCircle className="h-9 w-9 text-white" />
                </div>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-white">{t('successTitle')}</h1>
              <p className="mt-2 text-green-100">{t('successDesc')}</p>
            </div>

            {/* Order summary */}
            <div className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {t('orderSummary')}
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {t('competition')}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {competition?.title ?? '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Tickets</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {ticketCount > 1
                      ? t('ticketsPurchasedPlural', { count: ticketCount })
                      : t('ticketsPurchased', { count: ticketCount })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950/50 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {t('paymentConfirmed')}
                  </span>
                </div>
              </div>

              {/* Ticket numbers (if webhook has fired) */}
              {ticketsReady && (
                <div className="mt-5 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                      Your ticket numbers
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tickets!.map((ticket) => (
                      <span
                        key={ticket.id}
                        className="rounded-lg bg-white px-3 py-1 font-mono text-sm font-bold text-indigo-700 shadow-sm ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-700/40"
                      >
                        #{ticket.ticket_number}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!ticketsReady && (
                <div className="mt-5 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Your ticket numbers are being generated and will appear in your dashboard
                    within a few seconds.
                  </p>
                </div>
              )}

              {/* CTAs */}
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/${locale}/dashboard`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('viewDashboard')}
                </Link>
                <Link
                  href={`/${locale}/competitions`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
                >
                  {t('browseMore')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

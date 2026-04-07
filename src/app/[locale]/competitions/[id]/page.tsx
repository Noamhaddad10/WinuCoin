import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface CompetitionDetailPageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: CompetitionDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('competitions').select('title').eq('id', id).single()
  return { title: data?.title ?? 'Competition' }
}

export default async function CompetitionDetailPage({ params }: CompetitionDetailPageProps) {
  const { locale, id } = await params
  const t = await getTranslations('competitions')

  const supabase = await createClient()
  const { data: competition } = await supabase
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single()

  if (!competition) notFound()

  const isSoldOut = competition.tickets_sold >= competition.max_tickets
  const progress = Math.round((competition.tickets_sold / competition.max_tickets) * 100)
  const isEnded = competition.status !== 'active'

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Back link */}
          <Link
            href={`/${locale}/competitions`}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            ← {t('back')}
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-3">
            {/* Main info */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <span
                    className={[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      isEnded
                        ? 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-400'
                        : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
                    ].join(' ')}
                  >
                    {isEnded ? t('ended') : t('active')}
                  </span>
                  <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {competition.title}
                  </h1>
                  {competition.description && (
                    <p className="mt-4 text-slate-600 dark:text-slate-400">
                      {competition.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mt-8">
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>{competition.tickets_sold} / {competition.max_tickets} {t('ticketsSold').toLowerCase()}</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Purchase card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {competition.crypto_type} {t('prize')}
                </CardTitle>
                <CardDescription>
                  ${competition.prize_amount.toLocaleString()} USD
                  {competition.crypto_price_usd && (
                    <span> · {(competition.prize_amount / competition.crypto_price_usd).toFixed(4)} {competition.crypto_type}</span>
                  )}
                </CardDescription>
              </CardHeader>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('ticketPrice')}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    ${competition.ticket_price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{t('endsAt')}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {new Date(competition.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                {/* Payment coming in Phase 2 */}
                <Button className="w-full" disabled={isSoldOut || isEnded} size="lg">
                  {isSoldOut ? t('soldOut') : isEnded ? t('ended') : t('buyTicket')}
                </Button>
                {!isSoldOut && !isEnded && (
                  <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
                    Stripe payment coming soon
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import type { Competition } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('competitions')
  return { title: t('title') }
}

interface CompetitionsPageProps {
  params: Promise<{ locale: string }>
}

function CompetitionCard({
  competition,
  locale,
  t,
}: {
  competition: Competition
  locale: string
  t: (key: string) => string
}) {
  const isSoldOut = competition.tickets_sold >= competition.max_tickets
  const progress = Math.round((competition.tickets_sold / competition.max_tickets) * 100)

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
              {t('active')}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {competition.title}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {competition.crypto_type}
            </p>
            <p className="text-sm text-slate-500">
              ${competition.prize_amount.toLocaleString()}
            </p>
          </div>
        </div>

        {competition.description && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {competition.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('ticketsSold')}: {competition.tickets_sold}/{competition.max_tickets}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            {t('ticketPrice')}: <strong className="text-slate-900 dark:text-slate-100">${competition.ticket_price}</strong>
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {t('endsAt')}: {new Date(competition.end_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-4 dark:border-zinc-800">
        <Link href={`/${locale}/competitions/${competition.id}`} className="block">
          <Button variant={isSoldOut ? 'secondary' : 'primary'} className="w-full" disabled={isSoldOut}>
            {isSoldOut ? t('soldOut') : t('buyTicket')}
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default async function CompetitionsPage({ params }: CompetitionsPageProps) {
  const { locale } = await params
  const t = await getTranslations('competitions')

  const supabase = await createClient()

  const { data: competitions } = await supabase
    .from('competitions')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t('title')}
          </h1>

          {competitions && competitions.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {competitions.map((comp) => (
                <CompetitionCard
                  key={comp.id}
                  competition={comp}
                  locale={locale}
                  t={(key) => t(key as Parameters<typeof t>[0])}
                />
              ))}
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center gap-3 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No active competitions right now. Check back soon.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CompetitionCard } from '@/components/ui/CompetitionCard'
import type { Competition } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('competitions')
  return { title: t('title') }
}

interface CompetitionsPageProps {
  params: Promise<{ locale: string }>
}

export default async function CompetitionsPage({ params }: CompetitionsPageProps) {
  const { locale } = await params
  const t = await getTranslations('competitions')

  const supabase = await createClient()

  // Active first (ending soonest), then others (most recent end_date desc)
  const [{ data: active }, { data: others }] = await Promise.all([
    supabase
      .from('competitions')
      .select('*')
      .eq('status', 'active')
      .order('end_date', { ascending: true }),
    supabase
      .from('competitions')
      .select('*')
      .neq('status', 'active')
      .order('end_date', { ascending: false }),
  ])

  const competitions: Competition[] = [...(active ?? []), ...(others ?? [])]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950">
      <Header locale={locale} />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {t('title')}
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {t('browseDesc')}
            </p>
          </div>

          {/* Grid */}
          {competitions.length > 0 ? (
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:justify-center">
              {competitions.map((comp) => (
                <div key={comp.id} className="w-full md:w-80">
                  <CompetitionCard competition={comp} locale={locale} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50">
                <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                </svg>
              </div>
              <p className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
                {t('noCompetitionsTitle')}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t('noCompetitionsDesc')}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

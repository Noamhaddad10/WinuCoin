import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface HomePageProps {
  params: Promise<{ locale: string }>
}

function HowItWorksStep({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
        {number}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}

function LandingContent({ locale }: { locale: string }) {
  const t = useTranslations('landing')
  const tNav = useTranslations('nav')

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
          {/* Background gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-50 opacity-60 blur-3xl dark:bg-indigo-950 dark:opacity-30" />
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-6xl">
              {t('heroTitle')}{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t('heroTitleAccent')}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              {t('heroSubtitle')}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={`/${locale}/competitions`}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {t('cta')}
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-300 dark:hover:bg-zinc-800"
              >
                {t('ctaSecondary')}
              </a>
            </div>
          </div>
        </section>

        {/* Current Competitions placeholder */}
        <section className="border-t border-slate-100 bg-slate-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('currentCompetitions')}
            </h2>
            <div className="mt-8 flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white dark:border-zinc-700 dark:bg-zinc-950">
              <div className="text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('noCompetitions')}
                </p>
                <Link
                  href={`/${locale}/competitions`}
                  className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  {tNav('competitions')} →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('howItWorks')}
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
              <HowItWorksStep
                number={1}
                title={t('step1Title')}
                description={t('step1Desc')}
              />
              <HowItWorksStep
                number={2}
                title={t('step2Title')}
                description={t('step2Desc')}
              />
              <HowItWorksStep
                number={3}
                title={t('step3Title')}
                description={t('step3Desc')}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  return <LandingContent locale={locale} />
}

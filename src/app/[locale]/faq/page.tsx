import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface FaqPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faq')
  return { title: t('metaTitle') }
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params
  const t = await getTranslations('faq')

  const items = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
    { q: t('q6'), a: t('a6') },
    { q: t('q7'), a: t('a7') },
    { q: t('q8'), a: t('a8') },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-20 dark:border-zinc-800 dark:from-indigo-950/30 dark:via-zinc-950 dark:to-purple-950/20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {items.map(({ q, a }, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{q}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href={`/${locale}`}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              ← {t('backHome')}
            </Link>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

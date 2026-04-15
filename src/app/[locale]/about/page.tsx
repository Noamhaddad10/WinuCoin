import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about')
  return { title: t('metaTitle') }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations('about')

  const steps = [
    { title: t('how1Title'), text: t('how1Text'), step: '01' },
    { title: t('how2Title'), text: t('how2Text'), step: '02' },
    { title: t('how3Title'), text: t('how3Text'), step: '03' },
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
          {/* Mission */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('missionTitle')}</h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{t('missionText')}</p>
          </section>

          {/* How it works */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('howTitle')}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {steps.map(({ step, title, text }) => (
                <div
                  key={step}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {step}
                  </span>
                  <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Legal */}
          <section className="mb-14 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800/30 dark:bg-amber-950/20">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('legalTitle')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t('legalText')}</p>
          </section>

          {/* Stripe */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('stripeTitle')}</h2>
            <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">{t('stripeText')}</p>
          </section>

          {/* Contact */}
          <section className="mb-10 rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('contactTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t('contactText')}{' '}
              <a
                href="mailto:hello@winuwallet.com"
                className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                hello@winuwallet.com
              </a>
            </p>
          </section>

          <Link
            href={`/${locale}`}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            ← {t('backHome')}
          </Link>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}

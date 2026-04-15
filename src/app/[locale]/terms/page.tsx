import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface TermsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('terms')
  return { title: t('metaTitle') }
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params
  const t = await getTranslations('terms')

  const sections = [
    { title: t('s1Title'), text: t('s1Text') },
    { title: t('s2Title'), text: t('s2Text') },
    { title: t('s3Title'), text: t('s3Text') },
    { title: t('s4Title'), text: t('s4Text') },
    { title: t('s5Title'), text: t('s5Text') },
    { title: t('s6Title'), text: t('s6Text') },
    { title: t('s7Title'), text: t('s7Text') },
    { title: t('s8Title'), text: t('s8Text') },
    { title: t('s9Title'), text: t('s9Text') },
    { title: t('s10Title'), text: t('s10Text') },
    { title: t('s11Title'), text: t('s11Text') },
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
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('lastUpdated')}</p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-10 leading-relaxed text-slate-600 dark:text-slate-400">{t('intro')}</p>

          <div className="space-y-10">
            {sections.map(({ title, text }) => (
              <section key={title}>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
                <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
              </section>
            ))}
          </div>

          <div className="mt-8">
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

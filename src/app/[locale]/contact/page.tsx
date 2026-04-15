import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact')
  return { title: t('metaTitle') }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params
  const t = await getTranslations('contact')

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

        <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50">
              <Mail className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400">{t('emailLabel')}</p>
            <a
              href="mailto:hello@winuwallet.com"
              className="mt-3 block text-xl font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              hello@winuwallet.com
            </a>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-500">{t('responseTime')}</p>
          </div>

          <div className="mt-10">
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

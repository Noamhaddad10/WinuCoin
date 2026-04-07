import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CompetitionForm } from '@/components/admin/CompetitionForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return { title: `${t('createCompetition')} — ${t('title')}` }
}

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function CreateCompetitionPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations('admin')

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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('createCompetition')}
        </h1>
      </div>

      <div className="mt-6 max-w-2xl">
        <CompetitionForm locale={locale} mode="create" />
      </div>
    </>
  )
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { CompetitionForm } from '@/components/admin/CompetitionForm'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return { title: `${t('editCompetition')} — ${t('title')}` }
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditCompetitionPage({ params }: PageProps) {
  const { locale, id } = await params
  const t = await getTranslations('admin')

  const admin = createAdminClient()
  const { data: competition } = await admin
    .from('competitions')
    .select('*')
    .eq('id', id)
    .single()

  if (!competition) notFound()

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
          {t('editCompetition')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{competition.title}</p>
      </div>

      <div className="mt-6 max-w-2xl">
        <CompetitionForm locale={locale} mode="edit" competition={competition} />
      </div>
    </>
  )
}

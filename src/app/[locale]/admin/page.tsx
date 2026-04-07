import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return { title: t('title') }
}

interface AdminPageProps {
  params: Promise<{ locale: string }>
}

async function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin')

  const supabase = await createClient()

  const [{ count: competitionCount }, { count: userCount }, { count: paymentCount }] =
    await Promise.all([
      supabase.from('competitions').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('*', { count: 'exact', head: true }),
    ])

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} isAuthenticated />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Sidebar locale={locale} isAdmin />

        <main className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('title')}
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <StatCard label={t('competitions')} value={competitionCount ?? 0} />
            <StatCard label={t('users')} value={userCount ?? 0} />
            <StatCard label={t('payments')} value={paymentCount ?? 0} />
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t('competitions')}
            </h2>
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Competition management UI coming in Phase 2
              </p>
            </div>
          </div>
        </main>
      </div>

      <Footer locale={locale} />
    </div>
  )
}

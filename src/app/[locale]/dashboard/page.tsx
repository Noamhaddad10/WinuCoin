import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard')
  return { title: t('title') }
}

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const t = await getTranslations('dashboard')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile
  const { data: profile } = user
    ? await supabase
        .from('users')
        .select('full_name, role')
        .eq('auth_id', user.id)
        .single()
    : { data: null }

  const isAdmin = profile?.role === 'admin'

  // Fetch user tickets
  const { data: tickets } = user
    ? await supabase
        .from('tickets')
        .select('id, ticket_number, created_at, competition_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: [] }

  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} isAuthenticated />

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Sidebar locale={locale} isAdmin={isAdmin} />

        <main className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('title')}
          </h1>
          {profile?.full_name && (
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Welcome back, {profile.full_name}
            </p>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Tickets card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('myTickets')}</CardTitle>
                <CardDescription>
                  {tickets?.length ?? 0} ticket{tickets?.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              {tickets && tickets.length > 0 ? (
                <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {tickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        #{ticket.ticket_number}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('noTickets')}
                  </p>
                  <Link
                    href={`/${locale}/competitions`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    {t('browseCompetitions')} →
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

      <Footer locale={locale} />
    </div>
  )
}

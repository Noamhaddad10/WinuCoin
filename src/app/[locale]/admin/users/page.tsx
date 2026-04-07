import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { UserRoleForm } from '@/components/admin/UserRoleForm'
import { fmtDate } from '@/lib/format'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin')
  return { title: `${t('users')} — ${t('title')}` }
}

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function AdminUsersPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { q } = await searchParams
  const t = await getTranslations('admin')

  const admin = createAdminClient()

  let query = admin
    .from('users')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (q) query = query.ilike('email', `%${q}%`)

  const { data: users } = await query

  // Fetch ticket counts per user
  const { data: ticketCounts } = await admin
    .from('tickets')
    .select('user_id')

  const ticketsByUser = (ticketCounts ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t.user_id] = (acc[t.user_id] ?? 0) + 1
    return acc
  }, {})

  // Fetch spend per user
  const { data: payments } = await admin
    .from('payments')
    .select('user_id, amount')
    .eq('status', 'completed')

  const spendByUser = (payments ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.user_id] = (acc[p.user_id] ?? 0) + (p.amount ?? 0)
    return acc
  }, {})

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('allUsers')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {users?.length ?? 0} {q ? `matching "${q}"` : 'total'}
          </p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" action={`/${locale}/admin/users`} className="mt-4">
        <input
          name="q"
          defaultValue={q}
          placeholder={t('searchPlaceholder')}
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </form>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-100 px-5 py-3 dark:border-zinc-800">
          {[t('colEmail'), t('colRole'), t('colTickets'), t('colSpent'), t('colJoined')].map((h) => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {h}
            </span>
          ))}
        </div>

        {users && users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-slate-50 px-5 py-4 last:border-0 dark:border-zinc-800/50"
            >
              <span className="truncate text-sm text-slate-900 dark:text-slate-100">
                {user.email}
              </span>
              <UserRoleForm userId={user.id} currentRole={user.role} />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {ticketsByUser[user.id] ?? 0}
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                ${(spendByUser[user.id] ?? 0).toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">
                {fmtDate(user.created_at)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex min-h-[160px] items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noData')}</p>
          </div>
        )}
      </div>
    </>
  )
}

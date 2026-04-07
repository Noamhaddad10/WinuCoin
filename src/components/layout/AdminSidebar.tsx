'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Trophy,
  Plus,
  Users,
  CreditCard,
  ExternalLink,
} from 'lucide-react'

interface AdminSidebarProps {
  locale: string
}

function NavItem({
  href,
  label,
  icon,
  exact = false,
}: {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
}) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-100',
      ].join(' ')}
    >
      <span className="h-4 w-4 shrink-0">{icon}</span>
      {label}
    </Link>
  )
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const t = useTranslations('admin')

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-0.5 py-4">
      {/* Label */}
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Admin
      </p>

      <NavItem
        href={`/${locale}/admin`}
        label={t('dashboard')}
        icon={<LayoutDashboard className="h-4 w-4" />}
        exact
      />
      <NavItem
        href={`/${locale}/admin/competitions`}
        label={t('competitions')}
        icon={<Trophy className="h-4 w-4" />}
      />
      <NavItem
        href={`/${locale}/admin/competitions/create`}
        label={t('createCompetition')}
        icon={<Plus className="h-4 w-4" />}
        exact
      />
      <NavItem
        href={`/${locale}/admin/users`}
        label={t('users')}
        icon={<Users className="h-4 w-4" />}
      />
      <NavItem
        href={`/${locale}/admin/payments`}
        label={t('payments')}
        icon={<CreditCard className="h-4 w-4" />}
      />

      <div className="my-3 border-t border-slate-200 dark:border-zinc-800" />

      <Link
        href={`/${locale}/dashboard`}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-zinc-800 dark:hover:text-slate-300"
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        {t('backToSite')}
      </Link>
    </aside>
  )
}

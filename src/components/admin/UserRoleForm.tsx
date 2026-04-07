'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { updateUserRole } from '@/app/[locale]/admin/actions'

interface UserRoleFormProps {
  userId: string
  currentRole: string
}

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const t = useTranslations('admin')
  const [, formAction, isPending] = useActionState(updateUserRole, '')

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        disabled={isPending}
        onChange={(e) => {
          const form = e.target.closest('form') as HTMLFormElement
          form?.requestSubmit()
        }}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-300"
      >
        <option value="user">{t('roleUser')}</option>
        <option value="admin">{t('roleAdmin')}</option>
      </select>
    </form>
  )
}

'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'

interface CompetitionFilterTabsProps {
  allCount: number
  activeCount: number
  endedCount: number
}

export function CompetitionFilterTabs({ allCount, activeCount, endedCount }: CompetitionFilterTabsProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const current = searchParams.get('filter') ?? 'all'

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', value)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  const tabs = [
    { key: 'all', label: 'All', count: allCount },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'ended', label: 'Ended', count: endedCount },
  ]

  return (
    <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900" role="tablist" aria-label="Filter competitions">
      {tabs.map((tab) => {
        const isActive = current === tab.key
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => setFilter(tab.key)}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-100',
            ].join(' ')}
          >
            {tab.label}
            <span
              className={[
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400',
              ].join(' ')}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

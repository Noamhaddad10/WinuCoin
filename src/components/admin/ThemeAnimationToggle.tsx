'use client'

import { useEffect, useState } from 'react'

const LS_KEY = 'themeAnimationEnabled'

export function ThemeAnimationToggle() {
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.enabled ?? true)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load setting')
        setLoading(false)
      })
  }, [])

  async function handleToggle() {
    if (saving) return
    const next = !enabled
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Unknown error')
      }
      setEnabled(next)
      localStorage.setItem(LS_KEY, String(next))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-6 w-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
  }

  return (
    <div className="flex items-center gap-3">
      <button
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={saving}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          'disabled:opacity-60',
          enabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0',
            'transition duration-200 ease-in-out',
            enabled ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
      <span className="text-sm text-slate-700 dark:text-slate-300">
        {saving ? 'Saving…' : enabled ? 'Enabled' : 'Disabled'}
      </span>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}

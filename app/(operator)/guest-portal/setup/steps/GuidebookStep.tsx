'use client'

import ToggleSwitch from '@/components/ui/toggle-switch'
import { GUIDEBOOKS } from '@/lib/data/guidebooks'
import type { StepProps } from '../types'

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'brand', label: 'Brand' },
] as const

export default function GuidebookStep({ form, update, accent }: StepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Guidebook</h2>
      <p className="text-sm text-[var(--text-muted)] mb-7">Link a digital guidebook to your guest portal.</p>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">Enable Guidebook</div>
          <div className="text-xs text-[var(--text-muted)]">Show property guidebook in the portal</div>
        </div>
        <ToggleSwitch checked={form.guidebookEnabled} onChange={v => update({ guidebookEnabled: v })} />
      </div>

      {form.guidebookEnabled && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Linked Guidebook</label>
            <select
              value={form.linkedGuidebookId}
              onChange={e => update({ linkedGuidebookId: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none"
            >
              <option value="">Select a guidebook…</option>
              {GUIDEBOOKS.map(g => (
                <option key={g.id} value={g.id}>{g.propertyName} — {g.status}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-sm font-medium text-[var(--text-muted)] mb-3">Theme</div>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update({ guidebookTheme: opt.value })}
                  className="flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    border: `1.5px solid ${form.guidebookTheme === opt.value ? accent : 'var(--border)'}`,
                    background: form.guidebookTheme === opt.value ? `${accent}14` : 'var(--bg-elevated)',
                    color: form.guidebookTheme === opt.value ? accent : 'var(--text-muted)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

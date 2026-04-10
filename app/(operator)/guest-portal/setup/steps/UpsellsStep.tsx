'use client'

import { Check } from 'lucide-react'
import ToggleSwitch from '@/components/ui/toggle-switch'
import { UPSELL_RULES } from '@/lib/data/upsells'
import type { StepProps } from '../types'

const STARTER_UPSELLS = UPSELL_RULES.slice(0, 6)

export default function UpsellsStep({ form, update, accent }: StepProps) {
  const toggleUpsell = (id: string) => {
    const next = form.starterUpsells.includes(id)
      ? form.starterUpsells.filter(u => u !== id)
      : [...form.starterUpsells, id]
    update({ starterUpsells: next })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Upsells</h2>
      <p className="text-sm text-[var(--text-muted)] mb-7">Choose starter upsells to offer guests in the portal.</p>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">Enable Upsells</div>
          <div className="text-xs text-[var(--text-muted)]">Let guests purchase add-ons through the portal</div>
        </div>
        <ToggleSwitch checked={form.upsellsEnabled} onChange={v => update({ upsellsEnabled: v })} />
      </div>

      {form.upsellsEnabled && (
        <div className="grid gap-3 sm:grid-cols-2">
          {STARTER_UPSELLS.map(rule => {
            const selected = form.starterUpsells.includes(rule.id)
            return (
              <button
                key={rule.id}
                onClick={() => toggleUpsell(rule.id)}
                className="relative rounded-xl border p-4 text-left transition-colors"
                style={{
                  borderColor: selected ? accent : 'var(--border)',
                  background: selected ? `${accent}0a` : 'var(--bg-elevated)',
                }}
              >
                {selected && (
                  <div
                    className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ background: accent }}
                  >
                    <Check size={10} color="#fff" />
                  </div>
                )}
                <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">{rule.title}</div>
                <div className="text-xs text-[var(--text-muted)] mb-2">{rule.description}</div>
                <div className="text-xs font-medium" style={{ color: accent }}>
                  {rule.price} {rule.currency}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

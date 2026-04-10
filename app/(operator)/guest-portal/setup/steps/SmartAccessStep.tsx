'use client'

import ToggleSwitch from '@/components/ui/toggle-switch'
import type { StepProps } from '../types'

const ACCESS_METHODS = [
  { value: 'manual_code', label: 'Manual Code' },
  { value: 'smart_lock', label: 'Smart Lock' },
  { value: 'lockbox', label: 'Lockbox' },
  { value: 'key_handoff', label: 'Key Handoff' },
] as const

const SEND_TIMINGS = ['12h', '24h', '48h', '72h']

export default function SmartAccessStep({ form, update, accent }: StepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Smart Access</h2>
      <p className="text-sm text-[var(--text-muted)] mb-7">Configure how guests receive access to your property.</p>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">Enable Smart Access</div>
          <div className="text-xs text-[var(--text-muted)]">Automate access code delivery to guests</div>
        </div>
        <ToggleSwitch checked={form.smartAccessEnabled} onChange={v => update({ smartAccessEnabled: v })} />
      </div>

      {form.smartAccessEnabled && (
        <>
          <div className="mb-6">
            <div className="text-sm font-medium text-[var(--text-muted)] mb-3">Access Method</div>
            <div className="grid grid-cols-2 gap-2">
              {ACCESS_METHODS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update({ accessMethod: opt.value })}
                  className="rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    borderColor: form.accessMethod === opt.value ? accent : 'var(--border)',
                    background: form.accessMethod === opt.value ? `${accent}12` : 'var(--bg-elevated)',
                    color: form.accessMethod === opt.value ? accent : 'var(--text-muted)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Auto-Send Access</div>
              <div className="text-xs text-[var(--text-muted)]">Automatically send access info before check-in</div>
            </div>
            <ToggleSwitch checked={form.autoSend} onChange={v => update({ autoSend: v })} />
          </div>

          {form.autoSend && (
            <div>
              <div className="text-sm font-medium text-[var(--text-muted)] mb-3">Send Timing (before check-in)</div>
              <div className="flex gap-2">
                {SEND_TIMINGS.map(t => (
                  <button
                    key={t}
                    onClick={() => update({ sendTiming: t })}
                    className="flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      border: `1.5px solid ${form.sendTiming === t ? accent : 'var(--border)'}`,
                      background: form.sendTiming === t ? `${accent}14` : 'var(--bg-elevated)',
                      color: form.sendTiming === t ? accent : 'var(--text-muted)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

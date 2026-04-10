'use client'

import ToggleSwitch from '@/components/ui/toggle-switch'
import type { StepProps } from '../types'

const VERIFICATION_STEPS = [
  { id: 'id', label: 'ID Verification' },
  { id: 'selfie', label: 'Selfie Match' },
  { id: 'rental_agreement', label: 'Rental Agreement' },
  { id: 'house_rules', label: 'House Rules Acceptance' },
  { id: 'payment', label: 'Payment Confirmation' },
  { id: 'deposit', label: 'Security Deposit' },
  { id: 'guest_details', label: 'Guest Details Form' },
]

const DOOR_CODE_OPTIONS = [
  { value: 'always', label: 'Always' },
  { value: 'verified_only', label: 'After Verification' },
  { value: 'time_gated', label: 'Time-gated' },
] as const

export default function VerificationStep({ form, update, accent }: StepProps) {
  const toggleStep = (id: string) => {
    const next = form.requiredSteps.includes(id)
      ? form.requiredSteps.filter(s => s !== id)
      : [...form.requiredSteps, id]
    update({ requiredSteps: next })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Guest Verification</h2>
      <p className="text-sm text-[var(--text-muted)] mb-7">Control what guests must complete before accessing their portal.</p>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">Enable Verification</div>
          <div className="text-xs text-[var(--text-muted)]">Require guests to verify before check-in</div>
        </div>
        <ToggleSwitch checked={form.verificationEnabled} onChange={v => update({ verificationEnabled: v })} />
      </div>

      {form.verificationEnabled && (
        <>
          <div className="mb-6">
            <div className="text-sm font-medium text-[var(--text-muted)] mb-3">Required Steps</div>
            <div className="flex flex-col gap-2">
              {VERIFICATION_STEPS.map(vs => (
                <button
                  key={vs.id}
                  onClick={() => toggleStep(vs.id)}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors"
                  style={{
                    borderColor: form.requiredSteps.includes(vs.id) ? accent : 'var(--border)',
                    background: form.requiredSteps.includes(vs.id) ? `${accent}0e` : 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {vs.label}
                  {form.requiredSteps.includes(vs.id) && (
                    <span className="text-xs font-semibold" style={{ color: accent }}>Required</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-[var(--text-muted)] mb-3">Door Code Reveal</div>
            <div className="flex gap-2">
              {DOOR_CODE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update({ doorCodeMode: opt.value })}
                  className="flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    border: `1.5px solid ${form.doorCodeMode === opt.value ? accent : 'var(--border)'}`,
                    background: form.doorCodeMode === opt.value ? `${accent}14` : 'var(--bg-elevated)',
                    color: form.doorCodeMode === opt.value ? accent : 'var(--text-muted)',
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

'use client'

import { useState } from 'react'
import { ShieldCheck, ScanFace, Camera, FileText, ScrollText, CreditCard, Fingerprint, UserCheck } from 'lucide-react'
import { ALL_STEPS, STEP_LABELS, type VerificationStep } from '@/lib/data/verification'
import ModuleCard from './ModuleCard'
import ToggleSwitch from '@/components/ui/toggle-switch'
import { Button } from '@/components/ui/button'

const DOOR_CODE_OPTIONS = [
  { value: 'always', label: 'Always visible' },
  { value: 'verified_only', label: 'After verification only' },
  { value: 'time_gated', label: 'Time-gated (X hours before check-in)' },
] as const

const DEFAULT_REQUIRED: VerificationStep[] = [
  'id_verification',
  'selfie_match',
  'rental_agreement',
  'house_rules',
  'payment_confirmation',
]

const STEP_ICONS: Record<string, React.ElementType> = {
  id_verification: ScanFace,
  selfie_match: Camera,
  rental_agreement: FileText,
  house_rules: ScrollText,
  payment_confirmation: CreditCard,
  damage_deposit: Fingerprint,
  guest_details: UserCheck,
}

export default function VerificationPanel() {
  const [enabled, setEnabled] = useState(true)
  const [requiredSteps, setRequiredSteps] = useState<Set<VerificationStep>>(
    () => new Set(DEFAULT_REQUIRED),
  )
  const [doorCodeMode, setDoorCodeMode] = useState<string>('verified_only')

  function handleStepToggle(step: VerificationStep) {
    setRequiredSteps((prev) => {
      const next = new Set(prev)
      if (next.has(step)) {
        next.delete(step)
      } else {
        next.add(step)
      }
      return next
    })
  }

  const configContent = (
    <>
      {/* Required steps */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Required Steps
        </span>
        <div className="flex flex-col gap-0.5">
          {ALL_STEPS.map((step) => {
            const StepIcon = STEP_ICONS[step] ?? ShieldCheck
            return (
              <div
                key={step}
                className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2"
              >
                <div className="flex items-center gap-2.5">
                  <StepIcon className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)]">
                    {STEP_LABELS[step]}
                  </span>
                </div>
                <ToggleSwitch
                  checked={requiredSteps.has(step)}
                  onChange={() => handleStepToggle(step)}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Door code reveal mode */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Door Code Reveal
        </span>
        <div className="flex flex-wrap gap-1.5">
          {DOOR_CODE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={doorCodeMode === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDoorCodeMode(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <ModuleCard
      icon={ShieldCheck}
      title="Verification"
      description="Control identity checks before portal access"
      accentColor="var(--status-blue-fg)"
      enabled={enabled}
      onToggle={setEnabled}
      stats={[
        { label: '82% completion' },
        { label: '18 min avg' },
        { label: '13 guests' },
      ]}
      configContent={configContent}
      manageLink={{ href: '/operator/verification', label: 'Manage in detail' }}
    />
  )
}

'use client'

import { Check } from 'lucide-react'
import { GUIDEBOOKS } from '@/lib/data/guidebooks'
import type { WizardFormState } from '../types'

interface ReviewStepProps {
  form: WizardFormState
  accent: string
  onEdit: () => void
  onActivate: () => void
}

interface SummaryRow {
  module: string
  enabled: boolean
  detail: string
}

function buildSummary(form: WizardFormState): SummaryRow[] {
  const gb = GUIDEBOOKS.find(g => g.id === form.linkedGuidebookId)

  return [
    {
      module: 'Verification',
      enabled: form.verificationEnabled,
      detail: form.verificationEnabled
        ? `${form.requiredSteps.length} steps · Code: ${form.doorCodeMode.replace('_', ' ')}`
        : 'Skipped',
    },
    {
      module: 'Guidebook',
      enabled: form.guidebookEnabled,
      detail: form.guidebookEnabled
        ? `${gb?.propertyName ?? 'None selected'} · ${form.guidebookTheme} theme`
        : 'Skipped',
    },
    {
      module: 'Messaging',
      enabled: form.messagingEnabled,
      detail: form.messagingEnabled
        ? `${form.channels.length} channels · Auto-reply ${form.autoReplyOn ? 'on' : 'off'} · ${form.responseGoal} goal`
        : 'Skipped',
    },
    {
      module: 'Upsells',
      enabled: form.upsellsEnabled,
      detail: form.upsellsEnabled
        ? `${form.starterUpsells.length} upsells selected`
        : 'Skipped',
    },
    {
      module: 'Smart Access',
      enabled: form.smartAccessEnabled,
      detail: form.smartAccessEnabled
        ? `${form.accessMethod.replace('_', ' ')} · Auto-send ${form.autoSend ? form.sendTiming + ' before' : 'off'}`
        : 'Skipped',
    },
  ]
}

const NEXT_STEPS = [
  'Portal is live — guests can access it immediately',
  'Modules you enabled are active for all linked properties',
  'You can fine-tune each module from the Guest Portal config page',
]

export default function ReviewStep({ form, accent, onEdit, onActivate }: ReviewStepProps) {
  const rows = buildSummary(form)

  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Review & Activate</h2>
      <p className="text-sm text-[var(--text-muted)] mb-7">Everything look good? Activate your guest portal.</p>

      {/* Summary card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden mb-5">
        {rows.map((row, i) => (
          <div
            key={row.module}
            className="flex items-center px-4 py-3 text-sm"
            style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
          >
            <span className="w-28 shrink-0 text-xs font-medium text-[var(--text-muted)]">{row.module}</span>
            <span
              className="mr-2 inline-block h-2 w-2 rounded-full shrink-0"
              style={{ background: row.enabled ? '#059669' : 'var(--border)' }}
            />
            <span className="text-[var(--text-primary)]">{row.detail}</span>
          </div>
        ))}
      </div>

      {/* What happens next */}
      <div className="rounded-xl bg-[var(--bg-elevated)] p-4 mb-6">
        <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">What happens next</div>
        {NEXT_STEPS.map(item => (
          <div key={item} className="flex items-center gap-2 mb-1.5 last:mb-0">
            <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-600">
              <Check size={10} color="#fff" />
            </div>
            <span className="text-sm text-[var(--text-muted)]">{item}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)]"
        >
          Edit Details
        </button>
        <button
          onClick={onActivate}
          className="flex-[2] rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: accent }}
        >
          Activate Portal
        </button>
      </div>
    </div>
  )
}

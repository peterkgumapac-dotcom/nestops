'use client'

import ToggleSwitch from '@/components/ui/toggle-switch'
import type { StepProps } from '../types'

const CHANNEL_OPTIONS = [
  { id: 'in_app', label: 'In-app' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'Email' },
]

const RESPONSE_GOALS = ['5m', '15m', '1h', '4h']

export default function MessagingStep({ form, update, accent }: StepProps) {
  const toggleChannel = (id: string) => {
    const next = form.channels.includes(id)
      ? form.channels.filter(c => c !== id)
      : [...form.channels, id]
    update({ channels: next })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Guest Messaging</h2>
      <p className="text-sm text-[var(--text-muted)] mb-7">Configure how guests can reach you through the portal.</p>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">Enable Messaging</div>
          <div className="text-xs text-[var(--text-muted)]">Allow guests to message your team</div>
        </div>
        <ToggleSwitch checked={form.messagingEnabled} onChange={v => update({ messagingEnabled: v })} />
      </div>

      {form.messagingEnabled && (
        <>
          <div className="mb-6">
            <div className="text-sm font-medium text-[var(--text-muted)] mb-3">Channels</div>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_OPTIONS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => toggleChannel(ch.id)}
                  className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    border: `1.5px solid ${form.channels.includes(ch.id) ? accent : 'var(--border)'}`,
                    background: form.channels.includes(ch.id) ? `${accent}14` : 'var(--bg-elevated)',
                    color: form.channels.includes(ch.id) ? accent : 'var(--text-muted)',
                  }}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Auto-Reply</div>
              <div className="text-xs text-[var(--text-muted)]">Send instant acknowledgment to guests</div>
            </div>
            <ToggleSwitch checked={form.autoReplyOn} onChange={v => update({ autoReplyOn: v })} />
          </div>

          <div>
            <div className="text-sm font-medium text-[var(--text-muted)] mb-3">Response Time Goal</div>
            <div className="flex gap-2">
              {RESPONSE_GOALS.map(g => (
                <button
                  key={g}
                  onClick={() => update({ responseGoal: g })}
                  className="flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    border: `1.5px solid ${form.responseGoal === g ? accent : 'var(--border)'}`,
                    background: form.responseGoal === g ? `${accent}14` : 'var(--bg-elevated)',
                    color: form.responseGoal === g ? accent : 'var(--text-muted)',
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

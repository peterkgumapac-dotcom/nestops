'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import ModuleCard from './ModuleCard'
import ToggleSwitch from '@/components/ui/toggle-switch'
import { Button } from '@/components/ui/button'

const ACCESS_METHODS = ['Manual code', 'Smart lock', 'Lockbox', 'Key handoff'] as const
const ROTATION_OPTIONS = ['Per guest', 'Weekly', 'Monthly', 'Static'] as const
const SEND_TIMING = [
  { value: '2', label: '2h before' },
  { value: '6', label: '6h before' },
  { value: '12', label: '12h before' },
  { value: '24', label: '24h before' },
  { value: '48', label: '48h before' },
] as const

export default function SmartAccessPanel() {
  const [enabled, setEnabled] = useState(true)
  const [accessMethod, setAccessMethod] = useState<string>('Manual code')
  const [rotation, setRotation] = useState<string>('Per guest')
  const [autoSend, setAutoSend] = useState(true)
  const [sendTiming, setSendTiming] = useState('24')

  const configContent = (
    <>
      {/* Access method */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Access Method
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ACCESS_METHODS.map((m) => (
            <Button
              key={m}
              variant={accessMethod === m ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAccessMethod(m)}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {/* Code rotation */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Code Rotation
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ROTATION_OPTIONS.map((r) => (
            <Button
              key={r}
              variant={rotation === r ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRotation(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      {/* Auto-send toggle */}
      <div className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2">
        <span className="text-sm text-[var(--text-primary)]">Auto-send code</span>
        <ToggleSwitch checked={autoSend} onChange={setAutoSend} />
      </div>

      {/* Send timing */}
      {autoSend && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Send Timing
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SEND_TIMING.map((t) => (
              <Button
                key={t.value}
                variant={sendTiming === t.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSendTiming(t.value)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  )

  return (
    <ModuleCard
      icon={KeyRound}
      title="Smart Access"
      description="Access codes and lock management"
      accentColor="var(--status-red-fg)"
      enabled={enabled}
      onToggle={setEnabled}
      stats={[
        { label: '5 properties' },
        { label: '3 active guest codes' },
      ]}
      configContent={configContent}
      comingSoon
    />
  )
}

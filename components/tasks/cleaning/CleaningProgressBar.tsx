'use client'

import { type CleaningProgress } from '@/hooks/tasks/useCleaningProgress'
import { Check, AlertTriangle } from 'lucide-react'

interface Props {
  progress: CleaningProgress
  checkInTime?: string | null
}

const STATE_COLORS: Record<string, string> = {
  done: 'var(--status-green-fg)',
  overdue: 'var(--status-red-fg)',
  approaching: 'var(--status-amber-fg)',
  ontrack: 'var(--status-green-fg)',
}

export function CleaningProgressBar({ progress, checkInTime }: Props) {
  const { percent, state, bufferMinutes, estimatedEndTime } = progress

  const barColor = STATE_COLORS[state] ?? STATE_COLORS.ontrack
  const barWidth = Math.min(percent, 100)

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  const overdueMinutes = percent > 100 ? Math.round(((percent - 100) / 100) * (progress.elapsedMinutes)) : 0

  return (
    <div className="mb-4">
      {/* Bar track */}
      <div className="relative h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
        <div
          className="h-full rounded-full transition-[width] duration-1000"
          style={{
            width: `${barWidth}%`,
            background: barColor,
            animation: state === 'overdue' ? 'pulse-bar 1.5s ease-in-out infinite' : undefined,
          }}
        />
      </div>

      {/* Labels row */}
      <div className="mt-1.5 flex items-center justify-between">
        <span
          className="flex items-center gap-1 text-[11px] font-semibold"
          style={{ color: barColor }}
        >
          {state === 'done' ? (
            <><Check className="h-3 w-3" strokeWidth={2} /> Done</>
          ) : state === 'overdue' ? (
            <><AlertTriangle className="h-3 w-3" strokeWidth={2} /> {overdueMinutes}m overdue</>
          ) : state === 'approaching' ? (
            `${100 - percent}% remaining · ${Math.round(bufferMinutes)}m buffer`
          ) : (
            `${Math.round(percent)}% complete`
          )}
        </span>

        <span className="text-[11px] text-[var(--text-subtle)]">
          {state !== 'done' && (
            <>Est. done {formatTime(estimatedEndTime)}{checkInTime ? ` · Check-in ${checkInTime}` : ''}</>
          )}
        </span>
      </div>

    </div>
  )
}

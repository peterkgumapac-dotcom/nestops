'use client'

import { type CleaningProgress } from '@/hooks/tasks/useCleaningProgress'

interface Props {
  progress: CleaningProgress
  checkInTime?: string | null
}

export function CleaningProgressBar({ progress, checkInTime }: Props) {
  const { percent, state, bufferMinutes, estimatedEndTime } = progress

  const barColor =
    state === 'done'
      ? '#10b981'
      : state === 'overdue'
      ? '#ef4444'
      : state === 'approaching'
      ? '#f59e0b'
      : '#10b981'

  const barWidth = Math.min(percent, 100)

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  const overdueMinutes = percent > 100 ? Math.round(((percent - 100) / 100) * (progress.elapsedMinutes)) : 0

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Bar track */}
      <div style={{
        height: 8, borderRadius: 99,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div
          style={{
            height: '100%',
            width: `${barWidth}%`,
            borderRadius: 99,
            background: barColor,
            transition: 'width 1s linear, background 0.5s',
            animation: state === 'overdue' ? 'pulse-bar 1.5s ease-in-out infinite' : undefined,
          }}
        />
      </div>

      {/* Labels row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: barColor,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {state === 'done' ? (
            '✓ Done'
          ) : state === 'overdue' ? (
            `⚠ ${overdueMinutes}m overdue`
          ) : state === 'approaching' ? (
            `${100 - percent}% remaining · ${Math.round(bufferMinutes)}m buffer`
          ) : (
            `${percent}% complete`
          )}
        </span>

        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          {state !== 'done' && (
            <>Est. done {formatTime(estimatedEndTime)}{checkInTime ? ` · Check-in ${checkInTime}` : ''}</>
          )}
        </span>
      </div>

      <style>{`
        @keyframes pulse-bar {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

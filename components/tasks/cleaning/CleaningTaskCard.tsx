'use client'

import { JOBS } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'
import type { Shift } from '@/lib/data/staffScheduling'
import { Card } from '@/components/ui/card'
import { Eye, KeyRound, AlertTriangle } from 'lucide-react'

interface CleaningTaskCardProps {
  shift: Shift
  isFirst: boolean
  showTaskCount?: boolean
  showAccessCode?: boolean
  showTurnaround?: boolean
  codeVisible: boolean
  onToggleCode: () => void
  onOpen?: () => void
}

export function CleaningTaskCard({
  shift,
  isFirst,
  showTaskCount,
  showAccessCode,
  showTurnaround,
  codeVisible,
  onToggleCode,
  onOpen,
}: CleaningTaskCardProps) {
  const prop = PROPERTIES.find(p => p.id === shift.propertyId)
  const [startH, startM] = shift.startTime.split(':').map(Number)
  const [endH, endM] = shift.endTime.split(':').map(Number)
  const durationMins = (endH * 60 + endM) - (startH * 60 + startM)
  const durationStr = durationMins % 60 === 0
    ? `${durationMins / 60}h`
    : `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
  const taskCount = shift.jobIds.length
  const cleanType = shift.notes?.toLowerCase().includes('deep') ? 'DEEP CLEAN' : 'TURNOVER CLEAN'
  const linkedJobs = JOBS.filter(j => shift.jobIds.includes(j.id))
  const jobWithCheckin = linkedJobs.find(j => j.checkinTime && j.checkoutTime)
  let tightTurnaround = false
  if (jobWithCheckin?.checkinTime && jobWithCheckin?.checkoutTime) {
    const [coh, com] = jobWithCheckin.checkoutTime.split(':').map(Number)
    const [cih, cim] = jobWithCheckin.checkinTime.split(':').map(Number)
    tightTurnaround = (cih * 60 + cim) - (coh * 60 + com) < 240
  }
  const accessCode = prop?.accessCodes?.[0]?.code ?? 'Check SuiteOp'

  return (
    <Card
      className="mb-3 overflow-hidden p-4 transition-colors hover:border-[var(--accent-border)]"
      onClick={onOpen}
      style={{ cursor: onOpen ? 'pointer' : 'default' }}
    >
      {prop?.imageUrl && (
        <img
          src={prop.imageUrl}
          alt={prop.name ?? shift.propertyId}
          className="mb-3 h-32 w-full rounded-lg object-cover"
        />
      )}

      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          {cleanType}
        </span>
        <span
          className="ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            background: isFirst ? 'var(--status-blue-bg)' : 'var(--status-amber-bg)',
            color: isFirst ? 'var(--status-blue-fg)' : 'var(--status-amber-fg)',
          }}
        >
          {isFirst ? 'NEXT UP' : 'LATER'}
        </span>
      </div>

      <div className="mb-1 text-sm text-[var(--text-muted)]">
        {prop?.name ?? shift.propertyId} · {shift.startTime} – {shift.endTime}
      </div>

      {showTaskCount && (
        <div className="mb-1 text-[13px] text-[var(--text-subtle)]">
          {durationStr} window · {taskCount} task{taskCount !== 1 ? 's' : ''}
        </div>
      )}

      {jobWithCheckin?.checkinTime && (
        <div className="mb-1 text-xs text-[var(--text-subtle)]">
          Check-in: {jobWithCheckin.checkinTime}
        </div>
      )}

      {showAccessCode && (
        codeVisible ? (
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-lg bg-[var(--bg-elevated)] px-3 py-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
            <KeyRound className="h-3.5 w-3.5 text-[var(--text-muted)]" strokeWidth={1.5} />
            {accessCode}
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onToggleCode() }}
            className="mb-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
            style={{
              color: 'var(--status-blue-fg)',
              background: 'var(--status-blue-bg)',
              border: '1px solid rgba(96,165,250,0.3)',
            }}
          >
            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
            Show Code
          </button>
        )
      )}

      {showTurnaround && tightTurnaround && jobWithCheckin && (
        <div
          className="mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
          style={{
            background: 'var(--status-amber-bg)',
            color: 'var(--status-amber-fg)',
          }}
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          Tight turnaround — {prop?.name ?? shift.propertyId}, next check-in {jobWithCheckin.checkinTime}
        </div>
      )}
    </Card>
  )
}

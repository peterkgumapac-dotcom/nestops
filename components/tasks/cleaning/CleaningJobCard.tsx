'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Check, Clock, Eye, EyeOff, AlertTriangle, Play,
  Package, Timer, Wrench,
} from 'lucide-react'
import type { CleaningJob } from '@/lib/types/cleaning'
import { CLEANING_STATUS_COLOR, CLEANING_STATUS_BG } from '@/lib/types/cleaning'
import type { Property } from '@/lib/data/properties'
import type { PropertyWeather } from '@/lib/data/weather'
import type { ChecklistItem } from '@/lib/data/checklists'

// ─── Delivery Card ─────────────────────────────────────────────────────────────

interface DeliveryCardProps {
  job: CleaningJob & { isDelivery: true }
  effectiveStatus: CleaningJob['status']
  onStart: () => void
}

export function DeliveryJobCard({ job, effectiveStatus, onStart }: DeliveryCardProps) {
  const statusColor = CLEANING_STATUS_COLOR[effectiveStatus]

  return (
    <Card
      className={`p-3.5 ${effectiveStatus === 'done' ? 'opacity-60' : ''}`}
      style={{ borderLeft: '4px solid var(--status-amber-fg)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-[7px] py-0.5 rounded-[10px] bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border border-[var(--status-amber-fg)]">
          <Package size={10} /> Delivery
        </span>
        <span className="text-[13px] font-semibold text-[var(--text-primary)]">{job.property}</span>
      </div>
      <div className="text-xs text-[var(--text-muted)] mb-2">
        <Clock size={12} className="inline mr-1 -mt-px" />
        {job.timeWindow}
      </div>
      {effectiveStatus === 'pending' ? (
        <Button
          onClick={e => { e.stopPropagation(); onStart() }}
          className="w-full rounded-lg font-semibold bg-[var(--status-amber-fg)] hover:bg-[var(--status-amber-fg)]/80 text-white"
        >
          <Play size={13} className="mr-1" fill="currentColor" /> Start Delivery
        </Button>
      ) : (
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-[10px]"
          style={{ background: CLEANING_STATUS_BG[effectiveStatus], color: statusColor, border: `1px solid ${statusColor}` }}
        >
          {effectiveStatus === 'in-progress' ? 'In progress' : <><Check size={10} className="inline mr-0.5" /> Done</>}
        </span>
      )}
    </Card>
  )
}

// ─── Cleaning Card ─────────────────────────────────────────────────────────────

interface CleaningJobCardProps {
  job: CleaningJob
  effectiveStatus: CleaningJob['status']
  isFirst: boolean
  isSupervisor: boolean
  property: Property | undefined
  weather: PropertyWeather | null
  checklist: ChecklistItem[]
  isTightTurnaround: boolean
  codeVisible: boolean
  startedAt: string | undefined
  elapsedMins: number
  estDone: string
  hasDelegationPending: boolean
  onToggleCode: () => void
  onStart: () => void
  onResumeChecklist: () => void
  onReport: () => void
}

export function CleaningJobCard({
  job,
  effectiveStatus,
  isFirst,
  isSupervisor,
  property,
  weather,
  checklist,
  isTightTurnaround,
  codeVisible,
  startedAt,
  elapsedMins,
  estDone,
  hasDelegationPending,
  onToggleCode,
  onStart,
  onResumeChecklist,
  onReport,
}: CleaningJobCardProps) {
  const statusColor = CLEANING_STATUS_COLOR[effectiveStatus]
  const accessCode = property?.accessCodes?.[0]

  return (
    <Card className={`overflow-hidden p-0 ${effectiveStatus === 'done' ? 'opacity-60' : ''}`}>
      {/* Property image */}
      {property?.imageUrl && (
        <img
          src={property.imageUrl}
          alt={job.property}
          className="w-full h-32 object-cover block"
        />
      )}

      <div className="p-4">
        {/* Title + badge */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">{job.property}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isFirst
              ? 'bg-[var(--status-blue-bg)] text-[var(--status-blue-fg)]'
              : 'bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]'
          }`}>
            {isFirst ? 'NEXT UP' : job.type}
          </span>
        </div>

        {/* Time + checkout/checkin */}
        <div className="text-xs text-[var(--text-muted)] mb-1">
          <Clock size={12} className="inline mr-1 -mt-px" />
          {job.timeWindow} · Out {job.checkoutTime} → In {job.checkinTime}
          {isSupervisor && <span> · {job.assignedTo}</span>}
        </div>

        {/* Per-property weather */}
        {weather && (
          <div className="text-xs text-[var(--text-muted)] mb-1.5">
            {weather.icon} {weather.temperature}°C · {weather.location}
            {weather.note ? ` · ${weather.note}` : ''}
          </div>
        )}

        {/* Tight turnaround */}
        {isTightTurnaround && effectiveStatus !== 'done' && (
          <div className="text-xs text-[var(--status-warning)] mb-2">
            <AlertTriangle size={12} className="inline mr-1 -mt-px" />
            Tight: next check-in {job.checkinTime}
          </div>
        )}

        {/* Access info */}
        {accessCode && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
            <span>Access: {accessCode.label}</span>
            <button
              onClick={e => { e.stopPropagation(); onToggleCode() }}
              className="bg-[var(--bg-elevated)] rounded-lg px-2.5 py-1 text-[var(--status-info)] text-xs font-semibold cursor-pointer border-none"
            >
              {codeVisible ? (
                <><span className="tabular-nums font-semibold">{accessCode.code}</span> <EyeOff size={13} /></>
              ) : (
                <>Show Code <Eye size={13} /></>
              )}
            </button>
          </div>
        )}

        {/* Progress bar */}
        {checklist.length > 0 && (
          <>
            <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)] mb-2">
              <div
                className="h-full rounded-full bg-[var(--status-success)] transition-[width] duration-300"
                style={{ width: effectiveStatus === 'done' ? '100%' : effectiveStatus === 'in-progress' ? '35%' : '0%' }}
              />
            </div>
            <div className="text-xs text-[var(--text-muted)] mb-2.5">
              {effectiveStatus === 'done' ? checklist.length : effectiveStatus === 'in-progress' ? Math.round(checklist.length * 0.35) : 0} of {checklist.length} tasks complete
            </div>
          </>
        )}

        {/* Inline checklist preview (first 3 items) */}
        {effectiveStatus !== 'done' && checklist.length > 0 && (
          <div className="mb-3">
            {checklist.slice(0, 3).map((task, ti) => (
              <div
                key={ti}
                className={`flex items-start gap-2 py-1.5 ${ti < 2 ? 'border-b border-[var(--border)]' : ''}`}
              >
                <div className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center border-2 border-[var(--bg-elevated)] bg-transparent" />
                <span className="text-sm text-[var(--text-primary)]">{task.label}</span>
              </div>
            ))}
            {checklist.length > 3 && (
              <div className="text-xs text-[var(--text-subtle)] mt-1">+ {checklist.length - 3} more</div>
            )}
          </div>
        )}

        {/* Timer when in progress */}
        {effectiveStatus === 'in-progress' && startedAt && (
          <div className="text-[11px] text-[var(--status-green-fg)] mb-2">
            <Timer size={12} className="inline mr-0.5 -mt-px" /> {elapsedMins >= 60 ? `${Math.floor(elapsedMins / 60)}h ${elapsedMins % 60}m` : `${elapsedMins}m`} elapsed · Est. done {estDone}
          </div>
        )}

        {/* CTA — full width */}
        {effectiveStatus === 'pending' ? (
          <Button
            onClick={e => { e.stopPropagation(); onStart() }}
            className={`mt-1 w-full rounded-full font-semibold ${
              isFirst
                ? 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white'
                : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 text-white'
            }`}
          >
            <Play size={13} className="mr-1" fill="currentColor" /> {isFirst ? 'Start This Clean' : 'Start Clean'}
          </Button>
        ) : effectiveStatus === 'in-progress' ? (
          <div className="flex gap-2 mt-1">
            <Button
              onClick={onResumeChecklist}
              className="flex-1 rounded-full font-semibold bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white"
            >
              Resume Checklist
            </Button>
            <Button
              onClick={e => { e.stopPropagation(); onReport() }}
              variant="outline"
              className="rounded-lg font-medium"
            >
              <Wrench size={14} className="mr-1" /> Report
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-[10px]"
              style={{ background: CLEANING_STATUS_BG[effectiveStatus], color: statusColor, border: `1px solid ${statusColor}` }}
            >
              <Check size={10} /> Done
            </span>
            {hasDelegationPending && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-px rounded-[10px] bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]">
                <Clock size={10} /> Pending reassignment
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

'use client'
import { JOBS } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'
import type { Shift } from '@/lib/data/staffScheduling'

interface CleaningTaskCardProps {
  shift: Shift
  isFirst: boolean
  showTaskCount?: boolean
  showAccessCode?: boolean
  showTurnaround?: boolean
  codeVisible: boolean
  onToggleCode: () => void
}

export function CleaningTaskCard({
  shift,
  isFirst,
  showTaskCount,
  showAccessCode,
  showTurnaround,
  codeVisible,
  onToggleCode,
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
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 12, overflow: 'hidden' }}>
      {prop?.imageUrl && (
        <img src={prop.imageUrl} alt={prop.name ?? shift.propertyId} style={{ width: '100%', height: 96, borderRadius: 8, objectFit: 'cover', marginBottom: 12 }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{cleanType}</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: isFirst ? '#3b82f620' : '#d9770620', color: isFirst ? '#60a5fa' : '#fbbf24', flexShrink: 0, marginLeft: 8 }}>
          {isFirst ? 'NEXT UP 🔵' : 'LATER ⏰'}
        </span>
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
        {prop?.name ?? shift.propertyId} · {shift.startTime} – {shift.endTime}
      </div>
      {showTaskCount && (
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
          {durationStr} window · {taskCount} task{taskCount !== 1 ? 's' : ''}
        </div>
      )}
      {jobWithCheckin?.checkinTime && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
          Check-in: {jobWithCheckin.checkinTime}
        </div>
      )}
      {showAccessCode && (
        codeVisible ? (
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 8, display: 'inline-block', marginBottom: 4 }}>
            🔑 {accessCode}
          </div>
        ) : (
          <button
            onClick={onToggleCode}
            style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', marginBottom: 4 }}
          >
            Show Code 👁
          </button>
        )
      )}
      {showTurnaround && tightTurnaround && jobWithCheckin && (
        <div style={{ marginTop: 8, padding: '6px 10px', background: '#fbbf2415', borderRadius: 8, fontSize: 12, color: '#fbbf24' }}>
          ⚠️ Tight turnaround — {prop?.name ?? shift.propertyId}, next check-in {jobWithCheckin.checkinTime}
        </div>
      )}
    </div>
  )
}

'use client'
import { PROPERTIES } from '@/lib/data/properties'
import { isAccessCodeVisible } from '@/lib/utils/pteUtils'
import type { Job } from '@/lib/data/staff'

interface MaintenanceTaskCardProps {
  job: Job
  showPteStatus?: boolean
  showLocation?: boolean
  showAccessCode?: boolean
  codeVisible: boolean
  onToggleCode: () => void
}

function getCardBadge(job: Job): { label: string; color: string; bg: string } {
  const s = job.pteStatus ?? 'not_required'
  const p = job.priority ?? 'medium'
  const isUrgent = p === 'urgent' || p === 'high'

  if (s === 'auto_granted') return { label: 'GO FIRST 🟢', color: '#4ade80', bg: 'rgba(74,222,128,0.15)' }
  if (s === 'pending')      return { label: 'PENDING 🟡', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' }
  if (s === 'denied' || s === 'expired') return { label: 'BLOCKED 🔴', color: '#f87171', bg: 'rgba(248,113,113,0.15)' }
  if (s === 'granted') {
    return isUrgent
      ? { label: 'URGENT 🔴', color: '#f87171', bg: 'rgba(248,113,113,0.15)' }
      : { label: 'READY ✅', color: '#4ade80', bg: 'rgba(74,222,128,0.15)' }
  }
  // not_required
  return isUrgent
    ? { label: 'URGENT 🔴', color: '#f87171', bg: 'rgba(248,113,113,0.15)' }
    : { label: 'SCHEDULED', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' }
}

function getCardBorder(job: Job): string {
  const s = job.pteStatus ?? 'not_required'
  if (s === 'auto_granted') return '1px solid rgba(74,222,128,0.3)'
  if (s === 'pending')      return '1px solid rgba(245,158,11,0.25)'
  if (s === 'denied' || s === 'expired') return '1px solid rgba(248,113,113,0.3)'
  return '1px solid rgba(255,255,255,0.1)'
}

function getPteSubTag(job: Job): { text: string; color: string } | null {
  const s = job.pteStatus ?? 'not_required'
  if (s === 'auto_granted') return { text: '✅ VACANT · Enter any time', color: '#4ade80' }
  if (s === 'granted') {
    const window = job.pte?.validFrom ? ` · from ${job.pte.validFrom}` : ''
    return { text: `✅ PTE Granted${window}`, color: '#4ade80' }
  }
  if (s === 'pending') {
    const note = job.notes ? ` · ${job.notes}` : ''
    return { text: `⏳ Awaiting guest approval${note}`, color: '#f59e0b' }
  }
  return null
}

export function MaintenanceTaskCard({
  job,
  showPteStatus,
  showLocation,
  showAccessCode,
  codeVisible,
  onToggleCode,
}: MaintenanceTaskCardProps) {
  const prop = PROPERTIES.find(p => p.id === job.propertyId)
  const accessCode = prop?.accessCodes?.[0]?.code ?? 'Check SuiteOp'
  const badge = getCardBadge(job)
  const border = getCardBorder(job)
  const pteSubTag = showPteStatus ? getPteSubTag(job) : null
  const codeAccessible = isAccessCodeVisible(job.pteStatus)

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border, borderRadius: 16, padding: '16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{job.title}</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: badge.bg, color: badge.color, flexShrink: 0, marginLeft: 8 }}>
          {badge.label}
        </span>
      </div>

      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
        {job.propertyName}
        {' · '}
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#0ea5e920', color: '#38bdf8', textTransform: 'uppercase' }}>
          {job.type.replace('_', ' ')}
        </span>
      </div>

      {pteSubTag && (
        <div style={{ fontSize: 12, fontWeight: 600, color: pteSubTag.color, marginBottom: 6 }}>
          {pteSubTag.text}
        </div>
      )}

      {showLocation && prop?.city && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
          📌 {prop.city}
        </div>
      )}

      {/* Access code section */}
      {codeAccessible ? (
        showAccessCode && (
          job.pteStatus === 'auto_granted' ? (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 8, display: 'inline-block', marginBottom: 4 }}>
              🔑 {accessCode}
            </div>
          ) : (
            codeVisible ? (
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 8, display: 'inline-block', marginBottom: 4 }}>
                🔑 {accessCode}
              </div>
            ) : (
              <button
                onClick={onToggleCode}
                style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', marginBottom: 4 }}
              >
                Show Code 👁
              </button>
            )
          )
        )
      ) : (
        <div style={{ fontSize: 12, color: job.pteStatus === 'denied' || job.pteStatus === 'expired' ? '#f87171' : '#f59e0b', marginBottom: 4 }}>
          {job.pteStatus === 'denied' || job.pteStatus === 'expired' ? '🔒 Access denied' : '🔒 Code locked — PTE pending'}
        </div>
      )}
    </div>
  )
}

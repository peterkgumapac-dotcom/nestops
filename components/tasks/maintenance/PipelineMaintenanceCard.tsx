'use client'
import type { JobProgress, JobPriority, JobPTEStatus } from '@/lib/data/staff'

export interface PipelineMaintenanceCardProps {
  id: string
  title: string
  propertyName: string
  assigneeName: string
  priority: JobPriority
  dueDisplay?: string
  pteStatus?: JobPTEStatus
  pteValidFrom?: string
  pteValidUntil?: string
  pteGuestName?: string
  progress: JobProgress
  onClick?: () => void
}

const STEPS: { key: JobProgress; label: string }[] = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'en_route', label: 'En route' },
  { key: 'on_site',  label: 'On site' },
  { key: 'done',     label: 'Done' },
]

const STEP_INDEX: Record<JobProgress, number> = {
  assigned: 0, en_route: 1, on_site: 2, done: 3,
}

function tagColor(priority: JobPriority): { bg: string; color: string; border: string } {
  if (priority === 'urgent' || priority === 'high') return { bg: 'rgba(226,75,74,0.10)', color: '#e24b4a', border: 'rgba(226,75,74,0.22)' }
  if (priority === 'medium') return { bg: 'rgba(55,138,221,0.10)', color: '#378ADD', border: 'rgba(55,138,221,0.22)' }
  return { bg: 'rgba(156,163,175,0.10)', color: '#9ca3af', border: 'rgba(156,163,175,0.22)' }
}

function cardBorder(priority: JobPriority, pteStatus?: JobPTEStatus): string {
  if (pteStatus === 'denied' || pteStatus === 'expired') return '1px solid rgba(226,75,74,0.30)'
  if (pteStatus === 'pending') return '1px solid rgba(239,159,39,0.25)'
  if (pteStatus === 'granted' || pteStatus === 'auto_granted') return '1px solid rgba(29,158,117,0.20)'
  if (priority === 'urgent' || priority === 'high') return '1px solid rgba(226,75,74,0.20)'
  return '1px solid rgba(255,255,255,0.07)'
}

function stepPillStyle(rel: 'done' | 'active' | 'inactive'): React.CSSProperties {
  if (rel === 'done')   return { background: 'rgba(29,158,117,0.10)', color: '#15d492', border: '1px solid rgba(29,158,117,0.22)' }
  if (rel === 'active') return { background: 'rgba(55,138,221,0.10)', color: '#378ADD', border: '1px solid rgba(55,138,221,0.22)' }
  return { background: '#161b26', color: '#5a5f6b', border: '1px solid rgba(255,255,255,0.07)' }
}

function getUrgency(validUntil?: string, validFrom?: string): { label: string; color: string; bg: string } | null {
  if (!validUntil) return null
  const now = Date.now()
  const until = new Date(validUntil).getTime()
  const from = validFrom ? new Date(validFrom).getTime() : null
  if (from && now < from) {
    const opensAt = new Date(validFrom!).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return { label: `Opens ${opensAt}`, color: '#378ADD', bg: 'rgba(55,138,221,0.10)' }
  }
  const minsLeft = Math.round((until - now) / 60000)
  if (minsLeft < 0) return { label: 'Window closed', color: '#e24b4a', bg: 'rgba(226,75,74,0.10)' }
  if (minsLeft <= 60) return { label: `⚡ ${minsLeft}m left`, color: '#e24b4a', bg: 'rgba(226,75,74,0.10)' }
  if (minsLeft <= 180) {
    const h = Math.floor(minsLeft / 60), m = minsLeft % 60
    return { label: `⏱ ${h}h${m > 0 ? ` ${m}m` : ''} left`, color: '#ef9f27', bg: 'rgba(239,159,39,0.10)' }
  }
  return null
}

function pteRowInfo(
  pteStatus?: JobPTEStatus,
  validFrom?: string,
  validUntil?: string,
  guestName?: string,
): {
  icon: string
  label: string
  color: string
  bg: string
  border: string
  urgency?: { label: string; color: string; bg: string }
} | null {
  if (!pteStatus || pteStatus === 'not_required') return null

  if (pteStatus === 'granted') {
    const windowStr = validFrom && validUntil
      ? `${new Date(validFrom).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – ${new Date(validUntil).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
      : 'Access granted'
    const label = guestName ? `${windowStr} · ${guestName}` : windowStr
    const urgency = getUrgency(validUntil, validFrom) ?? undefined
    return { icon: '🔑', label, color: '#15d492', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.18)', urgency }
  }

  if (pteStatus === 'auto_granted') {
    return { icon: '✅', label: 'Vacant — open access', color: '#15d492', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.18)' }
  }

  if (pteStatus === 'pending') {
    return { icon: '⏳', label: 'PTE pending · awaiting approval', color: '#ef9f27', bg: 'rgba(239,159,39,0.08)', border: 'rgba(239,159,39,0.20)' }
  }

  if (pteStatus === 'denied' || pteStatus === 'expired') {
    return { icon: '🔒', label: 'PTE denied', color: '#e24b4a', bg: 'rgba(226,75,74,0.08)', border: 'rgba(226,75,74,0.20)' }
  }

  return null
}

const ARROW = (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5a5f6b', flexShrink: 0 }}>
    <path d="M4 8h8M9 5l3 3-3 3"/>
  </svg>
)

export function PipelineMaintenanceCard({
  title, propertyName, assigneeName, priority, dueDisplay, pteStatus,
  pteValidFrom, pteValidUntil, pteGuestName,
  progress, onClick,
}: PipelineMaintenanceCardProps) {
  const tag = tagColor(priority)
  const border = cardBorder(priority, pteStatus)
  const stepIdx = STEP_INDEX[progress]
  const pteRow = pteRowInfo(pteStatus, pteValidFrom, pteValidUntil, pteGuestName)

  const stepSubtitle: Record<JobProgress, string> = {
    assigned: dueDisplay ?? 'Assigned',
    en_route: 'En route',
    on_site:  'On site · Started',
    done:     'Completed',
  }

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', background: '#111722', border, borderRadius: 12,
        overflow: 'hidden', marginBottom: 12,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 40px 10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
          background: tag.bg, color: tag.color, border: `1px solid ${tag.border}`,
          marginBottom: 7,
        }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2L1.5 13h13L8 2z"/>
          </svg>
          {propertyName}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e6e1', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11, color: '#5a5f6b' }}>
          {assigneeName}
          {' · '}
          <span style={{ color: progress === 'en_route' ? '#378ADD' : progress === 'on_site' ? '#ef9f27' : '#5a5f6b' }}>
            {stepSubtitle[progress]}
          </span>
        </div>
      </div>

      {/* Three-dot menu (decorative) */}
      <button
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: 10, right: 10, width: 22, height: 22,
          borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', background: 'transparent', border: 'none', gap: 2, padding: 0,
        }}
      >
        {[0,1,2].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#5a5f6b', display: 'block' }} />)}
      </button>

      {/* Body */}
      <div style={{ padding: '12px 14px' }}>
        {/* Pipeline bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 10, overflow: 'hidden' }}>
          {STEPS.map((step, i) => {
            const rel: 'done' | 'active' | 'inactive' = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'inactive'
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
                <div style={{
                  ...stepPillStyle(rel),
                  padding: '4px 8px', borderRadius: 4, fontSize: 9, fontWeight: 600,
                  whiteSpace: 'nowrap', letterSpacing: '0.02em', flex: 1, textAlign: 'center',
                }}>
                  {step.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {ARROW}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* PTE info strip */}
        {pteRow && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: pteRow.bg, border: `1px solid ${pteRow.border}`,
            borderRadius: 6, padding: '5px 8px', marginBottom: 8,
          }}>
            <span style={{ fontSize: 11, color: pteRow.color, fontWeight: 500 }}>
              {pteRow.icon} {pteRow.label}
            </span>
            {pteRow.urgency && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                background: pteRow.urgency.bg, color: pteRow.urgency.color,
                border: `1px solid ${pteRow.urgency.color}33`,
                flexShrink: 0, marginLeft: 8,
              }}>
                {pteRow.urgency.label}
              </span>
            )}
          </div>
        )}

        {/* CTA row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {progress === 'done' ? (
            <span style={{ fontSize: 11, color: '#15d492', fontWeight: 500 }}>✓ Completed</span>
          ) : (
            <span style={{ fontSize: 11, color: '#378ADD', fontWeight: 500 }}>→ Open job</span>
          )}
        </div>
      </div>
    </div>
  )
}

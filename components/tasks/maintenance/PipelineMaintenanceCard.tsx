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
  if (priority === 'urgent' || priority === 'high') return '1px solid rgba(226,75,74,0.20)'
  return '1px solid rgba(255,255,255,0.07)'
}

function stepPillStyle(rel: 'done' | 'active' | 'inactive'): React.CSSProperties {
  if (rel === 'done')   return { background: 'rgba(29,158,117,0.10)', color: '#15d492', border: '1px solid rgba(29,158,117,0.22)' }
  if (rel === 'active') return { background: 'rgba(55,138,221,0.10)', color: '#378ADD', border: '1px solid rgba(55,138,221,0.22)' }
  return { background: '#161b26', color: '#5a5f6b', border: '1px solid rgba(255,255,255,0.07)' }
}

function ptePillInfo(pteStatus?: JobPTEStatus): { label: string; color: string; bg: string; border: string } | null {
  if (pteStatus === 'pending') return { label: '⏳ PTE pending', color: '#ef9f27', bg: 'rgba(239,159,39,0.10)', border: 'rgba(239,159,39,0.22)' }
  if (pteStatus === 'denied' || pteStatus === 'expired') return { label: '🔒 PTE denied', color: '#e24b4a', bg: 'rgba(226,75,74,0.10)', border: 'rgba(226,75,74,0.22)' }
  return null
}

const ARROW = (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5a5f6b', flexShrink: 0 }}>
    <path d="M4 8h8M9 5l3 3-3 3"/>
  </svg>
)

export function PipelineMaintenanceCard({
  title, propertyName, assigneeName, priority, dueDisplay, pteStatus,
  progress, onClick,
}: PipelineMaintenanceCardProps) {
  const tag = tagColor(priority)
  const border = cardBorder(priority, pteStatus)
  const stepIdx = STEP_INDEX[progress]
  const ptePill = ptePillInfo(pteStatus)

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

        {/* Bottom row: PTE pill + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {ptePill ? (
            <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: ptePill.bg, color: ptePill.color, border: `1px solid ${ptePill.border}` }}>
              {ptePill.label}
            </span>
          ) : <span />}
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

'use client'

type Tab = 'overview' | 'property-ops' | 'onboarding' | 'maintenance' | 'sops' | 'cleaning' | 'meetings'

interface KanbanTask {
  id: string; title: string; type: string; priority: 'high' | 'medium' | 'low'
  assignee: string; due: string; columnId: string
  boardId: 'property-ops' | 'onboarding' | 'maintenance'; property?: string
}

interface SopRow {
  id: string; title: string; category: string; status: 'draft' | 'pending' | 'approved'
  lastUpdated: string; acknowledged: number; total: number; body: string
}

interface CleaningShift {
  id: string; propId: string; propName: string; startTime: string; endTime: string
  type: string; cleaner: string; status: 'in_progress' | 'scheduled' | 'done'
}

interface TodayArrival {
  time: string; propertyId: string; propertyName: string
  guest: string; nights: number; readiness: 'ok' | 'risk'
}

interface Props {
  tasks: KanbanTask[]
  cleaningShifts: CleaningShift[]
  sops: SopRow[]
  arrivals: TodayArrival[]
  today: string
  accent: string
  onNavigate: (tab: Tab) => void
}

export default function TodaysNumbers({ tasks, cleaningShifts, sops, arrivals, today, accent, onNavigate }: Props) {
  const overdueCount  = tasks.filter(t => t.columnId !== 'done' && t.due < today).length
  const sopPending    = sops.filter(s => s.status === 'pending').length

  const segments = [
    { label: `${cleaningShifts.length}/${cleaningShifts.length} cleanings`, tab: 'cleaning' as Tab, value: cleaningShifts.length },
    { label: `${overdueCount} overdue`,                                       tab: 'maintenance' as Tab, value: overdueCount },
    { label: `${sopPending} SOP pending`,                                     tab: 'sops' as Tab,        value: sopPending },
    { label: `${arrivals.length} check-ins`,                                  tab: 'overview' as Tab,    value: arrivals.length },
  ]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
      {segments.map((seg, i) => (
        <span key={seg.tab} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onNavigate(seg.tab)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)' }}
          >
            <span style={{ color: accent, fontWeight: 700 }}>{seg.value}</span>
            {' '}
            {seg.label.replace(/^\d+\/?\d* /, '')}
          </button>
          {i < segments.length - 1 && <span style={{ color: 'var(--border)', userSelect: 'none' }}>|</span>}
        </span>
      ))}
    </div>
  )
}

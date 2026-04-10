'use client'

interface KanbanTask {
  id: string; title: string; type: string; priority: 'high' | 'medium' | 'low'
  assignee: string; due: string; columnId: string
  boardId: 'property-ops' | 'onboarding' | 'maintenance'; property?: string
}

interface SopRow {
  id: string; title: string; category: string; status: 'draft' | 'pending' | 'approved'
  lastUpdated: string; acknowledged: number; total: number; body: string
}

interface StaffMember {
  id: string; name: string; initials: string; role: string
  property: string; clockedIn: boolean; clockInTime: string
  shiftStart: string; late: boolean
}

interface Props {
  tasks: KanbanTask[]
  staffOnDuty: StaffMember[]
  sops: SopRow[]
  today: string
  accent: string
}

interface ActionItem {
  id: string; text: string; sub: string; action: string; severity: 'red' | 'amber'
  kind: 'task' | 'staff' | 'sop'
}

interface Callbacks {
  onMarkDone: (taskId: string) => void
  onSendReminder: (staffName: string) => void
  onReviewSop: (sopId: string) => void
}

export default function OverduePanel({ tasks, staffOnDuty, sops, today, accent: _accent, onMarkDone, onSendReminder, onReviewSop }: Props & Callbacks) {
  const overdueTasks: ActionItem[] = tasks
    .filter(t => t.columnId !== 'done' && t.due < today)
    .map(t => ({
      id: t.id,
      text: `${t.title}${t.property ? ` — ${t.property}` : ''}`,
      sub: `Due ${t.due} · ${t.assignee}`,
      action: 'Mark Done',
      severity: t.priority === 'high' ? 'red' : 'amber',
      kind: 'task' as const,
    }))

  const lateStaff: ActionItem[] = staffOnDuty
    .filter(s => s.late)
    .map(s => ({
      id: s.id,
      text: `${s.name} not clocked in`,
      sub: `Shift started ${s.shiftStart}`,
      action: 'Send Reminder',
      severity: 'amber' as const,
      kind: 'staff' as const,
    }))

  const pendingSops: ActionItem[] = sops
    .filter(s => s.status === 'pending')
    .map(s => ({
      id: s.id,
      text: `SOP pending approval: ${s.title}`,
      sub: `Updated ${s.lastUpdated}`,
      action: 'Review',
      severity: 'amber' as const,
      kind: 'sop' as const,
    }))

  const items = [...overdueTasks, ...lateStaff, ...pendingSops]

  if (items.length === 0) {
    return (
      <div style={{ background: '#05966908', border: '1px solid var(--border)', borderLeft: '3px solid #059669', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Needs Action</div>
        <div style={{ fontSize: 13, color: '#059669', fontWeight: 500 }}>✓ All clear — no items need attention</div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚠ Needs Action</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: '#d9770620', color: '#d97706' }}>{items.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              borderBottom: i < items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: item.severity === 'red' ? '#dc2626' : '#d97706' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</div>
            </div>
            <button
              onClick={e => {
                e.stopPropagation()
                if (item.kind === 'task')  onMarkDone(item.id)
                if (item.kind === 'staff') onSendReminder(item.text.split(' ')[0])
                if (item.kind === 'sop')   onReviewSop(item.id)
              }}
              style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
            >
              {item.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

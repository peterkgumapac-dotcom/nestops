'use client'

const TODAY = '2026-03-19'

interface Property { id: string; name: string }

interface CleaningShift {
  id: string; propId: string; propName: string; startTime: string; endTime: string
  type: string; cleaner: string; status: 'in_progress' | 'scheduled' | 'done'
}

interface KanbanTask {
  id: string; title: string; type: string; priority: 'high' | 'medium' | 'low'
  assignee: string; due: string; columnId: string
  boardId: 'property-ops' | 'onboarding' | 'maintenance'; property?: string
}

interface TodayArrival {
  time: string; propertyId: string; propertyName: string
  guest: string; nights: number; readiness: 'ok' | 'risk'
}

interface Props {
  properties: Property[]
  cleaningShifts: CleaningShift[]
  tasks: KanbanTask[]
  arrivals: TodayArrival[]
  accent: string
}

function getPropertyStatus(
  propId: string,
  propName: string,
  cleaningShifts: CleaningShift[],
  tasks: KanbanTask[],
  arrivals: TodayArrival[],
) {
  const shift = cleaningShifts.find(s => s.propId === propId)
  const overdueTask = tasks.find(
    t => t.property === propName && t.columnId !== 'done' && t.due < TODAY && t.priority === 'high',
  )
  const arrival = arrivals.find(a => a.propertyId === propId)

  if (shift?.status === 'in_progress') {
    return { status: 'cleaning', label: 'Cleaning', color: '#0ea5e9', icon: '🧹', context: `${shift.cleaner} · ${shift.startTime}–${shift.endTime}` }
  }
  if (overdueTask) {
    return { status: 'at_risk', label: 'At Risk', color: '#d97706', icon: '⚠️', context: overdueTask.title.slice(0, 35) }
  }
  if (propId === 'p5') {
    return { status: 'vacant', label: 'Vacant', color: '#6b7280', icon: '💤', context: 'No upcoming booking' }
  }
  if (arrival) {
    return { status: 'ready', label: 'Ready', color: '#059669', icon: '🟢', context: `Next check-in ${arrival.time} · ${arrival.guest.split(' ')[0]}` }
  }
  return { status: 'ready', label: 'Ready', color: '#059669', icon: '🟢', context: 'No issues flagged' }
}

export default function PropertyReadinessBoard({ properties, cleaningShifts, tasks, arrivals, accent: _accent }: Props) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Property Readiness</div>

      <div>
        {properties.map((prop, i) => {
          const s = getPropertyStatus(prop.id, prop.name, cleaningShifts, tasks, arrivals)
          return (
            <div
              key={prop.id}
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                borderBottom: i < properties.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{prop.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${s.color}26`, color: s.color }}>
                  {s.icon} {s.label}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 14 }}>{s.context}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

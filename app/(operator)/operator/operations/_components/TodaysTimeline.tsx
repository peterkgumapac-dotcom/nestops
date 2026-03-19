'use client'

interface CleaningShift {
  id: string; propId: string; propName: string; startTime: string; endTime: string
  type: string; cleaner: string; status: 'in_progress' | 'scheduled' | 'done'
}

interface TodayArrival {
  time: string; propertyId: string; propertyName: string
  guest: string; nights: number; readiness: 'ok' | 'risk'
}

interface KanbanTask {
  id: string; title: string; type: string; priority: 'high' | 'medium' | 'low'
  assignee: string; due: string; columnId: string
  boardId: 'property-ops' | 'onboarding' | 'maintenance'; property?: string
}

interface Props {
  cleaningShifts: CleaningShift[]
  arrivals: TodayArrival[]
  maintenanceTasks: KanbanTask[]
  accent: string
}

const HOUR_START = 8   // 08:00
const HOUR_END   = 20  // 20:00
const TOTAL_MINS = (HOUR_END - HOUR_START) * 60 // 720

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function pct(time: string) {
  const mins = Math.max(HOUR_START * 60, Math.min(HOUR_END * 60, timeToMinutes(time)))
  return ((mins - HOUR_START * 60) / TOTAL_MINS) * 100
}

const HOUR_LABELS = [8, 10, 12, 14, 16, 18, 20]

export default function TodaysTimeline({ cleaningShifts, arrivals, maintenanceTasks, accent }: Props) {
  if (!cleaningShifts.length && !arrivals.length && !maintenanceTasks.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Today&apos;s Timeline</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No events today ✓</div>
      </div>
    )
  }

  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const nowClamped = Math.max(HOUR_START * 60, Math.min(HOUR_END * 60, nowMins))
  const nowPct = ((nowClamped - HOUR_START * 60) / TOTAL_MINS) * 100

  // Build event list
  type EventPill = { id: string; left: number; width?: number; color: string; label: string; past: boolean; status?: string }
  const pills: EventPill[] = []

  cleaningShifts.forEach(s => {
    const startMins = timeToMinutes(s.startTime)
    const endMins   = timeToMinutes(s.endTime)
    const past = endMins < nowMins
    pills.push({
      id: s.id,
      left: pct(s.startTime),
      width: ((Math.min(endMins, HOUR_END * 60) - Math.max(startMins, HOUR_START * 60)) / TOTAL_MINS) * 100,
      color: '#059669',
      label: `🧹 ${s.propName}`,
      past,
      status: s.status,
    })
  })

  arrivals.forEach(a => {
    const past = timeToMinutes(a.time) < nowMins
    pills.push({
      id: `arr-${a.propertyId}`,
      left: pct(a.time),
      color: '#7c3aed',
      label: `🚪 ${a.propertyName}`,
      past,
    })
  })

  maintenanceTasks.forEach(t => {
    pills.push({
      id: t.id,
      left: pct('09:00'), // maintenance tasks don't have a time, default to 09:00
      color: '#d97706',
      label: `🔧 ${t.title.slice(0, 20)}`,
      past: false,
    })
  })

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Today&apos;s Timeline</div>

      {/* Pills area */}
      <div style={{ position: 'relative', height: 44, marginBottom: 4 }}>
        {/* Now marker */}
        {nowMins >= HOUR_START * 60 && nowMins <= HOUR_END * 60 && (
          <div style={{ position: 'absolute', left: `${nowPct}%`, top: 0, bottom: 0, width: 2, background: '#ef4444', borderRadius: 1, zIndex: 10 }}>
            <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
          </div>
        )}

        {pills.map(pill => (
          <div
            key={pill.id}
            style={{
              position: 'absolute',
              left: `${pill.left}%`,
              width: pill.width ? `${Math.max(pill.width, 8)}%` : 'auto',
              top: 4,
              height: 28,
              background: pill.color,
              borderRadius: 6,
              padding: '0 8px',
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              opacity: pill.past ? 0.5 : 1,
              fontSize: 11,
              fontWeight: 600,
              color: '#fff',
              gap: 4,
            }}
          >
            {pill.label}
            {pill.past && pill.status === 'done' && ' ✓'}
            {pill.past && pill.status === 'in_progress' && ' ⚠'}
          </div>
        ))}
      </div>

      {/* Ruler */}
      <div style={{ position: 'relative', height: 20, borderTop: '1px solid var(--border-subtle)' }}>
        {HOUR_LABELS.map(h => {
          const p = ((h - HOUR_START) / (HOUR_END - HOUR_START)) * 100
          return (
            <span key={h} style={{ position: 'absolute', left: `${p}%`, transform: 'translateX(-50%)', fontSize: 10, color: 'var(--text-muted)', top: 4 }}>
              {String(h).padStart(2, '0')}:00
            </span>
          )
        })}
      </div>
    </div>
  )
}

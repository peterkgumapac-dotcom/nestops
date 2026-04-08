'use client'
import { Play, Clock, MoreVertical, Paperclip } from 'lucide-react'
import { JOBS } from '@/lib/data/staff'
import type { Job } from '@/lib/data/staff'

const TEXT_PRIMARY = 'var(--text-1, #fff)'
const TEXT_MUTED = 'var(--text-2, rgba(255,255,255,0.55))'
const TEXT_SUBTLE = 'var(--text-3, rgba(255,255,255,0.35))'

type Group = { label: string; items: Job[] }

function groupJobsByDay(jobs: Job[]): Group[] {
  const active = jobs.filter(j => j.status !== 'done')
  const today = active.slice(0, 4)
  const tomorrow = active.slice(4, 6)
  const day3 = active.slice(6, 7)

  const fmt = (offsetDays: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  }

  return [
    { label: 'Today', items: today },
    { label: 'Tomorrow', items: tomorrow },
    { label: fmt(2), items: day3 },
    { label: fmt(3), items: [] },
  ]
}

function pickHighlightId(jobs: Job[]): string | null {
  const inProgress = jobs.find(j => j.status === 'in_progress')
  if (inProgress) return inProgress.id
  const urgent = jobs.find(j => j.status === 'pending' && j.priority === 'urgent')
  return urgent?.id ?? null
}

export default function ScheduledRail({ className }: { className?: string }) {
  const groups = groupJobsByDay(JOBS)
  const highlightId = pickHighlightId(JOBS)

  return (
    <aside
      className={className}
      style={{
        background: 'var(--column-bg, rgba(255,255,255,0.025))',
        borderRadius: 20,
        padding: 16,
        display: 'flex', flexDirection: 'column',
        gap: 16,
        maxHeight: 'calc(100vh - 160px)',
        overflowY: 'auto',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY, padding: '2px 4px' }}>
        Scheduled calls
      </div>

      {groups.map(group => (
        <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            fontSize: 12, fontWeight: 500, color: TEXT_MUTED,
          }}>
            {group.label}
          </div>

          {group.items.length === 0 ? (
            <div style={{
              fontSize: 12, color: TEXT_SUBTLE,
              padding: '18px 14px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Clock size={12} /> No scheduled calls
            </div>
          ) : group.items.map(job => {
            const highlighted = job.id === highlightId
            return (
              <div
                key={job.id}
                style={{
                  position: 'relative',
                  background: highlighted
                    ? 'linear-gradient(135deg, rgba(167,139,250,0.18), rgba(236,72,153,0.08))'
                    : 'var(--card-bg, #20202a)',
                  border: highlighted ? '1px solid rgba(167,139,250,0.35)' : 'none',
                  borderRadius: 14,
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Play size={12} style={{ color: highlighted ? '#c084fc' : TEXT_SUBTLE, marginTop: 3, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.35 }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: TEXT_MUTED, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={10} /> {job.dueTime ?? '—'} · {job.propertyName}
                    </div>
                  </div>
                  <button aria-label="Options" style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: TEXT_SUBTLE, padding: 0, display: 'flex',
                  }}>
                    <MoreVertical size={13} />
                  </button>
                </div>
                {highlighted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <button style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px',
                      borderRadius: 999,
                      background: 'transparent',
                      border: '1px solid rgba(192,132,252,0.5)',
                      color: '#c084fc',
                      fontSize: 11, fontWeight: 600,
                      cursor: 'pointer',
                    }}>
                      Join Call
                      <Paperclip size={10} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

      <button style={{
        alignSelf: 'center',
        marginTop: 4,
        padding: '8px 22px',
        borderRadius: 999,
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.08)',
        color: TEXT_MUTED,
        fontSize: 12, fontWeight: 500,
        cursor: 'pointer',
      }}>
        See all
      </button>
    </aside>
  )
}

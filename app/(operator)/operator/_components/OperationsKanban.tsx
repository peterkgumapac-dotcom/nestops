'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, Plus, Calendar } from 'lucide-react'
import { JOBS, STAFF_MEMBERS as STAFF } from '@/lib/data/staff'
import type { Job } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'

const PRIORITY_DOT: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#10b981',
}

const TEXT_PRIMARY = 'var(--text-1, #fff)'
const TEXT_MUTED = 'var(--text-2, rgba(255,255,255,0.55))'
const TEXT_SUBTLE = 'var(--text-3, rgba(255,255,255,0.35))'

function progressFor(job: Job): number {
  const list = job.checklist ?? job.workItems
  if (!list || list.length === 0) {
    if (job.status === 'done') return 100
    if (job.status === 'in_progress') return 50
    return 0
  }
  const done = list.filter((i: any) => i.completed || i.done).length
  return Math.round((done / list.length) * 100)
}

function assigneesFor(job: Job) {
  const main = STAFF.find(s => s.id === job.staffId)
  return main ? [main] : []
}

function Card({ job, decorative }: { job: Job; decorative?: boolean }) {
  const pct = progressFor(job)
  const assignees = assigneesFor(job)
  const dot = PRIORITY_DOT[job.priority] ?? '#6b7280'
  const due = job.dueTime ? `Today, ${job.dueTime}` : '—'
  const property = PROPERTIES.find(p => p.id === job.propertyId)
  const imageUrl = property?.imageUrl

  return (
    <Link
      href="/operator/operations"
      style={{
        display: 'block',
        background: 'var(--card-bg, #20202a)',
        border: 'none',
        borderRadius: 14,
        padding: '16px 18px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.15s ease',
        transform: decorative ? 'rotate(-3deg) translateY(-8px)' : undefined,
        boxShadow: decorative ? '0 24px 48px rgba(0,0,0,0.5)' : undefined,
        position: decorative ? 'relative' : undefined,
        zIndex: decorative ? 2 : undefined,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 6 }} />
        <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.35, flex: 1 }}>
          {job.title}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: TEXT_MUTED, marginBottom: 10 }}>
        <Calendar size={11} />
        <span>{due}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.propertyName}</span>
      </div>
      {imageUrl ? (
        <div style={{
          width: '100%', aspectRatio: '16 / 9', borderRadius: 10,
          overflow: 'hidden', marginBottom: 12,
          background: 'rgba(255,255,255,0.03)',
        }}>
          <img
            src={imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, minWidth: 28 }}>{pct}%</div>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: 'var(--progress-gradient, linear-gradient(90deg, #ec4899, #a78bfa, #60a5fa))',
            borderRadius: 999, transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{ display: 'flex', marginLeft: 4 }}>
          {assignees.map((s, i) => (
            <div
              key={s.id}
              title={s.name}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'linear-gradient(135deg, #a78bfa, #ec4899)', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--card-bg, #20202a)',
                marginLeft: i === 0 ? 0 : -6,
              }}
            >
              {s.initials}
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

function Column({ title, jobs, decorativeFirst }: { title: string; jobs: Job[]; decorativeFirst?: boolean }) {
  return (
    <div style={{
      background: 'var(--column-bg, rgba(255,255,255,0.025))',
      borderRadius: 20,
      padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY }}>{title}</span>
        <button
          aria-label={`Add to ${title}`}
          style={{
            width: 24, height: 24, borderRadius: 7,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            color: TEXT_MUTED, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Plus size={13} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', maxHeight: 'calc(100vh - 300px)', paddingTop: decorativeFirst ? 10 : 0 }}>
        {jobs.length === 0 ? (
          <div style={{
            fontSize: 11, color: TEXT_SUBTLE, padding: '24px 8px',
            textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 14,
          }}>
            Nothing here
          </div>
        ) : jobs.map((j, i) => (
          <Card key={j.id} job={j} decorative={decorativeFirst && i === 0} />
        ))}
      </div>
    </div>
  )
}

export default function OperationsKanban() {
  const [q, setQ] = useState('')

  const { todo, inWork, done } = useMemo(() => {
    const lower = q.trim().toLowerCase()
    const match = (j: Job) => !lower || j.title.toLowerCase().includes(lower) || j.propertyName.toLowerCase().includes(lower)
    return {
      todo: JOBS.filter(j => j.status === 'pending' && match(j)),
      inWork: JOBS.filter(j => j.status === 'in_progress' && match(j)),
      done: JOBS.filter(j => j.status === 'done' && match(j)),
    }
  }, [q])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 23, fontWeight: 600, color: TEXT_PRIMARY, letterSpacing: '-0.01em' }}>
          Team tasks manager
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 220 }}>
          <div style={{
            width: '100%', maxWidth: 520, height: 42,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 999, padding: '0 18px',
          }}>
            <Search size={15} style={{ color: TEXT_SUBTLE }} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Archive tasks"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: TEXT_PRIMARY, fontSize: 13,
              }}
            />
            <button aria-label="Filter" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: TEXT_SUBTLE, padding: 2, display: 'flex',
            }}>
              <SlidersHorizontal size={15} />
            </button>
          </div>
        </div>

        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 22px', borderRadius: 999,
          background: 'var(--accent-gradient, linear-gradient(135deg, #a78bfa, #c084fc, #f0abfc))',
          color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 20px rgba(167,139,250,0.3)',
        }}>
          New task <Plus size={14} />
        </button>
      </div>

      {/* Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
      }}>
        <Column title="To Do" jobs={todo} />
        <Column title="In Work" jobs={inWork} />
        <Column title="Done" jobs={done} decorativeFirst />
      </div>
    </div>
  )
}

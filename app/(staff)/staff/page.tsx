'use client'
import { useState, useEffect } from 'react'
import { ClipboardList, Building2, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/shared/StatusBadge'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'
import Link from 'next/link'
import type { StaffMember } from '@/lib/data/staff'

const GREEN = '#1D9E75', GREEN_BG = 'rgba(29,158,117,0.08)', GREEN_BORDER = 'rgba(29,158,117,0.2)'
const AMBER = '#ef9f27', AMBER_BG = 'rgba(239,159,39,0.08)', AMBER_BORDER = 'rgba(239,159,39,0.2)'
const RED = '#e24b4a', RED_BG = 'rgba(226,75,74,0.08)', RED_BORDER = 'rgba(226,75,74,0.2)'

const USER_TO_STAFF: Record<string, string> = {
  u3: 's1', // Maria → Johan Larsson (cleaning)
  u4: 's3', // Bjorn Larsen (maintenance)
  u5: 's4', // Fatima → Fatima Ndiaye (guest services)
  u7: 's2', // Anna → Anna Kowalski (inspector)
}

function getElapsed(clockInTime: string): string {
  const ms = new Date(clockInTime).getTime()
  if (isNaN(ms)) return '—'
  const diff = Date.now() - ms
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function jobTypeBorderColor(type?: string): string {
  if (type === 'maintenance') return '#3b82f6'
  if (type === 'inspection') return AMBER
  return GREEN
}

function priorityDotColor(priority: string): string {
  if (priority === 'urgent') return RED
  if (priority === 'high') return AMBER
  return GREEN
}

export default function StaffHome() {
  const { accent } = useRole()
  const router = useRouter()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()

  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null)
  const [checkedJobs, setCheckedJobs] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)

  // Clock-in state
  const [clockedIn, setClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('afterstay_user')
      const profile = stored ? JSON.parse(stored) : null
      setUserId(profile?.id ?? null)
      const staffId = profile ? USER_TO_STAFF[profile.id] : null
      const staff = staffId
        ? STAFF_MEMBERS.find(s => s.id === staffId) ?? STAFF_MEMBERS[0]
        : STAFF_MEMBERS[0]
      setCurrentStaff(staff)
      const savedChecks = profile ? localStorage.getItem(`afterstay_job_checks_${profile.id}`) : null
      if (savedChecks) {
        setCheckedJobs(new Set(JSON.parse(savedChecks)))
      } else {
        setCheckedJobs(new Set(
          JOBS.filter(j => staff.jobIds.includes(j.id) && j.status === 'done').map(j => j.id)
        ))
      }
    } catch {
      setCurrentStaff(STAFF_MEMBERS[0])
    }

    // Load clock-in state
    try {
      const ciStr = localStorage.getItem('afterstay_clockin')
      if (ciStr) {
        const ci = JSON.parse(ciStr)
        const today = new Date().toISOString().split('T')[0]
        if (ci.date === today && ci.status === 'in_progress') {
          setClockedIn(true)
          setClockInTime(ci.clockInTime)
          setElapsed(getElapsed(ci.clockInTime))
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!clockedIn || !clockInTime) return
    const interval = setInterval(() => setElapsed(getElapsed(clockInTime)), 60000)
    return () => clearInterval(interval)
  }, [clockedIn, clockInTime])

  if (!currentStaff) return null

  const myJobs = JOBS.filter(j => currentStaff.jobIds.includes(j.id))
  const myProperties = PROPERTIES.filter(p => currentStaff.assignedPropertyIds.includes(p.id))
  const firstName = currentStaff.name.split(' ')[0]

  const toggleJob = (id: string) => {
    setCheckedJobs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        const stored = localStorage.getItem('afterstay_user')
        if (stored) {
          const profile = JSON.parse(stored)
          localStorage.setItem(`afterstay_job_checks_${profile.id}`, JSON.stringify([...next]))
        }
      } catch {}
      return next
    })
  }

  const allDone = myJobs.length > 0 && myJobs.every(j => checkedJobs.has(j.id))
  const openCount = myJobs.filter(j => !checkedJobs.has(j.id)).length

  const markAllDone = () => {
    const allIds = new Set(myJobs.map(j => j.id))
    setCheckedJobs(allIds)
    try {
      const stored = localStorage.getItem('afterstay_user')
      if (stored) {
        const profile = JSON.parse(stored)
        localStorage.setItem(`afterstay_job_checks_${profile.id}`, JSON.stringify([...allIds]))
      }
    } catch {}
  }

  const handleClockIn = () => {
    const now = new Date().toISOString()
    const record = {
      staffId: currentStaff.id,
      shiftId: `shift_${Date.now()}`,
      propertyId: myProperties[0]?.id ?? '',
      date: now.split('T')[0],
      clockInTime: now,
      status: 'in_progress',
    }
    localStorage.setItem('afterstay_clockin', JSON.stringify(record))
    setClockedIn(true)
    setClockInTime(now)
    setElapsed(getElapsed(now))
  }

  const handleClockOut = () => {
    try {
      const ciStr = localStorage.getItem('afterstay_clockin')
      if (ciStr) {
        const ci = JSON.parse(ciStr)
        const updated = { ...ci, status: 'completed', clockOutTime: new Date().toISOString() }
        localStorage.setItem('afterstay_clockin', JSON.stringify(updated))
      }
    } catch {}
    setClockedIn(false)
    setClockInTime(null)
    setElapsed('')
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Sticky header with greeting + date */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-page)', paddingBottom: 8, marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{greeting}, {firstName}</div>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)', fontFamily: 'monospace', marginTop: 2 }}>{dateStr}</div>
      </div>

      {/* Clock-In Widget */}
      {clockedIn ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderLeft: `4px solid ${GREEN}`, borderRadius: 12, padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', background: GREEN,
              boxShadow: `0 0 0 3px ${GREEN_BG}`,
            }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>On shift · {elapsed}</span>
          </div>
          <button
            onClick={handleClockOut}
            style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${GREEN_BORDER}`, background: GREEN_BG, color: GREEN, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Clock Out
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderLeft: `4px solid ${AMBER}`, borderRadius: 12, padding: '14px 16px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6b7280' }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Not on shift</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleClockIn}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}
            >
              Clock In for Today
            </button>
            <Link
              href="/briefing"
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, textDecoration: 'none' }}
            >
              View Briefing <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Briefing Banner — only when not clocked in */}
      {!clockedIn && (
        <Link href="/briefing" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: AMBER_BG, border: `1px solid ${AMBER_BORDER}`, borderRadius: 10,
          padding: '12px 16px', marginBottom: 20, textDecoration: 'none',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: AMBER }}>📋 View today's pre-shift briefing</span>
          <ChevronRight size={16} color={AMBER} />
        </Link>
      )}

      {/* Stat pills row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 4 }}>
        {[
          { label: `${myProperties.length} properties`, href: '/staff' },
          { label: `${openCount} open`, href: '/staff/jobs' },
          { label: `${myJobs.length} jobs`, href: '/staff/jobs' },
        ].map(pill => (
          <Link key={pill.label} href={pill.href} style={{
            display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
            padding: '6px 14px', borderRadius: 100, border: '1px solid var(--border)',
            background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 13,
            fontWeight: 600, textDecoration: 'none', flexShrink: 0,
          }}>
            {pill.label}
          </Link>
        ))}
      </div>

      {/* New Intake CTA */}
      <Link href="/staff/new-intake" style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
        <div style={{ background: `${accent}14`, border: `1px solid ${accent}33`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ClipboardList size={22} style={{ color: '#fff' }} strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 2 }}>Start New Property Intake</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Inspect and document a property — photos, assets, notes, and issues</div>
          </div>
          <span style={{ fontSize: 20, color: accent }}>→</span>
        </div>
      </Link>

      {/* Today's Properties */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Today's Properties</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myProperties.length === 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, textAlign: 'center' }}>
              <Building2 size={28} style={{ color: 'var(--text-subtle)', margin: '0 auto 10px', display: 'block' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>No properties assigned today</div>
              <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Contact your operator for assignments</div>
            </div>
          )}
          {myProperties.map(p => {
            const job = myJobs.find(j => j.propertyId === p.id)
            const borderColor = jobTypeBorderColor(job?.type)
            const propertyJobs = myJobs.filter(j => j.propertyId === p.id)
            const donePropJobs = propertyJobs.filter(j => checkedJobs.has(j.id)).length
            const progress = propertyJobs.length > 0 ? Math.round((donePropJobs / propertyJobs.length) * 100) : 0

            // Calculate turnaround warning
            let turnaroundWarning = false
            if (job?.checkoutTime && job?.checkinTime) {
              const coH = parseInt(job.checkoutTime.split(':')[0])
              const coM = parseInt(job.checkoutTime.split(':')[1] ?? '0')
              const ciH = parseInt(job.checkinTime.split(':')[0])
              const ciM = parseInt(job.checkinTime.split(':')[1] ?? '0')
              const turnaround = (ciH * 60 + ciM) - (coH * 60 + coM)
              turnaroundWarning = turnaround < 120 && turnaround > 0
            }

            return (
              <div key={p.id} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderLeft: `4px solid ${borderColor}`, borderRadius: 12, padding: '16px 16px 14px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.3 }}>{p.name}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginLeft: 8 }}>
                    {job?.type && (
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: borderColor, padding: '2px 7px', borderRadius: 5, background: `${borderColor}18` }}>
                        {job.type}
                      </span>
                    )}
                    {turnaroundWarning && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: AMBER, padding: '2px 7px', borderRadius: 5, background: AMBER_BG }}>⚡ Tight</span>
                    )}
                  </div>
                </div>
                {job?.checkoutTime && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>
                    Checkout {job.checkoutTime}{job.checkinTime ? ` → Check-in ${job.checkinTime}` : ''}
                  </div>
                )}
                {propertyJobs.length > 0 && (
                  <div style={{ marginBottom: 12, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{donePropJobs}/{propertyJobs.length} tasks done</span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{progress}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? GREEN : accent, borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => router.push('/staff/new-intake')}
                  style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44, width: '100%' }}
                >
                  Start Intake
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's Tasks */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Today's Tasks</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {myJobs.length === 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              No tasks assigned for today
            </div>
          )}
          {myJobs.map(j => {
            const isDone = checkedJobs.has(j.id)
            const dotColor = priorityDotColor(j.priority)
            return (
              <label
                key={j.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  background: isDone ? GREEN_BG : 'var(--bg-card)',
                  border: `1px solid ${isDone ? GREEN_BORDER : 'var(--border)'}`,
                  borderRadius: 10, cursor: 'pointer', minHeight: 56,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleJob(j.id)}
                  style={{ accentColor: accent, flexShrink: 0, width: 22, height: 22 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: isDone ? 'var(--text-subtle)' : 'var(--text-primary)',
                    textDecoration: isDone ? 'line-through' : 'none', marginBottom: 2,
                  }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    {j.propertyName} · Due {j.dueTime}
                  </div>
                </div>
                <StatusBadge status={j.priority} />
              </label>
            )
          })}
        </div>
      </div>

      {/* Floating Mark All Done button */}
      {myJobs.length > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
          <button
            onClick={markAllDone}
            disabled={allDone}
            style={{
              pointerEvents: 'all',
              padding: '14px 32px', borderRadius: 100, border: 'none',
              background: allDone ? 'var(--bg-card)' : accent,
              color: allDone ? 'var(--text-subtle)' : '#fff',
              fontSize: 15, fontWeight: 700, cursor: allDone ? 'default' : 'pointer',
              boxShadow: allDone ? 'none' : '0 4px 24px rgba(0,0,0,0.25)',
              transition: 'all 0.2s',
              minHeight: 52,
            }}
          >
            {allDone ? '✓ All Done!' : `Mark All Done (${openCount})`}
          </button>
        </div>
      )}
    </div>
  )
}

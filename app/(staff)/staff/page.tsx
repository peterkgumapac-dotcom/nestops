'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Clock, MapPin, ChevronRight, CheckCircle2,
  Timer, AlertTriangle, Package, Key, LogOut,
  Droplets, Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'
import Link from 'next/link'
import type { StaffMember } from '@/lib/data/staff'

const GREEN = 'var(--status-green-fg)'
const GREEN_BG = 'var(--status-green-bg)'
const GREEN_BORDER = 'rgba(29,158,117,0.2)'
const AMBER = 'var(--status-amber-fg)'
const AMBER_BG = 'var(--status-amber-bg)'
const RED = 'var(--status-red-fg)'

const USER_TO_STAFF: Record<string, string> = {
  u3: 's1', u4: 's3', u5: 's4', u7: 's2',
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
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null)
  const [checkedJobs, setCheckedJobs] = useState<Set<string>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)

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
  const doneCount = myJobs.filter(j => checkedJobs.has(j.id)).length
  const progress = myJobs.length > 0 ? Math.round((doneCount / myJobs.length) * 100) : 0

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
    <div className="pb-28">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="mb-5">
        <h1 className="heading text-2xl text-[var(--text-primary)] mb-1">
          {greeting}, {firstName}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]">
            Cleaning Team
          </span>
          <span className="text-xs text-[var(--text-subtle)]">{dateLabel}</span>
        </div>
      </div>

      {/* ── Clock status ──────────────────────────────────────────── */}
      {clockedIn ? (
        <Card className="p-4 mb-5 border-l-4" style={{ borderLeftColor: GREEN }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="live-dot w-2.5 h-2.5 rounded-full" style={{ background: GREEN, boxShadow: `0 0 0 3px ${GREEN_BG}` }} />
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">On shift · {elapsed}</div>
                <div className="text-xs text-[var(--text-muted)]">{doneCount}/{myJobs.length} tasks complete</div>
              </div>
            </div>
            <Button
              onClick={handleClockOut}
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5"
              style={{ borderColor: GREEN_BORDER, background: GREEN_BG, color: GREEN }}
            >
              <LogOut size={13} />
              Clock Out
            </Button>
          </div>
          {/* Mini progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--bg-elevated)]">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${progress}%`, background: progress === 100 ? GREEN : 'var(--status-amber-fg)' }}
            />
          </div>
        </Card>
      ) : (
        <Card className="p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-subtle)]" />
            <span className="text-sm text-[var(--text-muted)] font-medium">Not on shift</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleClockIn}
              className="flex-1 rounded-full min-h-[44px] font-semibold"
              style={{ background: 'var(--status-amber-fg)', color: '#fff' }}
            >
              Clock In
            </Button>
            <Link href="/briefing/cleaners" className="flex-1">
              <Button
                variant="outline"
                className="w-full min-h-[44px] flex items-center justify-center gap-1"
              >
                View Briefing <ChevronRight size={14} />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── Briefing banner (not clocked in) ──────────────────────── */}
      {!clockedIn && (
        <Link href="/briefing/cleaners" className="no-underline block">
          <Card
            className="flex items-center justify-between p-3 mb-5"
            style={{ background: AMBER_BG, borderColor: 'rgba(239,159,39,0.2)' }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} style={{ color: AMBER }} />
              <span className="text-xs font-semibold" style={{ color: AMBER }}>View today&apos;s pre-shift briefing</span>
            </div>
            <ChevronRight size={16} style={{ color: AMBER }} />
          </Card>
        </Link>
      )}

      {/* ── Today's Properties ────────────────────────────────────── */}
      <div className="mb-6">
        <div className="label-upper text-[var(--text-subtle)] mb-3">Today&apos;s Properties</div>
        <div className="flex flex-col gap-3">
          {myProperties.length === 0 ? (
            <Card className="p-6 text-center">
              <Droplets size={28} className="text-[var(--text-subtle)] mx-auto mb-2.5" />
              <div className="text-sm font-semibold text-[var(--text-muted)] mb-1">No properties assigned</div>
              <div className="text-xs text-[var(--text-subtle)]">Contact your supervisor for assignments</div>
            </Card>
          ) : (
            myProperties.map(p => {
              const propertyJobs = myJobs.filter(j => j.propertyId === p.id)
              const donePropJobs = propertyJobs.filter(j => checkedJobs.has(j.id)).length
              const propProgress = propertyJobs.length > 0 ? Math.round((donePropJobs / propertyJobs.length) * 100) : 0
              const job = propertyJobs[0]

              let tightTurnaround = false
              if (job?.checkoutTime && job?.checkinTime) {
                const coH = parseInt(job.checkoutTime.split(':')[0])
                const coM = parseInt(job.checkoutTime.split(':')[1] ?? '0')
                const ciH = parseInt(job.checkinTime.split(':')[0])
                const ciM = parseInt(job.checkinTime.split(':')[1] ?? '0')
                const turnaround = (ciH * 60 + ciM) - (coH * 60 + coM)
                tightTurnaround = turnaround < 120 && turnaround > 0
              }

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-0 overflow-hidden card">
                    {/* Property image */}
                    {p.imageUrl && (
                      <div className="relative h-24 overflow-hidden">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
                        {propProgress === 100 && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[var(--status-green-bg)] text-[var(--status-green-fg)] text-[10px] font-semibold uppercase">
                            Done
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</h3>
                          {job?.checkoutTime && (
                            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                              <Clock size={11} />
                              Checkout {job.checkoutTime}{job.checkinTime ? ` → Check-in ${job.checkinTime}` : ''}
                            </div>
                          )}
                        </div>
                        {job?.type && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]">
                            {job.type}
                          </span>
                        )}
                      </div>

                      {tightTurnaround && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--status-amber-bg)] text-[10px] font-semibold text-[var(--status-amber-fg)] mb-2 mt-1">
                          <AlertTriangle size={11} />
                          Tight turnaround
                        </div>
                      )}

                      {/* Progress */}
                      {propertyJobs.length > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-[11px] text-[var(--text-subtle)]">{donePropJobs}/{propertyJobs.length} tasks</span>
                            <span className="text-[11px] text-[var(--text-subtle)]">{propProgress}%</span>
                          </div>
                          <div className="h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-[width] duration-300"
                              style={{ width: `${propProgress}%`, background: propProgress === 100 ? GREEN : 'var(--status-amber-fg)' }}
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => router.push('/staff/new-intake')}
                        className="w-full rounded-full min-h-[40px] mt-3 text-xs"
                        style={propProgress < 100 ? { background: 'var(--status-amber-fg)', color: '#fff' } : undefined}
                        variant={propProgress === 100 ? 'outline' : 'default'}
                      >
                        {propProgress === 100 ? 'View Details' : 'Start Cleaning'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Task Checklist ────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="label-upper text-[var(--text-subtle)]">Tasks</div>
          {myJobs.length > 0 && (
            <span className="text-[11px] text-[var(--text-subtle)]">{doneCount}/{myJobs.length} done</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {myJobs.length === 0 ? (
            <Card className="p-5 text-center text-sm text-[var(--text-muted)]">
              No tasks assigned today
            </Card>
          ) : (
            myJobs.map(j => {
              const isDone = checkedJobs.has(j.id)
              const dotColor = priorityDotColor(j.priority)
              return (
                <label
                  key={j.id}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl cursor-pointer min-h-[52px] transition-colors duration-200"
                  style={{
                    background: isDone ? GREEN_BG : 'var(--bg-card)',
                    border: `1px solid ${isDone ? 'rgba(29,158,117,0.2)' : 'var(--border)'}`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleJob(j.id)}
                    className="shrink-0 w-5 h-5 rounded"
                    style={{ accentColor: 'var(--status-amber-fg)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isDone ? 'text-[var(--text-subtle)] line-through' : 'text-[var(--text-primary)]'}`}>
                      {j.title}
                    </div>
                    <div className="text-xs text-[var(--text-subtle)]">
                      {j.propertyName} · Due {j.dueTime}
                    </div>
                  </div>
                  <StatusBadge status={j.priority} />
                </label>
              )
            })
          )}
        </div>
      </div>

      {/* ── Floating CTA ──────────────────────────────────────────── */}
      {myJobs.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <Button
            onClick={markAllDone}
            disabled={allDone}
            className={`pointer-events-auto rounded-full px-8 py-3.5 text-base font-semibold min-h-[52px] ${
              allDone ? 'bg-[var(--bg-card)] text-[var(--text-subtle)]' : 'shadow-lg'
            }`}
            style={!allDone ? { background: 'var(--status-amber-fg)', color: '#fff', boxShadow: '0 4px 24px rgba(245,158,11,0.3)' } : undefined}
          >
            {allDone ? (
              <span className="flex items-center gap-2"><CheckCircle2 size={18} /> All Done!</span>
            ) : (
              `Mark All Done (${openCount})`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

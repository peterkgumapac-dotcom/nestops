'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin, Clock, CheckCircle2, Circle, ChevronRight, Key, Eye, EyeOff,
  AlertTriangle, ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS } from '@/lib/data/staff'
import { STAFF_MEMBERS } from '@/lib/data/staff'
import { SHIFTS } from '@/lib/data/staffScheduling'
import { PROPERTY_WEATHER } from '@/lib/data/weather'
import { getCleaningChecklist } from '@/lib/data/checklists'
import WeatherIcon from '@/components/shared/WeatherIcon'
import type { UserProfile } from '@/context/RoleContext'

// ── Staff ID mapping ─────────────────────────────────────────────────────────
const USER_TO_STAFF: Record<string, string> = {
  'u3': 's5', // Maria Solberg (cleaner)
  'u4': 's3', // Bjorn Larsen (maintenance)
  'u5': 's4', // Fatima Ndiaye (guest services)
  'u7': 's2', // Anna Kowalski (inspector)
}

// ── Elapsed timer ────────────────────────────────────────────────────────────
function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export default function CleanerTodayPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [clockIn, setClockIn] = useState<Record<string, unknown> | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Load user + clock-in state
  useEffect(() => {
    try {
      const stored = localStorage.getItem('afterstay_user')
      if (stored) setCurrentUser(JSON.parse(stored))
      const ci = localStorage.getItem('afterstay_clockin')
      if (ci) setClockIn(JSON.parse(ci))
    } catch { /* ignore */ }
  }, [])

  // Elapsed timer
  useEffect(() => {
    if (!clockIn || clockIn.status !== 'in_progress') return
    const ts = clockIn.clockInTimestamp as number
    if (!ts || isNaN(ts)) return
    const calc = () => setElapsed(Date.now() - ts)
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [clockIn])

  const staffId = currentUser ? USER_TO_STAFF[currentUser.id] ?? null : null
  const staffMember = staffId ? STAFF_MEMBERS.find(s => s.id === staffId) : null

  // Today's shifts — fallback to nearest scheduled date for demo
  const myShifts = useMemo(() => {
    if (!staffId) return []
    const todayShifts = SHIFTS.filter(s => s.staffId === staffId && s.date === today)
    if (todayShifts.length > 0) return todayShifts.sort((a, b) => a.startTime.localeCompare(b.startTime))
    // Demo fallback: show the next upcoming date with shifts
    const allStaffShifts = SHIFTS.filter(s => s.staffId === staffId).sort((a, b) => a.date.localeCompare(b.date))
    const upcoming = allStaffShifts.filter(s => s.date >= today)
    const demoDate = upcoming.length > 0 ? upcoming[0].date : allStaffShifts[allStaffShifts.length - 1]?.date
    if (!demoDate) return []
    return SHIFTS.filter(s => s.staffId === staffId && s.date === demoDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [staffId, today])

  const myJobs = useMemo(() => {
    if (!staffId) return []
    return JOBS.filter(j => j.staffId === staffId)
  }, [staffId])

  const firstName = currentUser?.name?.split(' ')[0] ?? 'there'
  const isClockedIn = clockIn?.status === 'in_progress'

  // Clock out
  const handleClockOut = useCallback(() => {
    if (!clockIn) return
    const updated = { ...clockIn, status: 'completed', clockOutTime: new Date().toISOString() }
    localStorage.setItem('afterstay_clockin', JSON.stringify(updated))
    setClockIn(updated)
  }, [clockIn])

  // Toggle access code visibility
  const toggleCode = (propId: string) => {
    setShowCodes(prev => ({ ...prev, [propId]: !prev[propId] }))
  }

  // Greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Completed jobs count
  const completedJobs = myJobs.filter(j => j.status === 'done').length
  const totalJobs = myJobs.length

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto md:max-w-4xl space-y-5">
      {/* ── Header ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="heading text-2xl text-[var(--text-primary)]">
              {greeting}, {firstName}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
            <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-[var(--status-green-fg)] live-dot' : 'bg-[var(--text-subtle)]'}`} />
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {isClockedIn ? 'On shift' : 'Off shift'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Clock-in status bar ────────────────────────────────────── */}
      {isClockedIn && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[var(--status-green-fg)]" />
                <span className="text-xs font-medium text-[var(--text-muted)]">Shift time</span>
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                {formatElapsed(elapsed)}
              </span>
            </div>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0}%`,
                      background: 'var(--progress-gradient)',
                    }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums">
                {completedJobs}/{totalJobs}
              </span>
            </div>
            <Button
              onClick={handleClockOut}
              variant="outline"
              className="w-full rounded-full min-h-[40px] text-sm border-[var(--status-red-fg)] text-[var(--status-red-fg)] hover:bg-[var(--status-red-bg)]"
            >
              Clock Out
            </Button>
          </Card>
        </motion.div>
      )}

      {/* ── Stats strip ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Properties', value: myShifts.length, accent: 'var(--accent)' },
          { label: 'Tasks', value: totalJobs, accent: 'var(--accent)' },
          { label: 'Done', value: completedJobs, accent: 'var(--status-green-fg)' },
        ].map(stat => (
          <Card key={stat.label} className="p-3 text-center">
            <div className="text-xl font-semibold text-[var(--text-primary)] tabular-nums" style={{ color: stat.accent }}>
              {stat.value}
            </div>
            <div className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-0.5">
              {stat.label}
            </div>
          </Card>
        ))}
      </motion.div>

      {/* ── Property cards ────────────────────────────────────────── */}
      <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
        <h2 className="heading text-base text-[var(--text-primary)]">
          Today&apos;s Properties
        </h2>

        {myShifts.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">No shifts scheduled for today</p>
            <Link href="/app/cleaner/schedule">
              <Button variant="outline" className="mt-3 rounded-full text-sm">
                View Schedule
              </Button>
            </Link>
          </Card>
        ) : (
          myShifts.map((shift, idx) => {
            const prop = PROPERTIES.find(p => p.id === shift.propertyId)
            const weather = PROPERTY_WEATHER.find(w => w.propertyId === shift.propertyId)
            const job = myJobs.find(j => j.propertyId === shift.propertyId)
            const checklist = job?.checklist ?? getCleaningChecklist(prop?.beds ?? 1, prop?.baths ?? 1, prop?.amenities ?? [])
            const accessCodes = prop?.accessCodes
            const firstCode = accessCodes?.[0]
            const showCode = showCodes[shift.propertyId]

            // Turnaround warning
            const hasTurnaround = job?.checkoutTime && job?.checkinTime
            const turnaroundMinutes = hasTurnaround
              ? (() => {
                  const [ch, cm] = job.checkinTime!.split(':').map(Number)
                  const [oh, om] = job.checkoutTime!.split(':').map(Number)
                  return (ch * 60 + cm) - (oh * 60 + om)
                })()
              : null
            const isTightTurnaround = turnaroundMinutes !== null && turnaroundMinutes <= 240

            return (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.12 + idx * 0.06 }}
              >
                <Card className="overflow-hidden">
                  {/* Property image + overlay */}
                  {prop?.imageUrl && (
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={prop.imageUrl}
                        alt={prop.name}
                        className="w-full h-full object-cover"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-sm font-semibold text-white">{prop.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-white/80">
                            <MapPin size={11} /> {prop.city}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-white/80">
                            <Clock size={11} /> {shift.startTime}–{shift.endTime}
                          </span>
                        </div>
                      </div>
                      {weather && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                          <WeatherIcon condition={weather.condition} size={13} />
                          <span className="text-xs text-white font-medium tabular-nums">{weather.temperature}°</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    {/* Turnaround warning */}
                    {isTightTurnaround && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-amber-bg)] border border-[rgba(239,159,39,0.2)]">
                        <AlertTriangle size={14} className="text-[var(--status-amber-fg)] flex-shrink-0" />
                        <span className="text-xs text-[var(--status-amber-fg)] font-medium">
                          Tight turnaround — {Math.floor(turnaroundMinutes! / 60)}h {turnaroundMinutes! % 60}m between checkout & check-in
                        </span>
                      </div>
                    )}

                    {/* Access info */}
                    {firstCode && (
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-elevated)]">
                        <div className="flex items-center gap-2">
                          <Key size={13} className="text-[var(--text-muted)]" />
                          <span className="text-xs text-[var(--text-muted)]">
                            {firstCode.label}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleCode(shift.propertyId)}
                          className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] bg-transparent border-none cursor-pointer"
                        >
                          {showCode ? (
                            <>
                              <span className="tabular-nums font-semibold">{firstCode.code}</span>
                              <EyeOff size={13} />
                            </>
                          ) : (
                            <>
                              <span>Show Code</span>
                              <Eye size={13} />
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Checklist preview (first 5 items) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                          Checklist
                        </span>
                        <span className="text-[10px] text-[var(--text-subtle)] tabular-nums">
                          {checklist.length} items
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {checklist.slice(0, 5).map(item => (
                          <div key={item.id} className="flex items-center gap-2.5">
                            <Circle size={14} className="text-[var(--text-subtle)] flex-shrink-0" />
                            <span className="text-xs text-[var(--text-muted)] truncate">{item.label}</span>
                          </div>
                        ))}
                        {checklist.length > 5 && (
                          <span className="text-[10px] text-[var(--text-subtle)] ml-6">
                            +{checklist.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href="/app/my-tasks" className="block">
                      <Button
                        className="w-full rounded-full min-h-[44px] text-sm font-semibold bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white"
                        style={{ boxShadow: '0 2px 12px rgba(20,184,166,0.25)' }}
                      >
                        {job?.status === 'in_progress' ? 'Continue Cleaning' : 'Start Cleaning'}
                        <ArrowRight size={15} className="ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>

      {/* ── Weather summary ───────────────────────────────────────── */}
      {myShifts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
        >
          <Card className="p-4">
            <h3 className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Weather Notes
            </h3>
            <div className="space-y-2">
              {PROPERTY_WEATHER
                .filter(w => myShifts.some(s => s.propertyId === w.propertyId))
                .filter(w => w.note)
                .map(w => (
                  <div key={w.propertyId} className="flex items-start gap-2">
                    <WeatherIcon condition={w.condition} size={14} />
                    <div>
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        {PROPERTIES.find(p => p.id === w.propertyId)?.name}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]"> — {w.note}</span>
                    </div>
                  </div>
                ))}
              {PROPERTY_WEATHER
                .filter(w => myShifts.some(s => s.propertyId === w.propertyId))
                .filter(w => w.note).length === 0 && (
                <p className="text-xs text-[var(--text-subtle)]">No weather alerts for your properties today</p>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

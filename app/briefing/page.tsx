'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { UserProfile } from '@/context/RoleContext'
import { SHIFTS } from '@/lib/data/staffScheduling'
import type { Shift } from '@/lib/data/staffScheduling'
import { PROPERTY_WEATHER } from '@/lib/data/weather'
import { OVERNIGHT_REPORTS, GUEST_ISSUES, getActiveIssues } from '@/lib/data/guestServices'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS } from '@/lib/data/staff'
import CountdownTimer from '@/components/shared/CountdownTimer'
import WeatherWidget from '@/components/shared/WeatherWidget'
import { getPTEBadge, sortJobsByAccessibility } from '@/lib/utils/pteUtils'

const USER_TO_STAFF: Record<string, string> = {
  'u3': 's1',
  'u4': 's3',
  'u5': 's2',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getRoleBadgeColor(role: string, subRole?: string): string {
  if (role === 'operator') return '#7c3aed'
  if (role === 'owner') return '#2563eb'
  if (subRole?.includes('Cleaning')) return '#d97706'
  if (subRole?.includes('Maintenance')) return '#0ea5e9'
  if (subRole?.includes('Guest')) return '#ec4899'
  return '#d97706'
}

function getRoleLabel(role: string, subRole?: string): string {
  if (role === 'operator') return 'Operator'
  if (role === 'owner') return 'Owner'
  return subRole ?? 'Staff'
}

const SHIFT_TYPE_LABEL: Record<string, string> = {
  cleaning: 'Turnover Clean',
  maintenance: 'Maintenance',
  inspection: 'Inspection',
  intake: 'Property Intake',
  standby: 'On Standby',
}

export default function BriefingPage() {
  const [today, setToday] = useState('')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [myShiftsToday, setMyShiftsToday] = useState<Shift[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = new Date().toISOString().split('T')[0]
    setToday(t)
  }, [])

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try {
        const user: UserProfile = JSON.parse(stored)
        setCurrentUser(user)
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  useEffect(() => {
    if (!today || !currentUser) return
    const staffId = USER_TO_STAFF[currentUser.id]
    if (staffId) {
      const shifts = SHIFTS.filter(s => s.staffId === staffId && s.date === today)
      setMyShiftsToday(shifts)
    }
  }, [today, currentUser])

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dateLabel = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const fullDateLabel = `${dayName}, ${dateLabel}`

  if (!mounted) return null

  // No user — generic screen
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 50%, #1e3a5f 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f1923 0%, transparent 60%), #0a0f1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 20 }}>N</div>
            <span style={{ fontWeight: 800, color: '#fff', fontSize: 26, letterSpacing: '-0.02em' }}>NestOps</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            {getGreeting()}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            {fullDateLabel}
          </p>

          {/* Oslo default weather */}
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>❄️</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>4°C</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Oslo · Light snow this morning</span>
          </div>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>
            Sign in to see your daily briefing
          </p>

          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '16px 36px',
              borderRadius: 14,
              background: '#7c3aed',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign In →
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Personalized screen ───────────────────────────────────────────────────
  const firstName = currentUser.name.split(' ')[0]
  const roleLabel = getRoleLabel(currentUser.role, currentUser.subRole)
  const badgeColor = getRoleBadgeColor(currentUser.role, currentUser.subRole)
  const staffId = USER_TO_STAFF[currentUser.id]

  // Weather: earliest shift today → propertyId → weather
  const sortedShifts = [...myShiftsToday].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const firstShift = sortedShifts[0] ?? null
  const weatherPropertyId = firstShift?.propertyId ?? 'p1'
  const weatherData = PROPERTY_WEATHER.find(w => w.propertyId === weatherPropertyId) ?? PROPERTY_WEATHER[0]

  // Countdown target
  const shiftTargetTime = firstShift && today
    ? `${today}T${firstShift.startTime}:00`
    : today ? `${today}T09:00:00` : ''

  // Minutes until shift
  const minutesUntilShift = firstShift && today
    ? (() => {
        const shiftMs = new Date(`${today}T${firstShift.startTime}:00`).getTime()
        return (shiftMs - Date.now()) / 60000
      })()
    : Infinity

  // Operator data
  const todayReport = today ? OVERNIGHT_REPORTS.find(r => r.date === today) : undefined
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const urgentIssues = activeIssues.filter(i => i.severity === 'critical' || i.severity === 'high')
  const openIssues = activeIssues.filter(i => i.severity === 'medium' || i.severity === 'low')
  const unassignedOvernightCount = todayReport?.issues.filter(i => i.status === 'unassigned').length ?? 0

  // Maintenance jobs — sorted by accessibility (vacant/auto-granted first)
  const rawMyJobs = staffId ? JOBS.filter(j => j.staffId === staffId) : []
  const myJobs = sortJobsByAccessibility(rawMyJobs)
  const firstAutoGrantedJob = myJobs.find(j => j.pteStatus === 'auto_granted')

  // Guest services data
  const pendingPTEJobs = JOBS.filter(j => j.pteStatus === 'pending')
  const staffOnShift = today ? SHIFTS.filter(s => s.date === today).length : 0

  const shiftProperty = firstShift ? PROPERTIES.find(p => p.id === firstShift.propertyId) : null

  // Suppress unused import warnings for WeatherWidget
  void WeatherWidget

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #1e3a5f 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f1923 0%, transparent 60%), #0a0f1a',
      position: 'relative',
    }}>
      {/* Header bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52,
        background: 'rgba(10,15,26,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13 }}>N</div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>NestOps</span>
        </div>
        <Link
          href="/app/dashboard"
          style={{
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Dashboard →
        </Link>
      </div>

      {/* Main content */}
      <div style={{ paddingTop: 72, paddingBottom: 60, padding: '72px 20px 60px', maxWidth: 600, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* GREETING */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {getGreeting()}, {firstName} 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${badgeColor}30`, color: badgeColor }}>
                {roleLabel}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{fullDateLabel}</span>
            </div>
            {/* Compact weather */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{weatherData.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{weatherData.temperature}°C</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{weatherData.location} · {weatherData.note ?? weatherData.condition.replace('_', ' ')}</span>
            </div>
          </div>

          {/* COUNTDOWN CARD */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: '28px 24px',
            marginBottom: 24,
            textAlign: 'center',
          }}>
            {firstShift && shiftTargetTime ? (
              <CountdownTimer
                targetTime={shiftTargetTime}
                label="YOUR SHIFT STARTS IN"
                context={`${shiftProperty?.name ?? firstShift.propertyId} · ${firstShift.startTime} – ${firstShift.endTime}`}
              />
            ) : (
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', padding: '8px 0' }}>
                No shift scheduled today
              </div>
            )}
          </div>

          {/* ── OPERATOR ── */}
          {currentUser.role === 'operator' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

              {/* OVERNIGHT */}
              {todayReport && todayReport.issues.length > 0 && (
                <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
                    🌙 {todayReport.issues.length} issue{todayReport.issues.length !== 1 ? 's' : ''} reported overnight
                  </div>
                  {todayReport.issues.map(issue => (
                    <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: issue.severity === 'high' ? '#f8717120' : '#fb923c20', color: issue.severity === 'high' ? '#f87171' : '#fb923c' }}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', minWidth: 40 }}>{issue.time}</span>
                      <span style={{ fontSize: 13, color: '#fff', flex: 1 }}>{issue.title}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{issue.property}</span>
                      <span style={{ fontSize: 11, color: issue.assignedTo ? 'rgba(255,255,255,0.5)' : '#f87171', fontWeight: issue.assignedTo ? 400 : 600 }}>
                        {issue.assignedTo ?? '⚠️ Unassigned'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* PORTFOLIO TODAY */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                  Portfolio Today
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Properties', value: PROPERTIES.length.toString() },
                    { label: 'Check-ins today', value: PROPERTIES.filter(p => p.status === 'live').length.toString() },
                    { label: 'Staff on shift', value: staffOnShift.toString() },
                    { label: 'Overnight issues', value: (todayReport?.issues.length ?? 0).toString(), alert: (todayReport?.issues.length ?? 0) > 0 },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: item.alert ? '#f87171' : '#fff', marginBottom: 2 }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COUNTDOWN to first check-in */}
              {today && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
                  <CountdownTimer
                    targetTime={`${today}T15:00:00`}
                    label="FIRST CHECK-IN IN"
                    context="15:00 · First guest arrival"
                  />
                </div>
              )}

              <Link
                href="/app/dashboard"
                style={{
                  display: 'block', width: '100%', padding: '18px', borderRadius: 16,
                  background: '#7c3aed', color: '#fff', fontSize: 16, fontWeight: 700,
                  textDecoration: 'none', textAlign: 'center', marginTop: 8,
                }}
              >
                Go to Dashboard →
              </Link>
            </motion.div>
          )}

          {/* ── OWNER ── */}
          {currentUser.role === 'owner' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                  Your Properties
                </div>
                {PROPERTIES.slice(0, 2).map(prop => (
                  <div key={prop.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {prop.imageUrl && (
                      <img src={prop.imageUrl} alt={prop.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{prop.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>1 check-in today · 0 issues</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/app/dashboard"
                style={{
                  display: 'block', width: '100%', padding: '18px', borderRadius: 16,
                  background: '#2563eb', color: '#fff', fontSize: 16, fontWeight: 700,
                  textDecoration: 'none', textAlign: 'center', marginTop: 8,
                }}
              >
                Go to Dashboard →
              </Link>
            </motion.div>
          )}

          {/* ── CLEANING STAFF ── */}
          {currentUser.role === 'staff' && currentUser.subRole?.includes('Cleaning') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {myShiftsToday.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  No cleanings scheduled today
                </div>
              ) : (
                myShiftsToday.map((shift, idx) => {
                  const prop = PROPERTIES.find(p => p.id === shift.propertyId)
                  const [sh, sm] = shift.startTime.split(':').map(Number)
                  const [eh, em] = shift.endTime.split(':').map(Number)
                  const duration = ((eh * 60 + em) - (sh * 60 + sm)) / 60
                  const isFirst = idx === 0
                  return (
                    <div key={shift.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 12, overflow: 'hidden' }}>
                      {prop?.imageUrl && (
                        <img src={prop.imageUrl} alt={prop.name ?? shift.propertyId} style={{ width: '100%', height: 96, borderRadius: 8, objectFit: 'cover', marginBottom: 12 }} />
                      )}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{prop?.name ?? shift.propertyId}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: isFirst ? '#3b82f620' : '#d9770620', color: isFirst ? '#60a5fa' : '#fbbf24', flexShrink: 0, marginLeft: 8 }}>
                          {isFirst ? 'NEXT UP 🔵' : 'LATER ⏰'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                        {SHIFT_TYPE_LABEL[shift.type] ?? shift.type} · {shift.startTime} – {shift.endTime}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: duration < 4 ? 6 : 0 }}>
                        5 tasks · {duration}h window
                      </div>
                      {duration < 4 && (
                        <div style={{ fontSize: 12, color: '#fbbf24' }}>⚠️ Tight turnaround</div>
                      )}
                    </div>
                  )
                })
              )}

              {/* OTHER TASKS TODAY */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                  Other Tasks Today
                </div>
                {[
                  'Deliver linen set — Harbor Studio · Before 13:00',
                  'Restock toiletry kits — Ocean View · After clean',
                ].map((task, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{task}</span>
                  </div>
                ))}
              </div>

              {/* THIS WEEK */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                  This Week
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { day: 'Mon', state: 'done' },
                    { day: 'Tue', state: 'done' },
                    { day: 'Wed', state: 'today' },
                    { day: 'Thu', state: 'upcoming' },
                    { day: 'Fri', state: 'upcoming' },
                  ].map(d => (
                    <div key={d.day} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: d.state === 'today' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', border: d.state === 'today' ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{d.day}</div>
                      <div style={{ fontSize: 13 }}>{d.state === 'done' ? '✓' : d.state === 'today' ? '●' : '○'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Go to Dashboard */}
              <Link
                href="/app/dashboard"
                style={{
                  display: 'block', padding: '18px', borderRadius: 16,
                  background: '#7c3aed',
                  color: '#fff', fontSize: 16, fontWeight: 700,
                  textDecoration: 'none', textAlign: 'center',
                }}
              >
                Go to Dashboard →
              </Link>
            </motion.div>
          )}

          {/* ── MAINTENANCE STAFF ── */}
          {currentUser.role === 'staff' && currentUser.subRole?.includes('Maintenance') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                  Your Jobs Today
                </div>
                {myJobs.length === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                    No jobs assigned
                  </div>
                ) : (
                  myJobs.map(job => {
                    const pteBadge = getPTEBadge(job.pteStatus ?? 'not_required')
                    const priorityEmoji = job.priority === 'urgent' ? '🔴' : job.priority === 'high' ? '🟡' : '⚪'
                    const isAutoGranted = job.pteStatus === 'auto_granted'
                    const isPending = job.pteStatus === 'pending'
                    const showGoHereFirst = isAutoGranted
                    const showHint = isPending && firstAutoGrantedJob !== undefined && firstAutoGrantedJob.id !== job.id
                    return (
                      <div key={job.id} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${isAutoGranted ? 'rgba(22,163,74,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, overflow: 'hidden', marginBottom: 10 }}>
                        {showGoHereFirst && (
                          <div style={{ background: '#16a34a', padding: '6px 16px', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            🟢 Vacant — Go Now
                          </div>
                        )}
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <span style={{ fontSize: 14 }}>{priorityEmoji}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                              {job.priority.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{job.title}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{job.propertyName}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: pteBadge.color + '20', color: pteBadge.color }}>
                              {pteBadge.icon} {pteBadge.label}
                            </span>
                          </div>
                          {showHint && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#fbbf24' }}>
                              💡 Do the {firstAutoGrantedJob!.propertyName} job first while waiting
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Go to Dashboard */}
              <Link
                href="/app/dashboard"
                style={{
                  display: 'block', padding: '18px', borderRadius: 16,
                  background: '#7c3aed', color: '#fff', fontSize: 16, fontWeight: 700,
                  textDecoration: 'none', textAlign: 'center',
                }}
              >
                Go to Dashboard →
              </Link>
            </motion.div>
          )}

          {/* ── GUEST SERVICES ── */}
          {currentUser.role === 'staff' && currentUser.subRole?.includes('Guest') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {/* ACTIVE ISSUES */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                  Active Issues
                </div>
                <div style={{ display: 'flex', gap: 10, marginBottom: unassignedOvernightCount > 0 ? 10 : 0 }}>
                  <span style={{ fontSize: 13, color: '#f87171' }}>🔴 {urgentIssues.length} urgent</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>·</span>
                  <span style={{ fontSize: 13, color: '#fbbf24' }}>🟡 {openIssues.length} open</span>
                </div>
                {unassignedOvernightCount > 0 && (
                  <div style={{ fontSize: 12, color: '#f87171' }}>
                    {unassignedOvernightCount} unassigned overnight issue{unassignedOvernightCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* TODAY'S CHECK-INS */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                  {`Today's Check-ins`}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>2 arrivals · 15:00 and 17:00</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Both properties need readiness check</div>
              </div>

              {/* PTE REQUESTS */}
              {pendingPTEJobs.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                    PTE Requests
                  </div>
                  <div style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>⏳ {pendingPTEJobs.length} pending — {pendingPTEJobs[0]?.propertyName ?? 'Property'}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Requires guest contact</div>
                </div>
              )}

              {/* Go to Dashboard */}
              <Link
                href="/app/dashboard"
                style={{
                  display: 'block', padding: '18px', borderRadius: 16,
                  background: '#7c3aed', color: '#fff', fontSize: 16, fontWeight: 700,
                  textDecoration: 'none', textAlign: 'center',
                }}
              >
                Go to Dashboard →
              </Link>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  )
}

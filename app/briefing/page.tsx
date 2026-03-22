'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { UserProfile } from '@/context/RoleContext'
import { SHIFTS } from '@/lib/data/staffScheduling'
import type { Shift } from '@/lib/data/staffScheduling'
import { PROPERTY_WEATHER } from '@/lib/data/weather'
import { OVERNIGHT_REPORTS, GUEST_ISSUES, getActiveIssues } from '@/lib/data/guestServices'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import CountdownTimer from '@/components/shared/CountdownTimer'
import WeatherWidget from '@/components/shared/WeatherWidget'
import { getPTEBadge, sortJobsByAccessibility } from '@/lib/utils/pteUtils'
import {
  getPrefs, savePrefs, resetPrefs,
  TOGGLE_LABELS, ALWAYS_ON,
} from '@/lib/data/briefingPrefs'
import type { BriefingPrefs, BriefingToggles } from '@/lib/data/briefingPrefs'

const USER_TO_STAFF: Record<string, string> = {
  'u3': 's1', // Maria → Johan Larsson (cleaning)
  'u4': 's3', // Bjorn → Marcus Berg (maintenance)
  'u5': 's4', // Fatima → Fatima Ndiaye (guest services)
  'u7': 's2', // Anna → Anna Kowalski (inspector)
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
  const router = useRouter()
  const [today, setToday] = useState('')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [myShiftsToday, setMyShiftsToday] = useState<Shift[]>([])
  const [mounted, setMounted] = useState(false)
  const [prefs, setPrefs] = useState<BriefingPrefs | null>(null)
  const [showToggles, setShowToggles] = useState(false)
  const [accessCodeVisible, setAccessCodeVisible] = useState<Record<string, boolean>>({})
  const [clockInRecord, setClockInRecord] = useState<{ staffId: string; shiftId: string; clockInTime: string; status: string } | null>(null)

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
        // Redirect cleaning staff to dedicated briefing page
        if (user.role === 'staff' &&
            (user.subRole?.includes('Cleaner') || user.subRole?.includes('Cleaning'))) {
          router.replace('/briefing/cleaners')
          return
        }
        // Redirect maintenance staff to dedicated briefing page
        if (user.role === 'staff' && user.subRole?.includes('Maintenance')) {
          router.replace('/briefing/maintenance')
          return
        }
        // Redirect guest services staff to dedicated briefing page
        if (user.role === 'staff' && user.subRole?.includes('Guest')) {
          router.replace('/briefing/guest-services')
          return
        }
        setCurrentUser(user)
        const loaded = getPrefs(user.id, user.subRole ?? '', user.role)
        setPrefs(loaded)
        try {
          const clockInStored = localStorage.getItem('nestops_clockin')
          if (clockInStored) setClockInRecord(JSON.parse(clockInStored))
        } catch { /* ignore */ }
      } catch {
        // ignore parse errors
      }
    }
  }, [router])

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

  const sortedShifts = [...myShiftsToday].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const firstShift = sortedShifts[0] ?? null
  const weatherPropertyId = firstShift?.propertyId ?? 'p1'
  const weatherData = PROPERTY_WEATHER.find(w => w.propertyId === weatherPropertyId) ?? PROPERTY_WEATHER[0]

  const shiftTargetTime = firstShift && today
    ? `${today}T${firstShift.startTime}:00`
    : today ? `${today}T09:00:00` : ''

  const minutesUntilShift = firstShift && today
    ? (() => {
        const shiftMs = new Date(`${today}T${firstShift.startTime}:00`).getTime()
        return (shiftMs - Date.now()) / 60000
      })()
    : Infinity

  const todayReport = today
    ? (OVERNIGHT_REPORTS.find(r => r.date === today)
        ?? [...OVERNIGHT_REPORTS].sort((a, b) => b.date.localeCompare(a.date))[0])
    : undefined
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const urgentIssues = activeIssues.filter(i => i.severity === 'critical' || i.severity === 'high')
  const openIssues = activeIssues.filter(i => i.severity === 'medium' || i.severity === 'low')
  const unassignedOvernightCount = todayReport?.issues.filter(i => i.status === 'unassigned').length ?? 0

  const rawMyJobs = staffId ? JOBS.filter(j => j.staffId === staffId) : []
  const myJobs = sortJobsByAccessibility(rawMyJobs)
  const firstAutoGrantedJob = myJobs.find(j => j.pteStatus === 'auto_granted')

  const pendingPTEJobs = JOBS.filter(j => j.pteStatus === 'pending')
  const staffOnShift = today ? SHIFTS.filter(s => s.date === today).length : 0
  const shiftProperty = firstShift ? PROPERTIES.find(p => p.id === firstShift.propertyId) : null

  void WeatherWidget

  const handleClockInAndGo = (destination: string = '/app/dashboard') => {
    localStorage.setItem('nestops_clockin', JSON.stringify({
      staffId: currentUser.id,
      shiftId: firstShift?.id ?? 'unknown',
      date: today,
      clockInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      clockInTimestamp: Date.now(),
      status: 'in_progress',
    }))
    router.push(destination)
  }

  const primaryBtnBase: React.CSSProperties = {
    display: 'block', width: '100%', padding: '18px', borderRadius: 16,
    fontSize: 16, fontWeight: 700, textDecoration: 'none', textAlign: 'center',
    border: 'none', cursor: 'pointer',
  }
  const secondaryBtnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '14px', borderRadius: 16,
    fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
  }

  const renderCTA = () => {
    if (!currentUser) return null
    if (currentUser.role === 'operator') {
      return (
        <Link href="/app/dashboard" style={{ ...primaryBtnBase, background: '#7c3aed', color: '#fff' }}>
          Go to Dashboard →
        </Link>
      )
    }
    if (currentUser.role === 'owner') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => handleClockInAndGo('/owner')}
            style={{ ...primaryBtnBase, background: '#7F77DD', color: '#fff' }}
          >
            ▶ Clock In Now
          </button>
          <Link href="/owner" style={secondaryBtnStyle}>
            Go to Owner Portal →
          </Link>
        </div>
      )
    }
    const accentColor = currentUser.subRole?.includes('Cleaning') ? '#d97706'
      : currentUser.subRole?.includes('Maintenance') ? '#0ea5e9'
      : '#ec4899'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => handleClockInAndGo()}
          style={{ ...primaryBtnBase, background: accentColor, color: '#fff' }}
        >
          ▶ Clock In Now
        </button>
        <Link href="/app/dashboard" style={secondaryBtnStyle}>
          View Full Dashboard
        </Link>
      </div>
    )
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            aria-label="Briefing preferences"
            onClick={() => setShowToggles(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: 15,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1,
            }}
          >
            ⚙️
          </button>
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
      </div>

      {/* Main content */}
      <div style={{ paddingTop: 72, paddingBottom: 60, padding: '72px 20px 60px', maxWidth: 600, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* GREETING — always on */}
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
            {/* Weather — toggle: weather */}
            {prefs?.toggles.weather && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{weatherData.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{weatherData.temperature}°C</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{weatherData.location} · {weatherData.note ?? weatherData.condition.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          {/* COUNTDOWN CARD — always on */}
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

              {/* OVERNIGHT — toggle: overnightissues */}
              {prefs?.toggles.overnightissues && todayReport && todayReport.issues.length > 0 && (
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
                      <span style={{ fontSize: 11, color: issue.assignedTo ? 'rgba(255,255,255,0.5)' : '#f87171', fontWeight: issue.assignedTo ? 400 : 700 }}>
                        {issue.assignedTo ?? '⚠️ Unassigned'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TEAM STATUS — toggle: teamstatus */}
              {prefs?.toggles.teamstatus && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                    Team Status
                  </div>
                  {(() => {
                    const todayShifts = today ? SHIFTS.filter(s => s.date === today) : []
                    const staffShiftMap = new Map<string, typeof todayShifts[0]>()
                    todayShifts.forEach(s => { if (!staffShiftMap.has(s.staffId)) staffShiftMap.set(s.staffId, s) })
                    const DEMO_STATUS: Record<string, { clockedIn: boolean; time?: string; note?: string }> = {
                      's1': { clockedIn: true, time: '08:55' },
                      's3': { clockedIn: true, time: '07:50' },
                      's4': { clockedIn: true, note: 'Remote' },
                      's2': { clockedIn: false },
                    }
                    return STAFF_MEMBERS
                      .filter(sm => staffShiftMap.has(sm.id))
                      .map(sm => {
                        const shift = staffShiftMap.get(sm.id)!
                        const prop = PROPERTIES.find(p => p.id === shift.propertyId)
                        const isActuallyClockedIn = clockInRecord?.staffId === sm.id
                        const demo = DEMO_STATUS[sm.id]
                        const isClockedIn = isActuallyClockedIn || demo?.clockedIn
                        const clockTime = isActuallyClockedIn ? clockInRecord!.clockInTime : demo?.time
                        const statusNote = demo?.note
                        return (
                          <div key={sm.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{sm.name}</span>
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>· {prop?.name ?? shift.propertyId}</span>
                            </div>
                            <span style={{ fontSize: 12, color: isClockedIn ? '#4ade80' : 'rgba(255,255,255,0.35)', fontWeight: isClockedIn ? 600 : 400 }}>
                              {isClockedIn
                                ? (statusNote ? `✓ ${statusNote}` : clockTime ? `✓ Clocked in ${clockTime}` : '✓ On shift')
                                : '○ Not yet clocked in'}
                            </span>
                          </div>
                        )
                      })
                  })()}
                </div>
              )}

              {/* CHECK-IN READINESS — toggle: checkins */}
              {prefs?.toggles.checkins && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                    Check-in Readiness
                  </div>
                  {[
                    { name: 'Sunset Villa',   time: '15:00', status: 'ok',   note: '✓ Cleaning scheduled' },
                    { name: 'Ocean View Apt', time: '17:00', status: 'warn', note: '⚠️ Tight turnaround' },
                    { name: 'Downtown Loft',  time: '—',     status: 'none', note: 'No arrivals today' },
                  ].map((row, i, arr) => (
                    <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', flex: 1 }}>{row.name}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 44, textAlign: 'right' }}>{row.time}</span>
                      <span style={{ fontSize: 12, color: row.status === 'ok' ? '#4ade80' : row.status === 'warn' ? '#fbbf24' : 'rgba(255,255,255,0.3)', minWidth: 140, textAlign: 'right' }}>
                        {row.note}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* FIRST CHECK-IN COUNTDOWN — toggle: firstcheckin */}
              {prefs?.toggles.firstcheckin && today && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
                  <CountdownTimer
                    targetTime={`${today}T15:00:00`}
                    label="FIRST CHECK-IN IN"
                    context="15:00 · First guest arrival"
                  />
                </div>
              )}

              {/* POSITIVE EMPTY STATE */}
              {urgentIssues.length === 0 && unassignedOvernightCount === 0 && (
                <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 16, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#4ade80' }}>Zero messages needed. Team is running.</span>
                </div>
              )}

              <div style={{ marginTop: 8 }}>{renderCTA()}</div>
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
                {PROPERTIES.length > 2 && (
                  <Link href="/owner/properties" style={{ display: 'block', marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                    +{PROPERTIES.length - 2} more properties →
                  </Link>
                )}
              </div>

              <div style={{ marginTop: 8 }}>{renderCTA()}</div>
            </motion.div>
          )}

          {/* ── CLEANING STAFF ── */}
          {currentUser.role === 'staff' && currentUser.subRole?.includes('Cleaning') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

              {/* SHIFT CARDS — toggle: propertiestoday */}
              {prefs?.toggles.propertiestoday && (
                myShiftsToday.length === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                    No cleanings scheduled today
                  </div>
                ) : (
                  myShiftsToday.map((shift, idx) => {
                    const prop = PROPERTIES.find(p => p.id === shift.propertyId)
                    const [startH, startM] = shift.startTime.split(':').map(Number)
                    const [endH, endM] = shift.endTime.split(':').map(Number)
                    const durationMins = (endH * 60 + endM) - (startH * 60 + startM)
                    const durationStr = durationMins % 60 === 0 ? `${durationMins / 60}h` : `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
                    const taskCount = shift.jobIds.length
                    const isFirst = idx === 0
                    const cleanType = shift.notes?.toLowerCase().includes('deep') ? 'DEEP CLEAN' : 'TURNOVER CLEAN'
                    // Tight turnaround: only when linked job has checkinTime and gap < 4h
                    const linkedJobs = JOBS.filter(j => shift.jobIds.includes(j.id))
                    const jobWithCheckin = linkedJobs.find(j => j.checkinTime && j.checkoutTime)
                    let tightTurnaround = false
                    if (jobWithCheckin?.checkinTime && jobWithCheckin?.checkoutTime) {
                      const [coh, com] = jobWithCheckin.checkoutTime.split(':').map(Number)
                      const [cih, cim] = jobWithCheckin.checkinTime.split(':').map(Number)
                      tightTurnaround = (cih * 60 + cim) - (coh * 60 + com) < 240
                    }
                    return (
                      <div key={shift.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 12, overflow: 'hidden' }}>
                        {prop?.imageUrl && (
                          <img src={prop.imageUrl} alt={prop.name ?? shift.propertyId} style={{ width: '100%', height: 96, borderRadius: 8, objectFit: 'cover', marginBottom: 12 }} />
                        )}
                        {/* Clean type as primary heading + badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{cleanType}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: isFirst ? '#3b82f620' : '#d9770620', color: isFirst ? '#60a5fa' : '#fbbf24', flexShrink: 0, marginLeft: 8 }}>
                            {isFirst ? 'NEXT UP 🔵' : 'LATER ⏰'}
                          </span>
                        </div>
                        {/* Property + time */}
                        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                          {prop?.name ?? shift.propertyId} · {shift.startTime} – {shift.endTime}
                        </div>
                        {/* Duration + task count */}
                        {prefs?.toggles.taskcount && (
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
                            {durationStr} window · {taskCount} task{taskCount !== 1 ? 's' : ''}
                          </div>
                        )}
                        {/* Check-in time from linked job */}
                        {jobWithCheckin?.checkinTime && (
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                            Check-in: {jobWithCheckin.checkinTime}
                          </div>
                        )}
                        {/* Tight turnaround strip — only when gap constraint exists */}
                        {prefs?.toggles.turnaroundwarning && tightTurnaround && jobWithCheckin && (
                          <div style={{ marginTop: 8, padding: '6px 10px', background: '#fbbf2415', borderRadius: 8, fontSize: 12, color: '#fbbf24' }}>
                            ⚠️ Tight turnaround — {prop?.name ?? shift.propertyId}, next check-in {jobWithCheckin.checkinTime}
                          </div>
                        )}
                      </div>
                    )
                  })
                )
              )}

              {/* SUPPLY REMINDERS — toggle: supplyreminders */}
              {prefs?.toggles.supplyreminders && (
                <div style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: '#fbbf24' }}>
                    🧴 SUPPLIES: Linen set (Harbor Studio) · Toiletry kit (Ocean View)
                  </span>
                </div>
              )}

              {/* OTHER TASKS TODAY — toggle: othertasks */}
              {prefs?.toggles.othertasks && (
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
              )}

              {/* THIS WEEK — toggle: thisweek */}
              {prefs?.toggles.thisweek && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                    This Week
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { day: 'Mon', state: 'done' },
                      { day: 'Tue', state: 'done' },
                      { day: 'Wed', state: 'done' },
                      { day: 'Thu', state: 'today' },
                      { day: 'Fri', state: 'upcoming' },
                    ].map(d => (
                      <div key={d.day} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: d.state === 'today' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)', border: d.state === 'today' ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent' }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{d.day}</div>
                        <div style={{ fontSize: 13 }}>{d.state === 'done' ? '✓' : d.state === 'today' ? '●' : '○'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {renderCTA()}
            </motion.div>
          )}

          {/* ── MAINTENANCE STAFF ── */}
          {currentUser.role === 'staff' && currentUser.subRole?.includes('Maintenance') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

              {/* JOBS TODAY — toggle: propertiestoday */}
              {prefs?.toggles.propertiestoday && (
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
                      const isAutoGranted = job.pteStatus === 'auto_granted'
                      const isGranted = job.pteStatus === 'granted'
                      const isPending = job.pteStatus === 'pending'
                      const isDenied = job.pteStatus === 'denied' || job.pteStatus === 'expired'
                      const isNotRequired = job.pteStatus === 'not_required'
                      const canShowCode = isAutoGranted || isGranted || isNotRequired
                      const showHint = isPending && firstAutoGrantedJob !== undefined && firstAutoGrantedJob.id !== job.id
                      const priorityLabel = job.priority === 'urgent' ? '🔴 URGENT' : job.priority === 'high' ? '🟡 HIGH' : '⚪ NORMAL'
                      const pteDescription = isAutoGranted ? '✓ Auto-granted · No guest · Enter any time'
                        : isGranted ? '✓ Granted · Access confirmed'
                        : isPending ? '⏳ PTE Pending · Fatima contacting guest'
                        : isNotRequired ? '○ No PTE required'
                        : '✗ Access denied — contact Fatima'
                      const codeVisible = accessCodeVisible[job.id] ?? false
                      const propData = PROPERTIES.find(p => p.id === job.propertyId)
                      const accessCode = propData?.accessCodes?.[0]?.code ?? 'Check SuiteOp'
                      void isDenied
                      return (
                        <div key={job.id} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${isAutoGranted ? 'rgba(22,163,74,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, overflow: 'hidden', marginBottom: 10 }}>
                          {/* GO HERE FIRST banner */}
                          {prefs?.toggles.routingHint && isAutoGranted && (
                            <div style={{ background: '#16a34a', padding: '6px 16px', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              🟢 GO HERE FIRST — PROPERTY VACANT
                            </div>
                          )}
                          <div style={{ padding: '14px 16px' }}>
                            {/* Priority badge with text */}
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: job.priority === 'urgent' ? '#f87171' : job.priority === 'high' ? '#fbbf24' : 'rgba(255,255,255,0.5)' }}>
                                {priorityLabel}
                              </span>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{job.title}</div>
                            {/* jobLocation: property name */}
                            {prefs?.toggles.jobLocation && (
                              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{job.propertyName}</div>
                            )}
                            {/* pteStatus: PTE description line */}
                            {prefs?.toggles.pteStatus && (
                              <div style={{ fontSize: 12, color: canShowCode ? '#4ade80' : isPending ? '#fbbf24' : '#f87171', marginBottom: 6 }}>
                                {pteDescription}
                              </div>
                            )}
                            {/* Access code button — toggle: accesstype */}
                            {prefs?.toggles.accesstype && (
                              canShowCode ? (
                                codeVisible ? (
                                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 8, display: 'inline-block', marginBottom: 4 }}>
                                    🔑 {accessCode}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAccessCodeVisible(prev => ({ ...prev, [job.id]: true }))}
                                    style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', marginBottom: 4 }}
                                  >
                                    Show Code 👁
                                  </button>
                                )
                              ) : (
                                <button
                                  disabled
                                  style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px', cursor: 'not-allowed', marginBottom: 4 }}
                                >
                                  🔒 Locked — awaiting PTE
                                </button>
                              )
                            )}
                            {/* Routing hint: pending cross-ref */}
                            {prefs?.toggles.routingHint && showHint && (
                              <div style={{ marginTop: 8, fontSize: 12, color: '#fbbf24' }}>
                                💡 Do {firstAutoGrantedJob!.propertyName} first while waiting for PTE approval
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {renderCTA()}
            </motion.div>
          )}

          {/* ── GUEST SERVICES ── */}
          {currentUser.role === 'staff' && currentUser.subRole?.includes('Guest') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

              {/* NEEDS YOUR ACTION — toggle: needsaction */}
              {prefs?.toggles.needsaction && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                    Needs Your Action
                  </div>
                  {(() => {
                    const unassignedIssues = todayReport?.issues.filter(i => i.status === 'unassigned') ?? []
                    type ActionItem = { icon: string; text: string; severity: 'high' | 'medium' }
                    const actionItems: ActionItem[] = [
                      ...unassignedIssues.map(i => ({
                        icon: '🌙',
                        text: `${i.title} · ${i.property} · ⚠️ UNASSIGNED`,
                        severity: 'high' as const,
                      })),
                      ...pendingPTEJobs.map(j => ({
                        icon: '⏳',
                        text: `PTE needed — ${j.staffId ? (STAFF_MEMBERS.find(s => s.id === j.staffId)?.name.split(' ')[0] ?? 'Staff') : 'Staff'} at ${j.propertyName} · Contact guest`,
                        severity: 'medium' as const,
                      })),
                      { icon: '⏱️', text: 'Ocean View 17:00 — tight turnaround window', severity: 'medium' as const },
                    ]
                    if (actionItems.length === 0) {
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14 }}>✅</span>
                          <span style={{ fontSize: 14, color: '#4ade80', fontWeight: 600 }}>Nothing needs your action right now</span>
                        </div>
                      )
                    }
                    return actionItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 0', borderBottom: i < actionItems.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                        <span style={{ fontSize: 13, color: item.severity === 'high' ? '#f87171' : 'rgba(255,255,255,0.75)', fontWeight: item.severity === 'high' ? 600 : 400 }}>{item.text}</span>
                      </div>
                    ))
                  })()}
                </div>
              )}

              {/* OVERNIGHT ISSUES — toggle: overnightissues */}
              {prefs?.toggles.overnightissues && todayReport && todayReport.issues.length > 0 && (
                <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                    Overnight Issues
                  </div>
                  {todayReport.issues.map((issue, i) => (
                    <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < todayReport.issues.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>🌙</span>
                      <span style={{ fontSize: 13, flex: 1, color: issue.assignedTo ? 'rgba(255,255,255,0.5)' : '#f87171', fontWeight: issue.assignedTo ? 400 : 700 }}>
                        {issue.title} · {issue.property}
                      </span>
                      <span style={{ fontSize: 12, color: issue.assignedTo ? 'rgba(255,255,255,0.4)' : '#f87171', fontWeight: issue.assignedTo ? 400 : 700 }}>
                        {issue.assignedTo ? `${issue.assignedTo} ✓` : '⚠️ UNASSIGNED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ARRIVAL READINESS — toggle: checkins */}
              {prefs?.toggles.checkins && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                    Arrival Readiness
                  </div>
                  {[
                    { name: 'Sunset Villa',   time: '15:00', status: 'ok',   note: '✓ Cleaning on track' },
                    { name: 'Ocean View Apt', time: '17:00', status: 'warn', note: '⚠️ Tight turnaround' },
                  ].map((row, i, arr) => (
                    <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', flex: 1 }}>{row.name}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{row.time}</span>
                      <span style={{ fontSize: 12, color: row.status === 'ok' ? '#4ade80' : '#fbbf24', minWidth: 130, textAlign: 'right' }}>{row.note}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ACTIVE ISSUES — toggle: activeissues */}
              {prefs?.toggles.activeissues && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                    Active Issues
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#f87171' }}>🔴 {urgentIssues.length} urgent</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>·</span>
                    <span style={{ fontSize: 13, color: '#fbbf24' }}>🟡 {openIssues.length} open</span>
                  </div>
                </div>
              )}

              {/* PTE REQUESTS — toggle: pterequest */}
              {prefs?.toggles.pterequest && pendingPTEJobs.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                    PTE Requests
                  </div>
                  {pendingPTEJobs.map((job, i) => {
                    const staffName = STAFF_MEMBERS.find(s => s.id === job.staffId)?.name ?? 'Staff'
                    return (
                      <div key={job.id} style={{ padding: '8px 0', borderBottom: i < pendingPTEJobs.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: '#fbbf24' }}>⏳</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{staffName}</span>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>· {job.propertyName}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{job.title}</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)', color: '#ec4899', cursor: 'pointer' }}>
                            Contact Guest
                          </button>
                          <button style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                            View Job
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {renderCTA()}
            </motion.div>
          )}

        </motion.div>
      </div>

      {/* ── TOGGLE PANEL ── */}
      <AnimatePresence>
        {showToggles && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowToggles(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 100,
              }}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                background: '#111827',
                borderTop: '1px solid #1f2937',
                borderRadius: '16px 16px 0 0',
                padding: 24,
                zIndex: 101,
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#f9fafb' }}>
                  Briefing Preferences
                </span>
                <button
                  onClick={() => setShowToggles(false)}
                  style={{ color: '#6b7280', fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {prefs && Object.entries(TOGGLE_LABELS)
                .filter(([key, meta]) =>
                  !ALWAYS_ON.includes(key as keyof BriefingToggles) &&
                  (meta.roles.includes('all') ||
                    meta.roles.includes(
                      currentUser.role === 'operator'
                        ? 'operator'
                        : currentUser.subRole ?? ''
                    ))
                )
                .map(([key, meta]) => {
                  const toggleKey = key as keyof BriefingToggles
                  const isOn = prefs.toggles[toggleKey]
                  return (
                    <div key={key} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #1f2937',
                    }}>
                      <div>
                        <div style={{ color: '#f9fafb', fontSize: 14, fontWeight: 500 }}>
                          {meta.label}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                          {meta.description}
                        </div>
                      </div>
                      {/* Toggle switch */}
                      <div
                        onClick={() => {
                          const updated: BriefingPrefs = {
                            ...prefs,
                            toggles: {
                              ...prefs.toggles,
                              [toggleKey]: !isOn,
                            },
                          }
                          setPrefs(updated)
                          savePrefs(updated)
                        }}
                        style={{
                          width: 44, height: 24,
                          borderRadius: 12,
                          background: isOn ? badgeColor : '#374151',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          flexShrink: 0,
                          marginLeft: 16,
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: 2,
                          left: isOn ? 22 : 2,
                          width: 20, height: 20,
                          borderRadius: '50%',
                          background: 'white',
                          transition: 'left 0.2s',
                        }} />
                      </div>
                    </div>
                  )
                })
              }

              {/* Reset to defaults */}
              <button
                onClick={() => {
                  const reset = resetPrefs(
                    currentUser.id,
                    currentUser.subRole ?? '',
                    currentUser.role,
                  )
                  setPrefs(reset)
                }}
                style={{
                  marginTop: 20,
                  width: '100%',
                  padding: '10px',
                  background: 'none',
                  border: '1px solid #374151',
                  borderRadius: 8,
                  color: '#6b7280',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Reset to defaults
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

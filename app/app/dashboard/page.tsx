'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Plus, Check } from 'lucide-react'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import type { UserProfile } from '@/context/RoleContext'
import CountdownTimer from '@/components/shared/CountdownTimer'
import AppDrawer from '@/components/shared/AppDrawer'
import { OVERNIGHT_REPORTS } from '@/lib/data/guestServices'
import { PROPERTIES } from '@/lib/data/properties'
import { PROPERTY_WEATHER } from '@/lib/data/weather'
import { JOBS } from '@/lib/data/staff'
import { sortJobsByAccessibility } from '@/lib/utils/pteUtils'

// ─── Cleaning Templates ───────────────────────────────────────────────────────

const CLEANING_TEMPLATES = [
  { id: 't1', name: 'Full Turnover Clean', estimatedMinutes: 90, tasks: ['Strip and remake all beds', 'Deep clean bathrooms', 'Mop all floors', 'Restock amenities', 'Check all appliances'] },
  { id: 't2', name: 'Mid-Stay Refresh', estimatedMinutes: 45, tasks: ['Replace towels and toiletries', 'Empty bins', 'Wipe surfaces', 'Vacuum high-traffic areas'] },
  { id: 't3', name: 'Post-Construction Clean', estimatedMinutes: 120, tasks: ['Dust all surfaces and vents', 'Wash windows inside', 'Deep clean kitchen', 'Clean all fixtures', 'Vacuum and mop all rooms'] },
  { id: 't4', name: 'Pre-Inspection Check', estimatedMinutes: 30, tasks: ['Walk-through all rooms', 'Check for damage', 'Verify inventory', 'Test all appliances', 'Photo documentation'] },
  { id: 't5', name: 'Seasonal Deep Clean', estimatedMinutes: 150, tasks: ['Clean behind appliances', 'Wash curtains', 'Clean inside all cupboards', 'Detail bathroom grouting', 'Exterior windows if accessible'] },
]

// ─── Seed data ────────────────────────────────────────────────────────────────

const USER_TO_STAFF: Record<string, string> = {
  'u3': 's1', // Maria → cleaning
  'u4': 's3', // Bjorn → maintenance
  'u5': 's2', // Fatima → guest services
}

interface ClockInRecord {
  staffId: string
  shiftId: string
  propertyId: string
  date: string
  clockInTime: string   // "09:05 AM"
  clockInTimestamp: number
  status: 'in_progress' | 'completed'
  clockOutTime?: string
}

// Simulated team clock status for operator view
const TEAM_CLOCK_STATUS = [
  { id: 'ms', name: 'Maria S.',  initials: 'MS', avatarBg: '#d97706', role: 'Cleaning',      property: 'Ocean View Apt', clockedIn: true,  clockInTime: '09:05 AM', shiftStart: '09:00', late: false },
  { id: 'bl', name: 'Bjorn L.', initials: 'BL', avatarBg: '#0ea5e9', role: 'Maintenance',   property: 'Sunset Villa',   clockedIn: false, clockInTime: '',          shiftStart: '09:00', late: true  },
  { id: 'fn', name: 'Fatima N.',initials: 'FN', avatarBg: '#ec4899', role: 'Guest Services', property: 'Remote',         clockedIn: true,  clockInTime: '08:55 AM', shiftStart: '09:00', late: false },
  { id: 'jl', name: 'Johan L.', initials: 'JL', avatarBg: '#6b7280', role: 'Cleaning',      property: 'Harbor Studio',  clockedIn: false, clockInTime: '',          shiftStart: '14:00', late: false },
]

const CLEANING_SHIFTS = [
  {
    id: 'cs1',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    city: 'Stavanger',
    startTime: '09:00',
    endTime: '12:00',
    type: 'Turnover Clean',
    tasks: [
      'Strip and replace all bed linens',
      'Clean and disinfect all bathrooms',
      'Vacuum and mop all floors',
      'Wipe kitchen surfaces and appliances',
      'Restock toiletries and consumables',
    ],
    accessType: 'Keypad',
    code: '4821',
    nextCheckin: '17:00',
    pteStatus: 'not_required' as const,
  },
  {
    id: 'cs2',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    city: 'Bergen',
    startTime: '13:00',
    endTime: '15:00',
    type: 'Checkout Clean',
    tasks: [
      'Strip and replace all bed linens',
      'Clean bathroom thoroughly',
      'Vacuum all floors',
    ],
    accessType: 'Key box',
    code: '9274',
    nextCheckin: '17:00',
    pteStatus: 'not_required' as const,
  },
]

const OTHER_TASKS_CLEANING = [
  { id: 'ot1', label: 'Deliver linen set — Harbor Studio · Before 13:00' },
  { id: 'ot2', label: 'Restock toiletry kits — Ocean View · After clean' },
]

const TODAY_CHECKINS = [
  {
    time: '15:00',
    propertyName: 'Sunset Villa',
    guest: 'Lars Eriksen',
    nights: 5,
    cleaner: 'Maria S.',
    readiness: 'ok' as const,
    readinessNote: '',
  },
  {
    time: '17:00',
    propertyName: 'Ocean View Apt',
    guest: 'Sophie Kristiansen',
    nights: 2,
    cleaner: 'Maria S.',
    readiness: 'risk' as const,
    readinessNote: 'Cleaning finishes at 17:00 (tight)',
  },
]

const OPERATOR_TASKS = [
  { id: 'op1', label: 'Create SOP: Guest Check-in v2' },
  { id: 'op2', label: 'Review compliance — Mountain Cabin' },
  { id: 'op3', label: 'Approve purchase: Linen set — NOK 3,200' },
]

const MEETINGS = [
  { id: 'm1', time: '10:00', title: 'Weekly Ops Standup', attendees: 3 },
  { id: 'm2', time: '14:00', title: 'Owner Onboarding — Kim Portfolio', attendees: 2 },
]

const GS_PENDING_PTE = [
  { id: 'pte1', property: 'Downtown Loft', staff: 'Bjorn Larsen', guest: 'Henrik Solberg', task: 'Fix toilet' },
]

const NEEDS_ACTION_ITEMS = [
  { id: 'na1', text: '⚠️ Noise complaint unassigned · Downtown Loft', action: 'Assign Now' },
  { id: 'na2', text: '⚠️ Bjorn L. 18 min late · not clocked in', action: 'Send Reminder' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function convertTo24h(timeStr: string): string {
  const [time, period] = timeStr.split(' ')
  const [hStr, mStr] = time.split(':')
  let h = parseInt(hStr, 10)
  const m = mStr ?? '00'
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${m}:00`
}

function shiftMinsFromNow(startTime: string): number {
  const today = new Date().toISOString().split('T')[0]
  const ms = new Date(`${today}T${startTime}:00`).getTime()
  return (ms - Date.now()) / 60000
}

function elapsedFromTimestamp(ts: number): string {
  const ms = Date.now() - ts
  if (ms < 0) return '0m'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const C = {
  bg:      '#0a0f1a',
  card:    '#111827',
  border:  '#1f2937',
  text:    '#f9fafb',
  muted:   '#6b7280',
  green:   '#16a34a',
  amber:   '#d97706',
  red:     '#dc2626',
  blue:    '#3b82f6',
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.08em',
      textTransform: 'uppercase', marginBottom: 10,
    }}>{label}</div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: '14px 16px', marginBottom: 12,
      ...style,
    }}>
      {children}
    </div>
  )
}

function ActionBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px', borderRadius: 6,
        background: 'transparent', border: `1px solid ${C.border}`,
        color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AppDashboard() {
  const { role, user, accent } = useRole()
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [clockIn, setClockIn] = useState<ClockInRecord | null>(null)
  const [elapsed, setElapsed] = useState('')
  const [taskChecks, setTaskChecks] = useState<Record<string, boolean>>({})
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})
  const [grantedPTE, setGrantedPTE] = useState<Record<string, boolean>>({})
  const [expandPTEPanel, setExpandPTEPanel] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [maintenanceReportDrawer, setMaintenanceReportDrawer] = useState(false)
  const [reportedIssues, setReportedIssues] = useState<{ id: string; property: string; issueType: string; urgency: string; description: string; reporter: string; time: string }[]>([])
  const [reportProperty, setReportProperty] = useState('')
  const [reportIssueType, setReportIssueType] = useState('Plumbing')
  const [reportUrgency, setReportUrgency] = useState<'Urgent' | 'Standard'>('Standard')
  const [reportDescription, setReportDescription] = useState('')
  const [addCleaningDrawer, setAddCleaningDrawer] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof CLEANING_TEMPLATES[0] | null>(null)
  const [newCleaningProperty, setNewCleaningProperty] = useState(PROPERTIES[0]?.id ?? 'p1')
  const [newCleaningDate, setNewCleaningDate] = useState(new Date().toISOString().split('T')[0])
  const [newCleaningNotes, setNewCleaningNotes] = useState('')
  const [addedCleanings, setAddedCleanings] = useState<{id:string, templateName:string, property:string, date:string}[]>([])

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('nestops_clockin')
    if (stored) {
      try {
        const ci = JSON.parse(stored) as ClockInRecord
        if (ci.date === today) setClockIn(ci)
      } catch { /* ignore */ }
    }
  }, [today])

  // Elapsed time poll
  useEffect(() => {
    if (!clockIn?.clockInTimestamp || clockIn.status !== 'in_progress') return
    const calc = () => setElapsed(elapsedFromTimestamp(clockIn.clockInTimestamp))
    calc()
    const interval = setInterval(calc, 60000)
    return () => clearInterval(interval)
  }, [clockIn])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const displayName = currentUser?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? 'there'

  const effectiveRole = currentUser?.role ?? role
  // Use currentUser as sole source of truth for subRole — never fall back to context user
  // which may hold a stale previous session's subRole
  const effectiveSubRole = currentUser?.subRole ?? ''
  const isStaff = effectiveRole === 'staff'
  const isOperator = effectiveRole === 'operator'
  const isCleaning = effectiveSubRole.includes('Cleaning')
  const isMaintenance = effectiveSubRole.includes('Maintenance')
  const isGuestServices = effectiveSubRole.includes('Guest')
  const isOwner = effectiveRole === 'owner'

  // Maintenance jobs for Bjorn
  const allMaintenanceJobs = JOBS.filter(j => j.type === 'maintenance')
  const sortedMaintenanceJobs = sortJobsByAccessibility(allMaintenanceJobs)
  const hasPendingPTE = sortedMaintenanceJobs.some(j => j.pteStatus === 'pending')
  const firstAutoGranted = sortedMaintenanceJobs.find(j => j.pteStatus === 'auto_granted')

  // Overnight
  const todayReport = OVERNIGHT_REPORTS.find(r => r.date === today) ?? OVERNIGHT_REPORTS[0]

  const handleClockIn = () => {
    if (!currentUser) return
    const now = new Date()
    const record: ClockInRecord = {
      staffId: USER_TO_STAFF[currentUser.id] ?? currentUser.id,
      shiftId: CLEANING_SHIFTS[0]?.id ?? 'sh-default',
      propertyId: CLEANING_SHIFTS[0]?.propertyId ?? 'p1',
      date: today,
      clockInTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      clockInTimestamp: now.getTime(),
      status: 'in_progress',
    }
    localStorage.setItem('nestops_clockin', JSON.stringify(record))
    setClockIn(record)
  }

  const handleClockOut = () => {
    if (!clockIn) return
    const updated: ClockInRecord = {
      ...clockIn,
      status: 'completed',
      clockOutTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    localStorage.setItem('nestops_clockin', JSON.stringify(updated))
    setClockIn(updated)
  }

  const toggleCode = (id: string) => setShowCodes(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleTask = (id: string) => setTaskChecks(prev => ({ ...prev, [id]: !prev[id] }))
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false

  // Shift time helpers for cleaning
  const firstShiftMins = shiftMinsFromNow(CLEANING_SHIFTS[0]?.startTime ?? '09:00')
  const secondShiftMins = shiftMinsFromNow(CLEANING_SHIFTS[1]?.startTime ?? '13:00')
  const canShowFirstCode = firstShiftMins <= 30
  const canShowSecondCode = secondShiftMins <= 30

  // Clock bar status
  const primaryShiftStart = CLEANING_SHIFTS[0]?.startTime ?? '09:00'
  const minsUntilShift = shiftMinsFromNow(primaryShiftStart)
  const isLate = minsUntilShift < -15 && clockIn?.status !== 'in_progress' && clockIn?.status !== 'completed'
  const isUpcoming = minsUntilShift > 0 && !clockIn
  const isClockedIn = clockIn?.status === 'in_progress'
  const isComplete = clockIn?.status === 'completed'
  const propertyName = PROPERTIES.find(p => p.id === CLEANING_SHIFTS[0]?.propertyId)?.name ?? 'Property'

  // used for unused import suppression
  void convertTo24h

  if (!mounted) return (
    <div style={{ padding: 24 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 80, borderRadius: 10, background: 'var(--bg-card)', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ maxWidth: 720, margin: '0 auto' }}
    >
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed', top: 16, right: 16, zIndex: 100,
            background: C.green, color: '#fff',
            padding: '10px 16px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          {toast}
        </motion.div>
      )}

      {/* Header greeting */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 2 }}>
          {greeting}, {displayName}
        </h1>
        <p style={{ fontSize: 13, color: C.muted }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── CLOCK STATUS BAR (staff only) ────────────────────────────────────── */}
      {isStaff && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            ...(isComplete
              ? { background: 'transparent', borderLeft: `4px solid #374151`, border: `1px solid ${C.border}` }
              : isClockedIn
                ? { background: 'rgba(22,163,74,0.08)', borderLeft: `4px solid ${C.green}` }
                : isLate
                  ? { background: 'rgba(220,38,38,0.08)', borderLeft: `4px solid ${C.red}` }
                  : { background: 'rgba(217,119,6,0.08)', borderLeft: `4px solid ${C.amber}` }),
          }}
        >
          {isComplete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>✓ SHIFT COMPLETE</span>
              <span style={{ fontSize: 13, color: C.muted }}>·</span>
              <span style={{ fontSize: 13, color: C.muted }}>Clocked out {clockIn?.clockOutTime}</span>
            </div>
          ) : isClockedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 8, color: C.green }}>●</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>ON SHIFT</span>
                  <span style={{ fontSize: 13, color: C.text }}>{propertyName}</span>
                  <span style={{ fontSize: 13, color: C.muted }}>{elapsed} elapsed</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Started {clockIn?.clockInTime}</div>
              </div>
              <button
                onClick={handleClockOut}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: '#374151', border: 'none', color: C.text, cursor: 'pointer',
                }}
              >Clock Out</button>
            </div>
          ) : isLate ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <motion.span
                    animate={prefersReducedMotion ? undefined : { opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ fontSize: 13, color: C.red }}
                  >⚠</motion.span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>LATE</span>
                  <span style={{ fontSize: 13, color: C.text }}>{propertyName}</span>
                  <span style={{ fontSize: 13, color: C.red }}>{Math.abs(Math.round(minsUntilShift))} min overdue</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Shift started {primaryShiftStart}</div>
              </div>
              <button
                onClick={handleClockIn}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: C.red, border: 'none', color: '#fff', cursor: 'pointer',
                }}
              >▶ Clock In Now</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 8, color: C.amber }}>○</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>UPCOMING</span>
                  <span style={{ fontSize: 13, color: C.text }}>{propertyName}</span>
                  {isUpcoming && (
                    <span style={{ fontSize: 13, color: C.muted }}>Starts in {Math.round(minsUntilShift)} min</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>Shift at {primaryShiftStart}</div>
              </div>
              <button
                onClick={handleClockIn}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: C.amber, border: 'none', color: '#fff', cursor: 'pointer',
                }}
              >▶ Clock In</button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── CLEANING STAFF ────────────────────────────────────────────────────── */}
      {isCleaning && (
        <>
          <SectionLabel label="Today's Schedule" />
          {CLEANING_SHIFTS.map((shift, idx) => {
            const isFirst = idx === 0
            const canSeeCode = isFirst ? canShowFirstCode : canShowSecondCode
            const weather = PROPERTY_WEATHER.find(w => w.propertyId === shift.propertyId)
            const completedCount = shift.tasks.filter((_, ti) => taskChecks[`${shift.id}-${ti}`]).length
            const property = PROPERTIES.find(p => p.id === shift.propertyId)
            return (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}
              >
                {/* Property photo */}
                {property?.imageUrl && (
                  <img
                    src={property.imageUrl}
                    alt={shift.propertyName}
                    style={{ width: '100%', height: 112, objectFit: 'cover', display: 'block' }}
                  />
                )}
                <div style={{ padding: '14px 16px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{shift.propertyName}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                      background: isFirst ? 'rgba(59,130,246,0.15)' : 'rgba(217,119,6,0.15)',
                      color: isFirst ? C.blue : C.amber,
                    }}>
                      {isFirst ? 'NEXT UP 🔵' : 'LATER ⏰'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>
                    {shift.startTime} – {shift.endTime} · {shift.type}
                  </div>

                  {/* Weather */}
                  {weather && (
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
                      {weather.icon} {weather.temperature}°C · {weather.location}
                      {weather.note ? ` · ${weather.note}` : ''}
                    </div>
                  )}

                  {/* Next checkin warning */}
                  {(() => {
                    const [ch, cm] = shift.nextCheckin.split(':').map(Number)
                    const [sh, sm] = shift.endTime.split(':').map(Number)
                    const gapMins = (ch * 60 + cm) - (sh * 60 + sm)
                    return gapMins < 120 ? (
                      <div style={{ fontSize: 12, color: C.amber, marginBottom: 8 }}>
                        ⚠️ Tight: next check-in {shift.nextCheckin} ({Math.round(gapMins / 60)}h gap)
                      </div>
                    ) : null
                  })()}

                  {/* Access */}
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
                    Access: {shift.accessType}
                    {canSeeCode ? (
                      <button
                        onClick={() => toggleCode(shift.id)}
                        style={{ marginLeft: 8, background: 'none', border: 'none', color: C.blue, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                      >
                        {showCodes[shift.id] ? `Code: ${shift.code}` : 'Show Code 👁'}
                      </button>
                    ) : (
                      <span style={{ marginLeft: 8, fontSize: 12, color: C.muted, opacity: 0.6 }}>
                        🔒 Code available at {shift.startTime}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ background: C.border, borderRadius: 4, height: 4, marginBottom: 8 }}>
                    <div style={{
                      background: C.green, height: 4, borderRadius: 4,
                      width: `${shift.tasks.length > 0 ? (completedCount / shift.tasks.length) * 100 : 0}%`,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
                    {completedCount} of {shift.tasks.length} tasks complete
                  </div>

                  {/* Tasks */}
                  {(isFirst ? shift.tasks : shift.tasks.slice(0, 0)).map((task, ti) => (
                    <div
                      key={ti}
                      onClick={() => toggleTask(`${shift.id}-${ti}`)}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', cursor: 'pointer', borderBottom: ti < 2 ? `1px solid ${C.border}` : 'none' }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                        border: `2px solid ${taskChecks[`${shift.id}-${ti}`] ? C.green : '#374151'}`,
                        background: taskChecks[`${shift.id}-${ti}`] ? C.green : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {taskChecks[`${shift.id}-${ti}`] && <span style={{ fontSize: 8, color: '#fff' }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, color: taskChecks[`${shift.id}-${ti}`] ? C.muted : C.text, textDecoration: taskChecks[`${shift.id}-${ti}`] ? 'line-through' : 'none' }}>
                        {task}
                      </span>
                    </div>
                  ))}
                  {!isFirst && (
                    <div style={{ fontSize: 12, color: C.muted }}>
                      {shift.tasks.length} tasks
                    </div>
                  )}

                  {/* CTA */}
                  <button style={{
                    marginTop: 12, width: '100%', padding: '9px', borderRadius: 8,
                    background: isFirst ? '#7c3aed' : '#1f2937',
                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>
                    ▶ {isFirst ? 'Start This Clean' : 'View Schedule'}
                  </button>
                </div>
              </motion.div>
            )
          })}

          {/* Report Maintenance Issue CTA */}
          <div
            onClick={() => setMaintenanceReportDrawer(true)}
            style={{
              background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10,
              padding: '14px 16px', marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
              🔧
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>Report Maintenance Issue</div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {reportedIssues.length > 0
                  ? `${reportedIssues.length} issue${reportedIssues.length > 1 ? 's' : ''} reported today — tap to add another`
                  : 'Spotted something broken? Alert the maintenance team instantly.'}
              </div>
            </div>
            <span style={{ fontSize: 18, color: C.muted }}>›</span>
          </div>

          {/* Add Cleaning CTA */}
          <button
            onClick={() => setAddCleaningDrawer(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '14px 16px', borderRadius: 10,
              border: `1px dashed ${accent}50`, background: `${accent}08`,
              cursor: 'pointer', marginBottom: 16, textAlign: 'left',
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 7, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={16} style={{ color: accent }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: accent }}>Add Cleaning</div>
              <div style={{ fontSize: 11, color: C.muted }}>
                Create a task from a template{addedCleanings.length > 0 ? ` · ${addedCleanings.length} added today` : ''}
              </div>
            </div>
          </button>

          {/* Other tasks */}
          <SectionLabel label="Other Tasks Today" />
          <Card>
            {OTHER_TASKS_CLEANING.map((task, i) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer',
                  borderBottom: i < OTHER_TASKS_CLEANING.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${taskChecks[task.id] ? C.green : '#374151'}`,
                  background: taskChecks[task.id] ? C.green : 'transparent',
                }} />
                <span style={{ fontSize: 13, color: taskChecks[task.id] ? C.muted : C.text, textDecoration: taskChecks[task.id] ? 'line-through' : 'none' }}>
                  {task.label}
                </span>
              </div>
            ))}
          </Card>

          {/* This week */}
          <SectionLabel label="This Week" />
          <Card>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { day: 'Mon', state: 'done' },
                { day: 'Tue', state: 'done' },
                { day: 'Wed', state: 'today' },
                { day: 'Thu', state: 'upcoming' },
                { day: 'Fri', state: 'upcoming' },
              ].map(d => (
                <div key={d.day} style={{
                  flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8,
                  background: d.state === 'today' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${d.state === 'today' ? 'rgba(124,58,237,0.35)' : C.border}`,
                  cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{d.day}</div>
                  <div style={{ fontSize: 12 }}>{d.state === 'done' ? '✓' : d.state === 'today' ? '●' : '○'}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Add Cleaning Drawer */}
          <AppDrawer
            open={addCleaningDrawer}
            onClose={() => { setAddCleaningDrawer(false); setSelectedTemplate(null); setNewCleaningNotes('') }}
            title={selectedTemplate ? selectedTemplate.name : 'Add Cleaning'}
            subtitle={selectedTemplate ? `~${selectedTemplate.estimatedMinutes} min · Select property and date` : 'Choose a cleaning template'}
            footer={selectedTemplate ? (
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button onClick={() => setSelectedTemplate(null)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 14, cursor: 'pointer' }}>Back</button>
                <button
                  onClick={() => {
                    const prop = PROPERTIES.find(p => p.id === newCleaningProperty)
                    setAddedCleanings(prev => [...prev, {
                      id: `cl-${Date.now()}`,
                      templateName: selectedTemplate.name,
                      property: prop?.name ?? newCleaningProperty,
                      date: newCleaningDate,
                    }])
                    setAddCleaningDrawer(false)
                    setSelectedTemplate(null)
                    setNewCleaningNotes('')
                    showToast(`Cleaning scheduled — ${selectedTemplate.name}`)
                  }}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Create Cleaning
                </button>
              </div>
            ) : undefined}
          >
            {!selectedTemplate ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ fontSize: 14, color: C.muted, margin: '0 0 6px' }}>Select a cleaning template to get started:</p>
                {CLEANING_TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>🧹</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{tmpl.name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>~{tmpl.estimatedMinutes} min · {tmpl.tasks.length} tasks</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6, display: 'block' }}>Property</label>
                  <select
                    value={newCleaningProperty}
                    onChange={e => setNewCleaningProperty(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#1f2937', color: C.text, fontSize: 14, outline: 'none' }}
                  >
                    {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6, display: 'block' }}>Scheduled Date</label>
                  <input
                    type="date"
                    value={newCleaningDate}
                    onChange={e => setNewCleaningDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#1f2937', color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6, display: 'block' }}>Notes (optional)</label>
                  <textarea
                    value={newCleaningNotes}
                    onChange={e => setNewCleaningNotes(e.target.value)}
                    placeholder="Any special instructions…"
                    style={{ width: '100%', minHeight: 72, padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#1f2937', color: C.text, fontSize: 13, resize: 'vertical', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 8, display: 'block' }}>Included Tasks</label>
                  <div style={{ background: '#1f2937', borderRadius: 8, border: `1px solid ${C.border}`, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedTemplate.tasks.map((task, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${C.border}`, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: C.muted }}>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </AppDrawer>

          {/* Maintenance Report Drawer */}
          <AppDrawer
            open={maintenanceReportDrawer}
            onClose={() => setMaintenanceReportDrawer(false)}
            title="Report Maintenance Issue"
            subtitle="Alert maintenance team to an issue you found on-site"
            footer={
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button onClick={() => setMaintenanceReportDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <button
                  onClick={() => {
                    const newReport = {
                      id: `fr-${Date.now()}`,
                      property: reportProperty || (PROPERTIES[0]?.name ?? 'Unknown'),
                      issueType: reportIssueType,
                      urgency: reportUrgency,
                      description: reportDescription,
                      reporter: currentUser?.name ?? 'Cleaner',
                      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    }
                    const updated = [...reportedIssues, newReport]
                    setReportedIssues(updated)
                    // Share with operator via localStorage
                    try { localStorage.setItem('nestops_field_reports', JSON.stringify(updated)) } catch {}
                    setMaintenanceReportDrawer(false)
                    setReportDescription('')
                    if (reportUrgency === 'Urgent') {
                      showToast('🚨 Urgent issue reported — maintenance alerted')
                    } else {
                      showToast('Maintenance issue reported — team notified')
                    }
                  }}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                >
                  Submit Report
                </button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6, display: 'block' }}>Property</label>
                <select
                  value={reportProperty || ''}
                  onChange={e => setReportProperty(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#1f2937', color: C.text, fontSize: 14, outline: 'none' }}
                >
                  {PROPERTIES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6, display: 'block' }}>Issue Type</label>
                <select
                  value={reportIssueType}
                  onChange={e => setReportIssueType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#1f2937', color: C.text, fontSize: 14, outline: 'none' }}
                >
                  {['Plumbing', 'Electrical', 'Appliance', 'HVAC', 'Structural', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6, display: 'block' }}>Urgency</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['Standard', 'Urgent'] as const).map(u => (
                    <button
                      key={u}
                      onClick={() => setReportUrgency(u)}
                      style={{
                        flex: 1, padding: '9px', borderRadius: 8, border: `1px solid ${reportUrgency === u ? (u === 'Urgent' ? '#ef4444' : '#3b82f6') : C.border}`,
                        background: reportUrgency === u ? (u === 'Urgent' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)') : 'transparent',
                        color: reportUrgency === u ? (u === 'Urgent' ? '#ef4444' : '#3b82f6') : C.muted,
                        fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      }}
                    >
                      {u === 'Urgent' ? '🚨 Urgent' : '⏰ Standard'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginBottom: 6, display: 'block' }}>Description</label>
                <textarea
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                  placeholder="Describe what you found…"
                  style={{ width: '100%', minHeight: 90, padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#1f2937', color: C.text, fontSize: 13, resize: 'vertical', outline: 'none' }}
                />
              </div>
            </div>
          </AppDrawer>
        </>
      )}

      {/* ── MAINTENANCE STAFF ─────────────────────────────────────────────────── */}
      {isMaintenance && (
        <>
          <SectionLabel label="Today's Jobs" />
          {sortedMaintenanceJobs.map((job, idx) => {
            const canShowCode = job.pteStatus === 'granted' || job.pteStatus === 'auto_granted' || job.pteStatus === 'not_required'
            const isPending = job.pteStatus === 'pending'
            const isAutoGranted = job.pteStatus === 'auto_granted'
            const showBanner = isAutoGranted && hasPendingPTE
            const showHint = isPending && firstAutoGranted !== undefined
            const priorityEmoji = job.priority === 'urgent' ? '🔴' : job.priority === 'high' ? '🟡' : '⚪'
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: C.card,
                  border: `1px solid ${isAutoGranted ? 'rgba(22,163,74,0.4)' : C.border}`,
                  borderRadius: 10, overflow: 'hidden', marginBottom: 12,
                }}
              >
                {showBanner && (
                  <div style={{
                    background: C.green, padding: '7px 16px',
                    fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    🟢 GO HERE FIRST — PROPERTY VACANT
                  </div>
                )}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span>{priorityEmoji}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      background: job.priority === 'urgent' ? 'rgba(220,38,38,0.15)' : job.priority === 'high' ? 'rgba(217,119,6,0.15)' : 'rgba(107,114,128,0.15)',
                      color: job.priority === 'urgent' ? C.red : job.priority === 'high' ? C.amber : C.muted,
                      textTransform: 'uppercase',
                    }}>{job.priority}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{job.title}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>{job.propertyName}</div>

                  {isAutoGranted && (
                    <div style={{ fontSize: 12, color: C.green, marginBottom: 8 }}>
                      ✓ Property empty — access auto-granted · No guest · Enter any time
                    </div>
                  )}
                  {isPending && (
                    <div style={{ fontSize: 12, color: C.amber, marginBottom: 4 }}>
                      PTE: ⏳ Pending · Fatima contacting guest
                    </div>
                  )}
                  {showHint && (
                    <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 8 }}>
                      💡 Do the {firstAutoGranted!.propertyName} job first while waiting
                    </div>
                  )}

                  {/* Access */}
                  <div style={{ marginBottom: 10 }}>
                    {canShowCode ? (
                      <button
                        onClick={() => toggleCode(job.id)}
                        style={{
                          padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                          background: 'rgba(59,130,246,0.12)', border: `1px solid rgba(59,130,246,0.3)`,
                          color: C.blue, cursor: 'pointer',
                        }}
                      >
                        {showCodes[job.id] ? `Code: ${String(1000 + parseInt(job.id.replace(/\D/g, '') || '0', 10) % 9000)}` : 'Show Code 👁'}
                      </button>
                    ) : (
                      <span style={{
                        display: 'inline-block', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                        background: 'rgba(220,38,38,0.1)', border: `1px solid rgba(220,38,38,0.25)`,
                        color: C.red,
                      }}>
                        🔒 Locked — awaiting PTE
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {canShowCode && <ActionBtn label="▶ Start Job" />}
                    <ActionBtn label="📍 Directions" />
                    {isPending && <ActionBtn label="Contact Fatima" />}
                    {isPending && <ActionBtn label="View PTE Status" />}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </>
      )}

      {/* ── GUEST SERVICES ────────────────────────────────────────────────────── */}
      {isGuestServices && (
        <>
          {/* Check-ins today */}
          <SectionLabel label="Check-ins Today" />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>CHECK-INS TODAY</span>
              <span style={{ fontSize: 12, color: C.muted }}>{TODAY_CHECKINS.length} arrivals</span>
            </div>
            {TODAY_CHECKINS.map((ci, i) => (
              <div key={i} style={{ paddingBottom: i < TODAY_CHECKINS.length - 1 ? 12 : 0, marginBottom: i < TODAY_CHECKINS.length - 1 ? 12 : 0, borderBottom: i < TODAY_CHECKINS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{ci.time} · {ci.propertyName}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                    background: ci.readiness === 'ok' ? 'rgba(22,163,74,0.15)' : 'rgba(217,119,6,0.15)',
                    color: ci.readiness === 'ok' ? C.green : C.amber,
                  }}>
                    {ci.readiness === 'ok' ? '✓ Ready' : '⚠️ At risk'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: ci.readinessNote ? 4 : 8 }}>
                  {ci.guest} · {ci.nights} nights · Cleaning: {ci.cleaner}
                </div>
                {ci.readinessNote && (
                  <div style={{ fontSize: 12, color: C.amber, marginBottom: 8 }}>⚠️ {ci.readinessNote}</div>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ci.readiness === 'ok' ? (
                    <ActionBtn label="Send Welcome" />
                  ) : (
                    <>
                      <ActionBtn label="Monitor" />
                      <ActionBtn label={`Contact ${ci.cleaner.split(' ')[0]}`} />
                    </>
                  )}
                  <ActionBtn label="View Property" />
                </div>
              </div>
            ))}
          </Card>

          {/* Overnight issues */}
          <SectionLabel label="Overnight Issues" />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🌙 OVERNIGHT</span>
              <span style={{ fontSize: 12, color: C.muted }}>{todayReport?.issues.length ?? 0} reported</span>
            </div>
            {(todayReport?.issues ?? []).map((issue, i) => (
              <div key={issue.id} style={{ paddingBottom: i < (todayReport?.issues.length ?? 0) - 1 ? 12 : 0, marginBottom: i < (todayReport?.issues.length ?? 0) - 1 ? 12 : 0, borderBottom: i < (todayReport?.issues.length ?? 0) - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{issue.time}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{issue.title}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{issue.property}</div>
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  {issue.assignedTo
                    ? <span style={{ color: C.green }}>Assigned to {issue.assignedTo} ✓</span>
                    : <span style={{ color: C.red, fontWeight: 700 }}>⚠️ UNASSIGNED</span>
                  }
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {issue.assignedTo ? (
                    <>
                      <ActionBtn label="View Task" />
                      <ActionBtn label={`Contact ${issue.assignedTo.split(' ')[0]}`} />
                      <ActionBtn label="Update Guest" />
                    </>
                  ) : (
                    <>
                      <ActionBtn label="Assign Now" />
                      <ActionBtn label="Log Update" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </Card>

          {/* Active issues summary */}
          <SectionLabel label="Active Issues" />
          <Card>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: C.red }}>🔴 2 urgent</span>
              <span style={{ fontSize: 13, color: C.amber }}>🟡 1 open</span>
              <span style={{ fontSize: 13, color: C.muted }}>⚪ 0 resolved today</span>
            </div>
            <div style={{ paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>Gym access not available</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Downtown Loft · Camilla D. · Yesterday</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <ActionBtn label="Create Task" />
                <ActionBtn label="Log Update" />
                <ActionBtn label="Close" />
              </div>
            </div>
          </Card>

          {/* PTE Requests */}
          {GS_PENDING_PTE.length > 0 && (
            <>
              <SectionLabel label="PTE Requests" />
              {GS_PENDING_PTE.map(pte => (
                <Card key={pte.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>⏳ PTE NEEDED</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>{pte.property} · {pte.staff} → {pte.task}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Guest {pte.guest} in property</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: expandPTEPanel === pte.id ? 12 : 0 }}>
                    <ActionBtn label="Contact Guest" />
                    <button
                      onClick={() => setExpandPTEPanel(p => p === pte.id ? null : pte.id)}
                      style={{
                        padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                        background: C.green, border: 'none', color: '#fff', cursor: 'pointer',
                      }}
                    >Grant PTE</button>
                    <ActionBtn label="Deny" />
                    <ActionBtn label="Reschedule" />
                  </div>
                  {expandPTEPanel === pte.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ overflow: 'hidden', borderTop: `1px solid ${C.border}`, paddingTop: 12 }}
                    >
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
                        <strong style={{ color: C.text }}>Property:</strong> {pte.property} &nbsp;
                        <strong style={{ color: C.text }}>Staff:</strong> {pte.staff} &nbsp;
                        <strong style={{ color: C.text }}>Guest:</strong> {pte.guest}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>VALID FROM</label>
                          <input defaultValue="Now" style={{ width: '100%', padding: '6px 10px', background: '#1f2937', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 4 }}>VALID UNTIL</label>
                          <input defaultValue="14:00 checkout" style={{ width: '100%', padding: '6px 10px', background: '#1f2937', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 13, boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => {
                            setGrantedPTE(p => ({ ...p, [pte.id]: true }))
                            setExpandPTEPanel(null)
                            showToast('PTE granted — Bjorn notified')
                          }}
                          style={{
                            padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700,
                            background: C.green, border: 'none', color: '#fff', cursor: 'pointer',
                          }}
                        >✓ Confirm Grant</button>
                        <ActionBtn label="Cancel" onClick={() => setExpandPTEPanel(null)} />
                      </div>
                    </motion.div>
                  )}
                  {grantedPTE[pte.id] && (
                    <div style={{ marginTop: 6, fontSize: 12, color: C.green, fontWeight: 600 }}>✓ PTE granted</div>
                  )}
                </Card>
              ))}
            </>
          )}

          {/* My tasks */}
          <SectionLabel label="My Tasks Today" />
          <Card>
            {OPERATOR_TASKS.map((task, i) => (
              <div key={task.id} onClick={() => toggleTask(task.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', cursor: 'pointer', borderBottom: i < OPERATOR_TASKS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, border: `2px solid ${taskChecks[task.id] ? C.green : '#374151'}`, background: taskChecks[task.id] ? C.green : 'transparent' }} />
                <span style={{ fontSize: 13, color: taskChecks[task.id] ? C.muted : C.text }}>{task.label}</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* ── OPERATOR ──────────────────────────────────────────────────────────── */}
      {isOperator && (
        <>
          {/* Team status */}
          <SectionLabel label="Team Today" />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>TEAM TODAY</span>
              <span style={{ fontSize: 12, color: C.muted }}>{TEAM_CLOCK_STATUS.filter(m => m.clockedIn).length} on shift</span>
            </div>
            {TEAM_CLOCK_STATUS.map((member, i) => {
              const now = new Date()
              const [sh, sm] = member.shiftStart.split(':').map(Number)
              const shiftMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sh, sm).getTime()
              const minsLate = !member.clockedIn ? Math.round((Date.now() - shiftMs) / 60000) : 0
              const isActuallyLate = member.late && minsLate > 0
              return (
                <div key={member.id} style={{
                  display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '9px 10px',
                  borderRadius: 8, marginBottom: i < TEAM_CLOCK_STATUS.length - 1 ? 6 : 0,
                  background: isActuallyLate ? 'rgba(217,119,6,0.08)' : 'transparent',
                }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: member.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {member.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text, minWidth: 60 }}>{member.name}</span>
                      {member.clockedIn
                        ? <span style={{ fontSize: 11, color: C.green }}>● Clocked in {member.clockInTime}</span>
                        : isActuallyLate
                          ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <motion.span animate={prefersReducedMotion ? undefined : { opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ fontSize: 11, color: C.amber }}>⚠️</motion.span>
                              <span style={{ fontSize: 11, color: C.amber }}>{minsLate} min late</span>
                            </span>
                          )
                          : <span style={{ fontSize: 11, color: C.muted }}>○ Shift starts {member.shiftStart}</span>
                      }
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>{member.role} · {member.property}</div>
                  </div>
                  {isActuallyLate && <ActionBtn label="Remind" />}
                </div>
              )
            })}
          </Card>

          {/* Overnight incidents */}
          <SectionLabel label="Last Night" />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>🌙 LAST NIGHT</span>
              <span style={{ fontSize: 12, color: C.muted }}>{todayReport?.issues.length ?? 0} incidents</span>
            </div>
            {(todayReport?.issues ?? []).map((issue, i) => (
              <div key={issue.id} style={{ paddingBottom: i < (todayReport?.issues.length ?? 0) - 1 ? 10 : 0, marginBottom: i < (todayReport?.issues.length ?? 0) - 1 ? 10 : 0, borderBottom: i < (todayReport?.issues.length ?? 0) - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>{issue.time}</span>
                  <span style={{ fontSize: 13, color: C.text }}>{issue.title} · {issue.property}</span>
                  <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    {issue.assignedTo
                      ? <span style={{ fontSize: 11, color: C.green }}>Assigned ✓</span>
                      : <ActionBtn label="Assign Now" />
                    }
                  </div>
                </div>
              </div>
            ))}
          </Card>

          {/* Check-ins */}
          <SectionLabel label="Today's Check-ins" />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>CHECK-INS TODAY</span>
              <span style={{ fontSize: 12, color: C.muted }}>{TODAY_CHECKINS.length} arrivals</span>
            </div>
            {TODAY_CHECKINS.map((ci, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < TODAY_CHECKINS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div>
                  <span style={{ fontSize: 13, color: C.text }}>{ci.time} · {ci.propertyName}</span>
                  {ci.readinessNote && <div style={{ fontSize: 11, color: C.amber }}>{ci.readinessNote}</div>}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                  background: ci.readiness === 'ok' ? 'rgba(22,163,74,0.15)' : 'rgba(217,119,6,0.15)',
                  color: ci.readiness === 'ok' ? C.green : C.amber,
                }}>
                  {ci.readiness === 'ok' ? '✓ Ready' : '⚠️ At risk'}
                </span>
              </div>
            ))}
          </Card>

          {/* Needs action */}
          <SectionLabel label="Needs Action" />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>NEEDS ACTION</span>
              <span style={{ fontSize: 12, color: C.muted }}>{NEEDS_ACTION_ITEMS.length} items</span>
            </div>
            {NEEDS_ACTION_ITEMS.map((item, i) => (
              <div key={item.id} style={i < NEEDS_ACTION_ITEMS.length - 1 ? { paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${C.border}` } : {}}>
                <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>{item.text}</div>
                <ActionBtn label={item.action} />
              </div>
            ))}
          </Card>

          {/* My tasks */}
          <SectionLabel label="My Tasks Today" />
          <Card>
            {OPERATOR_TASKS.map((task, i) => (
              <div key={task.id} onClick={() => toggleTask(task.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', cursor: 'pointer', borderBottom: i < OPERATOR_TASKS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, border: `2px solid ${taskChecks[task.id] ? C.green : '#374151'}`, background: taskChecks[task.id] ? C.green : 'transparent' }} />
                <span style={{ fontSize: 13, color: taskChecks[task.id] ? C.muted : C.text }}>{task.label}</span>
              </div>
            ))}
          </Card>

          {/* Meetings */}
          <SectionLabel label="My Meetings Today" />
          <Card>
            {MEETINGS.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < MEETINGS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.muted, flexShrink: 0 }}>{m.time}</span>
                <span style={{ fontSize: 13, color: C.text }}>{m.title}</span>
                <span style={{ fontSize: 11, color: C.muted, marginLeft: 'auto' }}>{m.attendees} attendees</span>
              </div>
            ))}
          </Card>

          {/* Countdown */}
          <SectionLabel label="First Check-in Countdown" />
          <Card style={{ textAlign: 'center', padding: '20px 16px' }}>
            <CountdownTimer
              targetTime={`${today}T15:00:00`}
              label="FIRST CHECK-IN"
              context="Lars Eriksen · Sunset Villa · 15:00"
            />
          </Card>
        </>
      )}

      {/* ── OWNER ─────────────────────────────────────────────────────────────── */}
      {isOwner && (
        <>
          <SectionLabel label="Your Portfolio" />
          <Card>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Properties', value: '3', color: C.blue },
                { label: 'Active Issues', value: '1', color: C.amber },
                { label: 'Avg Rating', value: '4.8 ★', color: C.green },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, minWidth: 80, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
          <SectionLabel label="Your Properties" />
          {PROPERTIES.filter(p => p.status === 'live').map((prop, idx) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{prop.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{prop.city} · {prop.beds}BR / {prop.baths}BA</div>
                  </div>
                  <Link href="/app/properties" style={{ fontSize: 12, color: C.blue, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
                    View <ChevronRight size={12} />
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Plus, Check, Building2, Users, Ticket, Package, Sparkles, ListTodo, Clock, CreditCard, Moon, AlertTriangle, Circle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import type { Role, AccessTier, UserProfile } from '@/context/RoleContext'
import { useAlerts } from '@/context/AlertsContext'
import CountdownTimer from '@/components/shared/CountdownTimer'
import AppDrawer from '@/components/shared/AppDrawer'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OVERNIGHT_REPORTS } from '@/lib/data/guestServices'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { PROPERTY_WEATHER } from '@/lib/data/weather'
import { JOBS } from '@/lib/data/staff'
import { REQUESTS } from '@/lib/data/requests'
import { APPROVALS } from '@/lib/data/approvals'
import { COMPLIANCE_DOCS } from '@/lib/data/compliance'
import { sortJobsByAccessibility } from '@/lib/utils/pteUtils'
import { FEED_ITEMS, filterFeed, type FeedTab } from '@/lib/data/activityFeed'

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
  'u3': 's5', // Maria → Maria Solberg (cleaner)
  'u4': 's3', // Bjorn Larsen (maintenance)
  'u5': 's4', // Fatima → Fatima Ndiaye (guest services)
  'u7': 's2', // Anna → Anna Kowalski (inspector)
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
  { id: 'na1', text: 'Noise complaint unassigned · Downtown Loft', action: 'Assign Now',     urgency: 'urgent' as const },
  { id: 'na2', text: 'Bjorn L. 18 min late · not clocked in',      action: 'Send Reminder', urgency: 'high'   as const },
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

function ActionBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)]"
    >
      {label}
    </button>
  )
}

// ─── Demo persona switcher data ──────────────────────────────────────────────

const DEMO_PERSONAS = [
  { userId: 'pk', initials: 'PK', name: 'Peter K.',   role: 'operator' as Role,                                                                                                                    avatarBg: '#14b8a6', label: 'Operator' },
  { userId: 'fn', initials: 'FN', name: 'Fatima N.',  role: 'operator' as Role, accessTier: 'guest-services' as AccessTier, subRole: 'Guest Services Agent',                                       avatarBg: '#ec4899', label: 'GS Agent' },
  { userId: 'cm', initials: 'CM', name: 'Carlos M.',  role: 'operator' as Role, accessTier: 'guest-services' as AccessTier, subRole: 'GS Supervisor',                                              avatarBg: '#8b5cf6', label: 'GS Supervisor' },
  { userId: 'ms', initials: 'MS', name: 'Maria S.',   role: 'staff'    as Role,                                              subRole: 'Cleaner',             jobRole: 'cleaner'     as UserProfile['jobRole'], avatarBg: '#d97706', label: 'Cleaner' },
  { userId: 'bl', initials: 'BL', name: 'Bjorn L.',   role: 'staff'    as Role,                                              subRole: 'Maintenance',         jobRole: 'maintenance' as UserProfile['jobRole'], avatarBg: '#378ADD', label: 'Maintenance' },
  { userId: 'ak', initials: 'AK', name: 'Anna K.',    role: 'staff'    as Role,                                              subRole: 'Cleaning Supervisor', jobRole: 'supervisor'  as UserProfile['jobRole'], avatarBg: '#06b6d4', label: 'Supervisor' },
  { userId: 'sj', initials: 'SJ', name: 'Sarah J.',   role: 'owner'    as Role,                                                                                                                    avatarBg: '#7F77DD', label: 'Owner' },
  { userId: 'mc', initials: 'MC', name: 'Michael C.', role: 'owner'    as Role,                                                                                                                    avatarBg: '#15d492', label: 'Owner' },
]
const PERSONA_ID_MAP: Record<string, string> = { pk: 'u1', ms: 'u3', bl: 'u4', fn: 'u5', ak: 'u7', cm: 'u8', sj: 'u2', mc: 'u6' }

// ─── Main component ───────────────────────────────────────────────────────────

export default function AppDashboard() {
  const { role, user, accent, setUser } = useRole()
  const { getAlertsForRole, dismissAlert } = useAlerts()
  const router = useRouter()
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
  const [personaSwitcherOpen, setPersonaSwitcherOpen] = useState(false)
  const [feedTab2, setFeedTab2] = useState<FeedTab>('all')
  const [approvalStatuses, setApprovalStatuses] = useState<Record<string, 'pending' | 'card' | 'invoice' | 'followup'>>(
    Object.fromEntries(APPROVALS.map(a => [a.id, 'pending']))
  )
  const [followUpSent, setFollowUpSent] = useState<Record<string, boolean>>({})

  const handleApprove = (id: string, mode: 'card' | 'invoice') => {
    setApprovalStatuses(prev => ({ ...prev, [id]: mode }))
    showToast(mode === 'card' ? '✓ Payment charged to card on file' : '✓ Added to next owner statement')
  }
  const handleFollowUp = (id: string) => {
    setFollowUpSent(prev => ({ ...prev, [id]: true }))
    showToast('AI escalation email drafted — check your drafts')
  }

  const handleSwitchPersona = (p: typeof DEMO_PERSONAS[number]) => {
    setPersonaSwitcherOpen(false)
    const profile: UserProfile = {
      id: PERSONA_ID_MAP[p.userId] ?? p.userId,
      name: p.name,
      role: p.role,
      ...('accessTier' in p && p.accessTier ? { accessTier: p.accessTier } : {}),
      subRole: p.subRole,
      ...('jobRole' in p && p.jobRole ? { jobRole: p.jobRole } : {}),
      avatarInitials: p.initials,
      avatarColor: p.avatarBg,
    }
    localStorage.setItem('afterstay_user', JSON.stringify(profile))
    setUser(profile)
    if (p.role === 'operator' && !p.accessTier) router.push('/briefing')
    else if (p.role === 'owner') router.push('/owner')
    else router.push('/app/dashboard')
  }

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const stored = localStorage.getItem('afterstay_user')
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('afterstay_clockin')
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
  const isCleaning = effectiveSubRole.includes('Cleaning') || effectiveSubRole.includes('Cleaner')
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
    localStorage.setItem('afterstay_clockin', JSON.stringify(record))
    setClockIn(record)
  }

  const handleClockOut = () => {
    if (!clockIn) return
    const updated: ClockInRecord = {
      ...clockIn,
      status: 'completed',
      clockOutTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    localStorage.setItem('afterstay_clockin', JSON.stringify(updated))
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
    <div className="p-6">
      {[1,2,3].map(i => (
        <div key={i} className="h-20 rounded-xl bg-[var(--bg-card)] mb-3 animate-pulse" />
      ))}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mx-auto"
      style={{ maxWidth: isOperator ? 1100 : 720 }}
    >
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-[100] bg-[var(--status-success)] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
        >
          {toast}
        </motion.div>
      )}

      {/* Header greeting */}
      <div className="mb-5">
        <h1 className="text-2xl heading text-[var(--text-primary)] mb-0.5">
          {greeting},{' '}
          <span className="relative inline-block">
            <button
              onClick={() => setPersonaSwitcherOpen(v => !v)}
              className="bg-transparent border-none cursor-pointer font-[inherit] text-[var(--accent)] font-[inherit] p-0 transition-[border-color] duration-150 border-b-2 border-dashed border-b-[var(--accent-border)]"
            >
              {displayName} ▾
            </button>
            {personaSwitcherOpen && (
              <>
                <div className="fixed inset-0 z-[199]" onClick={() => setPersonaSwitcherOpen(false)} />
                <div className="absolute top-[calc(100%+8px)] left-0 z-[200] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2.5 min-w-[220px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <div className="label-upper mb-2">Switch Persona</div>
                  <div className="h-px bg-[var(--border)] mb-1.5" />
                  {DEMO_PERSONAS.map(p => {
                    const isActive = currentUser?.id === PERSONA_ID_MAP[p.userId]
                    return (
                      <button
                        key={p.userId}
                        onClick={() => handleSwitchPersona(p)}
                        className={cn(
                          "flex items-center gap-2.5 w-full py-1.5 px-2 rounded-lg cursor-pointer mb-0.5 text-left font-[inherit] transition-colors duration-100 border",
                          isActive
                            ? "bg-[var(--accent-bg)] border-[var(--accent-border)]"
                            : "bg-transparent border-transparent"
                        )}
                      >
                        <div
                          className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-[9px] font-semibold text-white"
                          style={{ background: p.avatarBg }}
                        >
                          {p.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[var(--text-primary)] leading-tight">{p.name}</div>
                          <div className="text-xs text-[var(--text-muted)] leading-tight">{p.subRole ?? p.label}</div>
                        </div>
                        {isActive && <span className="text-xs font-semibold text-[var(--accent)]">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </span>
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Urgent alerts banner */}
      {isStaff && getAlertsForRole('cleaner').filter(a => a.type === 'urgent' && !a.dismissed).map(a => (
        <div key={a.id} className="flex items-start gap-2.5 px-3.5 py-2.5 mb-2.5 rounded-lg bg-[var(--status-red-bg)] border border-[rgba(239,68,68,0.3)] border-l-4 border-l-[var(--status-danger)]">
          <span className="text-[15px] shrink-0">🔴</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{a.title}</div>
            <div className="text-xs text-[var(--text-muted)]">{a.body}</div>
            {a.actionLabel && a.actionRoute && (
              <a href={a.actionRoute} className="text-xs text-[var(--status-danger)] font-semibold no-underline mt-1 inline-block">{a.actionLabel} →</a>
            )}
          </div>
          <button onClick={() => dismissAlert(a.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-0.5 flex shrink-0">✕</button>
        </div>
      ))}

      {/* ── CLOCK STATUS BAR (staff only) ────────────────────────────────────── */}
      {isStaff && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-xl px-4 py-3 mb-5 ${
            isComplete
              ? 'bg-transparent border border-[var(--border)] border-l-4 border-l-[var(--bg-elevated)]'
              : isClockedIn
                ? 'bg-[rgba(22,163,74,0.08)] border-l-4 border-l-[var(--status-success)]'
                : isLate
                  ? 'bg-[rgba(220,38,38,0.08)] border-l-4 border-l-[var(--status-danger)]'
                  : 'bg-[rgba(217,119,6,0.08)] border-l-4 border-l-[var(--status-warning)]'
          }`}
        >
          {isComplete ? (
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-[var(--text-muted)]">✓ SHIFT COMPLETE</span>
              <span className="text-sm text-[var(--text-muted)]">·</span>
              <span className="text-sm text-[var(--text-muted)]">Clocked out {clockIn?.clockOutTime}</span>
            </div>
          ) : isClockedIn ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[8px] text-[var(--status-success)]">●</span>
                  <span className="text-sm font-semibold text-[var(--status-success)]">ON SHIFT</span>
                  <span className="text-sm text-[var(--text-primary)]">{propertyName}</span>
                  <span className="text-sm text-[var(--text-muted)]">{elapsed} elapsed</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">Started {clockIn?.clockInTime}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClockOut}
                className="font-semibold"
              >Clock Out</Button>
            </div>
          ) : isLate ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <motion.span
                    animate={prefersReducedMotion ? undefined : { opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-sm text-[var(--status-danger)]"
                  >⚠</motion.span>
                  <span className="text-sm font-semibold text-[var(--status-danger)]">LATE</span>
                  <span className="text-sm text-[var(--text-primary)]">{propertyName}</span>
                  <span className="text-sm text-[var(--status-danger)]">{Math.abs(Math.round(minsUntilShift))} min overdue</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">Shift started {primaryShiftStart}</div>
              </div>
              <Button
                size="sm"
                onClick={handleClockIn}
                className="rounded-full font-semibold bg-[var(--status-danger)] text-white hover:bg-[var(--status-danger)]/80"
              >▶ Clock In Now</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[8px] text-[var(--status-warning)]">○</span>
                  <span className="text-sm font-semibold text-[var(--status-warning)]">UPCOMING</span>
                  <span className="text-sm text-[var(--text-primary)]">{propertyName}</span>
                  {isUpcoming && (
                    <span className="text-sm text-[var(--text-muted)]">Starts in {Math.round(minsUntilShift)} min</span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-muted)]">Shift at {primaryShiftStart}</div>
              </div>
              <Button
                size="sm"
                onClick={handleClockIn}
                className="rounded-full font-semibold bg-[var(--status-warning)] text-white hover:bg-[var(--status-warning)]/80"
              >▶ Clock In</Button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── CLEANING STAFF ────────────────────────────────────────────────────── */}
      {isCleaning && (
        <>
          <div className="label-upper mb-2.5">Today&apos;s Schedule</div>
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
              >
                <Card className="overflow-hidden mb-3 p-0">
                  {/* Property photo */}
                  {property?.imageUrl && (
                    <img
                      src={property.imageUrl}
                      alt={shift.propertyName}
                      className="w-full h-28 object-cover block"
                    />
                  )}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[15px] font-semibold text-[var(--text-primary)]">{shift.propertyName}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isFirst
                          ? 'bg-[var(--status-blue-bg)] text-[var(--status-blue-fg)]'
                          : 'bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]'
                      }`}>
                        {isFirst ? 'NEXT UP 🔵' : 'LATER ⏰'}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--text-muted)] mb-2">
                      {shift.startTime} – {shift.endTime} · {shift.type}
                    </div>

                    {/* Weather */}
                    {weather && (
                      <div className="text-xs text-[var(--text-muted)] mb-1.5">
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
                        <div className="text-xs text-[var(--status-warning)] mb-2">
                          ⚠️ Tight: next check-in {shift.nextCheckin} ({Math.round(gapMins / 60)}h gap)
                        </div>
                      ) : null
                    })()}

                    {/* Access */}
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
                      <span>Access: {shift.accessType}</span>
                      {canSeeCode ? (
                        <button
                          onClick={() => toggleCode(shift.id)}
                          className="bg-[var(--bg-elevated)] rounded-lg px-2.5 py-1 text-[var(--status-info)] text-xs font-semibold cursor-pointer border-none"
                        >
                          {showCodes[shift.id] ? `Code: ${shift.code}` : 'Show Code 👁'}
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)] opacity-60">
                          🔒 Code available at {shift.startTime}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)] mb-2">
                      <div
                        className="h-full rounded-full bg-[var(--status-success)] transition-[width] duration-300"
                        style={{ width: `${shift.tasks.length > 0 ? (completedCount / shift.tasks.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mb-2.5">
                      {completedCount} of {shift.tasks.length} tasks complete
                    </div>

                    {/* Tasks */}
                    {(isFirst ? shift.tasks : shift.tasks.slice(0, 0)).map((task, ti) => (
                      <div
                        key={ti}
                        onClick={() => toggleTask(`${shift.id}-${ti}`)}
                        className={`flex items-start gap-2 py-1.5 cursor-pointer ${ti < 2 ? 'border-b border-[var(--border)]' : ''}`}
                      >
                        <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center border-2 ${
                          taskChecks[`${shift.id}-${ti}`]
                            ? 'border-[var(--status-success)] bg-[var(--status-success)]'
                            : 'border-[var(--bg-elevated)] bg-transparent'
                        }`}>
                          {taskChecks[`${shift.id}-${ti}`] && <span className="text-[8px] text-white">✓</span>}
                        </div>
                        <span className={`text-sm ${taskChecks[`${shift.id}-${ti}`] ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                          {task}
                        </span>
                      </div>
                    ))}
                    {!isFirst && (
                      <div className="text-xs text-[var(--text-muted)]">
                        {shift.tasks.length} tasks
                      </div>
                    )}

                    {/* CTA */}
                    <Button
                      className={`mt-3 w-full rounded-full font-semibold ${
                        isFirst
                          ? 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white'
                          : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 text-white'
                      }`}
                    >
                      {isFirst ? '▶ Start This Clean' : 'View Schedule'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}

          {/* Report Maintenance Issue CTA */}
          <div
            onClick={() => setMaintenanceReportDrawer(true)}
            className="bg-[rgba(59,130,246,0.07)] border border-[rgba(59,130,246,0.25)] rounded-xl p-4 mb-3 cursor-pointer flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--status-blue-bg)] flex items-center justify-center shrink-0 text-base">
              🔧
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Report Maintenance Issue</div>
              <div className="text-xs text-[var(--text-muted)]">
                {reportedIssues.length > 0
                  ? `${reportedIssues.length} issue${reportedIssues.length > 1 ? 's' : ''} reported today — tap to add another`
                  : 'Spotted something broken? Alert the maintenance team instantly.'}
              </div>
            </div>
            <span className="text-lg text-[var(--text-muted)]">›</span>
          </div>

          {/* Add Cleaning CTA */}
          <button
            onClick={() => setAddCleaningDrawer(true)}
            className="flex items-center gap-3 w-full p-4 rounded-xl cursor-pointer mb-4 text-left border border-dashed border-[var(--accent-border)] bg-[var(--accent-bg)]"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--accent-bg)]"
            >
              <Plus size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--accent)]">Add Cleaning</div>
              <div className="text-xs text-[var(--text-muted)]">
                Create a task from a template{addedCleanings.length > 0 ? ` · ${addedCleanings.length} added today` : ''}
              </div>
            </div>
          </button>

          {/* Other tasks */}
          <div className="label-upper mb-2.5">Other Tasks Today</div>
          <Card className="p-4 mb-3">
            {OTHER_TASKS_CLEANING.map((task, i) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center gap-2 py-2 cursor-pointer ${i < OTHER_TASKS_CLEANING.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 ${
                  taskChecks[task.id]
                    ? 'border-[var(--status-success)] bg-[var(--status-success)]'
                    : 'border-[var(--bg-elevated)] bg-transparent'
                }`} />
                <span className={`text-sm ${taskChecks[task.id] ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                  {task.label}
                </span>
              </div>
            ))}
          </Card>

          {/* This week */}
          <div className="label-upper mb-2.5">This Week</div>
          <Card className="p-4 mb-3">
            <div className="flex gap-1.5">
              {[
                { day: 'Mon', state: 'done' },
                { day: 'Tue', state: 'done' },
                { day: 'Wed', state: 'today' },
                { day: 'Thu', state: 'upcoming' },
                { day: 'Fri', state: 'upcoming' },
              ].map(d => (
                <div key={d.day} className={`flex-1 text-center py-2 px-1 rounded-lg cursor-pointer border ${
                  d.state === 'today'
                    ? 'bg-[var(--accent-bg)] border-[var(--accent-border)]'
                    : 'bg-[rgba(255,255,255,0.03)] border-[var(--border)]'
                }`}>
                  <div className="text-[10px] text-[var(--text-muted)] mb-1">{d.day}</div>
                  <div className="text-xs">{d.state === 'done' ? '✓' : d.state === 'today' ? '●' : '○'}</div>
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
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedTemplate(null)}>Back</Button>
                <Button
                  className="flex-1 font-medium text-white bg-[var(--accent)]"
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
                >
                  Create Cleaning
                </Button>
              </div>
            ) : undefined}
          >
            {!selectedTemplate ? (
              <div className="flex flex-col gap-2.5">
                <p className="text-sm text-[var(--text-muted)] mb-1.5">Select a cleaning template to get started:</p>
                {CLEANING_TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] cursor-pointer text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base bg-[var(--accent-bg)]"
                    >🧹</div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{tmpl.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">~{tmpl.estimatedMinutes} min · {tmpl.tasks.length} tasks</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Property</label>
                  <select
                    value={newCleaningProperty}
                    onChange={e => setNewCleaningProperty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                  >
                    {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Scheduled Date</label>
                  <input
                    type="date"
                    value={newCleaningDate}
                    onChange={e => setNewCleaningDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none box-border"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Notes (optional)</label>
                  <textarea
                    value={newCleaningNotes}
                    onChange={e => setNewCleaningNotes(e.target.value)}
                    placeholder="Any special instructions…"
                    className="w-full min-h-[72px] px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm resize-y outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-2 block">Included Tasks</label>
                  <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)] px-3.5 py-2.5 flex flex-col gap-2">
                    {selectedTemplate.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--border)] shrink-0" />
                        <span className="text-sm text-[var(--text-muted)]">{task}</span>
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
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setMaintenanceReportDrawer(false)}>Cancel</Button>
                <Button
                  className="flex-1 font-medium bg-[var(--status-info)] text-white hover:bg-[var(--status-info)]/80"
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
                    try { localStorage.setItem('afterstay_field_reports', JSON.stringify(updated)) } catch {}
                    setMaintenanceReportDrawer(false)
                    setReportDescription('')
                    if (reportUrgency === 'Urgent') {
                      showToast('🚨 Urgent issue reported — maintenance alerted')
                    } else {
                      showToast('Maintenance issue reported — team notified')
                    }
                  }}
                >
                  Submit Report
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Property</label>
                <select
                  value={reportProperty || ''}
                  onChange={e => setReportProperty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                >
                  {PROPERTIES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Issue Type</label>
                <select
                  value={reportIssueType}
                  onChange={e => setReportIssueType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                >
                  {['Plumbing', 'Electrical', 'Appliance', 'HVAC', 'Structural', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Urgency</label>
                <div className="flex gap-2">
                  {(['Standard', 'Urgent'] as const).map(u => (
                    <button
                      key={u}
                      onClick={() => setReportUrgency(u)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                        reportUrgency === u
                          ? u === 'Urgent'
                            ? 'border border-[var(--status-danger)] bg-[var(--status-red-bg)] text-[var(--status-danger)]'
                            : 'border border-[var(--status-info)] bg-[var(--status-blue-bg)] text-[var(--status-info)]'
                          : 'border border-[var(--border)] bg-transparent text-[var(--text-muted)]'
                      }`}
                    >
                      {u === 'Urgent' ? '🚨 Urgent' : '⏰ Standard'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Description</label>
                <textarea
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                  placeholder="Describe what you found…"
                  className="w-full min-h-[90px] px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm resize-y outline-none"
                />
              </div>
            </div>
          </AppDrawer>
        </>
      )}

      {/* ── MAINTENANCE STAFF ─────────────────────────────────────────────────── */}
      {isMaintenance && (
        <>
          <div className="label-upper mb-2.5">Today&apos;s Jobs</div>
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
              >
                <Card className={`overflow-hidden mb-3 p-0 ${isAutoGranted ? 'border-[rgba(22,163,74,0.4)]' : ''}`}>
                  {showBanner && (
                    <div className="bg-[var(--status-success)] px-4 py-1.5 text-xs font-semibold text-white tracking-wide uppercase">
                      🟢 GO HERE FIRST — PROPERTY VACANT
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span>{priorityEmoji}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${
                        job.priority === 'urgent'
                          ? 'bg-[var(--status-red-bg)] text-[var(--status-red-fg)]'
                          : job.priority === 'high'
                            ? 'bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]'
                            : 'bg-[rgba(107,114,128,0.15)] text-[var(--text-muted)]'
                      }`}>{job.priority}</span>
                    </div>
                    <div className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">{job.title}</div>
                    <div className="text-sm text-[var(--text-muted)] mb-2">{job.propertyName}</div>

                    {isAutoGranted && (
                      <div className="text-xs text-[var(--status-success)] mb-2">
                        ✓ Property empty — access auto-granted · No guest · Enter any time
                      </div>
                    )}
                    {isPending && (
                      <div className="text-xs text-[var(--status-warning)] mb-1">
                        PTE: ⏳ Pending · Fatima contacting guest
                      </div>
                    )}
                    {showHint && (
                      <div className="text-xs text-[var(--status-warning)] mb-2">
                        💡 Do the {firstAutoGranted!.propertyName} job first while waiting
                      </div>
                    )}

                    {/* Access */}
                    <div className="mb-2.5">
                      {canShowCode ? (
                        <button
                          onClick={() => toggleCode(job.id)}
                          className="px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--status-blue-bg)] border border-[var(--status-blue-fg)]/30 text-[var(--status-info)] cursor-pointer"
                        >
                          {showCodes[job.id] ? `Code: ${String(1000 + parseInt(job.id.replace(/\D/g, '') || '0', 10) % 9000)}` : 'Show Code 👁'}
                        </button>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--status-red-bg)] border border-[var(--status-red-fg)]/25 text-[var(--status-danger)]">
                          🔒 Locked — awaiting PTE
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {canShowCode && <ActionBtn label="▶ Start Job" />}
                      <ActionBtn label="📍 Directions" />
                      {isPending && <ActionBtn label="Contact Fatima" />}
                      {isPending && <ActionBtn label="View PTE Status" />}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </>
      )}

      {/* ── GUEST SERVICES ────────────────────────────────────────────────────── */}
      {isGuestServices && (
        <>
          {/* Check-ins today */}
          <div className="label-upper mb-2.5">Check-ins Today</div>
          <Card className="p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[var(--text-primary)]">CHECK-INS TODAY</span>
              <span className="text-xs text-[var(--text-muted)]">{TODAY_CHECKINS.length} arrivals</span>
            </div>
            {TODAY_CHECKINS.map((ci, i) => (
              <div key={i} className={`${i < TODAY_CHECKINS.length - 1 ? 'pb-3 mb-3 border-b border-[var(--border)]' : ''}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{ci.time} · {ci.propertyName}</span>
                  <StatusBadge status={ci.readiness === 'ok' ? 'ok' : 'pending'} />
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-1">
                  {ci.guest} · {ci.nights} nights · Cleaning: {ci.cleaner}
                </div>
                {ci.readinessNote && (
                  <div className="text-xs text-[var(--status-warning)] mb-2">⚠️ {ci.readinessNote}</div>
                )}
                <div className="flex gap-1.5 flex-wrap">
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
          <div className="label-upper mb-2.5">Overnight Issues</div>
          <Card className="p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[var(--text-primary)]">🌙 OVERNIGHT</span>
              <span className="text-xs text-[var(--text-muted)]">{todayReport?.issues.length ?? 0} reported</span>
            </div>
            {(todayReport?.issues ?? []).map((issue, i) => (
              <div key={issue.id} className={`${i < (todayReport?.issues.length ?? 0) - 1 ? 'pb-3 mb-3 border-b border-[var(--border)]' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[var(--text-muted)]">{issue.time}</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{issue.title}</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-1">{issue.property}</div>
                <div className="text-xs mb-2">
                  {issue.assignedTo
                    ? <span className="text-[var(--status-success)]">Assigned to {issue.assignedTo} ✓</span>
                    : <span className="text-[var(--status-danger)] font-semibold">⚠️ UNASSIGNED</span>
                  }
                </div>
                <div className="flex gap-1.5 flex-wrap">
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
          <div className="label-upper mb-2.5">Active Issues</div>
          <Card className="p-4 mb-3">
            <div className="flex gap-3 mb-3">
              <span className="text-sm text-[var(--status-danger)]">🔴 2 urgent</span>
              <span className="text-sm text-[var(--status-warning)]">🟡 1 open</span>
              <span className="text-sm text-[var(--text-muted)]">⚪ 0 resolved today</span>
            </div>
            <div className="pt-2 border-t border-[var(--border)]">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Gym access not available</div>
              <div className="text-xs text-[var(--text-muted)] mb-2">Downtown Loft · Camilla D. · Yesterday</div>
              <div className="flex gap-1.5 flex-wrap">
                <ActionBtn label="Create Task" />
                <ActionBtn label="Log Update" />
                <ActionBtn label="Close" />
              </div>
            </div>
          </Card>

          {/* PTE Requests */}
          {GS_PENDING_PTE.length > 0 && (
            <>
              <div className="label-upper mb-2.5">PTE Requests</div>
              {GS_PENDING_PTE.map(pte => (
                <Card key={pte.id} className="p-4 mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-[var(--status-warning)]">⏳ PTE NEEDED</span>
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{pte.property} · {pte.staff} → {pte.task}</div>
                  <div className="text-xs text-[var(--text-muted)] mb-2.5">Guest {pte.guest} in property</div>
                  <div className={`flex gap-1.5 flex-wrap ${expandPTEPanel === pte.id ? 'mb-3' : ''}`}>
                    <ActionBtn label="Contact Guest" />
                    <Button
                      size="sm"
                      onClick={() => setExpandPTEPanel(p => p === pte.id ? null : pte.id)}
                      className="bg-[var(--status-success)] text-white font-semibold hover:bg-[var(--status-success)]/80"
                    >Grant PTE</Button>
                    <ActionBtn label="Deny" />
                    <ActionBtn label="Reschedule" />
                  </div>
                  {expandPTEPanel === pte.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden border-t border-[var(--border)] pt-3"
                    >
                      <div className="text-xs text-[var(--text-muted)] mb-2">
                        <strong className="text-[var(--text-primary)]">Property:</strong> {pte.property} &nbsp;
                        <strong className="text-[var(--text-primary)]">Staff:</strong> {pte.staff} &nbsp;
                        <strong className="text-[var(--text-primary)]">Guest:</strong> {pte.guest}
                      </div>
                      <div className="flex gap-2 mb-2.5">
                        <div className="flex-1">
                          <label className="label-upper block mb-1">VALID FROM</label>
                          <input defaultValue="Now" className="w-full px-2.5 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm box-border" />
                        </div>
                        <div className="flex-1">
                          <label className="label-upper block mb-1">VALID UNTIL</label>
                          <input defaultValue="14:00 checkout" className="w-full px-2.5 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--text-primary)] text-sm box-border" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setGrantedPTE(p => ({ ...p, [pte.id]: true }))
                            setExpandPTEPanel(null)
                            showToast('PTE granted — Bjorn notified')
                          }}
                          className="bg-[var(--status-success)] text-white font-semibold hover:bg-[var(--status-success)]/80"
                        >✓ Confirm Grant</Button>
                        <ActionBtn label="Cancel" onClick={() => setExpandPTEPanel(null)} />
                      </div>
                    </motion.div>
                  )}
                  {grantedPTE[pte.id] && (
                    <div className="mt-1.5 text-xs text-[var(--status-success)] font-semibold">✓ PTE granted</div>
                  )}
                </Card>
              ))}
            </>
          )}

          {/* My tasks */}
          <div className="label-upper mb-2.5">My Tasks Today</div>
          <Card className="p-4 mb-3">
            {OPERATOR_TASKS.map((task, i) => (
              <div key={task.id} onClick={() => toggleTask(task.id)} className={`flex items-center gap-2 py-1.5 cursor-pointer ${i < OPERATOR_TASKS.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                <div className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 ${taskChecks[task.id] ? 'border-[var(--status-success)] bg-[var(--status-success)]' : 'border-[var(--bg-elevated)] bg-transparent'}`} />
                <span className={`text-sm ${taskChecks[task.id] ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{task.label}</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* ── OPERATOR ──────────────────────────────────────────────────────────── */}
      {isOperator && (
        <>
          {/* Alert banner */}
          {(APPROVALS.filter(a => approvalStatuses[a.id] === 'pending').length > 0 || NEEDS_ACTION_ITEMS.length > 0) && (
            <Card className="flex items-center gap-2.5 px-3.5 py-2.5 mb-4">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {NEEDS_ACTION_ITEMS.length} items need action · {APPROVALS.filter(a => approvalStatuses[a.id] === 'pending').length} approvals pending
              </span>
            </Card>
          )}

          {/* PTE alert cards */}
          {(() => {
            const ptePendingLong = JOBS.filter(j =>
              j.pteStatus === 'pending' &&
              j.pte?.requestedAt &&
              Date.now() - new Date(j.pte.requestedAt).getTime() > 4 * 3600000
            )
            const pteDenied = JOBS.filter(j => j.pteStatus === 'denied')
            const pteAutoGranted = JOBS.filter(j => j.pteStatus === 'auto_granted')
            if (ptePendingLong.length === 0 && pteDenied.length === 0 && pteAutoGranted.length === 0) return null
            return (
              <div className="mb-4">
                <div className="label-upper mb-2">Needs Attention — PTE</div>
                {ptePendingLong.map(j => (
                  <Card key={j.id} className="flex items-center gap-2.5 px-3.5 py-2.5 mb-2">
                    <span className="text-sm shrink-0">⏳</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">PTE pending 4+ hours — {j.title}</div>
                      <div className="text-xs text-[var(--text-muted)]">{j.propertyName} · Guest Services not yet responded</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-[5px] bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] font-semibold cursor-pointer shrink-0">View Task</span>
                  </Card>
                ))}
                {pteDenied.map(j => (
                  <div key={j.id} className="flex items-center gap-2.5 px-3.5 py-2.5 mb-2 bg-[var(--status-red-bg)] border border-[rgba(220,38,38,0.3)] border-l-4 border-l-[var(--status-danger)] rounded-lg">
                    <span className="text-sm shrink-0">✗</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">PTE denied — {j.title}</div>
                      <div className="text-xs text-[var(--text-muted)]">{j.propertyName} · Reschedule required</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-[5px] bg-[var(--status-red-bg)] text-[var(--status-red-fg)] font-semibold cursor-pointer shrink-0">View Task</span>
                  </div>
                ))}
                {pteAutoGranted.length > 0 && (
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 mb-2 bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.25)] border-l-4 border-l-[var(--status-success)] rounded-lg">
                    <span className="text-sm shrink-0">✓</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{pteAutoGranted.length} task{pteAutoGranted.length > 1 ? 's' : ''} auto-granted PTE</div>
                      <div className="text-xs text-[var(--text-muted)]">Properties vacant — no guest access needed</div>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Compact inline stats strip */}
          <Card className="px-4 py-3 mb-3.5">
            <div className="flex gap-6 flex-wrap items-center">
              <div className="flex items-center gap-4 flex-wrap pr-6 border-r border-[var(--border)]">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">OPS</span>
                {[
                  { label: 'Cleanings',  value: TODAY_CHECKINS.length, icon: <Sparkles size={13} strokeWidth={1.5} />, href: '/operator/cleaning' },
                  { label: 'Tasks',      value: 6,                     icon: <ListTodo size={13} strokeWidth={1.5} />, href: '/operator/operations' },
                  { label: 'Attention',  value: 2,                     icon: <Clock size={13} strokeWidth={1.5} />,    href: '/operator/operations', alert: true },
                  { label: 'Approvals',  value: APPROVALS.filter(a => approvalStatuses[a.id] === 'pending').length, icon: <CreditCard size={13} strokeWidth={1.5} />, href: '/operator/tickets', alert: APPROVALS.filter(a => approvalStatuses[a.id] === 'pending').length > 0 },
                ].map(s => (
                  <Link key={s.label} href={s.href} className="no-underline flex items-center gap-1.5">
                    <span className={s.alert ? 'text-[var(--status-danger)]' : 'text-[var(--text-muted)]'}>{s.icon}</span>
                    <span className={`text-lg font-semibold leading-none ${s.alert ? 'text-[var(--status-danger)]' : 'text-[var(--text-primary)]'}`}>{s.value}</span>
                    <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">PORTFOLIO</span>
                {[
                  { label: 'Properties', value: PROPERTIES.length,                                                            icon: <Building2 size={13} strokeWidth={1.5} />, href: '/operator/properties' },
                  { label: 'Owners',     value: OWNERS.length,                                                                 icon: <Users size={13} strokeWidth={1.5} />,     href: '/owner' },
                  { label: 'Requests',   value: REQUESTS.filter(r => r.status === 'open' || r.status === 'pending').length,    icon: <Ticket size={13} strokeWidth={1.5} />,    href: '/operator/tickets' },
                  { label: 'Low Stock',  value: 4,                                                                             icon: <Package size={13} strokeWidth={1.5} />,   href: '/operator/inventory' },
                ].map(s => (
                  <Link key={s.label} href={s.href} className="no-underline flex items-center gap-1.5">
                    <span className="text-[var(--text-muted)]">{s.icon}</span>
                    <span className="text-lg font-semibold text-[var(--text-primary)] leading-none">{s.value}</span>
                    <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          {/* Compact team strip */}
          <Card className="px-4 py-2.5 mb-5">
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--text-muted)] shrink-0">TEAM</span>
              <div className="flex gap-2 flex-wrap flex-1">
                {TEAM_CLOCK_STATUS.map(member => {
                  const now2 = new Date()
                  const [sh2, sm2] = member.shiftStart.split(':').map(Number)
                  const shiftMs2 = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate(), sh2, sm2).getTime()
                  const minsLate2 = !member.clockedIn ? Math.round((Date.now() - shiftMs2) / 60000) : 0
                  const isLate2 = member.late && minsLate2 > 0
                  return (
                    <div key={member.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                      isLate2
                        ? 'bg-[rgba(217,119,6,0.1)] border-[rgba(217,119,6,0.35)]'
                        : 'bg-[rgba(255,255,255,0.04)] border-[var(--border)]'
                    }`}>
                      <div
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-semibold text-white"
                        style={{ background: member.avatarBg }}
                      >{member.initials}</div>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{member.name}</span>
                      {member.clockedIn
                        ? <Circle size={6} fill="var(--status-success)" strokeWidth={0} className="text-[var(--status-success)]" />
                        : isLate2
                          ? <motion.span animate={prefersReducedMotion ? undefined : { opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex"><AlertTriangle size={10} className="text-[var(--status-warning)]" /></motion.span>
                          : <Circle size={6} strokeWidth={1.5} className="text-[var(--text-muted)]" />
                      }
                      {isLate2 && <span className="text-[10px] text-[var(--status-warning)] font-semibold">{minsLate2}m late</span>}
                    </div>
                  )
                })}
              </div>
              <span className="text-xs text-[var(--text-muted)] shrink-0">{TEAM_CLOCK_STATUS.filter(m => m.clockedIn).length}/{TEAM_CLOCK_STATUS.length} on shift</span>
            </div>
          </Card>

          {/* 2-column layout */}
          <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
          {/* Left column */}
          <div>

          {/* Overnight incidents */}
          <div className="label-upper mb-2.5">Last Night</div>
          <Card className="p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]"><Moon size={12} />LAST NIGHT</span>
              <span className="text-xs text-[var(--text-muted)]">{todayReport?.issues.length ?? 0} incidents</span>
            </div>
            {(todayReport?.issues ?? []).map((issue, i) => (
              <div key={issue.id} className={`${i < (todayReport?.issues.length ?? 0) - 1 ? 'pb-2.5 mb-2.5 border-b border-[var(--border)]' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] shrink-0">{issue.time}</span>
                  <span className="text-sm text-[var(--text-primary)]">{issue.title} · {issue.property}</span>
                  <div className="ml-auto shrink-0">
                    {issue.assignedTo
                      ? <span className="text-xs text-[var(--status-success)]">Assigned ✓</span>
                      : <ActionBtn label="Assign Now" />
                    }
                  </div>
                </div>
              </div>
            ))}
          </Card>

          {/* Needs action */}
          <div className="label-upper mb-2.5">Needs Action</div>
          <Card className="p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[var(--text-primary)]">NEEDS ACTION</span>
              <span className="text-xs text-[var(--text-muted)]">{NEEDS_ACTION_ITEMS.length} items</span>
            </div>
            {NEEDS_ACTION_ITEMS.map((item, i) => (
              <div key={item.id} className={`pl-2.5 ${
                item.urgency === 'urgent' ? 'border-l-[3px] border-l-[var(--status-danger)]' : item.urgency === 'high' ? 'border-l-[3px] border-l-[var(--status-warning)]' : ''
              } ${i < NEEDS_ACTION_ITEMS.length - 1 ? 'pb-2.5 mb-2.5 border-b border-[var(--border)]' : ''}`}>
                <div className="text-sm text-[var(--text-primary)] mb-1">{item.text}</div>
                <ActionBtn label={item.action} />
              </div>
            ))}
          </Card>

          {/* My tasks */}
          <div className="label-upper mb-2.5">My Tasks Today</div>
          <Card className="p-4 mb-3">
            {OPERATOR_TASKS.map((task, i) => (
              <div key={task.id} onClick={() => toggleTask(task.id)} className={`flex items-center gap-2 py-1.5 cursor-pointer ${i < OPERATOR_TASKS.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                <div className={`w-3.5 h-3.5 rounded-full shrink-0 border-2 ${taskChecks[task.id] ? 'border-[var(--status-success)] bg-[var(--status-success)]' : 'border-[var(--bg-elevated)] bg-transparent'}`} />
                <span className={`text-sm ${taskChecks[task.id] ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{task.label}</span>
              </div>
            ))}
          </Card>

          {/* Meetings */}
          <div className="label-upper mb-2.5">My Meetings Today</div>
          {(() => {
            const now = new Date()
            const next = MEETINGS.map(m => {
              const [h, min] = m.time.split(':').map(Number)
              const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, min)
              return { ...m, minsUntil: Math.round((t.getTime() - now.getTime()) / 60000) }
            }).find(m => m.minsUntil > 0 && m.minsUntil <= 120)
            return next ? (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--status-purple-bg)] text-[var(--status-purple-fg)]">
                  {next.title} · in {next.minsUntil} min
                </span>
              </div>
            ) : null
          })()}
          <Card className="p-4 mb-3">
            {MEETINGS.map((m, i) => (
              <div key={m.id} className={`flex items-center gap-2.5 py-1.5 ${i < MEETINGS.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                <span className="text-sm font-semibold text-[var(--text-muted)] shrink-0">{m.time}</span>
                <span className="text-sm text-[var(--text-primary)]">{m.title}</span>
                <span className="text-xs text-[var(--text-muted)] ml-auto">{m.attendees} attendees</span>
              </div>
            ))}
          </Card>

          </div>{/* end left column */}

          {/* Right column */}
          <div className="sticky top-0 max-h-[calc(100vh-80px)] overflow-y-auto">
            {/* Pulse */}
            <div className="label-upper mb-2.5">PULSE</div>
            <Card className="p-0 overflow-hidden mb-3">
              {/* Header */}
              <div className="flex items-center gap-2 px-3.5 py-3 border-b border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Activity</span>
                <span className="flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-[10px] bg-[var(--status-green-bg)] text-[var(--status-green-fg)] border border-[rgba(16,185,129,0.19)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-green-fg)] inline-block" />
                  Live
                </span>
              </div>
              {/* Tab bar */}
              <div className="flex gap-0.5 px-2.5 py-2 border-b border-[var(--border)]">
                {(['all', 'in_progress', 'issues'] as FeedTab[]).map(tab => (
                  <button key={tab} onClick={() => setFeedTab2(tab)} className={`flex-1 py-1 text-xs rounded-[5px] border-none cursor-pointer ${
                    feedTab2 === tab
                      ? 'font-semibold bg-white text-[var(--text-primary)]'
                      : 'font-normal bg-transparent text-[var(--text-muted)]'
                  }`}>
                    {tab === 'all' ? 'All' : tab === 'in_progress' ? 'In progress' : 'Issues'}
                  </button>
                ))}
              </div>
              {/* Feed items */}
              <div>
                {filterFeed(FEED_ITEMS, feedTab2).slice(0, 6).map((item, i, arr) => {
                  const isRich = item.type === 'in_progress' || item.type === 'blocked' || item.type === 'en_route'
                  return (
                    <div key={item.id} className={`flex items-start gap-2.5 px-3.5 py-2.5 ${i < arr.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                      {i === 0
                        ? <div className="live-dot shrink-0 mt-1.5" />
                        : <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: item.color }} />
                      }
                      <div className="flex-1 min-w-0">
                        {isRich ? (
                          <>
                            <div className="text-xs leading-snug">
                              <span className="font-semibold text-[var(--text-primary)]">{item.actor}</span>
                              <span className="text-[var(--text-muted)]"> — {item.action} {item.property}</span>
                              {item.detail && <span className="text-[var(--text-muted)]"> · {item.detail}</span>}
                            </div>
                            {item.statusLabel && (
                              <div className="text-xs font-semibold mt-0.5" style={{ color: item.color }}>{item.statusLabel}</div>
                            )}
                            {item.type === 'in_progress' && item.progress !== undefined && (
                              <div className="mt-1.5 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: item.color }} />
                              </div>
                            )}
                            <div className="text-xs text-[var(--text-muted)] mt-1">{item.time}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs leading-snug">
                              <span className="font-semibold text-[var(--text-primary)]">{item.actor}</span>
                              <span className="text-[var(--text-muted)]"> {item.action}</span>
                              {item.detail && <span className="text-[var(--text-muted)]"> — {item.detail} · {item.property}</span>}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.time}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Check-ins */}
            <div className="label-upper mb-2.5">Today&apos;s Check-ins</div>
            <Card className="p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[var(--text-primary)]">CHECK-INS TODAY</span>
                <span className="text-xs text-[var(--text-muted)]">{TODAY_CHECKINS.length} arrivals</span>
              </div>
              {TODAY_CHECKINS.map((ci, i) => (
                <div key={i} className={`flex items-center justify-between py-1.5 ${i < TODAY_CHECKINS.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                  <div>
                    <span className="text-sm text-[var(--text-primary)]">{ci.time} · {ci.propertyName}</span>
                    {ci.readinessNote && <div className="text-xs text-[var(--status-warning)]">{ci.readinessNote}</div>}
                  </div>
                  <StatusBadge status={ci.readiness === 'ok' ? 'ok' : 'pending'} />
                </div>
              ))}
            </Card>

            {/* Owner Approvals */}
            <div className="label-upper mb-2.5">Pending Owner Approvals</div>
            <div className="mb-3">
              {APPROVALS.map(approval => {
                const status = approvalStatuses[approval.id]
                const isPending = status === 'pending'
                return (
                  <Card key={approval.id} className={`p-4 mb-2.5 border-l-4 ${
                    isPending ? 'border-l-[var(--status-warning)] border-[rgba(217,119,6,0.35)]'
                    : status === 'card' ? 'border-l-[var(--status-success)]'
                    : status === 'invoice' ? 'border-l-[var(--status-purple-fg)]'
                    : 'border-l-[var(--bg-elevated)]'
                  }`}>
                    <div className="flex items-start justify-between gap-2.5 mb-2">
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">{approval.title}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">{approval.property} · {approval.category}</div>
                      </div>
                      <span className={`text-sm font-semibold shrink-0 ${isPending ? 'text-[var(--status-warning)]' : 'text-[var(--status-success)]'}`}>
                        {approval.amount.toLocaleString()} {approval.currency}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mb-2.5">{approval.description}</div>
                    {isPending ? (
                      <div className="flex gap-1.5">
                        <Button
                          size="xs"
                          onClick={() => handleApprove(approval.id, 'card')}
                          className="flex-1 bg-[var(--status-success)] text-white font-semibold hover:bg-[var(--status-success)]/80"
                        >
                          Approve (Pay by Card)
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleApprove(approval.id, 'invoice')}
                          className="flex-1 border-[rgba(99,102,241,0.25)] bg-[rgba(99,102,241,0.08)] text-[var(--status-purple-fg)] font-semibold"
                        >
                          Approve (Invoice Later)
                        </Button>
                        {!followUpSent[approval.id] && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleFollowUp(approval.id)}
                            className="border-[rgba(217,119,6,0.3)] bg-[rgba(217,119,6,0.1)] text-[var(--status-warning)] font-semibold shrink-0"
                          >
                            Follow-Up
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className={`px-2.5 py-1 rounded-md text-center ${
                        status === 'card' ? 'bg-[rgba(16,185,129,0.1)]' : 'bg-[rgba(99,102,241,0.1)]'
                      }`}>
                        <span className={`text-xs font-semibold ${status === 'card' ? 'text-[var(--status-success)]' : 'text-[var(--status-purple-fg)]'}`}>
                          {status === 'card' ? '✓ Charged to card on file' : '✓ Added to owner statement'}
                        </span>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            {/* Quick Links */}
            <div className="label-upper mb-2.5">Quick Links</div>
            <Card className="p-4 mb-3">
              {[
                { label: 'New Issue', href: '/operator/issues' },
                { label: 'Schedule Clean', href: '/operator/operations?tab=cleaning' },
                { label: 'View Properties', href: '/operator/properties' },
                { label: 'Staff Overview', href: '/operator/staff' },
              ].map((link, i, arr) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`flex items-center justify-between py-2 text-sm text-[var(--text-primary)] no-underline ${i < arr.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
                >
                  {link.label}
                  <span className="text-[var(--text-muted)] text-base">›</span>
                </a>
              ))}
            </Card>
          </div>{/* end right column */}

          </div>{/* end 2-column grid */}
        </>
      )}

      {/* ── OWNER ─────────────────────────────────────────────────────────────── */}
      {isOwner && (
        <>
          <div className="label-upper mb-2.5">Your Portfolio</div>
          <Card className="p-4 mb-3">
            <div className="flex gap-4 flex-wrap">
              {[
                { label: 'Properties', value: '3', colorClass: 'text-[var(--status-info)]' },
                { label: 'Active Issues', value: '1', colorClass: 'text-[var(--status-warning)]' },
                { label: 'Avg Rating', value: '4.8 ★', colorClass: 'text-[var(--status-success)]' },
              ].map(s => (
                <div key={s.label} className="flex-1 min-w-[80px] text-center">
                  <div className={`text-2xl font-semibold ${s.colorClass}`}>{s.value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
          <div className="label-upper mb-2.5">Your Properties</div>
          {PROPERTIES.filter(p => p.status === 'live').map((prop, idx) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-4 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{prop.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{prop.city} · {prop.beds}BR / {prop.baths}BA</div>
                  </div>
                  <Link href="/app/properties" className="text-xs text-[var(--status-info)] no-underline flex items-center gap-0.5">
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

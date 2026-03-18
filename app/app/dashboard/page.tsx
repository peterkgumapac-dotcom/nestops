'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, Ticket, Package, AlertTriangle, CheckSquare, Clock, Star, CalendarCheck, ChevronRight, Bell } from 'lucide-react'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import type { UserProfile } from '@/context/RoleContext'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import CountdownTimer from '@/components/shared/CountdownTimer'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { REQUESTS } from '@/lib/data/requests'
import { STOCK_ITEMS } from '@/lib/data/inventory'
import { SHIFTS } from '@/lib/data/staffScheduling'
import { STAFF_MEMBERS } from '@/lib/data/staff'
import { GUEST_ISSUES, OVERNIGHT_REPORTS, getActiveIssues } from '@/lib/data/guestServices'
import { JOBS } from '@/lib/data/staff'
import { getPTEBadge } from '@/lib/utils/pteUtils'
import { getLateStatus } from '@/lib/utils/lateDetection'

const TODAY = new Date().toISOString().split('T')[0]

const TODAY_CLEANINGS = [
  { id: 'c1', property: 'Sunset Villa',    type: 'Checkout clean',  time: '10:00', staff: 'Maria S.',   status: 'scheduled' as const },
  { id: 'c2', property: 'Harbor Studio',   type: 'Mid-stay clean',  time: '13:00', staff: 'Maria S.',   status: 'in_progress' as const },
  { id: 'c3', property: 'Downtown Loft',   type: 'Checkout clean',  time: '15:00', staff: 'Bjorn L.',   status: 'scheduled' as const },
]

const TODAY_TASKS = [
  { id: 't1', title: 'Replace towels — Sunset Villa',    priority: 'medium' as const, assignee: 'Maria S.',   due: 'Today 11:00' },
  { id: 't2', title: 'Fix leaking faucet — Harbor Studio', priority: 'high' as const,  assignee: 'Bjorn L.',  due: 'Today 14:00' },
  { id: 't3', title: 'Restock minibar — Downtown Loft',  priority: 'low'  as const,  assignee: 'Fatima N.', due: 'Today 16:00' },
]

const OVERDUE = [
  { id: 'o1', title: 'Annual fire safety check — Ocean View', daysOverdue: 3, assignee: 'Bjorn L.' },
  { id: 'o2', title: 'Deep clean after guest complaint',      daysOverdue: 1, assignee: 'Maria S.' },
]

const PENDING_APPROVALS = [
  { id: 'a1', title: 'Emergency plumbing repair',   property: 'Harbor Studio', amount: 4800, owner: 'Sarah J.' },
  { id: 'a2', title: 'Replace dishwasher',          property: 'Sunset Villa',  amount: 9200, owner: 'Sarah J.' },
  { id: 'a3', title: 'New outdoor furniture set',   property: 'Ocean View Apt', amount: 6400, owner: 'Michael C.' },
]

const OPERATOR_TASKS = [
  { id: 'ot1', title: 'Create SOP: Guest Check-in v2', done: false },
  { id: 'ot2', title: 'Review compliance — Mountain Cabin', done: false },
  { id: 'ot3', title: 'Approve purchase: Linen set — NOK 3,200', done: false },
]

const MEETINGS = [
  { id: 'm1', time: '10:00', title: 'Weekly Ops Standup', attendees: 3 },
  { id: 'm2', time: '14:00', title: 'Owner Onboarding — Kim Portfolio', attendees: 2 },
]

const PRIORITY_COLORS: Record<string, string> = {
  high: '#f87171', medium: '#fb923c', low: '#34d399', urgent: '#f43f5e',
}

const USER_TO_STAFF: Record<string, string> = {
  'u3': 's1',
  'u4': 's3',
  'u5': 's2',
}

const SHIFT_TASKS: Record<string, string[]> = {
  cleaning: [
    'Strip and replace all bed linens',
    'Clean and disinfect all bathrooms',
    'Vacuum and mop all floors',
    'Wipe kitchen surfaces and appliances',
    'Restock toiletries and consumables',
    'Check and report any damage',
  ],
  maintenance: [
    'Diagnose and document the issue',
    'Take photos of problem area',
    'Complete repair',
    'Test fix is working',
    'Update notes and notify operator',
  ],
  inspection: [
    'Check all rooms against checklist',
    'Test all appliances',
    'Check smoke and CO detectors',
    'Document any issues with photos',
    'Submit inspection report',
  ],
  intake: [
    'Complete property walkthrough',
    'Document current condition',
    'Test all locks and access codes',
    'Complete onboarding checklist',
    'Submit intake report',
  ],
  standby: ['Monitor messages', 'Be available for emergency callouts'],
}

function SectionHeader({ title, href, linkLabel = 'View all' }: { title: string; href?: string; linkLabel?: string }) {
  const { accent } = useRole()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
      {href && <Link href={href} style={{ fontSize: 13, color: accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>{linkLabel} <ChevronRight size={13} /></Link>}
    </div>
  )
}

interface ClockInRecord {
  staffId: string
  shiftId: string
  propertyId: string
  date: string
  clockInTime: string
  status: string
  clockOutTime?: string
}

export default function AppDashboard() {
  const { accent, role, user } = useRole()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [clockIn, setClockIn] = useState<ClockInRecord | null>(null)
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})
  const [grantedPTE, setGrantedPTE] = useState<Record<string, boolean>>({})
  const [teamStatuses, setTeamStatuses] = useState<{ staffId: string; name: string; initials: string; shift: { date: string; startTime: string; status: string } | null }[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)) } catch {}
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('nestops_clockin')
    if (stored) {
      try {
        const ci = JSON.parse(stored)
        const today = new Date().toISOString().split('T')[0]
        if (ci.date === today) setClockIn(ci)
      } catch {}
    }
  }, [])

  // Team status for operator
  useEffect(() => {
    if (role !== 'operator') return
    const buildTeam = () => {
      const statuses = STAFF_MEMBERS.map(member => {
        const shift = SHIFTS.find(s => s.staffId === member.id && s.date === TODAY) ?? null
        return {
          staffId: member.id,
          name: member.name,
          initials: member.initials,
          shift: shift ? { date: shift.date, startTime: shift.startTime, status: shift.status } : null,
        }
      })
      setTeamStatuses(statuses)
    }
    buildTeam()
    const interval = setInterval(buildTeam, 60000)
    return () => clearInterval(interval)
  }, [role])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const displayName = user?.name?.split(' ')[0] ?? currentUser?.name?.split(' ')[0] ?? (role === 'operator' ? 'Peter' : 'there')

  const openRequests = REQUESTS.filter(r => r.status === 'open').length
  const lowStock = STOCK_ITEMS.filter(i => i.status === 'low' || i.status === 'critical' || i.status === 'out')
  const activeProperties = PROPERTIES.filter(p => p.status === 'live').length

  // Today's overnight report
  const todayReport = OVERNIGHT_REPORTS.find(r => r.date === TODAY)

  // Staff-specific data
  const staffId = currentUser ? USER_TO_STAFF[currentUser.id] : null
  const myShiftsToday = staffId ? SHIFTS.filter(s => s.staffId === staffId && s.date === TODAY) : []
  const myJobs = staffId ? JOBS.filter(j => j.staffId === staffId) : []
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const pendingPTEJobs = JOBS.filter(j => j.pteStatus === 'pending')

  const toggleCode = (id: string) => setShowCodes(prev => ({ ...prev, [id]: !prev[id] }))
  const grantPTE = (jobId: string) => setGrantedPTE(prev => ({ ...prev, [jobId]: true }))

  const isStaff = currentUser?.role === 'staff' || role === 'staff'
  const effectiveSubRole = currentUser?.subRole ?? user?.subRole ?? ''

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

      {/* Alert bar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <Bell size={14} style={{ color: '#f87171', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
          <strong>2 overdue tasks</strong> and <strong>3 pending owner approvals</strong> need your attention today.
        </span>
        <Link href="/app/operations" style={{ marginLeft: 'auto', fontSize: 12, color: accent, textDecoration: 'none', whiteSpace: 'nowrap' }}>Review →</Link>
      </motion.div>

      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          {greeting}, {displayName} 👋
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {role === 'operator'
            ? `Here's what's happening across your ${PROPERTIES.length} properties today.`
            : `Here are your assignments for today.`}
        </p>
      </div>

      {/* Clock status bar — staff only */}
      {isStaff && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20,
          ...(clockIn?.status === 'in_progress'
            ? { background: '#10b98112', borderLeft: '3px solid #10b981', border: '1px solid #10b98130' }
            : { background: '#d9770612', borderLeft: '3px solid #d97706', border: '1px solid #d9770630' })
        }}>
          {clockIn?.status === 'in_progress' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 13, color: '#10b981', fontWeight: 500 }}>
                  On shift · {PROPERTIES.find(p => p.id === clockIn.propertyId)?.name ?? 'Property'} · Started {new Date(clockIn.clockInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button
                onClick={() => {
                  const updated = { ...clockIn, status: 'completed', clockOutTime: new Date().toISOString() }
                  localStorage.setItem('nestops_clockin', JSON.stringify(updated))
                  setClockIn(updated)
                }}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #10b98140', background: 'transparent', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Clock Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#d97706' }}>⏰ No active shift · Start your shift when ready</span>
              <Link href="/staff/start" style={{ fontSize: 12, color: '#d97706', fontWeight: 600, textDecoration: 'none' }}>▶ Start Shift</Link>
            </div>
          )}
        </div>
      )}

      {/* ═══ OPERATOR DASHBOARD ═══ */}
      {role === 'operator' && (
        <>
          {/* Overnight report */}
          {todayReport && todayReport.issues.length > 0 && (
            <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                🌙 {todayReport.issues.length} issue{todayReport.issues.length !== 1 ? 's' : ''} reported overnight
              </div>
              {todayReport.issues.map(issue => (
                <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: issue.severity === 'high' ? '#f8717120' : '#fb923c20', color: issue.severity === 'high' ? '#f87171' : '#fb923c' }}>
                    {issue.severity.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', minWidth: 40 }}>{issue.time}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{issue.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{issue.property}</span>
                  <span style={{ fontSize: 11, color: issue.assignedTo ? 'var(--text-muted)' : '#f87171', fontWeight: issue.assignedTo ? 400 : 600 }}>
                    {issue.assignedTo ?? '⚠️ Unassigned'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 16 }}>
            <StatCard label="Active Properties" value={activeProperties} icon={Building2} subtitle={`of ${PROPERTIES.length} total`} />
            <StatCard label="Active Owners" value={OWNERS.filter(o => o.status === 'active').length} icon={Users} subtitle="Currently managing" />
            <StatCard label="Open Requests" value={openRequests} icon={Ticket} subtitle="Awaiting action" />
            <StatCard label="Low Stock" value={lowStock.length} icon={Package} subtitle="Needs restocking" />
          </div>

          {/* First check-in countdown */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
            <CountdownTimer
              targetTime={`${TODAY}T15:00:00`}
              label="First check-in in"
              context="15:00 today · First guest arrival"
            />
          </div>

          {/* Team status */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <SectionHeader title="Team Status 👥" href="/app/team" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {teamStatuses.map(member => {
                const lateStatus = member.shift ? getLateStatus(member.shift) : null
                return (
                  <div key={member.staffId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {member.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{member.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {member.shift ? `${member.shift.startTime} shift` : 'No shift today'}
                      </div>
                    </div>
                    {member.shift && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: member.shift.status === 'in_progress' ? '#10b98120' : member.shift.status === 'completed' ? '#6b728020' : '#d9770620',
                        color: member.shift.status === 'in_progress' ? '#10b981' : member.shift.status === 'completed' ? '#6b7280' : '#d97706',
                      }}>
                        {member.shift.status === 'in_progress' ? 'On Shift' : member.shift.status === 'completed' ? 'Done' : 'Scheduled'}
                      </span>
                    )}
                    {lateStatus?.isLate && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: lateStatus.severity === 'very_late' ? '#f87171' : '#d97706' }}>
                        {lateStatus.minutesLate}m late
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* My tasks + meetings grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
              <SectionHeader title="My Tasks Today" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {OPERATOR_TASKS.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid var(--border)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
              <SectionHeader title="My Meetings Today 📅" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {MEETINGS.map(meeting => (
                  <div key={meeting.id} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-surface)' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{meeting.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{meeting.time} · {meeting.attendees} attendees</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Stat cards row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Today's Cleanings" value={TODAY_CLEANINGS.length} icon={CalendarCheck} subtitle="Scheduled" animate={false} />
        <StatCard label="Today's Tasks" value={TODAY_TASKS.length} icon={CheckSquare} subtitle="Assigned" animate={false} />
        <StatCard label="Overdue" value={OVERDUE.length} icon={Clock} subtitle="Needs attention" animate={false} />
        {role === 'operator' && <StatCard label="Pending Approvals" value={PENDING_APPROVALS.length} icon={Star} subtitle="From owners" animate={false} />}
      </div>

      {/* ═══ CLEANING STAFF DASHBOARD ═══ */}
      {isStaff && effectiveSubRole.includes('Cleaning') && (
        <>
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="Your Cleanings Today" />
            {myShiftsToday.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No cleanings scheduled today
              </div>
            ) : (
              myShiftsToday.map(shift => {
                const prop = PROPERTIES.find(p => p.id === shift.propertyId)
                const tasks = SHIFT_TASKS[shift.type] ?? []
                return (
                  <div key={shift.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                    {prop?.imageUrl && (
                      <img src={prop.imageUrl} alt={prop.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                    )}
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{prop?.name ?? shift.propertyId}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{shift.startTime} – {shift.endTime}</div>

                    {/* Task checklist */}
                    {tasks.slice(0, 4).map((t, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                        <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid var(--border)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t}</span>
                      </div>
                    ))}

                    {/* Access code */}
                    <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Access Code</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.15em', color: showCodes[shift.id] ? 'var(--text-primary)' : 'transparent', textShadow: showCodes[shift.id] ? 'none' : '0 0 8px rgba(255,255,255,0.5)', userSelect: showCodes[shift.id] ? 'text' : 'none' }}>
                          {showCodes[shift.id] ? '4821' : '••••'}
                        </span>
                        <button
                          onClick={() => toggleCode(shift.id)}
                          style={{ fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                        >
                          {showCodes[shift.id] ? 'Hide' : 'Show Code 👁'}
                        </button>
                      </div>
                    </div>

                    <button
                      style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 8, background: accent, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                      Start This Clean →
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Other tasks */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 24 }}>
            <SectionHeader title="Other Tasks Today" />
            {TODAY_TASKS.slice(0, 2).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{t.title}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═══ MAINTENANCE STAFF DASHBOARD ═══ */}
      {isStaff && effectiveSubRole.includes('Maintenance') && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Your Jobs Today" />
          {myJobs.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No jobs assigned today
            </div>
          ) : (
            myJobs.map(job => {
              const jobPTEStatus = grantedPTE[job.id] ? 'granted' : (job.pteStatus ?? 'not_required')
              const pteBadge = getPTEBadge(jobPTEStatus)
              const canShowCode = jobPTEStatus === 'granted' || jobPTEStatus === 'auto_granted' || jobPTEStatus === 'not_required'
              return (
                <div key={job.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: PRIORITY_COLORS[job.priority] + '20', color: PRIORITY_COLORS[job.priority], flexShrink: 0, marginTop: 2 }}>
                      {job.priority.toUpperCase()}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.propertyName} · Due {job.dueTime}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: pteBadge.color + '20', color: pteBadge.color, flexShrink: 0 }}>
                      {pteBadge.icon} {pteBadge.label}
                    </span>
                  </div>

                  {/* Access code */}
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    {canShowCode ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Access Code</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.15em', color: showCodes[job.id] ? 'var(--text-primary)' : 'transparent', textShadow: showCodes[job.id] ? 'none' : '0 0 8px rgba(255,255,255,0.5)' }}>
                              {showCodes[job.id] ? '4821' : '••••'}
                            </span>
                            <button
                              onClick={() => toggleCode(job.id)}
                              style={{ fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                            >
                              {showCodes[job.id] ? 'Hide' : 'Show Code 👁'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706' }}>
                        <span style={{ fontSize: 13 }}>🔒</span>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>Locked until PTE granted</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ═══ GUEST SERVICES DASHBOARD ═══ */}
      {isStaff && effectiveSubRole.includes('Guest') && (
        <>
          {/* Active issues */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <SectionHeader title="Active Issues" href="/app/guest-services" />
            {activeIssues.slice(0, 3).map(issue => (
              <div key={issue.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: issue.severity === 'critical' ? '#dc262620' : issue.severity === 'high' ? '#f8717120' : '#fb923c20', color: issue.severity === 'critical' ? '#dc2626' : issue.severity === 'high' ? '#f87171' : '#fb923c' }}>
                    {issue.severity.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{issue.title}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{issue.propertyName} · {issue.guestName}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${accent}40`, background: 'transparent', color: accent, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>View Task</button>
                  <button style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Contact</button>
                  <button style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Update Guest</button>
                </div>
              </div>
            ))}
          </div>

          {/* PTE requests */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <SectionHeader title="PTE Requests" />
            {pendingPTEJobs.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No pending PTE requests</p>
            ) : (
              pendingPTEJobs.map(job => (
                <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{job.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.propertyName}</div>
                  </div>
                  {grantedPTE[job.id] ? (
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#16a34a' }}>✓ Granted</span>
                  ) : (
                    <button
                      onClick={() => grantPTE(job.id)}
                      style={{ padding: '5px 12px', borderRadius: 6, background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    >
                      Grant PTE
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Check-ins today */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <SectionHeader title="Check-ins Today" />
            {PROPERTIES.filter(p => p.status === 'live').slice(0, 3).map(prop => (
              <div key={prop.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{prop.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prop.city} · 15:00 check-in</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#10b98120', color: '#10b981' }}>Ready</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═══ SHARED SECTIONS (operator + all staff) ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: role === 'operator' ? '1fr 1fr' : '1fr', gap: 24, marginBottom: 24 }}>
        {/* Today's Cleanings */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <SectionHeader title="Today's Cleanings" href="/app/cleaning" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TODAY_CLEANINGS.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.status === 'in_progress' ? accent : '#94a3b8', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.property}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.type} · {c.staff}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.time}</div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <SectionHeader title="Today's Tasks" href="/app/operations" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TODAY_TASKS.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[t.priority] ?? '#94a3b8', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.assignee}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.due}</div>
                <StatusBadge status={t.priority} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: role === 'operator' ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* Overdue */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: 16 }}>
          <SectionHeader title="Overdue" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {OVERDUE.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{o.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.assignee}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#f87171', whiteSpace: 'nowrap' }}>{o.daysOverdue}d overdue</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals — operator only */}
        {role === 'operator' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <SectionHeader title="Pending Approvals" href="/app/tickets" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PENDING_APPROVALS.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.property} · {a.owner}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{a.amount.toLocaleString()} NOK</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Requests */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginTop: 24 }}>
        <SectionHeader title="Recent Requests" href="/app/tickets" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Property', 'Owner', 'Date', 'Status', 'Priority'].map(h => (
                  <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REQUESTS.slice(0, 5).map((r, i) => {
                const prop = PROPERTIES.find(p => p.id === r.propertyId)
                const owner = OWNERS.find(o => o.id === r.ownerId)
                return (
                  <tr key={r.id} style={{ borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{r.title}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{prop?.name ?? r.propertyId}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{owner?.name ?? r.ownerId}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ padding: '10px 12px' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '10px 12px' }}><StatusBadge status={r.priority} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  )
}

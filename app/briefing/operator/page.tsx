'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { UserProfile } from '@/context/RoleContext'
import { SHIFTS } from '@/lib/data/staffScheduling'
import { OVERNIGHT_REPORTS, GUEST_ISSUES, getActiveIssues } from '@/lib/data/guestServices'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import { APPROVALS } from '@/lib/data/approvals'
import { REQUESTS } from '@/lib/data/requests'
import CountdownTimer from '@/components/shared/CountdownTimer'
import {
  getPrefs, savePrefs, resetPrefs,
  TOGGLE_LABELS, ALWAYS_ON,
} from '@/lib/data/briefingPrefs'
import type { BriefingPrefs, BriefingToggles } from '@/lib/data/briefingPrefs'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function OperatorBriefingPage() {
  const router = useRouter()
  const [today, setToday] = useState('')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [prefs, setPrefs] = useState<BriefingPrefs | null>(null)
  const [showToggles, setShowToggles] = useState(false)

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('afterstay_user')
    if (!stored) {
      router.replace('/login')
      return
    }
    try {
      const user: UserProfile = JSON.parse(stored)
      if (user.role !== 'operator' || user.accessTier === 'guest-services') {
        router.replace('/staff/start')
        return
      }
      setCurrentUser(user)
      const loaded = getPrefs(user.id, 'Operator', 'operator')
      setPrefs(loaded)
    } catch {
      router.replace('/login')
    }
  }, [router])

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dateLabel = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const fullDateLabel = `${dayName}, ${dateLabel}`

  if (!mounted || !currentUser) return null

  const firstName = currentUser.name.split(' ')[0]
  const badgeColor = '#7c3aed'

  // Overnight report
  const todayReport = today
    ? (OVERNIGHT_REPORTS.find(r => r.date === today)
        ?? [...OVERNIGHT_REPORTS].sort((a, b) => b.date.localeCompare(a.date))[0])
    : undefined
  const overnightIssues = todayReport?.issues ?? []
  const unassignedOvernightCount = overnightIssues.filter(i => i.status === 'unassigned').length

  // Team status
  const todayShifts = today ? SHIFTS.filter(s => s.date === today) : []
  const staffShiftMap = new Map<string, (typeof todayShifts)[0]>()
  todayShifts.forEach(s => { if (!staffShiftMap.has(s.staffId)) staffShiftMap.set(s.staffId, s) })

  // Active guest issues
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const urgentIssues = activeIssues.filter(i => i.severity === 'critical' || i.severity === 'high')

  // Cleaning overview
  const cleaningShifts = todayShifts.filter(s => s.type === 'cleaning')
  const cleaningProperties = new Set(cleaningShifts.map(s => s.propertyId))
  const tightTurnarounds = cleaningShifts.filter(s => {
    const linkedJobs = JOBS.filter(j => s.jobIds.includes(j.id))
    const jobWithCheckin = linkedJobs.find(j => j.checkinTime && j.checkoutTime)
    if (!jobWithCheckin?.checkinTime || !jobWithCheckin?.checkoutTime) return false
    const [coh, com] = jobWithCheckin.checkoutTime.split(':').map(Number)
    const [cih, cim] = jobWithCheckin.checkinTime.split(':').map(Number)
    return (cih * 60 + cim) - (coh * 60 + com) < 240
  })

  // Maintenance overview
  const maintenanceJobs = JOBS.filter(j => j.type === 'maintenance')
  const urgentMaintenance = maintenanceJobs.filter(j => j.priority === 'urgent')
  const highMaintenance = maintenanceJobs.filter(j => j.priority === 'high')

  // Pending approvals
  const pendingApprovals = APPROVALS

  // Open requests
  const openRequests = REQUESTS.filter(r => r.status !== 'resolved')
  const urgentRequests = openRequests.filter(r => r.priority === 'urgent')

  // Positive empty state check
  const hasUrgentItems = urgentIssues.length > 0 || unassignedOvernightCount > 0 || urgentRequests.length > 0 || urgentMaintenance.length > 0

  const primaryBtnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '18px', borderRadius: 16,
    fontSize: 16, fontWeight: 700, textAlign: 'center',
    border: 'none', cursor: 'pointer', background: badgeColor, color: '#fff',
    textDecoration: 'none',
  }
  const secondaryBtnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '14px', borderRadius: 16,
    fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #1e1445 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f1923 0%, transparent 60%), #0a0f1a',
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
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>AfterStay</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowToggles(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
              fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1,
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
          {/* GREETING */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {getGreeting()}, {firstName} 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${badgeColor}30`, color: badgeColor }}>
                Operator
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{fullDateLabel}</span>
            </div>
          </div>

          {/* FIRST CHECK-IN COUNTDOWN */}
          {prefs?.toggles.firstcheckin && today && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: '28px 24px', marginBottom: 24, textAlign: 'center',
            }}>
              <CountdownTimer
                targetTime={`${today}T15:00:00`}
                label="FIRST CHECK-IN IN"
                context="15:00 · First guest arrival"
              />
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* OVERNIGHT ISSUES */}
            {prefs?.toggles.overnightissues && overnightIssues.length > 0 && (
              <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
                  🌙 {overnightIssues.length} issue{overnightIssues.length !== 1 ? 's' : ''} reported overnight
                </div>
                {overnightIssues.map(issue => (
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

            {/* TEAM STATUS */}
            {prefs?.toggles.teamstatus && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                  Team Status
                </div>
                {(() => {
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
                      const demo = DEMO_STATUS[sm.id]
                      const isClockedIn = demo?.clockedIn ?? false
                      const clockTime = demo?.time
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

            {/* CHECK-IN READINESS */}
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

            {/* CLEANING OVERVIEW */}
            <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                Cleaning Overview
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>{cleaningShifts.length}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Turnovers</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{cleaningProperties.size}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Properties</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: tightTurnarounds.length > 0 ? '#f87171' : '#4ade80' }}>{tightTurnarounds.length}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Tight Turnarounds</div>
                </div>
              </div>
            </div>

            {/* MAINTENANCE OVERVIEW */}
            <div style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                Maintenance Overview
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0ea5e9' }}>{maintenanceJobs.length}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Total Jobs</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: urgentMaintenance.length > 0 ? '#f87171' : '#4ade80' }}>{urgentMaintenance.length}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Urgent</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: highMaintenance.length > 0 ? '#fbbf24' : '#4ade80' }}>{highMaintenance.length}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>High Priority</div>
                </div>
              </div>
            </div>

            {/* GUEST ISSUES SUMMARY */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  Guest Issues
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: activeIssues.length > 0 ? '#ef444420' : '#10b98120', color: activeIssues.length > 0 ? '#f87171' : '#34d399' }}>
                  {activeIssues.length} active
                </span>
                {urgentIssues.length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#dc262620', color: '#f87171' }}>
                    {urgentIssues.length} urgent
                  </span>
                )}
              </div>
              {activeIssues.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {activeIssues.slice(0, 3).map((issue, i) => (
                    <div key={issue.id} style={{ padding: '6px 0', borderBottom: i < Math.min(activeIssues.length, 3) - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{issue.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{issue.propertyName} · {issue.status}</div>
                    </div>
                  ))}
                  {activeIssues.length > 3 && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                      +{activeIssues.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PENDING APPROVALS */}
            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: pendingApprovals.length > 0 ? 12 : 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  Pending Approvals
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pendingApprovals.length > 0 ? '#7c3aed20' : '#10b98120', color: pendingApprovals.length > 0 ? '#a78bfa' : '#34d399' }}>
                  {pendingApprovals.length} pending
                </span>
              </div>
              {pendingApprovals.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No pending approvals</div>
              ) : (
                pendingApprovals.map((approval, i) => (
                  <div key={approval.id} style={{ padding: '8px 0', borderBottom: i < pendingApprovals.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{approval.title}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>
                        {approval.amount.toLocaleString()} {approval.currency}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {approval.property} · {approval.category} · {approval.requestedBy}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* OPEN REQUESTS */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: openRequests.length > 0 ? 12 : 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  Open Requests
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: openRequests.length > 0 ? '#ef444420' : '#10b98120', color: openRequests.length > 0 ? '#f87171' : '#34d399' }}>
                  {openRequests.length} open
                </span>
                {urgentRequests.length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#dc262620', color: '#f87171' }}>
                    {urgentRequests.length} urgent
                  </span>
                )}
              </div>
              {openRequests.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No open requests</div>
              ) : (
                openRequests.slice(0, 4).map((req, i) => (
                  <div key={req.id} style={{ padding: '8px 0', borderBottom: i < Math.min(openRequests.length, 4) - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: req.priority === 'urgent' ? '#ef444420' : req.priority === 'high' ? '#d9770620' : '#ffffff10', color: req.priority === 'urgent' ? '#f87171' : req.priority === 'high' ? '#fbbf24' : 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                        {req.priority}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{req.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {PROPERTIES.find(p => p.id === req.propertyId)?.name ?? req.propertyId} · {req.type} · {req.status}
                    </div>
                  </div>
                ))
              )}
              {openRequests.length > 4 && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                  +{openRequests.length - 4} more
                </div>
              )}
            </div>

            {/* POSITIVE EMPTY STATE */}
            {!hasUrgentItems && (
              <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 16, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#4ade80' }}>Zero messages needed. Team is running.</span>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <Link href="/app/dashboard" style={primaryBtnStyle}>
                Go to Dashboard →
              </Link>
              <Link href="/app/guest-services" style={secondaryBtnStyle}>
                Guest Services →
              </Link>
            </div>

          </motion.div>
        </motion.div>
      </div>

      {/* TOGGLE PANEL */}
      <AnimatePresence>
        {showToggles && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowToggles(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: '#111827', borderTop: '1px solid #1f2937',
                borderRadius: '16px 16px 0 0', padding: 24,
                zIndex: 101, maxHeight: '80vh', overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#f9fafb' }}>Briefing Preferences</span>
                <button onClick={() => setShowToggles(false)} style={{ color: '#6b7280', fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>

              {prefs && Object.entries(TOGGLE_LABELS)
                .filter(([key, meta]) =>
                  !ALWAYS_ON.includes(key as keyof BriefingToggles) &&
                  (meta.roles.includes('all') || meta.roles.includes('operator'))
                )
                .map(([key, meta]) => {
                  const toggleKey = key as keyof BriefingToggles
                  const isOn = prefs.toggles[toggleKey]
                  return (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1f2937' }}>
                      <div>
                        <div style={{ color: '#f9fafb', fontSize: 14, fontWeight: 500 }}>{meta.label}</div>
                        <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{meta.description}</div>
                      </div>
                      <div
                        onClick={() => {
                          const updated: BriefingPrefs = { ...prefs, toggles: { ...prefs.toggles, [toggleKey]: !isOn } }
                          setPrefs(updated)
                          savePrefs(updated)
                        }}
                        style={{ width: 44, height: 24, borderRadius: 12, background: isOn ? badgeColor : '#374151', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, marginLeft: 16 }}
                      >
                        <div style={{ position: 'absolute', top: 2, left: isOn ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                      </div>
                    </div>
                  )
                })
              }

              <button
                onClick={() => {
                  if (!currentUser) return
                  const reset = resetPrefs(currentUser.id, 'Operator', 'operator')
                  setPrefs(reset)
                }}
                style={{ marginTop: 20, width: '100%', padding: '10px', background: 'none', border: '1px solid #374151', borderRadius: 8, color: '#6b7280', fontSize: 13, cursor: 'pointer' }}
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

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { UserProfile } from '@/context/RoleContext'
import { SHIFTS } from '@/lib/data/staffScheduling'
import type { Shift } from '@/lib/data/staffScheduling'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS } from '@/lib/data/staff'
import { OVERNIGHT_REPORTS, GUEST_ISSUES, getActiveIssues } from '@/lib/data/guestServices'
import CountdownTimer from '@/components/shared/CountdownTimer'
import {
  getPrefs, savePrefs, resetPrefs,
  TOGGLE_LABELS, ALWAYS_ON,
} from '@/lib/data/briefingPrefs'
import type { BriefingPrefs, BriefingToggles } from '@/lib/data/briefingPrefs'

const USER_TO_STAFF: Record<string, string> = {
  'u5': 's4',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function GuestServicesBriefingPage() {
  const router = useRouter()
  const [today, setToday] = useState('')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [myShiftsToday, setMyShiftsToday] = useState<Shift[]>([])
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
      const isGS = (user.role === 'operator' && user.accessTier === 'guest-services') ||
                   user.jobRole === 'guest-services' as string || user.subRole?.includes('Guest')
      if (!isGS) {
        router.replace('/staff/start')
        return
      }
      setCurrentUser(user)
      const loaded = getPrefs(user.id, 'Guest Services', 'staff')
      setPrefs(loaded)
    } catch {
      router.replace('/login')
      return
    }

  }, [])

  useEffect(() => {
    if (!today || !currentUser) return
    const staffId = USER_TO_STAFF[currentUser.id]
    if (staffId) {
      setMyShiftsToday(SHIFTS.filter(s => s.staffId === staffId && s.date === today))
    }
  }, [today, currentUser])

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dateLabel = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const fullDateLabel = `${dayName}, ${dateLabel}`

  if (!mounted || !currentUser) return null

  const firstName = currentUser.name.split(' ')[0]
  const badgeColor = '#10b981'

  const sortedShifts = [...myShiftsToday].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const firstShift = sortedShifts[0] ?? null

  const shiftTargetTime = firstShift && today
    ? `${today}T${firstShift.startTime}:00`
    : today ? `${today}T09:00:00` : ''

  const staffId = USER_TO_STAFF[currentUser.id]

  // Today's check-ins: guest_services jobs + standby shifts
  const checkInJobs = JOBS.filter(j => j.staffId === staffId && j.type === 'guest_services')
  const standbyShifts = myShiftsToday.filter(s => s.type === 'standby')

  // Overnight report (latest)
  const latestReport = OVERNIGHT_REPORTS[0] ?? null
  const overnightIssues = latestReport?.issues ?? []

  // Active guest issues
  const activeIssues = getActiveIssues(GUEST_ISSUES)

  // PTE requests pending
  const pteRequests = JOBS.filter(j => j.staffId === staffId && j.pteRequired && j.pteStatus === 'pending')

  // Needs action: unresolved overnight issues + urgent active issues
  const needsActionItems = [
    ...overnightIssues.filter(i => i.status === 'unassigned'),
    ...activeIssues.filter(i => i.severity === 'critical' || i.severity === 'high').slice(0, 3),
  ]

  const handleClockInAndGo = (destination = '/app/my-guest-services') => {
    localStorage.setItem('afterstay_clockin', JSON.stringify({
      staffId: currentUser.id,
      shiftId: firstShift?.id ?? 'unknown',
      date: today,
      clockInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      clockInTimestamp: Date.now(),
      status: 'in_progress',
    }))
    router.push(destination)
  }

  const primaryBtnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '18px', borderRadius: 16,
    fontSize: 16, fontWeight: 700, textAlign: 'center',
    border: 'none', cursor: 'pointer', background: badgeColor, color: '#fff',
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
      background: 'radial-gradient(ellipse at 20% 50%, #052e20 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f1923 0%, transparent 60%), #0a0f1a',
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
                Guest Services
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{fullDateLabel}</span>
            </div>
          </div>

          {/* COUNTDOWN — always on */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '28px 24px', marginBottom: 24, textAlign: 'center',
          }}>
            {firstShift && shiftTargetTime ? (
              <CountdownTimer
                targetTime={shiftTargetTime}
                label="YOUR SHIFT STARTS IN"
                context={`${PROPERTIES.find(p => p.id === firstShift.propertyId)?.name ?? firstShift.propertyId} · ${firstShift.startTime} – ${firstShift.endTime}`}
              />
            ) : (
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', padding: '8px 0' }}>
                No shift scheduled today
              </div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* TASKS TODAY */}
            {prefs?.toggles.propertiestoday && (
              checkInJobs.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  No tasks scheduled today
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                    Tasks Today
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {checkInJobs.map((job) => (
                      <div key={job.id} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12, padding: '14px 16px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{job.title}</div>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: job.status === 'done' ? 'rgba(16,185,129,0.15)' : job.status === 'in_progress' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.08)',
                            color: job.status === 'done' ? '#34d399' : job.status === 'in_progress' ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                            textTransform: 'uppercase',
                          }}>
                            {job.status === 'in_progress' ? 'In Progress' : job.status === 'done' ? 'Complete' : 'Pending'}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
                          {job.propertyName}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                          {job.dueTime ? `Due: ${job.dueTime}` : ''}
                          {job.reservation?.guestName ? `${job.dueTime ? ' · ' : ''}Guest: ${job.reservation.guestName}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            )}

            {/* OVERNIGHT ISSUES */}
            {prefs?.toggles.overnightissues && (
              <div style={{ background: overnightIssues.length > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.05)', border: `1px solid ${overnightIssues.length > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: overnightIssues.length > 0 ? 12 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                    Overnight Issues
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: overnightIssues.length > 0 ? '#ef444420' : '#10b98120', color: overnightIssues.length > 0 ? '#f87171' : '#34d399' }}>
                    {overnightIssues.length} {overnightIssues.length === 1 ? 'issue' : 'issues'}
                  </span>
                </div>
                {overnightIssues.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>All clear overnight</div>
                ) : (
                  overnightIssues.map((issue, i) => (
                    <div key={issue.id} style={{ padding: '8px 0', borderBottom: i < overnightIssues.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: issue.severity === 'high' || issue.severity === 'critical' ? '#ef444420' : '#d9770620', color: issue.severity === 'high' || issue.severity === 'critical' ? '#f87171' : '#fbbf24', textTransform: 'uppercase' }}>
                          {issue.severity}
                        </span>
                        <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{issue.title}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {issue.property} · {issue.time} · {issue.status === 'unassigned' ? '⚠️ Unassigned' : issue.assignedTo ?? 'Assigned'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TODAY'S CHECK-INS */}
            {prefs?.toggles.checkins && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: checkInJobs.length + standbyShifts.length > 0 ? 12 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                    {"Today's Check-ins"}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#10b98120', color: '#34d399' }}>
                    {checkInJobs.length + standbyShifts.length} arrival{checkInJobs.length + standbyShifts.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {checkInJobs.length + standbyShifts.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>No check-ins scheduled today</div>
                ) : (
                  <>
                    {checkInJobs.map((job, i) => (
                      <div key={job.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{job.propertyName}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                          {job.checkinTime ? `Arrival: ${job.checkinTime}` : job.dueTime ? `Due: ${job.dueTime}` : 'Time TBD'}
                          {job.reservation?.guestName ? ` · ${job.reservation.guestName}` : ''}
                        </div>
                      </div>
                    ))}
                    {standbyShifts.map((shift, i) => {
                      const prop = PROPERTIES.find(p => p.id === shift.propertyId)
                      return (
                        <div key={shift.id} style={{ padding: '8px 0', borderBottom: i < standbyShifts.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{prop?.name ?? shift.propertyId}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                            Standby · {shift.startTime} – {shift.endTime}
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )}

            {/* ACTIVE ISSUES */}
            {prefs?.toggles.activeissues && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                    Active Issues
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: activeIssues.length > 0 ? '#ef444420' : '#10b98120', color: activeIssues.length > 0 ? '#f87171' : '#34d399' }}>
                    {activeIssues.length} open
                  </span>
                  {activeIssues.filter(i => i.severity === 'critical').length > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#dc262620', color: '#f87171' }}>
                      {activeIssues.filter(i => i.severity === 'critical').length} urgent
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
            )}

            {/* PTE REQUESTS */}
            {prefs?.toggles.pterequest && (
              <div style={{ background: pteRequests.length > 0 ? 'rgba(217,119,6,0.06)' : 'rgba(255,255,255,0.05)', border: `1px solid ${pteRequests.length > 0 ? 'rgba(217,119,6,0.25)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: pteRequests.length > 0 ? 12 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                    PTE Requests
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pteRequests.length > 0 ? '#d9770620' : '#10b98120', color: pteRequests.length > 0 ? '#fbbf24' : '#34d399' }}>
                    {pteRequests.length} pending
                  </span>
                </div>
                {pteRequests.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>No pending PTE requests</div>
                ) : (
                  pteRequests.map((job, i) => (
                    <div key={job.id} style={{ padding: '8px 0', borderBottom: i < pteRequests.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{job.propertyName}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {job.title} · {job.pte?.guestName ? `Guest: ${job.pte.guestName}` : 'Guest contact needed'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* NEEDS ACTION */}
            {prefs?.toggles.needsaction && needsActionItems.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f87171', marginBottom: 10 }}>
                  Needs Action ({needsActionItems.length})
                </div>
                {'severity' in needsActionItems[0] ? null : null}
                {needsActionItems.slice(0, 4).map((item, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', padding: '5px 0', borderBottom: i < Math.min(needsActionItems.length, 4) - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    {'property' in item
                      ? `⚠️ ${(item as { property: string; title: string }).property} — ${(item as { title: string }).title}`
                      : `🔴 ${'propertyName' in item ? (item as { propertyName: string; title: string }).propertyName : ''} — ${'title' in item ? (item as { title: string }).title : ''}`
                    }
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleClockInAndGo('/app/my-guest-services')}
                style={primaryBtnStyle}
              >
                ▶ Clock In Now
              </button>
              <Link href="/app/dashboard" style={secondaryBtnStyle}>
                View Full Dashboard
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
                  (meta.roles.includes('all') || meta.roles.includes('Guest Services'))
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
                  const reset = resetPrefs(currentUser.id, 'Guest Services', 'staff')
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

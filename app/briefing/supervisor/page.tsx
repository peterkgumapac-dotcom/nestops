'use client'
import { useState, useEffect } from 'react'

type PulseStatus = 'at_risk' | 'blocked' | 'complete' | 'ok'
type PulseEvent = {
  id: string
  actor: string
  action: string
  property: string
  status: PulseStatus
  type: 'staff_late' | 'property_blocked' | 'checkin_at_risk' | 'task_complete' | 'other'
  time: string
}
const PULSE_EVENTS: PulseEvent[] = [
  { id: 'p1', actor: 'Maria L.', action: 'running late (20m)', property: 'Harbor Studio', status: 'at_risk', type: 'staff_late', time: '9:42' },
  { id: 'p2', actor: 'Carlos R.', action: 'flagged property', property: 'Skyline Loft 3B', status: 'blocked', type: 'property_blocked', time: '9:35' },
  { id: 'p3', actor: 'Ana T.', action: 'check-in at risk', property: 'Ocean Villa', status: 'at_risk', type: 'checkin_at_risk', time: '9:28' },
  { id: 'p4', actor: 'Jin P.', action: 'completed clean', property: 'Sunset Suite', status: 'complete', type: 'task_complete', time: '9:14' },
]
type PulseTab = 'all' | 'at_risk' | 'blocked' | 'complete'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { UserProfile } from '@/context/RoleContext'
import { SHIFTS } from '@/lib/data/staffScheduling'
import { STAFF_MEMBERS, JOBS } from '@/lib/data/staff'
import { UPSELL_APPROVAL_REQUESTS } from '@/lib/data/upsellApprovals'
import { PROPERTIES } from '@/lib/data/properties'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function SupervisorBriefingPage() {
  const router = useRouter()
  const [today, setToday] = useState('')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [pulseTab, setPulseTab] = useState<PulseTab>('all')

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
      if (user.jobRole !== 'supervisor' && !user.subRole?.includes('Supervisor')) {
        router.replace('/staff/start')
        return
      }
      setCurrentUser(user)
    } catch {
      router.replace('/login')
    }
  }, [])

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dateLabel = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const fullDateLabel = `${dayName}, ${dateLabel}`

  if (!mounted || !currentUser) return null

  const firstName = currentUser.name.split(' ')[0]
  const badgeColor = '#06b6d4'

  // Team status — staff on shift today
  const staffOnShiftToday = today
    ? SHIFTS.filter(s => s.date === today).map(s => s.staffId)
    : []
  const uniqueStaffOnShift = [...new Set(staffOnShiftToday)]
  const activeStaff = STAFF_MEMBERS.filter(s => uniqueStaffOnShift.includes(s.id))

  // Today's cleanings
  const todaysCleanings = today
    ? SHIFTS.filter(s => s.date === today && s.type === 'cleaning')
    : []

  // Upsell approvals pending supervisor
  const pendingUpsells = UPSELL_APPROVAL_REQUESTS.filter(
    u => u.status === 'pending_supervisor' || u.escalatedToSupervisor
  )

  // Jobs in progress / pending today
  const todaysJobs = JOBS.filter(j => j.type === 'cleaning' && j.status !== 'done')

  const primaryBtnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '18px', borderRadius: 16,
    fontSize: 16, fontWeight: 700, textAlign: 'center',
    border: 'none', cursor: 'pointer', background: badgeColor, color: '#fff',
  }
  const secondaryBtnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '14px', borderRadius: 16,
    fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.6)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #0c2a3f 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f1923 0%, transparent 60%), #0a0f1a',
      position: 'relative',
    }}>
      {/* Header */}
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
        <Link href="/app/dashboard" style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          Dashboard →
        </Link>
      </div>

      {/* Main */}
      <div style={{ padding: '72px 20px 60px', maxWidth: 600, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {getGreeting()}, {firstName} 👷
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${badgeColor}30`, color: badgeColor }}>
                Supervisor
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{fullDateLabel}</span>
            </div>
          </div>

          {/* Day at a glance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Staff Active', value: activeStaff.length, color: badgeColor },
              { label: 'Cleanings', value: todaysCleanings.length, color: '#10b981' },
              { label: 'Upsell Queue', value: pendingUpsells.length, color: pendingUpsells.length > 0 ? '#f59e0b' : '#6b7280' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* Pulse */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Pulse</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['all', 'at_risk', 'blocked', 'complete'] as PulseTab[]).map(tab => {
                    const active = pulseTab === tab
                    return (
                      <button key={tab} onClick={() => setPulseTab(tab)} style={{
                        padding: '3px 10px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)',
                        background: active ? '#ffffff' : 'transparent',
                        color: active ? '#0a0f1a' : 'rgba(255,255,255,0.6)',
                        fontSize: 11, fontWeight: active ? 600 : 500, cursor: 'pointer', textTransform: 'capitalize',
                      }}>
                        {tab === 'at_risk' ? 'At Risk' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )
                  })}
                </div>
              </div>
              {PULSE_EVENTS
                .filter(e => pulseTab === 'all' ? true : e.status === pulseTab)
                .map((e, i, arr) => {
                  const isUrgent = e.status === 'blocked' || e.status === 'at_risk'
                  const statusColor = e.status === 'blocked' ? '#f59e0b'
                    : e.status === 'at_risk' ? 'rgba(255,255,255,0.65)'
                    : e.status === 'complete' ? '#10b981' : 'rgba(255,255,255,0.5)'
                  const actions: { label: string; onClick?: () => void }[] =
                    e.type === 'staff_late' ? [{ label: 'Send Reminder' }, { label: 'Reassign' }]
                    : e.type === 'property_blocked' ? [{ label: 'Flag property' }]
                    : e.type === 'checkin_at_risk' ? [{ label: 'Reassign cleaner' }]
                    : e.type === 'task_complete' ? [{ label: 'Verify' }]
                    : []
                  return (
                    <div key={e.id} style={{
                      display: 'flex', flexDirection: 'column', gap: 6,
                      padding: '10px 10px 10px 12px',
                      borderLeft: isUrgent ? '2px solid #f59e0b' : '2px solid transparent',
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4 }}>
                          <span style={{ fontWeight: 600 }}>{e.actor}</span>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}> {e.action} — </span>
                          <span style={{ fontWeight: 600 }}>{e.property}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--n-mono)', flexShrink: 0 }}>{e.time}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: `${statusColor}22`, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {e.status.replace('_', ' ')}
                        </span>
                        {actions.map(a => (
                          <button key={a.label} style={{
                            padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.18)',
                            background: 'transparent', color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                          }}>
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Staff on shift today */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                Team on Shift Today
              </div>
              {activeStaff.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No staff shifts found for today</div>
              ) : (
                activeStaff.map((member, i) => {
                  const memberShifts = today ? SHIFTS.filter(s => s.staffId === member.id && s.date === today) : []
                  const firstShift = memberShifts[0]
                  const property = firstShift ? PROPERTIES.find(p => p.id === firstShift.propertyId) : null
                  return (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < activeStaff.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: badgeColor + '30', border: `1px solid ${badgeColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: badgeColor, flexShrink: 0 }}>
                        {member.initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{member.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                          {member.role}
                          {firstShift ? ` · ${firstShift.startTime}–${firstShift.endTime}` : ''}
                          {property ? ` · ${property.name}` : ''}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#10b98120', color: '#34d399' }}>
                        Active
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Today's cleanings */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                {"Today's Cleanings"} ({todaysCleanings.length})
              </div>
              {todaysCleanings.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No cleanings scheduled today</div>
              ) : (
                todaysCleanings.slice(0, 5).map((shift, i) => {
                  const property = PROPERTIES.find(p => p.id === shift.propertyId)
                  const staff = STAFF_MEMBERS.find(s => s.id === shift.staffId)
                  return (
                    <div key={shift.id} style={{ padding: '7px 0', borderBottom: i < Math.min(todaysCleanings.length, 5) - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{property?.name ?? shift.propertyId}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        {shift.startTime}–{shift.endTime} · {staff?.name ?? shift.staffId}
                      </div>
                    </div>
                  )
                })
              )}
              {todaysCleanings.length > 5 && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>+{todaysCleanings.length - 5} more</div>
              )}
            </div>

            {/* Upsell approvals queue */}
            <div style={{
              background: pendingUpsells.length > 0 ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${pendingUpsells.length > 0 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 16, padding: '16px', marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: pendingUpsells.length > 0 ? 12 : 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                  Upsell Approvals
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pendingUpsells.length > 0 ? '#f59e0b20' : '#10b98120', color: pendingUpsells.length > 0 ? '#fbbf24' : '#34d399' }}>
                  {pendingUpsells.length} pending
                </span>
              </div>
              {pendingUpsells.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>No upsell approvals needed</div>
              ) : (
                pendingUpsells.map((req, i) => (
                  <div key={req.id} style={{ padding: '8px 0', borderBottom: i < pendingUpsells.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{req.upsellTitle}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                          {req.propertyName} · {req.guestName} · ${req.price}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: '#f59e0b20', color: '#fbbf24', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        Review
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/app/my-tasks" style={primaryBtnStyle}>
                ▶ View Team Dashboard
              </Link>
              <Link href="/app/upsells" style={secondaryBtnStyle}>
                Review Upsell Approvals →
              </Link>
            </div>

          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

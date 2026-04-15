'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { UserProfile } from '@/context/RoleContext'
import { SHIFTS } from '@/lib/data/staffScheduling'
import type { Shift } from '@/lib/data/staffScheduling'
import { PROPERTY_WEATHER } from '@/lib/data/weather'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS } from '@/lib/data/staff'
import CountdownTimer from '@/components/shared/CountdownTimer'
import { MaintenanceTaskCard } from '@/components/tasks/maintenance/MaintenanceTaskCard'
import {
  getPrefs, savePrefs, resetPrefs,
  TOGGLE_LABELS, ALWAYS_ON,
} from '@/lib/data/briefingPrefs'
import { sortJobsByAccessibility } from '@/lib/utils/pteUtils'
import type { BriefingPrefs, BriefingToggles } from '@/lib/data/briefingPrefs'

const USER_TO_STAFF: Record<string, string> = {
  'u4': 's3',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function MaintenanceBriefingPage() {
  const router = useRouter()
  const [today, setToday] = useState('')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [myShiftsToday, setMyShiftsToday] = useState<Shift[]>([])
  const [mounted, setMounted] = useState(false)
  const [prefs, setPrefs] = useState<BriefingPrefs | null>(null)
  const [showToggles, setShowToggles] = useState(false)
  const [accessCodeVisible, setAccessCodeVisible] = useState<Record<string, boolean>>({})

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
      if (user.jobRole !== 'maintenance' && !user.subRole?.includes('Maintenance')) {
        router.replace('/staff/start')
        return
      }
      setCurrentUser(user)
      const loaded = getPrefs(user.id, 'Maintenance', 'staff')
      setPrefs(loaded)
    } catch {
      router.replace('/login')
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
  const badgeColor = '#0ea5e9'

  const sortedShifts = [...myShiftsToday].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const firstShift = sortedShifts[0] ?? null
  const weatherPropertyId = firstShift?.propertyId ?? 'p1'
  const weatherData = PROPERTY_WEATHER.find(w => w.propertyId === weatherPropertyId) ?? PROPERTY_WEATHER[0]

  const shiftTargetTime = firstShift && today
    ? `${today}T${firstShift.startTime}:00`
    : today ? `${today}T08:00:00` : ''

  const staffId = USER_TO_STAFF[currentUser.id]
  const myJobs = staffId
    ? (() => {
        const sorted = sortJobsByAccessibility(JOBS.filter(j => j.staffId === staffId))
        // Pulse requirement: Urgent → Today → Earlier. Stable-sort urgent to the top.
        const urgencyRank = (j: typeof sorted[number]) =>
          (j as { priority?: string }).priority === 'urgent' ? 0 : 1
        return [...sorted].sort((a, b) => urgencyRank(a) - urgencyRank(b))
      })()
    : []

  const handleClockInAndGo = (destination = '/app/my-tasks') => {
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
      background: 'radial-gradient(ellipse at 20% 50%, #0c2a40 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f1923 0%, transparent 60%), #0a0f1a',
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
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13 }}>N</div>
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
                Maintenance
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{fullDateLabel}</span>
            </div>
            {/* Weather */}
            {prefs?.toggles.weather && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{weatherData.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{weatherData.temperature}°C</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{weatherData.location} · {weatherData.note ?? weatherData.condition.replace('_', ' ')}</span>
              </div>
            )}
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

            {/* JOBS TODAY */}
            {prefs?.toggles.propertiestoday && (
              myJobs.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  No jobs scheduled today
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                    Jobs Today
                  </div>
                  {myJobs.map((job) => (
                    <MaintenanceTaskCard
                      key={job.id}
                      job={job}
                      showPteStatus={true}
                      showLocation={prefs?.toggles.jobLocation}
                      showAccessCode={prefs?.toggles.accesstype}
                      codeVisible={accessCodeVisible[job.id] ?? false}
                      onToggleCode={() => setAccessCodeVisible(prev => ({ ...prev, [job.id]: true }))}
                    />
                  ))}
                  {prefs?.toggles.routingHint && (() => {
                    const firstPending = myJobs.find(j => j.pteStatus === 'pending')
                    const firstReady   = myJobs.find(j => j.pteStatus === 'auto_granted' || j.pteStatus === 'granted')
                    if (!firstPending || !firstReady) return null
                    return (
                      <div style={{ fontSize: 13, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 14px', marginTop: 4 }}>
                        💡 Do <strong>{firstReady.propertyName}</strong> first while waiting for PTE on{' '}
                        <strong>{firstPending.propertyName}</strong>
                      </div>
                    )
                  })()}
                </>
              )
            )}

            {/* OTHER TASKS */}
            {prefs?.toggles.othertasks && (
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                  Other Tasks Today
                </div>
                {[
                  'Check smoke detectors — Harbor Studio · Before 10:00',
                  'Pick up replacement parts — Warehouse · After first job',
                ].map((task, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{task}</span>
                  </div>
                ))}
              </div>
            )}

            {/* THIS WEEK */}
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
                    <div key={d.day} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: d.state === 'today' ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.04)', border: d.state === 'today' ? '1px solid rgba(14,165,233,0.4)' : '1px solid transparent' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{d.day}</div>
                      <div style={{ fontSize: 13 }}>{d.state === 'done' ? '✓' : d.state === 'today' ? '●' : '○'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* JOBS queue link */}
            {myJobs.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  {myJobs.length} job{myJobs.length !== 1 ? 's' : ''} in your queue today
                </span>
                <Link href="/app/my-tasks" style={{ fontSize: 13, color: badgeColor, fontWeight: 600, textDecoration: 'none', marginLeft: 'auto' }}>
                  View all →
                </Link>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleClockInAndGo('/app/my-tasks')}
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
                  (meta.roles.includes('all') || meta.roles.includes('Maintenance'))
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
                  const reset = resetPrefs(currentUser.id, 'Maintenance', 'staff')
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

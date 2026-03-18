'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { SHIFTS, type Shift } from '@/lib/data/staffScheduling'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS } from '@/lib/data/staff'
import { getPTEBadge } from '@/lib/utils/pteUtils'
import type { UserProfile } from '@/context/RoleContext'

const USER_TO_STAFF: Record<string, string> = {
  'u3': 's1',
  'u4': 's3',
  'u5': 's2',
}

const SHIFT_TYPE_LABEL: Record<string, string> = {
  cleaning: 'Turnover Clean',
  maintenance: 'Maintenance',
  inspection: 'Inspection',
  intake: 'Property Intake',
  standby: 'On Standby',
}

const SHIFT_TASKS: Record<string, string[]> = {
  cleaning: [
    'Strip and replace all bed linens',
    'Clean and disinfect all bathrooms',
    'Vacuum and mop all floors',
    'Wipe kitchen surfaces and appliances',
    'Restock toiletries and consumables',
    'Check and report any damage',
    'Take before/after photos',
    'Lock up and confirm access code',
  ],
  maintenance: [
    'Diagnose and document the issue',
    'Take photos of problem area',
    'Complete repair',
    'Test fix is working',
    'Clean up work area',
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

const CONFETTI_COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#8b5cf6']

export default function StaffStartPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [todayShift, setTodayShift] = useState<Shift | null>(null)
  const [clocked, setClocked] = useState(false)
  const [clockTime, setClockTime] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})

  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  useEffect(() => {
    router.push('/app/dashboard')
  }, [router])

  useEffect(() => {
    setMounted(true)
    const now = new Date()
    setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))

    const stored = localStorage.getItem('nestops_user')
    if (!stored) {
      router.push('/login')
      return
    }
    try {
      const user: UserProfile = JSON.parse(stored)
      setCurrentUser(user)
      const staffId = USER_TO_STAFF[user.id]
      if (staffId) {
        const today = new Date().toISOString().split('T')[0]
        const shift = SHIFTS.find(s => s.staffId === staffId && s.date === today) ?? null
        setTodayShift(shift)
      }
    } catch {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    }, 1000)
    return () => clearInterval(interval)
  }, [mounted])

  const handleClockIn = () => {
    if (!currentUser || !todayShift) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    localStorage.setItem('nestops_clockin', JSON.stringify({
      staffId: USER_TO_STAFF[currentUser.id] ?? currentUser.id,
      shiftId: todayShift.id,
      propertyId: todayShift.propertyId,
      date: now.toISOString().split('T')[0],
      clockInTime: now.toISOString(),
      status: 'in_progress',
    }))
    setClocked(true)
    setClockTime(timeStr)
    setShowConfetti(true)
    setTimeout(() => router.push('/app/dashboard'), 1500)
  }

  const property = todayShift ? PROPERTIES.find(p => p.id === todayShift.propertyId) : null
  const propertyName = property?.name ?? 'Property'
  const propertyImage = property?.imageUrl ?? ''

  const tasks = todayShift ? (SHIFT_TASKS[todayShift.type] ?? []) : []

  const duration = todayShift
    ? (() => {
        const [sh, sm] = todayShift.startTime.split(':').map(Number)
        const [eh, em] = todayShift.endTime.split(':').map(Number)
        return ((eh * 60 + em) - (sh * 60 + sm)) / 60
      })()
    : 0

  const unconfirmedCount = currentUser
    ? SHIFTS.filter(s => s.staffId === (USER_TO_STAFF[currentUser.id] ?? '') && s.status === 'scheduled').length
    : 0

  // Compute late status for clock status bar
  const today = new Date().toISOString().split('T')[0]
  const minutesUntilShift = todayShift
    ? (() => {
        const shiftMs = new Date(`${today}T${todayShift.startTime}:00`).getTime()
        return (shiftMs - Date.now()) / 60000
      })()
    : Infinity

  const isLate = todayShift && minutesUntilShift < -15

  // Maintenance jobs for this staff
  const staffId = currentUser ? USER_TO_STAFF[currentUser.id] : null
  const myJobs = staffId ? JOBS.filter(j => j.staffId === staffId) : []
  const isMaintenance = currentUser?.subRole?.includes('Maintenance') ?? false

  const toggleCode = (id: string) => setShowCodes(prev => ({ ...prev, [id]: !prev[id] }))

  if (!mounted) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #1e3a5f 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #7c3aed 0%, transparent 60%), #0f1923',
      position: 'relative',
    }}>
      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: 'rgba(15, 25, 35, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13 }}>N</div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>NestOps</span>
        </div>
        <Link href="/app/dashboard" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
          Skip →
        </Link>
      </div>

      {/* Center content */}
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', paddingTop: 76,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            maxWidth: 440, width: '100%',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: 32,
            position: 'relative',
          }}
        >
          {/* Confetti */}
          <AnimatePresence>
            {showConfetti && CONFETTI_COLORS.map((color, i) => {
              const angle = (i / CONFETTI_COLORS.length) * Math.PI * 2
              const distance = 80 + Math.random() * 40
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, opacity: 0, scale: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.02 }}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 8, height: 8, borderRadius: '50%',
                    background: color, pointerEvents: 'none', zIndex: 20,
                  }}
                />
              )
            })}
          </AnimatePresence>

          {/* Clock status bar */}
          {todayShift && (
            <div style={{
              marginBottom: 20,
              padding: '10px 14px',
              borderRadius: 10,
              ...(isLate
                ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }
                : minutesUntilShift > 0
                  ? { background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.3)' }
                  : { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }),
            }}>
              {isLate ? (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontSize: 12, fontWeight: 600, color: '#f87171' }}
                >
                  🔴 You are late — shift started at {todayShift.startTime}
                </motion.div>
              ) : (
                <div style={{ fontSize: 12, fontWeight: 500, color: '#fbbf24' }}>
                  ○ Shift starts at {todayShift.startTime} · {propertyName}
                </div>
              )}
            </div>
          )}

          {/* Greeting */}
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Good {timeOfDay}, {currentUser?.name?.split(' ')[0]} 👋
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#d9770630', color: '#d97706' }}>
              {currentUser?.subRole ?? 'Staff'}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>

          {todayShift ? (
            <>
              {/* Property image */}
              {propertyImage && (
                <img
                  src={propertyImage}
                  alt={propertyName}
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }}
                />
              )}

              {/* Shift card */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{propertyName}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed', marginBottom: 8 }}>
                  {todayShift.startTime} – {todayShift.endTime}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: '#7c3aed30', color: '#c4b5fd' }}>
                    {SHIFT_TYPE_LABEL[todayShift.type] ?? todayShift.type}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {duration}h scheduled
                  </span>
                </div>
              </div>

              {/* Tasks preview */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Today&apos;s tasks:</div>
                {tasks.slice(0, 3).map((task, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{task}</span>
                  </div>
                ))}
                {tasks.length > 3 && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 26 }}>
                    +{tasks.length - 3} more tasks
                  </div>
                )}
              </div>

              {/* Maintenance: job cards with PTE */}
              {isMaintenance && myJobs.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Your jobs:</div>
                  {myJobs.map(job => {
                    const jobPTEStatus = job.pteStatus ?? 'not_required'
                    const pteBadge = getPTEBadge(jobPTEStatus)
                    const canShowCode = jobPTEStatus === 'granted' || jobPTEStatus === 'auto_granted' || jobPTEStatus === 'not_required'
                    return (
                      <div key={job.id} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{job.title}</div>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: pteBadge.color + '20', color: pteBadge.color }}>
                            {pteBadge.icon} {pteBadge.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{job.propertyName}</div>
                        {canShowCode ? (
                          <button
                            onClick={() => toggleCode(job.id)}
                            style={{ fontSize: 12, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                          >
                            {showCodes[job.id] ? `Code: 4821` : 'Show Code 👁'}
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#d97706' }}>🔒 Locked until PTE granted</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Unconfirmed shifts alert */}
              {unconfirmedCount > 0 && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#fbbf24' }}>⚠ {unconfirmedCount} shifts this week need confirmation</span>
                  <Link href="/app/team" style={{ fontSize: 11, color: '#fbbf24', textDecoration: 'none', fontWeight: 600 }}>View schedule →</Link>
                </div>
              )}

              {/* Clock in button */}
              <AnimatePresence mode="wait">
                {!clocked ? (
                  <motion.button
                    key="start"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClockIn}
                    style={{
                      width: '100%', padding: '20px', borderRadius: 16,
                      background: '#7c3aed', color: 'white', fontSize: 18, fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                      marginTop: 8,
                    }}
                  >
                    ▶ Start Shift
                  </motion.button>
                ) : (
                  <motion.div
                    key="clocked"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      width: '100%', padding: '20px', borderRadius: 16,
                      background: '#10b981', color: 'white', fontSize: 18, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                      marginTop: 8,
                    }}
                  >
                    ✓ Clocked in at {clockTime}
                  </motion.div>
                )}
              </AnimatePresence>

              {!clocked && (
                <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                  Clock in at {currentTime}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌙</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No shift scheduled today</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Check your schedule for upcoming shifts</p>
              <button
                onClick={() => router.push('/app/dashboard')}
                style={{ padding: '14px 28px', borderRadius: 12, background: '#7c3aed', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Go to Dashboard
              </button>
              <div style={{ marginTop: 14 }}>
                <Link href="/app/team" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>View My Schedule →</Link>
              </div>
            </div>
          )}

          {/* Back to Briefing */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/briefing" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 8, display: 'inline-block' }}>
              ← Back to Briefing
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

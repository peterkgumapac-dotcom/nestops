'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { SHIFTS, type Shift } from '@/lib/data/staffScheduling'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS } from '@/lib/data/staff'
import { getPTEBadge } from '@/lib/utils/pteUtils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { UserProfile } from '@/context/RoleContext'

const USER_TO_STAFF: Record<string, string> = {
  'u3': 's5', // Maria → Maria Solberg (cleaner)
  'u4': 's3', // Bjorn Larsen (maintenance)
  'u5': 's4', // Fatima → Fatima Ndiaye (guest services)
  'u7': 's2', // Anna → Anna Kowalski (inspector)
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

// Confetti colors kept as raw hex — decorative animation, not themed UI
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

    const stored = localStorage.getItem('afterstay_user')
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
    localStorage.setItem('afterstay_clockin', JSON.stringify({
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
  const briefingHref =
    currentUser?.subRole?.includes('Maintenance')                                     ? '/briefing/maintenance'
    : currentUser?.subRole?.includes('Guest')                                         ? '/briefing/guest-services'
    : (currentUser?.subRole?.includes('Cleaner') || currentUser?.subRole?.includes('Cleaning')) ? '/briefing/cleaners'
    : '/briefing'

  const toggleCode = (id: string) => setShowCodes(prev => ({ ...prev, [id]: !prev[id] }))

  if (!mounted) return null

  return (
    <div
      className="relative min-h-screen bg-[var(--bg-page)]"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(20,184,166,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(20,184,166,0.10) 0%, transparent 60%), var(--bg-page)',
      }}
    >
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-10 flex h-[52px] items-center justify-between px-5 border-b border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-[13px] font-semibold text-white">N</div>
          <span className="text-base font-semibold text-[var(--text-primary)]">AfterStay</span>
        </div>
        <Link href="/app/dashboard" className="text-[13px] text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors no-underline">
          Skip →
        </Link>
      </div>

      {/* Center content */}
      <div className="flex min-h-screen items-center justify-center p-6 pt-[76px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-[440px] rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl"
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
                  className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full pointer-events-none z-20"
                  style={{ background: color }}
                />
              )
            })}
          </AnimatePresence>

          {/* Clock status bar */}
          {todayShift && (
            <Card
              className={`mb-5 p-2.5 px-3.5 !rounded-[var(--radius-lg)] ${
                isLate
                  ? '!bg-[var(--status-red-bg)] !border-[rgba(239,68,68,0.3)]'
                  : minutesUntilShift > 0
                    ? '!bg-[var(--status-amber-bg)] !border-[rgba(217,119,6,0.3)]'
                    : '!bg-[var(--status-green-bg)] !border-[rgba(16,185,129,0.3)]'
              }`}
            >
              {isLate ? (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xs font-semibold text-[var(--status-red-fg)]"
                >
                  🔴 You are late — shift started at {todayShift.startTime}
                </motion.div>
              ) : (
                <div className="text-xs font-medium text-[var(--status-amber-fg)]">
                  ○ Shift starts at {todayShift.startTime} · {propertyName}
                </div>
              )}
            </Card>
          )}

          {/* Greeting */}
          <h2 className="heading text-2xl font-semibold text-[var(--text-primary)] mb-1.5">
            Good {timeOfDay}, {currentUser?.name?.split(' ')[0]} 👋
          </h2>
          <div className="flex items-center gap-2.5 mb-5">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]">
              {currentUser?.subRole ?? 'Staff'}
            </span>
            <span className="text-[13px] text-[var(--text-subtle)]">
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
                  className="w-full h-[140px] object-cover rounded-xl mb-4"
                />
              )}

              {/* Shift card */}
              <div className="mb-5">
                <div className="text-xl font-semibold text-[var(--text-primary)] mb-1">{propertyName}</div>
                <div className="text-[28px] font-semibold text-[var(--accent)] mb-2">
                  {todayShift.startTime} – {todayShift.endTime}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)]">
                    {SHIFT_TYPE_LABEL[todayShift.type] ?? todayShift.type}
                  </span>
                  <span className="text-xs text-[var(--text-subtle)]">
                    {duration}h scheduled
                  </span>
                </div>
              </div>

              {/* Tasks preview */}
              <div className="mb-5">
                <div className="text-[13px] font-medium text-[var(--text-muted)] mb-2.5">Today&apos;s tasks:</div>
                {tasks.slice(0, 3).map((task, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-2">
                    <div className="h-4 w-4 shrink-0 rounded-full border-2 border-white/20" />
                    <span className="text-[13px] text-[var(--text-muted)]">{task}</span>
                  </div>
                ))}
                {tasks.length > 3 && (
                  <div className="text-xs text-[var(--text-subtle)] ml-[26px]">
                    +{tasks.length - 3} more tasks
                  </div>
                )}
              </div>

              {/* Maintenance: job cards with PTE */}
              {isMaintenance && myJobs.length > 0 && (
                <div className="mb-5">
                  <div className="text-[13px] font-medium text-[var(--text-muted)] mb-2.5">Your jobs:</div>
                  {myJobs.map(job => {
                    const jobPTEStatus = job.pteStatus ?? 'not_required'
                    const pteBadge = getPTEBadge(jobPTEStatus)
                    const canShowCode = jobPTEStatus === 'granted' || jobPTEStatus === 'auto_granted' || jobPTEStatus === 'not_required'
                    return (
                      <Card key={job.id} className="p-2.5 px-3 !rounded-[var(--radius-lg)] mb-2 bg-[var(--bg-elevated)]">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-[13px] font-semibold text-[var(--text-primary)]">{job.title}</div>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: pteBadge.color + '20', color: pteBadge.color }}
                          >
                            {pteBadge.icon} {pteBadge.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--text-subtle)] mb-1.5">{job.propertyName}</div>
                        {canShowCode ? (
                          <button
                            onClick={() => toggleCode(job.id)}
                            className="text-xs font-semibold text-[var(--accent)] bg-transparent border-none cursor-pointer p-0"
                          >
                            {showCodes[job.id] ? `Code: 4821` : 'Show Code 👁'}
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">🔒 Locked until PTE granted</span>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Unconfirmed shifts alert */}
              {unconfirmedCount > 0 && (
                <Card className="p-2.5 px-3.5 !rounded-[var(--radius-lg)] mb-5 flex items-center justify-between !bg-[var(--status-amber-bg)] !border-[rgba(217,119,6,0.3)]">
                  <span className="text-xs text-[var(--status-amber-fg)]">⚠ {unconfirmedCount} shifts this week need confirmation</span>
                  <Link href="/app/team" className="text-[11px] font-semibold text-[var(--status-amber-fg)] no-underline">View schedule →</Link>
                </Card>
              )}

              {/* Clock in button */}
              <AnimatePresence mode="wait">
                {!clocked ? (
                  <motion.div
                    key="start"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2"
                  >
                    <Button
                      onClick={handleClockIn}
                      className="w-full rounded-2xl py-5 h-auto text-lg font-semibold bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white gap-3"
                    >
                      ▶ Start Shift
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="clocked"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--status-green-fg)] p-5 text-lg font-semibold text-white"
                  >
                    ✓ Clocked in at {clockTime}
                  </motion.div>
                )}
              </AnimatePresence>

              {!clocked && (
                <div className="mt-2.5 text-center text-xs text-[var(--text-subtle)]">
                  Clock in at {currentTime}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <div className="text-5xl mb-4">🌙</div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No shift scheduled today</h3>
              <p className="text-[13px] text-[var(--text-subtle)] mb-6">Check your schedule for upcoming shifts</p>
              <Button
                onClick={() => router.push('/app/dashboard')}
                className="rounded-full px-7 py-3.5 h-auto text-sm font-semibold bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
              >
                Go to Dashboard
              </Button>
              <div className="mt-3.5">
                <Link href="/app/team" className="text-[13px] text-[var(--text-subtle)] no-underline hover:text-[var(--text-muted)] transition-colors">View My Schedule →</Link>
              </div>
            </div>
          )}

          {/* Back to Briefing */}
          <div className="mt-5 text-center">
            <Link
              href={briefingHref}
              className="inline-block min-h-[44px] leading-5 rounded-lg border border-white/10 px-5 py-3 text-[13px] text-[var(--text-subtle)] no-underline hover:text-[var(--text-muted)] hover:border-white/15 transition-colors"
            >
              ← Back to Briefing
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

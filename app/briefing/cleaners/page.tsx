'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Clock, Key, AlertTriangle, ChevronRight, Settings,
  CheckCircle2, Timer, Sparkles, Package, Eye, EyeOff,
  Check, MapPin,
} from 'lucide-react'
import type { UserProfile } from '@/context/RoleContext'
import { SHIFTS } from '@/lib/data/staffScheduling'
import type { Shift } from '@/lib/data/staffScheduling'
import { PROPERTY_WEATHER } from '@/lib/data/weather'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import { getCleaningChecklist, type ChecklistItem } from '@/lib/data/checklists'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ToggleSwitch from '@/components/ui/toggle-switch'
import CountdownTimer from '@/components/shared/CountdownTimer'
import WeatherIcon from '@/components/shared/WeatherIcon'
import { CleaningTaskDrawer } from '@/components/tasks/cleaning/CleaningTaskDrawer'
import {
  getPrefs, savePrefs, resetPrefs,
  TOGGLE_LABELS, ALWAYS_ON,
} from '@/lib/data/briefingPrefs'
import type { BriefingPrefs, BriefingToggles } from '@/lib/data/briefingPrefs'

// ── Helpers ──────────────────────────────────────────────────────────────────

const USER_TO_STAFF: Record<string, string> = {
  'u3': 's5', 'u4': 's3', 'u5': 's4', 'u7': 's2',
}

/** Data-driven supply reminders per property */
const PROPERTY_SUPPLIES: Record<string, string> = {
  'p2': 'Linen set',
  'p3': 'Toiletry kit',
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getTurnaroundInfo(shift: Shift) {
  const linkedJobs = JOBS.filter(j => shift.jobIds.includes(j.id))
  const job = linkedJobs.find(j => j.checkinTime && j.checkoutTime)
  if (!job?.checkinTime || !job?.checkoutTime) return null
  const [coh, com] = job.checkoutTime.split(':').map(Number)
  const [cih, cim] = job.checkinTime.split(':').map(Number)
  const gapMins = (cih * 60 + cim) - (coh * 60 + com)
  return { gapMins, checkinTime: job.checkinTime, checkoutTime: job.checkoutTime, isTight: gapMins > 0 && gapMins < 240 }
}

function getChecklistForProperty(propertyId: string): ChecklistItem[] {
  const prop = PROPERTIES.find(p => p.id === propertyId)
  if (!prop) return []
  return getCleaningChecklist(prop.beds, prop.baths, prop.amenities ?? [])
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CleanerBriefingPage() {
  const router = useRouter()
  const [today, setToday] = useState('')
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [myShiftsToday, setMyShiftsToday] = useState<Shift[]>([])
  const [mounted, setMounted] = useState(false)
  const [prefs, setPrefs] = useState<BriefingPrefs | null>(null)
  const [showToggles, setShowToggles] = useState(false)
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})
  const [taskChecks, setTaskChecks] = useState<Record<string, boolean>>({})
  const [drawerShift, setDrawerShift] = useState<Shift | null>(null)
  const [usingDemoDate, setUsingDemoDate] = useState(false)

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('afterstay_user')
    if (!stored) { router.replace('/login'); return }
    try {
      const user: UserProfile = JSON.parse(stored)
      if (
        user.jobRole !== 'cleaner' &&
        user.jobRole !== 'supervisor' &&
        !user.subRole?.includes('Cleaning') &&
        !user.subRole?.includes('Cleaner') &&
        !user.subRole?.includes('Supervisor')
      ) {
        router.replace('/staff/start')
        return
      }
      setCurrentUser(user)
      const loaded = getPrefs(user.id, 'Cleaning Team', 'staff')
      setPrefs(loaded)
    } catch {
      router.replace('/login')
    }
  }, [router])

  useEffect(() => {
    if (!today || !currentUser) return
    const sid = USER_TO_STAFF[currentUser.id]
    if (!sid) return
    const todayShifts = SHIFTS.filter(s => s.staffId === sid && s.date === today)
    if (todayShifts.length > 0) {
      setMyShiftsToday(todayShifts)
      setUsingDemoDate(false)
      return
    }
    // Demo fallback: nearest scheduled date
    const allStaffShifts = SHIFTS.filter(s => s.staffId === sid).sort((a, b) => a.date.localeCompare(b.date))
    const upcoming = allStaffShifts.filter(s => s.date >= today)
    const demoDate = upcoming.length > 0 ? upcoming[0].date : allStaffShifts[allStaffShifts.length - 1]?.date
    if (demoDate) {
      setMyShiftsToday(SHIFTS.filter(s => s.staffId === sid && s.date === demoDate).sort((a, b) => a.startTime.localeCompare(b.startTime)))
      setUsingDemoDate(true)
    }
  }, [today, currentUser])

  if (!mounted || !currentUser) return null

  const firstName = currentUser.name.split(' ')[0]
  const sortedShifts = [...myShiftsToday].sort((a, b) => a.startTime.localeCompare(b.startTime))
  const firstShift = sortedShifts[0] ?? null

  const shiftTargetTime = firstShift && today
    ? `${today}T${firstShift.startTime}:00`
    : today ? `${today}T09:00:00` : ''

  const staffId = USER_TO_STAFF[currentUser.id]
  const myJobs = staffId ? JOBS.filter(j => j.staffId === staffId) : []

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dateLabel = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })

  const handleClockInAndGo = () => {
    localStorage.setItem('afterstay_clockin', JSON.stringify({
      staffId: currentUser.id,
      shiftId: firstShift?.id ?? 'unknown',
      date: today,
      clockInTime: new Date().toISOString(),
      clockInTimestamp: Date.now(),
      status: 'in_progress',
    }))
    router.push('/app/cleaner')
  }

  const toggleCode = (shiftId: string) => {
    setShowCodes(prev => ({ ...prev, [shiftId]: !prev[shiftId] }))
  }

  const toggleTask = (taskKey: string) => {
    setTaskChecks(prev => ({ ...prev, [taskKey]: !prev[taskKey] }))
  }

  // Count completed preview tasks per shift
  const getCompletedCount = (shiftId: string, total: number) => {
    let count = 0
    for (let i = 0; i < total; i++) {
      if (taskChecks[`${shiftId}-${i}`]) count++
    }
    return count
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between px-5 h-14 bg-[var(--bg-page)]/90 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-[var(--text-primary)]">AfterStay</span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => setShowToggles(true)}>
          <Settings size={16} className="text-[var(--text-muted)]" />
        </Button>
      </header>

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="pt-16 pb-36 px-5 max-w-lg md:max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ── Greeting ──────────────────────────────────────────── */}
          <div className="mb-5">
            <h1 className="heading text-2xl text-[var(--text-primary)] mb-1">
              {getGreeting()}, {firstName}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--status-purple-bg)] text-[var(--status-purple-fg)]">
                Cleaning Team
              </span>
              <span className="text-xs text-[var(--text-subtle)]">{dayName}, {dateLabel}</span>
              {usingDemoDate && (
                <span className="text-[10px] text-[var(--text-subtle)] italic">(Demo data)</span>
              )}
            </div>
          </div>

          {/* ── This Week ─────────────────────────────────────────── */}
          {prefs?.toggles.thisweek && (
            <div className="mb-5">
              <div className="flex gap-2">
                {[
                  { day: 'Mon', state: 'done' as const },
                  { day: 'Tue', state: 'done' as const },
                  { day: 'Wed', state: 'done' as const },
                  { day: 'Thu', state: 'today' as const },
                  { day: 'Fri', state: 'upcoming' as const },
                ].map(d => (
                  <div
                    key={d.day}
                    className={`flex-1 text-center py-2 min-h-[44px] rounded-xl ${
                      d.state === 'today'
                        ? 'bg-[var(--accent-bg)] border border-[var(--accent-border)]'
                        : 'bg-[var(--bg-card)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="text-[10px] text-[var(--text-subtle)] mb-1">{d.day}</div>
                    <div className="text-xs">
                      {d.state === 'done' && <CheckCircle2 size={14} className="mx-auto text-[var(--status-green-fg)]" />}
                      {d.state === 'today' && <div className="w-2 h-2 rounded-full bg-[var(--accent)] mx-auto" />}
                      {d.state === 'upcoming' && <div className="w-2 h-2 rounded-full bg-[var(--bg-elevated)] mx-auto" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Shift countdown ───────────────────────────────────── */}
          {firstShift && shiftTargetTime ? (
            <Card className="p-5 mb-5 text-center">
              <CountdownTimer
                targetTime={shiftTargetTime}
                label="YOUR SHIFT STARTS IN"
                context={`${PROPERTIES.find(p => p.id === firstShift.propertyId)?.name ?? firstShift.propertyId} · ${firstShift.startTime} – ${firstShift.endTime}`}
              />
            </Card>
          ) : (
            <div className="text-xs text-[var(--text-muted)] mb-4">No shift scheduled — check tasks below</div>
          )}

          {/* ── Today's Cleanings (Property Cards) ────────────────── */}
          {prefs?.toggles.propertiestoday && (
            <div className="mb-5">
              <div className="label-upper mb-2.5">Today&apos;s Schedule</div>
              {sortedShifts.length === 0 ? (
                <div className="text-xs text-[var(--text-muted)] mb-3">No cleanings scheduled today</div>
              ) : (
                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
                  {sortedShifts.map((shift, idx) => {
                    const prop = PROPERTIES.find(p => p.id === shift.propertyId)
                    const weather = PROPERTY_WEATHER.find(w => w.propertyId === shift.propertyId)
                    const cleanType = shift.notes?.toLowerCase().includes('deep') ? 'Deep Clean' : 'Turnover Clean'
                    const turnaround = getTurnaroundInfo(shift)
                    const isFirst = idx === 0
                    const checklist = getChecklistForProperty(shift.propertyId)
                    const previewTasks = checklist.slice(0, 5)
                    const completedCount = getCompletedCount(shift.id, previewTasks.length)
                    const accessCode = prop?.accessCodes?.[0]
                    const canSeeCode = true // Briefing = pre-shift, codes visible
                    const supplyItem = PROPERTY_SUPPLIES[shift.propertyId]

                    return (
                      <motion.div
                        key={shift.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                      >
                        <Card className="overflow-hidden p-0">
                          {/* Property image with gradient overlay */}
                          {prop?.imageUrl && (
                            <div className="relative h-28 md:h-36 overflow-hidden">
                              <img
                                src={prop.imageUrl}
                                alt={prop.name}
                                className="w-full h-full object-cover block"
                                loading={idx === 0 ? 'eager' : 'lazy'}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                              <div className="absolute bottom-3 left-4 right-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-sm font-medium text-white">{prop.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="flex items-center gap-1 text-xs text-white/80">
                                        <Clock size={11} /> {shift.startTime}–{shift.endTime}
                                      </span>
                                      <span className="text-xs text-white/60">·</span>
                                      <span className="text-xs text-white/80">{cleanType}</span>
                                    </div>
                                  </div>
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    isFirst
                                      ? 'bg-[var(--status-blue-bg)] text-[var(--status-blue-fg)]'
                                      : 'bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]'
                                  }`}>
                                    {isFirst ? 'NEXT UP' : 'LATER'}
                                  </span>
                                </div>
                              </div>
                              {/* Weather pill on image */}
                              {prefs?.toggles.weather && weather && (
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                                  <WeatherIcon condition={weather.condition} size={13} />
                                  <span className="text-xs text-white font-medium tabular-nums">{weather.temperature}°</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Fallback header when no image */}
                          {!prop?.imageUrl && (
                            <div className="p-4 pb-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                  {prop?.name ?? shift.propertyId}
                                </span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  isFirst
                                    ? 'bg-[var(--status-blue-bg)] text-[var(--status-blue-fg)]'
                                    : 'bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]'
                                }`}>
                                  {isFirst ? 'NEXT UP' : 'LATER'}
                                </span>
                              </div>
                              <div className="text-xs text-[var(--text-muted)] mb-1">
                                <Clock size={12} className="inline mr-1 -mt-px" />
                                {shift.startTime} – {shift.endTime} · {cleanType}
                              </div>
                            </div>
                          )}

                          <div className="p-4 space-y-3">
                            {/* Task count (when image header provides time/type) */}
                            {prop?.imageUrl && prefs?.toggles.taskcount && (
                              <div className="text-xs text-[var(--text-muted)]">
                                {checklist.length} tasks
                              </div>
                            )}

                            {/* Turnaround warning — pill pattern */}
                            {prefs?.toggles.turnaroundwarning && turnaround?.isTight && (
                              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-amber-bg)] border border-[rgba(239,159,39,0.2)]">
                                <AlertTriangle size={14} className="text-[var(--status-amber-fg)] flex-shrink-0" />
                                <span className="text-xs text-[var(--status-amber-fg)] font-medium">
                                  Tight: next check-in {turnaround.checkinTime} ({Math.round(turnaround.gapMins / 60)}h gap)
                                </span>
                              </div>
                            )}

                            {/* Access info — elevated pill pattern */}
                            {prefs?.toggles.accesstype && accessCode && (
                              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-elevated)]">
                                <div className="flex items-center gap-2">
                                  <Key size={13} className="text-[var(--text-muted)]" />
                                  <span className="text-xs text-[var(--text-muted)]">
                                    {accessCode.label}
                                  </span>
                                </div>
                                {canSeeCode && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleCode(shift.id) }}
                                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] bg-transparent border-none cursor-pointer min-h-[36px] px-2"
                                  >
                                    {showCodes[shift.id] ? (
                                      <>
                                        <span className="tabular-nums font-semibold">{accessCode.code}</span>
                                        <EyeOff size={13} />
                                      </>
                                    ) : (
                                      <>
                                        <span>Show Code</span>
                                        <Eye size={13} />
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Progress bar */}
                            {prefs?.toggles.taskpreview && (
                              <>
                                <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)]">
                                  <div
                                    className="h-full rounded-full bg-[var(--status-success)] transition-[width] duration-300"
                                    style={{ width: `${checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0}%` }}
                                  />
                                </div>
                                <div className="text-xs text-[var(--text-muted)]">
                                  {completedCount} of {checklist.length} tasks complete
                                </div>

                                {/* Inline checklist preview */}
                                {previewTasks.map((task, ti) => (
                                  <div
                                    key={ti}
                                    onClick={() => toggleTask(`${shift.id}-${ti}`)}
                                    className={`flex items-center gap-2.5 min-h-[36px] cursor-pointer ${
                                      ti < previewTasks.length - 1 ? 'border-b border-[var(--border)]' : ''
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border-2 ${
                                      taskChecks[`${shift.id}-${ti}`]
                                        ? 'border-[var(--status-success)] bg-[var(--status-success)]'
                                        : 'border-[var(--bg-elevated)] bg-transparent'
                                    }`}>
                                      {taskChecks[`${shift.id}-${ti}`] && <Check size={10} className="text-white" />}
                                    </div>
                                    <span className={`text-sm ${
                                      taskChecks[`${shift.id}-${ti}`]
                                        ? 'text-[var(--text-muted)] line-through'
                                        : 'text-[var(--text-primary)]'
                                    }`}>
                                      {task.label}
                                    </span>
                                  </div>
                                ))}

                                {checklist.length > 5 && (
                                  <div className="text-xs text-[var(--text-subtle)]">
                                    + {checklist.length - 5} more tasks
                                  </div>
                                )}
                              </>
                            )}

                            {/* Supply reminders — data-driven */}
                            {prefs?.toggles.supplyreminders && supplyItem && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--status-purple-bg)] text-xs text-[var(--status-purple-fg)]">
                                <Package size={12} />
                                Bring: {supplyItem}
                              </div>
                            )}

                            {/* CTA — rounded-full per design system */}
                            <Button
                              onClick={() => setDrawerShift(shift)}
                              className={`w-full rounded-full font-semibold ${
                                isFirst
                                  ? 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white'
                                  : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 text-white'
                              }`}
                            >
                              {isFirst ? 'Start This Clean' : 'View Schedule'}
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Other Tasks ───────────────────────────────────────── */}
          {prefs?.toggles.othertasks && (
            <div className="mb-5">
              <div className="label-upper mb-2.5">Other Tasks Today</div>
              <Card className="p-4">
                {[
                  'Deliver linen set — Harbor Studio · Before 13:00',
                  'Restock toiletry kits — Ocean View · After clean',
                ].map((task, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 min-h-[36px] py-2.5 ${i === 0 ? 'border-b border-[var(--border)]' : ''}`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--bg-elevated)] shrink-0" />
                    <span className="text-sm text-[var(--text-primary)]">{task}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ── Jobs queue ─────────────────────────────────────────── */}
          {myJobs.length > 0 && (
            <Link href="/app/cleaner" className="no-underline block mb-5">
              <Card className="p-3.5 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {myJobs.length} task{myJobs.length !== 1 ? 's' : ''} in your full queue
                </span>
                <span className="text-xs font-semibold text-[var(--accent)]">View all →</span>
              </Card>
            </Link>
          )}
        </motion.div>
      </main>

      {/* ── Fixed bottom CTA ──────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-5 pt-4 bg-gradient-to-t from-[var(--bg-page)] via-[var(--bg-page)] to-transparent"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-lg md:max-w-2xl mx-auto flex flex-col gap-2.5">
          <Button
            onClick={handleClockInAndGo}
            className="w-full rounded-full min-h-[52px] text-base font-semibold shadow-lg bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white"
            style={{ boxShadow: '0 4px 24px rgba(var(--accent-rgb, 245,158,11),0.35)' }}
          >
            Clock In &amp; Start Shift
          </Button>
          <Link href="/app/cleaner" className="block">
            <Button variant="outline" className="w-full rounded-full min-h-[44px] text-sm">
              Skip to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Cleaning task drawer ──────────────────────────────────── */}
      <AnimatePresence>
        {drawerShift && currentUser && (
          <CleaningTaskDrawer
            shift={drawerShift}
            job={
              JOBS.find(j => drawerShift.jobIds.includes(j.id) && j.type === 'cleaning') ??
              JOBS.find(j => j.staffId === staffId && j.propertyId === drawerShift.propertyId && j.type === 'cleaning' && j.status !== 'done') ??
              null
            }
            currentUserId={currentUser.id}
            currentUserName={currentUser.name}
            onClose={() => setDrawerShift(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Settings sheet ────────────────────────────────────────── */}
      <AnimatePresence>
        {showToggles && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowToggles(false)}
              className="fixed inset-0 bg-black/60 z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-[var(--bg-surface)] border-t border-[var(--border)] rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5">
                <span className="font-semibold text-base text-[var(--text-primary)]">Briefing Preferences</span>
                <button onClick={() => setShowToggles(false)} className="text-[var(--text-subtle)] text-lg bg-transparent border-none cursor-pointer p-1">✕</button>
              </div>

              {prefs && Object.entries(TOGGLE_LABELS)
                .filter(([key, meta]) =>
                  !ALWAYS_ON.includes(key as keyof BriefingToggles) &&
                  (meta.roles.includes('all') || meta.roles.includes('Cleaning Team'))
                )
                .map(([key, meta]) => {
                  const toggleKey = key as keyof BriefingToggles
                  const isOn = prefs.toggles[toggleKey]
                  return (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-[var(--border-subtle)]">
                      <div>
                        <div className="text-sm text-[var(--text-primary)] font-medium">{meta.label}</div>
                        <div className="text-xs text-[var(--text-subtle)] mt-0.5">{meta.description}</div>
                      </div>
                      <div className="shrink-0 ml-4">
                        <ToggleSwitch
                          checked={isOn}
                          onChange={() => {
                            const updated: BriefingPrefs = { ...prefs, toggles: { ...prefs.toggles, [toggleKey]: !isOn } }
                            setPrefs(updated)
                            savePrefs(updated)
                          }}
                        />
                      </div>
                    </div>
                  )
                })
              }

              <button
                onClick={() => {
                  if (!currentUser) return
                  const reset = resetPrefs(currentUser.id, 'Cleaning Team', 'staff')
                  setPrefs(reset)
                }}
                className="mt-5 w-full py-2.5 bg-transparent border border-[var(--border)] rounded-xl text-[var(--text-subtle)] text-xs cursor-pointer hover:border-[var(--text-subtle)] transition-colors"
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

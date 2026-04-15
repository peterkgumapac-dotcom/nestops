'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Shift } from '@/lib/data/staffScheduling'
import type { Job, ActivityEntry } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'
import { getStockItemsForUser } from '@/lib/data/inventory'
import { useCleaningProgress } from '@/hooks/tasks/useCleaningProgress'
import { useBellAlerts } from '@/hooks/alerts/useBellAlerts'
import { CleaningProgressBar } from './CleaningProgressBar'
import { CleaningTaskOverflow } from './CleaningTaskOverflow'
import { RestartTaskModal } from './modals/RestartTaskModal'
import { AddConsumablesModal } from './modals/AddConsumablesModal'
import { ReportProblemModal, type ReportSubmission } from './modals/ReportProblemModal'
import { LogMaintenanceIssueModal } from './modals/LogMaintenanceIssueModal'
import type { MaintenanceFlag } from '@/lib/data/maintenanceFlags'
import type { ChecklistItem } from '@/lib/data/checklists'
import { ArrowLeft, Play, Check, ChevronDown, AlertTriangle } from 'lucide-react'

interface Props {
  shift: Shift
  job: Job | null
  currentUserId: string
  currentUserName: string
  onClose: () => void
}

type TaskStatus = 'not_started' | 'in_progress' | 'done'

const PROBLEM_CATEGORIES: Record<string, string> = {
  too_dirty: 'Property too dirty',
  maintenance: 'Maintenance issue discovered',
  no_supplies: 'Lack of supplies',
  late: "I'll be late",
  wont_finish: "Task won't finish on time",
}

export function CleaningTaskDrawer({ shift, job, currentUserId, currentUserName, onClose }: Props) {
  const property = PROPERTIES.find(p => p.id === shift.propertyId)
  const propertyName = property?.name ?? shift.propertyId

  // Task execution state
  const [status, setStatus] = useState<TaskStatus>(
    job?.status === 'done' ? 'done' : job?.status === 'in_progress' ? 'in_progress' : 'not_started'
  )
  const [startedAt, setStartedAt] = useState<string | null>(
    job?.status === 'in_progress' || job?.status === 'done' ? new Date().toISOString() : null
  )

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    () => (job?.checklist ?? []).map(item => ({ ...item }))
  )

  // Collapsible sections state
  const categories = useMemo(() => {
    const cats = new Set(checklist.map(i => i.category))
    return Array.from(cats)
  }, [checklist])

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  // Activity log
  const [activity, setActivity] = useState<ActivityEntry[]>(job?.activity ?? [])

  const addActivity = (message: string) => {
    const entry: ActivityEntry = {
      id: `act-${Date.now()}`,
      type: 'system',
      event: message,
      timestamp: new Date().toISOString(),
    }
    setActivity(prev => [...prev, entry])
  }

  // Modal state
  const [restartOpen, setRestartOpen] = useState(false)
  const [consumablesOpen, setConsumablesOpen] = useState(false)
  const [reportProblemOpen, setReportProblemOpen] = useState(false)
  const [logMaintenanceOpen, setLogMaintenanceOpen] = useState(false)

  // Inventory
  const stockItems = useMemo(() => getStockItemsForUser(currentUserId), [currentUserId])

  // Bell alerts
  const { insertAlert } = useBellAlerts(currentUserId)

  // Estimated duration from shift times
  const [startH, startM] = shift.startTime.split(':').map(Number)
  const [endH, endM] = shift.endTime.split(':').map(Number)
  const estimatedDurationMinutes = (endH * 60 + endM) - (startH * 60 + startM)

  const checkInTime = job?.checkinTime
    ? `${shift.date}T${job.checkinTime}:00`
    : null
  const scheduledStartTime = `${shift.date}T${shift.startTime}:00`

  // Progress hook
  const progress = useCleaningProgress({
    taskId: shift.id,
    startedAt,
    estimatedDurationMinutes,
    checkInTime,
    scheduledStartTime,
    status,
  })

  // Handlers
  const handleStart = () => {
    const now = new Date().toISOString()
    setStartedAt(now)
    setStatus('in_progress')
    addActivity('Task started')
  }

  const handleRestart = () => {
    const now = new Date().toISOString()
    setStartedAt(now)
    setStatus('in_progress')
    addActivity('Task timer restarted')
    setRestartOpen(false)
  }

  const handleCheckItem = (itemId: string, checked: boolean) => {
    const updated = checklist.map(item =>
      item.id === itemId
        ? { ...item, completed: checked, completedAt: checked ? new Date().toISOString() : undefined }
        : item
    )
    setChecklist(updated)

    // Auto-collapse if all items in the category are done
    const item = checklist.find(i => i.id === itemId)
    if (item && checked) {
      const catItems = updated.filter(i => i.category === item.category)
      if (catItems.every(i => i.completed)) {
        setCollapsed(prev => ({ ...prev, [item.category]: true }))
        addActivity(`Section "${item.category}" completed`)
      }
    }
  }

  const handleConsumablesSubmit = (selections: { itemId: string; itemName: string; qty: number }[]) => {
    const summary = selections.map(s => `${s.qty}× ${s.itemName}`).join(', ')
    addActivity(`Consumables logged: ${summary}`)
  }

  const handleReportProblem = async (report: ReportSubmission) => {
    const { category, note } = report
    const categoryLabel = PROBLEM_CATEGORIES[category] ?? category
    const content = `${currentUserName} reported: ${categoryLabel} — ${propertyName}.${note ? ` Note: ${note}` : ''}`

    const targets = ['u5', 'u1']
    for (const targetId of targets) {
      try {
        await insertAlert({
          triggered_by: currentUserId,
          target_user_id: targetId,
          content,
          alert_type: 'operator',
          task_id: shift.id,
          property_id: shift.propertyId,
        })
      } catch {
        // Demo mode — ignore Supabase errors
      }
    }
    addActivity(`Problem reported: ${categoryLabel}`)
  }

  const handleLogMaintenance = async (issueType: string, description: string, urgency: 'today' | 'later') => {
    const content = `Maintenance issue flagged at ${propertyName} by ${currentUserName}. ${issueType}: ${description}`

    const newFlag: MaintenanceFlag = {
      id: `mf-${Date.now()}`,
      propertyId: shift.propertyId,
      propertyName,
      reportedBy: currentUserName,
      reportedAt: new Date().toISOString(),
      issueType,
      description,
      urgency,
      status: 'pending_review',
    }

    try {
      const existing = JSON.parse(localStorage.getItem('afterstay_maintenance_flags') ?? '[]') as MaintenanceFlag[]
      localStorage.setItem('afterstay_maintenance_flags', JSON.stringify([newFlag, ...existing]))
    } catch { /* ignore */ }

    const targets = ['u5', 'u1']
    for (const targetId of targets) {
      try {
        await insertAlert({
          triggered_by: currentUserId,
          target_user_id: targetId,
          content,
          alert_type: 'operator',
          task_id: shift.id,
          property_id: shift.propertyId,
        })
      } catch {
        // Demo mode
      }
    }

    addActivity(`Maintenance issue logged: ${issueType}`)
  }

  const totalItems = checklist.length
  const doneItems = checklist.filter(i => i.completed).length

  const cleanTypeBadge = shift.type.charAt(0).toUpperCase() + shift.type.slice(1)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/70"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-y-0 right-0 z-[201] flex w-full max-w-[520px] flex-col overflow-y-auto bg-[var(--bg-page)]"
      >
        {/* Drawer header */}
        <div
          className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--border)] px-5 py-3.5 backdrop-blur-sm"
          style={{ background: 'color-mix(in srgb, var(--bg-page) 95%, transparent)' }}
        >
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)]"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold text-[var(--text-primary)]">
              {propertyName}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                style={{
                  background: 'var(--status-amber-bg)',
                  color: 'var(--status-amber-fg)',
                }}
              >
                {cleanTypeBadge}
              </span>
              <span className="text-[11px] text-[var(--text-subtle)]">
                {shift.startTime} – {shift.endTime}
              </span>
            </div>
          </div>
          <CleaningTaskOverflow
            onRestart={() => setRestartOpen(true)}
            onAddConsumables={() => setConsumablesOpen(true)}
            onReportProblem={() => setReportProblemOpen(true)}
            onLogMaintenance={() => setLogMaintenanceOpen(true)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-5">

          {/* Reservation info */}
          {job?.reservation && (
            <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
              <div className="label-upper mb-1.5">
                Connected Reservation
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {job.reservation.guestName}
              </div>
              <div className="mt-0.5 text-xs text-[var(--text-subtle)]">
                {job.reservation.checkIn} → {job.reservation.checkOut}
                {job.reservation.platform ? ` · ${job.reservation.platform}` : ''}
                {job.checkoutTime ? ` · Checkout ${job.checkoutTime}` : ''}
                {job.checkinTime ? ` · Check-in ${job.checkinTime}` : ''}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {progress && status !== 'not_started' && (
            <CleaningProgressBar progress={progress} checkInTime={job?.checkinTime ?? null} />
          )}

          {/* Start CTA */}
          {status === 'not_started' && (
            <button
              onClick={handleStart}
              className="mb-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-[var(--accent-staff)] py-4 text-base font-semibold text-white transition-colors"
            >
              <Play className="h-4 w-4" strokeWidth={2} fill="currentColor" />
              Start Task
            </button>
          )}

          {/* Progress summary if in progress */}
          {status === 'in_progress' && totalItems > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[13px] text-[var(--text-muted)]">
                Checklist: {doneItems}/{totalItems} done
              </span>
              {doneItems === totalItems && (
                <button
                  onClick={() => { setStatus('done'); addActivity('Task marked complete') }}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border-none bg-[var(--status-green-fg)] px-4 py-1.5 text-[13px] font-semibold text-white transition-colors"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2} />
                  Mark Done
                </button>
              )}
            </div>
          )}

          {/* Collapsible checklist */}
          {checklist.length > 0 && (
            <div className="mb-5">
              {categories.map(cat => {
                const catItems = checklist.filter(i => i.category === cat)
                const catDone = catItems.filter(i => i.completed).length
                const allDone = catDone === catItems.length
                const isCollapsed = collapsed[cat] ?? false

                return (
                  <div key={cat} className="mb-2">
                    {/* Section header */}
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="flex w-full cursor-pointer items-center justify-between px-3.5 py-2.5 text-[var(--text-primary)]"
                      style={{
                        borderRadius: isCollapsed ? 'var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) 0 0',
                        background: allDone ? 'var(--status-green-bg)' : 'var(--bg-card)',
                        border: `1px solid ${allDone ? 'var(--status-green-bg)' : 'var(--border)'}`,
                        borderBottom: !isCollapsed ? 'none' : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {allDone && <Check className="h-3.5 w-3.5" strokeWidth={2} style={{ color: 'var(--status-green-fg)' }} />}
                        <span
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: allDone ? 'var(--status-green-fg)' : 'var(--text-muted)' }}
                        >
                          {cat}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{
                            background: allDone ? 'var(--status-green-bg)' : 'var(--bg-elevated)',
                            color: allDone ? 'var(--status-green-fg)' : 'var(--text-muted)',
                          }}
                        >
                          {catDone}/{catItems.length}
                        </span>
                        <ChevronDown
                          className="h-3.5 w-3.5 transition-transform duration-200"
                          strokeWidth={1.5}
                          style={{
                            color: 'var(--text-subtle)',
                            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)',
                          }}
                        />
                      </div>
                    </button>

                    {/* Checklist items */}
                    {!isCollapsed && (
                      <div
                        className="overflow-hidden"
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          borderTop: 'none',
                          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                        }}
                      >
                        {catItems.map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 px-3.5 py-2.5"
                            style={{
                              borderBottom: idx < catItems.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                              background: item.completed ? 'var(--status-green-bg)' : 'transparent',
                            }}
                          >
                            <button
                              onClick={() => handleCheckItem(item.id, !item.completed)}
                              className="mt-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-white"
                              style={{
                                background: item.completed ? 'var(--status-green-fg)' : 'transparent',
                                border: `2px solid ${item.completed ? 'var(--status-green-fg)' : 'var(--border)'}`,
                              }}
                            >
                              {item.completed && <Check className="h-3 w-3" strokeWidth={2.5} />}
                            </button>
                            <span
                              className="text-[13px] leading-relaxed"
                              style={{
                                color: item.completed ? 'var(--text-subtle)' : 'var(--text-primary)',
                                textDecoration: item.completed ? 'line-through' : 'none',
                              }}
                            >
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Activity log */}
          {activity.length > 0 && (
            <div className="mb-5">
              <div className="label-upper mb-2.5">
                Activity
              </div>
              <div className="flex flex-col gap-1.5">
                {activity.map(entry => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2"
                  >
                    {entry.type === 'message' ? (
                      <div>
                        <div className="mb-0.5 flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-semibold text-white">
                            {entry.authorAvatar ?? entry.authorName?.slice(0, 2)}
                          </div>
                          <span className="text-xs font-semibold text-[var(--text-muted)]">{entry.authorName}</span>
                          <span className="ml-auto text-[11px] text-[var(--text-subtle)]">
                            {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                        </div>
                        <div className="pl-[26px] text-[13px] text-[var(--text-muted)]">{entry.message}</div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--text-muted)]">
                          {entry.event}{entry.detail ? ` — ${entry.detail}` : ''}
                        </span>
                        <span className="text-[11px] text-[var(--text-subtle)]">
                          {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="border-t border-[var(--border)] px-5 pb-8 pt-4 backdrop-blur-sm"
          style={{ background: 'color-mix(in srgb, var(--bg-page) 95%, transparent)' }}
        >
          {status === 'in_progress' && (
            <button
              onClick={() => setReportProblemOpen(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--status-red-bg)] py-3.5 text-sm font-semibold text-[var(--status-red-fg)] transition-colors"
              style={{
                background: 'var(--status-red-bg)',
              }}
            >
              <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
              Report a Problem
            </button>
          )}
          {status === 'done' && (
            <div className="flex items-center justify-center gap-1.5 py-2 text-sm font-semibold" style={{ color: 'var(--status-green-fg)' }}>
              <Check className="h-4 w-4" strokeWidth={2} />
              Task Complete
            </div>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <RestartTaskModal
        open={restartOpen}
        onClose={() => setRestartOpen(false)}
        onConfirm={handleRestart}
      />
      <AddConsumablesModal
        open={consumablesOpen}
        onClose={() => setConsumablesOpen(false)}
        items={stockItems}
        onSubmit={handleConsumablesSubmit}
      />
      <ReportProblemModal
        open={reportProblemOpen}
        onClose={() => setReportProblemOpen(false)}
        propertyName={propertyName}
        cleanerName={currentUserName}
        onSubmit={handleReportProblem}
      />
      <LogMaintenanceIssueModal
        open={logMaintenanceOpen}
        onClose={() => setLogMaintenanceOpen(false)}
        propertyName={propertyName}
        cleanerName={currentUserName}
        onSubmit={handleLogMaintenance}
      />
    </>
  )
}

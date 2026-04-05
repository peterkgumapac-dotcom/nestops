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

    // Fire alerts to GS + operator (using u5 as GS user id and u1 as operator)
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

    // Insert into local maintenance flags via localStorage for demo
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

    // Alert GS users
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
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200 }}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 520,
          background: '#0d1117',
          zIndex: 201, overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Drawer header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {propertyName}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(217,119,6,0.2)', color: '#fbbf24', textTransform: 'uppercase' }}>
                {cleanTypeBadge}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
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
        <div style={{ padding: '20px', flex: 1 }}>

          {/* Reservation info */}
          {job?.reservation && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '12px 16px', marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                Connected Reservation
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                {job.reservation.guestName}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
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
              style={{
                width: '100%', padding: '16px', borderRadius: 14,
                background: '#d97706', color: '#fff', border: 'none',
                fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ▶ Start Task
            </button>
          )}

          {/* Progress summary if in progress */}
          {status === 'in_progress' && totalItems > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                Checklist: {doneItems}/{totalItems} done
              </span>
              {doneItems === totalItems && (
                <button
                  onClick={() => { setStatus('done'); addActivity('Task marked complete') }}
                  style={{
                    padding: '6px 16px', borderRadius: 8,
                    background: '#10b981', color: '#fff', border: 'none',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Mark Done ✓
                </button>
              )}
            </div>
          )}

          {/* Collapsible checklist */}
          {checklist.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {categories.map(cat => {
                const catItems = checklist.filter(i => i.category === cat)
                const catDone = catItems.filter(i => i.completed).length
                const allDone = catDone === catItems.length
                const isCollapsed = collapsed[cat] ?? false

                return (
                  <div key={cat} style={{ marginBottom: 8 }}>
                    {/* Section header */}
                    <button
                      onClick={() => toggleCategory(cat)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: isCollapsed ? 10 : '10px 10px 0 0',
                        background: allDone ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${allDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}`,
                        borderBottom: !isCollapsed ? 'none' : undefined,
                        cursor: 'pointer', color: '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {allDone && <span style={{ color: '#10b981', fontSize: 13 }}>✓</span>}
                        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: allDone ? '#34d399' : 'rgba(255,255,255,0.7)' }}>
                          {cat}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: allDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', color: allDone ? '#34d399' : 'rgba(255,255,255,0.5)' }}>
                          {catDone}/{catItems.length}
                        </span>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', display: 'inline-block', transition: 'transform 0.2s' }}>
                          ▾
                        </span>
                      </div>
                    </button>

                    {/* Checklist items */}
                    {!isCollapsed && (
                      <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                        overflow: 'hidden',
                      }}>
                        {catItems.map((item, idx) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: 12,
                              padding: '10px 14px',
                              borderBottom: idx < catItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                              background: item.completed ? 'rgba(16,185,129,0.04)' : 'transparent',
                            }}
                          >
                            <button
                              onClick={() => handleCheckItem(item.id, !item.completed)}
                              style={{
                                width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                                background: item.completed ? '#10b981' : 'transparent',
                                border: `2px solid ${item.completed ? '#10b981' : 'rgba(255,255,255,0.25)'}`,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: 11,
                              }}
                            >
                              {item.completed && '✓'}
                            </button>
                            <span style={{
                              fontSize: 13, color: item.completed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
                              textDecoration: item.completed ? 'line-through' : 'none',
                              lineHeight: 1.4,
                            }}>
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
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                Activity
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activity.map(entry => (
                  <div key={entry.id} style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {entry.type === 'message' ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>
                            {entry.authorAvatar ?? entry.authorName?.slice(0, 2)}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{entry.authorName}</span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
                            {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', paddingLeft: 26 }}>{entry.message}</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                          {entry.event}{entry.detail ? ` — ${entry.detail}` : ''}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
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
        <div style={{
          padding: '16px 20px', paddingBottom: 32,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(13,17,23,0.95)',
        }}>
          {status === 'in_progress' && (
            <button
              onClick={() => setReportProblemOpen(true)}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: 'rgba(239,68,68,0.1)', color: '#f87171',
                border: '1px solid rgba(239,68,68,0.25)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              ⚠ Report a Problem
            </button>
          )}
          {status === 'done' && (
            <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 14, color: '#34d399', fontWeight: 600 }}>
              ✓ Task Complete
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

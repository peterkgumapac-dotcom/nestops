'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import AppDrawer from '@/components/shared/AppDrawer'
import StatusBadge from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FIELD_ALERTS, type FieldAlert, type FieldAlertType } from '@/lib/data/fieldAlerts'
import { STAFF_MEMBERS } from '@/lib/data/staff'
import type { UserProfile } from '@/context/RoleContext'

const TYPE_LABELS: Record<FieldAlertType, string> = {
  new_task: 'New Task',
  schedule_change: 'Schedule',
  backjob: 'Backjob',
  apartment_dirty: 'Cleaner Report',
  needs_consumables: 'Consumables',
  upsell_escalation: 'Upsell',
  maintenance_issue: 'Maintenance Issue',
}

const TYPE_ICONS: Record<FieldAlertType, string> = {
  new_task: '📋',
  schedule_change: '🕐',
  backjob: '🔁',
  apartment_dirty: '⚠️',
  needs_consumables: '🧴',
  upsell_escalation: '⬆',
  maintenance_issue: '🔧',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const FILTER_PILLS = [
  { key: 'all', label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'new_task', label: 'Tasks' },
  { key: 'schedule_change', label: 'Schedule' },
  { key: 'backjob', label: 'Cleaner Report' },
  { key: 'upsell_escalation', label: 'Upsell' },
]

export default function AlertsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [alerts, setAlerts] = useState<FieldAlert[]>([])
  const [filter, setFilter] = useState('all')

  // Work order drawer state
  const [convertAlert, setConvertAlert] = useState<FieldAlert | null>(null)
  const [convertStep, setConvertStep] = useState<'form' | 'success'>('form')
  const [woAssignee, setWoAssignee] = useState('s3')
  const [woDate, setWoDate] = useState(new Date().toISOString().split('T')[0])
  const [woTime, setWoTime] = useState('10:00')
  const [woNotes, setWoNotes] = useState('')
  const [convertedAlerts, setConvertedAlerts] = useState<Record<string, string>>({})

  useEffect(() => {
    const stored = localStorage.getItem('afterstay_user')
    if (stored) {
      try {
        const user: UserProfile = JSON.parse(stored)
        setCurrentUser(user)

        const isSupervisor = user.subRole?.includes('Supervisor')
        let staffId = 's1'
        if (user.subRole?.includes('Supervisor')) staffId = 's2'
        else if (user.subRole?.includes('Maintenance')) staffId = 's3'
        else if (user.subRole?.includes('Guest')) staffId = 's4'

        const visible = FIELD_ALERTS.filter(a => {
          if (isSupervisor) return true
          return a.assignedTo.includes(staffId)
        })
        setAlerts(visible)
      } catch {}
    }
  }, [])

  const filtered = alerts.filter(a => {
    if (filter === 'all') return true
    if (filter === 'urgent') return a.severity === 'urgent'
    if (filter === 'backjob') return a.type === 'backjob' || a.type === 'apartment_dirty'
    return a.type === filter
  })

  const unreadCount = alerts.filter(a => !a.read).length

  const markRead = (id: string, actionRoute?: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
    if (actionRoute) router.push(actionRoute)
  }

  const handleOpenConvert = (alert: FieldAlert) => {
    setConvertAlert(alert)
    setWoNotes(alert.body)
    setWoAssignee('s3')
    setWoDate(new Date().toISOString().split('T')[0])
    setWoTime('10:00')
    setConvertStep('form')
  }

  const handleCreateWorkOrder = () => {
    if (!convertAlert) return
    const woId = `WO-${Date.now().toString().slice(-4)}`
    const workOrder = {
      id: woId,
      alertId: convertAlert.id,
      title: convertAlert.title,
      propertyName: convertAlert.propertyName,
      propertyId: convertAlert.propertyId,
      assigneeId: woAssignee,
      assigneeName: STAFF_MEMBERS.find(s => s.id === woAssignee)?.name ?? 'Unassigned',
      scheduledDate: woDate,
      scheduledTime: woTime,
      notes: woNotes,
      priority: convertAlert.severity === 'urgent' ? 'urgent' : 'standard',
      createdAt: new Date().toISOString(),
    }
    try {
      const existing = JSON.parse(localStorage.getItem('afterstay_work_orders') || '[]')
      localStorage.setItem('afterstay_work_orders', JSON.stringify([...existing, workOrder]))
    } catch {}
    setConvertedAlerts(prev => ({ ...prev, [convertAlert.id]: woId }))
    setConvertStep('success')
  }

  // Group: urgent first, then by today vs earlier
  const urgent = filtered.filter(a => a.severity === 'urgent' && !a.read)
  const today = filtered.filter(a => a.severity !== 'urgent' && !a.read)
  const earlier = filtered.filter(a => a.read)

  const isSupervisor = currentUser?.subRole?.includes('Supervisor')

  const maintenanceStaff = STAFF_MEMBERS.filter(
    s => s.role.toLowerCase().includes('maintenance') || s.role.toLowerCase().includes('tech')
  )

  const SEVERITY_CARD_CLASSES: Record<string, { bg: string; border: string; badge: string; dot: string; link: string }> = {
    urgent: {
      bg: 'bg-[var(--status-red-bg)]',
      border: 'border-l-[var(--status-red-fg)]',
      badge: 'bg-[var(--status-red-bg)] text-[var(--status-red-fg)]',
      dot: 'bg-[var(--status-red-fg)]',
      link: 'text-[var(--status-red-fg)]',
    },
    warning: {
      bg: 'bg-[var(--status-amber-bg)]',
      border: 'border-l-[var(--status-amber-fg)]',
      badge: 'bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]',
      dot: 'bg-[var(--status-amber-fg)]',
      link: 'text-[var(--status-amber-fg)]',
    },
    info: {
      bg: 'bg-[var(--status-blue-bg)]',
      border: 'border-l-[var(--status-blue-fg)]',
      badge: 'bg-[var(--status-blue-bg)] text-[var(--status-blue-fg)]',
      dot: 'bg-[var(--status-blue-fg)]',
      link: 'text-[var(--status-blue-fg)]',
    },
  }

  const renderAlertCard = (alert: FieldAlert) => {
    const sc = SEVERITY_CARD_CLASSES[alert.severity] ?? SEVERITY_CARD_CLASSES.info
    return (
      <motion.div
        key={alert.id}
        layout
        onClick={() => markRead(alert.id, alert.actionRoute)}
        className={cn(
          'rounded-xl p-4 mb-2 cursor-pointer transition-opacity duration-200 border border-l-4',
          alert.read ? 'opacity-65 bg-[var(--bg-card)] border-[var(--border)]' : cn(sc.bg, 'border-[var(--border-subtle)]'),
          sc.border
        )}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-lg leading-none mt-px">{TYPE_ICONS[alert.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={cn("text-[10px] font-semibold px-1.5 py-px rounded-[var(--radius-sm)] uppercase tracking-wide", sc.badge)}
              >
                {TYPE_LABELS[alert.type]}
              </span>
              {!alert.read && (
                <span
                  className={cn("w-[7px] h-[7px] rounded-full inline-block", sc.dot)}
                />
              )}
            </div>
            <div className="text-[13px] font-semibold text-[var(--text-primary)] mb-0.5">
              {alert.title}
            </div>
            <div className="text-xs text-[var(--text-muted)] leading-relaxed mb-1.5">
              {alert.body}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-subtle)]">{alert.propertyName}</span>
              <span className="text-[11px] text-[var(--text-subtle)]">&middot;</span>
              <span className="text-[11px] text-[var(--text-subtle)]">{timeAgo(alert.createdAt)}</span>
              {alert.actionRoute && (
                <span
                  className={cn("text-[11px] font-semibold ml-1", sc.link)}
                >
                  &rarr; Review request
                </span>
              )}
            </div>

            {/* Work order CTA — supervisors only */}
            {isSupervisor && (alert.type === 'maintenance_issue' || alert.type === 'apartment_dirty') && (
              convertedAlerts[alert.id]
                ? <div className="mt-2 text-[11px] font-semibold text-[var(--status-green-fg)] flex items-center gap-1">
                    ✓ Work Order Created &middot; {convertedAlerts[alert.id]}
                  </div>
                : <Button
                    variant="outline"
                    size="sm"
                    onClick={e => { e.stopPropagation(); handleOpenConvert(alert) }}
                    className="mt-2.5 rounded-lg border-[var(--status-blue-fg)] bg-[var(--status-blue-bg)] text-[var(--status-blue-fg)] text-xs font-semibold"
                  >
                    Create Work Order &rarr;
                  </Button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={isSupervisor ? 'Team Alerts' : 'My Alerts'}
        subtitle={isSupervisor ? 'All field team alerts — tap to mark as read' : 'Your field alerts — tap to mark as read'}
        action={unreadCount > 0 ? (
          <StatusBadge status="urgent" className="text-xs" />
        ) : undefined}
      />

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {FILTER_PILLS.map(p => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium cursor-pointer border border-[var(--border)] transition-colors',
              filter === p.key
                ? 'bg-white text-[var(--text-primary)]'
                : 'bg-transparent text-[var(--text-muted)]'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-[var(--text-subtle)] text-[13px]">
          <Bell size={28} className="mb-3 opacity-30 mx-auto block" />
          No alerts to show.
        </div>
      ) : (
        <>
          {urgent.length > 0 && (
            <div className="mb-6">
              <div className="label-upper text-[var(--status-red-fg)] mb-2.5">
                Urgent
              </div>
              {urgent.map(renderAlertCard)}
            </div>
          )}

          {today.length > 0 && (
            <div className="mb-6">
              <div className="label-upper text-[var(--text-muted)] mb-2.5">
                Today
              </div>
              {today.map(renderAlertCard)}
            </div>
          )}

          {earlier.length > 0 && (
            <div className="mb-6">
              <div className="label-upper text-[var(--text-subtle)] mb-2.5">
                Earlier
              </div>
              {earlier.map(renderAlertCard)}
            </div>
          )}
        </>
      )}

      {/* Create Work Order Drawer */}
      <AppDrawer
        open={!!convertAlert}
        onClose={() => { setConvertAlert(null); setConvertStep('form') }}
        title={convertStep === 'form' ? 'Create Work Order' : 'Work Order Created'}
        subtitle={convertStep === 'form'
          ? (convertAlert?.propertyName ?? '') + ' · ' + (convertAlert?.title ?? '')
          : undefined}
        footer={convertStep === 'form'
          ? <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setConvertAlert(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateWorkOrder}
                className="flex-[2] rounded-lg bg-[var(--status-blue-fg)] text-white font-semibold hover:opacity-90"
              >
                Create Work Order
              </Button>
            </div>
          : <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => { setConvertAlert(null); setConvertStep('form') }}
                className="flex-1"
              >
                Done
              </Button>
              <Button
                onClick={() => { setConvertAlert(null); setConvertStep('form'); router.push('/app/my-tasks') }}
                className="flex-[2] rounded-lg bg-[var(--status-green-fg)] text-white font-semibold hover:opacity-90"
              >
                View in Tasks &rarr;
              </Button>
            </div>
        }
      >
        <AnimatePresence mode="wait">
          {convertStep === 'form' && convertAlert ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="flex flex-col gap-3.5">

              {/* Pre-filled read-only info */}
              <Card className="p-4 bg-[var(--status-blue-bg)] border-[var(--status-blue-fg)]/20">
                <div className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">
                  {convertAlert.title}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">{convertAlert.propertyName}</div>
              </Card>

              {/* Assign to */}
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
                  Assign to
                </label>
                <select
                  value={woAssignee}
                  onChange={e => setWoAssignee(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                >
                  {maintenanceStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} &middot; {s.role}</option>
                  ))}
                </select>
              </div>

              {/* Date + Time row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={woDate}
                    onChange={e => setWoDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={woTime}
                    onChange={e => setWoTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">
                  Notes
                </label>
                <textarea
                  value={woNotes}
                  onChange={e => setWoNotes(e.target.value)}
                  className="w-full min-h-[80px] px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[13px] resize-y outline-none"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4 pt-6">

              {/* Checkmark */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                className="w-14 h-14 rounded-full bg-[var(--status-green-bg)] border-2 border-[var(--status-green-fg)] flex items-center justify-center text-2xl"
              >
                ✓
              </motion.div>

              {/* WO reference */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[11px] font-semibold tracking-widest text-[var(--status-green-fg)] px-2.5 py-0.5 rounded-full border border-[var(--status-green-fg)]/30 bg-[var(--status-green-bg)]"
              >
                {convertedAlerts[convertAlert?.id ?? ''] ?? 'WO-XXXX'}
              </motion.div>

              {/* Detail chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="w-full overflow-hidden">
                  {([
                    ['Property', convertAlert?.propertyName],
                    ['Assigned to', STAFF_MEMBERS.find(s => s.id === woAssignee)?.name],
                    ['Scheduled', `${woDate} at ${woTime}`],
                  ] as [string, string | undefined][]).map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center px-3.5 py-2.5 border-b border-[var(--border)]">
                      <span className="text-xs text-[var(--text-muted)]">{label}</span>
                      <span className="text-xs font-semibold text-[var(--text-primary)]">{value}</span>
                    </div>
                  ))}
                </Card>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-[var(--text-muted)] text-center leading-relaxed"
              >
                {STAFF_MEMBERS.find(s => s.id === woAssignee)?.name} has been assigned.
                They&apos;ll see it on their briefing card.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </AppDrawer>
    </motion.div>
  )
}

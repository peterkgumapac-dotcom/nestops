'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import AppDrawer from '@/components/shared/AppDrawer'
import { FIELD_ALERTS, type FieldAlert, type FieldAlertType } from '@/lib/data/fieldAlerts'
import { STAFF_MEMBERS } from '@/lib/data/staff'
import type { UserProfile } from '@/context/RoleContext'

const SEVERITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  warning: '#d97706',
  info: '#3b82f6',
}

const SEVERITY_BG: Record<string, string> = {
  urgent: '#ef444410',
  warning: '#d9770610',
  info: '#3b82f610',
}

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
    const stored = localStorage.getItem('nestops_user')
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
      const existing = JSON.parse(localStorage.getItem('nestops_work_orders') || '[]')
      localStorage.setItem('nestops_work_orders', JSON.stringify([...existing, workOrder]))
    } catch {}
    setConvertedAlerts(prev => ({ ...prev, [convertAlert.id]: woId }))
    setConvertStep('success')
  }

  // Group: urgent first, then by today vs earlier
  const urgent = filtered.filter(a => a.severity === 'urgent' && !a.read)
  const today = filtered.filter(a => a.severity !== 'urgent' && !a.read)
  const earlier = filtered.filter(a => a.read)

  const accent = '#7c3aed'

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: `1px solid ${active ? accent : 'var(--border)'}`,
    background: active ? `${accent}1a` : 'transparent',
    color: active ? accent : 'var(--text-muted)',
  })

  const renderAlertCard = (alert: FieldAlert) => {
    const borderColor = SEVERITY_COLORS[alert.severity]
    return (
      <motion.div
        key={alert.id}
        layout
        onClick={() => markRead(alert.id, alert.actionRoute)}
        style={{
          background: alert.read ? 'var(--bg-card)' : SEVERITY_BG[alert.severity],
          border: `1px solid ${alert.read ? 'var(--border)' : borderColor + '40'}`,
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 8,
          cursor: 'pointer',
          opacity: alert.read ? 0.65 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>{TYPE_ICONS[alert.type]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                background: borderColor + '18', color: borderColor, textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {TYPE_LABELS[alert.type]}
              </span>
              {!alert.read && (
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: borderColor, display: 'inline-block' }} />
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
              {alert.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
              {alert.body}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{alert.propertyName}</span>
              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{timeAgo(alert.createdAt)}</span>
              {alert.actionRoute && (
                <span style={{ fontSize: 11, fontWeight: 600, color: SEVERITY_COLORS[alert.severity], marginLeft: 4 }}>
                  → Review request
                </span>
              )}
            </div>

            {/* Work order CTA */}
            {(alert.type === 'maintenance_issue' || alert.type === 'apartment_dirty') && (
              convertedAlerts[alert.id]
                ? <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: '#16a34a',
                                display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✓ Work Order Created · {convertedAlerts[alert.id]}
                  </div>
                : <button
                    onClick={e => { e.stopPropagation(); handleOpenConvert(alert) }}
                    style={{ marginTop: 10, padding: '6px 14px', borderRadius: 7, border: '1px solid #3b82f6',
                             background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: 12,
                             fontWeight: 600, cursor: 'pointer' }}
                  >
                    Create Work Order →
                  </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const isSupervisor = currentUser?.subRole?.includes('Supervisor')

  const maintenanceStaff = STAFF_MEMBERS.filter(
    s => s.role.toLowerCase().includes('maintenance') || s.role.toLowerCase().includes('tech')
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={isSupervisor ? 'Team Alerts' : 'My Alerts'}
        subtitle={isSupervisor ? 'All field team alerts — tap to mark as read' : 'Your field alerts — tap to mark as read'}
        action={unreadCount > 0 ? (
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 12,
            background: '#ef4444', color: '#fff',
          }}>
            {unreadCount} unread
          </span>
        ) : undefined}
      />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTER_PILLS.map(p => (
          <button key={p.key} onClick={() => setFilter(p.key)} style={pillStyle(filter === p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
          <Bell size={28} style={{ marginBottom: 12, opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
          No alerts to show.
        </div>
      ) : (
        <>
          {urgent.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ef4444', marginBottom: 10 }}>
                Urgent
              </div>
              {urgent.map(renderAlertCard)}
            </div>
          )}

          {today.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
                Today
              </div>
              {today.map(renderAlertCard)}
            </div>
          )}

          {earlier.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: 10 }}>
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
          ? <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button onClick={() => setConvertAlert(null)}
                style={{ flex: 1, padding: 9, borderRadius: 8, border: '1px solid var(--border)',
                         background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleCreateWorkOrder}
                style={{ flex: 2, padding: 9, borderRadius: 8, border: 'none', background: '#3b82f6',
                         color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Create Work Order
              </button>
            </div>
          : <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button onClick={() => { setConvertAlert(null); setConvertStep('form') }}
                style={{ flex: 1, padding: 9, borderRadius: 8, border: '1px solid var(--border)',
                         background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>
                Done
              </button>
              <button onClick={() => { setConvertAlert(null); setConvertStep('form'); router.push('/app/my-tasks') }}
                style={{ flex: 2, padding: 9, borderRadius: 8, border: 'none', background: '#16a34a',
                         color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                View in Tasks →
              </button>
            </div>
        }
      >
        <AnimatePresence mode="wait">
          {convertStep === 'form' && convertAlert ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Pre-filled read-only info */}
              <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(59,130,246,0.06)',
                            border: '1px solid rgba(59,130,246,0.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {convertAlert.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{convertAlert.propertyName}</div>
              </div>

              {/* Assign to */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Assign to
                </label>
                <select value={woAssignee} onChange={e => setWoAssignee(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
                           background: '#1f2937', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}>
                  {maintenanceStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} · {s.role}</option>
                  ))}
                </select>
              </div>

              {/* Date + Time row */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                    Scheduled Date
                  </label>
                  <input type="date" value={woDate} onChange={e => setWoDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
                             background: '#1f2937', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                    Due Time
                  </label>
                  <input type="time" value={woTime} onChange={e => setWoTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
                             background: '#1f2937', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                  Notes
                </label>
                <textarea value={woNotes} onChange={e => setWoNotes(e.target.value)}
                  style={{ width: '100%', minHeight: 80, padding: '10px 12px', borderRadius: 8,
                           border: '1px solid var(--border)', background: '#1f2937',
                           color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', outline: 'none' }} />
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 24 }}>

              {/* Checkmark */}
              <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(22,163,74,0.15)',
                         border: '2px solid #16a34a', display: 'flex', alignItems: 'center',
                         justifyContent: 'center', fontSize: 24 }}>
                ✓
              </motion.div>

              {/* WO reference */}
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#16a34a',
                         padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(22,163,74,0.3)',
                         background: 'rgba(22,163,74,0.08)' }}>
                {convertedAlerts[convertAlert?.id ?? ''] ?? 'WO-XXXX'}
              </motion.div>

              {/* Detail chips */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)',
                         background: 'var(--bg-card)', overflow: 'hidden' }}>
                {([
                  ['Property', convertAlert?.propertyName],
                  ['Assigned to', STAFF_MEMBERS.find(s => s.id === woAssignee)?.name],
                  ['Scheduled', `${woDate} at ${woTime}`],
                ] as [string, string | undefined][]).map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
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

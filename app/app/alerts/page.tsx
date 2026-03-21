'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { FIELD_ALERTS, type FieldAlert, type FieldAlertType } from '@/lib/data/fieldAlerts'
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
}

const TYPE_ICONS: Record<FieldAlertType, string> = {
  new_task: '📋',
  schedule_change: '🕐',
  backjob: '🔁',
  apartment_dirty: '⚠️',
  needs_consumables: '🧴',
  upsell_escalation: '⬆',
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

  useEffect(() => {
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try {
        const user: UserProfile = JSON.parse(stored)
        setCurrentUser(user)

        const isSupervisor = user.subRole?.includes('Supervisor')
        const staffId = user.subRole?.includes('Supervisor') ? 's2' : 's1'

        const visible = FIELD_ALERTS.filter(a => {
          if (isSupervisor) return true
          // Cleaner: only alerts assigned to them
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
          </div>
        </div>
      </motion.div>
    )
  }

  const isSupervisor = currentUser?.subRole?.includes('Supervisor')

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
    </motion.div>
  )
}

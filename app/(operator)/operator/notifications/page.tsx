'use client'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'

const NOTIFICATIONS = [
  { id: 'n1', type: 'urgent' as const, title: 'Heating system issue — Downtown Loft', body: 'Guest reported loud banging from radiators. Needs immediate attention.', time: 'Today, 09:15', read: false },
  { id: 'n2', type: 'warning' as const, title: 'Low stock: Hand Towels', body: 'Hand towels at 4 units, minimum level is 8. Please reorder.', time: 'Today, 08:30', read: false },
  { id: 'n3', type: 'info' as const, title: 'Purchase request pending approval', body: 'Sarah Johnson requested replacement coffee machine (1,290 NOK).', time: 'Yesterday, 16:45', read: true },
  { id: 'n4', type: 'success' as const, title: 'WiFi upgrade completed — Ocean View Apt', body: 'New mesh system installed and tested successfully.', time: 'Yesterday, 14:20', read: true },
  { id: 'n5', type: 'warning' as const, title: 'Compliance: 2 documents expiring soon', body: 'Harbor Studio STR License and Ocean View Fire Certificate expire within 60 days.', time: '2 days ago', read: true },
]

const TYPE_CONFIG = {
  urgent: { icon: AlertTriangle, color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  warning: { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(217,119,6,0.1)' },
  info: { icon: Info, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
  success: { icon: CheckCircle, color: '#34d399', bg: 'rgba(5,150,105,0.1)' },
}

export default function NotificationsPage() {
  const { accent } = useRole()

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Alerts and platform notifications"
        action={<button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Mark all read</button>}
      />
      <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {NOTIFICATIONS.map(n => {
          const cfg = TYPE_CONFIG[n.type]
          const Icon = cfg.icon
          return (
            <div
              key={n.id}
              style={{
                display: 'flex',
                gap: 14,
                padding: 16,
                borderRadius: 10,
                background: n.read ? 'var(--bg-card)' : 'var(--bg-elevated)',
                border: `1px solid var(--border)`,
                opacity: n.read ? 0.75 : 1,
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: cfg.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)' }}>{n.title}</span>
                  {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>{n.body}</p>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{n.time}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

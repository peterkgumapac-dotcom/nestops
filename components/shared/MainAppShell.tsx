'use client'
import { useState } from 'react'
import { Menu, Bell, X } from 'lucide-react'
import Link from 'next/link'
import MainAppSidebar from './MainAppSidebar'
import ClockStatus from './ClockStatus'
import CommandPalette from '@/components/command-palette'
import { useRole } from '@/context/RoleContext'
import { useAlerts } from '@/context/AlertsContext'

function fmtAlertTime(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

function alertTypeIcon(type: string): string {
  if (type === 'urgent') return '🔴'
  if (type === 'warning') return '🟡'
  return '🔵'
}

export default function MainAppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const { meshClass, accent } = useRole()
  const { getAlertsForRole, dismissAlert, dismissAll } = useAlerts()

  const activeAlerts = getAlertsForRole('cleaner').filter(a => !a.dismissed)
  const urgentCount = activeAlerts.filter(a => a.type === 'urgent').length
  const warningCount = activeAlerts.filter(a => a.type === 'warning').length
  const badgeCount = urgentCount + warningCount
  const badgeColor = urgentCount > 0 ? '#ef4444' : warningCount > 0 ? '#d97706' : accent

  return (
    <div className={meshClass} style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-page)' }}>
      <MainAppSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top header bar */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', height: 52, borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)', flexShrink: 0,
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            <Menu size={20} />
          </button>
          <span className="md:hidden" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>NestOps</span>

          {/* Desktop spacer */}
          <div className="hidden md:block" />

          <ClockStatus />

          {/* Alerts bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAlertsOpen(o => !o)}
              style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}
            >
              <Bell size={18} strokeWidth={1.6} />
              {badgeCount > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: badgeColor, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badgeCount}
                </span>
              )}
            </button>
            {alertsOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setAlertsOpen(false)} />
                <div style={{ position: 'absolute', top: 40, right: 0, width: 320, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 200, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alerts</span>
                    {activeAlerts.length > 0 && (
                      <button onClick={dismissAll} style={{ fontSize: 11, color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
                    )}
                  </div>
                  {activeAlerts.length === 0 ? (
                    <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-subtle)' }}>No active alerts</div>
                  ) : (
                    activeAlerts.map((a, i) => (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 16px', borderBottom: i < activeAlerts.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{alertTypeIcon(a.type)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{a.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{a.body}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{fmtAlertTime(a.createdAt)}</span>
                            {a.actionLabel && a.actionRoute && (
                              <Link href={a.actionRoute} onClick={() => setAlertsOpen(false)} style={{ fontSize: 11, color: accent, fontWeight: 600, textDecoration: 'none' }}>{a.actionLabel} →</Link>
                            )}
                          </div>
                        </div>
                        <button onClick={() => dismissAlert(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 2, display: 'flex', flexShrink: 0 }}>
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                  <div style={{ padding: '10px 16px', borderTop: activeAlerts.length > 0 ? '1px solid var(--border)' : 'none' }}>
                    <Link href="/app/alerts" onClick={() => setAlertsOpen(false)} style={{ fontSize: 12, fontWeight: 600, color: accent, textDecoration: 'none' }}>View all alerts →</Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: 24, position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}

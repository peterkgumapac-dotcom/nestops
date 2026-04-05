'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell, X } from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import MainAppSidebar from './MainAppSidebar'
import ClockStatus from './ClockStatus'
import CommandPalette from '@/components/command-palette'
import { useRole } from '@/context/RoleContext'
import type { Role, UserProfile } from '@/context/RoleContext'
import { useAlerts } from '@/context/AlertsContext'

import type { AccessTier } from '@/context/RoleContext'

const DEMO_SWITCHER_PERSONAS = [
  { userId: 'pk', initials: 'PK', name: 'Peter K.',   role: 'operator' as Role,                                                                                                                    avatarBg: '#c4622d', emoji: '⚙️', label: 'Operator' },
  { userId: 'fn', initials: 'FN', name: 'Fatima N.',  role: 'operator' as Role, accessTier: 'guest-services' as AccessTier, subRole: 'Guest Services Agent',                                       avatarBg: '#ec4899', emoji: '🛎️', label: 'GS Agent' },
  { userId: 'cm', initials: 'CM', name: 'Carlos M.',  role: 'operator' as Role, accessTier: 'guest-services' as AccessTier, subRole: 'GS Supervisor',                                              avatarBg: '#8b5cf6', emoji: '🎧', label: 'GS Supervisor' },
  { userId: 'ms', initials: 'MS', name: 'Maria S.',   role: 'staff'    as Role,                                              subRole: 'Cleaner',             jobRole: 'cleaner'     as UserProfile['jobRole'], avatarBg: '#d97706', emoji: '🧹', label: 'Cleaner' },
  { userId: 'bl', initials: 'BL', name: 'Bjorn L.',   role: 'staff'    as Role,                                              subRole: 'Maintenance',         jobRole: 'maintenance' as UserProfile['jobRole'], avatarBg: '#378ADD', emoji: '🔧', label: 'Maintenance' },
  { userId: 'ak', initials: 'AK', name: 'Anna K.',    role: 'staff'    as Role,                                              subRole: 'Cleaning Supervisor', jobRole: 'supervisor'  as UserProfile['jobRole'], avatarBg: '#06b6d4', emoji: '👷', label: 'Supervisor' },
  { userId: 'sj', initials: 'SJ', name: 'Sarah J.',   role: 'owner'    as Role,                                                                                                                    avatarBg: '#7F77DD', emoji: '🏠', label: 'Owner' },
  { userId: 'mc', initials: 'MC', name: 'Michael C.', role: 'owner'    as Role,                                                                                                                    avatarBg: '#15d492', emoji: '🏠', label: 'Owner' },
]
const USER_ID_MAP: Record<string, string> = { pk: 'u1', ms: 'u3', bl: 'u4', fn: 'u5', ak: 'u7', cm: 'u8', sj: 'u2', mc: 'u6' }

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
  const [demoOpen, setDemoOpen] = useState(false)
  const { meshClass, accent, user, setUser } = useRole()
  const { getAlertsForRole, dismissAlert, dismissAll } = useAlerts()
  const router = useRouter()

  const handleSwitchPersona = (p: typeof DEMO_SWITCHER_PERSONAS[number]) => {
    setDemoOpen(false)
    const profile: UserProfile = {
      id: USER_ID_MAP[p.userId] ?? p.userId,
      name: p.name,
      role: p.role,
      ...('accessTier' in p && p.accessTier ? { accessTier: p.accessTier } : {}),
      subRole: p.subRole,
      ...('jobRole' in p && p.jobRole ? { jobRole: p.jobRole } : {}),
      avatarInitials: p.initials,
      avatarColor: p.avatarBg,
    }
    localStorage.setItem('afterstay_user', JSON.stringify(profile))
    setUser(profile)
    let dest = '/app/my-tasks'
    if (p.role === 'operator') dest = '/briefing'
    else if (p.role === 'owner') dest = '/owner'
    else if (p.jobRole === 'supervisor') dest = '/app/dashboard'
    router.push(dest)
  }

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
          <Link href="/app/dashboard" className="md:hidden" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', textDecoration: 'none' }}>AfterStay</Link>

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
                <div style={{ position: 'absolute', top: 40, right: 0, width: 'min(320px, calc(100vw - 32px))', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 200, overflow: 'hidden' }}>
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

        <main className="main-content" style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </div>
      <CommandPalette />

      {/* Floating demo persona switcher */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 300 }}>
        <AnimatePresence>
          {demoOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '12px 14px', marginBottom: 10,
                minWidth: 'min(220px, calc(100vw - 32px))', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Switch Persona
              </div>
              <div style={{ height: 1, background: 'var(--border)', marginBottom: 8 }} />
              {DEMO_SWITCHER_PERSONAS.map(p => (
                <button
                  key={p.userId}
                  onClick={() => handleSwitchPersona(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '8px 10px', borderRadius: 8,
                    background: user?.id === USER_ID_MAP[p.userId] ? `${p.avatarBg}18` : 'var(--bg-surface)',
                    border: `1px solid ${user?.id === USER_ID_MAP[p.userId] ? p.avatarBg + '40' : 'var(--border)'}`,
                    cursor: 'pointer', marginBottom: 4, textAlign: 'left', fontFamily: 'inherit',
                    transition: 'all 0.12s',
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.avatarBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                    {p.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.subRole ?? p.label}</div>
                  </div>
                  <span style={{ fontSize: 15 }}>{p.emoji}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setDemoOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 40,
            background: demoOpen ? 'var(--bg-elevated)' : accent,
            border: `1px solid ${demoOpen ? 'var(--border)' : accent}`,
            color: '#fff', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}
        >
          <span>🎭</span>
          <span>{demoOpen ? 'Close' : 'Demo'}</span>
        </button>
      </div>
    </div>
  )
}

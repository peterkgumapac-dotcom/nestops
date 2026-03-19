'use client'
import { useState, useRef } from 'react'
import { Menu, Bell } from 'lucide-react'
import Link from 'next/link'
import MainAppSidebar from './MainAppSidebar'
import ClockStatus from './ClockStatus'
import CommandPalette from '@/components/command-palette'
import { useRole } from '@/context/RoleContext'

const RECENT_ALERTS = [
  { id: 'al1', icon: '📦', title: 'Low stock: Toilet paper', time: '14 min ago' },
  { id: 'al2', icon: '⚠️', title: 'Noise complaint — Downtown Loft', time: '1h ago' },
  { id: 'al3', icon: '🔧', title: 'Urgent maintenance — Bjorn L.', time: '2h ago' },
]

export default function MainAppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const { meshClass, accent } = useRole()

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
              <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: accent, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </button>
            {alertsOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setAlertsOpen(false)} />
                <div style={{ position: 'absolute', top: 40, right: 0, width: 300, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 200, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent Alerts</div>
                  {RECENT_ALERTS.map((a, i) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 16px', borderBottom: i < RECENT_ALERTS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{a.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '10px 16px' }}>
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

'use client'
import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, Plus, AlertCircle, CalendarPlus, PlusSquare, Flag } from 'lucide-react'
import Link from 'next/link'
import AppSidebar from './AppSidebar'
import CommandPalette from '@/components/command-palette'
import { useRole } from '@/context/RoleContext'
import ClockStatus from './ClockStatus'

const QUICK_ACTIONS = [
  { label: 'New Ticket',     Icon: AlertCircle,  href: '/operator/tickets' },
  { label: 'Schedule Clean', Icon: CalendarPlus, href: '/operator/cleaning' },
  { label: 'New Task',       Icon: PlusSquare,   href: '/operator/operations' },
  { label: 'Log Incident',   Icon: Flag,         href: '/operator/tickets' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('afterstay_sidebar')
    return stored === null ? false : stored === 'true'
  })
  const [fabOpen, setFabOpen] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)
  const { meshClass, role } = useRole()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setFabOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggleSidebar() {
    setSidebarCollapsed(c => {
      const next = !c
      localStorage.setItem('afterstay_sidebar', String(next))
      return next
    })
  }

  return (
    <div className={meshClass} style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-page)' }}>
      <AppSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
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
            aria-label="Open navigation menu"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            <Menu size={20} />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            className="hidden md:flex"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 7,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>

          <span className="md:hidden" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>AfterStay</span>

          <ClockStatus />

          {/* Notification bell */}
          <button
            aria-label="Notifications"
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}
          >
            <Bell size={18} strokeWidth={1.5} />
            <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              3
            </span>
          </button>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 3vw, 24px)', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </div>

      <CommandPalette />

      {/* Quick Actions FAB — operator portal only */}
      {role === 'operator' && (
        <div ref={fabRef} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200 }}>
          {/* Menu */}
          {fabOpen && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              minWidth: 180,
            }}>
              {QUICK_ACTIONS.map(({ label, Icon, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setFabOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    textDecoration: 'none', color: 'var(--text-primary)', fontSize: 13,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  {label}
                </Link>
              ))}
            </div>
          )}
          {/* FAB button */}
          <button
            onClick={() => setFabOpen(o => !o)}
            aria-label="Quick actions"
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transition: 'transform 0.15s ease',
              transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
          >
            <Plus size={22} />
          </button>
        </div>
      )}
    </div>
  )
}

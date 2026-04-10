'use client'
import { useState, useRef, useEffect } from 'react'
import { Plus, AlertCircle, CalendarPlus, PlusSquare, Flag } from 'lucide-react'
import Link from 'next/link'
import AppSidebar from './AppSidebar'
import AppSidebarRail from './AppSidebarRail'
import CommandPalette from '@/components/command-palette'
import ShellHeader from './ShellHeader'
import { useRole } from '@/context/RoleContext'

const QUICK_ACTIONS = [
  { label: 'New Ticket',     Icon: AlertCircle,  href: '/operator/tickets' },
  { label: 'Schedule Clean', Icon: CalendarPlus, href: '/operator/cleaning' },
  { label: 'New Task',       Icon: PlusSquare,   href: '/operator/operations' },
  { label: 'Log Incident',   Icon: Flag,         href: '/operator/tickets' },
]

interface AppShellProps {
  children: React.ReactNode
  variant?: 'full' | 'rail'
}

export default function AppShell({ children, variant = 'full' }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('afterstay_sidebar')
    return stored === null ? false : stored === 'true'
  })
  const [fabOpen, setFabOpen] = useState(false)
  const [railExpanded, setRailExpanded] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)
  const { meshClass, role } = useRole()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) setFabOpen(false)
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

  const isRail = variant === 'rail'

  const fab = role === 'operator' ? (
    <div ref={fabRef} className="fab-safe" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200 }}>
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
              className="fab-menu-item"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                textDecoration: 'none', color: 'var(--text-primary)', fontSize: 13,
              }}
            >
              <Icon size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              {label}
            </Link>
          ))}
        </div>
      )}
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
  ) : null

  if (isRail) {
    return (
      <div className={meshClass} style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
        <div className="operator-mesh-outer">
          <div className={`operator-panel${railExpanded ? ' rail-expanded' : ''}`}>
            <AppSidebarRail variant="inPanel" expanded={railExpanded} />
            <div className="panel-main-col">
              <div className="panel-header">
                <ShellHeader
                  variant="rail"
                  onMobileOpen={() => setMobileOpen(true)}
                  onToggle={() => setRailExpanded(e => !e)}
                  toggleState={railExpanded}
                />
              </div>
              <main style={{ flex: 1, minWidth: 0, padding: 0, position: 'relative' }}>
                {children}
              </main>
            </div>
          </div>
        </div>
        <CommandPalette />
        {fab}
      </div>
    )
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
        <ShellHeader
          variant="full"
          onMobileOpen={() => setMobileOpen(true)}
          onToggle={toggleSidebar}
          toggleState={sidebarCollapsed}
        />

        <main className="shell-main" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 3vw, 24px)', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </div>

      <CommandPalette />
      {fab}
    </div>
  )
}

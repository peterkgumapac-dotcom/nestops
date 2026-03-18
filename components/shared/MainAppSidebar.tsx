'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Sun, Moon } from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import { useTheme } from '@/context/ThemeContext'
import { MAIN_APP_NAV_BY_ROLE, getStaffNav } from '@/lib/nav'

interface MainAppSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function MainAppSidebar({ isOpen, onClose }: MainAppSidebarProps) {
  const { role, user, accent, portalLabel } = useRole()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [currentSubRole, setCurrentSubRole] = useState<string | undefined>(user?.subRole)
  const switcherRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Read subRole from localStorage so nav is always correct on first render
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nestops_user')
      if (stored) {
        const u = JSON.parse(stored)
        setCurrentSubRole(u.subRole)
      }
    } catch {}
  }, [])

  const sections = role === 'staff'
    ? getStaffNav(currentSubRole ?? user?.subRole)
    : (MAIN_APP_NAV_BY_ROLE[role] ?? MAIN_APP_NAV_BY_ROLE.operator)

  let globalIndex = 0

  const initials = user?.avatarInitials ?? 'PK'
  const avatarColor = user?.avatarColor ?? accent
  const displayName = user?.name ?? 'Peter K.'
  const displayRole = user?.subRole ?? role

  const sidebarContent = (
    <div
      style={{
        width: collapsed ? 64 : 240,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px', minHeight: 64, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14, flexShrink: 0 }}>
          N
        </div>
        <div style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s ease', pointerEvents: collapsed ? 'none' : 'auto', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>NestOps</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{displayRole}</div>
        </div>
        {!collapsed && (
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', flexShrink: 0 }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        )}
      </div>

      {/* Nav sections */}
      <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {sections.map((section, sIdx) => {
          const showLabel = section.label !== '' && !collapsed
          return (
            <div key={sIdx} style={{ marginBottom: 4 }}>
              {showLabel && (
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'var(--text-subtle)', padding: '10px 8px 4px',
                  borderTop: sIdx > 0 ? '1px solid var(--border-subtle)' : 'none',
                  marginTop: sIdx > 0 ? 6 : 0,
                }}>
                  {section.label}
                </div>
              )}
              {sIdx > 0 && !showLabel && collapsed && (
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 4px' }} />
              )}
              {section.items.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
                const itemIndex = globalIndex++
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: itemIndex * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '7px 8px', borderRadius: 7, marginBottom: 1,
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        background: isActive ? `${accent}1a` : 'transparent',
                        borderLeft: isActive ? `2px solid ${accent}` : '2px solid transparent',
                        textDecoration: 'none', fontSize: 13.5,
                        transition: 'background 0.15s ease, color 0.15s ease',
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <Icon size={17} strokeWidth={1.6} />
                        {item.badge && (
                          <span style={{
                            position: 'absolute', top: -6, right: -6, fontSize: 9, fontWeight: 700,
                            color: '#fff', background: accent, borderRadius: '50%',
                            width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s ease' }}>
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px', flexShrink: 0, borderTop: '1px solid var(--border-subtle)' }} ref={switcherRef}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSwitcherOpen(o => !o)}
            title={collapsed ? 'Switch Portal' : undefined}
            aria-label="Switch portal or sign out"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', overflow: 'hidden' }}
          >
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ textAlign: 'left', opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s ease', whiteSpace: 'nowrap', flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{displayName}</div>
              <div style={{ fontSize: 11, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{displayRole}</div>
            </div>
          </button>

          {switcherOpen && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: collapsed ? 60 : 0, width: 200, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 100 }}>
              <button
                onClick={() => { setSwitcherOpen(false); router.push('/login') }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', textAlign: 'left' }}
              >
                Switch account
              </button>
              <button
                onClick={() => { ['nestops_user','nestops_role','nestops_theme','nestops_briefing_prefs','nestops_clockin','nestops_field_reports','nestops_owner_work_orders'].forEach(k => localStorage.removeItem(k)); setSwitcherOpen(false); router.push('/login') }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#f87171', textAlign: 'left' }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', marginTop: 2 }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex" style={{ height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} className="md:hidden">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={onClose} />
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%' }}>
            {sidebarContent}
            <button onClick={onClose} aria-label="Close sidebar" style={{ position: 'absolute', top: 16, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

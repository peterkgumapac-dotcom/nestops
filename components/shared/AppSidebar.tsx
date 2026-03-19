'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Sun, Moon, Sparkles } from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import { useTheme } from '@/context/ThemeContext'
import { NAV_BY_ROLE, getStaffNav } from '@/lib/nav'

const APP_VERSION = 'v1.8'
const WHATS_NEW_KEY = 'nestops_whats_new_dismissed_v1.8'

const WHATS_NEW_ITEMS = [
  'Guest Experience Engine — Guidebooks, Upsells & Verification',
  'App-side upsell request flow with status tracking',
  'Owner portal maintenance cross-portal approval sharing',
  'Guest issue AI triage (priority + category suggestions)',
  'Cmd+K command palette for quick navigation',
]

interface AppSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const PORTAL_OPTIONS = [
  { role: 'operator' as const, label: 'Operator Portal', color: '#7c3aed', href: '/operator' },
  { role: 'owner'    as const, label: 'Owner Portal',    color: '#059669', href: '/owner' },
  { role: 'staff'    as const, label: 'Staff Portal',    color: '#d97706', href: '/staff' },
]

interface StoredUser { id?: string; name?: string; role?: string; subRole?: string }

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const { role, setRole, accent, portalLabel } = useRole()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null)
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [whatsNewBanner, setWhatsNewBanner] = useState(false)
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nestops_user')
      if (raw) setStoredUser(JSON.parse(raw))
    } catch { /* ignore */ }
    try {
      const dismissed = localStorage.getItem(WHATS_NEW_KEY)
      if (!dismissed) setWhatsNewBanner(true)
    } catch {}
  }, [])

  const displayName = storedUser?.name ?? 'User'
  const nameParts = displayName.trim().split(' ')
  const displayInitials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : displayName.slice(0, 2).toUpperCase()

  const sections = role === 'staff'
    ? getStaffNav(storedUser?.subRole)
    : NAV_BY_ROLE[role]

  // Flatten items for stagger index calculation
  let globalIndex = 0

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
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{portalLabel}</div>
        </div>
        {!collapsed && (
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
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
          const sectionEl = (
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
          return sectionEl
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px', flexShrink: 0, borderTop: '1px solid var(--border-subtle)' }} ref={switcherRef}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setSwitcherOpen(o => !o)}
            title={collapsed ? 'Switch Portal' : undefined}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', overflow: 'hidden' }}
          >
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {displayInitials}
            </div>
            <div style={{ textAlign: 'left', opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s ease', whiteSpace: 'nowrap', flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{displayName}</div>
              <div style={{ fontSize: 11, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{storedUser?.subRole ?? role}</div>
            </div>
          </button>

          {switcherOpen && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 4px)', left: collapsed ? 60 : 0, width: 180, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 100 }}>
              {PORTAL_OPTIONS.map(opt => (
                <button
                  key={opt.role}
                  onClick={() => { setRole(opt.role); setSwitcherOpen(false); router.push(opt.href) }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, background: role === opt.role ? `${opt.color}1a` : 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: role === opt.role ? opt.color : 'var(--text-muted)', textAlign: 'left' }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Version badge */}
        {!collapsed && (
          <button
            onClick={() => setShowWhatsNew(true)}
            title="What's new in this version"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', padding: '5px 8px', borderRadius: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: `${accent}20`, color: accent }}>
              {APP_VERSION}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>What&apos;s new</span>
            <Sparkles size={11} style={{ color: accent, marginLeft: 'auto' }} />
          </button>
        )}

        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', marginTop: 2 }}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

    </div>
  )

  // What's New banner — post-login, dismissable
  const whatsNewBannerEl = whatsNewBanner && !collapsed && (
    <div style={{
      position: 'fixed', bottom: 24, left: 256, zIndex: 100,
      background: 'var(--bg-surface)', border: `1px solid ${accent}40`,
      borderRadius: 12, padding: '14px 16px', maxWidth: 320,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Sparkles size={16} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            NestOps {APP_VERSION} is here
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
            Guest Experience Engine, AI triage, command palette, and more.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setShowWhatsNew(true); setWhatsNewBanner(false); try { localStorage.setItem(WHATS_NEW_KEY, '1') } catch {} }}
              style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 7, border: 'none', background: accent, color: '#fff', cursor: 'pointer' }}
            >
              See what&apos;s new
            </button>
            <button
              onClick={() => { setWhatsNewBanner(false); try { localStorage.setItem(WHATS_NEW_KEY, '1') } catch {} }}
              style={{ fontSize: 12, padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        </div>
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
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {whatsNewBannerEl}

      {/* What's New Modal — rendered at root level to avoid stacking context issues */}
      {showWhatsNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} style={{ color: accent }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>What&apos;s New</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>NestOps {APP_VERSION}</div>
                </div>
              </div>
              <button onClick={() => setShowWhatsNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {WHATS_NEW_ITEMS.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>✦</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowWhatsNew(false)}
              style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}

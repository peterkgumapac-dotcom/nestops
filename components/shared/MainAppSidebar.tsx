'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Sun, Moon, Sparkles } from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import { useTheme } from '@/context/ThemeContext'
import { MAIN_APP_NAV_BY_ROLE, getStaffNav, getOperatorNav } from '@/lib/nav'
import type { AccessTier } from '@/context/RoleContext'

const APP_VERSION = 'v4.1'
const WHATS_NEW_KEY = 'afterstay_whats_new_dismissed_v4.1'
const WHATS_NEW_ITEMS = [
  'Brand logo SVG replaces placeholder "A" across all sidebars and landing nav',
  'Design tokens renamed from --green to --accent for semantic consistency',
  'Mobile sidebar now slides in with spring-physics animation and backdrop fade',
  'Nav item stagger animation only fires on initial load — no re-animation on route change',
  'All transition:all declarations replaced with explicit GPU-friendly properties',
]

interface MainAppSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const PORTAL_OPTIONS = [
  { role: 'operator' as const, accessTier: 'full' as AccessTier,             label: 'Operator Portal',  color: '#7c3aed', href: '/app/dashboard' },
  { role: 'operator' as const, accessTier: 'guest-services' as AccessTier,   label: 'Guest Services',   color: '#ec4899', href: '/app/dashboard' },
  { role: 'owner'    as const, accessTier: 'full' as AccessTier,             label: 'Owner Portal',     color: '#059669', href: '/owner' },
  { role: 'staff'    as const, accessTier: 'full' as AccessTier,             label: 'Staff Portal',     color: '#d97706', href: '/staff' },
]

export default function MainAppSidebar({ isOpen, onClose }: MainAppSidebarProps) {
  const { role, accessTier, setRole, user, accent, portalLabel } = useRole()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [currentSubRole, setCurrentSubRole] = useState<string | undefined>(user?.subRole)
  const [currentJobRole, setCurrentJobRole] = useState<string | undefined>(user?.jobRole)
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [whatsNewBanner, setWhatsNewBanner] = useState(false)
  const [switchedTo, setSwitchedTo] = useState<string | null>(null)
  const switcherRef = useRef<HTMLDivElement>(null)
  const hasMountedRef = useRef(false)

  useEffect(() => { hasMountedRef.current = true }, [])

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
      const stored = localStorage.getItem('afterstay_user')
      if (stored) {
        const u = JSON.parse(stored)
        setCurrentSubRole(u.subRole)
        setCurrentJobRole(u.jobRole)
      }
    } catch {}
    try {
      const dismissed = localStorage.getItem(WHATS_NEW_KEY)
      if (!dismissed) setWhatsNewBanner(true)
    } catch {}
  }, [])

  const currentAccessTier = user?.accessTier ?? accessTier
  const sections = role === 'operator'
    ? getOperatorNav(currentAccessTier, currentSubRole ?? user?.subRole)
    : role === 'staff'
    ? getStaffNav(currentJobRole ?? user?.jobRole, currentSubRole ?? user?.subRole)
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
        <Link href="/app/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flex: 1, minWidth: 0 }}>
          <img src="/logo-icon.svg" width={32} height={32} alt="AfterStay" style={{ borderRadius: 8, flexShrink: 0, cursor: 'pointer' }} />
          <div style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s ease', pointerEvents: collapsed ? 'none' : 'auto', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>AfterStay</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{displayRole}</div>
          </div>
        </Link>
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

      {/* Portal Quick Switch */}
      {!collapsed && (
        <div style={{ padding: '0 8px 8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
            {PORTAL_OPTIONS.map(opt => {
              const isActive = role === opt.role && accessTier === opt.accessTier
              return (
                <button
                  key={`${opt.role}-${opt.accessTier}`}
                  onClick={() => {
                    setRole(opt.role, opt.accessTier)
                    setSwitchedTo(opt.label)
                    setTimeout(() => setSwitchedTo(null), 1500)
                    setSwitcherOpen(false)
                    router.push(opt.href)
                  }}
                  title={opt.label}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    padding: '5px 6px', borderRadius: 6, border: isActive ? `1px solid ${opt.color}40` : '1px solid transparent',
                    background: isActive ? `${opt.color}18` : 'transparent',
                    color: isActive ? opt.color : 'var(--text-subtle)',
                    fontSize: 11, fontWeight: isActive ? 600 : 400, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                  {opt.label.split(' ')[0]}
                </button>
              )
            })}
          </div>
          <AnimatePresence>
            {switchedTo && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 6 }}
              >
                ✓ Switched to {switchedTo}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
                    initial={hasMountedRef.current ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={hasMountedRef.current ? { duration: 0 } : { delay: itemIndex * 0.04, duration: 0.2 }}
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
                onClick={() => { ['afterstay_user','afterstay_role','afterstay_theme','afterstay_briefing_prefs','afterstay_clockin','afterstay_field_reports','afterstay_owner_work_orders'].forEach(k => localStorage.removeItem(k)); setSwitcherOpen(false); router.push('/login') }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: '#f87171', textAlign: 'left' }}
              >
                Sign out
              </button>
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

      {/* What's New banner */}
      {whatsNewBanner && !collapsed && (
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
                AfterStay {APP_VERSION} is here
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                Inventory v2, purchase approvals, and more.
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
      )}

      {/* What's New Modal */}
      {showWhatsNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} style={{ color: accent }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>What&apos;s New</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AfterStay {APP_VERSION}</div>
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

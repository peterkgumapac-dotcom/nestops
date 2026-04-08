'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Sun, Moon, Sparkles, ChevronDown,
} from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import { useTheme } from '@/context/ThemeContext'
import { NAV_BY_ROLE, getStaffNav, getOperatorNav } from '@/lib/nav'
import type { AccessTier } from '@/context/RoleContext'

const APP_VERSION = 'v4.1'
const WHATS_NEW_KEY = 'afterstay_whats_new_dismissed_v4.1'

const WHATS_NEW_ITEMS = [
  'Brand logo SVG replaces placeholder "A" across all sidebars and landing nav',
  'Design tokens renamed from --green to --accent for semantic consistency',
  'Mobile sidebar now slides in with spring-physics animation and backdrop fade',
  'What\'s New modal and banner entrance animations (scale + fade)',
  'Nav item stagger animation only fires on initial load — no re-animation on route change',
  'Landing page scroll reveals trigger at natural positions with rootMargin offset',
  'All transition:all declarations replaced with explicit GPU-friendly properties',
]

interface AppSidebarProps {
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggle?: () => void
}

const PORTAL_OPTIONS = [
  { role: 'operator' as const, accessTier: 'full' as AccessTier,             label: 'Operator Portal',       color: '#7c3aed', href: '/operator' },
  { role: 'operator' as const, accessTier: 'guest-services' as AccessTier,   label: 'Guest Services',        color: '#ec4899', href: '/app/dashboard' },
  { role: 'owner'    as const, accessTier: 'full' as AccessTier,             label: 'Owner Portal',          color: '#059669', href: '/owner' },
  { role: 'staff'    as const, accessTier: 'full' as AccessTier,             label: 'Staff Portal',          color: '#d97706', href: '/staff' },
]

interface StoredUser { id?: string; name?: string; role?: string; subRole?: string; jobRole?: string }

export default function AppSidebar({ isOpen, onClose, collapsed = false }: AppSidebarProps) {
  const { role, accessTier, setRole, accent, portalLabel } = useRole()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null)
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [whatsNewBanner, setWhatsNewBanner] = useState(false)
  const [switchedTo, setSwitchedTo] = useState<string | null>(null)
  const switcherRef = useRef<HTMLDivElement>(null)
  const hasMountedRef = useRef(false)
  // Collapsible section state: keyed by section label, default collapsed for 'Platform'
  const [sectionExpanded, setSectionExpanded] = useState<Record<string, boolean>>({
    Platform: false,
  })

  // Track initial mount so nav item stagger only fires once
  useEffect(() => {
    hasMountedRef.current = true
  }, [])

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
      const raw = localStorage.getItem('afterstay_user')
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

  const sections = role === 'operator'
    ? getOperatorNav(accessTier, storedUser?.subRole)
    : role === 'staff'
    ? getStaffNav(storedUser?.jobRole, storedUser?.subRole)
    : NAV_BY_ROLE[role]

  // Auto-expand collapsible sections when current path matches
  useEffect(() => {
    const updates: Record<string, boolean> = {}
    sections.forEach(section => {
      if (section.collapsible) {
        const isActive = section.items.some(item =>
          pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
        )
        if (isActive) updates[section.label] = true
      }
    })
    if (Object.keys(updates).length > 0) {
      setSectionExpanded(prev => ({ ...prev, ...updates }))
    }
  }, [pathname, sections])

  let globalIndex = 0

  const sidebarContent = (
    <div
      style={{
        width: collapsed ? 48 : 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '20px 8px', minHeight: 64, flexShrink: 0,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <img src="/logo-icon.svg" width={32} height={32} alt="AfterStay" style={{ borderRadius: 8, flexShrink: 0 }} />
        {!collapsed && (
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>AfterStay</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{portalLabel}</div>
          </div>
        )}
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
                    padding: '5px 6px', borderRadius: 6,
                    border: isActive ? `1px solid ${opt.color}40` : '1px solid transparent',
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
                Switched to {switchedTo}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Nav sections */}
      <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {sections.map((section, sIdx) => {
          const showLabel = section.label !== '' && !collapsed
          const isCollapsible = section.collapsible && !collapsed
          const isExpanded = !isCollapsible || sectionExpanded[section.label] !== false
          const sectionEl = (
            <div key={sIdx} style={{ marginBottom: 4 }}>
              {showLabel && (
                isCollapsible ? (
                  <button
                    onClick={() => setSectionExpanded(prev => ({ ...prev, [section.label]: !isExpanded }))}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'var(--text-subtle)', padding: '10px 8px 4px',
                      borderTop: sIdx > 0 ? '1px solid var(--border-subtle)' : 'none',
                      marginTop: sIdx > 0 ? 6 : 0,
                      background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    <span>{section.label}</span>
                    <ChevronDown
                      size={12}
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                ) : (
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--text-subtle)', padding: '10px 8px 4px',
                    borderTop: sIdx > 0 ? '1px solid var(--border-subtle)' : 'none',
                    marginTop: sIdx > 0 ? 6 : 0,
                  }}>
                    {section.label}
                  </div>
                )
              )}
              {sIdx > 0 && !showLabel && collapsed && (
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 4px' }} />
              )}
              {(!isCollapsible || isExpanded) && section.items.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
                const itemIndex = globalIndex++
                const isTickets = item.label === 'Tickets'
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
                        padding: collapsed ? '8px 0' : '7px 8px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: 7, marginBottom: 1,
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
                        <Icon size={16} strokeWidth={1.5} />
                        {collapsed && isTickets && item.badge ? (
                          <span style={{
                            position: 'absolute', top: -2, right: -2,
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--n-red)',
                          }} />
                        ) : !collapsed && item.badge ? (
                          <span style={{
                            position: 'absolute', top: -6, right: -6, fontSize: 9, fontWeight: 700,
                            color: '#fff', background: accent, borderRadius: '50%',
                            width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <span style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.15s ease', pointerEvents: 'none' }}>
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
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px', borderRadius: 8, background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)', overflow: 'hidden',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {displayInitials}
            </div>
            {!collapsed && (
              <div style={{ textAlign: 'left', whiteSpace: 'nowrap', flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{displayName}</div>
                <div style={{ fontSize: 11, textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                  {storedUser?.subRole ?? role}
                </div>
              </div>
            )}
          </button>

          {switcherOpen && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 4px)', left: collapsed ? 52 : 0,
              width: 180, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 10, padding: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', zIndex: 100,
            }}>
              {PORTAL_OPTIONS.map(opt => {
                const isActive = role === opt.role && accessTier === opt.accessTier
                return (
                  <button
                    key={`${opt.role}-${opt.accessTier}`}
                    onClick={() => { setRole(opt.role, opt.accessTier); setSwitcherOpen(false); router.push(opt.href) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 7,
                      background: isActive ? `${opt.color}1a` : 'transparent',
                      border: 'none', cursor: 'pointer', fontSize: 13,
                      color: isActive ? opt.color : 'var(--text-muted)', textAlign: 'left',
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Version badge — hidden when collapsed */}
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
      </div>
    </div>
  )

  // What's New banner
  const whatsNewBannerEl = whatsNewBanner && !collapsed && (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="hide-sm"
      style={{
      position: 'fixed', bottom: 24, left: 236, zIndex: 100,
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
    </motion.div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex" style={{ height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} className="md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ position: 'absolute', left: 0, top: 0, height: '100%' }}
            >
              <div style={{ position: 'relative', height: '100%' }}>
                {sidebarContent}
                <button onClick={onClose} aria-label="Close sidebar" style={{ position: 'absolute', top: 16, right: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-primary)', padding: 0, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {whatsNewBannerEl}

      {/* What's New Modal */}
      <AnimatePresence>
        {showWhatsNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}
            >
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
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}

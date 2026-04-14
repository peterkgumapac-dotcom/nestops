'use client'
import { useState, useRef, useEffect, ReactNode } from 'react'
import { Menu, Bell, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import type { AccessTier } from '@/context/RoleContext'
import ClockStatus from './ClockStatus'

const PORTAL_OPTIONS = [
  { role: 'operator' as const, accessTier: 'full' as AccessTier,           label: 'Operator Portal', color: '#7c3aed', href: '/operator',      preview: false },
  { role: 'operator' as const, accessTier: 'guest-services' as AccessTier, label: 'Guest Services',  color: '#ec4899', href: '/app/dashboard', preview: false },
  { role: 'owner'    as const, accessTier: 'full' as AccessTier,           label: 'Owner Portal',    color: '#059669', href: '/owner',         preview: false },
  { role: 'staff'    as const, accessTier: 'full' as AccessTier,           label: 'Staff Portal',    color: '#d97706', href: '/staff',         preview: false },
  { role: 'operator' as const, accessTier: 'preview' as AccessTier,        label: 'Guest Portal',    color: '#ADDF3C', href: '/guest/preview', preview: true  },
]

export interface ShellHeaderProps {
  variant?: 'rail' | 'full'
  onMobileOpen: () => void
  onToggle?: () => void
  toggleState?: boolean
  /** Omit the border-bottom (used inside the floating panel). */
  borderless?: boolean
  /** Extra content rendered before the user chip (alerts bell, clock, etc.). */
  rightSlot?: ReactNode
}

/**
 * Unified shell header: mobile hamburger + desktop toggle + right slot + user chip.
 * Single source of truth used by AppShell (rail + full), OwnerShell, MainAppShell.
 */
export default function ShellHeader({
  variant = 'full',
  onMobileOpen,
  onToggle,
  toggleState,
  borderless = false,
  rightSlot,
}: ShellHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { role, accessTier, setRole } = useRole()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('User')
  const [displayInitials, setDisplayInitials] = useState('US')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('afterstay_user')
      if (raw) {
        const u = JSON.parse(raw)
        if (u?.name) {
          setDisplayName(u.name)
          const parts = String(u.name).trim().split(' ')
          setDisplayInitials(
            parts.length >= 2
              ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
              : u.name.slice(0, 2).toUpperCase()
          )
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isRail = variant === 'rail'

  const hamburger = (
    <button
      className="md:hidden"
      onClick={onMobileOpen}
      aria-label="Open navigation menu"
      style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
    >
      <Menu size={20} />
    </button>
  )

  const desktopToggle = onToggle ? (
    isRail ? (
      <button
        className="hidden md:flex"
        onClick={onToggle}
        aria-label={toggleState ? 'Collapse navigation' : 'Expand navigation'}
        aria-expanded={toggleState}
        style={{
          alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 9,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          color: 'var(--text-muted)',
        }}
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    ) : (
      <button
        className="hidden md:flex"
        onClick={onToggle}
        aria-label={toggleState ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 7,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)',
        }}
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>
    )
  ) : null

  const userChip = (
    <div ref={userMenuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setUserMenuOpen(o => !o)}
        aria-label="Account menu"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '5px 12px 5px 5px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 999,
          cursor: 'pointer',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          color: '#fff', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {displayInitials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{displayName}</span>
        <ChevronDown size={13} style={{ color: 'var(--text-subtle)' }} />
      </button>

      {userMenuOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 280,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 14, padding: 10,
          boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
          zIndex: 300,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ padding: '6px 8px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Shift</div>
            <ClockStatus />
          </div>

          <Link
            href="/operator/notifications"
            onClick={() => setUserMenuOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 9,
              color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13,
              background: 'var(--bg-card)',
            }}
          >
            <Bell size={14} style={{ color: 'var(--text-muted)' }} />
            Notifications
            <span style={{
              marginLeft: 'auto',
              fontSize: 10, fontWeight: 700, color: '#fff',
              background: 'var(--accent)', padding: '2px 7px', borderRadius: 10,
            }}>3</span>
          </Link>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 8px 6px' }}>Switch portal</div>
            {PORTAL_OPTIONS.map(opt => {
              const isActive = role === opt.role && accessTier === opt.accessTier
              return (
                <button
                  key={`${opt.role}-${opt.accessTier}`}
                  onClick={() => {
                    setUserMenuOpen(false)
                    if (opt.preview) {
                      window.open(opt.href, '_blank', 'noopener,noreferrer')
                      return
                    }
                    setRole(opt.role, opt.accessTier)
                    router.push(opt.href)
                  }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8,
                    background: isActive ? `${opt.color}1a` : 'transparent',
                    border: 'none', cursor: 'pointer', fontSize: 12.5,
                    color: isActive ? opt.color : 'var(--text-muted)', textAlign: 'left',
                  }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                  <span>{opt.label}</span>
                  {opt.preview && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '2px 7px', borderRadius: 6,
                      background: `${opt.color}22`, color: opt.color,
                      border: `1px solid ${opt.color}40`,
                    }}>Preview ↗</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  if (isRail) {
    // Rail variant lives inside the floating panel — borderless, transparent.
    return (
      <>
        {hamburger}
        {desktopToggle}
        <span className="md:hidden" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>AfterStay</span>
        <div style={{ flex: 1 }} />
        {rightSlot}
        {userChip}
      </>
    )
  }

  return (
    <div
      className="shell-header"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56,
        borderBottom: borderless ? 'none' : '1px solid var(--border)',
        background: 'var(--bg-surface)', flexShrink: 0, gap: 8,
      }}
    >
      {hamburger}
      {desktopToggle}
      <span className="md:hidden" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>AfterStay</span>
      <div style={{ flex: 1 }} />
      {rightSlot}
      {userChip}
    </div>
  )
}

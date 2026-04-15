'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { X, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { OWNER_NAV } from '@/lib/nav'
import { useRole } from '@/context/RoleContext'
import ShellHeader from './ShellHeader'

const ACCENT = '#2563eb'

const ROLE_PILLS = [
  { label: 'Operator', role: 'operator' as const, color: '#14b8a6', href: '/operator' },
  { label: 'Staff', role: 'staff' as const, color: '#d97706', href: '/staff' },
]

export default function OwnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { setRole } = useRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('Sarah J.')
  const [userInitials, setUserInitials] = useState('SJ')
  const [avatarColor, setAvatarColor] = useState('#2563eb')
  const [switchedTo, setSwitchedTo] = useState<string | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('afterstay_user')
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser)
        setUserName(u.name ?? 'Sarah J.')
        setUserInitials(u.avatarInitials ?? 'SJ')
        setAvatarColor(u.avatarColor ?? '#2563eb')
      } catch { /* ignore */ }
    }
  }, [])

  const handleRoleSwitch = (role: 'operator' | 'staff', href: string, label: string) => {
    setRole(role)
    setSwitchedTo(label)
    setTimeout(() => { setSwitchedTo(null); router.push(href) }, 900)
  }

  const sidebarContent = (
    <div style={{
      width: 240, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 8px', minHeight: 64, flexShrink: 0 }}>
        <img src="/logo-icon.svg" width={32} height={32} alt="AfterStay" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>AfterStay</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Owner Portal</div>
        </div>
      </div>

      {/* Quick Switch pills */}
      <div style={{ padding: '0 12px 8px', display: 'flex', gap: 6 }}>
        {ROLE_PILLS.map(p => (
          <button
            key={p.role}
            onClick={() => handleRoleSwitch(p.role, p.href, p.label)}
            style={{
              flex: 1, padding: '5px 0', borderRadius: 6,
              border: `1px solid ${p.color}33`, background: `${p.color}14`,
              color: p.color, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Switched badge */}
      <AnimatePresence>
        {switchedTo && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              margin: '0 12px 8px', padding: '6px 10px', borderRadius: 6,
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
              fontSize: 11, fontWeight: 600, color: '#10b981', textAlign: 'center',
            }}
          >
            Switched to {switchedTo} ✓
          </motion.div>
        )}
      </AnimatePresence>

      {/* All nav sections */}
      <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
        {OWNER_NAV.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: 12 }}>
            {section.label ? (
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '0 8px', marginBottom: 4, marginTop: sIdx > 0 ? 4 : 0,
              }}>
                {section.label}
              </div>
            ) : null}
            {section.items.map((item, i) => {
              const Icon = item.icon
              const isActive = item.href === '/owner'
                ? pathname === '/owner'
                : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sIdx * 3 + i) * 0.03, duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '7px 8px', borderRadius: 7, marginBottom: 1,
                      color: isActive ? ACCENT : 'var(--text-muted)',
                      background: isActive ? `${ACCENT}12` : 'transparent',
                      borderLeft: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
                      textDecoration: 'none', fontSize: 13.5,
                      transition: 'background 0.15s ease',
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Icon size={17} strokeWidth={1.6} />
                      {item.badge && (
                        <span style={{
                          position: 'absolute', top: -6, right: -6, fontSize: 9, fontWeight: 700,
                          color: '#fff', background: ACCENT, borderRadius: '50%',
                          width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.label}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {userInitials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{userName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Owner</div>
          </div>
          <button
            onClick={() => {
              ['afterstay_user', 'afterstay_role', 'afterstay_theme', 'afterstay_briefing_prefs', 'afterstay_clockin', 'afterstay_field_reports', 'afterstay_owner_work_orders']
                .forEach(k => localStorage.removeItem(k))
              router.push('/login')
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 4, borderRadius: 6, display: 'flex' }}
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-page)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} className="md:hidden">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%' }}>
            {sidebarContent}
            <button onClick={() => setMobileOpen(false)} aria-label="Close sidebar" style={{ position: 'absolute', top: 16, right: 10, background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-primary)', padding: 0, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ShellHeader variant="full" onMobileOpen={() => setMobileOpen(true)} />

        <main className="shell-main" style={{ flex: 1, overflowY: 'auto', padding: 24, position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

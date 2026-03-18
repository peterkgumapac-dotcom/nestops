'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { OWNER_NAV } from '@/lib/nav'

const ACCENT = '#2563eb'

export default function OwnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('Sarah J.')
  const [userInitials, setUserInitials] = useState('SJ')
  const [avatarColor, setAvatarColor] = useState('#2563eb')

  useEffect(() => {
    const savedUser = localStorage.getItem('nestops_user')
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser)
        setUserName(u.name ?? 'Sarah J.')
        setUserInitials(u.avatarInitials ?? 'SJ')
        setAvatarColor(u.avatarColor ?? '#2563eb')
      } catch { /* ignore */ }
    }
  }, [])

  const navItems = OWNER_NAV[0]?.items ?? []

  const sidebarContent = (
    <div style={{
      width: 240, background: '#ffffff', borderRight: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px', minHeight: 64, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14, flexShrink: 0 }}>
          N
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>NestOps</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Owner Portal</div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
        {navItems.map((item, i) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/owner' && pathname.startsWith(item.href + '/'))
            || (item.href === '/owner' && pathname === '/owner')
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
            >
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '7px 8px', borderRadius: 7, marginBottom: 1,
                  color: isActive ? ACCENT : '#64748b',
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
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px', flexShrink: 0, borderTop: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', borderRadius: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {userInitials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{userName}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Owner</div>
          </div>
          <button
            onClick={() => { ['nestops_user','nestops_role','nestops_theme','nestops_briefing_prefs','nestops_clockin','nestops_field_reports','nestops_owner_work_orders'].forEach(k => localStorage.removeItem(k)); router.push('/login') }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, display: 'flex' }}
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
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
            <button onClick={() => setMobileOpen(false)} style={{ position: 'absolute', top: 16, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 52, borderBottom: '1px solid #e2e8f0',
          background: '#ffffff', flexShrink: 0,
        }}>
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            <Menu size={20} />
          </button>
          <span className="md:hidden" style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>NestOps</span>
          <div className="hidden md:block" />
          <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}>
            <Bell size={18} strokeWidth={1.6} />
            <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: ACCENT, color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              3
            </span>
          </button>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: 24, position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

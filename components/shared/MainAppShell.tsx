'use client'
import { useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import MainAppSidebar from './MainAppSidebar'
import { useRole } from '@/context/RoleContext'

export default function MainAppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
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

          {/* Notification bell */}
          <button
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}
          >
            <Bell size={18} strokeWidth={1.6} />
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 16, height: 16, borderRadius: '50%',
              background: accent, color: '#fff',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              3
            </span>
          </button>
        </div>

        <main style={{ flex: 1, overflowY: 'auto', padding: 24, position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, Moon } from 'lucide-react'
import { OPERATOR_NAV } from '@/lib/nav'
import { useTheme } from '@/context/ThemeContext'

const RAIL_ITEMS = OPERATOR_NAV.flatMap(s => s.items)

type RailVariant = 'standalone' | 'inPanel'

export default function AppSidebarRail({
  expanded = false,
  variant = 'standalone',
}: { expanded?: boolean; variant?: RailVariant }) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  const inPanel = variant === 'inPanel'

  const iconBtn = (active: boolean): React.CSSProperties => ({
    width: expanded ? '100%' : 40,
    height: 40, borderRadius: 10,
    display: 'flex', alignItems: 'center',
    justifyContent: expanded ? 'flex-start' : 'center',
    gap: expanded ? 12 : 0,
    padding: expanded ? '0 12px' : 0,
    background: active ? 'var(--bg-elevated)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    border: 'none', cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
    textDecoration: 'none',
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  })

  return (
    <aside
      className={`hidden md:flex app-shell-rail ${inPanel ? 'in-panel-rail' : ''}`}
      style={{
        width: inPanel ? '100%' : (expanded ? 220 : 68),
        height: inPanel ? '100%' : '100vh',
        position: inPanel ? 'static' : 'sticky',
        top: inPanel ? undefined : 0,
        flexShrink: 0,
        flexDirection: 'column',
        alignItems: expanded ? 'stretch' : 'center',
        padding: inPanel ? '4px 0' : (expanded ? '16px 12px' : '16px 0'),
        transition: 'width 0.2s ease, padding 0.2s ease',
        background: inPanel ? 'transparent' : 'var(--bg-surface)',
        borderRight: inPanel ? 'none' : '1px solid var(--border)',
      }}
    >
      {/* Logo — solid dark rounded square */}
      <Link href="/operator" aria-label="AfterStay home" style={{
        height: 40, borderRadius: 10,
        display: 'flex', alignItems: 'center',
        justifyContent: expanded ? 'flex-start' : 'center',
        gap: expanded ? 10 : 0,
        padding: expanded ? '0 10px' : 0,
        width: expanded ? '100%' : 40,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        marginBottom: 18, flexShrink: 0,
        textDecoration: 'none',
      }}>
        <img src="/logo-icon.svg" width={20} height={20} alt="" style={{ flexShrink: 0, color: 'var(--text-primary)' }} />
        {expanded && (
          <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', textDecoration: 'none' }}>AfterStay</span>
        )}
      </Link>

      {/* Nav icons */}
      <nav
        className="rail-scroll"
        style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          flex: 1, width: '100%', alignItems: expanded ? 'stretch' : 'center',
          overflowY: 'auto', paddingBottom: 8,
        }}
      >
        {RAIL_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              style={{ ...iconBtn(isActive), position: 'relative' }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={16} strokeWidth={1.25} style={{ flexShrink: 0 }} />
              {expanded && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              {item.badge ? (
                <span style={{
                  ...(expanded
                    ? { marginLeft: 'auto' }
                    : { position: 'absolute', top: 4, right: 4 }),
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#ef4444',
                }} />
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: stacked moon + sun */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, flexShrink: 0, width: expanded ? '100%' : 'auto' }}>
        <button
          onClick={() => { if (theme !== 'dark') toggleTheme() }}
          title="Dark mode"
          aria-label="Dark mode"
          style={iconBtn(theme === 'dark')}
        >
          <Moon size={16} style={{ flexShrink: 0 }} />
          {expanded && <span>Dark</span>}
        </button>
        <button
          onClick={() => { if (theme !== 'light') toggleTheme() }}
          title="Light mode"
          aria-label="Light mode"
          style={iconBtn(theme === 'light')}
        >
          <Sun size={16} style={{ flexShrink: 0 }} />
          {expanded && <span>Light</span>}
        </button>
      </div>
    </aside>
  )
}

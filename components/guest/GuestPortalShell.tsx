'use client'
import { useState, useRef, ReactNode } from 'react'
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion'
import { Home, BookOpen, Compass, ShoppingBag, Users, LucideIcon, Moon, Sun } from 'lucide-react'
import { useGuestTheme } from '@/lib/guest/theme-context'

export type GuestTab = 'home' | 'guide' | 'discover' | 'services' | 'trip'

interface TabDef {
  id: GuestTab
  label: string
  Icon: LucideIcon
}

const TABS: TabDef[] = [
  { id: 'home',     label: 'Home',     Icon: Home },
  { id: 'guide',    label: 'Guide',    Icon: BookOpen },
  { id: 'discover', label: 'Discover', Icon: Compass },
  { id: 'services', label: 'Services', Icon: ShoppingBag },
  { id: 'trip',      label: 'Our Trip',  Icon: Users },
]

const TAB_INDEX: Record<GuestTab, number> = {
  home: 0, guide: 1, discover: 2, services: 3, trip: 4,
}

interface Props {
  initial?: GuestTab
  tab?: GuestTab
  onTabChange?: (tab: GuestTab) => void
  panels: Record<GuestTab, ReactNode>
  banner?: ReactNode
}

export default function GuestPortalShell({
  initial = 'home', tab: controlledTab, onTabChange, panels, banner,
}: Props) {
  const { theme: G, resolved, toggle } = useGuestTheme()
  const isDark = resolved === 'dark'

  const [internalTab, setInternalTab] = useState<GuestTab>(initial)
  const tab = controlledTab ?? internalTab
  const reduced = useReducedMotion()
  const prevIndexRef = useRef<number>(TAB_INDEX[tab])

  const currentIndex = TAB_INDEX[tab]
  const direction = currentIndex >= prevIndexRef.current ? 1 : -1
  prevIndexRef.current = currentIndex

  function handleSelect(next: GuestTab) {
    if (controlledTab === undefined) setInternalTab(next)
    onTabChange?.(next)
  }

  const spring = { type: 'spring' as const, stiffness: 320, damping: 32, mass: 0.9 }

  // Nav glass colors adapt to theme
  const navGlass = isDark
    ? 'rgba(34,37,41,0.92)'
    : 'rgba(255,255,255,0.92)'
  const navBorder = isDark
    ? 'rgba(255,255,255,0.06)'
    : 'rgba(28,25,23,0.06)'
  const navShadow = isDark
    ? '0 -4px 24px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.24)'
    : '0 -4px 24px rgba(28,25,23,0.06), 0 4px 16px rgba(28,25,23,0.08)'

  return (
    <div
      className="guest-portal-shell"
      style={{
        height: '100%',
        minHeight: '100vh',
        background: G.bg,
        color: G.text,
        fontFamily: 'var(--font-nunito), var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        transition: 'background 0.35s ease, color 0.35s ease',
      }}
    >
      {banner}

      {/* Theme toggle — top-right */}
      <button
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 110,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `1px solid ${G.border}`,
          background: G.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: G.shadowSm,
          transition: 'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        <motion.div
          key={resolved}
          initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 30, opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {isDark
            ? <Sun size={18} color={G.accent} strokeWidth={2} />
            : <Moon size={18} color={G.textMuted} strokeWidth={2} />}
        </motion.div>
      </button>

      {/* Scrollable content */}
      <div style={{
        flex: 1,
        width: '100%', maxWidth: 480,
        paddingBottom: 100,
        overflowX: 'hidden',
      }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 24 }}
            animate={reduced
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  x: 0,
                  transition: {
                    ...spring,
                    staggerChildren: 0.04,
                    delayChildren: 0.05,
                  },
                }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -direction * 24, transition: { duration: 0.15 } }}
          >
            {panels[tab]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav — sticky to container bottom */}
      <LayoutGroup>
        <nav
          role="tablist"
          aria-label="Guest portal navigation"
          style={{
            position: 'sticky',
            bottom: 0,
            width: '100%',
            maxWidth: 480,
            padding: '0 20px 16px',
            background: 'transparent',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            height: 68,
            background: navGlass,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 31,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 8px',
            border: `1px solid ${navBorder}`,
            boxShadow: navShadow,
            pointerEvents: 'auto',
            transition: 'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
          }}>
            {TABS.map(t => {
              const active = tab === t.id
              const { Icon } = t
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  aria-label={t.label}
                  onClick={() => handleSelect(t.id)}
                  style={{
                    flex: 1,
                    position: 'relative',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 4,
                    padding: '8px 2px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: 36,
                    height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {active && (
                      <motion.div
                        layoutId="guest-nav-active"
                        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 36 }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          background: G.accent,
                        }}
                      />
                    )}
                    <Icon
                      size={20}
                      color={active ? G.accentFg : G.textMuted}
                      strokeWidth={1.75}
                      style={{ position: 'relative', zIndex: 1 }}
                    />
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700,
                    color: active ? G.accent : G.textMuted,
                  }}>{t.label}</div>
                </button>
              )
            })}
          </div>
        </nav>
      </LayoutGroup>
    </div>
  )
}

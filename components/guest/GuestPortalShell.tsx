'use client'
import { useState, useRef, ReactNode } from 'react'
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion'
import { Home, BookOpen, Compass, ShoppingBag, Users, LucideIcon } from 'lucide-react'
import { G } from '@/lib/guest/theme'

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

/**
 * 5-tab warm cream bottom-nav shell for the guest portal preview.
 * Frosted white glass nav with olive active state, always-visible labels.
 * Uses sticky positioning so it works inside both viewport and phone frame containers.
 */
export default function GuestPortalShell({
  initial = 'home', tab: controlledTab, onTabChange, panels, banner,
}: Props) {
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
      }}
    >
      {banner}

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
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 31,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 8px',
            border: '1px solid rgba(28,25,23,0.06)',
            boxShadow: '0 -4px 24px rgba(28,25,23,0.06), 0 4px 16px rgba(28,25,23,0.08)',
            pointerEvents: 'auto',
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
                      color={active ? '#FFFFFF' : G.textMuted}
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

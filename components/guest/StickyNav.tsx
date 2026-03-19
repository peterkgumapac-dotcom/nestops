'use client'
import { useEffect, useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { G } from '@/lib/guest/theme'

interface NavItem {
  id: string
  label: string
  danger?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { id: 'essentials', label: 'Essentials' },
  { id: 'guide',      label: 'Guide' },
  { id: 'area',       label: 'Explore' },
  { id: 'addons',     label: 'Add-ons' },
  { id: 'contact',    label: 'Contact' },
  { id: 'sos',        label: 'SOS', danger: true },
]

interface Props {
  accentColor: string
  hasIssues?: boolean
  onSOS?: () => void
}

export default function StickyNav({ accentColor, hasIssues, onSOS }: Props) {
  const [scrolled, setScrolled]  = useState(false)
  const [active, setActive]      = useState('essentials')
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => {
    setScrolled(v > 300)
  })

  useEffect(() => {
    const sectionIds = ['essentials', 'guide', 'area', 'addons', 'contact', 'issues']
    const observers: IntersectionObserver[] = []

    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  function scrollTo(id: string) {
    if (id === 'sos') { onSOS?.(); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const items: NavItem[] = [
    ...NAV_ITEMS,
    ...(hasIssues ? [{ id: 'issues', label: 'My Issues' }] : []),
  ]

  return (
    <motion.div
      animate={{
        background: scrolled ? 'rgba(250,249,246,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
        borderBottom: scrolled ? `1px solid rgba(0,0,0,0.06)` : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.05)' : 'none',
      }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'sticky', top: 0, zIndex: 40,
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}
    >
      <div style={{
        display: 'flex', gap: 6, overflowX: 'auto',
        padding: '10px 16px 10px',
        scrollbarWidth: 'none',
      }}>
        {items.map(item => {
          const isActive = active === item.id
          const isDanger = item.danger
          return (
            <motion.button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              animate={{
                background: isDanger
                  ? (isActive ? G.red : G.red + '10')
                  : (isActive ? accentColor : 'rgba(255,255,255,0.75)'),
                color: isDanger
                  ? (isActive ? '#fff' : G.red)
                  : (isActive ? '#fff' : G.textBody),
                boxShadow: isActive && !isDanger
                  ? `0 2px 12px ${accentColor}40, 0 0 0 1px ${accentColor}30`
                  : '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)',
                fontWeight: isActive ? 700 : 500,
              }}
              transition={{ duration: 0.2 }}
              style={{
                flexShrink: 0,
                padding: '7px 16px', borderRadius: 22,
                border: 'none', cursor: 'pointer',
                fontSize: 13,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', gap: 5,
                position: 'relative',
              }}
            >
              {item.label}
              {item.id === 'issues' && hasIssues && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: G.amber, flexShrink: 0,
                  boxShadow: `0 0 6px ${G.amber}`,
                }} />
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

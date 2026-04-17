'use client'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useGuestTheme } from '@/lib/guest/theme-context'

interface Props {
  message: string
}

export default function WelcomeSection({ message }: Props) {
  const { theme: G, resolved } = useGuestTheme()
  const isDark = resolved === 'dark'
  const [expanded, setExpanded] = useState(false)
  const reduced = useReducedMotion()
  const CUTOFF = 180
  const long = message.length > CUTOFF

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: isDark ? `${G.surface}e8` : 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${G.border}`,
        borderRadius: 20,
        boxShadow: G.shadowMd,
        padding: '20px 20px 18px',
        margin: '0 16px 12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative quote mark */}
      <div style={{
        position: 'absolute', top: 10, left: 14,
        fontSize: 72, lineHeight: 1, fontFamily: 'Georgia, serif',
        color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)', fontWeight: 900,
        userSelect: 'none', pointerEvents: 'none',
        letterSpacing: '-0.05em',
      }}>
        "
      </div>

      <p style={{
        fontSize: 14.5, lineHeight: 1.7,
        color: G.textBody, margin: 0,
        fontFamily: 'var(--font-sans)',
        position: 'relative', zIndex: 1,
        paddingTop: 2,
      }}>
        {long && !expanded ? message.slice(0, CUTOFF) + '…' : message}
      </p>

      {long && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: G.accent, fontSize: 13, fontWeight: 700,
            padding: '8px 0 0', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {expanded ? '↑ Show less' : 'Read more ↓'}
        </button>
      )}
    </motion.div>
  )
}

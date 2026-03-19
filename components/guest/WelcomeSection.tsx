'use client'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { G } from '@/lib/guest/theme'

interface Props {
  message: string
}

export default function WelcomeSection({ message }: Props) {
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
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.92)',
        borderRadius: 20,
        boxShadow: '0 4px 28px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.85)',
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
        color: 'rgba(0,0,0,0.04)', fontWeight: 900,
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
            color: 'var(--accent, #b8a088)', fontSize: 13, fontWeight: 700,
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

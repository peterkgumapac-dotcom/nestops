'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface IntentCardProps {
  icon: React.ElementType
  iconColor: string
  title: string
  count: number
  subtitle?: string
  index: number
  children: React.ReactNode
}

export default function IntentCard({
  icon: Icon, iconColor, title, count, subtitle, index, children,
}: IntentCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.04 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* ── Header (always visible) ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Icon circle */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: `${iconColor}18`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={16} strokeWidth={1.5} style={{ color: iconColor }} />
        </div>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          {subtitle && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{subtitle}</span>
          )}
        </div>

        {/* Count badge */}
        <span style={{
          fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
          padding: '2px 10px', borderRadius: 10,
          background: count > 0 ? `${iconColor}18` : 'var(--bg-elevated)',
          color: count > 0 ? iconColor : 'var(--text-subtle)',
          flexShrink: 0,
        }}>
          {count}
        </span>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={16} style={{ color: 'var(--text-subtle)' }} />
        </motion.div>
      </button>

      {/* ── Expanded rows ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

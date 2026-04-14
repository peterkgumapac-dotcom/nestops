'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronDown } from 'lucide-react'
import type { AttentionItem } from '@/lib/data/dashboardAggregates'

interface NeedsAttentionPanelProps {
  items: AttentionItem[]
}

const MAX_VISIBLE = 5

export default function NeedsAttentionPanel({ items }: NeedsAttentionPanelProps) {
  const [expanded, setExpanded] = useState(false)

  // Empty state
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CheckCircle size={14} style={{ color: '#10b981' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--status-green-fg, #10b981)' }}>
          All clear — nothing needs your attention
        </span>
      </motion.div>
    )
  }

  const visible = expanded ? items : items.slice(0, MAX_VISIBLE)
  const hasMore = items.length > MAX_VISIBLE

  const accentColor = items[0]?.severity === 'danger' ? 'var(--status-danger)' : 'var(--status-warning)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px 0',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Needs Attention
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            padding: '1px 7px',
            borderRadius: 8,
            background: `${accentColor}22`,
            color: accentColor,
          }}
        >
          {items.length}
        </span>
      </div>

      {/* Items */}
      <div style={{ padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <AnimatePresence initial={false}>
          {visible.map((item, i) => {
            const Icon = item.icon
            const rowColor = item.severity === 'danger' ? 'var(--status-danger)' : 'var(--status-warning)'
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: i < visible.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <Icon size={14} style={{ color: rowColor, flexShrink: 0 }} />
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1.4,
                  }}
                >
                  {item.text}
                </span>
                {item.actionLabel && (
                  <button
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: `${rowColor}22`,
                      color: rowColor,
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {item.actionLabel}
                  </button>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* View all / collapse */}
        {hasMore && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              justifyContent: 'center',
              marginTop: 6,
              padding: '4px 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            {expanded ? 'Show less' : `View all (${items.length})`}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-flex' }}
            >
              <ChevronDown size={12} />
            </motion.span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

'use client'
import { motion } from 'framer-motion'
import type { SourceNodeData } from '@/lib/data/pulseScenes'
import { SEVERITY_CONFIG } from '@/lib/data/pulseScenes'

interface SourceNodeProps {
  source: SourceNodeData
}

const BADGE_STYLES: Record<string, { bg: string; fg: string; border: string }> = {
  green:  { bg: 'var(--status-green-bg)',  fg: 'var(--status-green-fg)',  border: 'rgba(16,185,129,0.25)' },
  red:    { bg: 'var(--status-red-bg)',    fg: 'var(--status-red-fg)',    border: 'rgba(239,68,68,0.25)' },
  amber:  { bg: 'var(--status-amber-bg)',  fg: 'var(--status-amber-fg)',  border: 'rgba(245,158,11,0.25)' },
}

export default function SourceNode({ source }: SourceNodeProps) {
  const badge = BADGE_STYLES[source.badgeVariant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] flex items-center gap-2.5"
    >
      {/* EVENT SOURCE label */}
      <span className="absolute -top-2 left-3 text-[8px] font-semibold tracking-widest uppercase text-[var(--text-subtle)] bg-[var(--bg-card)] px-1">
        EVENT SOURCE
      </span>

      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
        style={{ background: source.avatarColor }}
      >
        {source.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-[var(--text-primary)]">{source.actor}</div>
        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{source.description}</div>
        <div className="text-[9px] text-[var(--text-subtle)] font-mono mt-0.5">{source.meta}</div>
      </div>

      {/* Badge */}
      {badge && (
        <span
          className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide shrink-0"
          style={{
            background: badge.bg,
            color: badge.fg,
            border: `1px solid ${badge.border}`,
          }}
        >
          {source.badgeText}
        </span>
      )}
    </motion.div>
  )
}

'use client'
import { motion } from 'framer-motion'
import type { PulseFeedItem } from '@/lib/data/pulseScenes'
import { SEVERITY_CONFIG } from '@/lib/data/pulseScenes'

interface PulseFeedEntryProps {
  item: PulseFeedItem
  index: number
  isNew?: boolean
}

const BADGE_STYLES: Record<string, { bg: string; fg: string; border: string }> = {
  green:  { bg: 'var(--status-green-bg)',  fg: 'var(--status-green-fg)',  border: 'rgba(16,185,129,0.25)' },
  red:    { bg: 'var(--status-red-bg)',    fg: 'var(--status-red-fg)',    border: 'rgba(239,68,68,0.25)' },
  amber:  { bg: 'var(--status-amber-bg)',  fg: 'var(--status-amber-fg)',  border: 'rgba(245,158,11,0.25)' },
  blue:   { bg: 'var(--status-blue-bg)',   fg: 'var(--status-blue-fg)',   border: 'rgba(59,130,246,0.25)' },
}

export default function PulseFeedEntry({ item, index, isNew }: PulseFeedEntryProps) {
  const accentColor = SEVERITY_CONFIG[item.severity]?.color ?? '#6b7280'
  const badge = item.badgeVariant ? BADGE_STYLES[item.badgeVariant] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className={`
        relative flex gap-2 px-2.5 py-2 rounded-lg border
        bg-[var(--bg-elevated)] overflow-hidden
        ${isNew ? `pulse-feed-flash-${item.severity}` : 'border-[var(--border)]'}
      `}
    >
      {/* Left accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
        style={{ background: accentColor }}
      />

      {/* Avatar */}
      <div
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[8px] font-semibold text-white shrink-0 mt-0.5"
        style={{ background: item.avatarColor }}
      >
        {item.initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[10px] font-semibold text-[var(--text-primary)] truncate">{item.actor}</span>
          <span className="text-[8px] text-[var(--text-subtle)] font-mono shrink-0">{item.time}</span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] leading-snug mb-0.5">{item.action}</div>
        <div className="text-[9px] text-[var(--text-subtle)]">{item.property}</div>
        {badge && item.badgeText && (
          <span
            className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wide"
            style={{
              background: badge.bg,
              color: badge.fg,
              border: `1px solid ${badge.border}`,
            }}
          >
            {item.badgeText}
          </span>
        )}
        {item.progress !== undefined && (
          <div className="mt-1 h-0.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${item.progress}%`, background: accentColor }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

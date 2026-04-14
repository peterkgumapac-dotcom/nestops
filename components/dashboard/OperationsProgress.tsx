'use client'
import { motion } from 'framer-motion'
import type { OperationsProgressData } from '@/lib/data/dashboardAggregates'

interface OperationsProgressProps {
  data: OperationsProgressData
  dateLabel?: string
}

export default function OperationsProgress({ data, dateLabel }: OperationsProgressProps) {
  const { overall, departments, warnings } = data
  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference * (1 - overall.pct / 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
      }}
      className="stack-sm"
    >
      {/* Left: Donut */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke="var(--border-subtle, rgba(255,255,255,0.04))"
              strokeWidth="6"
            />
            <motion.circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              {overall.pct}%
            </span>
          </div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
          {overall.completed}/{overall.total} tasks
        </span>
      </div>

      {/* Right: Department bars + warnings */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Operations Progress
          </span>
          {dateLabel && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
              {dateLabel}
            </span>
          )}
          {/* Warning pills */}
          {warnings.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {warnings.map((w, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 8,
                    background: 'var(--status-warning-bg, rgba(245,158,11,0.15))',
                    color: 'var(--status-warning)',
                  }}
                >
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Department progress bars */}
        {departments.map(dept => (
          <div key={dept.type} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
                {dept.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                }}
              >
                {dept.completed}/{dept.total}
              </span>
            </div>
            <div
              style={{
                height: 6,
                width: '100%',
                borderRadius: 3,
                background: 'var(--bg-elevated)',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dept.pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: 3,
                  background: dept.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

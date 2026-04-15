'use client'
import { motion } from 'framer-motion'
import type { Severity } from '@/lib/data/pulseScenes'

interface PulseDotProps {
  severity: Severity
  size?: 'sm' | 'md'
}

const DOT_COLORS: Record<Severity, { core: string; glow: string }> = {
  green: { core: '#10b981', glow: 'rgba(16,185,129,0.55)' },
  amber: { core: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
  red:   { core: '#ef4444', glow: 'rgba(239,68,68,0.65)' },
}

export default function PulseDot({ severity, size = 'md' }: PulseDotProps) {
  const { core, glow } = DOT_COLORS[severity]
  const isSm = size === 'sm'
  const coreSize = isSm ? 8 : 14
  const wrapSize = isSm ? 20 : 44

  return (
    <motion.div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: wrapSize, height: wrapSize }}
      key={severity}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Core dot */}
      <div
        className={`pulse-core pulse-core-${severity} rounded-full relative z-10`}
        style={{
          width: coreSize,
          height: coreSize,
          background: core,
          boxShadow: `0 0 ${isSm ? 8 : 14}px ${glow}, 0 0 ${isSm ? 3 : 5}px ${core}`,
        }}
      />
      {/* Rings */}
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`pulse-ring pulse-ring-${severity} absolute rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none`}
          style={{ animationDelay: `${i * (severity === 'red' ? 0.25 : severity === 'amber' ? 0.6 : 1.33)}s` }}
        />
      ))}
    </motion.div>
  )
}

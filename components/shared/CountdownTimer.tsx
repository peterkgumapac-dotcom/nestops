'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface CountdownTimerProps {
  targetTime: string
  label: string
  context?: string
  onComplete?: () => void
  compact?: boolean
}

function calculateTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return null
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { hours, minutes, seconds, diff }
}

export default function CountdownTimer({ targetTime, label, context, onComplete, compact }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetTime))
  // Track whether the component has already mounted so we only animate on initial entry,
  // not on every subsequent per-second state update.
  const hasMounted = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const tl = calculateTimeLeft(targetTime)
      setTimeLeft(tl)
      if (!tl && onComplete) onComplete()
    }, 1000)
    return () => clearInterval(interval)
  }, [targetTime, onComplete])

  const diffMs = new Date(targetTime).getTime() - Date.now()
  const minutesLeft = diffMs / 60000

  let timerColor = '#3b82f6'
  if (minutesLeft < 0) timerColor = '#dc2626'
  else if (minutesLeft < 30) timerColor = '#ea580c'
  else if (minutesLeft < 60) timerColor = '#d97706'

  const { hours, minutes, seconds } = timeLeft ?? { hours: 0, minutes: 0, seconds: 0 }

  if (!timeLeft) {
    const minutesLate = Math.abs(Math.floor(minutesLeft))
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          {label}
        </div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: 32, fontWeight: 800, color: '#dc2626' }}
        >
          {minutesLate} MINUTES LATE
        </motion.div>
        {context && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>{context}</div>}
      </div>
    )
  }

  // Animate digits only on the initial mount; after that render without re-animating
  // so the entry transition doesn't fire on every 1-second tick.
  const animateProps = !hasMounted.current
    ? { initial: { y: -10, opacity: 0 }, animate: { y: 0, opacity: 1 } }
    : { initial: false as const, animate: { y: 0, opacity: 1 } }

  // Mark as mounted after the first render pass
  if (!hasMounted.current) hasMounted.current = true

  if (compact) {
    return (
      <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 22, fontWeight: 700, color: timerColor }}>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {[hours, minutes, seconds].map((unit, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <motion.div
              {...animateProps}
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: timerColor,
                fontVariantNumeric: 'tabular-nums',
                minWidth: 64,
                textAlign: 'center',
              }}
            >
              {String(unit).padStart(2, '0')}
            </motion.div>
            {i < 2 && <span style={{ fontSize: 36, color: timerColor, opacity: 0.5 }}>:</span>}
          </div>
        ))}
      </div>
      {context && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>{context}</div>}
    </div>
  )
}

'use client'
import { useEffect, useRef, useState } from 'react'
import { LucideIcon } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  subtitle?: string
  animate?: boolean
}

export default function StatCard({ label, value, icon: Icon, subtitle, animate = true }: StatCardProps) {
  const { accent } = useRole()
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' && animate ? 0 : value)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!animate || typeof value !== 'number' || hasAnimated.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true
        const duration = 800
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplayValue(Math.round(eased * (value as number)))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, animate])

  return (
    <div
      ref={ref}
      className="card-elevated p-5 cursor-default group"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.2), 0 12px 40px rgba(0,0,0,0.15)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="label-upper mb-2">{label}</p>
          <p className="text-3xl font-semibold heading" style={{ color: 'var(--text-primary)' }}>
            {displayValue}
          </p>
          {subtitle && <p className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>{subtitle}</p>}
        </div>
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}26` }}
        >
          <Icon size={20} style={{ color: accent }} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}

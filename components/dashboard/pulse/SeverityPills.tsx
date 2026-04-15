'use client'
import { cn } from '@/lib/utils'
import { SEVERITY_CONFIG, type Severity } from '@/lib/data/pulseScenes'

interface SeverityPillsProps {
  active: Severity
  onChange: (s: Severity) => void
}

const SEVERITIES: Severity[] = ['green', 'amber', 'red']

export default function SeverityPills({ active, onChange }: SeverityPillsProps) {
  return (
    <div className="flex gap-1.5">
      {SEVERITIES.map(s => {
        const cfg = SEVERITY_CONFIG[s]
        const isActive = active === s
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={cn(
              'rounded-full px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-all duration-200 border cursor-pointer',
              isActive
                ? ''
                : 'bg-transparent border-[var(--border)] text-[var(--text-subtle)]'
            )}
            style={isActive ? {
              background: cfg.bgColor,
              color: cfg.color,
              borderColor: cfg.borderColor,
            } : undefined}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}

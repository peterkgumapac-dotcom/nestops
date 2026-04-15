'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SEVERITY_CONFIG } from '@/lib/data/pulseScenes'
import { usePulseScene } from './usePulseScene'
import PulseDot from './PulseDot'
import SeverityPills from './SeverityPills'
import PulseFeed from './PulseFeed'
import PropagationPanel from './PropagationPanel'

export default function PulsePanel() {
  const { severity, scene, actedRoles, setSeverity, onRoleAct } = usePulseScene('red')
  const [propExpanded, setPropExpanded] = useState(true)
  const cfg = SEVERITY_CONFIG[severity]

  return (
    <div>
      {/* Section label + severity pills */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="label-upper">PULSE</div>
        <SeverityPills active={severity} onChange={setSeverity} />
      </div>

      {/* Main card */}
      <Card className="p-0 overflow-hidden mb-3">
        {/* Header */}
        <div className="flex items-center gap-2 px-3.5 py-3 border-b border-[var(--border)]">
          <PulseDot severity={severity} size="sm" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Activity</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={severity}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-[10px] uppercase tracking-wide"
              style={{
                background: cfg.bgColor,
                color: cfg.color,
                border: `1px solid ${cfg.borderColor}`,
              }}
            >
              {scene.statusBadge}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] text-[var(--text-muted)] ml-auto">{scene.statusLabel}</span>
        </div>

        {/* Feed */}
        <PulseFeed items={scene.feed} />
      </Card>

      {/* Propagation panel (collapsible on mobile) */}
      <div className="mb-3">
        <button
          onClick={() => setPropExpanded(p => !p)}
          className="flex items-center gap-1 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-subtle)] cursor-pointer bg-transparent border-none lg:hidden"
        >
          Event Propagation
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${propExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Always visible on desktop, toggleable on mobile */}
        <div className={`${propExpanded ? '' : 'hidden'} lg:block`}>
          <Card className="p-3">
            <PropagationPanel
              scene={scene}
              actedRoles={actedRoles}
              onRoleAct={onRoleAct}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import type { RoleNodeData } from '@/lib/data/pulseScenes'

interface RoleNodeProps {
  role: RoleNodeData
  index: number
  acted: boolean
  onAct: () => void
}

export default function RoleNode({ role, index, acted, onAct }: RoleNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 + index * 0.08 }}
      className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col gap-1.5"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-semibold text-white shrink-0"
          style={{ background: role.color }}
        >
          {role.initials}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-[var(--text-primary)] truncate">{role.role}</div>
          <div className="text-[9px] text-[var(--text-subtle)] truncate">{role.name}</div>
        </div>
      </div>

      {/* Action button */}
      <AnimatePresence mode="wait">
        {acted ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 text-[9px] font-semibold text-[var(--status-green-fg)]"
          >
            <Check size={10} />
            {role.confirmText}
          </motion.div>
        ) : (
          <motion.button
            key="action"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onAct}
            className="w-full py-1 rounded-md text-[9px] font-semibold cursor-pointer transition-colors border-none text-white"
            style={{ background: role.color }}
          >
            {role.actionLabel}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

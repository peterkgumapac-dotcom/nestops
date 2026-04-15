'use client'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface ResolutionBarProps {
  visible: boolean
}

export default function ResolutionBar({ visible }: ResolutionBarProps) {
  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scaleY: 0.8 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--status-green-bg)] border border-[rgba(16,185,129,0.25)]"
    >
      <CheckCircle size={14} className="text-[var(--status-green-fg)]" />
      <span className="text-[10px] font-semibold text-[var(--status-green-fg)]">
        All roles have acted — event resolved
      </span>
    </motion.div>
  )
}

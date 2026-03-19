'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { G } from '@/lib/guest/theme'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: Props) {
  const reduced = useReducedMotion()
  const dragY = useRef(0)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 100,
            }}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDrag={(_, info) => { dragY.current = info.offset.y }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose()
            }}
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: G.surface,
              borderRadius: '20px 20px 0 0',
              zIndex: 101,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 32, height: 4, borderRadius: 2, background: G.border }} />
            </div>

            {/* Header */}
            {title && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 20px 12px',
                borderBottom: `1px solid ${G.border}`,
              }}>
                <span style={{ fontSize: 17, fontWeight: 600, color: G.text, fontFamily: 'var(--font-serif)' }}>
                  {title}
                </span>
                <button
                  onClick={onClose}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: G.bg, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: G.textMuted,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Content */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 32px' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

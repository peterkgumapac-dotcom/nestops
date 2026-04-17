'use client'
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MessageCircle, Wrench, AlertTriangle, X } from 'lucide-react'
import { useGuestTheme } from '@/lib/guest/theme-context'

interface Props {
  accentColor: string
  onContactHost: () => void
  onReportIssue: () => void
  onEmergency: () => void
}

interface SubButton {
  icon: React.ReactElement
  label: string
  color: string
  onClick: () => void
}

export default function FloatingActionButton({
  accentColor, onContactHost, onReportIssue, onEmergency,
}: Props) {
  const { theme: G, resolved } = useGuestTheme()
  const isDark = resolved === 'dark'
  const [expanded, setExpanded] = useState(false)
  const reduced = useReducedMotion()

  const subs: SubButton[] = [
    { icon: <AlertTriangle size={20} />, label: 'Emergency', color: G.red,   onClick: onEmergency },
    { icon: <Wrench size={20} />,        label: 'Report Issue', color: G.amber, onClick: onReportIssue },
    { icon: <MessageCircle size={20} />, label: 'Contact Host', color: accentColor, onClick: onContactHost },
  ]

  function handleSub(cb: () => void) {
    setExpanded(false)
    cb()
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="fab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 48,
              background: 'rgba(0,0,0,0.2)',
            }}
          />
        )}
      </AnimatePresence>

      <div style={{
        position: 'fixed', bottom: 24, right: 20,
        zIndex: 49, display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end', gap: 12,
      }}>
        {/* Sub-buttons */}
        <AnimatePresence>
          {expanded && subs.map((sub, i) => (
            <motion.div
              key={sub.label}
              initial={reduced ? { opacity: 0 } : { scale: 0, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0, y: 20, opacity: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', damping: 20, stiffness: 300 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              {/* Label pill */}
              <div style={{
                background: isDark ? G.surface : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                padding: '5px 12px', borderRadius: 20,
                fontSize: 13, fontWeight: 600, color: G.text,
                boxShadow: '0 2px 8px rgba(0,0,0,.12)',
                whiteSpace: 'nowrap',
              }}>
                {sub.label}
              </div>

              {/* Circle button */}
              <motion.button
                onClick={() => handleSub(sub.onClick)}
                whileHover={reduced ? {} : { scale: 1.1 }}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: sub.color, color: '#fff',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 16px ${sub.color}60`,
                }}
              >
                {sub.icon}
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setExpanded(e => !e)}
          whileHover={reduced ? {} : { scale: 1.05 }}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: accentColor, color: '#fff',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 6px 20px ${accentColor}60`,
          }}
        >
          <AnimatePresence mode="wait">
            {expanded ? (
              <motion.div
                key="close"
                initial={reduced ? {} : { rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduced ? {} : { rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={22} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={reduced ? {} : { rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduced ? {} : { rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle size={22} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  )
}

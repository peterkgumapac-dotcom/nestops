'use client'
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import type { UpsellRule } from '@/lib/data/upsells'
import BottomSheet from './BottomSheet'
import { G } from '@/lib/guest/theme'

const UPSELL_META: Record<string, { emoji: string; gradient: [string, string] }> = {
  arrival:    { emoji: '🛬', gradient: ['#6366F1', '#818CF8'] },
  departure:  { emoji: '🚪', gradient: ['#EC4899', '#F9A8D4'] },
  experience: { emoji: '🎉', gradient: ['#F59E0B', '#FCD34D'] },
  transport:  { emoji: '🚗', gradient: ['#10B981', '#34D399'] },
  extras:     { emoji: '✨', gradient: ['#8B5CF6', '#C4B5FD'] },
}

interface Props {
  upsells: UpsellRule[]
  accentColor: string
}

export default function UpsellGrid({ upsells, accentColor }: Props) {
  const reduced = useReducedMotion()
  const [activeUpsell, setActiveUpsell] = useState<UpsellRule | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? upsells : upsells.slice(0, 4)

  function handleAdd(id: string) {
    setAdded(prev => new Set([...prev, id]))
  }

  if (!upsells.length) return null

  return (
    <div style={{ padding: '0 16px' }}>
      <motion.h2
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 24, fontWeight: 700,
          color: G.text, margin: '0 0 16px',
          letterSpacing: '-0.01em',
        }}
      >
        Add-ons
      </motion.h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {visible.map((u, i) => {
          const meta = UPSELL_META[u.category] ?? { emoji: '✨', gradient: [accentColor, accentColor + '80'] as [string, string] }
          const isAdded = added.has(u.id)

          return (
            <motion.div
              key={u.id}
              initial={reduced ? {} : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduced ? {} : { y: -3, boxShadow: '0 12px 36px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)' }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              onClick={() => setActiveUpsell(u)}
              style={{
                background: isAdded ? 'rgba(22,163,74,0.06)' : 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isAdded ? `1px solid ${G.green}40` : '1px solid rgba(255,255,255,0.92)',
                borderRadius: 20,
                boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              {/* Top gradient stripe */}
              <div style={{
                height: 4,
                background: isAdded
                  ? `linear-gradient(90deg, ${G.green}, ${G.green}80)`
                  : `linear-gradient(90deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
              }} />

              <div style={{ padding: '14px 14px 16px' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: isAdded
                    ? `linear-gradient(135deg, ${G.green}20, ${G.green}08)`
                    : `linear-gradient(135deg, ${meta.gradient[0]}22, ${meta.gradient[0]}08)`,
                  border: isAdded ? `1px solid ${G.green}25` : `1px solid ${meta.gradient[0]}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, marginBottom: 10,
                }}>
                  {isAdded ? '✓' : meta.emoji}
                </div>

                <div style={{
                  fontSize: 14, fontWeight: 700, color: G.text,
                  marginBottom: 4, lineHeight: 1.2, letterSpacing: '-0.01em',
                }}>
                  {u.title}
                </div>
                <div style={{
                  fontSize: 12, color: G.textMuted,
                  marginBottom: 10, lineHeight: 1.45,
                }}>
                  {u.description}
                </div>

                <div style={{
                  fontSize: 15, fontWeight: 800,
                  color: isAdded ? G.green : meta.gradient[0],
                  letterSpacing: '-0.02em',
                }}>
                  {isAdded ? '✓ Added' : `${u.price} ${u.currency}`}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {!showAll && upsells.length > 4 && (
        <motion.button
          whileHover={reduced ? {} : { scale: 1.02 }}
          whileTap={reduced ? {} : { scale: 0.98 }}
          onClick={() => setShowAll(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            margin: '14px auto 0',
            background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
            border: `1px solid ${accentColor}30`,
            borderRadius: 22, padding: '9px 20px',
            cursor: 'pointer',
            color: accentColor, fontSize: 13, fontWeight: 700,
          }}
        >
          <Sparkles size={13} />
          See all {upsells.length} add-ons
        </motion.button>
      )}

      {/* Detail Sheet */}
      <BottomSheet
        open={!!activeUpsell}
        onClose={() => setActiveUpsell(null)}
        title={activeUpsell?.title}
      >
        {activeUpsell && (() => {
          const meta = UPSELL_META[activeUpsell.category] ?? { emoji: '✨', gradient: [accentColor, accentColor + '80'] as [string, string] }
          return (
            <div>
              <div style={{
                width: 48, height: 48, borderRadius: 14, marginBottom: 14,
                background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
                boxShadow: `0 6px 18px ${meta.gradient[0]}40`,
              }}>
                {meta.emoji}
              </div>
              <p style={{ fontSize: 15, color: G.textBody, lineHeight: 1.65, margin: '0 0 16px' }}>
                {activeUpsell.description}
              </p>
              <div style={{
                fontSize: 26, fontWeight: 800, color: G.text,
                marginBottom: 20, letterSpacing: '-0.03em',
              }}>
                {activeUpsell.price} {activeUpsell.currency}
              </div>

              <AnimatePresence mode="wait">
                {added.has(activeUpsell.id) ? (
                  <motion.div
                    key="added"
                    initial={reduced ? {} : { scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '15px', borderRadius: 16,
                      background: G.green + '18', color: G.green,
                      fontSize: 15, fontWeight: 700,
                    }}
                  >
                    <Check size={18} /> Added to your stay!
                  </motion.div>
                ) : (
                  <motion.button
                    key="cta"
                    onClick={() => handleAdd(activeUpsell.id)}
                    whileHover={reduced ? {} : { scale: 1.02 }}
                    whileTap={reduced ? {} : { scale: 0.98 }}
                    style={{
                      width: '100%', padding: '15px',
                      background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})`,
                      color: '#fff',
                      border: 'none', borderRadius: 16,
                      fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      boxShadow: `0 6px 20px ${meta.gradient[0]}40`,
                    }}
                  >
                    {activeUpsell.ctaLabel ?? 'Add to Stay'}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )
        })()}
      </BottomSheet>
    </div>
  )
}

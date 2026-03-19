'use client'
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MapPin, Navigation } from 'lucide-react'
import type { LocalRec } from '@/lib/data/guidebooks'
import { G } from '@/lib/guest/theme'

const CATEGORY_META: Record<string, { emoji: string; label: string; color: string }> = {
  food:      { emoji: '🍽️', label: 'Food',       color: '#F97316' },
  cafe:      { emoji: '☕', label: 'Café',        color: '#92400E' },
  bar:       { emoji: '🍺', label: 'Bar',         color: '#7C3AED' },
  grocery:   { emoji: '🛒', label: 'Grocery',     color: '#16A34A' },
  beach:     { emoji: '🏖️', label: 'Beach',       color: '#0EA5E9' },
  activity:  { emoji: '🎭', label: 'Activities',  color: '#EC4899' },
  gym:       { emoji: '🏋️', label: 'Gym',         color: '#EF4444' },
  transport: { emoji: '🚌', label: 'Transport',   color: '#6366F1' },
  pharmacy:  { emoji: '💊', label: 'Pharmacy',    color: '#14B8A6' },
  hidden:    { emoji: '📍', label: 'Hidden Gems', color: '#F59E0B' },
}

interface Props {
  localRecs: LocalRec[]
  accentColor: string
}

export default function LocalAreaSection({ localRecs, accentColor }: Props) {
  const reduced = useReducedMotion()
  const categories = Array.from(new Set(localRecs.map(r => r.category)))
  const [active, setActive] = useState<string>('all')

  const filtered = active === 'all' ? localRecs : localRecs.filter(r => r.category === active)

  function mapsUrl(rec: LocalRec) {
    const query = encodeURIComponent(`${rec.name}${rec.address ? ' ' + rec.address : ''}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

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
        Local Area
      </motion.h2>

      {/* Category pills */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        marginBottom: 16, paddingBottom: 2, scrollbarWidth: 'none',
      }}>
        {[{ id: 'all', label: '🗺️ All', color: accentColor }, ...categories.map(c => ({
          id: c,
          label: `${CATEGORY_META[c]?.emoji ?? '📍'} ${CATEGORY_META[c]?.label ?? c}`,
          color: CATEGORY_META[c]?.color ?? accentColor,
        }))].map(pill => {
          const isActive = active === pill.id
          return (
            <motion.button
              key={pill.id}
              onClick={() => setActive(pill.id)}
              animate={{
                background: isActive ? pill.color : 'rgba(255,255,255,0.8)',
                color: isActive ? '#fff' : G.textBody,
                boxShadow: isActive
                  ? `0 3px 12px ${pill.color}40`
                  : '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)',
                fontWeight: isActive ? 700 : 500,
              }}
              transition={{ duration: 0.2 }}
              style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 22,
                border: 'none', cursor: 'pointer', fontSize: 13,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              {pill.label}
            </motion.button>
          )
        })}
      </div>

      {/* Spot list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={reduced ? {} : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {filtered.map((rec, i) => {
            const meta = CATEGORY_META[rec.category] ?? { emoji: '📍', label: rec.category, color: accentColor }
            return (
              <motion.div
                key={rec.name + i}
                initial={reduced ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.045, duration: 0.32 }}
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.92)',
                  borderRadius: 18,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Color accent left stripe */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                  background: `linear-gradient(180deg, ${meta.color}, ${meta.color}60)`,
                  borderRadius: '18px 0 0 18px',
                }} />

                <div style={{
                  width: 40, height: 40, flexShrink: 0,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${meta.color}18, ${meta.color}08)`,
                  border: `1px solid ${meta.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {meta.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 700, color: G.text,
                    marginBottom: 2, letterSpacing: '-0.01em',
                  }}>
                    {rec.name}
                  </div>
                  <div style={{
                    fontSize: 13, color: G.textMuted,
                    marginTop: 2, lineHeight: 1.45,
                  }}>
                    {rec.tip}
                  </div>
                  {rec.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                      <MapPin size={11} color={G.textFaint} />
                      <span style={{ fontSize: 12, color: G.textFaint }}>{rec.address}</span>
                    </div>
                  )}
                </div>

                <a
                  href={mapsUrl(rec)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '8px 12px', borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, ${meta.color}18, ${meta.color}08)`,
                    border: `1px solid ${meta.color}25`,
                    color: meta.color, textDecoration: 'none',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  <Navigation size={11} /> Go
                </a>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

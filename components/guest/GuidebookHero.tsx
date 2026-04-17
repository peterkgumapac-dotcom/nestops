'use client'
import Image from 'next/image'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Calendar, Clock } from 'lucide-react'
import type { Guidebook } from '@/lib/data/guidebooks'
import type { GuestVerification } from '@/lib/data/verification'
import { useGuestTheme } from '@/lib/guest/theme-context'

interface Props {
  guidebook: Guidebook
  imageUrl?: string
  accentColor: string
  verification?: GuestVerification | null
}

export default function GuidebookHero({ guidebook, imageUrl, accentColor, verification }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { theme: G, resolved } = useGuestTheme()
  const isDark = resolved === 'dark'
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 400], [0, reduced ? 0 : 120])

  const fallbackImg = 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80'

  return (
    <div ref={ref} style={{ position: 'relative', height: 440, overflow: 'hidden' }}>
      {/* Parallax image */}
      <motion.div style={{ position: 'absolute', inset: '-60px 0 -60px', y }}>
        <motion.div
          initial={reduced ? {} : { scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', width: '100%', height: '100%' }}
        >
          <Image
            src={imageUrl ?? fallbackImg}
            alt={guidebook.propertyName}
            fill priority
            style={{ objectFit: 'cover' }}
            sizes="480px"
          />
        </motion.div>
      </motion.div>

      {/* Cinematic multi-layer gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isDark
          ? 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 42%, rgba(8,11,18,0.70) 72%, rgba(8,11,18,1) 100%)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, transparent 30%, transparent 42%, rgba(250,249,246,0.65) 72%, rgba(250,249,246,1) 100%)',
      }} />

      {/* Subtle vignette sides */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.18) 100%)',
      }} />

      {/* Animated ambient accent glow */}
      <motion.div
        animate={reduced ? {} : { opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: -10, left: 0, right: 0, height: 180,
          background: `radial-gradient(ellipse at 50% 100%, ${accentColor}30, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Check-in/out glass chips */}
      {verification && (
        <motion.div
          initial={reduced ? {} : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.55, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: 16, right: 16,
            display: 'flex', flexDirection: 'column', gap: 7,
          }}
        >
          {[
            { icon: <Calendar size={11} color={accentColor} />, label: 'In', value: verification.checkInDate },
            { icon: <Clock size={11} color={G.textMuted} />, label: 'Out', value: verification.checkOutDate },
          ].map((chip, i) => (
            <motion.div
              key={i}
              initial={reduced ? {} : { opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.1, duration: 0.45 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: isDark ? 'rgba(26,31,39,0.85)' : 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 24, padding: '7px 13px',
                fontSize: 11, fontWeight: 600, color: G.text,
                boxShadow: isDark
                  ? '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)'
                  : '0 4px 20px rgba(0,0,0,0.13), 0 1px 3px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.95)',
                letterSpacing: '0.01em',
              }}
            >
              {chip.icon}
              <span style={{ color: G.textMuted }}>{chip.label}</span>
              <span>{chip.value}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Property name + brand */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px 20px 26px',
      }}>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 36, fontWeight: 700,
            color: G.text, margin: 0, lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {guidebook.propertyName}
        </motion.h1>

        {guidebook.brandName && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 9 }}
          >
            <div style={{
              width: 28, height: 2.5, borderRadius: 2,
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}50)`,
              flexShrink: 0,
            }} />
            <p style={{
              margin: 0, fontSize: 13, color: G.textMuted,
              fontWeight: 500, letterSpacing: '0.03em',
            }}>
              {guidebook.brandName}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

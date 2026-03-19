'use client'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Link2, Heart } from 'lucide-react'
import type { Guidebook } from '@/lib/data/guidebooks'
import { G } from '@/lib/guest/theme'

interface Props {
  guidebook: Guidebook
  accentColor: string
  brandName?: string
}

export default function ShareFooter({ guidebook, accentColor, brandName }: Props) {
  const [copied, setCopied] = useState(false)
  const reduced = useReducedMotion()

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch { /* ignore */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      style={{ padding: '8px 16px 56px', textAlign: 'center' }}
    >
      <div style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.92)',
        borderRadius: 20,
        boxShadow: '0 4px 28px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        padding: '22px 20px 20px',
        marginBottom: 16,
      }}>
        {/* Decorative icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 14, margin: '0 auto 12px',
          background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
          border: `1px solid ${accentColor}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor,
        }}>
          <Link2 size={18} />
        </div>

        <p style={{
          fontSize: 15, fontWeight: 700, color: G.text,
          margin: '0 0 4px', letterSpacing: '-0.01em',
        }}>
          Share this guidebook
        </p>
        <p style={{ fontSize: 13, color: G.textMuted, margin: '0 0 16px' }}>
          Send it to your travel companions
        </p>

        <motion.button
          onClick={copyLink}
          whileHover={reduced ? {} : { scale: 1.03 }}
          whileTap={reduced ? {} : { scale: 0.97 }}
          animate={{
            background: copied ? G.green + '18' : `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
            borderColor: copied ? G.green + '40' : accentColor + '35',
            color: copied ? G.green : accentColor,
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            margin: '0 auto', padding: '11px 24px', borderRadius: 14,
            border: '1px solid',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {copied ? <Check size={15} /> : <Link2 size={15} />}
          {copied ? 'Copied!' : 'Copy link'}
        </motion.button>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 5, fontSize: 12, color: G.textFaint,
      }}>
        <span>Made with</span>
        <Heart size={10} style={{ color: accentColor }} fill={accentColor} />
        <span>by</span>
        <span style={{ color: G.textMuted, fontWeight: 700 }}>
          {brandName ?? 'NestOps'}
        </span>
      </div>
    </motion.div>
  )
}

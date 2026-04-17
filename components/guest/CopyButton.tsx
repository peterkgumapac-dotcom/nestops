'use client'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useGuestTheme } from '@/lib/guest/theme-context'

interface Props {
  value: string
  label?: string
}

export default function CopyButton({ value, label }: Props) {
  const { theme: G } = useGuestTheme()
  const [copied, setCopied] = useState(false)
  const reduced = useReducedMotion()

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = value
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.button
      onClick={handleCopy}
      animate={!reduced && copied ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 8,
        background: copied ? G.green + '18' : G.bg,
        border: `1px solid ${copied ? G.green + '40' : G.border}`,
        cursor: 'pointer',
        color: copied ? G.green : G.textBody,
        fontSize: 12, fontWeight: 500,
        transition: 'all 0.2s',
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : (label ?? 'Copy')}
    </motion.button>
  )
}

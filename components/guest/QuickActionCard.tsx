'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { G } from '@/lib/guest/theme'

interface Props {
  label: string
  value: string
  accent?: string
  mono?: boolean
  compact?: boolean
}

/**
 * Warm cream tap-to-copy card for WiFi network, door code, etc.
 * `compact` variant is used inside horizontal rails.
 */
export default function QuickActionCard({ label, value, accent = G.accent, mono = false, compact = false }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      /* ignore — some environments block clipboard */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', gap: 6,
        padding: '14px 16px',
        background: G.surface, border: 'none',
        borderRadius: 16,
        boxShadow: G.shadowMd,
        color: G.text, textAlign: 'left', cursor: 'pointer',
        fontFamily: 'var(--font-nunito), var(--font-sans)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        ...(compact ? { width: 150, height: 110, flexShrink: 0 } : {}),
      }}
    >
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: G.textMuted,
      }}>{label}</div>
      <div style={{
        fontSize: mono ? (compact ? 18 : 22) : 13,
        fontWeight: 800,
        fontFamily: mono ? 'monospace' : 'inherit',
        letterSpacing: mono ? '0.1em' : 0,
        color: accent,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        maxWidth: '100%',
      }}>{value}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 10, fontWeight: 700, color: G.textMuted,
        marginTop: 'auto',
      }}>
        {copied ? <Check size={11} /> : <Copy size={11} />}
        <span>{copied ? 'Copied' : 'Tap to copy'}</span>
      </div>
    </button>
  )
}

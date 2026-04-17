'use client'
import { useState } from 'react'
import { Wifi, Check, MapPin, ChevronRight } from 'lucide-react'
import { useGuestTheme } from '@/lib/guest/theme-context'

interface Props {
  ssid: string
  onArrivalConfirm?: () => void
}

/**
 * Warm cream "Connect to WiFi" card with two-state connect button and
 * secondary "I've Arrived" manual confirm.
 */
export default function WifiConnectCard({ ssid, onArrivalConfirm }: Props) {
  const { theme: G } = useGuestTheme()
  const [connected, setConnected] = useState(false)

  function handleConnect() {
    setConnected(true)
    onArrivalConfirm?.()
  }

  return (
    <div style={{
      background: G.surface, border: 'none',
      borderRadius: 16, padding: 16,
      boxShadow: G.shadowMd,
      fontFamily: 'var(--font-nunito), var(--font-sans)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: G.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: G.accent, flexShrink: 0,
        }}>
          <Wifi size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>
            Connect to {ssid}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>
            Auto-confirms your arrival
          </div>
        </div>
        <button
          type="button"
          onClick={handleConnect}
          disabled={connected}
          style={{
            padding: '9px 16px', borderRadius: 999,
            background: connected ? `${G.green}1a` : G.accent,
            color: connected ? G.green : G.accentFg,
            border: 'none', fontSize: 12, fontWeight: 800,
            cursor: connected ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: 'inherit',
          }}
        >
          {connected ? <><Check size={13} /> Connected</> : 'Connect'}
        </button>
      </div>

      <div style={{ height: 1, background: G.border, margin: '14px 0' }} />

      <button
        type="button"
        onClick={onArrivalConfirm}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          color: G.textBody, textAlign: 'left', padding: 0,
          fontFamily: 'inherit',
        }}
      >
        <MapPin size={16} color={G.textMuted} />
        <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>
          <b style={{ color: G.text, fontWeight: 800 }}>I&apos;ve Arrived</b>
          <span style={{ color: G.textMuted }}> — tap to confirm manually</span>
        </div>
        <ChevronRight size={16} color={G.textFaint} />
      </button>
    </div>
  )
}

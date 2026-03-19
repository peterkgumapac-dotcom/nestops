'use client'
import { useState } from 'react'
import { Phone } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { issueStore } from '@/lib/guest/issueStore'
import { G } from '@/lib/guest/theme'

const OPTIONS = [
  { emoji: '🔑', label: 'Door not working', key: 'door' },
  { emoji: '💧', label: 'Water leak', key: 'water' },
  { emoji: '⚡', label: 'Power outage', key: 'power' },
  { emoji: '🔒', label: 'Locked out', key: 'locked' },
  { emoji: '⚠️', label: 'Safety concern', key: 'safety' },
  { emoji: '❓', label: 'Other urgent', key: 'other' },
]

interface Props {
  open: boolean
  onClose: () => void
  operatorPhone?: string
  propertyId?: string
  propertyName?: string
  guestName?: string
}

export default function EmergencySheet({ open, onClose, operatorPhone, propertyId, propertyName, guestName }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleOption(key: string, label: string) {
    setSelected(key)
    // Log as emergency issue
    issueStore.addIssue({
      type: 'emergency',
      guestName: guestName ?? 'Guest',
      propertyId: propertyId ?? '',
      propertyName: propertyName ?? '',
      category: key,
      urgency: 'urgent',
      description: label,
      photos: [],
    })
  }

  function handleClose() {
    setSelected(null)
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="🚨 Emergency Support">
      <div style={{
        background: G.red + '10', border: `1px solid ${G.red}30`,
        borderRadius: 12, padding: '10px 14px', marginBottom: 16,
        fontSize: 13, color: G.red, fontWeight: 500,
      }}>
        For life-threatening emergencies, call 112 immediately.
      </div>

      {!selected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleOption(opt.key, opt.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 14,
                background: G.bg, border: `1px solid ${G.border}`,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 24 }}>{opt.emoji}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: G.text }}>{opt.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <div style={{
            background: G.red + '10', border: `1px solid ${G.red}30`,
            borderRadius: 14, padding: '16px', marginBottom: 16,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: G.textMuted, margin: '0 0 8px' }}>
              Your issue has been logged. Contact your host now:
            </p>
            {operatorPhone ? (
              <a
                href={`tel:${operatorPhone}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '14px 20px', borderRadius: 14,
                  background: G.red, color: '#fff',
                  textDecoration: 'none', fontSize: 16, fontWeight: 700,
                }}
              >
                <Phone size={18} /> {operatorPhone}
              </a>
            ) : (
              <p style={{ fontSize: 14, color: G.textMuted, margin: 0 }}>
                No host phone configured. Please check your booking platform.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a
              href="tel:112"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', borderRadius: 12,
                background: G.red + '14', border: `1px solid ${G.red}30`,
                color: G.red, textDecoration: 'none',
                fontSize: 14, fontWeight: 600,
              }}
            >
              <Phone size={16} /> Emergency: 112 (Police / Fire / Ambulance)
            </a>
          </div>

          <button
            onClick={() => setSelected(null)}
            style={{
              marginTop: 14, width: '100%', background: 'none', border: 'none',
              color: G.textMuted, fontSize: 13, cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            ← Back to options
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

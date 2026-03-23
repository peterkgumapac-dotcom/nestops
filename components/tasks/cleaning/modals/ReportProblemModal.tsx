'use client'

import { useState } from 'react'

const CATEGORIES = [
  { id: 'too_dirty', label: 'Property too dirty', icon: '🧹' },
  { id: 'maintenance', label: 'Maintenance issue discovered', icon: '🔧' },
  { id: 'no_supplies', label: 'Lack of supplies', icon: '📦' },
  { id: 'late', label: "I'll be late", icon: '⏰' },
  { id: 'wont_finish', label: "Task won't finish on time", icon: '⚠️' },
]

interface Props {
  open: boolean
  onClose: () => void
  propertyName: string
  cleanerName: string
  onSubmit: (category: string, note: string) => void
}

export function ReportProblemModal({ open, onClose, propertyName, cleanerName, onSubmit }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!open) return null

  const handleSubmit = () => {
    if (!selected) return
    onSubmit(selected, note)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setSelected(null)
      setNote('')
      onClose()
    }, 1200)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
    }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: '#111827', borderRadius: '16px 16px 0 0',
          padding: 24, paddingBottom: 40,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Report a Problem</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>{propertyName}</div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 15, color: '#10b981', fontWeight: 600 }}>
            ✓ Alert sent to Guest Services
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelected(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12, textAlign: 'left',
                    background: selected === cat.id ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selected === cat.id ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: '#fff', fontSize: 14, fontWeight: selected === cat.id ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional note..."
              rows={2}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 13, resize: 'none',
                fontFamily: 'inherit', marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={!selected}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: selected ? '#ef4444' : 'rgba(255,255,255,0.08)',
                color: selected ? '#fff' : 'rgba(255,255,255,0.3)',
                border: 'none', fontSize: 15, fontWeight: 700,
                cursor: selected ? 'pointer' : 'default',
              }}
            >
              Send Alert
            </button>
          </>
        )}
      </div>
    </div>
  )
}

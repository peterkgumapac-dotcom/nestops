'use client'

import { useState, useRef } from 'react'

const CATEGORIES = [
  { id: 'too_dirty', label: 'Property too dirty', icon: '🧹' },
  { id: 'maintenance', label: 'Maintenance issue discovered', icon: '🔧' },
  { id: 'no_supplies', label: 'Lack of supplies', icon: '📦' },
  { id: 'late', label: "I'll be late", icon: '⏰' },
  { id: 'wont_finish', label: "Task won't finish on time", icon: '⚠️' },
]

const SEVERITIES = [
  { id: 'low',    label: 'Low',    color: '#6b7280', bg: '#6b728018', border: '#6b728030' },
  { id: 'medium', label: 'Medium', color: '#d97706', bg: '#d9770618', border: '#d9770630' },
  { id: 'high',   label: 'High',   color: '#ea580c', bg: '#ea580c18', border: '#ea580c30' },
  { id: 'urgent', label: 'Urgent', color: '#ef4444', bg: '#ef444418', border: '#ef444430' },
] as const

export interface ReportSubmission {
  category: string
  note: string
  severity: 'low' | 'medium' | 'high' | 'urgent'
  photos: string[]
  delegate: boolean
  delegateNote: string
}

interface Props {
  open: boolean
  onClose: () => void
  propertyName: string
  cleanerName: string
  onSubmit: (report: ReportSubmission) => void
}

export function ReportProblemModal({ open, onClose, propertyName, cleanerName: _cleanerName, onSubmit }: Props) {
  const [category, setCategory]       = useState('')
  const [note, setNote]               = useState('')
  const [severity, setSeverity]       = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [photos, setPhotos]           = useState<string[]>([])
  const [delegate, setDelegate]       = useState(false)
  const [delegateNote, setDelegateNote] = useState('')
  const [submitted, setSubmitted]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotos(p => [...p, url])
    e.target.value = ''
  }

  const handleSubmit = () => {
    if (!category) return
    onSubmit({ category, note, severity, photos, delegate, delegateNote })
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setCategory('')
      setNote('')
      setSeverity('medium')
      setPhotos([])
      setDelegate(false)
      setDelegateNote('')
      onClose()
    }, 1200)
  }

  const pillBtn = (active: boolean, color: string, bg: string, border: string): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: active ? 700 : 400,
    cursor: 'pointer', border: `1px solid ${active ? border : 'rgba(255,255,255,0.1)'}`,
    background: active ? bg : 'rgba(255,255,255,0.04)',
    color: active ? color : 'rgba(255,255,255,0.5)',
    transition: 'all 0.15s',
  })

  return (
    <div
      style={{
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
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Report a Problem</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>{propertyName}</div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 15, color: '#10b981', fontWeight: 600 }}>
            {delegate
              ? '✓ Reported · Supervisor & GS notified for reassignment'
              : '✓ Alert sent to Guest Services'}
          </div>
        ) : (
          <>
            {/* Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12, textAlign: 'left',
                    background: category === cat.id ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${category === cat.id ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: '#fff', fontSize: 14, fontWeight: category === cat.id ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Severity */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Severity</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {SEVERITIES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSeverity(s.id)}
                    style={pillBtn(severity === s.id, s.color, s.bg, s.border)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Notes</div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Describe the issue in detail…"
                rows={5}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 13, resize: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Photos */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Photos</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {photos.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="evidence" style={{ width: 64, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)', display: 'block' }} />
                    <button
                      onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', border: '2px solid #111827', color: '#fff', fontSize: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    >×</button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{ width: 64, height: 48, borderRadius: 8, border: '1.5px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >+</button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoAdd} />
            </div>

            {/* Delegate toggle */}
            <div style={{
              marginBottom: 20, padding: '14px 16px', borderRadius: 12,
              background: delegate ? 'var(--accent-bg)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${delegate ? 'var(--accent-border)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: delegate ? 600 : 400 }}>🔄 Delegate this task</span>
                <button
                  onClick={() => setDelegate(d => !d)}
                  style={{
                    width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
                    background: delegate ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: delegate ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', display: 'block',
                  }} />
                </button>
              </div>
              {delegate && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Reason for delegation:</div>
                  <textarea
                    value={delegateNote}
                    onChange={e => setDelegateNote(e.target.value)}
                    placeholder="Explain why you can't complete this task…"
                    rows={2}
                    style={{
                      width: '100%', padding: '10px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--accent-border)',
                      color: '#fff', fontSize: 13, resize: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!category}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: category ? (delegate ? 'var(--accent)' : '#ef4444') : 'rgba(255,255,255,0.08)',
                color: category ? '#fff' : 'rgba(255,255,255,0.3)',
                border: 'none', fontSize: 15, fontWeight: 700,
                cursor: category ? 'pointer' : 'default',
              }}
            >
              {delegate ? 'Send Report & Request Reassignment' : 'Send Report'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

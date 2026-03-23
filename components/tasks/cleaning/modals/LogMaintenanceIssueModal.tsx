'use client'

import { useState } from 'react'

const ISSUE_TYPES = [
  'Broken fixture',
  'Leak',
  'Electrical',
  'Appliance',
  'Other',
]

interface Props {
  open: boolean
  onClose: () => void
  propertyName: string
  cleanerName: string
  onSubmit: (issueType: string, description: string, urgency: 'today' | 'later') => void
}

export function LogMaintenanceIssueModal({ open, onClose, propertyName, cleanerName, onSubmit }: Props) {
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0])
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<'today' | 'later'>('later')
  const [submitted, setSubmitted] = useState(false)

  if (!open) return null

  const handleSubmit = () => {
    if (!description.trim()) return
    onSubmit(issueType, description, urgency)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setIssueType(ISSUE_TYPES[0])
      setDescription('')
      setUrgency('later')
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
          padding: 24, paddingBottom: 40, maxHeight: '85vh', overflowY: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Log Maintenance Issue</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>{propertyName}</div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 15, color: '#10b981', fontWeight: 600 }}>
            ✓ Issue logged — Guest Services notified
          </div>
        ) : (
          <>
            {/* Issue type */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                Issue Type
              </div>
              <select
                value={issueType}
                onChange={e => setIssueType(e.target.value)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', fontSize: 14,
                  fontFamily: 'inherit',
                }}
              >
                {ISSUE_TYPES.map(t => (
                  <option key={t} value={t} style={{ background: '#111827' }}>{t}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                Description
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 13, resize: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Urgency */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                Urgency
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['today', 'later'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10,
                      background: urgency === u
                        ? (u === 'today' ? 'rgba(239,68,68,0.15)' : 'rgba(217,119,6,0.12)')
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${urgency === u
                        ? (u === 'today' ? 'rgba(239,68,68,0.4)' : 'rgba(217,119,6,0.35)')
                        : 'rgba(255,255,255,0.08)'}`,
                      color: urgency === u
                        ? (u === 'today' ? '#f87171' : '#fbbf24')
                        : 'rgba(255,255,255,0.5)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {u === 'today' ? '🔴 Needs attention today' : '🟡 Can wait'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!description.trim()}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: description.trim() ? '#d97706' : 'rgba(255,255,255,0.08)',
                color: description.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
                border: 'none', fontSize: 15, fontWeight: 700,
                cursor: description.trim() ? 'pointer' : 'default',
              }}
            >
              Submit Issue
            </button>
          </>
        )}
      </div>
    </div>
  )
}

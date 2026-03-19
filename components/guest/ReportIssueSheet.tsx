'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Camera, X, Check } from 'lucide-react'
import type { Guidebook } from '@/lib/data/guidebooks'
import type { GuestVerification } from '@/lib/data/verification'
import BottomSheet from './BottomSheet'
import { issueStore, type GuestIssue } from '@/lib/guest/issueStore'
import { G } from '@/lib/guest/theme'

const CATEGORIES = [
  { key: 'plumbing',   emoji: '🔧', label: 'Plumbing' },
  { key: 'electrical', emoji: '⚡', label: 'Electrical' },
  { key: 'cleaning',   emoji: '🧹', label: 'Cleaning' },
  { key: 'appliance',  emoji: '🏠', label: 'Appliance' },
  { key: 'structural', emoji: '🔨', label: 'Structural' },
  { key: 'other',      emoji: '❓', label: 'Other' },
]

const LOCATIONS = ['Kitchen', 'Bathroom', 'Bedroom', 'Living area', 'Outdoor', 'Other']

interface Props {
  open: boolean
  onClose: () => void
  guidebook: Guidebook
  verification?: GuestVerification | null
}

export default function ReportIssueSheet({ open, onClose, guidebook, verification }: Props) {
  const reduced = useReducedMotion()
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [submitted, setSubmitted] = useState<GuestIssue | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newPhotos = files.slice(0, 5 - photos.length).map(f => f.name)
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 5))
  }

  function removePhoto(i: number) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSubmit() {
    const issue = issueStore.addIssue({
      type: 'maintenance',
      guestName: verification?.guestName ?? 'Guest',
      propertyId: guidebook.propertyId,
      propertyName: guidebook.propertyName,
      category,
      location: location || undefined,
      urgency,
      description,
      photos,
    })
    setSubmitted(issue)
  }

  function handleClose() {
    setCategory('')
    setLocation('')
    setUrgency('normal')
    setDescription('')
    setPhotos([])
    setSubmitted(null)
    onClose()
  }

  const canSubmit = category && description.trim()

  return (
    <BottomSheet open={open} onClose={handleClose} title="Report an Issue">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="submitted"
            initial={reduced ? {} : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center', padding: '20px 0' }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: G.text, margin: '0 0 8px' }}>
              Issue reported
            </h3>
            <p style={{ fontSize: 14, color: G.textMuted, margin: '0 0 16px' }}>
              Your tracking ID is
            </p>
            <div style={{
              display: 'inline-block', padding: '8px 18px',
              background: G.bg, border: `1px solid ${G.border}`,
              borderRadius: 10, fontFamily: 'monospace',
              fontSize: 18, fontWeight: 700, color: G.text,
              marginBottom: 20,
            }}>
              {submitted.trackingId}
            </div>
            <p style={{ fontSize: 13, color: G.textMuted, margin: 0 }}>
              We&apos;ll investigate and update you shortly.
            </p>
          </motion.div>
        ) : (
          <motion.div key="form">
            {/* Photos */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: G.textMuted, marginBottom: 8 }}>
                Photos (optional)
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {photos.map((p, i) => (
                  <div key={i} style={{
                    position: 'relative', width: 64, height: 64,
                    borderRadius: 10, background: G.bg,
                    border: `1px solid ${G.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    <span style={{ fontSize: 10, color: G.textMuted, wordBreak: 'break-all', padding: 4, textAlign: 'center' }}>
                      {p.slice(0, 12)}
                    </span>
                    <button
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute', top: 2, right: 2,
                        width: 18, height: 18, borderRadius: '50%',
                        background: G.red, color: '#fff',
                        border: 'none', cursor: 'pointer', fontSize: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{
                      width: 64, height: 64, borderRadius: 10,
                      background: G.bg, border: `1px dashed ${G.border}`,
                      cursor: 'pointer', color: G.textMuted,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Camera size={20} />
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handlePhotoChange} />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: G.textMuted, marginBottom: 8 }}>Category</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    style={{
                      padding: '10px 6px', borderRadius: 12,
                      border: `1px solid ${category === c.key ? G.text : G.border}`,
                      background: category === c.key ? G.text : G.bg,
                      color: category === c.key ? '#fff' : G.textBody,
                      cursor: 'pointer', fontSize: 12, fontWeight: 500,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: G.textMuted, marginBottom: 8 }}>Location</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {LOCATIONS.map(l => (
                  <button
                    key={l}
                    onClick={() => setLocation(l)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 13,
                      border: `1px solid ${location === l ? G.text : G.border}`,
                      background: location === l ? G.text : G.bg,
                      color: location === l ? '#fff' : G.textBody,
                      cursor: 'pointer',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: G.textMuted, marginBottom: 8 }}>Urgency</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['normal', 'urgent'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setUrgency(u)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      border: `1px solid ${urgency === u ? (u === 'urgent' ? G.red : G.text) : G.border}`,
                      background: urgency === u ? (u === 'urgent' ? G.red : G.text) : G.bg,
                      color: urgency === u ? '#fff' : G.textBody,
                      cursor: 'pointer',
                    }}
                  >
                    {u === 'urgent' ? '🚨 Urgent' : '📋 Normal'}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: G.textMuted, marginBottom: 8 }}>Description</div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please describe the issue..."
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: `1px solid ${G.border}`, borderRadius: 10,
                  background: G.bg, color: G.text, fontSize: 14,
                  resize: 'vertical', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: '100%', padding: '13px',
                background: canSubmit ? G.text : G.border,
                color: canSubmit ? '#fff' : G.textMuted,
                border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 600,
                cursor: canSubmit ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Check size={16} /> Submit Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  )
}

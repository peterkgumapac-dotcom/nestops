'use client'
import { useState, useRef } from 'react'
import {
  Sheet, SheetContent, SheetTitle, SheetClose,
} from '@/components/ui/sheet'
import { X, Send, Upload, Sparkles, ImageIcon } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

interface Props {
  onClose: () => void
}

const PROPERTIES = ['Sunset Villa', 'Harbor Studio', 'Ocean View Apt', 'Downtown Loft', 'Mountain Cabin']
const CATEGORIES  = [
  { value: 'cleanliness',        label: 'Cleanliness' },
  { value: 'maintenance',        label: 'Maintenance' },
  { value: 'noise',              label: 'Noise' },
  { value: 'amenity_failure',    label: 'Amenity Failure' },
  { value: 'access_issue',       label: 'Access Issue' },
  { value: 'listing_inaccuracy', label: 'Listing Inaccuracy' },
  { value: 'safety',             label: 'Safety' },
  { value: 'other',              label: 'Other' },
]
const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const
const CHANNELS   = ['airbnb', 'booking_com', 'direct', 'vrbo'] as const

// AI simulation — keyword-based triage
const PRIORITY_KEYWORDS: [string, string][] = [
  ['emergency', 'critical'], ['flood', 'critical'], ['fire', 'critical'], ['smoke', 'critical'], ['carbon', 'critical'],
  ['urgent', 'critical'], ['broken', 'high'], ['leak', 'high'], ['locked', 'high'], ['no hot water', 'high'],
  ['dirty', 'medium'], ['missing', 'medium'], ['smell', 'medium'], ['mold', 'high'],
  ['noise', 'low'], ['slow', 'low'], ['minor', 'low'],
]
const CATEGORY_KEYWORDS: [string, string][] = [
  ['clean', 'cleanliness'], ['dirt', 'cleanliness'], ['stain', 'cleanliness'], ['mess', 'cleanliness'], ['towel', 'cleanliness'],
  ['broken', 'maintenance'], ['repair', 'maintenance'], ['leak', 'maintenance'], ['appliance', 'maintenance'], ['fix', 'maintenance'],
  ['noise', 'noise'], ['loud', 'noise'], ['party', 'noise'], ['music', 'noise'],
  ['wifi', 'amenity_failure'], ['tv', 'amenity_failure'], ['pool', 'amenity_failure'], ['heater', 'amenity_failure'], ['ac', 'amenity_failure'],
  ['key', 'access_issue'], ['lock', 'access_issue'], ['door', 'access_issue'], ['code', 'access_issue'],
  ['photo', 'listing_inaccuracy'], ['description', 'listing_inaccuracy'], ['inaccurate', 'listing_inaccuracy'],
  ['safe', 'safety'], ['dangerous', 'safety'], ['hazard', 'safety'],
]

const PRIORITY_COLORS: Record<string, string> = {
  low: '#6b7280', medium: '#d97706', high: '#ef4444', critical: '#dc2626',
}

function getAiPriority(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [kw, p] of PRIORITY_KEYWORDS) if (lower.includes(kw)) return p
  return null
}
function getAiCategory(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [kw, c] of CATEGORY_KEYWORDS) if (lower.includes(kw)) return c
  return null
}

export default function NewIssueSheet({ onClose }: Props) {
  const { accent } = useRole()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    property: '', category: '', severity: 'medium', channel: 'airbnb',
    guestName: '', reservationId: '', title: '', description: '', internalNotes: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [aiCategoryAccepted, setAiCategoryAccepted] = useState(false)
  const [photoToast, setPhotoToast] = useState(false)

  const handleClose = () => {
    setForm({ property: '', category: '', severity: 'medium', channel: 'airbnb', guestName: '', reservationId: '', title: '', description: '', internalNotes: '' })
    setPhotos([])
    setSaving(false)
    setSaved(false)
    setAiCategoryAccepted(false)
    onClose()
  }

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setAiCategoryAccepted(false) // reset when form changes
  }

  const analysisText = form.title + ' ' + form.description
  const hasAnalysis = analysisText.trim().length > 6
  const aiPriority = hasAnalysis ? getAiPriority(analysisText) : null
  const aiCategory = hasAnalysis ? getAiCategory(analysisText) : null

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (photos.length >= 5) {
      setPhotoToast(true)
      setTimeout(() => setPhotoToast(false), 2500)
      e.target.value = ''
      return
    }
    const files = Array.from(e.target.files ?? [])
    const remaining = 5 - photos.length
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setPhotos(prev => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleSubmit = () => {
    if (!form.property || !form.title || !form.guestName) return
    setSaving(true)
    setTimeout(() => { setSaving(false); setSaved(true) }, 800)
    setTimeout(() => { setSaved(false); onClose() }, 1800)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 13, color: 'var(--text-primary)',
    outline: 'none', boxSizing: 'border-box' as const,
  }
  const labelStyle = {
    fontSize: 11, fontWeight: 700 as const, letterSpacing: '0.08em',
    color: 'var(--text-subtle)', textTransform: 'uppercase' as const, display: 'block', marginBottom: 6,
  }

  return (
    <Sheet open onOpenChange={open => !open && handleClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={{
          width: 460, maxWidth: '90vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', padding: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SheetTitle style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Log New Issue
          </SheetTitle>
          <SheetClose
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-elevated)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={15} color="var(--text-muted)" />
          </SheetClose>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Property */}
          <div>
            <label style={labelStyle}>Property *</label>
            <select value={form.property} onChange={e => set('property', e.target.value)} style={inputStyle}>
              <option value="">Select property…</option>
              {PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Guest + Reservation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Guest Name *</label>
              <input value={form.guestName} onChange={e => set('guestName', e.target.value)} placeholder="Full name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Reservation ID</label>
              <input value={form.reservationId} onChange={e => set('reservationId', e.target.value)} placeholder="RES-2026-…" style={inputStyle} />
            </div>
          </div>

          {/* Channel */}
          <div>
            <label style={labelStyle}>Booking Channel</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {CHANNELS.map(c => (
                <button
                  key={c}
                  onClick={() => set('channel', c)}
                  style={{
                    flex: 1, padding: '7px 0', borderRadius: 7,
                    border: `1px solid ${form.channel === c ? accent : 'var(--border)'}`,
                    background: form.channel === c ? `${accent}18` : 'var(--bg-elevated)',
                    color: form.channel === c ? accent : 'var(--text-muted)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {c === 'booking_com' ? 'Booking' : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Issue Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Brief description of the issue" style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Guest Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="What did the guest report?"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          {/* AI Analysis — shows when title or description has content */}
          {hasAnalysis && (aiPriority || aiCategory) && (
            <div
              style={{
                padding: '12px 14px', background: '#6366f108',
                border: '1px solid #6366f130', borderRadius: 10,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Sparkles size={13} color="#6366f1" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  AI Analysis
                </span>
              </div>

              {/* AI Priority */}
              {aiPriority && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>Suggested priority:</span>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
                      background: `${PRIORITY_COLORS[aiPriority]}18`,
                      color: PRIORITY_COLORS[aiPriority],
                      textTransform: 'capitalize',
                    }}
                  >
                    {aiPriority}
                  </span>
                  <button
                    onClick={() => set('severity', aiPriority)}
                    style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 6,
                      border: `1px solid ${accent}`, background: `${accent}14`,
                      color: accent, cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* AI Category */}
              {aiCategory && !aiCategoryAccepted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>Suggested category:</span>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', textTransform: 'capitalize',
                    }}
                  >
                    {CATEGORIES.find(c => c.value === aiCategory)?.label ?? aiCategory}
                  </span>
                  <button
                    onClick={() => { set('category', aiCategory); setAiCategoryAccepted(true) }}
                    style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 6,
                      border: `1px solid ${accent}`, background: `${accent}14`,
                      color: accent, cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}
              {aiCategory && aiCategoryAccepted && (
                <div style={{ fontSize: 12, color: '#10b981' }}>✓ Category suggestion applied</div>
              )}
            </div>
          )}

          {/* Category + Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Severity</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {SEVERITIES.map(s => {
                  const colors = { low: '#6b7280', medium: '#d97706', high: '#ef4444', critical: '#dc2626' }
                  const c = colors[s]
                  return (
                    <button
                      key={s}
                      onClick={() => set('severity', s)}
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 7,
                        border: `1px solid ${form.severity === s ? c : 'var(--border)'}`,
                        background: form.severity === s ? `${c}18` : 'var(--bg-elevated)',
                        color: form.severity === s ? c : 'var(--text-muted)',
                        fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label style={labelStyle}>
              Photos
              <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-subtle)', textTransform: 'none', letterSpacing: 0, marginLeft: 8 }}>
                {photos.length}/5
              </span>
            </label>

            {/* Thumbnail strip */}
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {photos.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={src}
                      alt={`photo ${i + 1}`}
                      style={{ width: 72, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }}
                    />
                    <button
                      onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      style={{
                        position: 'absolute', top: -6, right: -6,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#ef4444', border: '2px solid var(--bg-surface)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 5 && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoAdd}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '10px 14px',
                    background: 'var(--bg-elevated)', border: '1px dashed var(--border)',
                    borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: 13, transition: 'border-color 0.15s',
                  }}
                >
                  <ImageIcon size={15} />
                  Add photos ({5 - photos.length} remaining)
                </button>
              </>
            )}
          </div>

          {/* Internal notes */}
          <div>
            <label style={labelStyle}>Internal Notes</label>
            <textarea
              value={form.internalNotes}
              onChange={e => set('internalNotes', e.target.value)}
              placeholder="Notes for your team (not visible to guest)"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px', borderTop: '1px solid var(--border)',
            background: 'var(--bg-surface)', flexShrink: 0,
            display: 'flex', gap: 10,
          }}
        >
          <button
            onClick={handleClose}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-elevated)',
              color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || saved}
            style={{
              flex: 2, padding: '10px 0', borderRadius: 8,
              border: 'none', background: saved ? '#10b981' : accent,
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: saving ? 0.7 : 1, transition: 'background 0.2s',
            }}
          >
            {saved ? '✓ Issue Logged' : saving ? 'Saving…' : <><Send size={14} />Log Issue</>}
          </button>
        </div>
      </SheetContent>

      {photoToast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#d97706', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          Max 5 photos reached
        </div>
      )}
    </Sheet>
  )
}

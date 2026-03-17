'use client'
import { useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from '@/components/ui/sheet'
import { X, Send } from 'lucide-react'
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

export default function NewIssueSheet({ onClose }: Props) {
  const { accent } = useRole()
  const [form, setForm] = useState({
    property: '', category: '', severity: 'medium', channel: 'airbnb',
    guestName: '', reservationId: '', title: '', description: '', internalNotes: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

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
    <Sheet open onOpenChange={open => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={{
          width: 440, maxWidth: '90vw',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
            onClick={onClose}
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
            {saved ? (
              '✓ Issue Logged'
            ) : saving ? (
              'Saving…'
            ) : (
              <>
                <Send size={14} />
                Log Issue
              </>
            )}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

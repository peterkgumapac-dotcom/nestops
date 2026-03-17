'use client'
import { useState } from 'react'
import { Building2, Wifi, Package, Camera, FileText, CheckCircle } from 'lucide-react'
import { PROPERTIES } from '@/lib/data/properties'
import { STAFF_MEMBERS } from '@/lib/data/staff'
import { useRole } from '@/context/RoleContext'

const CURRENT_STAFF = STAFF_MEMBERS[0]
const MY_PROPERTIES = PROPERTIES.filter(p => CURRENT_STAFF.assignedPropertyIds.includes(p.id))

const STEPS = [
  { label: 'Select Property', icon: Building2 },
  { label: 'Property Details', icon: Wifi },
  { label: 'Assets', icon: Package },
  { label: 'Photos', icon: Camera },
  { label: 'Notes', icon: FileText },
  { label: 'Review', icon: CheckCircle },
]

export default function NewIntakePage() {
  const { accent } = useRole()
  const [step, setStep] = useState(0)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="heading" style={{ fontSize: 22, color: 'var(--text-primary)', marginBottom: 4 }}>Property Intake</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s.label} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? accent : 'var(--border)', transition: 'background 0.3s' }} />
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Select Property</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {MY_PROPERTIES.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedProperty(p.id)}
                style={{ padding: 16, borderRadius: 10, border: `2px solid ${selectedProperty === p.id ? accent : 'var(--border)'}`, background: selectedProperty === p.id ? `${accent}0d` : 'var(--bg-card)', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.city}</div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, textTransform: 'capitalize' }}>{p.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Property Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Property Type</label><select style={inputStyle}><option>Apartment</option><option>Villa</option><option>Studio</option><option>Cabin</option></select></div>
            <div><label style={labelStyle}>Lock Code</label><input style={inputStyle} placeholder="••••" type="password" /></div>
          </div>
          <div><label style={labelStyle}>Access Instructions</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="How to access the property..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>WiFi Network</label><input style={inputStyle} placeholder="Network name" /></div>
            <div><label style={labelStyle}>WiFi Password</label><input style={inputStyle} placeholder="Password" /></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Appliances & Assets</h2>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={labelStyle}>Item Name</label><input style={inputStyle} placeholder="e.g. Washing Machine" /></div>
              <div><label style={labelStyle}>Brand</label><input style={inputStyle} placeholder="e.g. Miele" /></div>
              <div><label style={labelStyle}>Model</label><input style={inputStyle} placeholder="Model number" /></div>
              <div><label style={labelStyle}>Condition</label><select style={inputStyle}><option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option></select></div>
              <div><label style={labelStyle}>Serial Number</label><input style={inputStyle} placeholder="Optional" /></div>
              <div><label style={labelStyle}>Approx. Value (NOK)</label><input type="number" style={inputStyle} /></div>
            </div>
            <button style={{ padding: '7px 14px', borderRadius: 7, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 13, cursor: 'pointer' }}>Add Item</button>
          </div>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: `${accent}1a`, color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>+ Add Another Item</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Photos</h2>
          <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <Camera size={32} style={{ color: 'var(--text-subtle)', marginBottom: 8 }} strokeWidth={1} />
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>Drag & drop photos or click to upload</div>
            <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>JPG, PNG up to 10MB each</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Exterior', 'Other'].map(room => (
              <button key={room} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{room}</button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Notes & Issues</h2>
          <div><label style={labelStyle}>General Notes</label><textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Any general notes about the property condition…" /></div>
          <div><label style={labelStyle}>Issue Type</label>
            <select style={inputStyle}><option>— No issues —</option><option>Minor damage</option><option>Maintenance needed</option><option>Missing item</option><option>Safety concern</option></select>
          </div>
          <div><label style={labelStyle}>Issue Description</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Describe any issues found…" /></div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Review & Submit</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STEPS.slice(0, 5).map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${accent}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={13} style={{ color: accent }} />
                </div>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{s.label}</span>
                <span style={{ fontSize: 12, color: '#34d399' }}>✓ Complete</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
        <button style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Save Draft</button>
        <div style={{ flex: 1 }} />
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>← Back</button>
        )}
        <button
          onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : undefined}
          style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          {step === STEPS.length - 1 ? 'Submit Intake' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'

const STEPS = ['Property Details', 'Address', 'Specs', 'Review & Submit']

export default function OnboardPage() {
  const { accent } = useRole()
  const [step, setStep] = useState(0)

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

  return (
    <div>
      <PageHeader title="Onboard Property" subtitle="Add a new property to your portfolio" />

      {/* Progress bar */}
      <div style={{ maxWidth: 600, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => i <= step && setStep(i)}>
              <div style={{ width: '100%', height: 3, background: i <= step ? accent : 'var(--border)', transition: 'background 0.3s', marginBottom: 8 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i <= step ? accent : 'var(--bg-elevated)', border: `2px solid ${i <= step ? accent : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i <= step ? '#fff' : 'var(--text-subtle)', marginBottom: 4 }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === step ? accent : 'var(--text-subtle)', fontWeight: i === step ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 540 }}>
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Property Details</h2>
            <div><label style={labelStyle}>Property Name</label><input style={inputStyle} placeholder="e.g. Sunset Villa" /></div>
            <div><label style={labelStyle}>Property Type</label>
              <select style={inputStyle}><option>Apartment</option><option>House / Villa</option><option>Studio</option><option>Cabin</option><option>Other</option></select>
            </div>
            <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Brief description of the property…" /></div>
          </div>
        )}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Address</h2>
            <div><label style={labelStyle}>Street Address</label><input style={inputStyle} placeholder="Street and number" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>City</label><input style={inputStyle} placeholder="City" /></div>
              <div><label style={labelStyle}>Postal Code</label><input style={inputStyle} placeholder="0000" /></div>
            </div>
            <div><label style={labelStyle}>Country</label><select style={inputStyle}><option>Norway</option><option>Sweden</option><option>Denmark</option></select></div>
          </div>
        )}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Specs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Bedrooms</label><input type="number" style={inputStyle} defaultValue={2} /></div>
              <div><label style={labelStyle}>Bathrooms</label><input type="number" style={inputStyle} defaultValue={1} /></div>
              <div><label style={labelStyle}>Max Guests</label><input type="number" style={inputStyle} defaultValue={4} /></div>
            </div>
            <div><label style={labelStyle}>Floor Size (m²)</label><input type="number" style={inputStyle} /></div>
            <div><label style={labelStyle}>Amenities</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                {['WiFi', 'Parking', 'Washer', 'Dishwasher', 'Air Conditioning', 'TV'].map(a => (
                  <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
                    <input type="checkbox" style={{ accentColor: accent }} /> {a}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Review & Submit</h2>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>Your property details have been entered. Once submitted, our team will review and onboard your property within 2–3 business days.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: step === 0 ? 'var(--text-subtle)' : 'var(--text-muted)', fontSize: 14, cursor: step === 0 ? 'not-allowed' : 'pointer' }}
          >
            ← Back
          </button>
          <button
            onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : undefined}
            style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            {step === STEPS.length - 1 ? 'Submit →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

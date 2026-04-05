'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Home, Building, Tent, Mountain, Coffee, Layers, Check, X } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

const TOTAL_STEPS = 12

interface WizardData {
  propertyType: string
  name: string
  nickname: string
  beds: number
  baths: number
  capacity: number
  address: string
  city: string
  country: string
  timezone: string
  ownerType: 'existing' | 'new'
  ownerId: string
  newOwnerName: string
  newOwnerEmail: string
  amenities: string[]
  accessType: string
  accessInstructions: string
  checkIn: string
  checkOut: string
  cleaningDuration: number
  bufferDays: number
  inspectionRequired: boolean
  photos: string[]
}

const PROPERTY_TYPES = [
  { key: 'apartment', label: 'Apartment', icon: Building },
  { key: 'house',     label: 'House',     icon: Home },
  { key: 'villa',     label: 'Villa',     icon: Home },
  { key: 'cabin',     label: 'Cabin',     icon: Mountain },
  { key: 'studio',    label: 'Studio',    icon: Coffee },
  { key: 'loft',      label: 'Loft',      icon: Layers },
]

const AMENITIES_LIST = [
  'WiFi', 'Parking', 'Kitchen', 'Washer', 'Dryer', 'Dishwasher', 'Coffee maker',
  'Smart TV', 'Work desk', 'Iron', 'Hair dryer', 'BBQ grill', 'Garden', 'Patio',
  'Pool', 'Sauna', 'Fireplace', 'Balcony', 'Ocean view', 'Pet friendly',
]

const ACCESS_TYPES = [
  { key: 'smart_lock', label: 'Smart Lock', desc: 'App-controlled entry' },
  { key: 'keypad',     label: 'Keypad',     desc: 'Code entry pad' },
  { key: 'key_box',    label: 'Key Box',    desc: 'Lockbox with key' },
  { key: 'in_person',  label: 'In-person',  desc: 'Host meets guests' },
]

const TIMEZONES = ['Europe/Oslo', 'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles']
const DEMO_OWNERS = [
  { id: 'o1', name: 'Sarah J.' },
  { id: 'o2', name: 'Michael C.' },
  { id: 'o3', name: 'Erik N.' },
  { id: 'o4', name: 'Lena K.' },
]

const DEFAULT_DRAFT: WizardData = {
  propertyType: '', name: '', nickname: '', beds: 2, baths: 1, capacity: 4,
  address: '', city: '', country: 'Norway', timezone: 'Europe/Oslo',
  ownerType: 'existing', ownerId: 'o1', newOwnerName: '', newOwnerEmail: '',
  amenities: [], accessType: '', accessInstructions: '',
  checkIn: '15:00', checkOut: '11:00', cleaningDuration: 120, bufferDays: 1, inspectionRequired: false,
  photos: ['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=70',
           'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=70'],
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

function Stepper({ value, onChange, min = 0, max = 20 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const { accent } = useRole()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${accent}`, background: 'transparent', color: accent, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
      <span style={{ fontSize: 18, fontWeight: 600, minWidth: 28, textAlign: 'center', color: 'var(--text-primary)' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${accent}`, background: 'transparent', color: accent, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
    </div>
  )
}

export default function OnboardWizard() {
  const { accent } = useRole()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [done, setDone] = useState(false)
  const [data, setData] = useState<WizardData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('afterstay_onboard_draft')
      if (saved) try { return JSON.parse(saved) } catch {}
    }
    return DEFAULT_DRAFT
  })

  const update = (patch: Partial<WizardData>) => {
    setData(d => {
      const next = { ...d, ...patch }
      localStorage.setItem('afterstay_onboard_draft', JSON.stringify(next))
      return next
    })
  }

  const go = (delta: number) => {
    setDirection(delta)
    setStep(s => Math.max(1, Math.min(TOTAL_STEPS, s + delta)))
  }

  const handleDone = () => {
    localStorage.removeItem('afterstay_onboard_draft')
    setDone(true)
    setTimeout(() => router.push('/app/properties'), 2500)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={36} color="#fff" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Property Added!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Redirecting to Properties…</p>
        </motion.div>
      </div>
    )
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      {/* Header */}
      <div style={{ padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13 }}>N</div>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>AfterStay</span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Step {step} of {TOTAL_STEPS}</span>
        <button onClick={() => router.push('/app/properties')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <X size={14} /> Save & Exit
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border)', flexShrink: 0 }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%', background: accent }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 600 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d > 0 ? -20 : 20 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
            >
              <StepContent step={step} data={data} update={update} accent={accent} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ padding: '16px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexShrink: 0 }}>
        {step > 1 && (
          <button onClick={() => go(-1)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronLeft size={15} /> Back
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button onClick={() => go(1)} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Continue <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={handleDone} style={{ padding: '10px 28px', borderRadius: 8, border: 'none', background: '#34d399', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Add Property ✓
          </button>
        )}
      </div>
    </div>
  )
}

function StepContent({ step, data, update, accent }: { step: number; data: WizardData; update: (p: Partial<WizardData>) => void; accent: string }) {
  const inputStyle2: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }

  const label = (text: string) => (
    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>{text}</label>
  )

  // Step 1 — Property Type
  if (step === 1) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>What type of property?</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Select the category that best describes your property.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {PROPERTY_TYPES.map(pt => {
          const Icon = pt.icon
          const selected = data.propertyType === pt.key
          return (
            <motion.button
              key={pt.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => update({ propertyType: pt.key })}
              style={{ padding: '20px 12px', borderRadius: 10, border: `2px solid ${selected ? accent : 'var(--border)'}`, background: selected ? `${accent}12` : 'var(--bg-card)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <Icon size={24} style={{ color: selected ? accent : 'var(--text-muted)' }} strokeWidth={1.5} />
              <span style={{ fontSize: 13, fontWeight: 500, color: selected ? accent : 'var(--text-muted)' }}>{pt.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )

  // Step 2 — Basic Info
  if (step === 2) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Basic Information</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Tell us the key details about your property.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>{label('Property Name')}<input style={inputStyle2} value={data.name} onChange={e => update({ name: e.target.value })} placeholder="e.g. Sunset Villa" /></div>
        <div>{label('Nickname (internal)')}<input style={inputStyle2} value={data.nickname} onChange={e => update({ nickname: e.target.value })} placeholder="e.g. The Sunset" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>{label('Bedrooms')}<Stepper value={data.beds} onChange={v => update({ beds: v })} min={0} max={20} /></div>
          <div>{label('Bathrooms')}<Stepper value={data.baths} onChange={v => update({ baths: v })} min={1} max={10} /></div>
          <div>{label('Max Guests')}<Stepper value={data.capacity} onChange={v => update({ capacity: v })} min={1} max={30} /></div>
        </div>
      </div>
    </div>
  )

  // Step 3 — Location
  if (step === 3) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Location</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Where is your property located?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>{label('Street Address')}<input style={inputStyle2} value={data.address} onChange={e => update({ address: e.target.value })} placeholder="e.g. Solveien 12" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>{label('City')}<input style={inputStyle2} value={data.city} onChange={e => update({ city: e.target.value })} placeholder="Oslo" /></div>
          <div>{label('Country')}<input style={inputStyle2} value={data.country} onChange={e => update({ country: e.target.value })} placeholder="Norway" /></div>
        </div>
        <div>{label('Timezone')}
          <select style={inputStyle2} value={data.timezone} onChange={e => update({ timezone: e.target.value })}>
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div style={{ height: 140, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📍 Map preview</span>
        </div>
      </div>
    </div>
  )

  // Step 4 — Owner Assignment
  if (step === 4) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Owner Assignment</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Assign this property to an owner.</p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {(['existing', 'new'] as const).map(ot => (
          <button key={ot} onClick={() => update({ ownerType: ot })} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `2px solid ${data.ownerType === ot ? accent : 'var(--border)'}`, background: data.ownerType === ot ? `${accent}12` : 'transparent', color: data.ownerType === ot ? accent : 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
            {ot === 'existing' ? 'Existing Owner' : 'New Owner'}
          </button>
        ))}
      </div>
      {data.ownerType === 'existing' ? (
        <div>{label('Select Owner')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_OWNERS.map(o => (
              <button key={o.id} onClick={() => update({ ownerId: o.id })} style={{ padding: '12px 16px', borderRadius: 8, border: `2px solid ${data.ownerId === o.id ? accent : 'var(--border)'}`, background: data.ownerId === o.id ? `${accent}12` : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left', fontSize: 14, color: data.ownerId === o.id ? accent : 'var(--text-primary)', fontWeight: data.ownerId === o.id ? 500 : 400 }}>
                {o.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>{label('Owner Name')}<input style={inputStyle2} value={data.newOwnerName} onChange={e => update({ newOwnerName: e.target.value })} placeholder="Full name" /></div>
          <div>{label('Owner Email')}<input style={inputStyle2} value={data.newOwnerEmail} onChange={e => update({ newOwnerEmail: e.target.value })} placeholder="email@example.com" type="email" /></div>
        </div>
      )}
    </div>
  )

  // Step 5 — Amenities
  if (step === 5) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Amenities</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Select all amenities available at the property.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {AMENITIES_LIST.map(am => {
          const selected = data.amenities.includes(am)
          return (
            <button key={am} onClick={() => update({ amenities: selected ? data.amenities.filter(a => a !== am) : [...data.amenities, am] })} style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${selected ? accent : 'var(--border)'}`, background: selected ? `${accent}1a` : 'transparent', color: selected ? accent : 'var(--text-muted)', fontSize: 13, fontWeight: selected ? 500 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
              {am}
            </button>
          )
        })}
      </div>
      <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-subtle)' }}>{data.amenities.length} selected</p>
    </div>
  )

  // Step 6 — Access & Entry
  if (step === 6) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Access & Entry</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>How do guests access the property?</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {ACCESS_TYPES.map(at => {
          const selected = data.accessType === at.key
          return (
            <button key={at.key} onClick={() => update({ accessType: at.key })} style={{ padding: '16px', borderRadius: 10, border: `2px solid ${selected ? accent : 'var(--border)'}`, background: selected ? `${accent}12` : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontWeight: 500, fontSize: 14, color: selected ? accent : 'var(--text-primary)', marginBottom: 3 }}>{at.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{at.desc}</div>
            </button>
          )
        })}
      </div>
      <div>{label('Access Instructions')}
        <textarea style={{ ...inputStyle2, minHeight: 90, resize: 'vertical' }} value={data.accessInstructions} onChange={e => update({ accessInstructions: e.target.value })} placeholder="Door code, key location, special notes..." />
      </div>
    </div>
  )

  // Step 7 — Operations Setup
  if (step === 7) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Operations Setup</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Configure operational defaults for this property.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>{label('Check-in Time')}<input type="time" style={inputStyle2} value={data.checkIn} onChange={e => update({ checkIn: e.target.value })} /></div>
          <div>{label('Check-out Time')}<input type="time" style={inputStyle2} value={data.checkOut} onChange={e => update({ checkOut: e.target.value })} /></div>
        </div>
        <div>{label('Cleaning Duration (minutes)')}<Stepper value={data.cleaningDuration} onChange={v => update({ cleaningDuration: v })} min={30} max={480} /></div>
        <div>{label('Buffer Days between bookings')}<Stepper value={data.bufferDays} onChange={v => update({ bufferDays: v })} min={0} max={7} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="checkbox" id="inspection" checked={data.inspectionRequired} onChange={e => update({ inspectionRequired: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: accent }} />
          <label htmlFor="inspection" style={{ fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer' }}>Require inspection after each checkout</label>
        </div>
      </div>
    </div>
  )

  // Step 8 — Photos
  if (step === 8) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Photos</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Add photos of your property.</p>
      <div style={{ border: `2px dashed var(--border)`, borderRadius: 10, padding: '32px 24px', textAlign: 'center', marginBottom: 20, cursor: 'pointer', background: 'var(--bg-elevated)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>Drag & drop photos here</div>
        <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>or click to browse · JPG, PNG, WEBP up to 10MB each</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {data.photos.map((url, i) => (
          <div key={i} style={{ borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
            <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
            {i === 0 && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: accent, color: '#fff' }}>Primary</span>}
          </div>
        ))}
      </div>
    </div>
  )

  // Steps 9-11 — extra detail steps
  if (step === 9) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Utilities & WiFi</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Add internet and utility information for your property.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>{label('WiFi Network Name')}<input style={inputStyle2} placeholder="e.g. MyProperty_5G" /></div>
        <div>{label('WiFi Password')}<input style={inputStyle2} placeholder="Password" /></div>
        <div>{label('Internet Provider')}<input style={inputStyle2} placeholder="e.g. Telenor" /></div>
        <div>{label('Heating Type')}<input style={inputStyle2} placeholder="e.g. Underfloor + Heat pump" /></div>
      </div>
    </div>
  )

  if (step === 10) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Emergency Info</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Add emergency contacts and nearby services.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>{label('Emergency Contact Name')}<input style={inputStyle2} placeholder="Name" /></div>
        <div>{label('Emergency Phone')}<input style={inputStyle2} placeholder="+47 900 12 345" type="tel" /></div>
        <div>{label('Nearest Hospital')}<input style={inputStyle2} placeholder="Hospital name and distance" /></div>
        <div>{label('Plumber')}<input style={inputStyle2} placeholder="Company name and phone" /></div>
        <div>{label('Electrician')}<input style={inputStyle2} placeholder="Company name and phone" /></div>
      </div>
    </div>
  )

  if (step === 11) return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>House Rules</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Set rules and policies for guests.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { key: 'smoking', label: 'Smoking allowed' },
          { key: 'pets', label: 'Pets allowed' },
          { key: 'parties', label: 'Parties / events allowed' },
        ].map(rule => (
          <div key={rule.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
            <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{rule.label}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Yes', 'No'].map(v => (
                <button key={v} style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, border: `1px solid ${v === 'No' ? accent : 'var(--border)'}`, background: v === 'No' ? `${accent}1a` : 'transparent', color: v === 'No' ? accent : 'var(--text-muted)', cursor: 'pointer' }}>{v}</button>
              ))}
            </div>
          </div>
        ))}
        <div>{label('Quiet Hours')}<input style={inputStyle2} placeholder="e.g. 23:00 – 07:00" /></div>
        <div>{label('Additional Rules')}<textarea style={{ ...inputStyle2, minHeight: 80, resize: 'vertical' }} placeholder="Any other rules for guests..." /></div>
      </div>
    </div>
  )

  // Step 12 — Review & Confirm
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Review & Confirm</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Check your details before adding the property.</p>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
        {data.photos[0] && <img src={data.photos[0]} alt="Property" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />}
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>{data.name || 'Unnamed Property'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{data.address}, {data.city} · {data.propertyType || 'Property'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Bedrooms', value: data.beds },
              { label: 'Bathrooms', value: data.baths },
              { label: 'Max Guests', value: data.capacity },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: accent }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
          {data.amenities.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 6 }}>Amenities: {data.amenities.join(', ')}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: `${accent}0d`, border: `1px solid ${accent}25`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: accent, marginBottom: 6 }}>What happens next</div>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {['Property added to your portfolio', 'Owner notified and invited to portal', 'Cleaning schedule configured', 'Listing review & live within 24h'].map((item, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

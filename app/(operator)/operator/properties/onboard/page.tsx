'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, MapPin, Wifi, Car, Waves, Flame, Wind, Tv, Dumbbell, ChefHat, WashingMachine, Thermometer, Zap, UtensilsCrossed, ChevronDown } from 'lucide-react'
import { getCleaningChecklist, type ChecklistItem } from '@/lib/data/checklists'
import { useRole } from '@/context/RoleContext'
import { OWNERS } from '@/lib/data/owners'
import PageHeader from '@/components/shared/PageHeader'

const TOTAL_STEPS = 9

const PROPERTY_TYPES = [
  { id: 'home',    icon: '🏠', label: 'Entire Home' },
  { id: 'apt',     icon: '🏢', label: 'Apartment' },
  { id: 'villa',   icon: '🏡', label: 'Villa' },
  { id: 'cabin',   icon: '🛖', label: 'Cabin / Chalet' },
  { id: 'loft',    icon: '🏙️', label: 'Loft' },
  { id: 'beach',   icon: '🏖️', label: 'Beach House' },
]

const AMENITIES = [
  { id: 'wifi',      icon: <Wifi size={14} />,           label: 'WiFi' },
  { id: 'kitchen',   icon: <ChefHat size={14} />,        label: 'Kitchen' },
  { id: 'parking',   icon: <Car size={14} />,            label: 'Parking' },
  { id: 'pool',      icon: <Waves size={14} />,          label: 'Pool' },
  { id: 'hottub',    icon: <Thermometer size={14} />,    label: 'Hot Tub' },
  { id: 'ac',        icon: <Wind size={14} />,           label: 'AC' },
  { id: 'heating',   icon: <Flame size={14} />,          label: 'Heating' },
  { id: 'washer',    icon: <WashingMachine size={14} />, label: 'Washer' },
  { id: 'dryer',     icon: <WashingMachine size={14} />, label: 'Dryer' },
  { id: 'tv',        icon: <Tv size={14} />,             label: 'TV' },
  { id: 'netflix',   icon: <Tv size={14} />,             label: 'Netflix' },
  { id: 'gym',       icon: <Dumbbell size={14} />,       label: 'Gym' },
  { id: 'bbq',       icon: <UtensilsCrossed size={14} />,label: 'BBQ' },
  { id: 'firepit',   icon: <Flame size={14} />,          label: 'Fire Pit' },
  { id: 'beach',     icon: '🏖️',                        label: 'Beach Access' },
  { id: 'pets',      icon: '🐾',                        label: 'Pet Friendly' },
  { id: 'ev',        icon: <Zap size={14} />,            label: 'EV Charger' },
  { id: 'workspace', icon: '💻',                        label: 'Workspace' },
  { id: 'baby',      icon: '👶',                        label: 'Baby Equipment' },
  { id: 'accessible',icon: '♿',                        label: 'Wheelchair Access' },
]

const ACCESS_TYPES = [
  { id: 'key',       icon: '🔑', label: 'Physical Key' },
  { id: 'smart',     icon: '📱', label: 'Smart Lock' },
  { id: 'keypad',    icon: '🔢', label: 'Keypad Code' },
  { id: 'inperson',  icon: '🤝', label: 'In-person' },
]

const STOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=120&fit=crop',
]

const TIMEZONES = ['Europe/Oslo', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles', 'Asia/Dubai', 'Asia/Tokyo']
const LOCK_BRANDS = ['Schlage', 'Yale', 'August', 'Nuki', 'Igloohome', 'Other']

interface FormState {
  propertyType: string
  name: string
  nickname: string
  yearBuilt: string
  bedrooms: number
  bathrooms: number
  capacity: number
  address: string
  city: string
  region: string
  postal: string
  country: string
  timezone: string
  ownerMode: 'existing' | 'new'
  selectedOwner: string
  newOwnerName: string
  newOwnerEmail: string
  newOwnerPhone: string
  amenities: string[]
  accessType: string
  lockBrand: string
  accessInstructions: string
  parkingInstructions: string
  wifiName: string
  wifiPassword: string
  checkinTime: string
  checkoutTime: string
  cleaningDuration: string
  inspectionRequired: boolean
  minNights: number
  bufferDays: number
  photos: string[]
  coverPhoto: string
}

const DEFAULT_FORM: FormState = {
  propertyType: '', name: '', nickname: '', yearBuilt: '',
  bedrooms: 2, bathrooms: 1, capacity: 4,
  address: '', city: '', region: '', postal: '', country: 'Norway', timezone: 'Europe/Oslo',
  ownerMode: 'existing', selectedOwner: '', newOwnerName: '', newOwnerEmail: '', newOwnerPhone: '',
  amenities: [],
  accessType: '', lockBrand: '', accessInstructions: '', parkingInstructions: '', wifiName: '', wifiPassword: '',
  checkinTime: '15:00', checkoutTime: '11:00', cleaningDuration: '2hr', inspectionRequired: true,
  minNights: 2, bufferDays: 1,
  photos: [], coverPhoto: '',
}

const LS_KEY = 'afterstay_onboard_draft'

const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }

function Stepper({ value, onChange, min = 0, max = 20 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const { accent } = useRole()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${accent}`, background: 'transparent', color: accent, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', minWidth: 24, textAlign: 'center' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${accent}`, background: transparent, color: accent, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
    </div>
  )
}
const transparent = 'transparent'

export default function OnboardPage() {
  const { accent } = useRole()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [success, setSuccess] = useState(false)
  const [direction, setDirection] = useState(1)
  const [showTemplate, setShowTemplate] = useState(false)
  const [templateSaved, setTemplateSaved] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) { const parsed = JSON.parse(saved); setStep(parsed.step ?? 1); setForm(parsed.form ?? DEFAULT_FORM) }
    } catch { /* ignore */ }
  }, [])

  const templateItems = useMemo(() =>
    getCleaningChecklist(form.bedrooms, form.bathrooms, form.amenities),
    [form.bedrooms, form.bathrooms, form.amenities]
  )

  const templateGroups = useMemo(() => {
    const seen = new Set<string>()
    const order: string[] = []
    templateItems.forEach((item: ChecklistItem) => { if (!seen.has(item.category)) { seen.add(item.category); order.push(item.category) } })
    return order.map(cat => ({ name: cat, items: templateItems.filter((i: ChecklistItem) => i.category === cat) }))
  }, [templateItems])

  const save = (nextStep: number, nextForm: FormState) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ step: nextStep, form: nextForm })) } catch { /* ignore */ }
  }

  const update = (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch }))

  const next = () => {
    const ns = step + 1
    setDirection(1)
    save(ns, form)
    setStep(ns)
  }

  const back = () => {
    const ns = step - 1
    setDirection(-1)
    setStep(ns)
  }

  const handleAdd = () => {
    setSuccess(true)
    try { localStorage.removeItem(LS_KEY) } catch { /* ignore */ }
    setTimeout(() => router.push('/operator/properties'), 2000)
  }

  const toggleAmenity = (id: string) => {
    update({ amenities: form.amenities.includes(id) ? form.amenities.filter(a => a !== id) : [...form.amenities, id] })
  }

  const progress = (step / TOTAL_STEPS) * 100

  const stepVariants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 30 : -30 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -20 : 20 }),
  }

  const renderStep = () => {
    if (success) return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0' }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          style={{ width: 80, height: 80, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
        >
          <Check size={36} color="#fff" />
        </motion.div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Property added!</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Setting up your guidebook and cleaning schedule…</div>
      </motion.div>
    )

    switch (step) {
      case 1: return (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>What kind of property is this?</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>This helps us set up the right defaults for your operations.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {PROPERTY_TYPES.map(pt => (
              <motion.button
                key={pt.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => update({ propertyType: pt.id })}
                style={{
                  padding: '24px 16px', borderRadius: 12, border: `2px solid ${form.propertyType === pt.id ? accent : 'var(--border)'}`,
                  background: form.propertyType === pt.id ? `${accent}12` : 'var(--bg-elevated)',
                  cursor: 'pointer', textAlign: 'center', position: 'relative',
                }}
              >
                {form.propertyType === pt.id && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={10} color="#fff" />
                  </div>
                )}
                <div style={{ fontSize: 28, marginBottom: 8 }}>{pt.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{pt.label}</div>
              </motion.button>
            ))}
          </div>
        </div>
      )

      case 2: return (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Tell us about this property</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Basic details used throughout AfterStay.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Property Name *</label>
              <input value={form.name} onChange={e => update({ name: e.target.value })} placeholder="e.g. Sunset Villa" style={{ ...inputStyle, fontSize: 16 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Internal Nickname <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>(staff only, optional)</span></label>
              <input value={form.nickname} onChange={e => update({ nickname: e.target.value })} placeholder="e.g. The Blue House" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Bedrooms</label>
                <Stepper value={form.bedrooms} onChange={v => update({ bedrooms: v })} min={1} max={20} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Bathrooms</label>
                <Stepper value={form.bathrooms} onChange={v => update({ bathrooms: v })} min={1} max={20} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Max Guests</label>
                <Stepper value={form.capacity} onChange={v => update({ capacity: v })} min={1} max={50} />
              </div>
            </div>
          </div>
        </div>
      )

      case 3: return (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Where is this property located?</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Used for maps, routing, and reporting.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Street Address *</label><input value={form.address} onChange={e => update({ address: e.target.value })} placeholder="123 Ocean Drive" style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>City *</label><input value={form.city} onChange={e => update({ city: e.target.value })} placeholder="Bergen" style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Postal Code</label><input value={form.postal} onChange={e => update({ postal: e.target.value })} placeholder="5020" style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Country</label><select value={form.country} onChange={e => update({ country: e.target.value })} style={inputStyle}><option>Norway</option><option>Sweden</option><option>Denmark</option><option>United Kingdom</option><option>Spain</option><option>United States</option></select></div>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Timezone</label><select value={form.timezone} onChange={e => update({ timezone: e.target.value })} style={inputStyle}>{TIMEZONES.map(t => <option key={t}>{t}</option>)}</select></div>
            </div>
            {/* Map placeholder */}
            <div style={{ height: 160, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <MapPin size={24} style={{ color: 'var(--text-subtle)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Map preview</span>
            </div>
          </div>
        </div>
      )

      case 4: return (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Who owns this property?</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Link this property to an owner account.</p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {(['existing', 'new'] as const).map(m => (
              <button
                key={m}
                onClick={() => update({ ownerMode: m })}
                style={{ flex: 1, padding: '12px', borderRadius: 10, border: `2px solid ${form.ownerMode === m ? accent : 'var(--border)'}`, background: form.ownerMode === m ? `${accent}12` : 'var(--bg-elevated)', color: form.ownerMode === m ? accent : 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                {m === 'existing' ? 'Existing owner' : 'Add new owner'}
              </button>
            ))}
          </div>
          {form.ownerMode === 'existing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OWNERS.map(o => (
                <button
                  key={o.id}
                  onClick={() => update({ selectedOwner: o.id })}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: `1px solid ${form.selectedOwner === o.id ? accent : 'var(--border)'}`, background: form.selectedOwner === o.id ? `${accent}0e` : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: accent, flexShrink: 0 }}>{o.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{o.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.email}</div>
                  </div>
                  {form.selectedOwner === o.id && <Check size={16} style={{ color: accent, marginLeft: 'auto' }} />}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Full Name</label><input value={form.newOwnerName} onChange={e => update({ newOwnerName: e.target.value })} placeholder="John Smith" style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Email</label><input type="email" value={form.newOwnerEmail} onChange={e => update({ newOwnerEmail: e.target.value })} placeholder="john@email.com" style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Phone</label><input value={form.newOwnerPhone} onChange={e => update({ newOwnerPhone: e.target.value })} placeholder="+47 900 00 000" style={inputStyle} /></div>
            </div>
          )}
        </div>
      )

      case 5: return (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>What amenities does this property have?</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Select all that apply. This auto-populates your guidebook.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AMENITIES.map(a => (
              <button
                key={a.id}
                onClick={() => toggleAmenity(a.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 20,
                  border: `1px solid ${form.amenities.includes(a.id) ? accent : 'var(--border)'}`,
                  background: form.amenities.includes(a.id) ? `${accent}18` : 'var(--bg-elevated)',
                  color: form.amenities.includes(a.id) ? accent : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                {typeof a.icon === 'string' ? <span>{a.icon}</span> : a.icon}
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )

      case 6: return (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>How do guests access this property?</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Entry details used in your guest communications.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {ACCESS_TYPES.map(at => (
              <motion.button
                key={at.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => update({ accessType: at.id })}
                style={{ padding: '20px 10px', borderRadius: 12, border: `2px solid ${form.accessType === at.id ? accent : 'var(--border)'}`, background: form.accessType === at.id ? `${accent}12` : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'center' }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{at.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{at.label}</div>
              </motion.button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(form.accessType === 'smart' || form.accessType === 'keypad') && (
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Lock Brand</label><select style={inputStyle}>{LOCK_BRANDS.map(b => <option key={b}>{b}</option>)}</select></div>
            )}
            <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Access Instructions</label><textarea value={form.accessInstructions} onChange={e => update({ accessInstructions: e.target.value })} placeholder="e.g. Code is 1234, enter through side gate" style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>WiFi Name</label><input value={form.wifiName} onChange={e => update({ wifiName: e.target.value })} placeholder="NetworkName" style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>WiFi Password</label><input value={form.wifiPassword} onChange={e => update({ wifiPassword: e.target.value })} placeholder="••••••••" style={inputStyle} /></div>
            </div>
          </div>
        </div>
      )

      case 7: return (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Set up your operational defaults</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>These become your baseline automation rules.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Check-in Time</label><input type="time" value={form.checkinTime} onChange={e => update({ checkinTime: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Check-out Time</label><input type="time" value={form.checkoutTime} onChange={e => update({ checkoutTime: e.target.value })} style={inputStyle} /></div>
            </div>
            <div><label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Cleaning Duration Estimate</label><select value={form.cleaningDuration} onChange={e => update({ cleaningDuration: e.target.value })} style={inputStyle}><option value="1hr">1 hr</option><option value="2hr">2 hrs</option><option value="3hr">3 hrs</option><option value="4hr">4 hrs</option><option value="5hr+">5 hrs+</option></select></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>Inspection required after cleaning?</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Creates an inspection task after every clean</div>
              </div>
              <button
                onClick={() => update({ inspectionRequired: !form.inspectionRequired })}
                style={{ width: 40, height: 22, borderRadius: 11, border: 'none', background: form.inspectionRequired ? accent : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
              >
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.inspectionRequired ? 21 : 3, transition: 'left 0.2s' }} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8 }}>Minimum Nights Stay</div>
                <Stepper value={form.minNights} onChange={v => update({ minNights: v })} min={1} max={30} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8 }}>Buffer Days Between Bookings</div>
                <Stepper value={form.bufferDays} onChange={v => update({ bufferDays: v })} max={7} />
              </div>
            </div>
          </div>
        </div>
      )

      case 8: return (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Add photos of this property</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Used throughout AfterStay for visual identification. At least 1 required.</p>
          {/* Drag drop zone */}
          <div style={{ border: `2px dashed ${accent}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center', marginBottom: 20, background: `${accent}05`, cursor: 'pointer' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Drag photos here or click to browse</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>JPG, PNG up to 10MB each</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 10 }}>Or use a stock photo for now:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STOCK_PHOTOS.map((url, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => update({ coverPhoto: url, photos: [url] })}
                  style={{
                    width: 100, height: 70, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                    border: `2px solid ${form.coverPhoto === url ? accent : 'transparent'}`,
                    position: 'relative',
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {form.coverPhoto === url && (
                    <div style={{ position: 'absolute', inset: 0, background: `${accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={20} color="#fff" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )

      case 9: return (
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Review your property setup</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Everything looks good? We'll set up your operational defaults automatically.</p>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            {form.coverPhoto && <img src={form.coverPhoto} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
            {[
              { label: 'Property Type', value: PROPERTY_TYPES.find(p => p.id === form.propertyType)?.label ?? '—' },
              { label: 'Name', value: form.name || '—' },
              { label: 'Size', value: `${form.bedrooms} bed · ${form.bathrooms} bath · ${form.capacity} guests` },
              { label: 'Location', value: form.city ? `${form.address || '—'}, ${form.city}` : '—' },
              { label: 'Owner', value: form.ownerMode === 'existing' ? (OWNERS.find(o => o.id === form.selectedOwner)?.name ?? '—') : (form.newOwnerName || '—') },
              { label: 'Access', value: ACCESS_TYPES.find(a => a.id === form.accessType)?.label ?? '—' },
              { label: 'Check-in / out', value: `${form.checkinTime} / ${form.checkoutTime}` },
              { label: 'Cleaning', value: form.cleaningDuration },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: 'flex', padding: '11px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <span style={{ width: 140, fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
            {form.amenities.length > 0 && (
              <div style={{ padding: '11px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ width: 140, fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', flexShrink: 0, paddingTop: 2 }}>Amenities</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {form.amenities.slice(0, 6).map(a => (
                    <span key={a} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${accent}14`, color: accent }}>
                      {AMENITIES.find(am => am.id === a)?.label}
                    </span>
                  ))}
                  {form.amenities.length > 6 && <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>+{form.amenities.length - 6} more</span>}
                </div>
              </div>
            )}
          </div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>What happens next</div>
            {[
              'Property added to your portfolio',
              'Guidebook draft auto-generated with your amenities',
              'Default cleaning schedule created',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={10} color="#fff" />
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item}</span>
              </div>
            ))}
          </div>
          {/* Auto-generate Task Template */}
          <div style={{ border: `1px solid ${accent}30`, borderRadius: 10, background: `${accent}06`, overflow: 'hidden', marginBottom: 20 }}>
            <button
              onClick={() => setShowTemplate(v => !v)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: accent, marginBottom: 2 }}>
                  🗂 Auto-Generated Task Template
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {form.bedrooms} bed · {form.bathrooms} bath · {form.amenities.length} amenities → {templateItems.length} checklist items
                </div>
              </div>
              <ChevronDown size={16} style={{ color: accent, transform: showTemplate ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {showTemplate && (
              <div style={{ borderTop: `1px solid ${accent}20`, padding: '12px 16px 16px' }}>
                <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 12 }}>
                  {templateGroups.map(group => (
                    <div key={group.name} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{group.name}</div>
                      {group.items.map((item: ChecklistItem) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '4px 0', fontSize: 12, color: 'var(--text-muted)' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0, marginTop: 1 }} />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    try { localStorage.setItem(`afterstay_template_${form.name || 'property'}`, JSON.stringify(templateItems)) } catch {}
                    setTemplateSaved(true)
                  }}
                  style={{ width: '100%', padding: '9px', borderRadius: 8, border: 'none', background: templateSaved ? '#10b981' : accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {templateSaved ? '✓ Template Saved to Property' : 'Save Task Template for This Property'}
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setDirection(-1); setStep(1) }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>
              Edit Details
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Add Property
            </motion.button>
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
      <PageHeader title="Onboard property" subtitle="New property setup" />
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 12 }}>N</div>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>AfterStay</span>
          <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>/ Add Property</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!success && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Step {step} of {TOTAL_STEPS}</span>}
          <button onClick={() => router.push('/operator/properties')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
            Save & Exit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {!success && (
        <div style={{ height: 3, background: 'var(--border)', flexShrink: 0 }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%', background: accent, borderRadius: 2 }}
          />
        </div>
      )}

      {/* Step content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '48px 24px 120px' }}>
        <div style={{ maxWidth: 640, width: '100%' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={success ? 'success' : step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      {!success && step < 9 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', zIndex: 10 }}>
          {step > 1 && (
            <button onClick={back} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <button onClick={next} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 28px', borderRadius: 10, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Continue <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

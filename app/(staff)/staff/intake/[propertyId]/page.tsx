'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import {
  ArrowLeft, ChevronDown, ChevronUp, Camera, Plus, Trash2, Check, CheckCircle2,
} from 'lucide-react'
import { PROPERTIES } from '@/lib/data/properties'

// ── Types ──────────────────────────────────────────────────────────────────

type BedroomEntry = {
  id: string; name: string; bedType: string; bedCount: string
  blackout: string; notes: string
}

type ApplianceEntry = {
  id: string; type: string; brand: string; model: string; serial: string
  condition: string; warranty: string; usage: string; location: string
}

type PhotoItem = {
  id: string; label: string; required: boolean; checked: boolean
}

type SectionData = {
  // Access
  entryMethod: string; doorCode: string; entryInstructions: string
  lockboxLocation: string; lockboxCode: string; smartLockType: string; smartLockReset: string
  buildingCode: string; elevatorCode: string; spareKey: string
  guestParking: string; staffParking: string; parkingCode: string
  // Utilities
  fuseboxLocation: string; wifiName: string; wifiPassword: string; waterShutoff: string
  fuseboxNotes: string; hotWaterLocation: string; hotWaterType: string; hotWaterReset: string
  electricityMeter: string; gasMeter: string; gasShutoff: string
  thermostatType: string; thermostatLocation: string; thermostatInstructions: string
  underfloor: boolean; underfloorControls: string; routerLocation: string; routerReset: string
  // Rooms
  totalBedrooms: string; totalBathrooms: string; linenStorage: string; cleaningSupplies: string
  spareBedding: string; vacuumLocation: string; ironLocation: string; firstAidLocation: string
  bulbLocation: string; rubbishBags: string; recycling: string; binDay: string; binLocation: string
  pool: boolean; poolInstructions: string
  // Rules
  maxGuests: string; pets: string; smoking: string; checkinTime: string; checkoutTime: string
  quietHours: string; partyPolicy: string; petRules: string; shoePolicy: string
  poolRules: string; recyclingRules: string; additionalRules: string
  // Emergency
  extinguisherLocation: string; fireExit: string; hospital: string
  smokeAlarmLocations: string; smokeAlarmReset: string; coDetector: boolean; coLocations: string
  emergencyGasShutoff: string; buildingManager: string; pharmacy: string
  onSiteContact: string; knownHazards: string
}

const BLANK: SectionData = {
  entryMethod: '', doorCode: '', entryInstructions: '',
  lockboxLocation: '', lockboxCode: '', smartLockType: '', smartLockReset: '',
  buildingCode: '', elevatorCode: '', spareKey: '',
  guestParking: '', staffParking: '', parkingCode: '',
  fuseboxLocation: '', wifiName: '', wifiPassword: '', waterShutoff: '',
  fuseboxNotes: '', hotWaterLocation: '', hotWaterType: '', hotWaterReset: '',
  electricityMeter: '', gasMeter: '', gasShutoff: '',
  thermostatType: '', thermostatLocation: '', thermostatInstructions: '',
  underfloor: false, underfloorControls: '', routerLocation: '', routerReset: '',
  totalBedrooms: '', totalBathrooms: '', linenStorage: '', cleaningSupplies: '',
  spareBedding: '', vacuumLocation: '', ironLocation: '', firstAidLocation: '',
  bulbLocation: '', rubbishBags: '', recycling: '', binDay: '', binLocation: '',
  pool: false, poolInstructions: '',
  maxGuests: '', pets: '', smoking: '', checkinTime: '', checkoutTime: '',
  quietHours: '', partyPolicy: '', petRules: '', shoePolicy: '',
  poolRules: '', recyclingRules: '', additionalRules: '',
  extinguisherLocation: '', fireExit: '', hospital: '',
  smokeAlarmLocations: '', smokeAlarmReset: '', coDetector: false, coLocations: '',
  emergencyGasShutoff: '', buildingManager: '', pharmacy: '',
  onSiteContact: '', knownHazards: '',
}

const INITIAL_PHOTOS: PhotoItem[] = [
  { id: 'r1',  label: 'Front of property — from the street, entrance clearly visible', required: true,  checked: false },
  { id: 'r2',  label: 'Front entrance close-up — door, lockbox, keypad visible',       required: true,  checked: false },
  { id: 'r3',  label: 'Living area — wide shot from the doorway',                       required: true,  checked: false },
  { id: 'r4',  label: 'Kitchen — from doorway showing appliances and layout',            required: true,  checked: false },
  { id: 'r5',  label: 'Each bedroom — from doorway, full room visible',                  required: true,  checked: false },
  { id: 'r6',  label: 'Each bathroom — toilet, sink, shower/bath in one shot',           required: true,  checked: false },
  { id: 'r7',  label: 'Fusebox — open panel, labels visible',                           required: true,  checked: false },
  { id: 'r8',  label: 'Water shutoff valve — location clearly shown',                   required: true,  checked: false },
  { id: 'r9',  label: 'Linen storage — open shelves, stock visible',                    required: true,  checked: false },
  { id: 'r10', label: 'Cleaning supplies — all products and equipment shown',            required: true,  checked: false },
  { id: 'o1',  label: 'Parking area',                                                   required: false, checked: false },
  { id: 'o2',  label: 'Building entrance / gate',                                       required: false, checked: false },
  { id: 'o3',  label: 'Outdoor area — garden, terrace, balcony',                       required: false, checked: false },
  { id: 'o4',  label: 'Pool or hot tub',                                               required: false, checked: false },
  { id: 'o5',  label: 'Router — unit and WiFi sticker',                                required: false, checked: false },
  { id: 'o6',  label: 'Thermostat — display and controls',                             required: false, checked: false },
  { id: 'o7',  label: 'Any known issues — damage, wear, access problems',              required: false, checked: false },
]

type SectionKey = 'access' | 'utilities' | 'rooms' | 'rules' | 'emergency' | 'appliances' | 'photos'
const SECTION_KEYS: SectionKey[] = ['access', 'utilities', 'rooms', 'rules', 'emergency', 'appliances', 'photos']

type SectionMeta = { label: string; emoji: string; tip: string; mandatory: (keyof SectionData)[] }
const SECTION_META: Record<SectionKey, SectionMeta> = {
  access: {
    label: 'Access', emoji: '🔑',
    tip: 'This is the most important section. If access fails, nothing else matters. Try every code yourself before submitting.',
    mandatory: ['entryMethod', 'doorCode', 'entryInstructions'],
  },
  utilities: {
    label: 'Utilities', emoji: '⚡',
    tip: "This section prevents the most expensive calls. A cleaner who knows where the water shutoff is can stop a flood. Find these things yourself — don't guess.",
    mandatory: ['fuseboxLocation', 'wifiName', 'wifiPassword', 'waterShutoff'],
  },
  rooms: {
    label: 'Rooms & Storage', emoji: '🛏',
    tip: 'Cleaners need to know bed sizes to bring the right linen. Everyone needs to know where things are stored. Walk every room before filling this in.',
    mandatory: ['totalBedrooms', 'totalBathrooms', 'linenStorage', 'cleaningSupplies'],
  },
  rules: {
    label: 'Rules', emoji: '📋',
    tip: 'Rules protect you legally and prevent guest disputes. Be specific — "no parties" is less useful than "maximum 4 guests, no gatherings after 10pm".',
    mandatory: ['maxGuests', 'pets', 'smoking', 'checkinTime', 'checkoutTime'],
  },
  emergency: {
    label: 'Emergency', emoji: '🚨',
    tip: 'This section is rarely needed and critical when it is. Fill it in carefully. One day it will matter.',
    mandatory: ['extinguisherLocation', 'fireExit', 'hospital'],
  },
  appliances: {
    label: 'Appliances', emoji: '🔧',
    tip: 'Add every major appliance. Serial numbers are usually on a sticker inside the door or on the back. This is how we track warranties and help guests use things correctly.',
    mandatory: [],
  },
  photos: {
    label: 'Photos', emoji: '📸',
    tip: "Photos are how your team gets to know a property they've never visited. Every photo here prevents a question later. Shoot in landscape. Good light. No clutter.",
    mandatory: [],
  },
}

// ── Storage helpers ────────────────────────────────────────────────────────

type Draft = { data: SectionData; bedrooms: BedroomEntry[]; appliances: ApplianceEntry[]; photos: PhotoItem[]; submittedBy: string; lastSaved: string }

function loadDraft(propertyId: string, userId: string): Draft | null {
  try {
    const raw = localStorage.getItem(`nestops_intake_${propertyId}`)
    if (!raw) return null
    return (JSON.parse(raw) as Record<string, Draft>)[userId] ?? null
  } catch { return null }
}

function saveDraft(propertyId: string, userId: string, userName: string, payload: Omit<Draft, 'submittedBy' | 'lastSaved'>) {
  try {
    const raw = localStorage.getItem(`nestops_intake_${propertyId}`)
    const all: Record<string, Draft> = raw ? JSON.parse(raw) : {}
    all[userId] = { ...payload, submittedBy: userName, lastSaved: new Date().toISOString() }
    localStorage.setItem(`nestops_intake_${propertyId}`, JSON.stringify(all))
  } catch { /* silent */ }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

// ── Shared input styles ────────────────────────────────────────────────────

const inputCss: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const textareaCss: React.CSSProperties = {
  ...inputCss, resize: 'vertical', minHeight: 80, fontFamily: 'inherit', lineHeight: 1.5,
}
const selectCss: React.CSSProperties = {
  ...inputCss, cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36,
}

// ── Micro components ───────────────────────────────────────────────────────

function Fl({ label, helper, req, children }: { label: string; helper?: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>
        {label}{req && <span style={{ color: '#e24b4a', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {helper && <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4, lineHeight: 1.45 }}>{helper}</p>}
    </div>
  )
}

function PhotoPrompt({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, background: 'rgba(239,159,39,0.07)', border: '1px solid rgba(239,159,39,0.2)', borderRadius: 8, padding: '9px 12px', margin: '12px 0' }}>
      <Camera size={13} style={{ color: '#ef9f27', flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 12, color: '#ef9f27', fontStyle: 'italic', lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, minHeight: 40 }}>
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: value ? 'var(--green)' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
      >
        <span style={{ position: 'absolute', top: 2, left: value ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
      </button>
    </div>
  )
}

function DeepDiveToggle({ expanded, label = 'Deep dive', onToggle }: { expanded: boolean; label?: string; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}
    >
      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      <span style={{ fontWeight: 500 }}>{expanded ? `Hide ${label}` : `▼ ${label}`}</span>
    </button>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({ id, meta, complete, refCb, children }: {
  id: SectionKey; meta: SectionMeta; complete: 'none' | 'partial' | 'complete'
  refCb: (el: HTMLDivElement | null) => void; children: React.ReactNode
}) {
  return (
    <div
      id={`sec-${id}`}
      ref={refCb}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 14, scrollMarginTop: 116 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{meta.emoji}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{meta.label}</span>
        </div>
        {complete === 'complete'
          ? <CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
          : complete === 'partial'
            ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--amber)', flexShrink: 0, marginTop: 2 }} />
            : <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0, marginTop: 2 }} />
        }
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.55, marginBottom: 20, marginTop: 4 }}>
        💡 {meta.tip}
      </p>
      {children}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function IntakePage() {
  const params = useParams()
  const router = useRouter()
  const { accent } = useRole()
  const propertyId = typeof params.propertyId === 'string' ? params.propertyId : ''
  const property = PROPERTIES.find(p => p.id === propertyId) ?? null

  const [userId, setUserId]     = useState('')
  const [userName, setUserName] = useState('Staff')
  const [activeSection, setActiveSection] = useState<SectionKey>('access')
  const [expanded, setExpanded] = useState<Set<SectionKey>>(new Set())
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [data, setData]           = useState<SectionData>(BLANK)
  const [bedrooms, setBedrooms]   = useState<BedroomEntry[]>([])
  const [appliances, setAppliances] = useState<ApplianceEntry[]>([])
  const [photos, setPhotos]       = useState<PhotoItem[]>(INITIAL_PHOTOS)

  const sectionRefs = useRef<Partial<Record<SectionKey, HTMLDivElement | null>>>({})

  // Load saved draft on mount
  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('nestops_user') || '{}')
      const uid = profile.id ?? 'guest'
      const uname = profile.name ?? 'Staff'
      setUserId(uid)
      setUserName(uname)
      const draft = loadDraft(propertyId, uid)
      if (draft) {
        setData(draft.data ?? BLANK)
        setBedrooms(draft.bedrooms ?? [])
        setAppliances(draft.appliances ?? [])
        setPhotos(draft.photos ?? INITIAL_PHOTOS)
      }
    } catch { /* silent */ }
  }, [propertyId])

  // Debounced auto-save
  const triggerSave = useCallback(() => {
    if (!userId) return
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveDraft(propertyId, userId, userName, { data, bedrooms, appliances, photos })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 700)
  }, [propertyId, userId, userName, data, bedrooms, appliances, photos])

  useEffect(() => { if (userId) triggerSave() }, [data, bedrooms, appliances, photos])

  function set(key: keyof SectionData, value: string | boolean) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function toggleExpand(key: SectionKey) {
    setExpanded(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  function scrollTo(key: SectionKey) {
    setActiveSection(key)
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Section completion status
  function completion(section: SectionKey): 'none' | 'partial' | 'complete' {
    if (section === 'appliances') return appliances.length > 0 ? 'partial' : 'none'
    if (section === 'photos') {
      const req = photos.filter(p => p.required)
      const done = req.filter(p => p.checked).length
      if (done === 0) return 'none'
      return done === req.length ? 'complete' : 'partial'
    }
    const keys = SECTION_META[section].mandatory as string[]
    if (!keys.length) return 'none'
    const filled = keys.filter(k => { const v = data[k as keyof SectionData]; return v !== '' && v !== false }).length
    if (filled === 0) return 'none'
    return filled === keys.length ? 'complete' : 'partial'
  }

  // Bedroom helpers
  function addBedroom() {
    setBedrooms(prev => [...prev, { id: uid(), name: '', bedType: '', bedCount: '1', blackout: '', notes: '' }])
  }
  function updateBedroom(id: string, key: keyof BedroomEntry, val: string) {
    setBedrooms(prev => prev.map(b => b.id === id ? { ...b, [key]: val } : b))
  }
  function removeBedroom(id: string) { setBedrooms(prev => prev.filter(b => b.id !== id)) }

  // Appliance helpers
  function addAppliance() {
    setAppliances(prev => [...prev, { id: uid(), type: '', brand: '', model: '', serial: '', condition: '', warranty: '', usage: '', location: '' }])
  }
  function updateAppliance(id: string, key: keyof ApplianceEntry, val: string) {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, [key]: val } : a))
  }
  function removeAppliance(id: string) { setAppliances(prev => prev.filter(a => a.id !== id)) }

  function togglePhoto(id: string) {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p))
  }

  const completedCount = SECTION_KEYS.filter(s => completion(s) === 'complete').length
  const checkedPhotos  = photos.filter(p => p.required && p.checked).length
  const reqPhotos      = photos.filter(p => p.required).length
  const canSubmit      = completedCount >= 3 && checkedPhotos >= 3

  if (!property) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 16 }}>Property not found.</p>
          <button onClick={() => router.back()} style={{ color: accent, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>← Go back</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', paddingBottom: 80 }}>

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 2px', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>Field Visit</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>{property.address}, {property.city}</div>
          </div>
          <span style={{ fontSize: 11, color: saveStatus === 'saved' ? 'var(--green)' : saveStatus === 'saving' ? 'var(--text-subtle)' : 'transparent', flexShrink: 0, transition: 'color 0.3s' }}>
            {saveStatus === 'saving' ? 'Saving…' : '✓ Saved'}
          </span>
        </div>

        {/* Section nav pills */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 10px', overflowX: 'auto' }}>
          {SECTION_KEYS.map(key => {
            const c = completion(key)
            const active = activeSection === key
            return (
              <button
                key={key}
                onClick={() => scrollTo(key)}
                style={{
                  flexShrink: 0, padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  border: '1px solid', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                  background: active ? accent : 'transparent',
                  color: active ? '#fff' : c === 'complete' ? 'var(--green)' : c === 'partial' ? 'var(--amber)' : 'var(--text-muted)',
                  borderColor: active ? accent : c === 'complete' ? 'var(--green-border)' : c === 'partial' ? 'var(--n-amber-border)' : 'var(--border)',
                }}
              >
                {SECTION_META[key].emoji} {SECTION_META[key].label}
              </button>
            )
          })}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 10px' }}>
          <div style={{ flex: 1, height: 3, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(completedCount / 7) * 100}%`, background: accent, borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-subtle)', flexShrink: 0, fontWeight: 600 }}>{completedCount}/7</span>
        </div>
      </div>

      <div style={{ padding: '14px 14px 0' }}>

        {/* ──────────────────────────────────────────────────────────
            SECTION 1 — ACCESS
        ────────────────────────────────────────────────────────── */}
        <Section id="access" meta={SECTION_META.access} complete={completion('access')} refCb={el => { sectionRefs.current.access = el }}>

          <Fl label="Primary entry method" helper="How does the main front door open?" req>
            <select style={selectCss} value={data.entryMethod} onChange={e => set('entryMethod', e.target.value)}>
              <option value="">Select…</option>
              {['Key', 'Keypad', 'Smart lock', 'Lockbox', 'Fob'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Fl>

          <Fl label="Main door code or key location" helper="The exact code, or where the key is kept" req>
            <input style={inputCss} type="text" placeholder="e.g. 4821 or under the welcome mat" value={data.doorCode} onChange={e => set('doorCode', e.target.value)} />
          </Fl>

          <Fl label="Entry instructions" helper="Step by step. Assume the person has never been here." req>
            <textarea style={textareaCss} placeholder={`e.g. "Enter through the blue gate, main door top of stairs"`} value={data.entryInstructions} onChange={e => set('entryInstructions', e.target.value)} />
          </Fl>

          <PhotoPrompt text="Front entrance from the street — so staff can recognise it when they arrive" />

          <DeepDiveToggle expanded={expanded.has('access')} onToggle={() => toggleExpand('access')} />

          {expanded.has('access') && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <Fl label="Lockbox location" helper="Where exactly? On the door? Gate? Under the mat?">
                <input style={inputCss} type="text" value={data.lockboxLocation} onChange={e => set('lockboxLocation', e.target.value)} />
              </Fl>
              <Fl label="Lockbox code">
                <input style={inputCss} type="text" value={data.lockboxCode} onChange={e => set('lockboxCode', e.target.value)} />
              </Fl>
              <Fl label="Smart lock type">
                <select style={selectCss} value={data.smartLockType} onChange={e => set('smartLockType', e.target.value)}>
                  <option value="">Select…</option>
                  {['Yale', 'August', 'Nuki', 'Igloohome', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <Fl label="Smart lock reset instructions" helper="What to do if it fails or the battery dies">
                <textarea style={textareaCss} value={data.smartLockReset} onChange={e => set('smartLockReset', e.target.value)} />
              </Fl>
              <Fl label="Building entry code" helper="Gate, lobby, or building door before the property">
                <input style={inputCss} type="text" value={data.buildingCode} onChange={e => set('buildingCode', e.target.value)} />
              </Fl>
              <Fl label="Elevator code" helper="If the elevator requires a code or fob">
                <input style={inputCss} type="text" value={data.elevatorCode} onChange={e => set('elevatorCode', e.target.value)} />
              </Fl>
              <Fl label="Spare key location" helper="Where is the backup key kept?">
                <input style={inputCss} type="text" value={data.spareKey} onChange={e => set('spareKey', e.target.value)} />
              </Fl>
              <Fl label="Guest parking instructions" helper="Where do guests park? Permit needed?">
                <textarea style={textareaCss} value={data.guestParking} onChange={e => set('guestParking', e.target.value)} />
              </Fl>
              <Fl label="Staff parking instructions" helper="Where should cleaners and maintenance park?">
                <textarea style={textareaCss} value={data.staffParking} onChange={e => set('staffParking', e.target.value)} />
              </Fl>
              <Fl label="Parking code or permit">
                <input style={inputCss} type="text" value={data.parkingCode} onChange={e => set('parkingCode', e.target.value)} />
              </Fl>
              <PhotoPrompt text="Lockbox — mounted with property visible in background" />
              <PhotoPrompt text="Building entrance — main gate or lobby door" />
              <PhotoPrompt text="Parking — the spot or area staff use" />
            </div>
          )}
        </Section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 2 — UTILITIES
        ────────────────────────────────────────────────────────── */}
        <Section id="utilities" meta={SECTION_META.utilities} complete={completion('utilities')} refCb={el => { sectionRefs.current.utilities = el }}>

          <Fl label="Fusebox location" helper={`e.g. "Hallway cupboard, second door on the left, top shelf"`} req>
            <input style={inputCss} type="text" value={data.fuseboxLocation} onChange={e => set('fuseboxLocation', e.target.value)} />
          </Fl>
          <Fl label="WiFi network name" req>
            <input style={inputCss} type="text" value={data.wifiName} onChange={e => set('wifiName', e.target.value)} />
          </Fl>
          <Fl label="WiFi password" req>
            <input style={inputCss} type="text" value={data.wifiPassword} onChange={e => set('wifiPassword', e.target.value)} />
          </Fl>
          <Fl label="Water shutoff location" helper="Usually under the sink, utility cupboard, or basement. Turn it to test it." req>
            <input style={inputCss} type="text" value={data.waterShutoff} onChange={e => set('waterShutoff', e.target.value)} />
          </Fl>

          <PhotoPrompt text="Fusebox — open the panel, photograph the inside so staff can see which breaker is which" />
          <PhotoPrompt text="Water shutoff — close-up of the valve and its location" />

          <DeepDiveToggle expanded={expanded.has('utilities')} onToggle={() => toggleExpand('utilities')} />

          {expanded.has('utilities') && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <Fl label="Fusebox notes" helper="Any breakers confusingly labelled? Any that should never be switched off?">
                <textarea style={textareaCss} value={data.fuseboxNotes} onChange={e => set('fuseboxNotes', e.target.value)} />
              </Fl>
              <Fl label="Hot water heater location">
                <input style={inputCss} type="text" value={data.hotWaterLocation} onChange={e => set('hotWaterLocation', e.target.value)} />
              </Fl>
              <Fl label="Hot water heater type">
                <select style={selectCss} value={data.hotWaterType} onChange={e => set('hotWaterType', e.target.value)}>
                  <option value="">Select…</option>
                  {['Electric', 'Gas', 'Combi boiler', 'Heat pump'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <Fl label="Hot water reset instructions" helper="What to do if hot water stops working">
                <textarea style={textareaCss} value={data.hotWaterReset} onChange={e => set('hotWaterReset', e.target.value)} />
              </Fl>
              <Fl label="Electricity meter number" helper="Usually on a sticker on the meter itself">
                <input style={inputCss} type="text" value={data.electricityMeter} onChange={e => set('electricityMeter', e.target.value)} />
              </Fl>
              <Fl label="Gas meter number">
                <input style={inputCss} type="text" value={data.gasMeter} onChange={e => set('gasMeter', e.target.value)} />
              </Fl>
              <Fl label="Gas shutoff location" helper="Critical for emergencies. Usually near the meter or under the hob.">
                <input style={inputCss} type="text" value={data.gasShutoff} onChange={e => set('gasShutoff', e.target.value)} />
              </Fl>
              <Fl label="Thermostat type">
                <select style={selectCss} value={data.thermostatType} onChange={e => set('thermostatType', e.target.value)}>
                  <option value="">Select…</option>
                  {['Manual', 'Digital', 'Smart'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <Fl label="Thermostat location">
                <input style={inputCss} type="text" value={data.thermostatLocation} onChange={e => set('thermostatLocation', e.target.value)} />
              </Fl>
              <Fl label="Thermostat instructions" helper={`How to set heating and cooling. Include quirks — e.g. "takes 30 min to heat up"`}>
                <textarea style={textareaCss} value={data.thermostatInstructions} onChange={e => set('thermostatInstructions', e.target.value)} />
              </Fl>
              <Toggle label="Underfloor heating" value={data.underfloor} onChange={v => set('underfloor', v)} />
              {data.underfloor && (
                <Fl label="Underfloor heating controls" helper="Where is the panel? How do you set it?">
                  <input style={inputCss} type="text" value={data.underfloorControls} onChange={e => set('underfloorControls', e.target.value)} />
                </Fl>
              )}
              <Fl label="Router location">
                <input style={inputCss} type="text" value={data.routerLocation} onChange={e => set('routerLocation', e.target.value)} />
              </Fl>
              <Fl label="Router reset instructions" helper="What to do if WiFi stops working">
                <textarea style={textareaCss} value={data.routerReset} onChange={e => set('routerReset', e.target.value)} />
              </Fl>
              <PhotoPrompt text="Hot water heater — full unit showing brand and controls" />
              <PhotoPrompt text="Thermostat — display and controls visible" />
              <PhotoPrompt text="Router — unit and WiFi sticker if present" />
            </div>
          )}
        </Section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 3 — ROOMS & STORAGE
        ────────────────────────────────────────────────────────── */}
        <Section id="rooms" meta={SECTION_META.rooms} complete={completion('rooms')} refCb={el => { sectionRefs.current.rooms = el }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fl label="Total bedrooms" req>
              <input style={inputCss} type="number" min="0" value={data.totalBedrooms} onChange={e => set('totalBedrooms', e.target.value)} />
            </Fl>
            <Fl label="Total bathrooms" req>
              <input style={inputCss} type="number" min="0" value={data.totalBathrooms} onChange={e => set('totalBathrooms', e.target.value)} />
            </Fl>
          </div>
          <Fl label="Linen storage location" helper="Where are clean sheets and towels kept?" req>
            <input style={inputCss} type="text" value={data.linenStorage} onChange={e => set('linenStorage', e.target.value)} />
          </Fl>
          <Fl label="Cleaning supplies location" helper="Where are the mop, vacuum, cleaning products?" req>
            <input style={inputCss} type="text" value={data.cleaningSupplies} onChange={e => set('cleaningSupplies', e.target.value)} />
          </Fl>

          {/* Per-bedroom repeater */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Bedrooms ({bedrooms.length})
              </span>
              <button
                onClick={addBedroom}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${accent}`, borderRadius: 20, padding: '5px 12px', color: accent, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                <Plus size={11} /> Add Bedroom
              </button>
            </div>

            {bedrooms.length === 0 && (
              <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '20px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Tap + Add Bedroom for each bedroom in the property</p>
              </div>
            )}

            {bedrooms.map((br, i) => (
              <div key={br.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Bedroom {i + 1}{br.name ? ` — ${br.name}` : ''}
                  </span>
                  <button onClick={() => removeBedroom(br.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 2 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <Fl label="Bedroom name" helper={`e.g. "Master", "Twin room", "Bunk room"`}>
                  <input style={inputCss} type="text" value={br.name} onChange={e => updateBedroom(br.id, 'name', e.target.value)} />
                </Fl>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Fl label="Bed type">
                    <select style={selectCss} value={br.bedType} onChange={e => updateBedroom(br.id, 'bedType', e.target.value)}>
                      <option value="">Select…</option>
                      {['Single', 'Double', 'Queen', 'King', 'Bunk', 'Sofa bed'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </Fl>
                  <Fl label="Bed count">
                    <input style={inputCss} type="number" min="1" value={br.bedCount} onChange={e => updateBedroom(br.id, 'bedCount', e.target.value)} />
                  </Fl>
                </div>
                <Fl label="Blackout curtains">
                  <select style={selectCss} value={br.blackout} onChange={e => updateBedroom(br.id, 'blackout', e.target.value)}>
                    <option value="">Select…</option>
                    {['Yes', 'No', 'Partial'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Fl>
                <Fl label="Notes for cleaner" helper="Mattress topper? Tricky fitted sheet? Pillow protectors required?">
                  <textarea style={{ ...textareaCss, minHeight: 60 }} value={br.notes} onChange={e => updateBedroom(br.id, 'notes', e.target.value)} />
                </Fl>
              </div>
            ))}

            <PhotoPrompt text="Each bedroom — photo of the made bed so staff know the correct layout" />
          </div>

          <DeepDiveToggle expanded={expanded.has('rooms')} onToggle={() => toggleExpand('rooms')} />

          {expanded.has('rooms') && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <Fl label="Spare bedding location" helper="Extra pillows, spare duvets, mattress protectors">
                <input style={inputCss} type="text" value={data.spareBedding} onChange={e => set('spareBedding', e.target.value)} />
              </Fl>
              <Fl label="Vacuum cleaner type + location">
                <input style={inputCss} type="text" value={data.vacuumLocation} onChange={e => set('vacuumLocation', e.target.value)} />
              </Fl>
              <Fl label="Ironing board and iron location">
                <input style={inputCss} type="text" value={data.ironLocation} onChange={e => set('ironLocation', e.target.value)} />
              </Fl>
              <Fl label="First aid kit location">
                <input style={inputCss} type="text" value={data.firstAidLocation} onChange={e => set('firstAidLocation', e.target.value)} />
              </Fl>
              <Fl label="Spare lightbulb location">
                <input style={inputCss} type="text" value={data.bulbLocation} onChange={e => set('bulbLocation', e.target.value)} />
              </Fl>
              <Fl label="Rubbish bag storage">
                <input style={inputCss} type="text" value={data.rubbishBags} onChange={e => set('rubbishBags', e.target.value)} />
              </Fl>
              <Fl label="Recycling instructions" helper="What goes where. Which bin is which colour.">
                <textarea style={textareaCss} value={data.recycling} onChange={e => set('recycling', e.target.value)} />
              </Fl>
              <Fl label="Bin collection day">
                <input style={inputCss} type="text" value={data.binDay} onChange={e => set('binDay', e.target.value)} />
              </Fl>
              <Fl label="Bin location" helper="Where do bins go on collection day? Where are they stored?">
                <input style={inputCss} type="text" value={data.binLocation} onChange={e => set('binLocation', e.target.value)} />
              </Fl>
              <Toggle label="Pool / hot tub on property" value={data.pool} onChange={v => set('pool', v)} />
              {data.pool && (
                <Fl label="Pool / hot tub maintenance instructions">
                  <textarea style={textareaCss} value={data.poolInstructions} onChange={e => set('poolInstructions', e.target.value)} />
                </Fl>
              )}
              <PhotoPrompt text="Linen cupboard — open doors, show shelves and what's on each" />
              <PhotoPrompt text="Cleaning supplies — all products visible" />
              <PhotoPrompt text="Bins — all bins labelled, show where they live" />
            </div>
          )}
        </Section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 4 — RULES
        ────────────────────────────────────────────────────────── */}
        <Section id="rules" meta={SECTION_META.rules} complete={completion('rules')} refCb={el => { sectionRefs.current.rules = el }}>

          <Fl label="Maximum guest capacity" req>
            <input style={inputCss} type="number" min="1" value={data.maxGuests} onChange={e => set('maxGuests', e.target.value)} />
          </Fl>
          <Fl label="Pets allowed" req>
            <select style={selectCss} value={data.pets} onChange={e => set('pets', e.target.value)}>
              <option value="">Select…</option>
              {['Yes', 'No', 'On request'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Fl>
          <Fl label="Smoking" req>
            <select style={selectCss} value={data.smoking} onChange={e => set('smoking', e.target.value)}>
              <option value="">Select…</option>
              {['No smoking anywhere', 'Outside only', 'Designated area'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Fl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fl label="Check-in time" req>
              <input style={inputCss} type="time" value={data.checkinTime} onChange={e => set('checkinTime', e.target.value)} />
            </Fl>
            <Fl label="Check-out time" req>
              <input style={inputCss} type="time" value={data.checkoutTime} onChange={e => set('checkoutTime', e.target.value)} />
            </Fl>
          </div>

          <DeepDiveToggle expanded={expanded.has('rules')} onToggle={() => toggleExpand('rules')} />

          {expanded.has('rules') && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <Fl label="Quiet hours" helper="When do quiet hours start and end?">
                <input style={inputCss} type="text" placeholder="e.g. 10pm – 8am" value={data.quietHours} onChange={e => set('quietHours', e.target.value)} />
              </Fl>
              <Fl label="Party / event policy" helper="Gatherings permitted? Any restrictions?">
                <textarea style={textareaCss} value={data.partyPolicy} onChange={e => set('partyPolicy', e.target.value)} />
              </Fl>
              <Fl label="Pet rules detail" helper="Which rooms? Breed or size restrictions? Deposit required?">
                <textarea style={textareaCss} value={data.petRules} onChange={e => set('petRules', e.target.value)} />
              </Fl>
              <Fl label="Shoe policy">
                <select style={selectCss} value={data.shoePolicy} onChange={e => set('shoePolicy', e.target.value)}>
                  <option value="">Select…</option>
                  {['Shoes off inside', 'No restriction'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <Fl label="Pool rules" helper="Hours, supervision, no diving, etc.">
                <textarea style={textareaCss} value={data.poolRules} onChange={e => set('poolRules', e.target.value)} />
              </Fl>
              <Fl label="Rubbish and recycling rules" helper="Specific sorting requirements for this area">
                <textarea style={textareaCss} value={data.recyclingRules} onChange={e => set('recyclingRules', e.target.value)} />
              </Fl>
              <Fl label="Additional rules" helper="Anything else guests must know before arrival">
                <textarea style={textareaCss} value={data.additionalRules} onChange={e => set('additionalRules', e.target.value)} />
              </Fl>
            </div>
          )}
        </Section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 5 — EMERGENCY
        ────────────────────────────────────────────────────────── */}
        <Section id="emergency" meta={SECTION_META.emergency} complete={completion('emergency')} refCb={el => { sectionRefs.current.emergency = el }}>

          <Fl label="Fire extinguisher location" helper="Look for a red cylinder — usually in the kitchen, hallway, or near the entrance" req>
            <input style={inputCss} type="text" value={data.extinguisherLocation} onChange={e => set('extinguisherLocation', e.target.value)} />
          </Fl>
          <Fl label="Fire exit route" helper="How do guests get out in an emergency? Every floor if multi-storey." req>
            <textarea style={textareaCss} value={data.fireExit} onChange={e => set('fireExit', e.target.value)} />
          </Fl>
          <Fl label="Nearest hospital / A&E" helper="Name and address. Google Maps it to confirm." req>
            <input style={inputCss} type="text" value={data.hospital} onChange={e => set('hospital', e.target.value)} />
          </Fl>

          <PhotoPrompt text="Fire extinguisher — mounted in its location" />

          <DeepDiveToggle expanded={expanded.has('emergency')} onToggle={() => toggleExpand('emergency')} />

          {expanded.has('emergency') && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <Fl label="Smoke alarm locations" helper="List every smoke alarm in the property">
                <input style={inputCss} type="text" value={data.smokeAlarmLocations} onChange={e => set('smokeAlarmLocations', e.target.value)} />
              </Fl>
              <Fl label="Smoke alarm reset instructions" helper="How to silence a false alarm">
                <textarea style={textareaCss} value={data.smokeAlarmReset} onChange={e => set('smokeAlarmReset', e.target.value)} />
              </Fl>
              <Toggle label="Carbon monoxide detector present" value={data.coDetector} onChange={v => set('coDetector', v)} />
              {data.coDetector && (
                <Fl label="CO detector locations">
                  <input style={inputCss} type="text" value={data.coLocations} onChange={e => set('coLocations', e.target.value)} />
                </Fl>
              )}
              <Fl label="Emergency gas shutoff" helper="Where is the gas shutoff valve in an emergency?">
                <input style={inputCss} type="text" value={data.emergencyGasShutoff} onChange={e => set('emergencyGasShutoff', e.target.value)} />
              </Fl>
              <Fl label="Building manager contact" helper="Name, phone, when to call them">
                <input style={inputCss} type="text" value={data.buildingManager} onChange={e => set('buildingManager', e.target.value)} />
              </Fl>
              <Fl label="Nearest pharmacy">
                <input style={inputCss} type="text" value={data.pharmacy} onChange={e => set('pharmacy', e.target.value)} />
              </Fl>
              <Fl label="On-site emergency contact" helper="Neighbour, caretaker, or anyone who can help in person">
                <input style={inputCss} type="text" value={data.onSiteContact} onChange={e => set('onSiteContact', e.target.value)} />
              </Fl>
              <Fl label="Known hazards" helper="Steep stairs, low ceiling, uneven path — anything guests should know">
                <textarea style={textareaCss} value={data.knownHazards} onChange={e => set('knownHazards', e.target.value)} />
              </Fl>
            </div>
          )}
        </Section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 6 — APPLIANCES
        ────────────────────────────────────────────────────────── */}
        <Section id="appliances" meta={SECTION_META.appliances} complete={completion('appliances')} refCb={el => { sectionRefs.current.appliances = el }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {appliances.length === 0 ? 'No appliances added yet' : `${appliances.length} appliance${appliances.length !== 1 ? 's' : ''} added`}
            </span>
            <button
              onClick={addAppliance}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: accent, border: 'none', borderRadius: 20, padding: '7px 14px', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              <Plus size={12} /> Add Appliance
            </button>
          </div>

          {appliances.length === 0 && (
            <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: '24px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Tap + Add Appliance for each major appliance in the property</p>
            </div>
          )}

          {appliances.map((ap, i) => (
            <div key={ap.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Appliance {i + 1}{ap.type ? ` — ${ap.type}` : ''}
                </span>
                <button onClick={() => removeAppliance(ap.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 2 }}>
                  <Trash2 size={14} />
                </button>
              </div>
              <Fl label="Appliance type">
                <select style={selectCss} value={ap.type} onChange={e => updateAppliance(ap.id, 'type', e.target.value)}>
                  <option value="">Select…</option>
                  {['Washing machine', 'Dryer', 'Dishwasher', 'Oven', 'Hob', 'Microwave', 'Fridge', 'Freezer', 'TV', 'Air conditioning', 'Coffee machine', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Fl label="Brand" helper="e.g. Bosch, Samsung">
                  <input style={inputCss} type="text" value={ap.brand} onChange={e => updateAppliance(ap.id, 'brand', e.target.value)} />
                </Fl>
                <Fl label="Model number" helper="Inside door or back">
                  <input style={inputCss} type="text" value={ap.model} onChange={e => updateAppliance(ap.id, 'model', e.target.value)} />
                </Fl>
              </div>
              <Fl label="Serial number" helper="Same sticker as model number">
                <input style={inputCss} type="text" value={ap.serial} onChange={e => updateAppliance(ap.id, 'serial', e.target.value)} />
              </Fl>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Fl label="Condition">
                  <select style={selectCss} value={ap.condition} onChange={e => updateAppliance(ap.id, 'condition', e.target.value)}>
                    <option value="">Select…</option>
                    {['Excellent', 'Good', 'Fair', 'Poor'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Fl>
                <Fl label="Warranty">
                  <select style={selectCss} value={ap.warranty} onChange={e => updateAppliance(ap.id, 'warranty', e.target.value)}>
                    <option value="">Select…</option>
                    {['Under warranty', 'Expired', 'Unknown'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Fl>
              </div>
              <Fl label="How to use it" helper={`Quirks? e.g. "Press eco twice for normal wash", "Oven runs 10° hot"`}>
                <textarea style={{ ...textareaCss, minHeight: 64 }} value={ap.usage} onChange={e => updateAppliance(ap.id, 'usage', e.target.value)} />
              </Fl>
              <Fl label="Location in property" helper="Which room?">
                <input style={inputCss} type="text" value={ap.location} onChange={e => updateAppliance(ap.id, 'location', e.target.value)} />
              </Fl>
              <PhotoPrompt text="Two photos per appliance: (1) full unit, (2) close-up of the serial number sticker" />
            </div>
          ))}
        </Section>

        {/* ──────────────────────────────────────────────────────────
            SECTION 7 — PHOTOS
        ────────────────────────────────────────────────────────── */}
        <Section id="photos" meta={SECTION_META.photos} complete={completion('photos')} refCb={el => { sectionRefs.current.photos = el }}>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
            Check each photo as you capture it. At least 3 required photos must be checked before submitting.
          </p>

          <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Required ({checkedPhotos}/{reqPhotos} checked)
          </div>
          {photos.filter(p => p.required).map(photo => (
            <PhotoCheck key={photo.id} photo={photo} onToggle={() => togglePhoto(photo.id)} />
          ))}

          <DeepDiveToggle expanded={expanded.has('photos')} label="Optional photos" onToggle={() => toggleExpand('photos')} />

          {expanded.has('photos') && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Optional</div>
              {photos.filter(p => !p.required).map(photo => (
                <PhotoCheck key={photo.id} photo={photo} onToggle={() => togglePhoto(photo.id)} />
              ))}
            </div>
          )}
        </Section>

        {/* ──────────────────────────────────────────────────────────
            SUBMIT
        ────────────────────────────────────────────────────────── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Submit Field Report</h3>

          {[
            { label: 'Sections complete',      value: `${completedCount}/7`,                  ok: completedCount >= 3 },
            { label: 'Required photos checked', value: `${checkedPhotos}/${reqPhotos}`,        ok: checkedPhotos >= 3 },
            { label: 'Appliances logged',       value: `${appliances.length} appliance${appliances.length !== 1 ? 's' : ''}`, ok: appliances.length > 0 },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.ok ? 'var(--green)' : 'var(--amber)' }}>{row.value}</span>
            </div>
          ))}

          <div style={{ padding: '9px 0', fontSize: 12, color: 'var(--text-subtle)', borderBottom: '1px solid var(--border)' }}>
            Submitting as <strong style={{ color: 'var(--text-muted)' }}>{userName}</strong>
          </div>

          {!canSubmit && (
            <div style={{ marginTop: 14, background: 'rgba(239,159,39,0.07)', border: '1px solid rgba(239,159,39,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 12, color: 'var(--amber)', lineHeight: 1.5 }}>
                Complete at least 3 sections and check 3 required photos before submitting. Your progress is auto-saved.
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (!canSubmit) return
              saveDraft(propertyId, userId, userName, { data, bedrooms, appliances, photos })
              alert(`Field report submitted for ${property.name}.\n\nThe operator will be notified.`)
              router.back()
            }}
            disabled={!canSubmit}
            style={{
              width: '100%', marginTop: 16, padding: 14, borderRadius: 10, border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              background: canSubmit ? accent : 'var(--bg-elevated)',
              color: canSubmit ? '#fff' : 'var(--text-subtle)',
              fontSize: 15, fontWeight: 700,
            }}
          >
            Submit Field Report
          </button>
          <p style={{ fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
            You can return to add more details after submitting. Multiple staff members can contribute to the same property.
          </p>
        </div>

      </div>
    </div>
  )
}

// ── Photo check item ───────────────────────────────────────────────────────

function PhotoCheck({ photo, onToggle }: { photo: PhotoItem; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', textAlign: 'left',
        background: photo.checked ? 'rgba(29,158,117,0.07)' : 'transparent',
        border: `1px solid ${photo.checked ? 'var(--green-border)' : 'var(--border)'}`,
        borderRadius: 8, padding: '10px 12px', cursor: 'pointer', marginBottom: 7,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
        border: `2px solid ${photo.checked ? 'var(--green)' : 'var(--border)'}`,
        background: photo.checked ? 'var(--green)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {photo.checked && <Check size={11} color="#fff" strokeWidth={3} />}
      </div>
      <span style={{ fontSize: 13, color: photo.checked ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.45, textDecoration: photo.checked ? 'line-through' : 'none' }}>
        {photo.label}
      </span>
    </button>
  )
}

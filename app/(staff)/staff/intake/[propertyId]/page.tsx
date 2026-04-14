'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRole } from '@/context/RoleContext'
import {
  ArrowLeft, ChevronDown, ChevronUp, Camera, Plus, Trash2, Check, CheckCircle2,
} from 'lucide-react'
import { PROPERTIES } from '@/lib/data/properties'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    label: 'Access', emoji: '\uD83D\uDD11',
    tip: 'This is the most important section. If access fails, nothing else matters. Try every code yourself before submitting.',
    mandatory: ['entryMethod', 'doorCode', 'entryInstructions'],
  },
  utilities: {
    label: 'Utilities', emoji: '\u26A1',
    tip: "This section prevents the most expensive calls. A cleaner who knows where the water shutoff is can stop a flood. Find these things yourself — don't guess.",
    mandatory: ['fuseboxLocation', 'wifiName', 'wifiPassword', 'waterShutoff'],
  },
  rooms: {
    label: 'Rooms & Storage', emoji: '\uD83D\uDECF',
    tip: 'Cleaners need to know bed sizes to bring the right linen. Everyone needs to know where things are stored. Walk every room before filling this in.',
    mandatory: ['totalBedrooms', 'totalBathrooms', 'linenStorage', 'cleaningSupplies'],
  },
  rules: {
    label: 'Rules', emoji: '\uD83D\uDCCB',
    tip: 'Rules protect you legally and prevent guest disputes. Be specific — "no parties" is less useful than "maximum 4 guests, no gatherings after 10pm".',
    mandatory: ['maxGuests', 'pets', 'smoking', 'checkinTime', 'checkoutTime'],
  },
  emergency: {
    label: 'Emergency', emoji: '\uD83D\uDEA8',
    tip: 'This section is rarely needed and critical when it is. Fill it in carefully. One day it will matter.',
    mandatory: ['extinguisherLocation', 'fireExit', 'hospital'],
  },
  appliances: {
    label: 'Appliances', emoji: '\uD83D\uDD27',
    tip: 'Add every major appliance. Serial numbers are usually on a sticker inside the door or on the back. This is how we track warranties and help guests use things correctly.',
    mandatory: [],
  },
  photos: {
    label: 'Photos', emoji: '\uD83D\uDCF8',
    tip: "Photos are how your team gets to know a property they've never visited. Every photo here prevents a question later. Shoot in landscape. Good light. No clutter.",
    mandatory: [],
  },
}

// ── Storage helpers ────────────────────────────────────────────────────────

type Draft = { data: SectionData; bedrooms: BedroomEntry[]; appliances: ApplianceEntry[]; photos: PhotoItem[]; submittedBy: string; lastSaved: string }

function loadDraft(propertyId: string, userId: string): Draft | null {
  try {
    const raw = localStorage.getItem(`afterstay_intake_${propertyId}`)
    if (!raw) return null
    return (JSON.parse(raw) as Record<string, Draft>)[userId] ?? null
  } catch { return null }
}

function saveDraft(propertyId: string, userId: string, userName: string, payload: Omit<Draft, 'submittedBy' | 'lastSaved'>) {
  try {
    const raw = localStorage.getItem(`afterstay_intake_${propertyId}`)
    const all: Record<string, Draft> = raw ? JSON.parse(raw) : {}
    all[userId] = { ...payload, submittedBy: userName, lastSaved: new Date().toISOString() }
    localStorage.setItem(`afterstay_intake_${propertyId}`, JSON.stringify(all))
  } catch { /* silent */ }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

// ── Shared input classes ────────────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none box-border focus:border-[var(--accent-border)] transition-colors'
const textareaCls = `${inputCls} resize-y min-h-[80px] leading-relaxed`
const selectCls = `${inputCls} cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] pr-9`
const selectBgStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
}

// ── Micro components ───────────────────────────────────────────────────────

function Fl({ label, helper, req, children }: { label: string; helper?: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="label-upper mb-1.5 block">
        {label}{req && <span className="text-[var(--status-red-fg)] ml-1">*</span>}
      </label>
      {children}
      {helper && <p className="text-[11px] text-[var(--text-subtle)] mt-1 leading-snug">{helper}</p>}
    </div>
  )
}

function PhotoPrompt({ text }: { text: string }) {
  return (
    <div className="flex gap-2 rounded-lg px-3 py-2 my-3" style={{ background: 'var(--status-amber-bg)', border: '1px solid rgba(239,159,39,0.2)' }}>
      <Camera size={13} className="text-[var(--status-amber-fg)] shrink-0 mt-0.5" />
      <span className="text-xs text-[var(--status-amber-fg)] italic leading-relaxed">{text}</span>
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between mb-4 min-h-[40px]">
      <span className="text-sm text-[var(--text-primary)]">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full border-none cursor-pointer relative transition-colors shrink-0"
        style={{ background: value ? 'var(--accent)' : 'var(--border)' }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-[left]"
          style={{ left: value ? 22 : 2 }}
        />
      </button>
    </div>
  )
}

function DeepDiveToggle({ expanded, label = 'Deep dive', onToggle }: { expanded: boolean; label?: string; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 cursor-pointer text-[var(--text-muted)] text-sm mt-1 hover:bg-[var(--bg-card)] transition-colors"
    >
      {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      <span className="font-medium">{expanded ? `Hide ${label}` : `\u25BC ${label}`}</span>
    </button>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({ id, meta, complete, refCb, children }: {
  id: SectionKey; meta: SectionMeta; complete: 'none' | 'partial' | 'complete'
  refCb: (el: HTMLDivElement | null) => void; children: React.ReactNode
}) {
  return (
    <Card
      id={`sec-${id}`}
      ref={refCb}
      className="p-5 mb-3.5 scroll-mt-[116px]"
    >
      <div className="flex items-start justify-between mb-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[22px]">{meta.emoji}</span>
          <span className="text-base font-semibold text-[var(--text-primary)]">{meta.label}</span>
        </div>
        {complete === 'complete'
          ? <CheckCircle2 size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
          : complete === 'partial'
            ? <div className="w-[18px] h-[18px] rounded-full border-2 border-[var(--status-amber-fg)] shrink-0 mt-0.5" />
            : <div className="w-[18px] h-[18px] rounded-full border-2 border-[var(--border)] shrink-0 mt-0.5" />
        }
      </div>
      <p className="text-xs text-[var(--text-muted)] italic leading-relaxed mb-5 mt-1">
        {meta.tip}
      </p>
      {children}
    </Card>
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

  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem('afterstay_user') || '{}')
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

  function addBedroom() {
    setBedrooms(prev => [...prev, { id: uid(), name: '', bedType: '', bedCount: '1', blackout: '', notes: '' }])
  }
  function updateBedroom(id: string, key: keyof BedroomEntry, val: string) {
    setBedrooms(prev => prev.map(b => b.id === id ? { ...b, [key]: val } : b))
  }
  function removeBedroom(id: string) { setBedrooms(prev => prev.filter(b => b.id !== id)) }

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
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-[var(--text-muted)] text-base mb-4">Property not found.</p>
          <button onClick={() => router.back()} className="text-[var(--accent)] bg-transparent border-none cursor-pointer text-sm">&larr; Go back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20">

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <button onClick={() => router.back()} className="bg-transparent border-none cursor-pointer text-[var(--text-muted)] p-1 flex items-center">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-[var(--text-primary)] truncate">{property.name}</span>
              <span className="label-upper px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] shrink-0">Field Visit</span>
            </div>
            <div className="text-[11px] text-[var(--text-subtle)] mt-0.5">{property.address}, {property.city}</div>
          </div>
          <span
            className="text-[11px] shrink-0 transition-colors duration-300"
            style={{ color: saveStatus === 'saved' ? 'var(--accent)' : saveStatus === 'saving' ? 'var(--text-subtle)' : 'transparent' }}
          >
            {saveStatus === 'saving' ? 'Saving\u2026' : '\u2713 Saved'}
          </span>
        </div>

        {/* Section nav pills */}
        <div className="flex gap-1.5 px-4 pb-2.5 overflow-x-auto pills-row">
          {SECTION_KEYS.map(key => {
            const c = completion(key)
            const active = activeSection === key
            return (
              <button
                key={key}
                onClick={() => scrollTo(key)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-all whitespace-nowrap"
                style={{
                  background: active ? accent : 'transparent',
                  color: active ? '#fff' : c === 'complete' ? 'var(--accent)' : c === 'partial' ? 'var(--status-amber-fg)' : 'var(--text-muted)',
                  borderColor: active ? accent : c === 'complete' ? 'var(--accent-border)' : c === 'partial' ? 'rgba(239,159,39,0.3)' : 'var(--border)',
                }}
              >
                {SECTION_META[key].emoji} {SECTION_META[key].label}
              </button>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5 px-4 pb-2.5">
          <div className="flex-1 h-[3px] bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-400"
              style={{ width: `${(completedCount / 7) * 100}%`, background: accent }}
            />
          </div>
          <span className="text-[10px] text-[var(--text-subtle)] shrink-0 font-semibold">{completedCount}/7</span>
        </div>
      </div>

      <div className="px-3.5 pt-3.5">

        {/* SECTION 1 — ACCESS */}
        <Section id="access" meta={SECTION_META.access} complete={completion('access')} refCb={el => { sectionRefs.current.access = el }}>

          <Fl label="Primary entry method" helper="How does the main front door open?" req>
            <select className={selectCls} style={selectBgStyle} value={data.entryMethod} onChange={e => set('entryMethod', e.target.value)}>
              <option value="">Select\u2026</option>
              {['Key', 'Keypad', 'Smart lock', 'Lockbox', 'Fob'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Fl>

          <Fl label="Main door code or key location" helper="The exact code, or where the key is kept" req>
            <input className={inputCls} type="text" placeholder="e.g. 4821 or under the welcome mat" value={data.doorCode} onChange={e => set('doorCode', e.target.value)} />
          </Fl>

          <Fl label="Entry instructions" helper="Step by step. Assume the person has never been here." req>
            <textarea className={textareaCls} placeholder={`e.g. "Enter through the blue gate, main door top of stairs"`} value={data.entryInstructions} onChange={e => set('entryInstructions', e.target.value)} />
          </Fl>

          <PhotoPrompt text="Front entrance from the street — so staff can recognise it when they arrive" />

          <DeepDiveToggle expanded={expanded.has('access')} onToggle={() => toggleExpand('access')} />

          {expanded.has('access') && (
            <div className="mt-3.5 pt-3.5 border-t border-[var(--border)]">
              <Fl label="Lockbox location" helper="Where exactly? On the door? Gate? Under the mat?">
                <input className={inputCls} type="text" value={data.lockboxLocation} onChange={e => set('lockboxLocation', e.target.value)} />
              </Fl>
              <Fl label="Lockbox code">
                <input className={inputCls} type="text" value={data.lockboxCode} onChange={e => set('lockboxCode', e.target.value)} />
              </Fl>
              <Fl label="Smart lock type">
                <select className={selectCls} style={selectBgStyle} value={data.smartLockType} onChange={e => set('smartLockType', e.target.value)}>
                  <option value="">Select\u2026</option>
                  {['Yale', 'August', 'Nuki', 'Igloohome', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <Fl label="Smart lock reset instructions" helper="What to do if it fails or the battery dies">
                <textarea className={textareaCls} value={data.smartLockReset} onChange={e => set('smartLockReset', e.target.value)} />
              </Fl>
              <Fl label="Building entry code" helper="Gate, lobby, or building door before the property">
                <input className={inputCls} type="text" value={data.buildingCode} onChange={e => set('buildingCode', e.target.value)} />
              </Fl>
              <Fl label="Elevator code" helper="If the elevator requires a code or fob">
                <input className={inputCls} type="text" value={data.elevatorCode} onChange={e => set('elevatorCode', e.target.value)} />
              </Fl>
              <Fl label="Spare key location" helper="Where is the backup key kept?">
                <input className={inputCls} type="text" value={data.spareKey} onChange={e => set('spareKey', e.target.value)} />
              </Fl>
              <Fl label="Guest parking instructions" helper="Where do guests park? Permit needed?">
                <textarea className={textareaCls} value={data.guestParking} onChange={e => set('guestParking', e.target.value)} />
              </Fl>
              <Fl label="Staff parking instructions" helper="Where should cleaners and maintenance park?">
                <textarea className={textareaCls} value={data.staffParking} onChange={e => set('staffParking', e.target.value)} />
              </Fl>
              <Fl label="Parking code or permit">
                <input className={inputCls} type="text" value={data.parkingCode} onChange={e => set('parkingCode', e.target.value)} />
              </Fl>
              <PhotoPrompt text="Lockbox — mounted with property visible in background" />
              <PhotoPrompt text="Building entrance — main gate or lobby door" />
              <PhotoPrompt text="Parking — the spot or area staff use" />
            </div>
          )}
        </Section>

        {/* SECTION 2 — UTILITIES */}
        <Section id="utilities" meta={SECTION_META.utilities} complete={completion('utilities')} refCb={el => { sectionRefs.current.utilities = el }}>

          <Fl label="Fusebox location" helper={`e.g. "Hallway cupboard, second door on the left, top shelf"`} req>
            <input className={inputCls} type="text" value={data.fuseboxLocation} onChange={e => set('fuseboxLocation', e.target.value)} />
          </Fl>
          <Fl label="WiFi network name" req>
            <input className={inputCls} type="text" value={data.wifiName} onChange={e => set('wifiName', e.target.value)} />
          </Fl>
          <Fl label="WiFi password" req>
            <input className={inputCls} type="text" value={data.wifiPassword} onChange={e => set('wifiPassword', e.target.value)} />
          </Fl>
          <Fl label="Water shutoff location" helper="Usually under the sink, utility cupboard, or basement. Turn it to test it." req>
            <input className={inputCls} type="text" value={data.waterShutoff} onChange={e => set('waterShutoff', e.target.value)} />
          </Fl>

          <PhotoPrompt text="Fusebox — open the panel, photograph the inside so staff can see which breaker is which" />
          <PhotoPrompt text="Water shutoff — close-up of the valve and its location" />

          <DeepDiveToggle expanded={expanded.has('utilities')} onToggle={() => toggleExpand('utilities')} />

          {expanded.has('utilities') && (
            <div className="mt-3.5 pt-3.5 border-t border-[var(--border)]">
              <Fl label="Fusebox notes" helper="Any breakers confusingly labelled? Any that should never be switched off?">
                <textarea className={textareaCls} value={data.fuseboxNotes} onChange={e => set('fuseboxNotes', e.target.value)} />
              </Fl>
              <Fl label="Hot water heater location">
                <input className={inputCls} type="text" value={data.hotWaterLocation} onChange={e => set('hotWaterLocation', e.target.value)} />
              </Fl>
              <Fl label="Hot water heater type">
                <select className={selectCls} style={selectBgStyle} value={data.hotWaterType} onChange={e => set('hotWaterType', e.target.value)}>
                  <option value="">Select\u2026</option>
                  {['Electric', 'Gas', 'Combi boiler', 'Heat pump'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <Fl label="Hot water reset instructions" helper="What to do if hot water stops working">
                <textarea className={textareaCls} value={data.hotWaterReset} onChange={e => set('hotWaterReset', e.target.value)} />
              </Fl>
              <Fl label="Electricity meter number" helper="Usually on a sticker on the meter itself">
                <input className={inputCls} type="text" value={data.electricityMeter} onChange={e => set('electricityMeter', e.target.value)} />
              </Fl>
              <Fl label="Gas meter number">
                <input className={inputCls} type="text" value={data.gasMeter} onChange={e => set('gasMeter', e.target.value)} />
              </Fl>
              <Fl label="Gas shutoff location" helper="Critical for emergencies. Usually near the meter or under the hob.">
                <input className={inputCls} type="text" value={data.gasShutoff} onChange={e => set('gasShutoff', e.target.value)} />
              </Fl>
              <Fl label="Thermostat type">
                <select className={selectCls} style={selectBgStyle} value={data.thermostatType} onChange={e => set('thermostatType', e.target.value)}>
                  <option value="">Select\u2026</option>
                  {['Manual', 'Digital', 'Smart'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <Fl label="Thermostat location">
                <input className={inputCls} type="text" value={data.thermostatLocation} onChange={e => set('thermostatLocation', e.target.value)} />
              </Fl>
              <Fl label="Thermostat instructions" helper={`How to set heating and cooling. Include quirks — e.g. "takes 30 min to heat up"`}>
                <textarea className={textareaCls} value={data.thermostatInstructions} onChange={e => set('thermostatInstructions', e.target.value)} />
              </Fl>
              <Toggle label="Underfloor heating" value={data.underfloor} onChange={v => set('underfloor', v)} />
              {data.underfloor && (
                <Fl label="Underfloor heating controls" helper="Where is the panel? How do you set it?">
                  <input className={inputCls} type="text" value={data.underfloorControls} onChange={e => set('underfloorControls', e.target.value)} />
                </Fl>
              )}
              <Fl label="Router location">
                <input className={inputCls} type="text" value={data.routerLocation} onChange={e => set('routerLocation', e.target.value)} />
              </Fl>
              <Fl label="Router reset instructions" helper="What to do if WiFi stops working">
                <textarea className={textareaCls} value={data.routerReset} onChange={e => set('routerReset', e.target.value)} />
              </Fl>
              <PhotoPrompt text="Hot water heater — full unit showing brand and controls" />
              <PhotoPrompt text="Thermostat — display and controls visible" />
              <PhotoPrompt text="Router — unit and WiFi sticker if present" />
            </div>
          )}
        </Section>

        {/* SECTION 3 — ROOMS & STORAGE */}
        <Section id="rooms" meta={SECTION_META.rooms} complete={completion('rooms')} refCb={el => { sectionRefs.current.rooms = el }}>

          <div className="grid grid-cols-2 gap-3">
            <Fl label="Total bedrooms" req>
              <input className={inputCls} type="number" min="0" value={data.totalBedrooms} onChange={e => set('totalBedrooms', e.target.value)} />
            </Fl>
            <Fl label="Total bathrooms" req>
              <input className={inputCls} type="number" min="0" value={data.totalBathrooms} onChange={e => set('totalBathrooms', e.target.value)} />
            </Fl>
          </div>
          <Fl label="Linen storage location" helper="Where are clean sheets and towels kept?" req>
            <input className={inputCls} type="text" value={data.linenStorage} onChange={e => set('linenStorage', e.target.value)} />
          </Fl>
          <Fl label="Cleaning supplies location" helper="Where are the mop, vacuum, cleaning products?" req>
            <input className={inputCls} type="text" value={data.cleaningSupplies} onChange={e => set('cleaningSupplies', e.target.value)} />
          </Fl>

          {/* Per-bedroom repeater */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="label-upper">Bedrooms ({bedrooms.length})</span>
              <Button onClick={addBedroom} variant="outline" size="sm" className="rounded-full gap-1">
                <Plus size={11} /> Add Bedroom
              </Button>
            </div>

            {bedrooms.length === 0 && (
              <div className="border border-dashed border-[var(--border)] rounded-lg py-5 text-center">
                <p className="text-sm text-[var(--text-subtle)]">Tap + Add Bedroom for each bedroom in the property</p>
              </div>
            )}

            {bedrooms.map((br, i) => (
              <Card key={br.id} className="p-3.5 mb-2.5" style={{ background: 'var(--bg-elevated)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Bedroom {i + 1}{br.name ? ` — ${br.name}` : ''}
                  </span>
                  <button onClick={() => removeBedroom(br.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-subtle)] p-0.5">
                    <Trash2 size={14} />
                  </button>
                </div>
                <Fl label="Bedroom name" helper={`e.g. "Master", "Twin room", "Bunk room"`}>
                  <input className={inputCls} type="text" value={br.name} onChange={e => updateBedroom(br.id, 'name', e.target.value)} />
                </Fl>
                <div className="grid grid-cols-2 gap-3">
                  <Fl label="Bed type">
                    <select className={selectCls} style={selectBgStyle} value={br.bedType} onChange={e => updateBedroom(br.id, 'bedType', e.target.value)}>
                      <option value="">Select\u2026</option>
                      {['Single', 'Double', 'Queen', 'King', 'Bunk', 'Sofa bed'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </Fl>
                  <Fl label="Bed count">
                    <input className={inputCls} type="number" min="1" value={br.bedCount} onChange={e => updateBedroom(br.id, 'bedCount', e.target.value)} />
                  </Fl>
                </div>
                <Fl label="Blackout curtains">
                  <select className={selectCls} style={selectBgStyle} value={br.blackout} onChange={e => updateBedroom(br.id, 'blackout', e.target.value)}>
                    <option value="">Select\u2026</option>
                    {['Yes', 'No', 'Partial'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Fl>
                <Fl label="Notes for cleaner" helper="Mattress topper? Tricky fitted sheet? Pillow protectors required?">
                  <textarea className={`${textareaCls} !min-h-[60px]`} value={br.notes} onChange={e => updateBedroom(br.id, 'notes', e.target.value)} />
                </Fl>
              </Card>
            ))}

            <PhotoPrompt text="Each bedroom — photo of the made bed so staff know the correct layout" />
          </div>

          <DeepDiveToggle expanded={expanded.has('rooms')} onToggle={() => toggleExpand('rooms')} />

          {expanded.has('rooms') && (
            <div className="mt-3.5 pt-3.5 border-t border-[var(--border)]">
              <Fl label="Spare bedding location" helper="Extra pillows, spare duvets, mattress protectors">
                <input className={inputCls} type="text" value={data.spareBedding} onChange={e => set('spareBedding', e.target.value)} />
              </Fl>
              <Fl label="Vacuum cleaner type + location">
                <input className={inputCls} type="text" value={data.vacuumLocation} onChange={e => set('vacuumLocation', e.target.value)} />
              </Fl>
              <Fl label="Ironing board and iron location">
                <input className={inputCls} type="text" value={data.ironLocation} onChange={e => set('ironLocation', e.target.value)} />
              </Fl>
              <Fl label="First aid kit location">
                <input className={inputCls} type="text" value={data.firstAidLocation} onChange={e => set('firstAidLocation', e.target.value)} />
              </Fl>
              <Fl label="Spare lightbulb location">
                <input className={inputCls} type="text" value={data.bulbLocation} onChange={e => set('bulbLocation', e.target.value)} />
              </Fl>
              <Fl label="Rubbish bag storage">
                <input className={inputCls} type="text" value={data.rubbishBags} onChange={e => set('rubbishBags', e.target.value)} />
              </Fl>
              <Fl label="Recycling instructions" helper="What goes where. Which bin is which colour.">
                <textarea className={textareaCls} value={data.recycling} onChange={e => set('recycling', e.target.value)} />
              </Fl>
              <Fl label="Bin collection day">
                <input className={inputCls} type="text" value={data.binDay} onChange={e => set('binDay', e.target.value)} />
              </Fl>
              <Fl label="Bin location" helper="Where do bins go on collection day? Where are they stored?">
                <input className={inputCls} type="text" value={data.binLocation} onChange={e => set('binLocation', e.target.value)} />
              </Fl>
              <Toggle label="Pool / hot tub on property" value={data.pool} onChange={v => set('pool', v)} />
              {data.pool && (
                <Fl label="Pool / hot tub maintenance instructions">
                  <textarea className={textareaCls} value={data.poolInstructions} onChange={e => set('poolInstructions', e.target.value)} />
                </Fl>
              )}
              <PhotoPrompt text="Linen cupboard — open doors, show shelves and what's on each" />
              <PhotoPrompt text="Cleaning supplies — all products visible" />
              <PhotoPrompt text="Bins — all bins labelled, show where they live" />
            </div>
          )}
        </Section>

        {/* SECTION 4 — RULES */}
        <Section id="rules" meta={SECTION_META.rules} complete={completion('rules')} refCb={el => { sectionRefs.current.rules = el }}>

          <Fl label="Maximum guest capacity" req>
            <input className={inputCls} type="number" min="1" value={data.maxGuests} onChange={e => set('maxGuests', e.target.value)} />
          </Fl>
          <Fl label="Pets allowed" req>
            <select className={selectCls} style={selectBgStyle} value={data.pets} onChange={e => set('pets', e.target.value)}>
              <option value="">Select\u2026</option>
              {['Yes', 'No', 'On request'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Fl>
          <Fl label="Smoking" req>
            <select className={selectCls} style={selectBgStyle} value={data.smoking} onChange={e => set('smoking', e.target.value)}>
              <option value="">Select\u2026</option>
              {['No smoking anywhere', 'Outside only', 'Designated area'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Fl>
          <div className="grid grid-cols-2 gap-3">
            <Fl label="Check-in time" req>
              <input className={inputCls} type="time" value={data.checkinTime} onChange={e => set('checkinTime', e.target.value)} />
            </Fl>
            <Fl label="Check-out time" req>
              <input className={inputCls} type="time" value={data.checkoutTime} onChange={e => set('checkoutTime', e.target.value)} />
            </Fl>
          </div>

          <DeepDiveToggle expanded={expanded.has('rules')} onToggle={() => toggleExpand('rules')} />

          {expanded.has('rules') && (
            <div className="mt-3.5 pt-3.5 border-t border-[var(--border)]">
              <Fl label="Quiet hours" helper="When do quiet hours start and end?">
                <input className={inputCls} type="text" placeholder="e.g. 10pm – 8am" value={data.quietHours} onChange={e => set('quietHours', e.target.value)} />
              </Fl>
              <Fl label="Party / event policy" helper="Gatherings permitted? Any restrictions?">
                <textarea className={textareaCls} value={data.partyPolicy} onChange={e => set('partyPolicy', e.target.value)} />
              </Fl>
              <Fl label="Pet rules detail" helper="Which rooms? Breed or size restrictions? Deposit required?">
                <textarea className={textareaCls} value={data.petRules} onChange={e => set('petRules', e.target.value)} />
              </Fl>
              <Fl label="Shoe policy">
                <select className={selectCls} style={selectBgStyle} value={data.shoePolicy} onChange={e => set('shoePolicy', e.target.value)}>
                  <option value="">Select\u2026</option>
                  {['Shoes off inside', 'No restriction'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <Fl label="Pool rules" helper="Hours, supervision, no diving, etc.">
                <textarea className={textareaCls} value={data.poolRules} onChange={e => set('poolRules', e.target.value)} />
              </Fl>
              <Fl label="Rubbish and recycling rules" helper="Specific sorting requirements for this area">
                <textarea className={textareaCls} value={data.recyclingRules} onChange={e => set('recyclingRules', e.target.value)} />
              </Fl>
              <Fl label="Additional rules" helper="Anything else guests must know before arrival">
                <textarea className={textareaCls} value={data.additionalRules} onChange={e => set('additionalRules', e.target.value)} />
              </Fl>
            </div>
          )}
        </Section>

        {/* SECTION 5 — EMERGENCY */}
        <Section id="emergency" meta={SECTION_META.emergency} complete={completion('emergency')} refCb={el => { sectionRefs.current.emergency = el }}>

          <Fl label="Fire extinguisher location" helper="Look for a red cylinder — usually in the kitchen, hallway, or near the entrance" req>
            <input className={inputCls} type="text" value={data.extinguisherLocation} onChange={e => set('extinguisherLocation', e.target.value)} />
          </Fl>
          <Fl label="Fire exit route" helper="How do guests get out in an emergency? Every floor if multi-storey." req>
            <textarea className={textareaCls} value={data.fireExit} onChange={e => set('fireExit', e.target.value)} />
          </Fl>
          <Fl label="Nearest hospital / A&E" helper="Name and address. Google Maps it to confirm." req>
            <input className={inputCls} type="text" value={data.hospital} onChange={e => set('hospital', e.target.value)} />
          </Fl>

          <PhotoPrompt text="Fire extinguisher — mounted in its location" />

          <DeepDiveToggle expanded={expanded.has('emergency')} onToggle={() => toggleExpand('emergency')} />

          {expanded.has('emergency') && (
            <div className="mt-3.5 pt-3.5 border-t border-[var(--border)]">
              <Fl label="Smoke alarm locations" helper="List every smoke alarm in the property">
                <input className={inputCls} type="text" value={data.smokeAlarmLocations} onChange={e => set('smokeAlarmLocations', e.target.value)} />
              </Fl>
              <Fl label="Smoke alarm reset instructions" helper="How to silence a false alarm">
                <textarea className={textareaCls} value={data.smokeAlarmReset} onChange={e => set('smokeAlarmReset', e.target.value)} />
              </Fl>
              <Toggle label="Carbon monoxide detector present" value={data.coDetector} onChange={v => set('coDetector', v)} />
              {data.coDetector && (
                <Fl label="CO detector locations">
                  <input className={inputCls} type="text" value={data.coLocations} onChange={e => set('coLocations', e.target.value)} />
                </Fl>
              )}
              <Fl label="Emergency gas shutoff" helper="Where is the gas shutoff valve in an emergency?">
                <input className={inputCls} type="text" value={data.emergencyGasShutoff} onChange={e => set('emergencyGasShutoff', e.target.value)} />
              </Fl>
              <Fl label="Building manager contact" helper="Name, phone, when to call them">
                <input className={inputCls} type="text" value={data.buildingManager} onChange={e => set('buildingManager', e.target.value)} />
              </Fl>
              <Fl label="Nearest pharmacy">
                <input className={inputCls} type="text" value={data.pharmacy} onChange={e => set('pharmacy', e.target.value)} />
              </Fl>
              <Fl label="On-site emergency contact" helper="Neighbour, caretaker, or anyone who can help in person">
                <input className={inputCls} type="text" value={data.onSiteContact} onChange={e => set('onSiteContact', e.target.value)} />
              </Fl>
              <Fl label="Known hazards" helper="Steep stairs, low ceiling, uneven path — anything guests should know">
                <textarea className={textareaCls} value={data.knownHazards} onChange={e => set('knownHazards', e.target.value)} />
              </Fl>
            </div>
          )}
        </Section>

        {/* SECTION 6 — APPLIANCES */}
        <Section id="appliances" meta={SECTION_META.appliances} complete={completion('appliances')} refCb={el => { sectionRefs.current.appliances = el }}>

          <div className="flex items-center justify-between mb-3.5">
            <span className="text-sm text-[var(--text-muted)]">
              {appliances.length === 0 ? 'No appliances added yet' : `${appliances.length} appliance${appliances.length !== 1 ? 's' : ''} added`}
            </span>
            <Button onClick={addAppliance} className="rounded-full gap-1" size="sm">
              <Plus size={12} /> Add Appliance
            </Button>
          </div>

          {appliances.length === 0 && (
            <div className="border border-dashed border-[var(--border)] rounded-lg py-6 text-center">
              <p className="text-sm text-[var(--text-subtle)]">Tap + Add Appliance for each major appliance in the property</p>
            </div>
          )}

          {appliances.map((ap, i) => (
            <Card key={ap.id} className="p-3.5 mb-3" style={{ background: 'var(--bg-elevated)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Appliance {i + 1}{ap.type ? ` — ${ap.type}` : ''}
                </span>
                <button onClick={() => removeAppliance(ap.id)} className="bg-transparent border-none cursor-pointer text-[var(--text-subtle)] p-0.5">
                  <Trash2 size={14} />
                </button>
              </div>
              <Fl label="Appliance type">
                <select className={selectCls} style={selectBgStyle} value={ap.type} onChange={e => updateAppliance(ap.id, 'type', e.target.value)}>
                  <option value="">Select\u2026</option>
                  {['Washing machine', 'Dryer', 'Dishwasher', 'Oven', 'Hob', 'Microwave', 'Fridge', 'Freezer', 'TV', 'Air conditioning', 'Coffee machine', 'Other'].map(o => <option key={o}>{o}</option>)}
                </select>
              </Fl>
              <div className="grid grid-cols-2 gap-3">
                <Fl label="Brand" helper="e.g. Bosch, Samsung">
                  <input className={inputCls} type="text" value={ap.brand} onChange={e => updateAppliance(ap.id, 'brand', e.target.value)} />
                </Fl>
                <Fl label="Model number" helper="Inside door or back">
                  <input className={inputCls} type="text" value={ap.model} onChange={e => updateAppliance(ap.id, 'model', e.target.value)} />
                </Fl>
              </div>
              <Fl label="Serial number" helper="Same sticker as model number">
                <input className={inputCls} type="text" value={ap.serial} onChange={e => updateAppliance(ap.id, 'serial', e.target.value)} />
              </Fl>
              <div className="grid grid-cols-2 gap-3">
                <Fl label="Condition">
                  <select className={selectCls} style={selectBgStyle} value={ap.condition} onChange={e => updateAppliance(ap.id, 'condition', e.target.value)}>
                    <option value="">Select\u2026</option>
                    {['Excellent', 'Good', 'Fair', 'Poor'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Fl>
                <Fl label="Warranty">
                  <select className={selectCls} style={selectBgStyle} value={ap.warranty} onChange={e => updateAppliance(ap.id, 'warranty', e.target.value)}>
                    <option value="">Select\u2026</option>
                    {['Under warranty', 'Expired', 'Unknown'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </Fl>
              </div>
              <Fl label="How to use it" helper={`Quirks? e.g. "Press eco twice for normal wash", "Oven runs 10° hot"`}>
                <textarea className={`${textareaCls} !min-h-[64px]`} value={ap.usage} onChange={e => updateAppliance(ap.id, 'usage', e.target.value)} />
              </Fl>
              <Fl label="Location in property" helper="Which room?">
                <input className={inputCls} type="text" value={ap.location} onChange={e => updateAppliance(ap.id, 'location', e.target.value)} />
              </Fl>
              <PhotoPrompt text="Two photos per appliance: (1) full unit, (2) close-up of the serial number sticker" />
            </Card>
          ))}
        </Section>

        {/* SECTION 7 — PHOTOS */}
        <Section id="photos" meta={SECTION_META.photos} complete={completion('photos')} refCb={el => { sectionRefs.current.photos = el }}>

          <p className="text-xs text-[var(--text-muted)] mb-3.5 leading-relaxed">
            Check each photo as you capture it. At least 3 required photos must be checked before submitting.
          </p>

          <div className="label-upper mb-1.5">
            Required ({checkedPhotos}/{reqPhotos} checked)
          </div>
          {photos.filter(p => p.required).map(photo => (
            <PhotoCheck key={photo.id} photo={photo} onToggle={() => togglePhoto(photo.id)} />
          ))}

          <DeepDiveToggle expanded={expanded.has('photos')} label="Optional photos" onToggle={() => toggleExpand('photos')} />

          {expanded.has('photos') && (
            <div className="mt-3.5 pt-3.5 border-t border-[var(--border)]">
              <div className="label-upper mb-2 text-[var(--text-subtle)]">Optional</div>
              {photos.filter(p => !p.required).map(photo => (
                <PhotoCheck key={photo.id} photo={photo} onToggle={() => togglePhoto(photo.id)} />
              ))}
            </div>
          )}
        </Section>

        {/* SUBMIT */}
        <Card className="p-5 mb-4">
          <h3 className="heading text-[15px] font-semibold text-[var(--text-primary)] mb-4">Submit Field Report</h3>

          {[
            { label: 'Sections complete',      value: `${completedCount}/7`,                  ok: completedCount >= 3 },
            { label: 'Required photos checked', value: `${checkedPhotos}/${reqPhotos}`,        ok: checkedPhotos >= 3 },
            { label: 'Appliances logged',       value: `${appliances.length} appliance${appliances.length !== 1 ? 's' : ''}`, ok: appliances.length > 0 },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--text-muted)]">{row.label}</span>
              <span className={`text-sm font-semibold ${row.ok ? 'text-[var(--accent)]' : 'text-[var(--status-amber-fg)]'}`}>{row.value}</span>
            </div>
          ))}

          <div className="py-2 text-xs text-[var(--text-subtle)] border-b border-[var(--border)]">
            Submitting as <strong className="text-[var(--text-muted)]">{userName}</strong>
          </div>

          {!canSubmit && (
            <div className="mt-3.5 rounded-lg px-3 py-2.5" style={{ background: 'rgba(239,159,39,0.07)', border: '1px solid rgba(239,159,39,0.2)' }}>
              <p className="text-xs text-[var(--status-amber-fg)] leading-relaxed">
                Complete at least 3 sections and check 3 required photos before submitting. Your progress is auto-saved.
              </p>
            </div>
          )}

          <Button
            onClick={() => {
              if (!canSubmit) return
              saveDraft(propertyId, userId, userName, { data, bedrooms, appliances, photos })
              alert(`Field report submitted for ${property.name}.\n\nThe operator will be notified.`)
              router.back()
            }}
            disabled={!canSubmit}
            className="w-full mt-4 rounded-full text-[15px] font-semibold py-3.5"
            style={!canSubmit ? { background: 'var(--bg-elevated)', color: 'var(--text-subtle)' } : undefined}
          >
            Submit Field Report
          </Button>
          <p className="text-[11px] text-[var(--text-subtle)] text-center mt-2.5 leading-relaxed">
            You can return to add more details after submitting. Multiple staff members can contribute to the same property.
          </p>
        </Card>

      </div>
    </div>
  )
}

// ── Photo check item ───────────────────────────────────────────────────────

function PhotoCheck({ photo, onToggle }: { photo: PhotoItem; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-start gap-2.5 w-full text-left rounded-lg px-3 py-2.5 cursor-pointer mb-1.5 transition-colors"
      style={{
        background: photo.checked ? 'rgba(29,158,117,0.07)' : 'transparent',
        border: `1px solid ${photo.checked ? 'var(--accent-border)' : 'var(--border)'}`,
      }}
    >
      <div
        className="w-[18px] h-[18px] rounded shrink-0 mt-0.5 flex items-center justify-center"
        style={{
          border: `2px solid ${photo.checked ? 'var(--accent)' : 'var(--border)'}`,
          background: photo.checked ? 'var(--accent)' : 'transparent',
        }}
      >
        {photo.checked && <Check size={11} color="#fff" strokeWidth={3} />}
      </div>
      <span className={`text-sm leading-snug ${photo.checked ? 'text-[var(--text-primary)] line-through' : 'text-[var(--text-muted)]'}`}>
        {photo.label}
      </span>
    </button>
  )
}

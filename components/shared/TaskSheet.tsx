'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet'
import {
  X, Check, KeyRound, Car, DoorOpen, Info, Lock, Eye, EyeOff,
  Camera, Plus, Minus, Upload, ChevronDown, ChevronRight,
  Unlock, XCircle, User, Calendar, Clock, AlertTriangle,
  Truck, Package, CheckCircle,
} from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import { PROPERTY_LIBRARIES } from '@/lib/data/propertyLibrary'
import { PROPERTIES } from '@/lib/data/properties'
import { STOCK_ITEMS } from '@/lib/data/inventory'
import { isAccessCodeVisible, getPTEDisplay } from '@/lib/utils/pteUtils'
import type { Job, JobPTEStatus, JobReservation, JobPTE, ActivityEntry } from '@/lib/data/staff'
import type { ChecklistItem, WorkItem, TaskPhoto, DeployRequest } from '@/lib/data/checklists'

// TaskItem extends Job fields for backwards-compat with kanban usage
export interface TaskItem {
  id: string
  title: string
  type: string
  priority: 'high' | 'medium' | 'low' | 'urgent'
  assignee: string
  due: string
  columnId?: string
  propertyName?: string
  propertyId?: string
  description?: string
  // Extended PTE + reservation + checklist fields
  pteRequired?: boolean
  pteStatus?: JobPTEStatus
  pte?: JobPTE
  reservation?: JobReservation
  checklist?: ChecklistItem[]
  deployRequests?: DeployRequest[]
  workItems?: WorkItem[]
  beforePhotos?: TaskPhoto[]
  afterPhotos?: TaskPhoto[]
  activity?: ActivityEntry[]
}

interface TaskSheetProps {
  task: TaskItem | null
  open: boolean
  onClose: () => void
  onMarkComplete?: (id: string) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 6,
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

const sectionLabel = (text: string, color?: string): React.CSSProperties => ({
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: color ?? 'var(--text-subtle)',
  marginBottom: 10,
})

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ── Section A: Reservation Context ───────────────────────────────────────────
function ReservationSection({ reservation }: { reservation: JobReservation }) {
  const nightsLeft = reservation.nightsRemaining ?? 0
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
      <div style={sectionLabel('Connected Reservation')}>Connected Reservation</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{reservation.guestName}</span>
          {reservation.platform && (
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{reservation.platform}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(reservation.checkIn)} → {formatDate(reservation.checkOut)} ({reservation.nights} nights)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {nightsLeft} night{nightsLeft !== 1 ? 's' : ''} remaining · {reservation.status === 'checked_in' ? 'Checked in' : reservation.status}
          </span>
        </div>
      </div>
      <button style={{ marginTop: 10, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>
        Contact Guest
      </button>
    </div>
  )
}

// ── Section B: PTE Panel ──────────────────────────────────────────────────────
function PTESection({
  pte, pteStatus, role, subRole, accent,
  onGrant, onDeny,
}: {
  pte?: JobPTE
  pteStatus?: JobPTEStatus
  role: string
  subRole?: string
  accent: string
  onGrant: (date: string, from: string, to: string) => void
  onDeny: (reason: string) => void
}) {
  const [showCode, setShowCode] = useState(false)
  const [grantDate, setGrantDate] = useState('')
  const [grantFrom, setGrantFrom] = useState('')
  const [grantTo, setGrantTo] = useState('')
  const [denyNote, setDenyNote] = useState('')
  const [showGrantForm, setShowGrantForm] = useState(false)
  const [showDenyForm, setShowDenyForm] = useState(false)
  const [showOverride, setShowOverride] = useState(false)

  const status = pteStatus ?? 'not_required'
  const display = getPTEDisplay(status)
  const codeVisible = isAccessCodeVisible(status) && showCode
  const isGS = subRole?.toLowerCase().includes('guest') ?? false
  const isOperator = role === 'operator'
  const canControl = isGS || isOperator
  const isPending = status === 'pending'
  const isGranted = status === 'granted' || status === 'auto_granted'
  const isDenied = status === 'denied'

  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${display.color}30`, borderRadius: 8, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={sectionLabel('Permission to Enter')}>Permission to Enter</div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: display.bg, color: display.color }}>
          {display.icon} {display.label}
        </span>
      </div>

      {status === 'auto_granted' && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Property is vacant — no active guest</div>
      )}

      {isPending && pte?.guestName && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Guest: <strong style={{ color: 'var(--text-primary)' }}>{pte.guestName}</strong></div>
          {pte.guestCheckout && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Checkout: {formatDate(pte.guestCheckout)}</div>}
          {pte.notes && <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>{pte.notes}</div>}
        </div>
      )}

      {isGranted && pte?.grantedBy && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Granted by: <strong style={{ color: 'var(--text-primary)' }}>{pte.grantedBy === 'system' ? 'System (auto)' : pte.grantedBy}</strong></div>
          {pte.validFrom && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Window: {formatDate(pte.validFrom)} · {formatTime(pte.validFrom)} — {formatTime(pte.validUntil)}</div>}
          {pte.notes && <div style={{ fontSize: 11, color: 'var(--text-subtle)', fontStyle: 'italic' }}>"{pte.notes}"</div>}
        </div>
      )}

      {isDenied && (
        <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>
          {pte?.deniedReason ?? 'Access denied'}
        </div>
      )}

      {/* Access code */}
      {(isGranted) && pte?.accessCode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: 10 }}>
          <KeyRound size={13} style={{ color: accent }} />
          <span style={{ fontSize: 12, color: 'var(--text-subtle)', flex: 1 }}>Access code</span>
          {codeVisible ? (
            <>
              <span style={{ fontSize: 16, fontWeight: 700, color: accent, fontFamily: 'monospace', letterSpacing: '0.12em' }}>{pte.accessCode}</span>
              <button onClick={() => setShowCode(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 0 }}><EyeOff size={14} /></button>
            </>
          ) : (
            <button onClick={() => setShowCode(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, border: `1px solid ${accent}40`, background: `${accent}10`, color: accent, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              <Eye size={11} /> Show Code
            </button>
          )}
        </div>
      )}

      {isPending && !isGranted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: 10 }}>
          <Lock size={13} style={{ color: 'var(--text-subtle)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Access code locked until PTE granted</span>
        </div>
      )}

      {/* GS / Operator Grant+Deny controls */}
      {canControl && isPending && !showGrantForm && !showDenyForm && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => setShowGrantForm(true)}
            style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <Unlock size={12} /> Grant PTE
          </button>
          <button
            onClick={() => setShowDenyForm(true)}
            style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid #dc262640', background: '#dc262610', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          >
            <XCircle size={12} /> Deny
          </button>
        </div>
      )}

      {/* Grant form */}
      <AnimatePresence>
        {showGrantForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, padding: '6px 10px', borderRadius: 6, background: '#16a34a10', color: '#16a34a' }}>Code auto-locks when window ends.</div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Access Date</label><input type="date" value={grantDate} onChange={e => setGrantDate(e.target.value)} style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>From</label><input type="time" value={grantFrom} onChange={e => setGrantFrom(e.target.value)} style={inputStyle} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>To</label><input type="time" value={grantTo} onChange={e => setGrantTo(e.target.value)} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowGrantForm(false)} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { onGrant(grantDate, grantFrom, grantTo); setShowGrantForm(false) }} disabled={!grantDate || !grantFrom || !grantTo} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: (grantDate && grantFrom && grantTo) ? '#16a34a' : 'var(--bg-elevated)', color: (grantDate && grantFrom && grantTo) ? '#fff' : 'var(--text-subtle)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Confirm Grant</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deny form */}
      <AnimatePresence>
        {showDenyForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Reason (optional, shown to staff)</label><textarea value={denyNote} onChange={e => setDenyNote(e.target.value)} rows={2} placeholder="e.g. Guest declined access on this date" style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowDenyForm(false)} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => { onDeny(denyNote); setShowDenyForm(false) }} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Deny Request</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Field staff waiting message */}
      {!canControl && isPending && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
          <AlertTriangle size={11} /> Waiting for Guest Services to confirm access
        </div>
      )}

      {/* Operator override */}
      {isOperator && !isPending && (
        <button onClick={() => setShowOverride(!showOverride)} style={{ marginTop: 8, background: 'none', border: 'none', fontSize: 11, color: 'var(--text-subtle)', cursor: 'pointer', padding: 0 }}>
          Override as operator {showOverride ? '▴' : '▾'}
        </button>
      )}
      {isOperator && showOverride && (
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button onClick={() => setShowGrantForm(true)} style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: `1px solid #16a34a40`, background: '#16a34a10', color: '#16a34a', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Force Grant</button>
          <button onClick={() => setShowDenyForm(true)} style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: '1px solid #dc262640', background: '#dc262610', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Force Deny</button>
        </div>
      )}
    </div>
  )
}

// ── Layout: Maintenance / Delivery / Inspection ───────────────────────────────
function MaintenanceLayout({
  task, accent,
}: {
  task: TaskItem
  accent: string
}) {
  const [workItems, setWorkItems] = useState<WorkItem[]>(
    () => (task.workItems ?? []).map(i => ({ ...i }))
  )
  const [beforePhotos, setBeforePhotos] = useState<TaskPhoto[]>(task.beforePhotos ?? [])
  const [afterPhotos, setAfterPhotos] = useState<TaskPhoto[]>(task.afterPhotos ?? [])
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)

  const doneCount = workItems.filter(i => i.completed).length
  const allDone = doneCount === workItems.length && workItems.length > 0
  const canSubmit = beforePhotos.length > 0 && allDone && afterPhotos.length > 0

  const toggleItem = (id: string) => {
    setWorkItems(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date().toISOString() : undefined } : i))
  }

  const addPhoto = (file: File, type: 'before' | 'after') => {
    const url = URL.createObjectURL(file)
    const photo: TaskPhoto = { id: `ph-${Date.now()}`, url, uploadedBy: 'You', uploadedAt: new Date().toISOString() }
    if (type === 'before') setBeforePhotos(prev => [...prev, photo])
    else setAfterPhotos(prev => [...prev, photo])
  }

  const PhotoZone = ({ photos, type, inputRef, disabled }: { photos: TaskPhoto[]; type: 'before' | 'after'; inputRef: React.RefObject<HTMLInputElement | null>; disabled?: boolean }) => (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { Array.from(e.target.files ?? []).forEach(f => addPhoto(f, type)) }} />
      {photos.length > 0 ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {photos.map(p => (
            <img key={p.id} src={p.url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
          ))}
        </div>
      ) : null}
      <button
        onClick={() => !disabled && inputRef.current?.click()}
        disabled={disabled}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: '14px 0', borderRadius: 8,
          border: `2px dashed ${disabled ? 'var(--border)' : accent + '50'}`,
          background: disabled ? 'var(--bg-elevated)' : `${accent}06`,
          color: disabled ? 'var(--text-subtle)' : 'var(--text-muted)',
          fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <Camera size={14} style={{ opacity: disabled ? 0.4 : 1 }} />
        {disabled ? 'Complete work first' : photos.length > 0 ? 'Add more photos' : 'Upload photos'}
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Before Photos */}
      <div>
        <div style={sectionLabel('Before Photos', 'var(--text-muted)')}>Before Photos <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(required)</span></div>
        <PhotoZone photos={beforePhotos} type="before" inputRef={beforeInputRef} />
        {beforePhotos.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={10} /> Upload at least 1 before photo to begin
          </div>
        )}
      </div>

      {/* Work Items */}
      {workItems.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={sectionLabel('Work Items', '#16a34a')}>Work Items</div>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{doneCount}/{workItems.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {workItems.map(item => (
              <div
                key={item.id}
                onClick={() => beforePhotos.length > 0 && toggleItem(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', cursor: beforePhotos.length > 0 ? 'pointer' : 'not-allowed', opacity: beforePhotos.length === 0 ? 0.5 : 1 }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${item.completed ? '#16a34a' : 'var(--border)'}`, background: item.completed ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.completed && <Check size={10} color="#fff" />}
                </div>
                <span style={{ fontSize: 13, flex: 1, color: item.completed ? 'var(--text-subtle)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress */}
          <div style={{ marginTop: 10 }}>
            <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${workItems.length > 0 ? (doneCount / workItems.length) * 100 : 0}%`, background: '#16a34a', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>{doneCount} of {workItems.length} complete</div>
          </div>
        </div>
      )}

      {/* After Photos */}
      <div>
        <div style={sectionLabel('After Photos', '#16a34a')}>After Photos <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10 }}>(required for approval)</span></div>
        <PhotoZone photos={afterPhotos} type="after" inputRef={afterInputRef} disabled={!allDone} />
      </div>

      {/* Submit */}
      <button
        disabled={!canSubmit}
        style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: canSubmit ? '#16a34a' : 'var(--bg-elevated)', color: canSubmit ? '#fff' : 'var(--text-subtle)', fontSize: 14, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
      >
        Submit for Approval
      </button>
    </div>
  )
}

// ── Layout: Cleaning ──────────────────────────────────────────────────────────
function CleaningLayout({ task, accent }: { task: TaskItem; accent: string }) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => (task.checklist ?? []).map(i => ({ ...i })))
  const [deployRequests, setDeployRequests] = useState<DeployRequest[]>(task.deployRequests ?? [])
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [deployPopover, setDeployPopover] = useState<string | null>(null)
  const [deployItem, setDeployItem] = useState('')
  const [deployQty, setDeployQty] = useState(1)
  const [deployNote, setDeployNote] = useState('')
  const [toast, setToast] = useState('')

  const categories = Array.from(new Set(checklist.map(i => i.category)))
  const done = checklist.filter(i => i.completed).length
  const total = checklist.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const toggleItem = (id: string) => {
    setChecklist(prev => {
      const item = prev.find(i => i.id === id)
      if (!item) return prev
      if (!item.completed && item.photoRequired && !item.photoUrl) return prev // need photo first
      return prev.map(i => i.id === id ? { ...i, completed: !i.completed, completedAt: !i.completed ? new Date().toISOString() : undefined } : i)
    })
  }

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat); else next.add(cat)
      return next
    })
  }

  // Auto-collapse completed categories
  useEffect(() => {
    categories.forEach(cat => {
      const items = checklist.filter(i => i.category === cat)
      const allDone = items.length > 0 && items.every(i => i.completed)
      if (allDone) setCollapsed(prev => new Set([...prev, cat]))
    })
  }, [checklist]) // eslint-disable-line react-hooks/exhaustive-deps

  const addPhoto = (itemId: string, file: File) => {
    const url = URL.createObjectURL(file)
    setChecklist(prev => prev.map(i => i.id === itemId ? { ...i, photoUrl: url } : i))
  }

  const submitDeploy = (checklistItemId: string) => {
    if (!deployItem) return
    const req: DeployRequest = {
      id: `dr-${Date.now()}`, checklistItemId, itemName: deployItem, quantity: deployQty,
      reason: deployNote || undefined, status: 'requested', requestedBy: 'You',
      requestedAt: new Date().toISOString(),
    }
    setDeployRequests(prev => [...prev, req])
    setDeployPopover(null)
    setDeployItem(''); setDeployQty(1); setDeployNote('')
    showToast('Deploy request submitted')
  }

  const allInventoryItems = STOCK_ITEMS.map(s => s.name)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Progress bar */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Checklist</span>
          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{done} of {total} · {pct}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#16a34a' : accent, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Category sections */}
      {categories.map(cat => {
        const items = checklist.filter(i => i.category === cat)
        const catDone = items.filter(i => i.completed).length
        const catAllDone = catDone === items.length && items.length > 0
        const isCollapsed = collapsed.has(cat)

        return (
          <div key={cat} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => toggleCategory(cat)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              {isCollapsed ? <ChevronRight size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} /> : <ChevronDown size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />}
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: catAllDone ? '#16a34a' : accent, flex: 1 }}>
                {catAllDone ? '✓ ' : ''}{cat.toUpperCase()} {catDone}/{items.length}
              </span>
            </button>

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {items.map(item => {
                      const fileRef = useRef<HTMLInputElement>(null) // eslint-disable-line react-hooks/rules-of-hooks
                      const deplReqs = deployRequests.filter(d => d.checklistItemId === item.id)
                      return (
                        <div key={item.id} style={{ padding: '8px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              onClick={() => toggleItem(item.id)}
                              style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${item.completed ? '#16a34a' : 'var(--border)'}`, background: item.completed ? '#16a34a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                            >
                              {item.completed && <Check size={10} color="#fff" />}
                            </div>
                            <span style={{ fontSize: 12, flex: 1, color: item.completed ? 'var(--text-subtle)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                              {item.label}
                              {item.photoRequired && !item.photoUrl && (
                                <span style={{ marginLeft: 6, fontSize: 10, color: '#d97706', fontWeight: 600 }}>● photo req.</span>
                              )}
                            </span>
                            {/* Camera icon */}
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) addPhoto(item.id, f) }} />
                            <button
                              onClick={() => fileRef.current?.click()}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: item.photoUrl ? accent : 'var(--text-subtle)' }}
                              title="Upload photo"
                            >
                              {item.photoUrl ? (
                                <img src={item.photoUrl} alt="" style={{ width: 20, height: 20, borderRadius: 3, objectFit: 'cover' }} />
                              ) : (
                                <Camera size={13} />
                              )}
                            </button>
                            {/* Deploy button */}
                            {item.deployable && (
                              <button
                                onClick={() => setDeployPopover(deployPopover === item.id ? null : item.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 5, border: `1px solid ${accent}40`, background: `${accent}10`, color: accent, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                              >
                                <Plus size={9} /> Deploy
                              </button>
                            )}
                          </div>

                          {/* Deploy popover */}
                          <AnimatePresence>
                            {deployPopover === item.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}
                              >
                                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Deploy inventory item</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <select value={deployItem} onChange={e => setDeployItem(e.target.value)} style={{ ...inputStyle, fontSize: 12 }}>
                                    <option value="">Select item…</option>
                                    {allInventoryItems.map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty:</span>
                                    <button onClick={() => setDeployQty(q => Math.max(1, q - 1))} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}><Minus size={10} /></button>
                                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center', color: 'var(--text-primary)' }}>{deployQty}</span>
                                    <button onClick={() => setDeployQty(q => q + 1)} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}><Plus size={10} /></button>
                                  </div>
                                  <input value={deployNote} onChange={e => setDeployNote(e.target.value)} placeholder="Note (optional)" style={{ ...inputStyle, fontSize: 12 }} />
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => setDeployPopover(null)} style={{ flex: 1, padding: '5px 0', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={() => submitDeploy(item.id)} disabled={!deployItem} style={{ flex: 1, padding: '5px 0', borderRadius: 5, border: 'none', background: deployItem ? accent : 'var(--bg-elevated)', color: deployItem ? '#fff' : 'var(--text-subtle)', fontSize: 11, fontWeight: 600, cursor: deployItem ? 'pointer' : 'default' }}>Request</button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Deploy badges */}
                          {deplReqs.map(d => (
                            <div key={d.id} style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: accent }}>
                              <Truck size={9} /> {d.quantity}× {d.itemName} requested
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Deploy requests summary */}
      {deployRequests.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
          <div style={sectionLabel('Deploy Requests')}>Deploy Requests ({deployRequests.length})</div>
          {deployRequests.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <Truck size={12} style={{ color: accent, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.quantity}× {d.itemName}</div>
                {d.reason && <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{d.reason}</div>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: accent + '15', color: accent }}>{d.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Submit Progress Report */}
      <button
        disabled={done === 0}
        style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: pct === 100 ? '#16a34a' : (done > 0 ? accent : 'var(--bg-elevated)'), color: done > 0 ? '#fff' : 'var(--text-subtle)', fontSize: 14, fontWeight: 600, cursor: done > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
      >
        {pct === 100 ? 'Submit Completed Report ✓' : `Submit Progress Report (${pct}%)`}
      </button>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TaskSheet({ task, open, onClose, onMarkComplete }: TaskSheetProps) {
  const { accent, role } = useRole()
  const [comment, setComment] = useState('')
  const [localActivity, setLocalActivity] = useState<ActivityEntry[]>([])
  const [completed, setCompleted] = useState(false)
  const [localPTEStatus, setLocalPTEStatus] = useState<JobPTEStatus | undefined>(task?.pteStatus)
  const [localPTE, setLocalPTE] = useState<JobPTE | undefined>(task?.pte)
  const [accessOpen, setAccessOpen] = useState(false)

  // Sync when task changes
  useEffect(() => {
    setLocalPTEStatus(task?.pteStatus)
    setLocalPTE(task?.pte)
    setCompleted(false)
    setLocalActivity([])
    setAccessOpen(false)
  }, [task?.id])

  // Resolve stored user for subRole
  const [subRole, setSubRole] = useState<string | undefined>(undefined)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('afterstay_user')
      if (raw) setSubRole(JSON.parse(raw)?.subRole)
    } catch { /* ignore */ }
  }, [])

  const property = task ? (
    PROPERTIES.find(p => p.id === task.propertyId) ??
    PROPERTIES.find(p => p.name === task.propertyName)
  ) : null
  const library = property ? PROPERTY_LIBRARIES.find(l => l.propertyId === property.id) : null

  const layout = !task ? 'maintenance'
    : task.type === 'cleaning' ? 'cleaning'
    : task.type === 'guest_services' ? 'gs'
    : 'maintenance'

  const addComment = () => {
    if (!comment.trim()) return
    const entry: ActivityEntry = {
      id: `msg-${Date.now()}`,
      type: 'message',
      authorName: 'You',
      authorAvatar: 'ME',
      message: comment,
      timestamp: new Date().toISOString(),
    }
    setLocalActivity(prev => [...prev, entry])
    setComment('')
  }

  const handleMarkComplete = () => {
    setCompleted(true)
    if (task && onMarkComplete) onMarkComplete(task.id)
    setTimeout(onClose, 1000)
  }

  const handleGrant = (date: string, from: string, to: string) => {
    setLocalPTEStatus('granted')
    setLocalPTE(prev => ({
      ...prev,
      status: 'granted',
      grantedBy: 'You',
      grantedAt: new Date().toISOString(),
      validFrom: `${date}T${from}`,
      validUntil: `${date}T${to}`,
      enterAfter: from,
      accessCode: prev?.accessCode ?? '****',
    }))
  }

  const handleDeny = (reason: string) => {
    setLocalPTEStatus('denied')
    setLocalPTE(prev => ({ ...prev, status: 'denied', deniedBy: 'You', deniedAt: new Date().toISOString(), deniedReason: reason || undefined }))
  }

  if (!task) return null

  return (
    <Sheet open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={{
          width: 500, maxWidth: '95vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', padding: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
            <SheetTitle style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1 }}>
              {task.title}
            </SheetTitle>
            <SheetClose style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={15} color="var(--text-muted)" />
            </SheetClose>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${accent}18`, color: accent }}>{task.type}</span>
            {task.propertyName && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.propertyName}</span>}
            {task.due && <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>· {task.due}</span>}
            {task.pteRequired && localPTEStatus && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: getPTEDisplay(localPTEStatus).bg, color: getPTEDisplay(localPTEStatus).color }}>
                {getPTEDisplay(localPTEStatus).icon} {getPTEDisplay(localPTEStatus).label}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Details */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={sectionLabel('Details')}>Details</div>
            {[
              { label: 'Property', value: task.propertyName ?? '—' },
              { label: 'Assignee', value: task.assignee },
              { label: 'Due', value: task.due },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Property Access — collapsible */}
          {library && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <button
                onClick={() => setAccessOpen(o => !o)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <KeyRound size={13} style={{ color: accent }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)' }}>Property Access</span>
                  {task.pteRequired && !isAccessCodeVisible(localPTEStatus) && (
                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'var(--bg-card)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Lock size={9} /> PTE required
                    </span>
                  )}
                </div>
                {accessOpen ? <ChevronDown size={14} style={{ color: 'var(--text-subtle)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-subtle)' }} />}
              </button>
              {accessOpen && (
                <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)' }}>
                  {(library.checkIn || library.checkOut) && (
                    <div style={{ display: 'flex', gap: 16, paddingTop: 8 }}>
                      {library.checkIn && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Check-in</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{library.checkIn}</div>
                        </div>
                      )}
                      {library.checkOut && (
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Check-out</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{library.checkOut}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {library.accessCode && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <KeyRound size={13} style={{ color: accent, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                          {library.accessType === 'key_box' ? 'Key Box Code' : library.accessType === 'keypad' ? 'Door Code' : 'Access Code'}
                        </div>
                        {isAccessCodeVisible(localPTEStatus)
                          ? <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>{library.accessCode}</div>
                          : <div style={{ fontSize: 12, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={12} /> Locked until PTE granted</div>
                        }
                      </div>
                    </div>
                  )}
                  {library.wifiName && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <Info size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>WiFi</div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{library.wifiName}</div>
                        {library.wifiPassword && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{'•'.repeat(8)}</span>
                            <button
                              onClick={() => navigator.clipboard?.writeText(library.wifiPassword ?? '')}
                              style={{ fontSize: 11, color: accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >Copy</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {library.parkingInfo && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <Car size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Parking</div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{library.parkingInfo}</div>
                      </div>
                    </div>
                  )}
                  {library.accessInstructions && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <DoorOpen size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Entry</div>
                        {isAccessCodeVisible(localPTEStatus)
                          ? <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{library.accessInstructions}</div>
                          : <div style={{ fontSize: 12, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={12} /> Locked until PTE granted</div>
                        }
                      </div>
                    </div>
                  )}
                  {library.cleaningInstructions && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <Info size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Notes</div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{library.cleaningInstructions}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section A: Reservation */}
          {task.reservation && <ReservationSection reservation={task.reservation} />}

          {/* Section B: PTE */}
          {task.pteRequired && (
            <PTESection
              pte={localPTE}
              pteStatus={localPTEStatus}
              role={role}
              subRole={subRole}
              accent={accent}
              onGrant={handleGrant}
              onDeny={handleDeny}
            />
          )}

          {/* Layout-specific content */}
          {layout === 'cleaning' && <CleaningLayout task={task} accent={accent} />}
          {layout === 'maintenance' && task.workItems && task.workItems.length > 0 && (
            <MaintenanceLayout task={task} accent={accent} />
          )}
          {layout === 'gs' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={sectionLabel('Guest Services')}>Guest Services</div>
              {task.description && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{task.description}</p>}
            </div>
          )}

          {/* Activity Thread */}
          {(() => {
            const roleAvatarBg: Record<string, string> = {
              guest_services: '#ec4899', maintenance: '#0ea5e9',
              cleaning: '#d97706', operator: '#7c3aed', default: '#6b7280',
            }
            const seedActivity = task?.activity ?? []
            const allActivity = [...seedActivity, ...localActivity]
            return (
              <div>
                <div style={sectionLabel('Activity')}>Activity</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {allActivity.length === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 10 }}>No activity yet.</div>
                  )}
                  {allActivity.map((entry) => {
                    if (entry.type === 'system') {
                      return (
                        <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', marginBottom: 4 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <span style={{ fontSize: 9 }}>🔔</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{entry.event}</span>
                            {entry.detail && <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 4 }}>— {entry.detail}</span>}
                            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                              {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      )
                    }
                    const avatarBg = roleAvatarBg[entry.authorRole ?? 'default'] ?? roleAvatarBg.default
                    return (
                      <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', marginBottom: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700, color: '#fff' }}>
                          {entry.authorAvatar ?? entry.authorName?.[0] ?? '?'}
                        </div>
                        <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{entry.authorName}</span>
                            {entry.authorRole && (
                              <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: `${avatarBg}22`, color: avatarBg, fontWeight: 600 }}>
                                {entry.authorRole.replace('_', ' ')}
                              </span>
                            )}
                            <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 'auto' }}>
                              {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{entry.message}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addComment()}
                    placeholder="Write a message..."
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                  />
                  <button onClick={addComment} style={{ padding: '8px 14px', borderRadius: 6, background: accent, color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Send</button>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {completed ? (
            <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 600, fontSize: 14 }}>✓ Task marked complete</div>
          ) : (
            <button
              onClick={handleMarkComplete}
              style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Mark Complete
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

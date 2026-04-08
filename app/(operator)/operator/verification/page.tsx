'use client'
import { useState } from 'react'
import { ShieldCheck, Search, ChevronRight, CheckCircle2, XCircle, Clock, SkipForward, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'
import {
  GUEST_VERIFICATIONS, PROPERTY_VERIFICATION_CONFIGS, ALL_STEPS,
  STEP_LABELS, STEP_DESCRIPTIONS,
  type GuestVerification, type VerificationStatus, type VerificationStep, type StepStatus,
} from '@/lib/data/verification'
import { PROPERTIES } from '@/lib/data/properties'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'

const STATUS_LABELS: Record<VerificationStatus, string> = {
  not_started: 'Not Started',
  in_progress:  'In Progress',
  verified:     'Verified',
  failed:       'Failed',
  overridden:   'Overridden',
}

const STATUS_COLORS: Record<VerificationStatus, string> = {
  not_started: '#6b7280',
  in_progress:  '#d97706',
  verified:     '#059669',
  failed:       '#dc2626',
  overridden:   '#7c3aed',
}

const STEP_STATUS_ICON: Record<StepStatus, React.ReactNode> = {
  completed: <CheckCircle2 size={16} style={{ color: '#059669' }} />,
  failed:    <XCircle     size={16} style={{ color: 'var(--status-danger)' }} />,
  pending:   <Clock       size={16} style={{ color: 'var(--text-subtle)' }} />,
  skipped:   <SkipForward size={16} style={{ color: 'var(--text-muted)' }} />,
}

type PageTab = 'guests' | 'step_config' | 'analytics'

const FUNNEL_DATA = [
  { step: 'ID Verification',     pct: 92 },
  { step: 'Selfie Match',         pct: 80 },
  { step: 'Security Deposit',     pct: 75 },
  { step: 'Rental Agreement',     pct: 71 },
  { step: 'House Rules',          pct: 68 },
  { step: 'Payment Confirmation', pct: 65 },
]

const PROPERTY_RATES = [
  { name: 'Sunset Villa',    rate: 94 },
  { name: 'Harbor Studio',   rate: 88 },
  { name: 'Ocean View Apt',  rate: 76 },
  { name: 'Downtown Loft',   rate: 65 },
  { name: 'Mountain Cabin',  rate: 82 },
]

export default function VerificationPage() {
  const { accent } = useRole()
  const [tab, setTab] = useState<PageTab>('guests')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all')
  const [selectedGuest, setSelectedGuest] = useState<GuestVerification | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState('p1')
  const [stepToggles, setStepToggles] = useState<Record<string, Record<VerificationStep, boolean>>>(() => {
    const init: Record<string, Record<VerificationStep, boolean>> = {}
    for (const cfg of PROPERTY_VERIFICATION_CONFIGS) {
      init[cfg.propertyId] = {} as Record<VerificationStep, boolean>
      for (const s of ALL_STEPS) {
        init[cfg.propertyId][s] = cfg.requiredSteps.includes(s)
      }
    }
    return init
  })
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const filtered = GUEST_VERIFICATIONS.filter(g => {
    const matchSearch = g.guestName.toLowerCase().includes(search.toLowerCase()) ||
      g.propertyName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || g.status === statusFilter
    return matchSearch && matchStatus
  })

  const openGuest = (g: GuestVerification) => {
    setSelectedGuest(g)
    setSheetOpen(true)
  }

  const toggleStep = (propId: string, step: VerificationStep) => {
    setStepToggles(prev => ({
      ...prev,
      [propId]: { ...prev[propId], [step]: !prev[propId]?.[step] },
    }))
  }

  const tabStyle = (t: PageTab): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: tab === t ? `${accent}22` : 'transparent',
    color: tab === t ? accent : 'var(--text-muted)',
    fontSize: 13,
    fontWeight: tab === t ? 600 : 400,
    cursor: 'pointer',
  })

  const statusChipStyle = (s: VerificationStatus | 'all'): React.CSSProperties => {
    const active = statusFilter === s
    const color = s === 'all' ? accent : STATUS_COLORS[s as VerificationStatus]
    return {
      padding: '5px 12px',
      borderRadius: 20,
      border: `1px solid ${active ? color : 'var(--border)'}`,
      background: active ? `${color}18` : 'transparent',
      color: active ? color : 'var(--text-muted)',
      fontSize: 12,
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
    }
  }

  return (
    <div>
      <PageHeader
        title="Guest Verification"
        subtitle="Manage guest identity verification and step configuration"
      />

      {/* Top-level tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
        <button style={tabStyle('guests')}      onClick={() => setTab('guests')}>Guests</button>
        <button style={tabStyle('step_config')} onClick={() => setTab('step_config')}>Step Config</button>
        <button style={tabStyle('analytics')}   onClick={() => setTab('analytics')}>Analytics</button>
      </div>

      {/* ── Guests Tab ─────────────────────────────────────────── */}
      {tab === 'guests' && (
        <div>
          {/* Search + filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '0 0 260px' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                placeholder="Search guests or properties…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'not_started', 'in_progress', 'verified', 'failed'] as const).map(s => (
                <button key={s} style={statusChipStyle(s)} onClick={() => setStatusFilter(s)}>
                  {s === 'all' ? 'All' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 120px 140px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
              {['Guest', 'Property', 'Check-in', 'Source', 'Status', 'Actions'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-subtle)' }}>
                No guests match your filters.
              </div>
            )}

            {filtered.map((g, i) => {
              const color = STATUS_COLORS[g.status]
              return (
                <div
                  key={g.id}
                  onClick={() => openGuest(g)}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 120px 140px', gap: 12, padding: '12px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer', alignItems: 'center', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{g.guestName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.guestEmail}</div>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{g.propertyName}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{g.checkInDate}</span>
                  <span style={{ fontSize: 12, padding: '2px 7px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', width: 'fit-content' }}>{g.bookingSource}</span>
                  <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 5, background: `${color}18`, color, fontWeight: 500, width: 'fit-content' }}>
                    {STATUS_LABELS[g.status]}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { openGuest(g); showToast(`Reminder sent to ${g.guestName}`) }}
                      style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, cursor: 'pointer' }}
                    >
                      Remind
                    </button>
                    <button
                      onClick={() => showToast(`Override applied for ${g.guestName}`)}
                      style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      Override
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Step Config Tab ────────────────────────────────────── */}
      {tab === 'step_config' && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Property</label>
            <select
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
              value={selectedPropertyId}
              onChange={e => setSelectedPropertyId(e.target.value)}
            >
              {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            {ALL_STEPS.map((step, i) => {
              const enabled = stepToggles[selectedPropertyId]?.[step] ?? false
              return (
                <div
                  key={step}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < ALL_STEPS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{STEP_LABELS[step]}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{STEP_DESCRIPTIONS[step]}</div>
                    {enabled && (
                      <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Only require if…</div>
                        <button
                          disabled
                          style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-subtle)', cursor: 'not-allowed', opacity: 0.5 }}
                        >
                          + Add condition (coming soon)
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleStep(selectedPropertyId, step)}
                    style={{ width: 40, height: 22, borderRadius: 11, border: 'none', background: enabled ? accent : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: enabled ? 21 : 3, transition: 'left 0.2s' }} />
                  </button>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => showToast('Step configuration saved')}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Save Configuration
          </button>
        </div>
      )}

      {/* ── Analytics Tab ─────────────────────────────────────── */}
      {tab === 'analytics' && (
        <div>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Completion Rate',      value: '82%',    sub: '+4% vs last month' },
              { label: 'Avg Verification Time', value: '18 min', sub: 'Median time to complete' },
              { label: 'Drop-off at ID Upload', value: '12%',    sub: 'Guests who abandon at step 1' },
            ].map(c => (
              <div key={c.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{c.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Step funnel */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px', marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Verification Step Funnel</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FUNNEL_DATA.map(f => (
                <div key={f.step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 180, flexShrink: 0 }}>{f.step}</span>
                  <div style={{ flex: 1, height: 20, background: 'var(--bg-elevated)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${f.pct}%`, height: '100%', background: `${accent}cc`, borderRadius: 5, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', width: 36, textAlign: 'right' }}>{f.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property rates table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Completion Rate by Property
            </div>
            {PROPERTY_RATES.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderBottom: i < PROPERTY_RATES.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{p.name}</span>
                <div style={{ width: 160, height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${p.rate}%`, height: '100%', background: accent, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', width: 36, textAlign: 'right' }}>{p.rate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Guest Detail Sheet ─────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent style={{ width: 480, maxWidth: '90vw', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {selectedGuest && (
            <>
              <SheetHeader style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <SheetTitle style={{ color: 'var(--text-primary)' }}>{selectedGuest.guestName}</SheetTitle>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{selectedGuest.guestEmail}</div>
              </SheetHeader>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
                {/* Guest info */}
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Property', value: selectedGuest.propertyName },
                      { label: 'Source', value: selectedGuest.bookingSource },
                      { label: 'Check-in', value: selectedGuest.checkInDate },
                      { label: 'Check-out', value: selectedGuest.checkOutDate },
                      { label: 'Nights', value: String(selectedGuest.nights) },
                      { label: 'Status', value: STATUS_LABELS[selectedGuest.status] },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step timeline */}
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Verification Steps
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedGuest.steps.map((s, i) => (
                    <div key={s.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      {/* Timeline connector */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
                        <div style={{ marginTop: 2 }}>{STEP_STATUS_ICON[s.status]}</div>
                        {i < selectedGuest.steps.length - 1 && (
                          <div style={{ width: 2, height: 24, background: 'var(--border)', marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: s.status === 'pending' || s.status === 'skipped' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {STEP_LABELS[s.step]}
                        </div>
                        {s.completedAt && (
                          <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
                            {new Date(s.completedAt).toLocaleString()}
                          </div>
                        )}
                        {s.status === 'failed' && (
                          <div style={{ fontSize: 11, color: 'var(--status-danger)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={11} /> Verification failed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <SheetFooter style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { showToast(`Reminder sent to ${selectedGuest.guestName}`); setSheetOpen(false) }}
                  style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                  Send Reminder
                </button>
                <button
                  onClick={() => { showToast(`Verification overridden for ${selectedGuest.guestName}`); setSheetOpen(false) }}
                  style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
                >
                  Override Verification
                </button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

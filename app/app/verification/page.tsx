'use client'
import { useState } from 'react'
import { Search, CheckCircle2, XCircle, Clock, SkipForward, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'
import {
  GUEST_VERIFICATIONS, STEP_LABELS,
  type GuestVerification, type VerificationStatus, type StepStatus,
} from '@/lib/data/verification'
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
  failed:    <XCircle     size={16} style={{ color: '#dc2626' }} />,
  pending:   <Clock       size={16} style={{ color: '#6b7280' }} />,
  skipped:   <SkipForward size={16} style={{ color: '#9ca3af' }} />,
}

export default function AppVerificationPage() {
  const { accent } = useRole()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all')
  const [selectedGuest, setSelectedGuest] = useState<GuestVerification | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
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
      <PageHeader title="Guest Verification" subtitle="Track guest verification status across all properties" />

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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 120px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          {['Guest', 'Property', 'Check-in', 'Source', 'Status'].map(h => (
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
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 120px', gap: 12, padding: '12px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer', alignItems: 'center', transition: 'background 0.12s' }}
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
            </div>
          )
        })}
      </div>

      {/* Guest Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent style={{ width: 480, maxWidth: '90vw', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {selectedGuest && (
            <>
              <SheetHeader style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <SheetTitle style={{ color: 'var(--text-primary)' }}>{selectedGuest.guestName}</SheetTitle>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{selectedGuest.guestEmail}</div>
              </SheetHeader>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
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

                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Verification Steps
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedGuest.steps.map((s, i) => (
                    <div key={s.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
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
                          <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={11} /> Verification failed
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <SheetFooter style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button
                  onClick={() => { showToast(`Reminder sent to ${selectedGuest.guestName}`); setSheetOpen(false) }}
                  style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                  Send Reminder
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

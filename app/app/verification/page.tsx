'use client'
import { useState, useMemo } from 'react'
import {
  Search, CheckCircle2, XCircle, Clock, SkipForward, AlertTriangle,
  FileText, User, ShieldCheck, Calendar, ExternalLink, RefreshCw, Star,
  Eye, Package, ArrowRight, Wifi, WifiOff,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'
import {
  GUEST_VERIFICATIONS, STEP_LABELS,
  type GuestVerification, type VerificationStatus, type StepStatus,
} from '@/lib/data/verification'
import { RESERVATIONS, type Reservation } from '@/lib/data/reservations'
import { isCalendarUpsell, getCalendarSignal } from '@/lib/utils/upsellCalendar'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'

const TODAY = '2026-03-19'

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

const CHANNEL_COLORS: Record<string, string> = {
  'Airbnb':      '#FF5A5F',
  'Booking.com': '#003580',
  'VRBO':        '#3D6B8E',
  'Direct':      '',  // filled by accent
}

const PMS_LABELS: Record<string, string> = {
  hostaway: 'Hostaway',
  guesty:   'Guesty',
  lodgify:  'Lodgify',
  manual:   'Manual',
}

const DOC_ICONS: Record<string, React.ReactNode> = {
  id_front:               <FileText size={16} style={{ color: '#6b7280' }} />,
  id_back:                <FileText size={16} style={{ color: '#6b7280' }} />,
  selfie:                 <User     size={16} style={{ color: '#6b7280' }} />,
  signed_agreement:       <ShieldCheck size={16} style={{ color: '#6b7280' }} />,
  emergency_contact_form: <AlertTriangle size={16} style={{ color: '#6b7280' }} />,
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function needsReminder(g: GuestVerification) {
  return (g.status === 'not_started' || g.status === 'in_progress') &&
    g.checkInDate >= TODAY && g.checkInDate <= addDays(TODAY, 2)
}

function isAmberRow(g: GuestVerification) {
  return needsReminder(g)
}

function formatSyncAge(syncedAt: string) {
  const diffMs = new Date(TODAY + 'T12:00:00Z').getTime() - new Date(syncedAt).getTime()
  const diffH  = Math.round(diffMs / 3_600_000)
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  return `${Math.round(diffH / 24)}d ago`
}

function isSyncStale(syncedAt: string) {
  const diffH = (new Date(TODAY + 'T12:00:00Z').getTime() - new Date(syncedAt).getTime()) / 3_600_000
  return diffH > 6
}

type DateFilter = 'today' | 'tomorrow' | 'next3' | 'week' | 'all'
const DATE_PILLS: { key: DateFilter; label: string }[] = [
  { key: 'today',    label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'next3',    label: 'Next 3 Days' },
  { key: 'week',     label: 'This Week' },
  { key: 'all',      label: 'All' },
]

function matchesDateFilter(g: GuestVerification, df: DateFilter) {
  const ci = g.checkInDate
  if (df === 'all')      return true
  if (df === 'today')    return ci === TODAY
  if (df === 'tomorrow') return ci === addDays(TODAY, 1)
  if (df === 'next3')    return ci >= TODAY && ci <= addDays(TODAY, 3)
  if (df === 'week')     return ci >= TODAY && ci <= addDays(TODAY, 7)
  return true
}

const CHANNELS = ['All', 'Airbnb', 'Booking.com', 'VRBO', 'Direct']

export default function AppVerificationPage() {
  const { accent } = useRole()
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all')
  const [channelFilter, setChannelFilter] = useState('All')
  const [dateFilter, setDateFilter]     = useState<DateFilter>('all')
  const [selectedGuest, setSelectedGuest] = useState<GuestVerification | null>(null)
  const [sheetOpen, setSheetOpen]       = useState(false)
  const [toast, setToast]               = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // KPI counts
  const todayGuests   = GUEST_VERIFICATIONS.filter(g => g.checkInDate === TODAY)
  const verifiedToday = todayGuests.filter(g => g.status === 'verified').length
  const reminderCount = GUEST_VERIFICATIONS.filter(needsReminder).length

  const filtered = useMemo(() => GUEST_VERIFICATIONS.filter(g => {
    const matchSearch = g.guestName.toLowerCase().includes(search.toLowerCase()) ||
      g.propertyName.toLowerCase().includes(search.toLowerCase())
    const matchStatus  = statusFilter === 'all' || g.status === statusFilter
    const matchChannel = channelFilter === 'All' || g.bookingSource === channelFilter
    const matchDate    = matchesDateFilter(g, dateFilter)
    return matchSearch && matchStatus && matchChannel && matchDate
  }), [search, statusFilter, channelFilter, dateFilter])

  const reservation = selectedGuest
    ? RESERVATIONS.find(r => r.guestVerificationId === selectedGuest.id) ?? null
    : null

  const openGuest = (g: GuestVerification) => { setSelectedGuest(g); setSheetOpen(true) }

  const chipStyle = (active: boolean, color: string): React.CSSProperties => ({
    padding: '5px 12px',
    borderRadius: 20,
    border: `1px solid ${active ? color : 'var(--border)'}`,
    background: active ? `${color}18` : 'transparent',
    color: active ? color : 'var(--text-muted)',
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  })

  const channelBadgeStyle = (source: string): React.CSSProperties => {
    const bg = CHANNEL_COLORS[source] ?? accent
    return {
      fontSize: 11,
      fontWeight: 600,
      color: '#fff',
      background: bg,
      padding: '2px 7px',
      borderRadius: 4,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap' as const,
    }
  }

  return (
    <div>
      <PageHeader title="Guest Verification" subtitle="Track guest verification status across all properties" />

      {/* KPI Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Checking in Today</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>{todayGuests.length}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Verified Today</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: verifiedToday === todayGuests.length ? '#059669' : '#d97706' }}>
            {verifiedToday} / {todayGuests.length}
          </div>
        </div>
        <div style={{ background: reminderCount > 0 ? '#d9770608' : 'var(--bg-card)', border: `1px solid ${reminderCount > 0 ? '#d9770630' : 'var(--border)'}`, borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Needs Reminder</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: reminderCount > 0 ? '#d97706' : 'var(--text-primary)' }}>{reminderCount}</div>
        </div>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {/* Date pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DATE_PILLS.map(p => (
            <button key={p.key} style={chipStyle(dateFilter === p.key, accent)} onClick={() => setDateFilter(p.key)}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Search + status + channel */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '0 0 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
              placeholder="Search guests or properties…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(['all', 'not_started', 'in_progress', 'verified', 'failed'] as const).map(s => (
              <button key={s} style={chipStyle(statusFilter === s, s === 'all' ? accent : STATUS_COLORS[s])} onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'All' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {CHANNELS.map(ch => {
              const color = ch === 'All' ? accent : (CHANNEL_COLORS[ch] ?? accent)
              return (
                <button key={ch} style={chipStyle(channelFilter === ch, color)} onClick={() => setChannelFilter(ch)}>
                  {ch}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 1.1fr 110px', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          {['Guest', 'Property', 'Check-in', 'Channel', 'Portal', 'Status'].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-subtle)' }}>
            No guests match your filters.
          </div>
        )}

        {filtered.map((g, i) => {
          const statusColor = STATUS_COLORS[g.status]
          const amber = isAmberRow(g)
          return (
            <div
              key={g.id}
              onClick={() => openGuest(g)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.4fr 1fr 1fr 1.1fr 110px',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                cursor: 'pointer',
                alignItems: 'center',
                background: amber ? '#d9770608' : 'transparent',
                transition: 'background 0.12s',
                borderLeft: amber ? '3px solid #d97706' : '3px solid transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = amber ? '#d9770614' : 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = amber ? '#d9770608' : 'transparent')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{g.guestName}</span>
                  {amber && <AlertTriangle size={12} style={{ color: '#d97706', flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.guestEmail}</div>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{g.propertyName}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{g.checkInDate}</span>
              <span style={channelBadgeStyle(g.bookingSource)}>{g.bookingSource}</span>
              {/* Portal pill */}
              {g.portalOpenCount > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#059669', background: '#05966914', padding: '2px 8px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                  <Wifi size={11} /> Opened {g.portalOpenCount}×
                </span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#dc2626', background: '#dc262614', padding: '2px 8px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                  <WifiOff size={11} /> Not opened
                </span>
              )}
              <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 5, background: `${statusColor}18`, color: statusColor, fontWeight: 500, width: 'fit-content' }}>
                {STATUS_LABELS[g.status]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Guest Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent style={{ width: 520, maxWidth: '92vw', display: 'flex', flexDirection: 'column', gap: 0, padding: 0 }}>
          {selectedGuest && (
            <>
              <SheetHeader style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <SheetTitle style={{ color: 'var(--text-primary)', fontSize: 18 }}>{selectedGuest.guestName}</SheetTitle>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{selectedGuest.guestEmail}</div>
                  </div>
                  <span style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: `${STATUS_COLORS[selectedGuest.status]}18`,
                    color: STATUS_COLORS[selectedGuest.status],
                    fontWeight: 600,
                    marginTop: 4,
                  }}>
                    {STATUS_LABELS[selectedGuest.status]}
                  </span>
                </div>
              </SheetHeader>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* Section 1 — Reservation / PMS */}
                {reservation && (
                  <div style={{ marginBottom: 24 }}>
                    <SectionHeading label="Reservation" icon={<Calendar size={13} />} />
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{reservation.bookingRef}</span>
                          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${accent}18`, color: accent, fontWeight: 600 }}>
                            {PMS_LABELS[reservation.pmsProvider]}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isSyncStale(reservation.syncedAt) ? '#d97706' : '#059669' }} />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {isSyncStale(reservation.syncedAt) ? 'Stale' : 'Synced'} {formatSyncAge(reservation.syncedAt)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        {[
                          { label: 'PMS Status',  value: reservation.pmsStatus.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) },
                          { label: 'Total',        value: `$${reservation.totalAmount.toLocaleString()}` },
                          { label: 'Guests',       value: String(reservation.guestsCount) },
                          { label: 'Check-in',     value: reservation.checkInDate },
                          { label: 'Check-out',    value: reservation.checkOutDate },
                          { label: 'Nights',       value: String(reservation.nights) },
                        ].map(item => (
                          <div key={item.label}>
                            <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                      {reservation.specialRequests && (
                        <div style={{ marginTop: 10, padding: '8px 10px', background: '#f59e0b10', borderLeft: '3px solid #f59e0b', borderRadius: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span style={{ fontWeight: 600, color: '#f59e0b' }}>Special request: </span>
                          {reservation.specialRequests}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section 2 — Submitted Documents */}
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Submitted Documents" icon={<FileText size={13} />} />
                  {!selectedGuest.submittedDocuments?.length ? (
                    <EmptyState msg="No documents submitted yet" />
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {selectedGuest.submittedDocuments.map(doc => (
                        <div key={doc.type} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
                          <div style={{ flexShrink: 0 }}>{DOC_ICONS[doc.type]}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{doc.label}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                          </div>
                          {doc.previewUrl && (
                            <button
                              onClick={e => { e.stopPropagation(); showToast('Preview opened') }}
                              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: accent, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <Eye size={12} /> View
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 3 — Upsell Purchases */}
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Add-on Purchases" icon={<Package size={13} />} />
                  {!selectedGuest.upsellPurchases?.length ? (
                    <EmptyState msg="No add-ons purchased" />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedGuest.upsellPurchases.map(up => {
                        const calUpsell = isCalendarUpsell(up.title) && reservation
                        const signal = calUpsell
                          ? getCalendarSignal(up.title, selectedGuest.propertyId, selectedGuest.checkInDate, selectedGuest.checkOutDate)
                          : null
                        return (
                          <div key={up.upsellId} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{up.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                  {up.category} · {new Date(up.purchasedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>
                                ${up.price}
                              </span>
                            </div>
                            {signal && signal.type && (
                              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6, background: signal.possible ? '#05966912' : '#dc262612' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: signal.possible ? '#059669' : '#dc2626', flexShrink: 0 }} />
                                <span style={{ fontSize: 11, color: signal.possible ? '#059669' : '#dc2626', fontWeight: 500 }}>
                                  {signal.reason}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Section 4 — Portal Activity */}
                <div style={{ marginBottom: 24 }}>
                  <SectionHeading label="Portal Activity" icon={<Wifi size={13} />} />
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                    {selectedGuest.portalOpenCount > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Wifi size={14} style={{ color: '#059669' }} />
                        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                          Opened <strong>{selectedGuest.portalOpenCount}×</strong>
                          {selectedGuest.portalLastOpenedAt && (
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                              {' · '}Last seen {new Date(selectedGuest.portalLastOpenedAt).toLocaleString()}
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <WifiOff size={14} style={{ color: '#dc2626' }} />
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Guest has not opened their portal</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Steps */}
                <div>
                  <SectionHeading label="Verification Steps" icon={<ShieldCheck size={13} />} />
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
              </div>

              <SheetFooter style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', gap: 8 }}>
                <button
                  onClick={() => { showToast(`Reminder sent to ${selectedGuest.guestName}`); setSheetOpen(false) }}
                  style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                  Send Reminder
                </button>
                {(selectedGuest.status === 'failed' || selectedGuest.status === 'in_progress') && (
                  <button
                    onClick={() => { showToast(`Verification overridden for ${selectedGuest.guestName}`); setSheetOpen(false) }}
                    style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid #7c3aed', background: '#7c3aed14', color: '#7c3aed', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Override
                  </button>
                )}
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

function SectionHeading({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
      {icon} {label}
    </div>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{ padding: '14px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center' }}>
      {msg}
    </div>
  )
}

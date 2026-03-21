'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, CalendarClock } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import GuestServicesNav from '@/components/guest-services/GuestServicesNav'
import { useRole } from '@/context/RoleContext'
import { UPSELL_APPROVAL_REQUESTS } from '@/lib/data/upsellApprovals'
import { getTodayUpsellApprovals } from '@/lib/utils/upsellCalendar'

const TODAY = '2026-03-19'

const PRESEED_DECISIONS = [
  {
    id: 'uar1',
    status: 'approved',
    guestName: 'Alex Torres',
    upsellTitle: 'Early Check-in',
    propertyName: 'Ocean View Suite',
    decidedAt: '2026-03-21T08:15:00Z',
  },
  {
    id: 'uar3',
    status: 'declined',
    guestName: 'Emma Larsson',
    upsellTitle: 'Late Checkout',
    propertyName: 'Harbor Studio',
    notes: 'Next guest checks in at 14:00 — not enough turnaround time.',
    decidedAt: '2026-03-21T07:45:00Z',
  },
]

type FilterStatus = 'all' | 'pending' | 'approved' | 'declined'

interface UpsellDecision {
  id: string
  status: string
  guestName?: string
  upsellTitle?: string
  propertyName?: string
  notes?: string
  decidedAt: string
  cleanerName?: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function UpsellsPage() {
  const { accent } = useRole()
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [upsellDecisions, setUpsellDecisions] = useState<UpsellDecision[]>([])
  const [approvalStatuses, setApprovalStatuses] = useState<Record<string, string>>(() =>
    Object.fromEntries(UPSELL_APPROVAL_REQUESTS.map(r => [r.id, r.status]))
  )

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nestops_upsell_decisions')
      if (!raw) {
        localStorage.setItem('nestops_upsell_decisions', JSON.stringify(PRESEED_DECISIONS))
        setUpsellDecisions(PRESEED_DECISIONS)
        setApprovalStatuses(prev => ({
          ...prev,
          ...Object.fromEntries(PRESEED_DECISIONS.map(d => [d.id, d.status])),
        }))
      } else {
        const decisions: UpsellDecision[] = JSON.parse(raw)
        setUpsellDecisions(decisions)
        setApprovalStatuses(prev => ({
          ...prev,
          ...Object.fromEntries(decisions.map(d => [d.id, d.status])),
        }))
      }
    } catch {}
  }, [])

  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleApprove = (id: string) => {
    setApprovalStatuses(prev => ({ ...prev, [id]: 'approved' }))
    showToast('Upsell request approved')
  }
  const handleDecline = (id: string) => {
    setApprovalStatuses(prev => ({ ...prev, [id]: 'declined' }))
    showToast('Upsell request declined')
  }

  const upsellApprovals = getTodayUpsellApprovals(TODAY)

  const filteredRequests = UPSELL_APPROVAL_REQUESTS.filter(req => {
    const st = approvalStatuses[req.id] ?? req.status
    if (filter === 'all') return true
    if (filter === 'pending') return st === 'pending_cleaner' || st === 'pending_supervisor'
    if (filter === 'approved') return st === 'approved' || st === 'charged' || st === 'auth_held'
    if (filter === 'declined') return st === 'declined'
    return true
  })

  const FILTER_PILLS: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Declined', value: 'declined' },
  ]

  return (
    <div>
      <PageHeader
        title="Upsells"
        subtitle={`${UPSELL_APPROVAL_REQUESTS.length} requests · ${upsellDecisions.length} staff decisions`}
      />

      <GuestServicesNav />

      {/* Staff Decisions panel */}
      {upsellDecisions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Staff Decisions
            </span>
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: '#05966920', color: '#059669', fontWeight: 600 }}>
              {upsellDecisions.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upsellDecisions.map(d => (
              <div
                key={d.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  background: 'var(--bg-card)',
                  border: `1px solid ${d.status === 'approved' ? '#05966930' : '#ef444430'}`,
                  borderLeft: `4px solid ${d.status === 'approved' ? '#059669' : '#ef4444'}`,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: d.status === 'approved' ? '#05966920' : '#ef444420',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}>
                  {d.status === 'approved' ? '✓' : '✗'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {d.upsellTitle} — {d.propertyName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {d.guestName}
                    {d.cleanerName && <> · by {d.cleanerName}</>}
                    {' · '}
                    {d.status === 'approved' ? 'Approved by staff' : `Declined${d.notes ? ` — ${d.notes}` : ''}`}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, textTransform: 'capitalize',
                    background: d.status === 'approved' ? '#05966918' : '#ef444418',
                    color: d.status === 'approved' ? '#059669' : '#ef4444',
                    border: `1px solid ${d.status === 'approved' ? '#05966930' : '#ef444430'}`,
                  }}>
                    {d.status === 'approved' ? '✓ Approved' : '✗ Declined'}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{timeAgo(d.decidedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Calendar signal briefing */}
      {upsellApprovals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          style={{ marginBottom: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <CalendarClock size={14} style={{ color: '#d97706' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Upsell Approvals — Today
            </span>
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: '#d9770620', color: '#d97706', fontWeight: 600 }}>
              {upsellApprovals.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
            {upsellApprovals.map(({ guest, upsell, signal, triggerType }) => (
              <div
                key={`${guest.id}-${upsell.upsellId}`}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${signal.possible ? '#05966930' : '#dc262630'}`,
                  borderRadius: 10, padding: '12px 14px',
                  borderLeft: `4px solid ${signal.possible ? '#059669' : '#dc2626'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{guest.guestName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {guest.propertyName} ·{' '}
                      {triggerType === 'same_day_checkin' ? `Check-in today (${guest.checkInDate})` : `Check-out today (${guest.checkOutDate})`}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', flexShrink: 0, marginLeft: 8 }}>
                    ${upsell.price}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Package size={12} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{upsell.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {upsell.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6, background: signal.possible ? '#05966910' : '#dc262610' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: signal.possible ? '#059669' : '#dc2626', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: signal.possible ? '#059669' : '#dc2626', fontWeight: 500 }}>
                    {signal.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTER_PILLS.map(pill => {
          const active = filter === pill.value
          return (
            <button
              key={pill.value}
              onClick={() => setFilter(pill.value)}
              style={{
                padding: '5px 14px', borderRadius: 20, border: '1px solid',
                borderColor: active ? accent : 'var(--border)',
                background: active ? `${accent}18` : 'transparent',
                color: active ? accent : 'var(--text-muted)',
                fontSize: 12, fontWeight: active ? 600 : 500, cursor: 'pointer',
              }}
            >
              {pill.label}
            </button>
          )
        })}
      </div>

      {/* Upsell Approval Requests */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.08 }}
        style={{ marginBottom: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Package size={14} style={{ color: accent }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Upsell Approval Requests
          </span>
          <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: `${accent}20`, color: accent, fontWeight: 600 }}>
            {filteredRequests.length}
          </span>
        </div>

        {filteredRequests.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
            No requests match this filter.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
            {filteredRequests.map(req => {
              const currentStatus = approvalStatuses[req.id] ?? req.status
              const isApproved = currentStatus === 'approved' || currentStatus === 'charged' || currentStatus === 'auth_held'
              const isPending = currentStatus === 'pending_cleaner' || currentStatus === 'pending_supervisor'
              const isDeclined = currentStatus === 'declined'

              return (
                <div
                  key={req.id}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '12px 14px',
                    borderLeft: `4px solid ${isApproved ? '#059669' : isPending ? '#d97706' : isDeclined ? '#ef4444' : 'var(--border)'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{req.guestName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {req.propertyName} · {req.checkInDate}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0, marginLeft: 8 }}>
                      {req.price} {req.currency}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{req.upsellTitle}</span>
                    {req.paymentMode === 'auth_hold' ? (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#d9770618', color: '#d97706', border: '1px solid #d9770630' }}>
                        Auth Hold
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#2563eb18', color: '#2563eb', border: '1px solid #2563eb30' }}>
                        Auto-Charge
                      </span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, textTransform: 'capitalize',
                      background: isApproved ? '#05966918' : isPending ? '#d9770618' : isDeclined ? '#ef444418' : '#6b728018',
                      color: isApproved ? '#059669' : isPending ? '#d97706' : isDeclined ? '#ef4444' : '#6b7280',
                      border: `1px solid ${isApproved ? '#05966930' : isPending ? '#d9770630' : isDeclined ? '#ef444430' : '#6b728030'}`,
                    }}>
                      {currentStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {req.cleanerNotes && (
                    <div style={{ marginBottom: 8, padding: '5px 8px', borderRadius: 6, background: 'var(--bg-elevated)', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      "{req.cleanerNotes}"
                    </div>
                  )}

                  {isPending && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button
                        onClick={() => handleApprove(req.id)}
                        style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: '1px solid #059669', background: '#05966914', color: '#059669', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: '1px solid #ef4444', background: '#ef444414', color: '#ef4444', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {isApproved && (
                    <div style={{ marginTop: 8, padding: '5px 8px', borderRadius: 6, background: '#05966910', textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>✓ Approved</span>
                    </div>
                  )}
                  {isDeclined && (
                    <div style={{ marginTop: 8, padding: '5px 8px', borderRadius: 6, background: '#ef444410', textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>✗ Declined</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '10px 18px', borderRadius: 10,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          fontSize: 13, color: 'var(--text-primary)', fontWeight: 500,
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  )
}

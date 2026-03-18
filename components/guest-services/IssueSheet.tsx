'use client'
import { useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from '@/components/ui/sheet'
import {
  X, Clock, Home, User, AlertTriangle, CheckCircle, DollarSign,
  Calendar, MessageSquare, Minus, Plus,
} from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import {
  type GuestIssue,
  fmtNok,
} from '@/lib/data/guestServices'

interface Props {
  issue: GuestIssue
  onClose: () => void
  readOnly?: boolean
}

const SEVERITY_COLOR: Record<string, string> = {
  low:      '#6b7280',
  medium:   '#d97706',
  high:     '#ef4444',
  critical: '#dc2626',
}

const STATUS_COLOR: Record<string, string> = {
  open:           '#ef4444',
  investigating:  '#d97706',
  escalated:      '#dc2626',
  resolved:       '#10b981',
  refund_pending: '#d97706',
  refund_issued:  '#6366f1',
  closed:         '#6b7280',
}

const CHANNEL_LABEL: Record<string, string> = {
  airbnb:      'Airbnb',
  booking_com: 'Booking.com',
  direct:      'Direct',
  vrbo:        'VRBO',
}

export default function IssueSheet({ issue, onClose, readOnly = false }: Props) {
  const { accent } = useRole()
  const [refundNights, setRefundNights] = useState(issue.affectedNights)

  const suggested50 = issue.nightlyRate * refundNights * 0.5
  const suggested25 = issue.nightlyRate * refundNights * 0.25
  const suggestedFull = issue.nightlyRate * refundNights

  return (
    <Sheet open onOpenChange={open => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={{
          width: 480, maxWidth: '90vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: `${SEVERITY_COLOR[issue.severity]}18`,
                    color: SEVERITY_COLOR[issue.severity],
                    textTransform: 'capitalize',
                  }}
                >
                  {issue.severity}
                </span>
                <span
                  style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: `${STATUS_COLOR[issue.status]}18`,
                    color: STATUS_COLOR[issue.status],
                    textTransform: 'capitalize',
                  }}
                >
                  {issue.status.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 'auto' }}>#{issue.id}</span>
              </div>
              <SheetTitle style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, margin: 0 }}>
                {issue.title}
              </SheetTitle>
            </div>
            <SheetClose
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--bg-elevated)', cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={15} color="var(--text-muted)" />
            </SheetClose>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Meta row */}
          <div
            style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {[
              { icon: Home, label: 'Property', value: issue.propertyName },
              { icon: User, label: 'Guest', value: issue.guestName },
              { icon: Calendar, label: 'Check-in', value: new Date(issue.checkInDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { icon: Calendar, label: 'Channel', value: CHANNEL_LABEL[issue.bookingChannel] ?? issue.bookingChannel },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  padding: '10px 12px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Icon size={12} color="var(--text-subtle)" />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>{label}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 8 }}>Description</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{issue.description}</p>
          </div>

          {/* Reservation */}
          <div
            style={{
              padding: '12px 14px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 10 }}>Reservation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Reservation ID', issue.reservationId],
                ['Nights', `${issue.totalNights} nights`],
                ['Nightly Rate', fmtNok(issue.nightlyRate)],
                ['Total Booking', fmtNok(issue.nightlyRate * issue.totalNights)],
                ['Affected Nights', issue.affectedNights],
              ].map(([k, v]) => (
                <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Refund section */}
          <div
            style={{
              padding: '14px 16px', background: '#6366f108',
              border: '1px solid #6366f130', borderRadius: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <DollarSign size={15} color="#6366f1" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {readOnly ? 'Refund Status' : 'Refund Calculator'}
              </span>
              {readOnly && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 10, background: '#6366f118', color: '#6366f1', marginLeft: 'auto' }}>
                  View only
                </span>
              )}
            </div>

            {issue.refund && (
              <div
                style={{
                  padding: '8px 12px', borderRadius: 6,
                  background: issue.refund.status === 'issued' ? '#10b98115' : '#d9770615',
                  border: `1px solid ${issue.refund.status === 'issued' ? '#10b98130' : '#d9770630'}`,
                  marginBottom: readOnly ? 0 : 14, fontSize: 12, color: 'var(--text-muted)',
                }}
              >
                <strong style={{ color: issue.refund.status === 'issued' ? '#10b981' : '#d97706' }}>
                  {issue.refund.status === 'issued' ? '✓ Refund Issued' : 'Refund ' + issue.refund.status.replace(/_/g, ' ')}:
                </strong>{' '}
                {fmtNok(issue.refund.approvedAmount)} via {issue.refund.issuedVia}
              </div>
            )}

            {!readOnly && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Affected nights:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setRefundNights(n => Math.max(0, n - 1))}
                      style={{
                        width: 26, height: 26, borderRadius: 6,
                        border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Minus size={12} color="var(--text-muted)" />
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', minWidth: 20, textAlign: 'center' }}>
                      {refundNights}
                    </span>
                    <button
                      onClick={() => setRefundNights(n => Math.min(issue.totalNights, n + 1))}
                      style={{
                        width: 26, height: 26, borderRadius: 6,
                        border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Plus size={12} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    ['25% partial', suggested25],
                    ['50% partial', suggested50],
                    ['Full nights', suggestedFull],
                  ].map(([label, amt]) => (
                    <div
                      key={String(label)}
                      style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '6px 10px', borderRadius: 6,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{fmtNok(amt as number)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Internal notes */}
          {issue.internalNotes && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 8 }}>Internal Notes</div>
              <div
                style={{
                  padding: '10px 12px', background: '#d9770608',
                  border: '1px solid #d9770625', borderRadius: 8,
                  fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
                }}
              >
                {issue.internalNotes}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 12 }}>Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {issue.timeline.map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                        background: i === 0 ? accent : 'var(--border)',
                        border: `2px solid ${i === 0 ? accent : 'var(--border)'}`,
                      }}
                    />
                    {i < issue.timeline.length - 1 && (
                      <div style={{ flex: 1, width: 1, background: 'var(--border)', margin: '2px 0' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{event.by}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {new Date(event.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {' '}
                        {new Date(event.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{event.action}</p>
                    {event.note && (
                      <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: '4px 0 0', fontStyle: 'italic' }}>{event.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution */}
          {issue.resolutionNotes && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 8 }}>Resolution</div>
              <div
                style={{
                  padding: '10px 12px', background: '#10b98108',
                  border: '1px solid #10b98125', borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{issue.resolutionNotes}</p>
                </div>
                {issue.resolutionTimeMinutes != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <Clock size={12} color="var(--text-subtle)" />
                    <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                      Resolved in {Math.round(issue.resolutionTimeMinutes / 60 * 10) / 10} hours
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

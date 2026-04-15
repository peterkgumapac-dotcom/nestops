'use client'
import { useState } from 'react'
import { X, Calendar, MapPin, User } from 'lucide-react'
import type { UpsellApprovalRequest } from '@/lib/data/upsellApprovals'
import { getPropertyWorkload } from '@/lib/data/cleaningWorkload'

interface DaySlot {
  property: string
  type: string
  timeWindow: string   // e.g. "10:00–12:00"
  checkoutTime: string
  checkinTime: string
}

interface CleanerApprovalSheetProps {
  request: UpsellApprovalRequest
  open: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onDecline: (id: string, notes: string) => void
  myDaySchedule?: DaySlot[]
}

function toMins(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function slotEnd(timeWindow: string): string {
  return timeWindow.split('–')[1]?.trim() ?? timeWindow.split('-')[1]?.trim() ?? ''
}

function slotStart(timeWindow: string): string {
  return timeWindow.split('–')[0]?.trim() ?? timeWindow.split('-')[0]?.trim() ?? ''
}

function hasTightGap(checkoutTime: string, windowStart: string): boolean {
  return toMins(windowStart) - toMins(checkoutTime) < 90
}

function SignalBadge({ signal }: { signal: 'available' | 'tentative' | 'blocked' }) {
  if (signal === 'available') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#05966918', color: '#059669', border: '1px solid #05966930' }}>
        <span style={{ fontSize: 10 }}>🟢</span> Available
      </span>
    )
  }
  if (signal === 'tentative') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#d9770618', color: '#d97706', border: '1px solid #d9770630' }}>
        <span style={{ fontSize: 10 }}>🟡</span> Tentative
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#ef444418', color: '#ef4444', border: '1px solid #ef444430' }}>
      <span style={{ fontSize: 10 }}>🔴</span> Blocked
    </span>
  )
}

export default function CleanerApprovalSheet({
  request,
  open,
  onClose,
  onApprove,
  onDecline,
  myDaySchedule,
}: CleanerApprovalSheetProps) {
  const [showDeclineInput, setShowDeclineInput] = useState(false)
  const [declineNotes, setDeclineNotes] = useState('')
  const [approved, setApproved] = useState(false)

  if (!open) return null

  const isEscalated = request.escalatedToSupervisor === true

  // Determine the relevant date for workload lookup
  const isEco = request.upsellTitle.toLowerCase().includes('early')
  const relevantDate = isEco ? request.checkInDate : request.checkOutDate

  const workload = getPropertyWorkload(request.propertyId, relevantDate)

  const handleApprove = () => {
    setApproved(true)
    onApprove(request.id)
  }

  const handleDeclineSubmit = () => {
    onDecline(request.id, declineNotes)
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: '100%', maxWidth: 420,
          background: 'var(--bg-surface)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {isEscalated ? 'Supervisor Approval Required' : 'Upsell Approval Request'}
              </span>
              {isEscalated && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                  ⬆ Escalated
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {isEscalated
                ? 'No cleaner assigned — you are approving as field supervisor'
                : 'Review and respond'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>

          {approved ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 40, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#05966920', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>✓</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#059669', marginBottom: 8 }}>Approved!</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                The guest will be notified and the card hold will be confirmed.
              </div>
            </div>
          ) : (
            <>
              {/* Request summary */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  {request.upsellTitle}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{request.guestName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{request.propertyName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Check-in: {request.checkInDate} · Check-out: {request.checkOutDate}
                    </span>
                  </div>

                </div>

                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SignalBadge signal={request.calendarSignal} />
                </div>
              </div>

              {/* Day Schedule section */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Your Schedule Today
                </div>
                {isEscalated && (
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 8, padding: '6px 10px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 6 }}>
                    No cleaner is assigned to this property. You are receiving this as field supervisor.
                    Approving will confirm the upsell and capture the auth hold.
                  </div>
                )}
                {myDaySchedule && myDaySchedule.length > 0 ? (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    {myDaySchedule.map((slot, i) => {
                      const tight = hasTightGap(slot.checkoutTime, slotStart(slot.timeWindow))
                      const typeColors: Record<string, string> = { Turnover: 'var(--status-purple-fg)', 'Deep Clean': '#3b82f6', 'Same-day': '#f97316', Inspection: '#06b6d4' }
                      const tc = typeColors[slot.type] ?? '#6b7280'
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < myDaySchedule.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 6, background: `${tc}18`, color: tc, border: `1px solid ${tc}30`, whiteSpace: 'nowrap' }}>{slot.type}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.property}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>🕐 {slot.timeWindow}</span>
                          {tight && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 6, background: '#d9770618', color: '#d97706', border: '1px solid #d9770630', whiteSpace: 'nowrap' }}>⚡ Tight</span>}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    {[
                      { icon: '🔄', count: workload.turnovers, label: 'Turnover cleans' },
                      { icon: '⏰', count: workload.sameDayCheckIns, label: 'Same-day check-ins' },
                      { icon: '🧹', count: workload.deepCleans, label: 'Deep cleans' },
                      { icon: '👥', count: workload.totalGuests, label: 'Total guests that day' },
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{row.icon}</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', minWidth: 28 }}>{row.count}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Impact analysis */}
              {(() => {
                const matchSlot = myDaySchedule?.find(s => s.property === request.propertyName)
                const verdict = request.calendarSignal === 'blocked' ? 'conflict'
                  : request.calendarSignal === 'available' ? 'fine'
                  : 'careful'
                const verdictStyle = verdict === 'conflict'
                  ? { bg: '#ef444414', color: '#ef4444', border: '#ef444430', icon: '🔴' }
                  : verdict === 'careful'
                  ? { bg: '#d9770614', color: '#d97706', border: '#d9770630', icon: '🟡' }
                  : { bg: '#05966914', color: '#059669', border: '#05966930', icon: '🟢' }
                const verdictLabel = verdict === 'conflict' ? 'Schedule conflict' : verdict === 'careful' ? 'Plan carefully' : 'Looks fine'

                let impactText = ''
                if (isEco) {
                  if (matchSlot) {
                    const windowEndStr = slotEnd(matchSlot.timeWindow)
                    const windowEndMins = toMins(windowEndStr)
                    const earlyArrivalMins = windowEndMins - 120
                    const earlyH = Math.floor(earlyArrivalMins / 60).toString().padStart(2, '0')
                    const earlyM = (earlyArrivalMins % 60).toString().padStart(2, '0')
                    impactText = `Guest wants early check-in (~${earlyH}:${earlyM}). Your cleaning at ${request.propertyName} ends at ${windowEndStr}. ${verdict === 'fine' ? '✓ You should have it ready in time.' : '⚠️ You may not finish in time.'}`
                  } else {
                    impactText = `Guest is requesting early check-in at ${request.propertyName}. Verify your cleaning schedule for ${relevantDate}.`
                  }
                } else {
                  if (matchSlot) {
                    const windowStartStr = slotStart(matchSlot.timeWindow)
                    impactText = `Your turnover at ${request.propertyName} starts at ${windowStartStr}. A late checkout means the guest stays 2+ hours longer — your clean will start later than planned. ${verdict === 'conflict' ? '🔴 This will conflict with your next job.' : verdict === 'careful' ? '⚡ Plan extra buffer.' : '✓ You have enough gap.'}`
                  } else {
                    impactText = `Guest is requesting late checkout at ${request.propertyName}. This may push your cleaning window back by 2+ hours.`
                  }
                }

                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 10 }}>
                      Impact of Approving
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: verdictStyle.bg, border: `1px solid ${verdictStyle.border}`, marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 13 }}>{verdictStyle.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: verdictStyle.color }}>{verdictLabel}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{impactText}</p>
                    </div>
                    {myDaySchedule && myDaySchedule.length > 0 && (
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        <span>🔄 {myDaySchedule.filter(s => s.type === 'Turnover').length} turnover{myDaySchedule.filter(s => s.type === 'Turnover').length !== 1 ? 's' : ''}</span>
                        <span>⏰ {myDaySchedule.filter(s => s.type === 'Same-day').length} same-day check-in{myDaySchedule.filter(s => s.type === 'Same-day').length !== 1 ? 's' : ''}</span>
                        <span>🧹 {myDaySchedule.filter(s => s.type === 'Deep Clean').length} deep clean{myDaySchedule.filter(s => s.type === 'Deep Clean').length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Decline notes input */}
              {showDeclineInput && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Reason for declining (required)</div>
                  <textarea
                    value={declineNotes}
                    onChange={e => setDeclineNotes(e.target.value)}
                    placeholder="e.g. Prior checkout same morning, cannot accommodate..."
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                      resize: 'vertical', minHeight: 72, boxSizing: 'border-box',
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => { setShowDeclineInput(false); setDeclineNotes('') }}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeclineSubmit}
                      disabled={!declineNotes.trim()}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                        background: declineNotes.trim() ? '#ef4444' : 'var(--border)',
                        color: declineNotes.trim() ? '#fff' : 'var(--text-muted)',
                        fontSize: 13, fontWeight: 600, cursor: declineNotes.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Confirm Decline
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!approved && !showDeclineInput && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowDeclineInput(true)}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, border: '1px solid #ef4444',
                background: '#ef444410', color: '#ef4444',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Decline
            </button>
            <button
              onClick={handleApprove}
              style={{
                flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                background: '#059669', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

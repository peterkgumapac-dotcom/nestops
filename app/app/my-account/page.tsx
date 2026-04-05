'use client'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'
import { LEAVE_BALANCES, LEAVE_REQUESTS, type LeaveType, type LeaveRequest } from '@/lib/data/leave'
import { STAFF_CONTRACTS } from '@/lib/data/contracts'
import { getStaffWeeklyHours } from '@/lib/data/staffScheduling'

// Map user IDs → staff IDs (same as dashboard)
const USER_TO_STAFF: Record<string, string> = {
  'u3': 's1', // Maria → Johan Larsson (cleaning)
  'u4': 's3', // Bjorn Larsen (maintenance)
  'u5': 's4', // Fatima → Fatima Ndiaye (guest services)
  'u7': 's2', // Anna → Anna Kowalski (inspector)
}

const C = {
  bg:     '#0a0f1a',
  card:   '#111827',
  border: '#1f2937',
  text:   '#f9fafb',
  muted:  '#6b7280',
  green:  '#16a34a',
  amber:  '#d97706',
  red:    '#dc2626',
  blue:   '#3b82f6',
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
      {label}
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 12, ...style }}>
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'denied' }) {
  const map = {
    pending:  { bg: `${C.amber}20`, color: C.amber,  label: 'Pending' },
    approved: { bg: `${C.green}20`, color: C.green,  label: 'Approved' },
    denied:   { bg: `${C.red}20`,   color: C.red,    label: 'Denied' },
  }
  const s = map[status]
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  vacation: 'Vacation',
  sick: 'Sick',
  personal: 'Personal',
  unpaid: 'Unpaid',
}

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  casual: 'Casual',
  contractor: 'Contractor',
}

export default function MyAccountPage() {
  const { user, accent } = useRole()
  const [staffId, setStaffId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'denied'>('all')
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveType, setLeaveType] = useState<LeaveType>('vacation')
  const [leaveFrom, setLeaveFrom] = useState('')
  const [leaveTo, setLeaveTo] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [localRequests, setLocalRequests] = useState<LeaveRequest[]>(LEAVE_REQUESTS)
  const [toast, setToast] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('afterstay_user')
      if (stored) {
        const u = JSON.parse(stored)
        const sid = USER_TO_STAFF[u.id as string]
        if (sid) setStaffId(sid)
      }
    } catch {}
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  if (!staffId) {
    return (
      <div style={{ color: C.muted, padding: 32, textAlign: 'center', fontSize: 14 }}>
        No staff profile found for this account.
      </div>
    )
  }

  const balance  = LEAVE_BALANCES.find(b => b.staffId === staffId)
  const contract = STAFF_CONTRACTS.find(c => c.staffId === staffId)
  const myRequests = localRequests.filter(r => r.staffId === staffId)
  const filtered = filterStatus === 'all' ? myRequests : myRequests.filter(r => r.status === filterStatus)
  const weeklyHours = getStaffWeeklyHours(staffId)
  const estPay = contract ? Math.round(weeklyHours * contract.hourlyRate) : 0

  function handleSubmitLeave(e: React.FormEvent) {
    e.preventDefault()
    if (!leaveFrom || !leaveTo) return
    const from = new Date(leaveFrom)
    const to = new Date(leaveTo)
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
    const newReq: LeaveRequest = {
      id: `lr${Date.now()}`,
      staffId: staffId!,
      staffName: contract?.staffName ?? 'Staff',
      type: leaveType,
      from: leaveFrom,
      to: leaveTo,
      days,
      reason: leaveReason || undefined,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    }
    setLocalRequests(prev => [newReq, ...prev])
    setShowLeaveForm(false)
    setLeaveFrom('')
    setLeaveTo('')
    setLeaveReason('')
    showToast('Leave request submitted successfully')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: 7,
    border: `1px solid ${C.border}`, background: '#0d1420',
    color: C.text, fontSize: 13, boxSizing: 'border-box',
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 40 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: C.green, color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          ✓ {toast}
        </div>
      )}

      {/* ── A. Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: accent, flexShrink: 0 }}>
          {contract?.staffName?.split(' ').map(p => p[0]).join('') ?? '?'}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{contract?.staffName ?? user?.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: C.muted }}>{user?.subRole ?? 'Staff'}</span>
            {contract && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, background: `${accent}20`, color: accent }}>
                {EMPLOYMENT_TYPE_LABEL[contract.employmentType]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── B. Pay Summary ── */}
      <SectionLabel label="Pay Summary" />
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'Hourly Rate',        value: contract ? `NOK ${contract.hourlyRate}` : '—' },
            { label: 'Hours This Week',    value: `${weeklyHours}h` },
            { label: 'Est. Pay This Week', value: `NOK ${estPay.toLocaleString('no-NO')}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '12px 14px', background: '#0d1420', borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>Estimated pay based on scheduled hours. Final payroll may differ.</div>
      </Card>

      {/* ── C. Leave Balances ── */}
      {balance && (
        <>
          <SectionLabel label="Leave Balances" />
          <Card>
            {[
              { label: 'Vacation', used: balance.vacationDaysUsed, total: balance.vacationDaysTotal },
              { label: 'Sick Days', used: balance.sickDaysUsed, total: balance.sickDaysTotal },
            ].map(({ label, used, total }) => {
              const pct = Math.round((used / total) * 100)
              const remaining = total - used
              return (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>{used} used · <span style={{ color: C.green, fontWeight: 600 }}>{remaining} remaining</span> / {total}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: `${C.border}`, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: pct > 80 ? C.amber : accent, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )
            })}
          </Card>
        </>
      )}

      {/* ── D. My Leave Requests ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <SectionLabel label="My Leave Requests" />
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {(['all', 'pending', 'approved', 'denied'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${filterStatus === s ? accent : C.border}`, background: filterStatus === s ? `${accent}20` : 'transparent', color: filterStatus === s ? accent : C.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: C.muted, fontSize: 13 }}>No leave requests</div>
        ) : (
          filtered.map((req, i) => (
            <div key={req.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 50px 80px', gap: 12, padding: '12px 16px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'capitalize' }}>{LEAVE_TYPE_LABEL[req.type]}</span>
              <div>
                <div style={{ fontSize: 12, color: C.text }}>{req.from} → {req.to}</div>
                {req.reason && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{req.reason}</div>}
                {req.reviewNote && <div style={{ fontSize: 11, color: C.red, marginTop: 1 }}>{req.reviewNote}</div>}
              </div>
              <span style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>{req.days}d</span>
              <StatusBadge status={req.status} />
            </div>
          ))
        )}
      </Card>

      {/* ── E. Apply for Leave ── */}
      <button
        onClick={() => setShowLeaveForm(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: `1px solid ${accent}`, background: showLeaveForm ? `${accent}20` : 'transparent', color: accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12, width: '100%', justifyContent: 'center' }}
      >
        {showLeaveForm ? '✕ Cancel' : '+ Apply for Leave'}
      </button>

      {showLeaveForm && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 14 }}>New Leave Request</div>
          <form onSubmit={handleSubmitLeave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>Type</label>
              <select value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)} style={inputStyle}>
                <option value="vacation">Vacation</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>From</label>
                <input type="date" value={leaveFrom} onChange={e => setLeaveFrom(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>To</label>
                <input type="date" value={leaveTo} onChange={e => setLeaveTo(e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 5 }}>Reason (optional)</label>
              <textarea value={leaveReason} onChange={e => setLeaveReason(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Brief reason..." />
            </div>
            <button type="submit" style={{ padding: '10px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Submit Request
            </button>
          </form>
        </Card>
      )}

      {/* ── F. My Contract ── */}
      {contract && (
        <>
          <SectionLabel label="My Contract" />
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Employment Type',  value: EMPLOYMENT_TYPE_LABEL[contract.employmentType] },
                { label: 'Start Date',       value: contract.startDate },
                { label: 'Weekly Hours',     value: `${contract.weeklyHours}h / week` },
                { label: 'Notice Period',    value: `${contract.noticePeriodDays} days` },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '10px 12px', background: '#0d1420', borderRadius: 7, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Benefits</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {contract.benefits.map(b => (
                <span key={b} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: `${accent}18`, color: accent, fontWeight: 500 }}>{b}</span>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

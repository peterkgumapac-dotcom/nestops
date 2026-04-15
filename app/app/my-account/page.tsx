'use client'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'
import { LEAVE_BALANCES, LEAVE_REQUESTS, type LeaveType, type LeaveRequest } from '@/lib/data/leave'
import { STAFF_CONTRACTS } from '@/lib/data/contracts'
import { getStaffWeeklyHours } from '@/lib/data/staffScheduling'
import { Card } from '@/components/ui/card'
import StatusBadge from '@/components/shared/StatusBadge'
import PageHeader from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Map user IDs → staff IDs (same as dashboard)
const USER_TO_STAFF: Record<string, string> = {
  'u3': 's5', // Maria → Maria Solberg (cleaner)
  'u4': 's3', // Bjorn Larsen (maintenance)
  'u5': 's4', // Fatima → Fatima Ndiaye (guest services)
  'u7': 's2', // Anna → Anna Kowalski (inspector)
}

const LEAVE_STATUS_MAP: Record<string, 'pending' | 'active' | 'cancelled'> = {
  pending: 'pending',
  approved: 'active',
  denied: 'cancelled',
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
  const { user } = useRole()
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
      <div className="text-[var(--text-muted)] p-8 text-center text-sm">
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

  return (
    <div className="max-w-[700px] mx-auto pb-10">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--status-green-fg)] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold z-[999] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          ✓ {toast}
        </div>
      )}

      {/* ── A. Header ── */}
      <PageHeader
        title={contract?.staffName ?? user?.name ?? 'My Account'}
        subtitle={
          <span className="flex items-center gap-2">
            <span>{user?.subRole ?? 'Staff'}</span>
            {contract && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)]"
              >
                {EMPLOYMENT_TYPE_LABEL[contract.employmentType]}
              </span>
            )}
          </span>
        }
      />

      {/* ── B. Pay Summary ── */}
      <div className="label-upper mb-2.5">Pay Summary</div>
      <Card className="p-4 mb-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Hourly Rate',        value: contract ? `NOK ${contract.hourlyRate}` : '—' },
            { label: 'Hours This Week',    value: `${weeklyHours}h` },
            { label: 'Est. Pay This Week', value: `NOK ${estPay.toLocaleString('no-NO')}` },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)]">
              <div className="label-upper mb-1.5">{label}</div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">{value}</div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-2.5">Estimated pay based on scheduled hours. Final payroll may differ.</div>
      </Card>

      {/* ── C. Leave Balances ── */}
      {balance && (
        <>
          <div className="label-upper mb-2.5">Leave Balances</div>
          <Card className="p-4 mb-3">
            {[
              { label: 'Vacation', used: balance.vacationDaysUsed, total: balance.vacationDaysTotal },
              { label: 'Sick Days', used: balance.sickDaysUsed, total: balance.sickDaysTotal },
            ].map(({ label, used, total }) => {
              const pct = Math.round((used / total) * 100)
              const remaining = total - used
              return (
                <div key={label} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">{label}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {used} used · <span className="text-[var(--status-green-fg)] font-semibold">{remaining} remaining</span> / {total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-[width] duration-300", pct > 80 ? 'bg-[var(--status-amber-fg)]' : 'bg-[var(--accent)]')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </Card>
        </>
      )}

      {/* ── D. My Leave Requests ── */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="label-upper">My Leave Requests</div>
        <div className="flex gap-1">
          {(['all', 'pending', 'approved', 'denied'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-colors',
                filterStatus === s
                  ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]'
                  : 'bg-transparent text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--accent-border)]'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <Card className="p-0 overflow-hidden mb-3">
        {filtered.length === 0 ? (
          <div className="py-5 px-4 text-center text-[var(--text-muted)] text-[13px]">No leave requests</div>
        ) : (
          filtered.map((req, i) => (
            <div
              key={req.id}
              className={cn(
                'grid grid-cols-[90px_1fr_50px_80px] gap-3 py-3 px-4 items-center',
                i < filtered.length - 1 && 'border-b border-[var(--border)]'
              )}
            >
              <span className="text-xs font-semibold text-[var(--text-muted)] capitalize">{LEAVE_TYPE_LABEL[req.type]}</span>
              <div>
                <div className="text-xs text-[var(--text-primary)]">{req.from} → {req.to}</div>
                {req.reason && <div className="text-[11px] text-[var(--text-muted)] mt-px">{req.reason}</div>}
                {req.reviewNote && <div className="text-[11px] text-[var(--status-red-fg)] mt-px">{req.reviewNote}</div>}
              </div>
              <span className="text-xs text-[var(--text-muted)] text-center">{req.days}d</span>
              <StatusBadge status={LEAVE_STATUS_MAP[req.status] ?? 'pending'} />
            </div>
          ))
        )}
      </Card>

      {/* ── E. Apply for Leave ── */}
      <Button
        variant="outline"
        onClick={() => setShowLeaveForm(v => !v)}
        className={cn(
          'w-full rounded-full mb-3 text-[13px] font-semibold text-[var(--accent)] border-[var(--accent)]',
          showLeaveForm && 'bg-[var(--accent-bg)]'
        )}
      >
        {showLeaveForm ? '✕ Cancel' : '+ Apply for Leave'}
      </Button>

      {showLeaveForm && (
        <Card className="p-4 mb-3">
          <div className="text-[13px] font-semibold text-[var(--text-primary)] mb-3.5">New Leave Request</div>
          <form onSubmit={handleSubmitLeave} className="flex flex-col gap-3">
            <div>
              <label className="label-upper block mb-1.5">Type</label>
              <select
                value={leaveType}
                onChange={e => setLeaveType(e.target.value as LeaveType)}
                className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[13px]"
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="label-upper block mb-1.5">From</label>
                <input
                  type="date"
                  value={leaveFrom}
                  onChange={e => setLeaveFrom(e.target.value)}
                  required
                  className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[13px]"
                />
              </div>
              <div>
                <label className="label-upper block mb-1.5">To</label>
                <input
                  type="date"
                  value={leaveTo}
                  onChange={e => setLeaveTo(e.target.value)}
                  required
                  className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[13px]"
                />
              </div>
            </div>
            <div>
              <label className="label-upper block mb-1.5">Reason (optional)</label>
              <textarea
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                rows={2}
                placeholder="Brief reason..."
                className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[13px] resize-y"
              />
            </div>
            <Button
              type="submit"
              className="rounded-full w-full text-[13px] font-semibold bg-[var(--accent)]"
            >
              Submit Request
            </Button>
          </form>
        </Card>
      )}

      {/* ── F. My Contract ── */}
      {contract && (
        <>
          <div className="label-upper mb-2.5">My Contract</div>
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-2.5 mb-3.5">
              {[
                { label: 'Employment Type',  value: EMPLOYMENT_TYPE_LABEL[contract.employmentType] },
                { label: 'Start Date',       value: contract.startDate },
                { label: 'Weekly Hours',     value: `${contract.weeklyHours}h / week` },
                { label: 'Notice Period',    value: `${contract.noticePeriodDays} days` },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border)]">
                  <div className="label-upper mb-1">{label}</div>
                  <div className="text-[13px] font-semibold text-[var(--text-primary)]">{value}</div>
                </div>
              ))}
            </div>
            <div className="label-upper mb-2">Benefits</div>
            <div className="flex flex-wrap gap-1.5">
              {contract.benefits.map(b => (
                <span
                  key={b}
                  className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[var(--accent-bg)] text-[var(--accent)]"
                >
                  {b}
                </span>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

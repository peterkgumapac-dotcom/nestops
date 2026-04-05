'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Wrench, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { useRole } from '@/context/RoleContext'

type MaintRow = {
  id: string
  date: string
  property: string
  issue: string
  cost: number | null
  currency: string
  status: 'open' | 'pending' | 'resolved'
  approval: 'pending_approval' | 'approved' | 'declined' | null
  vendor?: string
  notes?: string
}

// Simulated next check-in dates per property
const NEXT_CHECKIN: Record<string, string> = {
  'Sunset Villa':  '2026-03-19', // tomorrow → red
  'Harbor Studio': '2026-03-24', // 6 days → amber
  'Ocean View Apt': '2026-04-10',
}

function getCountdownBadge(property: string): { label: string; color: string; bg: string } | null {
  const dateStr = NEXT_CHECKIN[property]
  if (!dateStr) return null
  const today = new Date()
  const checkin = new Date(dateStr)
  const days = Math.round((checkin.getTime() - today.getTime()) / 86400000)
  if (days < 0) return null
  if (days < 2) return { label: `${days}d to check-in`, color: '#ef4444', bg: '#ef444418' }
  if (days < 7) return { label: `${days}d to check-in`, color: '#d97706', bg: '#d9770618' }
  return null
}

const INITIAL_ROWS: MaintRow[] = [
  { id: 'm1', date: '2026-03-14', property: 'Sunset Villa',  issue: 'Dishwasher not draining',         cost: null,  currency: 'NOK', status: 'open',     approval: null,               notes: 'Cleaning staff reported standing water after cycle.' },
  { id: 'm3', date: '2026-03-05', property: 'Sunset Villa',  issue: 'Broken window latch (bedroom)',   cost: 1200,  currency: 'NOK', status: 'resolved', approval: 'approved',         notes: 'Replaced latch unit.' },
  { id: 'm4', date: '2026-02-28', property: 'Harbor Studio', issue: 'Leaking kitchen tap',             cost: 2100,  currency: 'NOK', status: 'resolved', approval: 'approved',         notes: 'Washer replaced by plumber.' },
]

const APPROVAL_ROWS: MaintRow[] = [
  { id: 'm2', date: '2026-03-10', property: 'Harbor Studio', issue: 'Replace guest towel set',         cost: 890,   currency: 'NOK', status: 'pending',  approval: 'pending_approval', vendor: 'AfterStay Supply' },
  { id: 'm5', date: '2026-03-16', property: 'Sunset Villa',  issue: 'Emergency Plumbing Repair',       cost: 4800,  currency: 'NOK', status: 'pending',  approval: 'pending_approval', vendor: 'Lars Plumbing AS', notes: 'Burst pipe under kitchen sink. Immediate repair required.' },
  { id: 'm6', date: '2026-03-15', property: 'Sunset Villa',  issue: 'Replace Dishwasher',              cost: 9200,  currency: 'NOK', status: 'pending',  approval: 'pending_approval', vendor: 'Elkjøp', notes: 'Bosch SMS6ZCW00E recommended.' },
]

const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

export default function MaintenancePage() {
  const { accent } = useRole()
  const [rows, setRows] = useState<MaintRow[]>(INITIAL_ROWS)
  const [approvalRows, setApprovalRows] = useState<MaintRow[]>(APPROVAL_ROWS)
  const [selectedRow, setSelectedRow] = useState<MaintRow | null>(null)
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const [reportDrawer, setReportDrawer] = useState(false)
  const [reportTitle, setReportTitle] = useState('')
  const [reportDesc, setReportDesc] = useState('')
  const [reportPriority, setReportPriority] = useState('medium')

  const handleApprove = (id: string) => {
    setApprovalRows(prev => prev.map(r => r.id === id ? { ...r, approval: 'approved', status: 'resolved' } : r))
    setSelectedRow(null)
    showToast('Cost approved — work order confirmed')
  }

  const handleDecline = (id: string) => {
    setApprovalRows(prev => prev.map(r => r.id === id ? { ...r, approval: 'declined' } : r))
    setSelectedRow(null)
    showToast('Request declined')
  }

  const handleReportSubmit = () => {
    showToast('Issue reported — operations team notified')
    setReportDrawer(false)
    setReportTitle('')
    setReportDesc('')
    setReportPriority('medium')
  }

  const pendingApprovals = approvalRows.filter(r => r.approval === 'pending_approval')
  const resolvedApprovals = approvalRows.filter(r => r.approval !== 'pending_approval')

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Maintenance"
        subtitle="Maintenance history and cost approvals for your properties"
        action={
          <button
            onClick={() => setReportDrawer(true)}
            style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            Report Issue
          </button>
        }
      />

      {/* ── SECTION 1: Owner Approval Required ──────────────────────────────── */}
      {pendingApprovals.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Requires Your Approval — Cross-Portal
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: '#f59e0b20', color: '#f59e0b' }}>
                {pendingApprovals.length}
              </span>
            </h2>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            These maintenance items were flagged by your operator or staff and require your approval before work begins.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingApprovals.map(r => {
              const countdown = getCountdownBadge(r.property)
              return (
                <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{r.issue}</div>
                        {countdown && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: countdown.bg, color: countdown.color, whiteSpace: 'nowrap' }}>
                            {countdown.label}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {r.property} · {r.date}
                        {r.vendor && ` · Vendor: ${r.vendor}`}
                      </div>
                      {r.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>{r.notes}</div>}
                    </div>
                    {r.cost && (
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {r.cost.toLocaleString()} {r.currency}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleApprove(r.id)} style={{ flex: 1, padding: '7px', borderRadius: 7, border: 'none', background: '#059669', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Approve & Authorize
                    </button>
                    <button onClick={() => handleDecline(r.id)} style={{ flex: 1, padding: '7px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
                      Decline
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── SECTION 2: Routine Maintenance History ───────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Wrench size={14} style={{ color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Routine Maintenance</h2>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                {['Date', 'Property', 'Issue', 'Cost', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>No records found</td></tr>
              ) : rows.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{r.property}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{r.issue}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {r.cost ? `${r.cost.toLocaleString()} ${r.currency}` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Previously approved/declined */}
      {resolvedApprovals.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle size={14} style={{ color: '#10b981' }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Resolved Approvals</h2>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'Property', 'Issue', 'Cost', 'Decision'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resolvedApprovals.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < resolvedApprovals.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{r.property}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{r.issue}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {r.cost ? `${r.cost.toLocaleString()} ${r.currency}` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {r.approval === 'approved' ? (
                        <span style={{ fontSize: 12, color: '#34d399' }}>Approved</span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#f87171' }}>Declined</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AppDrawer
        open={reportDrawer}
        onClose={() => setReportDrawer(false)}
        title="Report Issue"
        subtitle="Submit a maintenance issue to the operations team"
        footer={
          <>
            <button
              onClick={() => setReportDrawer(false)}
              style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleReportSubmit}
              style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Submit Issue
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Issue Title</label>
            <input
              value={reportTitle}
              onChange={e => setReportTitle(e.target.value)}
              placeholder="e.g. Broken shower head in bathroom"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={reportDesc}
              onChange={e => setReportDesc(e.target.value)}
              placeholder="Describe the issue in detail…"
              style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Priority</label>
            <select
              value={reportPriority}
              onChange={e => setReportPriority(e.target.value)}
              style={inputStyle}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </AppDrawer>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </motion.div>
  )
}

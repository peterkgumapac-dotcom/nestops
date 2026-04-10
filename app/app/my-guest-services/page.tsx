'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Headphones, AlertTriangle, CheckCircle, DollarSign, Clock, Plus } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import IssueSheet from '@/components/guest-services/IssueSheet'
import NewIssueSheet from '@/components/guest-services/NewIssueSheet'
import { useRole } from '@/context/RoleContext'
import type { UserProfile } from '@/context/RoleContext'
import { GUEST_ISSUES, fmtNok, getActiveIssues, getAvgResolutionHrs, type GuestIssue } from '@/lib/data/guestServices'

const PROP_IMAGES: Record<string, string> = {
  p1: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80',
  p2: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=100&q=80',
  p3: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80',
  p4: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80',
  p5: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=100&q=80',
}
const getPropertyImage = (pid: string) => PROP_IMAGES[pid] ?? ''

const SEVERITY_COLOR: Record<string, string> = {
  low:      '#6b7280',
  medium:   '#d97706',
  high:     '#ef4444',
  critical: '#dc2626',
}

const STATUS_COLOR: Record<string, string> = {
  open:           '#ef4444',
  investigating:  '#d97706',
  resolved:       '#10b981',
  escalated:      '#7c3aed',
  refund_pending: '#f97316',
  refund_issued:  '#3b82f6',
  closed:         '#6b7280',
}

const STATUS_BG: Record<string, string> = {
  open:           '#ef444415',
  investigating:  '#d9770615',
  resolved:       '#10b98115',
  escalated:      '#7c3aed15',
  refund_pending: '#f9731615',
  refund_issued:  '#3b82f615',
  closed:         '#6b728015',
}

export default function MyGuestServicesPage() {
  const { accent } = useRole()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<GuestIssue | null>(null)
  const [newIssueOpen, setNewIssueOpen] = useState(false)
  const [issues, setIssues] = useState<GuestIssue[]>(GUEST_ISSUES)
  const [refundReviewIssue, setRefundReviewIssue] = useState<GuestIssue | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('afterstay_user')
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)) } catch {}
    }
  }, [])

  const staffName = currentUser?.name ?? null

  const handleStatusUpdate = (issueId: string, newStatus: string) => {
    if (!newStatus) return
    const confirmed = window.confirm(`Update status to "${newStatus.replace(/_/g, ' ')}"?`)
    if (!confirmed) return
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status: newStatus as GuestIssue['status'] } : i))
  }

  const myIssues = issues.filter(i => !staffName || i.assignedTo === staffName)
  const activeIssues = getActiveIssues(myIssues)
  const openCount = myIssues.filter(i => ['open', 'investigating', 'escalated'].includes(i.status)).length
  const pendingRefunds = myIssues.filter(i => i.refund?.status === 'pending').length
  const avgHrs = getAvgResolutionHrs(myIssues)

  // All open issues (for "Active Complaints at My Properties" section)
  const allOpenIssues = getActiveIssues(issues)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="My Guest Queue"
        subtitle="Guest issues assigned to you"
        action={
          <button
            onClick={() => setNewIssueOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: accent, color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            <Plus size={14} /> Log Issue
          </button>
        }
      />

      {/* Pulse — live guest-services events */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Pulse</span>
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontWeight: 600 }}>
              {allOpenIssues.length}
            </span>
          </div>
        </div>
        {allOpenIssues.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>No live events.</div>
        ) : (
          allOpenIssues.slice(0, 6).map((issue, i, arr) => {
            const isUrgent = issue.severity === 'high' || issue.severity === 'critical' || issue.status === 'escalated'
            const dotColor = SEVERITY_COLOR[issue.severity] ?? '#6b7280'
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 16px',
                  borderLeft: isUrgent ? '2px solid #E07A45' : '2px solid transparent',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 600 }}>{issue.guestName}</span>
                    <span style={{ color: 'var(--text-muted)' }}> — {issue.title}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>{issue.propertyName}</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: STATUS_BG[issue.status] ?? '#6b728015', color: STATUS_COLOR[issue.status] ?? '#6b7280', fontWeight: 600, flexShrink: 0, textTransform: 'capitalize' }}>
                  {issue.status.replace(/_/g, ' ')}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="My Open Issues" value={openCount} icon={Headphones} subtitle="Assigned to me" />
        <StatCard label="Pending Refunds" value={pendingRefunds} icon={DollarSign} subtitle="Awaiting review" animate={false} />
        <StatCard label="Avg Resolution" value={`${avgHrs}h`} icon={Clock} subtitle="My cases" animate={false} />
        <StatCard label="Total Assigned" value={myIssues.length} icon={CheckCircle} subtitle="All time" animate={false} />
      </div>

      {/* My Active Queue */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
          Active Queue {activeIssues.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${accent}18`, color: accent, marginLeft: 8 }}>
              {activeIssues.length}
            </span>
          )}
        </div>

        {activeIssues.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>All clear!</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No active issues assigned to you.</div>
          </div>
        ) : (
          activeIssues.map(issue => (
            <div key={issue.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '14px 16px', marginBottom: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLOR[issue.severity] ?? '#6b7280', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{issue.title}</span>
                </div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: STATUS_BG[issue.status] ?? '#6b728015', color: STATUS_COLOR[issue.status] ?? '#6b7280', fontWeight: 600, flexShrink: 0, textTransform: 'capitalize' }}>
                  {issue.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <img src={getPropertyImage(issue.propertyId)} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{issue.propertyName}</span>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>· {issue.guestName}</span>
              </div>
              {issue.refund?.requested && issue.refund.status === 'pending' && (
                <div style={{ padding: '6px 10px', borderRadius: 6, background: '#d9770610', border: '1px solid #d9770625', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#d97706' }}>Refund requested: {fmtNok(issue.refund.suggestedAmount)}</span>
                  <button
                    onClick={() => setRefundReviewIssue(refundReviewIssue?.id === issue.id ? null : issue)}
                    style={{ fontSize: 11, color: '#d97706', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {refundReviewIssue?.id === issue.id ? 'Close' : 'Review'}
                  </button>
                </div>
              )}
              {refundReviewIssue?.id === issue.id && (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Refund Details</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-subtle)' }}>Amount: </span>{fmtNok(issue.refund?.suggestedAmount ?? 0)}
                  </div>
                  {issue.refund?.notes && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-subtle)' }}>Notes: </span>{issue.refund.notes}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ color: 'var(--text-subtle)' }}>Guest: </span>{issue.guestName} — {issue.propertyName}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { handleStatusUpdate(issue.id, 'refund_issued'); setRefundReviewIssue(null) }}
                      style={{ flex: 1, padding: '5px 10px', borderRadius: 6, background: '#059669', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Approve Refund
                    </button>
                    <button
                      onClick={() => setRefundReviewIssue(null)}
                      style={{ flex: 1, padding: '5px 10px', borderRadius: 6, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 11, cursor: 'pointer' }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  defaultValue=""
                  onChange={(e) => { handleStatusUpdate(issue.id, e.target.value); e.target.value = '' }}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
                >
                  <option value="">Update Status</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalate to Operator</option>
                </select>
                <button
                  onClick={() => setSelectedIssue(issue)}
                  style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}
                >
                  View Full →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* All active issues section */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Active Complaints at My Properties</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>All open issues across the portfolio</div>
        {allOpenIssues.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, color: 'var(--text-muted)' }}>
            No open complaints.
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {allOpenIssues.map((issue, i) => (
              <div
                key={issue.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < allOpenIssues.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }}
                onClick={() => setSelectedIssue(issue)}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEVERITY_COLOR[issue.severity] ?? '#6b7280', flexShrink: 0 }} />
                <img src={getPropertyImage(issue.propertyId)} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{issue.propertyName} · {issue.guestName}</div>
                </div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: STATUS_BG[issue.status] ?? '#6b728015', color: STATUS_COLOR[issue.status] ?? '#6b7280', fontWeight: 600, flexShrink: 0, textTransform: 'capitalize' }}>
                  {issue.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Issue detail sheet */}
      {selectedIssue && (
        <IssueSheet issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}

      {/* New issue sheet */}
      {newIssueOpen && <NewIssueSheet onClose={() => setNewIssueOpen(false)} />}
    </motion.div>
  )
}

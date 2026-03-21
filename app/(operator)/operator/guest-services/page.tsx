'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Headphones, AlertTriangle, DollarSign, Clock, CheckCircle,
  TrendingUp, ChevronRight, Plus, ExternalLink, Package, CalendarClock,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import GuestServicesNav from '@/components/guest-services/GuestServicesNav'
import NewIssueSheet from '@/components/guest-services/NewIssueSheet'
import IssueSheet from '@/components/guest-services/IssueSheet'
import { useRole } from '@/context/RoleContext'
import type { UserProfile } from '@/context/RoleContext'
import {
  GUEST_ISSUES,
  getActiveIssues,
  getTotalRefunds,
  getAvgResolutionHrs,
  getPropertyHealth,
  getRedFlagProperties,
  getCategoryBreakdown,
  fmtNok,
  type GuestIssue,
} from '@/lib/data/guestServices'
import { getTodayUpsellApprovals } from '@/lib/utils/upsellCalendar'
import { UPSELL_APPROVAL_REQUESTS } from '@/lib/data/upsellApprovals'

const TODAY = '2026-03-19'

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

const CATEGORY_LABEL: Record<string, string> = {
  cleanliness:       'Cleanliness',
  maintenance:       'Maintenance',
  noise:             'Noise',
  amenity_failure:   'Amenity',
  access_issue:      'Access',
  listing_inaccuracy:'Listing',
  safety:            'Safety',
  other:             'Other',
}

const HEALTH_CONFIG = {
  good:  { color: '#10b981', label: 'Good',  bg: '#10b98115' },
  watch: { color: '#d97706', label: 'Watch', bg: '#d9770615' },
  alert: { color: '#ef4444', label: 'Alert', bg: '#ef444415' },
}

export default function GuestServicesPage() {
  const { accent } = useRole()
  const [selectedIssue, setSelectedIssue] = useState<GuestIssue | null>(null)
  const [showNewIssue, setShowNewIssue] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)) } catch {}
    }
  }, [])

  const isStaff = currentUser?.role === 'staff'
  const staffName = currentUser?.name ?? null

  const active   = getActiveIssues(GUEST_ISSUES)
  const refunds  = getTotalRefunds(GUEST_ISSUES)
  const avgHrs   = getAvgResolutionHrs(GUEST_ISSUES)
  const health   = getPropertyHealth(GUEST_ISSUES)
  const redFlags = getRedFlagProperties(GUEST_ISSUES)
  const catBreak = getCategoryBreakdown(GUEST_ISSUES)
  const resolved = GUEST_ISSUES.filter(i => i.status === 'resolved' || i.status === 'closed' || i.status === 'refund_issued')
  const resolveRate = GUEST_ISSUES.length > 0
    ? Math.round((resolved.length / GUEST_ISSUES.length) * 100)
    : 0
  const myAssigned = staffName
    ? GUEST_ISSUES.filter(i => i.assignedTo === staffName && ['open', 'investigating', 'escalated'].includes(i.status)).length
    : 0

  const catMax = Math.max(...Object.values(catBreak))
  const upsellApprovals = getTodayUpsellApprovals(TODAY)

  interface UpsellDecision { id: string; status: string; guestName?: string; upsellTitle?: string; propertyName?: string; notes?: string; decidedAt: string }
  const [upsellDecisions, setUpsellDecisions] = useState<UpsellDecision[]>([])
  const [approvalStatuses, setApprovalStatuses] = useState<Record<string, string>>(() => {
    return Object.fromEntries(UPSELL_APPROVAL_REQUESTS.map(r => [r.id, r.status]))
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nestops_upsell_decisions')
      if (raw) {
        const decisions: UpsellDecision[] = JSON.parse(raw)
        setUpsellDecisions(decisions)
        setApprovalStatuses(prev => ({
          ...prev,
          ...Object.fromEntries(decisions.map(d => [d.id, d.status])),
        }))
      }
    } catch {}
  }, [])

  const handleApproveUpsellRequest = (id: string) => {
    setApprovalStatuses(prev => ({ ...prev, [id]: 'approved' }))
  }

  const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

  return (
    <div>
      <PageHeader
        title="Guest Services"
        subtitle={`${active.length} active issues · ${GUEST_ISSUES.length} total`}
        action={
          <button
            onClick={() => setShowNewIssue(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: accent, color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={15} />
            Log Issue
          </button>
        }
      />

      <GuestServicesNav />

      {/* Red flag banner */}
      {redFlags.length > 0 && (
        <motion.div
          {...fadeIn}
          transition={{ duration: 0.25 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', marginBottom: 24,
            background: '#ef444412', border: '1px solid #ef444430',
            borderRadius: 10,
          }}
        >
          <AlertTriangle size={18} color="#ef4444" />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>
              {redFlags.length} {redFlags.length === 1 ? 'property needs' : 'properties need'} attention —&nbsp;
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {redFlags.map(p => p.propertyName).join(', ')}
            </span>
          </div>
          <Link
            href="/operator/guest-services/issues?health=alert"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#ef4444', fontWeight: 600, textDecoration: 'none' }}
          >
            View issues <ChevronRight size={13} />
          </Link>
        </motion.div>
      )}

      {/* Upsell Approval Briefing (legacy — today's calendar-triggered) */}
      {upsellApprovals.length > 0 && (
        <motion.div
          {...fadeIn}
          transition={{ duration: 0.25, delay: 0.03 }}
          style={{ marginBottom: 20 }}
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
                  borderRadius: 10,
                  padding: '12px 14px',
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
                {!signal.possible && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <button
                      style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: '1px solid #d97706', background: '#d9770614', color: '#d97706', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => {}}
                    >
                      Request Override
                    </button>
                    <button
                      style={{ flex: 1, padding: '5px 0', borderRadius: 6, border: '1px solid #dc2626', background: '#dc262614', color: '#dc2626', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => {}}
                    >
                      Decline Upsell
                    </button>
                  </div>
                )}
                {signal.possible && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      style={{ width: '100%', padding: '5px 0', borderRadius: 6, border: '1px solid #059669', background: '#05966914', color: '#059669', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => {}}
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upsell Decision Notifications (from cleaner approvals) */}
      {upsellDecisions.length > 0 && (
        <motion.div {...fadeIn} transition={{ duration: 0.2 }} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Staff Decisions
            </span>
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: '#05966920', color: '#059669', fontWeight: 600 }}>
              {upsellDecisions.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upsellDecisions.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-card)', border: `1px solid ${d.status === 'approved' ? '#05966930' : '#ef444430'}`, borderLeft: `4px solid ${d.status === 'approved' ? '#059669' : '#ef4444'}` }}>
                <span style={{ fontSize: 18 }}>{d.status === 'approved' ? '✅' : '❌'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {d.upsellTitle} — {d.propertyName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {d.guestName} · {d.status === 'approved' ? 'Approved by staff' : `Declined${d.notes ? ` — ${d.notes}` : ''}`}
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: d.status === 'approved' ? '#05966918' : '#ef444418', color: d.status === 'approved' ? '#059669' : '#ef4444', border: `1px solid ${d.status === 'approved' ? '#05966930' : '#ef444430'}`, flexShrink: 0, textTransform: 'capitalize' }}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Upsell Approvals Briefing Panel (from UPSELL_APPROVAL_REQUESTS) */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.25, delay: 0.04 }}
        style={{ marginBottom: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Package size={14} style={{ color: accent }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Upsell Approvals Briefing
          </span>
          <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: `${accent}20`, color: accent, fontWeight: 600 }}>
            {UPSELL_APPROVAL_REQUESTS.length}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
          {UPSELL_APPROVAL_REQUESTS.map(req => {
            const currentStatus = approvalStatuses[req.id] ?? req.status
            const isApproved = currentStatus === 'approved'
            const isPending  = currentStatus === 'pending_cleaner'
            return (
              <div
                key={req.id}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid var(--border)`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  borderLeft: `4px solid ${isApproved ? '#059669' : isPending ? '#d97706' : 'var(--border)'}`,
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
                  {/* Payment mode badge */}
                  {req.paymentMode === 'auth_hold' ? (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#d9770618', color: '#d97706', border: '1px solid #d9770630' }}>
                      Auth Hold
                    </span>
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#2563eb18', color: '#2563eb', border: '1px solid #2563eb30' }}>
                      Auto-Charge
                    </span>
                  )}
                  {/* Status badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
                    background: currentStatus === 'approved' ? '#05966918' : currentStatus === 'pending_cleaner' ? '#d9770618' : currentStatus === 'declined' ? '#ef444418' : currentStatus === 'charged' ? '#6366f118' : '#6b728018',
                    color: currentStatus === 'approved' ? '#059669' : currentStatus === 'pending_cleaner' ? '#d97706' : currentStatus === 'declined' ? '#ef4444' : currentStatus === 'charged' ? '#6366f1' : '#6b7280',
                    border: `1px solid ${currentStatus === 'approved' ? '#05966930' : currentStatus === 'pending_cleaner' ? '#d9770630' : currentStatus === 'declined' ? '#ef444430' : currentStatus === 'charged' ? '#6366f130' : '#6b728030'}`,
                    textTransform: 'capitalize',
                  }}>
                    {currentStatus.replace('_', ' ')}
                  </span>
                </div>

                {isPending && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() => handleApproveUpsellRequest(req.id)}
                      style={{ width: '100%', padding: '5px 0', borderRadius: 6, border: '1px solid #059669', background: '#05966914', color: '#059669', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                  </div>
                )}
                {isApproved && (
                  <div style={{ marginTop: 8, padding: '5px 8px', borderRadius: 6, background: '#05966910', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>✓ Approved</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.3, delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}
      >
        <StatCard label="Active Issues"   value={active.length}     icon={AlertTriangle} subtitle="Open + investigating + escalated" />
        {isStaff ? (
          <StatCard label="My Open Issues" value={myAssigned}        icon={Headphones}    subtitle="Assigned to me" animate={false} />
        ) : (
          <StatCard label="Total Refunds"  value={fmtNok(refunds)}   icon={DollarSign}    subtitle="Approved across all issues" animate={false} />
        )}
        <StatCard label="Avg Resolution"  value={`${avgHrs}h`}      icon={Clock}         subtitle="Mean time to resolve" animate={false} />
        <StatCard label="Resolution Rate" value={`${resolveRate}%`}  icon={CheckCircle}   subtitle="Closed / total issues" animate={false} />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Active Issues */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Active Issues</h2>
              <Link href="/operator/guest-services/issues" style={{ fontSize: 12, color: accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                View all <ChevronRight size={13} />
              </Link>
            </div>
            {active.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
                No active issues right now
              </div>
            ) : (
              <div>
                {active.map((issue, i) => (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      width: '100%', padding: '14px 20px',
                      borderBottom: i < active.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <div
                      style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                        background: SEVERITY_COLOR[issue.severity],
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {issue.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{issue.propertyName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
                        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{issue.guestName}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                          background: `${STATUS_COLOR[issue.status]}18`,
                          color: STATUS_COLOR[issue.status],
                          textTransform: 'capitalize',
                        }}
                      >
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                        {new Date(issue.reportedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Category breakdown */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.3, delay: 0.15 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Issues by Category</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(catBreak)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{CATEGORY_LABEL[cat] ?? cat}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(count / catMax) * 100}%`,
                          background: accent,
                          borderRadius: 3,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Property health grid */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.3, delay: 0.12 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Property Health</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {health.sort((a, b) => {
                const order = { alert: 0, watch: 1, good: 2 }
                return order[a.health] - order[b.health]
              }).map(p => {
                const hc = HEALTH_CONFIG[p.health]
                return (
                  <Link
                    key={p.propertyId}
                    href={`/operator/guest-services/issues?property=${encodeURIComponent(p.propertyName)}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px',
                      background: hc.bg, border: `1px solid ${hc.color}30`,
                      borderRadius: 8, textDecoration: 'none',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <div
                      style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        background: hc.color,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.propertyName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>
                        {p.issueCount} issues · {p.openCount} open · {p.avgResolutionHrs}h avg
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: hc.color }}>{hc.label}</span>
                      {p.totalRefunds > 0 && (
                        <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{fmtNok(p.totalRefunds)}</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>

          {/* Recent closed */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.3, delay: 0.18 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Recently Resolved</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resolved.slice(0, 5).map(issue => (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', padding: '6px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
                      {issue.propertyName} · {issue.resolutionTimeMinutes != null
                        ? `${Math.round(issue.resolutionTimeMinutes / 60 * 10) / 10}h`
                        : '—'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sheets */}
      {selectedIssue && (
        <IssueSheet issue={selectedIssue} onClose={() => setSelectedIssue(null)} readOnly={isStaff} />
      )}
      {showNewIssue && (
        <NewIssueSheet onClose={() => setShowNewIssue(false)} />
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Headphones, AlertTriangle, DollarSign, Clock, CheckCircle,
  TrendingUp, ChevronRight, Plus, ExternalLink,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import GuestServicesNav from '@/components/guest-services/GuestServicesNav'
import NewIssueSheet from '@/components/guest-services/NewIssueSheet'
import IssueSheet from '@/components/guest-services/IssueSheet'
import { useRole } from '@/context/RoleContext'
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

  const catMax = Math.max(...Object.values(catBreak))

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

      {/* Stats row */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.3, delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}
      >
        <StatCard label="Active Issues"      value={active.length}  icon={AlertTriangle} subtitle="Open + investigating + escalated" />
        <StatCard label="Total Refunds"      value={fmtNok(refunds)} icon={DollarSign}   subtitle="Approved across all issues" animate={false} />
        <StatCard label="Avg Resolution"     value={`${avgHrs}h`}   icon={Clock}        subtitle="Mean time to resolve" animate={false} />
        <StatCard label="Resolution Rate"    value={`${resolveRate}%`} icon={CheckCircle} subtitle="Closed / total issues" animate={false} />
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
        <IssueSheet issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
      {showNewIssue && (
        <NewIssueSheet onClose={() => setShowNewIssue(false)} />
      )}
    </div>
  )
}

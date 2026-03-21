'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Headphones, AlertTriangle, DollarSign, Clock, CheckCircle,
  ChevronRight, Plus, Activity,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
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
import { GS_FEED_SEED, type GsFeedItem, type GsFeedType } from '@/lib/data/guestServicesFeed'

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

type FeedTab = 'all' | 'upsells' | 'cleaning' | 'issues'

const FEED_UPSELL_TYPES: GsFeedType[] = ['upsell_approved', 'upsell_declined', 'early_checkin_request', 'late_checkout_request']
const FEED_CLEANING_TYPES: GsFeedType[] = ['cleaning_complete', 'issue_reported']
const FEED_ISSUE_TYPES: GsFeedType[] = ['guest_issue', 'issue_reported']

function feedDotColor(type: GsFeedType, decisionStatus?: 'approved' | 'declined') {
  if (type === 'upsell_approved') return '#059669'
  if (type === 'upsell_declined') return '#ef4444'
  if (type === 'cleaning_complete') return '#059669'
  if (type === 'issue_reported') return '#ef4444'
  if (type === 'early_checkin_request' || type === 'late_checkout_request') return '#3b82f6'
  if (type === 'guest_verified') return '#6b7280'
  if (type === 'guest_issue') return '#ef4444'
  return '#6b7280'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function GuestServicesPage() {
  const { accent } = useRole()
  const router = useRouter()
  const [selectedIssue, setSelectedIssue] = useState<GuestIssue | null>(null)
  const [showNewIssue, setShowNewIssue] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [feedTab, setFeedTab] = useState<FeedTab>('all')
  const [feedItems, setFeedItems] = useState<GsFeedItem[]>(GS_FEED_SEED)
  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  useEffect(() => {
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)) } catch {}
    }
    // Merge localStorage upsell decisions into feed
    try {
      const raw = localStorage.getItem('nestops_upsell_decisions')
      if (raw) {
        const decisions = JSON.parse(raw) as Array<{
          id: string; status: string; guestName?: string; upsellTitle?: string;
          propertyName?: string; notes?: string; decidedAt: string; cleanerName?: string
        }>
        const liveItems: GsFeedItem[] = decisions.map(d => ({
          id: `live-${d.id}`,
          type: d.status === 'approved' ? 'upsell_approved' : 'upsell_declined',
          actor: d.cleanerName ?? 'Staff',
          action: `${d.status === 'approved' ? 'approved' : 'declined'} ${d.upsellTitle ?? 'upsell'} for ${d.guestName ?? 'guest'}`,
          property: d.propertyName ?? '',
          propertyId: '',
          detail: d.notes,
          time: d.decidedAt,
          upsellDecisionStatus: d.status === 'approved' ? 'approved' : 'declined',
        }))
        setFeedItems([...liveItems, ...GS_FEED_SEED])
      }
    } catch {}
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

  const filteredFeed = useMemo(() => {
    if (feedTab === 'all') return feedItems
    if (feedTab === 'upsells') return feedItems.filter(f => FEED_UPSELL_TYPES.includes(f.type))
    if (feedTab === 'cleaning') return feedItems.filter(f => FEED_CLEANING_TYPES.includes(f.type))
    if (feedTab === 'issues') return feedItems.filter(f => FEED_ISSUE_TYPES.includes(f.type))
    return feedItems
  }, [feedItems, feedTab])

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

      {/* Live Activity Feed */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.25, delay: 0.03 }}
        style={{ marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}
      >
        {/* Feed header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={15} color={accent} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Live Activity Feed</span>
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: `${accent}18`, color: accent, fontWeight: 600 }}>
              {filteredFeed.length}
            </span>
          </div>
          {/* Tab pills */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'upsells', 'cleaning', 'issues'] as FeedTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setFeedTab(tab)}
                style={{
                  padding: '4px 12px', borderRadius: 16, border: '1px solid',
                  borderColor: feedTab === tab ? accent : 'var(--border)',
                  background: feedTab === tab ? `${accent}18` : 'transparent',
                  color: feedTab === tab ? accent : 'var(--text-muted)',
                  fontSize: 12, fontWeight: feedTab === tab ? 600 : 500,
                  cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Feed items */}
        <div>
          {filteredFeed.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
              No activity in this category yet.
            </div>
          ) : (
            filteredFeed
              .slice()
              .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
              .map((item, i) => {
                const dotColor = feedDotColor(item.type, item.upsellDecisionStatus)
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 18px',
                      borderBottom: i < filteredFeed.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    {/* Dot */}
                    <div style={{
                      width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                      background: dotColor, marginTop: 5,
                    }} />

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 500 }}>{item.actor}</span>{' '}
                        {item.action}{' '}
                        — <span style={{ fontWeight: 700 }}>{item.property}</span>
                      </div>
                      {item.detail && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>
                          {item.detail}
                        </div>
                      )}
                    </div>

                    {/* Right: time + CTA */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{fmtTime(item.time)}</span>
                      {item.type === 'upsell_approved' && (
                        <button
                          onClick={() => showToast(`Guest notified about ${item.property}`)}
                          style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${accent}`, background: `${accent}12`, color: accent, fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Notify Guest
                        </button>
                      )}
                      {item.type === 'issue_reported' && item.actionRoute && (
                        <button
                          onClick={() => router.push(item.actionRoute!)}
                          style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef444412', color: '#ef4444', fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          → Create Work Order
                        </button>
                      )}
                      {(item.type === 'early_checkin_request' || item.type === 'late_checkout_request') && item.actionRoute && (
                        <button
                          onClick={() => router.push(item.actionRoute!)}
                          style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid #3b82f6`, background: '#3b82f612', color: '#3b82f6', fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          → Review
                        </button>
                      )}
                      {item.type === 'guest_issue' && item.actionRoute && (
                        <button
                          onClick={() => router.push(item.actionRoute!)}
                          style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#ef444412', color: '#ef4444', fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          → View Issue
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
          )}
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

'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingDown, CheckCircle, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import GuestServicesNav from '@/components/guest-services/GuestServicesNav'
import IssueSheet from '@/components/guest-services/IssueSheet'
import { useRole } from '@/context/RoleContext'
import {
  GUEST_ISSUES,
  fmtNok,
  type GuestIssue,
  type RefundStatus,
} from '@/lib/data/guestServices'

type SortKey = 'issuedAt' | 'approvedAmount' | 'propertyName' | 'status'

const STATUS_COLOR: Record<RefundStatus, string> = {
  pending:  '#d97706',
  approved: '#6366f1',
  issued:   '#10b981',
  declined: '#6b7280',
}

export default function RefundsPage() {
  const { accent } = useRole()
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('all')
  const [sortKey, setSortKey]   = useState<SortKey>('issuedAt')
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<GuestIssue | null>(null)

  const refundIssues = GUEST_ISSUES.filter(i => i.refund?.requested)

  const filtered = refundIssues
    .filter(i => {
      if (statusFilter !== 'all' && i.refund?.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          i.title.toLowerCase().includes(q) ||
          i.guestName.toLowerCase().includes(q) ||
          i.propertyName.toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === 'approvedAmount') cmp = (a.refund?.approvedAmount ?? 0) - (b.refund?.approvedAmount ?? 0)
      else if (sortKey === 'propertyName') cmp = a.propertyName.localeCompare(b.propertyName)
      else if (sortKey === 'status') cmp = (a.refund?.status ?? '').localeCompare(b.refund?.status ?? '')
      else cmp = (a.refund?.issuedAt ?? a.reportedAt).localeCompare(b.refund?.issuedAt ?? b.reportedAt)
      return sortDir === 'asc' ? cmp : -cmp
    })

  const totalApproved  = refundIssues.reduce((s, i) => s + (i.refund?.approvedAmount ?? 0), 0)
  const totalPending   = refundIssues.filter(i => i.refund?.status === 'pending').reduce((s, i) => s + (i.refund?.suggestedAmount ?? 0), 0)
  const totalIssued    = refundIssues.filter(i => i.refund?.status === 'issued').length
  const pendingCount   = refundIssues.filter(i => i.refund?.status === 'pending').length

  // By-property totals
  const byProperty: Record<string, number> = {}
  for (const issue of refundIssues) {
    if (issue.refund?.approvedAmount) {
      byProperty[issue.propertyName] = (byProperty[issue.propertyName] ?? 0) + issue.refund.approvedAmount
    }
  }
  const propMax = Math.max(...Object.values(byProperty), 1)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} style={{ opacity: 0.3 }} />

  return (
    <div>
      <PageHeader
        title="Refunds"
        subtitle={`${refundIssues.length} refund requests · ${fmtNok(totalApproved)} total approved`}
      />

      <GuestServicesNav />

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}
      >
        <StatCard label="Total Refunded"   value={fmtNok(totalApproved)} icon={DollarSign}   subtitle="All approved amounts" animate={false} />
        <StatCard label="Pending Approval" value={fmtNok(totalPending)}  icon={Clock}        subtitle={`${pendingCount} awaiting decision`} animate={false} />
        <StatCard label="Refunds Issued"   value={totalIssued}           icon={CheckCircle}  subtitle="Successfully processed" />
        <StatCard label="Avg Refund"       value={fmtNok(Math.round(totalApproved / Math.max(refundIssues.filter(i => i.refund?.approvedAmount).length, 1)))} icon={TrendingDown} subtitle="Per incident" animate={false} />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        {/* Table */}
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                style={{
                  width: '100%', padding: '8px 12px 8px 32px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              style={{
                padding: '8px 12px', background: 'var(--bg-card)',
                border: `1px solid ${statusFilter !== 'all' ? accent : 'var(--border)'}`,
                borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="issued">Issued</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {([
                      ['Issue', null],
                      ['Property', 'propertyName'],
                      ['Guest', null],
                      ['Type', null],
                      ['Amount', 'approvedAmount'],
                      ['Status', 'status'],
                      ['Date', 'issuedAt'],
                    ] as [string, SortKey | null][]).map(([label, key]) => (
                      <th
                        key={label}
                        onClick={() => key && toggleSort(key)}
                        style={{
                          padding: '10px 14px', textAlign: 'left',
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                          color: 'var(--text-subtle)', textTransform: 'uppercase',
                          cursor: key ? 'pointer' : 'default', whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {label}
                          {key && <SortIcon k={key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
                        No refunds match the current filters.
                      </td>
                    </tr>
                  ) : filtered.map((issue, i) => (
                    <tr
                      key={issue.id}
                      onClick={() => setSelected(issue)}
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        cursor: 'pointer', transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 14px', maxWidth: 200 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {issue.title}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {issue.propertyName}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {issue.guestName}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-subtle)' }}>
                        {issue.refund?.refundType?.replace(/_/g, ' ') ?? '—'}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {issue.refund?.approvedAmount ? fmtNok(issue.refund.approvedAmount) : '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {issue.refund?.status && (
                          <span
                            style={{
                              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                              background: `${STATUS_COLOR[issue.refund.status]}18`,
                              color: STATUS_COLOR[issue.refund.status],
                              textTransform: 'capitalize', whiteSpace: 'nowrap',
                            }}
                          >
                            {issue.refund.status}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                        {issue.refund?.issuedAt
                          ? new Date(issue.refund.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* By property */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', height: 'fit-content' }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Refunds by Property</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(byProperty)
              .sort((a, b) => b[1] - a[1])
              .map(([propName, total]) => (
                <div key={propName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{propName}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>{fmtNok(total)}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3 }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(total / propMax) * 100}%`,
                        background: accent, borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 10 }}>By Channel</div>
            {(['airbnb', 'booking_com', 'stripe', 'manual'] as const).map(ch => {
              const chTotal = refundIssues
                .filter(i => i.refund?.issuedVia === ch && i.refund?.approvedAmount)
                .reduce((s, i) => s + (i.refund?.approvedAmount ?? 0), 0)
              if (!chTotal) return null
              return (
                <div key={ch} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)', textTransform: 'capitalize' }}>
                    {ch === 'booking_com' ? 'Booking.com' : ch.charAt(0).toUpperCase() + ch.slice(1)}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{fmtNok(chTotal)}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {selected && <IssueSheet issue={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

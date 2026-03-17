'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronUp, ChevronDown, X, Plus } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import GuestServicesNav from '@/components/guest-services/GuestServicesNav'
import IssueSheet from '@/components/guest-services/IssueSheet'
import NewIssueSheet from '@/components/guest-services/NewIssueSheet'
import { useRole } from '@/context/RoleContext'
import {
  GUEST_ISSUES,
  fmtNok,
  type GuestIssue,
  type IssueCategory,
  type IssueSeverity,
  type IssueStatus,
} from '@/lib/data/guestServices'

type SortKey = 'reportedAt' | 'severity' | 'status' | 'propertyName' | 'guestName'

const SEVERITY_ORDER: Record<IssueSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
const STATUS_ORDER: Record<IssueStatus, number> = {
  escalated: 0, open: 1, investigating: 2,
  refund_pending: 3, refund_issued: 4, resolved: 5, closed: 6,
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

const CATEGORY_LABEL: Record<string, string> = {
  cleanliness:        'Cleanliness',
  maintenance:        'Maintenance',
  noise:              'Noise',
  amenity_failure:    'Amenity',
  access_issue:       'Access',
  listing_inaccuracy: 'Listing',
  safety:             'Safety',
  other:              'Other',
}

const ALL_STATUSES: IssueStatus[] = ['open','investigating','escalated','refund_pending','refund_issued','resolved','closed']
const ALL_SEVERITIES: IssueSeverity[] = ['critical','high','medium','low']
const ALL_CATEGORIES: IssueCategory[] = ['cleanliness','maintenance','noise','amenity_failure','access_issue','listing_inaccuracy','safety','other']

export default function IssuesPage() {
  const { accent } = useRole()
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState<IssueStatus | 'all'>('all')
  const [severityFilter, setSeverity] = useState<IssueSeverity | 'all'>('all')
  const [categoryFilter, setCategory] = useState<IssueCategory | 'all'>('all')
  const [sortKey, setSortKey]       = useState<SortKey>('reportedAt')
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('desc')
  const [page, setPage]             = useState(1)
  const [selectedIssue, setSelected] = useState<GuestIssue | null>(null)
  const [showNew, setShowNew]       = useState(false)
  const PER_PAGE = 10

  const filtered = useMemo(() => {
    return GUEST_ISSUES
      .filter(i => {
        if (statusFilter   !== 'all' && i.status !== statusFilter) return false
        if (severityFilter !== 'all' && i.severity !== severityFilter) return false
        if (categoryFilter !== 'all' && i.category !== categoryFilter) return false
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
        if (sortKey === 'reportedAt') cmp = a.reportedAt.localeCompare(b.reportedAt)
        else if (sortKey === 'severity') cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
        else if (sortKey === 'status')   cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
        else if (sortKey === 'propertyName') cmp = a.propertyName.localeCompare(b.propertyName)
        else if (sortKey === 'guestName')    cmp = a.guestName.localeCompare(b.guestName)
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [search, statusFilter, severityFilter, categoryFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} style={{ opacity: 0.3 }} />

  const hasFilters = statusFilter !== 'all' || severityFilter !== 'all' || categoryFilter !== 'all' || search

  return (
    <div>
      <PageHeader
        title="All Issues"
        subtitle={`${filtered.length} of ${GUEST_ISSUES.length} issues`}
        action={
          <button
            onClick={() => setShowNew(true)}
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

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search issues, guests, properties..."
            style={{
              width: '100%', padding: '8px 12px 8px 32px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 13, color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {([
          ['Status', 'all', ALL_STATUSES, statusFilter, setStatus],
          ['Severity', 'all', ALL_SEVERITIES, severityFilter, setSeverity],
          ['Category', 'all', ALL_CATEGORIES, categoryFilter, setCategory],
        ] as const).map(([label, allVal, options, val, setter]: any) => (
          <select
            key={label}
            value={val}
            onChange={e => { setter(e.target.value as any); setPage(1) }}
            style={{
              padding: '8px 12px', background: 'var(--bg-card)',
              border: `1px solid ${val !== 'all' ? accent : 'var(--border)'}`,
              borderRadius: 8, fontSize: 13, color: 'var(--text-primary)',
              cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="all">All {label}s</option>
            {options.map((o: string) => (
              <option key={o} value={o}>{(CATEGORY_LABEL[o] ?? o).replace(/_/g, ' ')}</option>
            ))}
          </select>
        ))}

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setStatus('all'); setSeverity('all'); setCategory('all'); setPage(1) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 12px', background: 'var(--bg-elevated)',
              border: '1px solid var(--border)', borderRadius: 8,
              fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {([
                  ['Title', null],
                  ['Property', 'propertyName'],
                  ['Guest', 'guestName'],
                  ['Category', null],
                  ['Severity', 'severity'],
                  ['Status', 'status'],
                  ['Reported', 'reportedAt'],
                  ['Refund', null],
                ] as [string, SortKey | null][]).map(([label, key]) => (
                  <th
                    key={label}
                    onClick={() => key && toggleSort(key)}
                    style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                      color: 'var(--text-subtle)', textTransform: 'uppercase',
                      cursor: key ? 'pointer' : 'default',
                      whiteSpace: 'nowrap', userSelect: 'none',
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
                    No issues match the current filters.
                  </td>
                </tr>
              ) : paginated.map((issue, i) => (
                <tr
                  key={issue.id}
                  onClick={() => setSelected(issue)}
                  style={{
                    borderBottom: i < paginated.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    cursor: 'pointer', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 14px', maxWidth: 240 }}>
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
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                      {CATEGORY_LABEL[issue.category] ?? issue.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
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
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: `${STATUS_COLOR[issue.status]}18`,
                        color: STATUS_COLOR[issue.status],
                        textTransform: 'capitalize', whiteSpace: 'nowrap',
                      }}
                    >
                      {issue.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                    {new Date(issue.reportedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {issue.refund?.approvedAmount ? fmtNok(issue.refund.approvedAmount) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderTop: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
              Page {page} of {totalPages} · {filtered.length} results
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 30, height: 30, borderRadius: 6, border: '1px solid',
                    borderColor: p === page ? accent : 'var(--border)',
                    background: p === page ? `${accent}18` : 'transparent',
                    color: p === page ? accent : 'var(--text-muted)',
                    fontSize: 12, fontWeight: p === page ? 700 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {selectedIssue && <IssueSheet issue={selectedIssue} onClose={() => setSelected(null)} />}
      {showNew && <NewIssueSheet onClose={() => setShowNew(false)} />}
    </div>
  )
}

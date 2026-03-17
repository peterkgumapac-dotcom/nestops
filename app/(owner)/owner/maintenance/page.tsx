'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { useRole } from '@/context/RoleContext'

type MaintFilter = 'all' | 'open' | 'resolved' | 'pending_approval'

const ROWS = [
  { id: 'm1', date: '2026-03-14', property: 'Sunset Villa',  issue: 'Dishwasher not draining',      cost: null,  currency: 'NOK', status: 'open'             as const, approval: null },
  { id: 'm2', date: '2026-03-10', property: 'Harbor Studio', issue: 'Replace guest towel set',       cost: 890,   currency: 'NOK', status: 'pending'          as const, approval: 'pending_approval' as const },
  { id: 'm3', date: '2026-03-05', property: 'Sunset Villa',  issue: 'Broken window latch (bedroom)', cost: 1200,  currency: 'NOK', status: 'resolved'         as const, approval: 'approved' as const },
  { id: 'm4', date: '2026-02-28', property: 'Harbor Studio', issue: 'Leaking kitchen tap',           cost: 2100,  currency: 'NOK', status: 'resolved'         as const, approval: 'approved' as const },
]

const PILLS: { key: MaintFilter; label: string }[] = [
  { key: 'all',              label: 'All' },
  { key: 'open',             label: 'Open' },
  { key: 'resolved',         label: 'Resolved' },
  { key: 'pending_approval', label: 'Pending Approval' },
]

export default function MaintenancePage() {
  const { accent } = useRole()
  const [filter, setFilter] = useState<MaintFilter>('all')

  const filtered = ROWS.filter(r => {
    if (filter === 'all')              return true
    if (filter === 'open')             return r.status === 'open'
    if (filter === 'resolved')         return r.status === 'resolved'
    if (filter === 'pending_approval') return r.approval === 'pending_approval'
    return true
  })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Maintenance"
        subtitle="Maintenance and repair history for your properties"
        action={
          <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Report Issue
          </button>
        }
      />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {PILLS.map(p => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${filter === p.key ? accent : 'var(--border)'}`, background: filter === p.key ? `${accent}1a` : 'transparent', color: filter === p.key ? accent : 'var(--text-muted)' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
              {['Date', 'Property', 'Issue', 'Cost', 'Status', 'Approval'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>No records found</td>
              </tr>
            ) : filtered.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <td style={{ padding: '12px 16px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{r.date}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{r.property}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{r.issue}</td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {r.cost ? `${r.cost.toLocaleString()} ${r.currency}` : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  {r.approval === 'pending_approval' ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#059669', color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
                      <button style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Decline</button>
                    </div>
                  ) : r.approval === 'approved' ? (
                    <span style={{ fontSize: 12, color: '#34d399' }}>Approved</span>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

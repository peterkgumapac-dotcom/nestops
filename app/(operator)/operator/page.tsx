'use client'
import Link from 'next/link'
import { Building2, Users, Ticket, Package, AlertTriangle, Headphones, ChevronRight } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import DataTable from '@/components/shared/DataTable'
import type { Column } from '@/components/shared/DataTable'
import { REQUESTS } from '@/lib/data/requests'
import { OWNERS } from '@/lib/data/owners'
import { PROPERTIES } from '@/lib/data/properties'
import { STOCK_ITEMS } from '@/lib/data/inventory'
import { GUEST_ISSUES, getActiveIssues, getTotalRefunds, getRedFlagProperties, fmtNok } from '@/lib/data/guestServices'
import { useRole } from '@/context/RoleContext'

const recentRequests = REQUESTS.slice(0, 5).map(r => ({
  ...r,
  propertyName: PROPERTIES.find(p => p.id === r.propertyId)?.name ?? r.propertyId,
  ownerName: OWNERS.find(o => o.id === r.ownerId)?.name ?? r.ownerId,
}))

type RequestRow = typeof recentRequests[0]

export default function OperatorDashboard() {
  const { accent } = useRole()

  const columns: Column<RequestRow>[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'type', label: 'Type', render: r => <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)', fontSize: 13 }}>{r.type}</span> },
    { key: 'propertyName', label: 'Property', sortable: true },
    { key: 'ownerName', label: 'Owner', sortable: true },
    { key: 'date', label: 'Date', sortable: true, render: r => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.date}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'priority', label: 'Priority', render: r => <StatusBadge status={r.priority} /> },
  ]

  const lowStock   = STOCK_ITEMS.filter(i => i.status === 'low' || i.status === 'critical' || i.status === 'out')
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const totalRefunds = getTotalRefunds(GUEST_ISSUES)
  const redFlags     = getRedFlagProperties(GUEST_ISSUES)

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Operations overview" />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Properties" value={PROPERTIES.length} icon={Building2} subtitle="Across all owners" />
        <StatCard label="Active Owners" value={OWNERS.filter(o => o.status === 'active').length} icon={Users} subtitle="Currently managing" />
        <StatCard label="Open Requests" value={REQUESTS.filter(r => r.status === 'open').length} icon={Ticket} subtitle="Awaiting action" />
        <StatCard label="Low Stock Items" value={lowStock.length} icon={Package} subtitle="Needs restocking" />
        <StatCard label="Active Issues" value={activeIssues.length} icon={Headphones} subtitle="Guest issues open" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Recent requests table */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Requests</h2>
            <a href="/operator/tickets" style={{ fontSize: 13, color: accent, textDecoration: 'none' }}>View all →</a>
          </div>
          <DataTable columns={columns} data={recentRequests} />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Owners summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Owners</h3>
            {OWNERS.map(owner => (
              <div key={owner.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: accent, flexShrink: 0 }}>
                  {owner.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{owner.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{owner.propertyIds.length} {owner.propertyIds.length === 1 ? 'property' : 'properties'}</div>
                </div>
                <StatusBadge status={owner.status} />
              </div>
            ))}
          </div>

          {/* Low stock */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <AlertTriangle size={14} style={{ color: '#f87171' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Low Stock</h3>
            </div>
            {lowStock.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.inStock} / {item.minLevel} {item.unit}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>

          {/* Guest Services widget */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Headphones size={14} style={{ color: accent }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Guest Issues</h3>
              </div>
              <Link href="/operator/guest-services" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: accent, textDecoration: 'none' }}>
                View <ChevronRight size={12} />
              </Link>
            </div>

            {redFlags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#ef444412', border: '1px solid #ef444430', borderRadius: 7, marginBottom: 10 }}>
                <AlertTriangle size={13} color="#ef4444" />
                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                  {redFlags.length} {redFlags.length === 1 ? 'property' : 'properties'} flagged
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Active issues', value: activeIssues.length, color: activeIssues.length > 3 ? '#ef4444' : 'var(--text-primary)' },
                { label: 'Total refunded', value: fmtNok(totalRefunds), color: 'var(--text-primary)' },
                { label: 'Flagged properties', value: redFlags.length, color: redFlags.length > 0 ? '#ef4444' : '#10b981' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

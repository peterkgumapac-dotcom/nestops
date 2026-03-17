'use client'
import { Building2, Users, Ticket, Package, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import DataTable from '@/components/shared/DataTable'
import type { Column } from '@/components/shared/DataTable'
import { REQUESTS } from '@/lib/data/requests'
import { OWNERS } from '@/lib/data/owners'
import { PROPERTIES } from '@/lib/data/properties'
import { STOCK_ITEMS } from '@/lib/data/inventory'
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

  const lowStock = STOCK_ITEMS.filter(i => i.status === 'low' || i.status === 'critical' || i.status === 'out')

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Operations overview" />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Properties" value={PROPERTIES.length} icon={Building2} subtitle="Across all owners" />
        <StatCard label="Active Owners" value={OWNERS.filter(o => o.status === 'active').length} icon={Users} subtitle="Currently managing" />
        <StatCard label="Open Requests" value={REQUESTS.filter(r => r.status === 'open').length} icon={Ticket} subtitle="Awaiting action" />
        <StatCard label="Low Stock Items" value={lowStock.length} icon={Package} subtitle="Needs restocking" />
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
        </div>
      </div>
    </div>
  )
}

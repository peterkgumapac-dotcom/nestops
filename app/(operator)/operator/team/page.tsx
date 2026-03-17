'use client'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import DataTable from '@/components/shared/DataTable'
import type { Column } from '@/components/shared/DataTable'
import { STAFF_MEMBERS } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'

type StaffRow = { id: string; name: string; initials: string; role: string; properties: string; status: string }

export default function TeamPage() {
  const { accent } = useRole()

  const rows: StaffRow[] = STAFF_MEMBERS.map(s => ({
    id: s.id,
    name: s.name,
    initials: s.initials,
    role: s.role,
    properties: PROPERTIES.filter(p => s.assignedPropertyIds.includes(p.id)).map(p => p.name).join(', '),
    status: s.status,
  }))

  const columns: Column<StaffRow>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: r => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: accent, flexShrink: 0 }}>
            {r.initials}
          </div>
          <span>{r.name}</span>
        </div>
      ),
    },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'properties', label: 'Assigned Properties', render: r => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.properties}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status as 'active' | 'inactive'} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Staff and team management"
        action={<button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add Member</button>}
      />
      <DataTable columns={columns} data={rows} />
    </div>
  )
}

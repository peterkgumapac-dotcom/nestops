'use client'
import { Layers, Building2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'

const GROUPS = [
  { id: 'gr1', name: 'Oslo Portfolio', color: 'var(--status-accent)', propertyIds: ['p1', 'p4'] },
  { id: 'gr2', name: 'Coastal Properties', color: '#059669', propertyIds: ['p2', 'p3'] },
  { id: 'gr3', name: 'Mountain & Nature', color: 'var(--status-warning)', propertyIds: ['p5'] },
]

export default function PropertyGroupsPage() {
  const { accent } = useRole()

  return (
    <div>
      <PageHeader
        title="Property Groups"
        subtitle="Organize properties into groups"
        action={<button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>New Group</button>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {GROUPS.map(group => {
          const props = PROPERTIES.filter(p => group.propertyIds.includes(p.id))
          return (
            <div key={group.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, transition: 'transform 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${group.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={18} style={{ color: group.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{group.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{props.length} properties</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {props.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: 'var(--bg-elevated)' }}>
                    <Building2 size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{p.city}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'
import { Building2, MapPin, Bed, Bath } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { useRole } from '@/context/RoleContext'

export default function PropertiesPage() {
  const { accent } = useRole()
  const router = useRouter()

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle="All managed properties"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => router.push('/operator/properties/onboard')}
              style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${accent}`, background: 'transparent', color: accent, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Onboard Property
            </button>
            <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add Property</button>
          </div>
        }
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {PROPERTIES.map(prop => {
          const owner = OWNERS.find(o => o.id === prop.ownerId)
          return (
            <div key={prop.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {/* Photo */}
              {prop.imageUrl ? (
                <img src={prop.imageUrl} alt={prop.name} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ height: 140, background: `linear-gradient(135deg, ${accent}22, ${accent}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={40} style={{ color: accent, opacity: 0.5 }} strokeWidth={1} />
                </div>
              )}
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{prop.name}</div>
                  <StatusBadge status={prop.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  <MapPin size={11} />
                  {prop.address}, {prop.city}
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Bed size={12} /> {prop.beds} beds</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Bath size={12} /> {prop.baths} baths</span>
                </div>
                {owner && <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Owner: {owner.name}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

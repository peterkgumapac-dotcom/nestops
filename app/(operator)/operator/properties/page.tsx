'use client'
import { Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import PropertyCard from '@/components/shared/PropertyCard'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { COMPLIANCE_DOCS } from '@/lib/data/compliance'
import { useRole } from '@/context/RoleContext'

function getComplianceDot(propertyId: string): { color: string; title: string } {
  const docs = COMPLIANCE_DOCS.filter(d => d.propertyId === propertyId)
  if (docs.some(d => d.status === 'expired' || d.status === 'missing')) {
    return { color: '#ef4444', title: 'Expired or missing compliance documents' }
  }
  if (docs.some(d => d.status === 'expiring')) {
    return { color: '#d97706', title: 'Compliance documents expiring soon' }
  }
  return { color: '#10b981', title: 'All compliance documents valid' }
}

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
            <button onClick={() => router.push('/operator/properties/onboard')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add Property</button>
          </div>
        }
      />
      {PROPERTIES.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Building2 size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>No properties yet</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Add your first property to get started</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {PROPERTIES.map(prop => {
            const owner = OWNERS.find(o => o.id === prop.ownerId)
            const dot = getComplianceDot(prop.id)
            return (
              <div key={prop.id} style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <PropertyCard
                  property={{
                    id: prop.id,
                    name: prop.name,
                    location: `${prop.address}, ${prop.city}`,
                    bedrooms: prop.beds,
                    baths: prop.baths,
                    imageUrl: prop.imageUrl,
                    status: prop.status,
                  }}
                  accent={accent}
                  href={`/operator/properties/${prop.id}`}
                  onClick={() => router.push(`/operator/properties/${prop.id}`)}
                  noShell
                />
                {owner && (
                  <div style={{ padding: '0 16px 12px', fontSize: 12, color: 'var(--text-subtle)' }}>
                    Owner: {owner.name}
                  </div>
                )}
                {/* Compliance status dot */}
                <div
                  title={dot.title}
                  style={{
                    position: 'absolute', bottom: 12, right: 12,
                    width: 10, height: 10, borderRadius: '50%',
                    background: dot.color,
                    border: '2px solid var(--bg-card)',
                    boxShadow: `0 0 0 1px ${dot.color}40`,
                  }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

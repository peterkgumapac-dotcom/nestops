'use client'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import PageHeader from '@/components/shared/PageHeader'
import PropertyCard from '@/components/shared/PropertyCard'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { PROPERTY_LIBRARIES } from '@/lib/data/propertyLibrary'
import { useRole } from '@/context/RoleContext'

function CompletionBar({ score, accent }: { score: number; accent: string }) {
  const color = score >= 80 ? '#34d399' : score >= 50 ? accent : '#f87171'
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Library completion</span>
        <span style={{ fontSize: 11, fontWeight: 600, color }}>{score}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

export default function AppPropertiesPage() {
  const { accent } = useRole()
  const router = useRouter()

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Properties"
        subtitle="All managed properties"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => router.push('/app/properties/onboard')}
              style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${accent}`, background: 'transparent', color: accent, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Onboard Property
            </button>
            <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add Property</button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {PROPERTIES.map((prop, i) => {
          const owner = OWNERS.find(o => o.id === prop.ownerId)
          const library = PROPERTY_LIBRARIES.find(l => l.propertyId === prop.id)
          const score = library?.completionScore ?? 0
          return (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }}
              whileHover={{ y: -2 }}
            >
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
                href={`/app/properties/${prop.id}/library`}
                noShell
              />
              <div style={{ padding: '0 16px 16px' }}>
                {owner && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 4 }}>Owner: {owner.name}</div>}
                <CompletionBar score={score} accent={accent} />
                <Link
                  href={`/app/properties/${prop.id}/library`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 12, padding: '7px 0', borderRadius: 7, background: `${accent}12`, color: accent, fontSize: 12, fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s' }}
                >
                  View Library <ChevronRight size={13} />
                </Link>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

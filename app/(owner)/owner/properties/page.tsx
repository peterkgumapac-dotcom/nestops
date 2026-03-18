'use client'
import { motion } from 'framer-motion'
import PageHeader from '@/components/shared/PageHeader'
import PropertyCard from '@/components/shared/PropertyCard'
import { PROPERTIES } from '@/lib/data/properties'
import { COMPLIANCE_DOCS } from '@/lib/data/compliance'
import { useRole } from '@/context/RoleContext'

const MY_PROPERTIES = PROPERTIES.filter(p => p.ownerId === 'o1')

function getComplianceIndicator(propertyId: string) {
  const docs = COMPLIANCE_DOCS.filter(d => d.propertyId === propertyId)
  if (docs.some(d => d.status === 'expired' || d.status === 'missing')) {
    return { color: '#ef4444', label: 'Action needed' }
  }
  if (docs.some(d => d.status === 'expiring')) {
    return { color: '#f59e0b', label: 'Expiring soon' }
  }
  if (docs.length === 0) return null
  return { color: '#10b981', label: 'Compliant' }
}

export default function OwnerPropertiesPage() {
  const { accent } = useRole()
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="My Properties" subtitle="Your property portfolio" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {MY_PROPERTIES.map(prop => {
          const compliance = getComplianceIndicator(prop.id)
          return (
            <PropertyCard
              key={prop.id}
              property={{
                id: prop.id,
                name: prop.name,
                location: `${prop.address}, ${prop.city}`,
                bedrooms: prop.beds,
                baths: prop.baths,
                imageUrl: prop.imageUrl,
                status: prop.status,
                complianceStatus: compliance,
              }}
              accent={accent}
              href={`/owner/properties/${prop.id}`}
              showCompliance
            />
          )
        })}
      </div>
    </motion.div>
  )
}

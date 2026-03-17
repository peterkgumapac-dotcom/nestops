'use client'
import { Building2, MapPin, Bed, Bath } from 'lucide-react'
import { motion } from 'framer-motion'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'

const MY_PROPERTIES = PROPERTIES.filter(p => p.ownerId === 'o1')

export default function OwnerPropertiesPage() {
  const { accent } = useRole()
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="My Properties" subtitle="Your property portfolio" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {MY_PROPERTIES.map(prop => (
          <div
            key={prop.id}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {prop.imageUrl ? (
              <img src={prop.imageUrl} alt={prop.name} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ height: 140, background: `linear-gradient(135deg, ${accent}22, ${accent}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={36} style={{ color: accent, opacity: 0.4 }} strokeWidth={1} />
              </div>
            )}
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{prop.name}</span>
                <StatusBadge status={prop.status} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                <MapPin size={11} /> {prop.address}, {prop.city}
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Bed size={12} /> {prop.beds} beds</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Bath size={12} /> {prop.baths} baths</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

'use client'
import { Wrench, Phone, Star } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { useRole } from '@/context/RoleContext'

const CONTRACTORS = [
  { id: 'c1', name: 'Lars Plumbing AS', specialty: 'Plumbing', phone: '+47 900 12 345', email: 'lars@plumbing.no', rating: 4.8, status: 'active' as const },
  { id: 'c2', name: 'Elcon Electricians', specialty: 'Electrical', phone: '+47 900 23 456', email: 'contact@elcon.no', rating: 4.9, status: 'active' as const },
  { id: 'c3', name: 'CleanPro Bergen', specialty: 'Cleaning', phone: '+47 900 34 567', email: 'info@cleanpro.no', rating: 4.6, status: 'active' as const },
  { id: 'c4', name: 'Nordic HVAC', specialty: 'HVAC', phone: '+47 900 45 678', email: 'service@nordichvac.no', rating: 4.7, status: 'active' as const },
  { id: 'c5', name: 'Tømrer Hansen', specialty: 'Carpentry', phone: '+47 900 56 789', email: 'hansen@tomrer.no', rating: 4.5, status: 'inactive' as const },
]

export default function ContractorsPage() {
  const { accent } = useRole()

  return (
    <div>
      <PageHeader
        title="Contractors"
        subtitle="Vendor and contractor directory"
        action={<button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add Contractor</button>}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {CONTRACTORS.map(c => (
          <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, transition: 'transform 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wrench size={18} style={{ color: accent }} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.specialty}</div>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              <Phone size={11} /> {c.phone}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{c.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.rating}</span>
              <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>/ 5.0</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

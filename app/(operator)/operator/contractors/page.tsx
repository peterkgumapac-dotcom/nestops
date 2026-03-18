'use client'
import { useState } from 'react'
import { Wrench, Phone, Star } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { useRole } from '@/context/RoleContext'

interface Contractor {
  id: string
  name: string
  specialty: string
  phone: string
  email: string
  rating: number
  status: 'active' | 'inactive'
}

const INITIAL_CONTRACTORS: Contractor[] = [
  { id: 'c1', name: 'Lars Plumbing AS', specialty: 'Plumbing', phone: '+47 900 12 345', email: 'lars@plumbing.no', rating: 4.8, status: 'active' },
  { id: 'c2', name: 'Elcon Electricians', specialty: 'Electrical', phone: '+47 900 23 456', email: 'contact@elcon.no', rating: 4.9, status: 'active' },
  { id: 'c3', name: 'CleanPro Bergen', specialty: 'Cleaning', phone: '+47 900 34 567', email: 'info@cleanpro.no', rating: 4.6, status: 'active' },
  { id: 'c4', name: 'Nordic HVAC', specialty: 'HVAC', phone: '+47 900 45 678', email: 'service@nordichvac.no', rating: 4.7, status: 'active' },
  { id: 'c5', name: 'Tømrer Hansen', specialty: 'Carpentry', phone: '+47 900 56 789', email: 'hansen@tomrer.no', rating: 4.5, status: 'inactive' },
]

const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }

export default function ContractorsPage() {
  const { accent } = useRole()
  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS)
  const [addDrawer, setAddDrawer] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleSave = () => {
    if (!newName.trim()) return
    const id = 'c' + (contractors.length + 1)
    setContractors(prev => [...prev, { id, name: newName.trim(), specialty: newSpecialty.trim() || 'General', phone: newPhone.trim(), email: newEmail.trim(), rating: 5.0, status: 'active' }])
    setNewName(''); setNewSpecialty(''); setNewPhone(''); setNewEmail('')
    setAddDrawer(false)
    showToast('Contractor added')
  }

  return (
    <div>
      <PageHeader
        title="Contractors"
        subtitle="Vendor and contractor directory"
        action={<button onClick={() => setAddDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add Contractor</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {contractors.map(c => (
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

      <AppDrawer
        open={addDrawer}
        onClose={() => setAddDrawer(false)}
        title="Add Contractor"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAddDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Save</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Name</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Company or person name" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Specialty</label><input value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} placeholder="e.g. Plumbing, Electrical" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Phone</label><input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+47 900 00 000" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Email</label><input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@company.no" style={inputStyle} /></div>
        </div>
      </AppDrawer>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

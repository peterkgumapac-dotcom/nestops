'use client'
import { useState } from 'react'
import { Wrench, ShoppingCart, HelpCircle } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { REQUESTS } from '@/lib/data/requests'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'

const INITIAL_REQUESTS = REQUESTS.filter(r => r.ownerId === 'o1')

type RequestType = 'maintenance' | 'purchase' | 'inquiry'

const TYPE_OPTIONS: { type: RequestType; label: string; icon: typeof Wrench; desc: string }[] = [
  { type: 'maintenance', label: 'Maintenance', icon: Wrench, desc: 'Report a repair or maintenance issue' },
  { type: 'purchase', label: 'Purchase', icon: ShoppingCart, desc: 'Request approval for a purchase' },
  { type: 'inquiry', label: 'Inquiry', icon: HelpCircle, desc: 'Ask a question or request information' },
]

export default function OwnerRequestsPage() {
  const { accent } = useRole()
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [newDrawer, setNewDrawer] = useState(false)
  const [selectedType, setSelectedType] = useState<RequestType | null>(null)
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [selectedPropertyId, setSelectedPropertyId] = useState(PROPERTIES.filter(p => p.ownerId === 'o1')[0]?.id ?? 'p1')
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

  const handleSubmit = () => {
    if (!selectedType) return
    const property = PROPERTIES.find(p => p.id === selectedPropertyId)
    const newRequest = {
      id: `req-${Date.now()}`,
      title: title || `New ${selectedType} request`,
      type: selectedType,
      propertyId: selectedPropertyId,
      ownerId: 'o1',
      status: 'open' as const,
      priority: 'medium' as const,
      date: new Date().toISOString().split('T')[0],
      description: details || '',
      comments: [],
    }
    setRequests(prev => [newRequest, ...prev])
    setNewDrawer(false)
    setSelectedType(null)
    setTitle('')
    setDetails('')
    showToast('Request submitted')
  }

  return (
    <div>
      <PageHeader
        title="My Requests"
        subtitle="Track your submitted requests"
        action={
          <button onClick={() => setNewDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            + New Request
          </button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700 }}>
        {requests.map(r => {
          const property = PROPERTIES.find(p => p.id === r.propertyId)
          return (
            <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {property?.name} · {r.date} · <span style={{ textTransform: 'capitalize' }}>{r.type}</span>
                    {('amount' in r && r.amount) ? ` · ${r.amount} ${'currency' in r ? r.currency : ''}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <StatusBadge status={r.priority} />
                  <StatusBadge status={r.status} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: r.comments.length ? 10 : 0 }}>{r.description}</p>
              {r.comments.map(c => (
                <div key={c.id} style={{ background: c.role === 'operator' ? `${accent}0d` : 'var(--bg-elevated)', border: `1px solid ${c.role === 'operator' ? `${accent}22` : 'var(--border-subtle)'}`, borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.role === 'operator' ? accent : 'var(--text-primary)' }}>{c.author}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{new Date(c.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>{c.message}</p>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* New Request Drawer */}
      <AppDrawer
        open={newDrawer}
        onClose={() => { setNewDrawer(false); setSelectedType(null) }}
        title="New Request"
        footer={selectedType ? (
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setSelectedType(null)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Back</button>
            <button onClick={handleSubmit} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Submit</button>
          </div>
        ) : undefined}
      >
        {!selectedType ? (
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>What type of request do you want to submit?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TYPE_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color: accent }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div><label style={labelStyle}>Property</label>
              <select style={inputStyle} value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}>
                {PROPERTIES.filter(p => p.ownerId === 'o1').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Title</label><input style={inputStyle} placeholder="Brief description" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><label style={labelStyle}>Details</label><textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Describe your request in detail…" value={details} onChange={e => setDetails(e.target.value)} /></div>
            {selectedType === 'purchase' && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                <div><label style={labelStyle}>Amount</label><input type="number" style={inputStyle} placeholder="0" /></div>
                <div><label style={labelStyle}>Currency</label>
                  <select style={inputStyle}>
                    <option>NOK</option><option>USD</option><option>EUR</option><option>GBP</option><option>SEK</option><option>DKK</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </AppDrawer>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

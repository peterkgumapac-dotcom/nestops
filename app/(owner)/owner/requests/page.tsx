'use client'
import { useState } from 'react'
import { Wrench, ShoppingCart, HelpCircle, ClipboardList, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { REQUESTS } from '@/lib/data/requests'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'

const INITIAL_REQUESTS = REQUESTS.filter(r => r.ownerId === 'o1')

type RequestCategory = 'maintenance' | 'purchase' | 'inquiry' | 'work_order'

const CATEGORY_OPTIONS: {
  type: RequestCategory
  label: string
  icon: typeof Wrench
  desc: string
  color: string
}[] = [
  { type: 'maintenance',  label: 'Maintenance',          icon: Wrench,        desc: 'Report a repair or maintenance issue',      color: '#ef4444' },
  { type: 'purchase',     label: 'Purchase Approvals',   icon: ShoppingCart,  desc: 'Request approval for a purchase or expense', color: '#7c3aed' },
  { type: 'inquiry',      label: 'Inquiry',              icon: HelpCircle,    desc: 'Ask a question or request information',      color: '#2563eb' },
  { type: 'work_order',   label: 'Work Order Approvals', icon: ClipboardList, desc: 'Approve work orders from your operator',      color: '#d97706' },
]

// Simulated linked tasks per request
const LINKED_TASKS: Record<string, { name: string; status: string }> = {
  [INITIAL_REQUESTS[0]?.id ?? 'x']: { name: 'Fix leaking bathroom tap', status: 'open' },
}

// Simulated pending approvals count
const PENDING_APPROVAL_COUNT = 3

export default function OwnerRequestsPage() {
  const { accent } = useRole()
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [newDrawer, setNewDrawer] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<RequestCategory | null>(null)
  const [filterCategory, setFilterCategory] = useState<RequestCategory | 'all'>('all')

  const [selectedType, setSelectedType] = useState<RequestCategory | null>(null)
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
      type: selectedType as any,
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

  // Count per category
  const countFor = (cat: RequestCategory) =>
    requests.filter(r => {
      if (cat === 'maintenance') return r.type === 'maintenance'
      if (cat === 'purchase') return r.type === 'purchase'
      if (cat === 'inquiry') return r.type === 'inquiry'
      if (cat === 'work_order') return (r as any).requiresOwnerApproval
      return false
    }).length

  const filteredRequests = requests.filter(r => {
    if (filterCategory === 'all') return true
    if (filterCategory === 'maintenance') return r.type === 'maintenance'
    if (filterCategory === 'purchase') return r.type === 'purchase'
    if (filterCategory === 'inquiry') return r.type === 'inquiry'
    if (filterCategory === 'work_order') return (r as any).requiresOwnerApproval
    return true
  })

  return (
    <div>
      {/* Cross-portal approval banner */}
      {PENDING_APPROVAL_COUNT > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 20,
          background: '#d9770612', border: '1px solid #d9770630', borderRadius: 10,
        }}>
          <AlertTriangle size={16} style={{ color: '#d97706', flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            <strong style={{ color: '#d97706' }}>{PENDING_APPROVAL_COUNT} items</strong> need your approval from the operator
          </span>
          <Link
            href="/owner/approvals"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#d97706', fontWeight: 600, textDecoration: 'none' }}
          >
            Review <ChevronRight size={13} />
          </Link>
        </div>
      )}

      <PageHeader
        title="My Requests"
        subtitle="Track your submitted requests"
        action={
          <button onClick={() => setNewDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            + New Request
          </button>
        }
      />

      {/* 4 Category Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {CATEGORY_OPTIONS.map(opt => {
          const Icon = opt.icon
          const count = countFor(opt.type)
          const isActive = filterCategory === opt.type
          return (
            <button
              key={opt.type}
              onClick={() => setFilterCategory(isActive ? 'all' : opt.type)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 8, padding: '14px 16px', borderRadius: 12,
                border: `1px solid ${isActive ? opt.color : 'var(--border)'}`,
                background: isActive ? `${opt.color}0d` : 'var(--bg-card)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${opt.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} style={{ color: opt.color }} />
                </div>
                {count > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${opt.color}20`, color: opt.color }}>
                    {count}
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{opt.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Filter indicator */}
      {filterCategory !== 'all' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing: <strong style={{ color: 'var(--text-primary)' }}>{CATEGORY_OPTIONS.find(o => o.type === filterCategory)?.label}</strong>
          </span>
          <button
            onClick={() => setFilterCategory('all')}
            style={{ fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Request list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700 }}>
        {filteredRequests.map(r => {
          const property = PROPERTIES.find(p => p.id === r.propertyId)
          const linkedTask = LINKED_TASKS[r.id]
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
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: linkedTask || r.comments.length ? 10 : 0 }}>{r.description}</p>

              {/* Linked maintenance task */}
              {linkedTask && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)', borderRadius: 8, marginBottom: r.comments.length ? 10 : 0,
                }}>
                  <Wrench size={12} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>
                    Linked task: <strong style={{ color: 'var(--text-primary)' }}>{linkedTask.name}</strong>
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: '#ef444418', color: '#ef4444', textTransform: 'capitalize' }}>
                    {linkedTask.status}
                  </span>
                </div>
              )}

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

        {filteredRequests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-subtle)', fontSize: 14 }}>
            No requests in this category.
          </div>
        )}
      </div>

      {/* New Request Drawer — category first, conditional fields */}
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
              {CATEGORY_OPTIONS.map(opt => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = opt.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${opt.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color: opt.color }} strokeWidth={1.5} />
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
            {/* Selected category indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              background: `${CATEGORY_OPTIONS.find(o => o.type === selectedType)?.color}0d`,
              border: `1px solid ${CATEGORY_OPTIONS.find(o => o.type === selectedType)?.color}30`,
              borderRadius: 8,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: CATEGORY_OPTIONS.find(o => o.type === selectedType)?.color }}>
                {CATEGORY_OPTIONS.find(o => o.type === selectedType)?.label}
              </span>
            </div>

            <div>
              <label style={labelStyle}>Property</label>
              <select style={inputStyle} value={selectedPropertyId} onChange={e => setSelectedPropertyId(e.target.value)}>
                {PROPERTIES.filter(p => p.ownerId === 'o1').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Title</label>
              <input style={inputStyle} placeholder="Brief description" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Details</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Describe your request in detail…" value={details} onChange={e => setDetails(e.target.value)} />
            </div>

            {/* Conditional fields per category */}
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
            {selectedType === 'maintenance' && (
              <div>
                <label style={labelStyle}>Urgency</label>
                <select style={inputStyle}>
                  <option>Low — can wait</option>
                  <option>Medium — within a week</option>
                  <option>High — within 48h</option>
                  <option>Urgent — immediate</option>
                </select>
              </div>
            )}
            {selectedType === 'work_order' && (
              <>
                <div>
                  <label style={labelStyle}>Vendor / Contractor</label>
                  <input style={inputStyle} placeholder="e.g. Lars Plumbing AS" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                  <div><label style={labelStyle}>Estimated Cost</label><input type="number" style={inputStyle} placeholder="0" /></div>
                  <div><label style={labelStyle}>Currency</label><select style={inputStyle}><option>NOK</option><option>USD</option><option>EUR</option></select></div>
                </div>
              </>
            )}
            {selectedType === 'inquiry' && (
              <div>
                <label style={labelStyle}>Topic</label>
                <select style={inputStyle}>
                  <option>General question</option>
                  <option>Revenue / payments</option>
                  <option>Guest feedback</option>
                  <option>Property condition</option>
                  <option>Contract / legal</option>
                  <option>Other</option>
                </select>
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

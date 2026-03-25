'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wrench, ShoppingCart, HelpCircle, Plus, Building2, Check } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { REQUESTS, type Request } from '@/lib/data/requests'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'
import type { UserProfile } from '@/context/RoleContext'

const TYPE_ICONS = {
  maintenance: Wrench,
  purchase: ShoppingCart,
  inquiry: HelpCircle,
}

const TYPE_LABELS = {
  maintenance: 'Work Order',
  purchase: 'Purchase / Vendor Approval',
  inquiry: 'Inquiry',
}

const TYPE_DESCS = {
  maintenance: 'Submit a maintenance or repair work order',
  purchase: 'Request vendor approval or expense authorization',
  inquiry: 'Ask operations a question or request information',
}

export default function WorkOrdersPage() {
  const { accent } = useRole()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [requests, setRequests] = useState<Request[]>(REQUESTS)
  const [newDrawer, setNewDrawer] = useState(false)
  const [selectedType, setSelectedType] = useState<Request['type'] | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPropertyId, setNewPropertyId] = useState(PROPERTIES[0]?.id ?? 'p1')
  const [newAmount, setNewAmount] = useState('')
  const [newVendor, setNewVendor] = useState('')
  const [newPriority, setNewPriority] = useState<Request['priority']>('medium')
  const [involveOwner, setInvolveOwner] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    const stored = localStorage.getItem('nestops_user')
    if (stored) { try { setCurrentUser(JSON.parse(stored)) } catch {} }
  }, [])

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

  const handleSubmit = () => {
    if (!selectedType) return
    const prop = PROPERTIES.find(p => p.id === newPropertyId)
    const newReq: Request = {
      id: `wo-${Date.now()}`,
      title: newTitle || `${TYPE_LABELS[selectedType]} — ${prop?.name}`,
      type: selectedType,
      propertyId: newPropertyId,
      ownerId: prop?.ownerId ?? 'o1',
      status: 'open',
      priority: newPriority,
      date: new Date().toISOString().split('T')[0],
      description: newDescription + (newVendor ? `\nVendor: ${newVendor}` : ''),
      comments: [],
      source: 'staff' as const,
      requiresOwnerApproval: involveOwner,
      ...(newAmount ? { amount: parseFloat(newAmount), currency: 'NOK' } : {}),
    }
    setRequests(prev => [newReq, ...prev])
    if (involveOwner) {
      try {
        const existing = JSON.parse(localStorage.getItem('nestops_owner_work_orders') ?? '[]')
        existing.push({
          id: newReq.id,
          title: newReq.title,
          property: prop?.name ?? newPropertyId,
          amount: newReq.amount ?? 0,
          currency: 'NOK',
          category: 'Work Order',
          description: newReq.description,
          requestedBy: currentUser?.name ?? 'Operations',
          requestedDate: newReq.date,
          status: 'pending',
        })
        localStorage.setItem('nestops_owner_work_orders', JSON.stringify(existing))
      } catch {}
    }
    setNewDrawer(false)
    setSelectedType(null)
    setNewTitle('')
    setNewDescription('')
    setNewAmount('')
    setNewVendor('')
    setInvolveOwner(false)
    showToast(involveOwner ? 'Work order submitted — owner notified for approval' : selectedType === 'purchase' ? 'Approval request submitted to operations' : 'Work order submitted')
  }

  // Show relevant requests (all for demo, would normally filter by staff's properties)
  const visibleRequests = requests.filter(r => r.status !== 'resolved').slice(0, 10)

  const priorityColors: Record<string, string> = { urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#6b7280' }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Work Orders"
        subtitle="Submit and track work orders, vendor approvals, and requests"
        action={
          <button onClick={() => setNewDrawer(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            <Plus size={14} /> New Request
          </button>
        }
      />

      {/* Quick action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {(['maintenance', 'purchase', 'inquiry'] as const).map(type => {
          const Icon = TYPE_ICONS[type]
          return (
            <button
              key={type}
              onClick={() => { setSelectedType(type); setNewDrawer(true) }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, padding: '14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 7, background: `${accent}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color: accent }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{TYPE_LABELS[type]}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{TYPE_DESCS[type]}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Open requests list */}
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Open Requests</h2>
      {visibleRequests.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No open requests at this time.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleRequests.map(r => {
            const Icon = TYPE_ICONS[r.type]
            const prop = PROPERTIES.find(p => p.id === r.propertyId)
            return (
              <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: `${accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} style={{ color: accent }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building2 size={10} />
                    {prop?.name ?? r.propertyId} · {r.date} · <span style={{ textTransform: 'capitalize' }}>{TYPE_LABELS[r.type]}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${priorityColors[r.priority]}18`, color: priorityColors[r.priority], textTransform: 'capitalize' }}>
                      {r.priority}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: r.requiresOwnerApproval ? 'rgba(239,68,68,0.1)' : 'rgba(107,114,128,0.1)', color: r.requiresOwnerApproval ? '#ef4444' : '#6b7280', whiteSpace: 'nowrap' }}>
                    {r.requiresOwnerApproval ? '👤 Owner Approval' : '🔧 Operator'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New Request Drawer */}
      <AppDrawer
        open={newDrawer}
        onClose={() => { setNewDrawer(false); setSelectedType(null); setInvolveOwner(false) }}
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
              {(['maintenance', 'purchase', 'inquiry'] as const).map(type => {
                const Icon = TYPE_ICONS[type]
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} style={{ color: accent }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{TYPE_LABELS[type]}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{TYPE_DESCS[type]}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Property</label>
              <select style={inputStyle} value={newPropertyId} onChange={e => setNewPropertyId(e.target.value)}>
                {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Title</label>
              <input style={inputStyle} placeholder={`Brief ${TYPE_LABELS[selectedType].toLowerCase()} description`} value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Details</label>
              <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} placeholder="Describe the issue or request…" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
            </div>
            {selectedType === 'purchase' && (
              <>
                <div>
                  <label style={labelStyle}>Vendor / Supplier</label>
                  <input style={inputStyle} placeholder="e.g. Elkjøp, Lars Plumbing AS" value={newVendor} onChange={e => setNewVendor(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Estimated Cost (NOK)</label>
                  <input type="number" style={inputStyle} placeholder="0" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <label style={labelStyle}>Priority</label>
              <select style={inputStyle} value={newPriority} onChange={e => setNewPriority(e.target.value as Request['priority'])}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Owner Involvement</label>
              <button
                onClick={() => setInvolveOwner(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 14px', borderRadius: 8,
                  border: `1px solid ${involveOwner ? accent + '80' : 'var(--border)'}`,
                  background: involveOwner ? accent + '12' : 'var(--bg-elevated)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${involveOwner ? accent : 'var(--border)'}`, background: involveOwner ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {involveOwner && <Check size={11} color="#fff" />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Requires Owner Approval</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Owner will be notified and must approve before work proceeds</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </AppDrawer>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </motion.div>
  )
}

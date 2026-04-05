'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, MessageSquare, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '@/components/shared/PageHeader'
import { PURCHASE_ORDERS } from '@/lib/data/inventory'

const ACCENT = '#2563eb'

type ApprovalStatus = 'pending' | 'approved' | 'declined'

interface Approval {
  id: string
  title: string
  property: string
  amount: number
  currency: string
  category: string
  description: string
  requestedBy: string
  requestedDate: string
  status: ApprovalStatus
  resolvedDate?: string
  isPurchaseApproval?: boolean
  poNumber?: string
  vendor?: string
}

// POs >2000 NOK requiring owner approval surface here
const OWNER_POS: Approval[] = PURCHASE_ORDERS
  .filter(po => po.approvalTier === 'owner' && po.approvalStatus !== 'approved')
  .map(po => ({
    id: `po-${po.id}`,
    title: `Purchase Order ${po.poNumber}`,
    property: po.destination,
    amount: po.total,
    currency: po.currency,
    category: 'Purchase Approval',
    description: `${po.items.map(i => `${i.qty}× ${i.name}`).join(', ')}. Requested by ${po.requester ?? 'Operator'}.`,
    requestedBy: po.requester ?? 'Operator',
    requestedDate: po.date,
    status: 'pending' as ApprovalStatus,
    isPurchaseApproval: true,
    poNumber: po.poNumber,
    vendor: po.vendor,
  }))

const ALL_APPROVALS: Approval[] = [
  { id: 'a1', title: 'Emergency Plumbing Repair',    property: 'Sunset Villa',  amount: 4800, currency: 'NOK', category: 'Maintenance', description: 'Burst pipe under kitchen sink. Immediate repair required before next guest arrival on March 20.', requestedBy: 'Lars Plumbing AS', requestedDate: '2026-03-15', status: 'pending' },
  { id: 'a2', title: 'Replace Dishwasher',           property: 'Sunset Villa',  amount: 9200, currency: 'NOK', category: 'Appliance',   description: 'Current unit is 8 years old and leaking. Bosch SMS6ZCW00E recommended. Full warranty included.', requestedBy: 'Peter K.', requestedDate: '2026-03-14', status: 'pending' },
  { id: 'a3', title: 'New Outdoor Furniture Set',    property: 'Harbor Studio', amount: 6400, currency: 'NOK', category: 'Furniture',   description: 'Patio furniture worn out. 4-piece rattan set from Jysk would improve guest reviews significantly.', requestedBy: 'Peter K.', requestedDate: '2026-03-12', status: 'pending' },
  { id: 'a4', title: 'Window Seal Replacement',      property: 'Sunset Villa',  amount: 3200, currency: 'NOK', category: 'Maintenance', description: 'Two bedroom windows have drafts. Replacing seals will reduce heating costs.', requestedBy: 'Bjorn Maintenance', requestedDate: '2026-02-28', status: 'approved', resolvedDate: '2026-03-01' },
  { id: 'a5', title: 'Smart Thermostat Upgrade',     property: 'Sunset Villa',  amount: 1800, currency: 'NOK', category: 'Smart Home', description: 'Upgrade to Nest thermostat for better energy control and remote management.', requestedBy: 'Peter K.', requestedDate: '2026-02-20', status: 'approved', resolvedDate: '2026-02-22' },
  { id: 'a6', title: 'Premium BBQ Grill Purchase',   property: 'Harbor Studio', amount: 4500, currency: 'NOK', category: 'Equipment',   description: 'Replace small tabletop grill with full-size Weber propane grill for better guest experience.', requestedBy: 'Peter K.', requestedDate: '2026-02-10', status: 'declined', resolvedDate: '2026-02-12' },
]

type Tab = 'pending' | 'approved' | 'declined' | 'all'

const TAB_OPTIONS: { key: Tab; label: string }[] = [
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
  { key: 'all',      label: 'All' },
]

const STATUS_ICONS: Record<ApprovalStatus, React.ReactNode> = {
  pending:  <Clock size={14} style={{ color: '#d97706' }} />,
  approved: <CheckCircle size={14} style={{ color: '#16a34a' }} />,
  declined: <XCircle size={14} style={{ color: '#dc2626' }} />,
}

const STATUS_STYLES: Record<ApprovalStatus, React.CSSProperties> = {
  pending:  { background: 'rgba(217,119,6,0.1)',  color: '#d97706',  border: '1px solid rgba(217,119,6,0.25)' },
  approved: { background: 'rgba(22,163,74,0.1)',  color: '#16a34a',  border: '1px solid rgba(22,163,74,0.25)' },
  declined: { background: 'rgba(220,38,38,0.1)', color: '#dc2626',  border: '1px solid rgba(220,38,38,0.25)' },
}

export default function ApprovalsPage() {
  const [tab, setTab] = useState<Tab>('pending')
  const [approvals, setApprovals] = useState([...OWNER_POS, ...ALL_APPROVALS])
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [decliningId, setDecliningId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('afterstay_owner_work_orders')
      if (stored) {
        const workOrders: Approval[] = JSON.parse(stored)
        setApprovals(prev => {
          const existingIds = new Set(prev.map(a => a.id))
          const newItems = workOrders.filter(wo => !existingIds.has(wo.id))
          return newItems.length > 0 ? [...newItems, ...prev] : prev
        })
      }
    } catch {}
  }, [])

  const filtered = tab === 'all' ? approvals : approvals.filter(a => a.status === tab)
  const pendingCount = approvals.filter(a => a.status === 'pending').length

  const removeFromLocalStorage = (id: string) => {
    try {
      const stored = localStorage.getItem('afterstay_owner_work_orders')
      if (stored) {
        const items = JSON.parse(stored).filter((wo: Approval) => wo.id !== id)
        localStorage.setItem('afterstay_owner_work_orders', JSON.stringify(items))
      }
    } catch {}
  }

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' as const, resolvedDate: new Date().toISOString().split('T')[0] } : a))
    removeFromLocalStorage(id)
    setConfirmingId(null)
  }

  const handleDecline = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'declined' as const, resolvedDate: new Date().toISOString().split('T')[0] } : a))
    removeFromLocalStorage(id)
    setDecliningId(null)
  }

  const confirmingApproval = approvals.find(a => a.id === confirmingId)
  const decliningApproval = approvals.find(a => a.id === decliningId)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Approvals"
        subtitle="Review and approve maintenance and purchase requests"
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {TAB_OPTIONS.map(t => {
          const isActive = tab === t.key
          const count = t.key === 'all' ? approvals.length : approvals.filter(a => a.status === t.key).length
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: 'pointer',
                border: `1px solid ${isActive ? ACCENT : '#e2e8f0'}`,
                background: isActive ? `${ACCENT}14` : 'transparent',
                color: isActive ? ACCENT : '#64748b',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {t.label}
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '0px 5px', borderRadius: 10, background: isActive ? ACCENT : '#e2e8f0', color: isActive ? '#fff' : '#64748b', minWidth: 16, textAlign: 'center' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Approvals list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 14 }}>
            No {tab === 'all' ? '' : tab} approvals.
          </div>
        )}
        {filtered.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  {a.isPurchaseApproval && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'rgba(124,58,237,0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShoppingCart size={10} /> Purchase Order
                    </span>
                  )}
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>{a.title}</span>
                  <span style={{ ...STATUS_STYLES[a.status], fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {STATUS_ICONS[a.status]} {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{a.property} · {a.vendor ? `Vendor: ${a.vendor} · ` : ''}{a.category} · Requested by {a.requestedBy}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>{a.amount.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.currency}</div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px', lineHeight: 1.5 }}>{a.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                {a.status === 'pending' ? `Requested ${a.requestedDate}` : `${a.status === 'approved' ? 'Approved' : 'Declined'} ${a.resolvedDate}`}
              </span>

              {a.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setDecliningId(a.id)}
                    style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <MessageSquare size={13} /> Ask for more info
                  </button>
                  <button
                    onClick={() => setConfirmingId(a.id)}
                    style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <CheckCircle size={13} /> Approve & Pay
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Approve Confirmation Dialog */}
      <AnimatePresence>
        {confirmingApproval && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
            onClick={() => setConfirmingId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <CheckCircle size={24} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Confirm Payment</div>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>You are about to approve and authorize payment for:</p>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a', marginBottom: 3 }}>{confirmingApproval.title}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{confirmingApproval.property} · {confirmingApproval.category}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{confirmingApproval.amount.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 500 }}>{confirmingApproval.currency}</span></div>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
                This amount will be deducted from your next monthly payout or charged to your payment method on file. A receipt will be emailed to you.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmingId(null)} style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => handleApprove(confirmingApproval.id)} style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Confirm Payment</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decline / More Info Dialog */}
      <AnimatePresence>
        {decliningApproval && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
            onClick={() => setDecliningId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{decliningApproval.title}</div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Leave a message or decline this request.</p>
              <textarea
                placeholder="Add a message for the operations team…"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, outline: 'none', minHeight: 90, resize: 'vertical', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={() => setDecliningId(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => handleDecline(decliningApproval.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Decline Request</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

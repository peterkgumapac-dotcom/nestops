'use client'
import { useState } from 'react'
import { Building2, Inbox, CheckCircle, MapPin, Bed, Bath, Clock, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import { PROPERTIES } from '@/lib/data/properties'
import { REQUESTS } from '@/lib/data/requests'
import { useRole } from '@/context/RoleContext'

const ACCENT = '#2563eb'
const MY_PROPERTIES = PROPERTIES.filter(p => p.ownerId === 'o1')
const MY_REQUESTS    = REQUESTS.filter(r => r.ownerId === 'o1')
const OPEN_REQUESTS  = MY_REQUESTS.filter(r => r.status === 'open' || r.status === 'pending')

interface Approval {
  id: string
  title: string
  property: string
  amount: number
  currency: string
  category: string
  description: string
  requestedBy: string
}

const INITIAL_APPROVALS: Approval[] = [
  { id: 'a1', title: 'Emergency Plumbing Repair',    property: 'Sunset Villa',  amount: 4800, currency: 'NOK', category: 'Maintenance', description: 'Burst pipe under kitchen sink. Immediate repair required before next guest arrival.', requestedBy: 'Lars Plumbing AS' },
  { id: 'a2', title: 'Replace Dishwasher',           property: 'Sunset Villa',  amount: 9200, currency: 'NOK', category: 'Appliance',   description: 'Current unit is 8 years old and leaking. Bosch SMS6ZCW00E recommended.', requestedBy: 'Peter K.' },
  { id: 'a3', title: 'New Outdoor Furniture Set',    property: 'Harbor Studio', amount: 6400, currency: 'NOK', category: 'Furniture',   description: 'Patio furniture worn out. 4-piece rattan set from Jysk would improve guest reviews.', requestedBy: 'Peter K.' },
]

export default function OwnerOverview() {
  const { user } = useRole()
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const displayName = user?.name?.split(' ')[0] ?? 'Sarah'

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id))
    setConfirmingId(null)
  }
  const handleDecline = (id: string) => setApprovals(prev => prev.filter(a => a.id !== id))

  const confirmingApproval = approvals.find(a => a.id === confirmingId)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title={`Welcome back, ${displayName}`} subtitle="Here's what's happening with your portfolio" />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="My Properties"     value={MY_PROPERTIES.length}  icon={Building2} animate={false} />
        <StatCard label="Open Requests"     value={OPEN_REQUESTS.length}  icon={Inbox} animate={false} />
        <StatCard label="Pending Approvals" value={approvals.length}      icon={CheckCircle} animate={false} />
      </div>

      {/* Pending Approvals */}
      {approvals.length > 0 && (
        <div style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10, padding: 16, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Pending Approvals ({approvals.length})
            </div>
            <Link href="/owner/approvals" style={{ fontSize: 13, color: ACCENT, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {approvals.slice(0, 3).map(a => (
              <div key={a.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{a.property} · {a.category}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', whiteSpace: 'nowrap' }}>{a.amount.toLocaleString()} {a.currency}</div>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px', lineHeight: 1.5 }}>{a.description}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setConfirmingId(a.id)}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Approve & Pay
                  </button>
                  <button
                    onClick={() => handleDecline(a.id)}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 7, border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontSize: 13, cursor: 'pointer' }}
                  >
                    Ask for more info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
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
              style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Confirm Payment</div>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>You are about to approve and pay for:</p>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>{confirmingApproval.title}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{confirmingApproval.property}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>{confirmingApproval.amount.toLocaleString()} {confirmingApproval.currency}</div>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>This amount will be deducted from your next payout or charged to your payment method on file.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setConfirmingId(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => handleApprove(confirmingApproval.id)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Confirm Payment</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* My Properties */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>My Properties</h2>
            <Link href="/owner/properties" style={{ fontSize: 13, color: ACCENT, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MY_PROPERTIES.map(p => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: 110, background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={32} style={{ color: ACCENT, opacity: 0.4 }} strokeWidth={1} />
                  </div>
                )}
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{p.name}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    <MapPin size={11} /> {p.address}, {p.city}
                  </div>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}><Bed size={12} /> {p.beds} beds</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}><Bath size={12} /> {p.baths} baths</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Recent Activity</h2>
            <Link href="/owner/requests" style={{ fontSize: 13, color: ACCENT, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MY_REQUESTS.slice(0, 3).map(r => (
              <div key={r.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 500, fontSize: 14, color: '#0f172a' }}>{r.title}</span>
                  <StatusBadge status={r.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: r.comments.length > 0 ? 8 : 0 }}>
                  <Clock size={11} /> {r.date} · {r.type}
                </div>
                {r.comments.length > 0 && (
                  <div style={{ background: '#f8fafc', borderRadius: 7, padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>Latest from Operations</div>
                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4, margin: 0 }}>{r.comments[r.comments.length - 1]?.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

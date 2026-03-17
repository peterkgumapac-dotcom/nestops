'use client'
import { useState } from 'react'
import { CreditCard, TrendingUp, Percent, DollarSign, Download, Calendar, PlusCircle, Check, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'

const ACCENT = '#2563eb'

type StatementFilter = 'all' | 'paid' | 'pending'

const STATEMENTS = [
  { id: 's1', month: 'February 2026', revenue: 84200,  occupancy: 79, nights: 22, mgmtFee: 10104, netOwner: 74096, status: 'paid'    as const, paidDate: '2026-03-05' },
  { id: 's2', month: 'January 2026',  revenue: 76400,  occupancy: 71, nights: 20, mgmtFee: 9168,  netOwner: 67232, status: 'paid'    as const, paidDate: '2026-02-05' },
  { id: 's3', month: 'December 2025', revenue: 112600, occupancy: 92, nights: 28, mgmtFee: 13512, netOwner: 99088, status: 'paid'    as const, paidDate: '2026-01-06' },
  { id: 's4', month: 'November 2025', revenue: 68900,  occupancy: 66, nights: 18, mgmtFee: 8268,  netOwner: 60632, status: 'paid'    as const, paidDate: '2025-12-05' },
  { id: 's5', month: 'March 2026',    revenue: 82400,  occupancy: 76, nights: 21, mgmtFee: 9888,  netOwner: 72512, status: 'pending' as const, paidDate: null },
]

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  label: string
  detail: string
  isDefault: boolean
}

const INITIAL_METHODS: PaymentMethod[] = [
  { id: 'pm1', type: 'card', label: 'Visa',          detail: '•••• •••• •••• 4242', isDefault: true },
  { id: 'pm2', type: 'bank', label: 'DNB Bank',       detail: 'IBAN NO93 8601 1117 947', isDefault: false },
]

const UPCOMING_PAYOUT = STATEMENTS.find(s => s.status === 'pending')

export default function BillingPage() {
  const [filter, setFilter] = useState<StatementFilter>('all')
  const [methods, setMethods] = useState(INITIAL_METHODS)
  const [addingMethod, setAddingMethod] = useState(false)

  const filtered = STATEMENTS.filter(s => filter === 'all' || s.status === filter)
  const ytdRevenue = STATEMENTS.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.revenue, 0)
  const avgOccupancy = Math.round(STATEMENTS.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.occupancy, 0) / STATEMENTS.filter(s => s.status === 'paid').length)

  const filterPills: { key: StatementFilter; label: string }[] = [
    { key: 'all',     label: 'All' },
    { key: 'paid',    label: 'Paid' },
    { key: 'pending', label: 'Pending' },
  ]

  const setDefault = (id: string) => setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })))
  const removeMethod = (id: string) => setMethods(prev => prev.filter(m => m.id !== id))

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Billing & Statements" subtitle="Revenue reports and payouts for your portfolio" />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Monthly Revenue"   value={`${(STATEMENTS[0].revenue / 1000).toFixed(0)}K NOK`}  icon={TrendingUp} subtitle="Feb 2026" animate={false} />
        <StatCard label="YTD Revenue"        value={`${(ytdRevenue / 1000).toFixed(0)}K NOK`}             icon={DollarSign} animate={false} />
        <StatCard label="Avg. Occupancy"     value={`${avgOccupancy}%`}                                   icon={Percent} animate={false} />
        <StatCard label="Management Rate"    value="12%"                                                   icon={CreditCard} animate={false} />
      </div>

      {/* Upcoming payout */}
      {UPCOMING_PAYOUT && (
        <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Calendar size={16} style={{ color: ACCENT }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Upcoming Payout</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>
              <strong>{UPCOMING_PAYOUT.netOwner.toLocaleString()} NOK</strong>
              <span style={{ color: '#64748b', fontSize: 13 }}> · {UPCOMING_PAYOUT.month} · Expected by 5th April 2026</span>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(217,119,6,0.15)', color: '#d97706' }}>Pending</span>
        </div>
      )}

      {/* Payment Methods — Stripe-style */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>Payment Methods</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Payouts are sent to your default payment method.</p>
          </div>
          <button
            onClick={() => setAddingMethod(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: `1px solid ${ACCENT}`, background: 'transparent', color: ACCENT, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            <PlusCircle size={14} /> Add Method
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {methods.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 8, border: m.isDefault ? `1px solid ${ACCENT}` : '1px solid #e2e8f0', background: m.isDefault ? `${ACCENT}06` : '#f8fafc' }}>
              <div style={{ width: 40, height: 26, borderRadius: 5, background: m.type === 'card' ? '#1a56db' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CreditCard size={14} style={{ color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{m.label}</div>
                <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{m.detail}</div>
              </div>
              {m.isDefault ? (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${ACCENT}14`, color: ACCENT, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={11} /> Default
                </span>
              ) : (
                <button onClick={() => setDefault(m.id)} style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: 6 }}>
                  Set default
                </button>
              )}
              {!m.isDefault && (
                <button onClick={() => removeMethod(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 4, display: 'flex' }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add method form */}
        <AnimatePresence>
          {addingMethod && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ marginTop: 16, padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', marginBottom: 14 }}>Add Payment Method</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <select style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: 14, outline: 'none' }}>
                    <option value="card">Credit / Debit Card</option>
                    <option value="bank">Bank Account (IBAN)</option>
                  </select>
                  <input placeholder="Card number" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: 14, outline: 'none' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input placeholder="MM / YY" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: 14, outline: 'none' }} />
                    <input placeholder="CVC" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', fontSize: 14, outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setAddingMethod(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => setAddingMethod(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: ACCENT, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Save Card</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter + table */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {filterPills.map(p => (
            <button
              key={p.key}
              onClick={() => setFilter(p.key)}
              style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${filter === p.key ? ACCENT : '#e2e8f0'}`, background: filter === p.key ? `${ACCENT}1a` : 'transparent', color: filter === p.key ? ACCENT : '#64748b' }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{filtered.length} statements</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Period', 'Gross Revenue', 'Occupancy', 'Nights', 'Mgmt Fee (12%)', 'Net to Owner', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '13px 16px', fontWeight: 500, color: '#0f172a', whiteSpace: 'nowrap' }}>{s.month}</td>
                <td style={{ padding: '13px 16px', color: '#0f172a' }}>{s.revenue.toLocaleString()} NOK</td>
                <td style={{ padding: '13px 16px', color: '#64748b' }}>{s.occupancy}%</td>
                <td style={{ padding: '13px 16px', color: '#64748b' }}>{s.nights}</td>
                <td style={{ padding: '13px 16px', color: '#64748b' }}>{s.mgmtFee.toLocaleString()} NOK</td>
                <td style={{ padding: '13px 16px', fontWeight: 600, color: s.status === 'paid' ? '#16a34a' : ACCENT }}>{s.netOwner.toLocaleString()} NOK</td>
                <td style={{ padding: '13px 16px' }}>
                  {s.status === 'paid'
                    ? <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}>Paid</span>
                    : <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(217,119,6,0.12)', color: '#d97706' }}>Pending</span>
                  }
                </td>
                <td style={{ padding: '13px 16px' }}>
                  {s.status === 'paid' && (
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: ACCENT, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, whiteSpace: 'nowrap' }}>
                      <Download size={13} /> Download
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
        Payouts are processed on the 5th of each month. Management fee is 12% of gross revenue. All amounts in NOK.
      </p>
    </motion.div>
  )
}

'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  KeyRound, Lock, Unlock, Clock, CheckCircle, XCircle,
  AlertTriangle, ChevronDown, ChevronRight, Bell, Calendar,
  Building2, User, MessageSquare, RefreshCw,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import AppDrawer from '@/components/shared/AppDrawer'
import { useRole } from '@/context/RoleContext'

type PteStatus = 'pending' | 'granted' | 'denied' | 'expired' | 'auto_granted' | 'not_required'

interface PteRequest {
  id: string
  taskTitle: string
  taskType: 'maintenance' | 'cleaning' | 'delivery' | 'inspection'
  propertyName: string
  staffName: string
  staffRole: string
  reason: string
  preferredWindow: string
  requestedAt: string
  status: PteStatus
  grantedWindow?: string
  grantedFrom?: string
  grantedTo?: string
  followUpSent?: boolean
  notes?: string
}

const INITIAL_REQUESTS: PteRequest[] = [
  { id: 'pte1', taskTitle: 'Fix heating system', taskType: 'maintenance', propertyName: 'Downtown Loft', staffName: 'Bjorn', staffRole: 'Maintenance', reason: 'Inspect and repair heating — guest reported cold rooms', preferredWindow: 'Mar 22, 10:00–12:00', requestedAt: '2026-03-20T08:15:00', status: 'pending', followUpSent: false },
  { id: 'pte2', taskTitle: 'Back-clean kitchen', taskType: 'cleaning', propertyName: 'Harbor Studio', staffName: 'Maria', staffRole: 'Cleaner', reason: 'Deep clean of kitchen area after guest spill', preferredWindow: 'Mar 21, 14:00–15:00', requestedAt: '2026-03-20T07:30:00', status: 'pending', followUpSent: false },
  { id: 'pte3', taskTitle: 'Linen delivery', taskType: 'delivery', propertyName: 'Ocean View Apt', staffName: 'Johan', staffRole: 'Cleaner', reason: 'Fresh linen delivery — 5 min', preferredWindow: 'Flexible today', requestedAt: '2026-03-20T09:45:00', status: 'granted', grantedWindow: 'Today, 14:00–15:00', grantedFrom: '2026-03-20T14:00', grantedTo: '2026-03-20T15:00' },
  { id: 'pte4', taskTitle: 'Fire safety inspection', taskType: 'inspection', propertyName: 'Ocean View Apt', staffName: 'Anna', staffRole: 'Inspector', reason: 'Mandatory annual fire safety inspection — 20 min', preferredWindow: 'Mar 21, 09:00–11:00', requestedAt: '2026-03-19T16:00:00', status: 'denied', notes: 'Guest requested no access on this date' },
  { id: 'pte5', taskTitle: 'Fix hot tub heater', taskType: 'maintenance', propertyName: 'Sunset Villa', staffName: 'Bjorn', staffRole: 'Maintenance', reason: 'Heater fault — auto-granted (property vacant)', preferredWindow: 'Any time today', requestedAt: '2026-03-20T07:00:00', status: 'auto_granted' },
]

const STATUS_CONFIG: Record<PteStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:      { label: 'Pending',      color: '#d97706', bg: '#d9770615', icon: Clock },
  granted:      { label: 'Granted',      color: '#10b981', bg: '#10b98115', icon: Unlock },
  denied:       { label: 'Denied',       color: '#ef4444', bg: '#ef444415', icon: XCircle },
  expired:      { label: 'Expired',      color: '#6b7280', bg: '#6b728015', icon: AlertTriangle },
  auto_granted: { label: 'Auto-Granted', color: '#6366f1', bg: '#6366f115', icon: CheckCircle },
  not_required: { label: 'Not Required', color: '#6b7280', bg: '#6b728015', icon: CheckCircle },
}

const TASK_TYPE_CONFIG = {
  maintenance: { label: 'Maintenance', color: '#f59e0b' },
  cleaning:    { label: 'Cleaning',    color: '#6366f1' },
  delivery:    { label: 'Delivery',    color: '#06b6d4' },
  inspection:  { label: 'Inspection',  color: '#8b5cf6' },
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

export default function PtePage() {
  const { accent } = useRole()
  const [requests, setRequests] = useState<PteRequest[]>(INITIAL_REQUESTS)
  const [filterStatus, setFilterStatus] = useState<'all' | PteStatus>('all')
  const [grantDrawer, setGrantDrawer] = useState<PteRequest | null>(null)
  const [denyDrawer, setDenyDrawer] = useState<PteRequest | null>(null)
  const [grantDate, setGrantDate] = useState('')
  const [grantFrom, setGrantFrom] = useState('')
  const [grantTo, setGrantTo] = useState('')
  const [denyNote, setDenyNote] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const pending = requests.filter(r => r.status === 'pending')
  const granted = requests.filter(r => r.status === 'granted' || r.status === 'auto_granted')
  const denied  = requests.filter(r => r.status === 'denied' || r.status === 'expired')

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus)

  const handleGrant = () => {
    if (!grantDrawer || !grantDate || !grantFrom || !grantTo) return
    const window = `${new Date(grantDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${grantFrom}–${grantTo}`
    setRequests(prev => prev.map(r => r.id === grantDrawer.id ? {
      ...r, status: 'granted', grantedWindow: window,
      grantedFrom: `${grantDate}T${grantFrom}`, grantedTo: `${grantDate}T${grantTo}`,
    } : r))
    setGrantDrawer(null)
    setGrantDate(''); setGrantFrom(''); setGrantTo('')
    showToast(`PTE granted — ${grantDrawer.staffName} can access ${grantDrawer.propertyName}`)
  }

  const handleDeny = () => {
    if (!denyDrawer) return
    setRequests(prev => prev.map(r => r.id === denyDrawer.id ? { ...r, status: 'denied', notes: denyNote } : r))
    setDenyDrawer(null)
    setDenyNote('')
    showToast('PTE denied — staff notified')
  }

  const sendFollowUp = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, followUpSent: true } : r))
    showToast('Follow-up alert sent to Guest Services')
  }

  const FILTER_TABS = [
    { key: 'all', label: `All (${requests.length})` },
    { key: 'pending', label: `Pending (${pending.length})` },
    { key: 'granted', label: `Granted (${granted.length})` },
    { key: 'denied', label: `Denied/Expired (${denied.length})` },
  ] as const

  return (
    <div>
      <PageHeader
        title="PTE — Permission to Enter"
        subtitle="Manage staff access requests for occupied properties"
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Pending Requests', value: pending.length, color: '#d97706', bg: '#d9770615' },
          { label: 'Granted Today',    value: granted.length, color: '#10b981', bg: '#10b98115' },
          { label: 'Denied',          value: denied.length,  color: '#ef4444', bg: '#ef444415' },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px 18px', borderRadius: 10, background: s.bg, border: `1px solid ${s.color}25` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert: pending requests */}
      {pending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 20, background: '#d9770612', border: '1px solid #d9770630', borderRadius: 10 }}
        >
          <Clock size={16} color="#d97706" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#d97706' }}>{pending.length} request{pending.length > 1 ? 's' : ''} waiting for your response</span>
        </motion.div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'var(--bg-elevated)', borderRadius: 10, width: 'fit-content', marginBottom: 20 }}>
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilterStatus(t.key as typeof filterStatus)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: filterStatus === t.key ? 'var(--bg-card)' : 'transparent',
              color: filterStatus === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: filterStatus === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Request cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(req => {
          const cfg = STATUS_CONFIG[req.status]
          const taskCfg = TASK_TYPE_CONFIG[req.taskType]
          const StatusIcon = cfg.icon
          const requestedAgo = (() => {
            const diff = Date.now() - new Date(req.requestedAt).getTime()
            const hrs = Math.floor(diff / 3600000)
            const mins = Math.floor((diff % 3600000) / 60000)
            return hrs > 0 ? `${hrs}h ago` : `${mins}m ago`
          })()
          const isPending = req.status === 'pending'
          const isLongPending = isPending && (Date.now() - new Date(req.requestedAt).getTime()) > 4 * 3600000

          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid var(--border)`,
                borderLeft: `4px solid ${cfg.color}`,
                borderRadius: 10,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{req.taskTitle}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${taskCfg.color}18`, color: taskCfg.color }}>{taskCfg.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <StatusIcon size={10} />{cfg.label}
                    </span>
                  </div>

                  {/* Property + Staff */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Building2 size={12} />{req.propertyName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                      <User size={12} />{req.staffName} · {req.staffRole}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-subtle)' }}>
                      <Clock size={11} />{requestedAgo}
                    </div>
                  </div>

                  {/* Reason + preferred window */}
                  <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', marginBottom: req.status === 'granted' ? 10 : 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 2 }}>Reason</div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 6 }}>{req.reason}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 2 }}>Preferred Window</div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{req.preferredWindow}</div>
                  </div>

                  {/* Granted window */}
                  {req.status === 'granted' && req.grantedWindow && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#10b98110', border: '1px solid #10b98130' }}>
                      <Unlock size={13} color="#10b981" />
                      <div>
                        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Access granted</div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{req.grantedWindow}</div>
                      </div>
                    </div>
                  )}

                  {req.status === 'auto_granted' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#6366f110', border: '1px solid #6366f130' }}>
                      <CheckCircle size={13} color="#6366f1" />
                      <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Property vacant — PTE auto-granted</div>
                    </div>
                  )}

                  {req.notes && req.status === 'denied' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#ef444410', border: '1px solid #ef444430', marginTop: 8 }}>
                      <MessageSquare size={13} color="#ef4444" />
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.notes}</div>
                    </div>
                  )}

                  {/* Follow-up for long-pending */}
                  {isLongPending && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#d9770610', border: '1px solid #d9770630' }}>
                      <Bell size={12} color="#d97706" />
                      <span style={{ fontSize: 12, color: '#d97706', flex: 1 }}>PTE pending for 4+ hours</span>
                      <button
                        onClick={() => sendFollowUp(req.id)}
                        disabled={req.followUpSent}
                        style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #d9770640', background: req.followUpSent ? 'transparent' : '#d9770615', color: req.followUpSent ? 'var(--text-subtle)' : '#d97706', fontSize: 11, fontWeight: 600, cursor: req.followUpSent ? 'default' : 'pointer' }}
                      >
                        {req.followUpSent ? '✓ Sent' : 'Send Follow-Up'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isPending && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => setGrantDrawer(req)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <Unlock size={12} /> Grant PTE
                    </button>
                    <button
                      onClick={() => setDenyDrawer(req)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #ef444430', background: '#ef444412', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <XCircle size={12} /> Deny
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Grant PTE drawer */}
      <AppDrawer
        open={!!grantDrawer}
        onClose={() => setGrantDrawer(null)}
        title="Grant PTE"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setGrantDrawer(null)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button
              onClick={handleGrant}
              disabled={!grantDate || !grantFrom || !grantTo}
              style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: (grantDate && grantFrom && grantTo) ? '#10b981' : 'var(--bg-elevated)', color: (grantDate && grantFrom && grantTo) ? '#fff' : 'var(--text-subtle)', fontSize: 13, fontWeight: 600, cursor: (grantDate && grantFrom && grantTo) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Unlock size={14} /> Grant Access
            </button>
          </div>
        }
      >
        {grantDrawer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{grantDrawer.taskTitle}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{grantDrawer.propertyName} · {grantDrawer.staffName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>{grantDrawer.reason}</div>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#10b98108', border: '1px solid #10b98120', fontSize: 12, color: '#10b981' }}>
              Once granted, the staff member will see the access code on their task card. The code re-locks automatically when the window ends.
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Access Date</label>
              <input type="date" value={grantDate} onChange={e => setGrantDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>From</label>
                <input type="time" value={grantFrom} onChange={e => setGrantFrom(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>To</label>
                <input type="time" value={grantTo} onChange={e => setGrantTo(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
        )}
      </AppDrawer>

      {/* Deny PTE drawer */}
      <AppDrawer
        open={!!denyDrawer}
        onClose={() => setDenyDrawer(null)}
        title="Deny PTE Request"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setDenyDrawer(null)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleDeny} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <XCircle size={14} /> Deny Request
            </button>
          </div>
        }
      >
        {denyDrawer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{denyDrawer.taskTitle}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{denyDrawer.propertyName} · {denyDrawer.staffName}</div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Reason for denial (optional — shown to staff)</label>
              <textarea value={denyNote} onChange={e => setDenyNote(e.target.value)} rows={3} placeholder="e.g. Guest requested no access on this date" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
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

'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wrench, ShoppingCart, HelpCircle, Plus, Building2, Check } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

const PRIORITY_COLORS: Record<string, { bg: string; fg: string }> = {
  urgent: { bg: 'var(--status-red-bg)', fg: 'var(--status-red-fg)' },
  high: { bg: 'var(--status-red-bg)', fg: 'var(--status-red-fg)' },
  medium: { bg: 'var(--status-blue-bg)', fg: 'var(--status-blue-fg)' },
  low: { bg: 'var(--status-muted-bg)', fg: 'var(--status-muted-fg)' },
}

export default function WorkOrdersPage() {
  useRole()
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
    const stored = localStorage.getItem('afterstay_user')
    if (stored) { try { setCurrentUser(JSON.parse(stored)) } catch {} }
  }, [])

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
        const existing = JSON.parse(localStorage.getItem('afterstay_owner_work_orders') ?? '[]')
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
        localStorage.setItem('afterstay_owner_work_orders', JSON.stringify(existing))
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

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Work Orders"
        subtitle="Submit and track work orders, vendor approvals, and requests"
        action={
          <Button
            className="rounded-full px-5 gap-1.5"
            onClick={() => setNewDrawer(true)}
          >
            <Plus size={14} /> New Request
          </Button>
        }
      />

      {/* Quick action cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {(['maintenance', 'purchase', 'inquiry'] as const).map(type => {
          const Icon = TYPE_ICONS[type]
          return (
            <Card
              key={type}
              className="flex flex-col items-start gap-1.5 p-4 cursor-pointer hover:translate-y-[-2px] transition-all"
              onClick={() => { setSelectedType(type); setNewDrawer(true) }}
              role="button"
              tabIndex={0}
            >
              <div
                className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-[var(--accent-bg)]"
              >
                <Icon size={16} className="text-[var(--accent)]" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--text-primary)] mb-0.5">{TYPE_LABELS[type]}</div>
                <div className="text-[11px] text-[var(--text-muted)]">{TYPE_DESCS[type]}</div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Open requests list */}
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Open Requests</h2>
      {visibleRequests.length === 0 ? (
        <Card className="p-10 text-center text-[var(--text-muted)] text-[13px]">
          No open requests at this time.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleRequests.map(r => {
            const Icon = TYPE_ICONS[r.type]
            const prop = PROPERTIES.find(p => p.id === r.propertyId)
            const priority = PRIORITY_COLORS[r.priority] ?? PRIORITY_COLORS.low
            return (
              <Card key={r.id} className="flex items-center gap-3 p-4">
                <div
                  className="w-8 h-8 rounded-[7px] flex items-center justify-center shrink-0 bg-[var(--accent-bg)]"
                >
                  <Icon size={14} className="text-[var(--accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--text-primary)] mb-0.5">{r.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                    <Building2 size={10} />
                    {prop?.name ?? r.propertyId} · {r.date} · <span className="capitalize">{TYPE_LABELS[r.type]}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[var(--radius-sm)] capitalize"
                      style={{ background: priority.bg, color: priority.fg }}
                    >
                      {r.priority}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[var(--radius-sm)] whitespace-nowrap"
                    style={{
                      background: r.requiresOwnerApproval ? 'var(--status-red-bg)' : 'var(--status-muted-bg)',
                      color: r.requiresOwnerApproval ? 'var(--status-red-fg)' : 'var(--status-muted-fg)',
                    }}
                  >
                    {r.requiresOwnerApproval ? '👤 Owner Approval' : '🔧 Operator'}
                  </span>
                </div>
              </Card>
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
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setSelectedType(null)}
            >
              Back
            </Button>
            <Button
              className="flex-1 rounded-full"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        ) : undefined}
      >
        {!selectedType ? (
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-4">What type of request do you want to submit?</p>
            <div className="flex flex-col gap-2.5">
              {(['maintenance', 'purchase', 'inquiry'] as const).map(type => {
                const Icon = TYPE_ICONS[type]
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className="flex items-center gap-3.5 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] cursor-pointer text-left hover:bg-[var(--bg-elevated)]/80 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[var(--accent-bg)]"
                    >
                      <Icon size={18} className="text-[var(--accent)]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-primary)] mb-0.5">{TYPE_LABELS[type]}</div>
                      <div className="text-xs text-[var(--text-muted)]">{TYPE_DESCS[type]}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Property</label>
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                value={newPropertyId}
                onChange={e => setNewPropertyId(e.target.value)}
              >
                {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Title</label>
              <input
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                placeholder={`Brief ${TYPE_LABELS[selectedType].toLowerCase()} description`}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Details</label>
              <textarea
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none min-h-[90px] resize-y"
                placeholder="Describe the issue or request…"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              />
            </div>
            {selectedType === 'purchase' && (
              <>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Vendor / Supplier</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                    placeholder="e.g. Elkjøp, Lars Plumbing AS"
                    value={newVendor}
                    onChange={e => setNewVendor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Estimated Cost (NOK)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                    placeholder="0"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Priority</label>
              <select
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none"
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as Request['priority'])}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Owner Involvement</label>
              <button
                onClick={() => setInvolveOwner(v => !v)}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg border cursor-pointer text-left transition-colors ${
                  involveOwner
                    ? 'border-[var(--accent-border)] bg-[var(--accent-bg)]'
                    : 'border-[var(--border)] bg-[var(--bg-elevated)]'
                }`}
              >
                <div
                  className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors ${
                    involveOwner
                      ? 'border-[var(--accent)] bg-[var(--accent)]'
                      : 'border-[var(--border)] bg-transparent'
                  }`}
                >
                  {involveOwner && <Check size={11} className="text-white" />}
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[var(--text-primary)]">Requires Owner Approval</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Owner will be notified and must approve before work proceeds</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </AppDrawer>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[var(--status-green-fg)] text-white px-4 py-2.5 rounded-xl text-sm font-medium z-[999] shadow-lg">
          {toast}
        </div>
      )}
    </motion.div>
  )
}

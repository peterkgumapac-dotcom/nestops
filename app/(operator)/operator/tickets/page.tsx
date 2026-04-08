'use client'
import { useState, useMemo, useEffect } from 'react'
import { MessageSquare, Wrench, ShoppingCart, HelpCircle, Send, Sparkles, Plus } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import DataTable from '@/components/shared/DataTable'
import AppDrawer from '@/components/shared/AppDrawer'
import Tabs from '@/components/shared/Tabs'
import type { Column } from '@/components/shared/DataTable'
import { REQUESTS, type Request, type RequestSource } from '@/lib/data/requests'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { useRole } from '@/context/RoleContext'

type FilterStatus = 'all' | 'open' | 'pending' | 'resolved'
type FilterType = 'all' | 'maintenance' | 'purchase' | 'inquiry'

const TYPE_ICONS = {
  maintenance: Wrench,
  purchase: ShoppingCart,
  inquiry: HelpCircle,
}

const SOURCE_COLORS: Record<RequestSource, string> = {
  guest:  '#3b82f6',
  staff:  '#6b7280',
  owner:  '#059669',
  system: '#7c3aed',
}

const SOURCE_LABELS: Record<RequestSource, string> = {
  guest:  'Guest',
  staff:  'Staff',
  owner:  'Owner',
  system: 'System',
}

const STAFF_OPTIONS = ['Johan Larsson', 'Anna Kowalski', 'Bjorn Larsen']

type EnrichedRequest = Request & { propertyName: string; ownerName: string }

function enrichRequests(requests: Request[]): EnrichedRequest[] {
  return requests.map(r => ({
    ...r,
    propertyName: PROPERTIES.find(p => p.id === r.propertyId)?.name ?? r.propertyId,
    ownerName: OWNERS.find(o => o.id === r.ownerId)?.name ?? r.ownerId,
  }))
}

export default function TicketsPage() {
  const { accent } = useRole()
  const [requests, setRequests] = useState<Request[]>(REQUESTS)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [sourceFilter, setSourceFilter] = useState<RequestSource | 'all'>('all')
  const [selectedRequest, setSelectedRequest] = useState<EnrichedRequest | null>(null)
  const [comment, setComment] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // Pre-populate source filter from query param
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const src = params.get('source')
    if (src && ['guest', 'staff', 'owner', 'system'].includes(src)) {
      setSourceFilter(src as RequestSource)
    }
  }, [])

  // New Ticket drawer
  const [newDrawer, setNewDrawer] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<'maintenance' | 'purchase' | 'inquiry'>('maintenance')
  const [newSource, setNewSource] = useState<RequestSource>('staff')
  const [newPropertyId, setNewPropertyId] = useState(PROPERTIES[0]?.id ?? 'p1')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

  // Assign staff popover
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [assignedStaff, setAssignedStaff] = useState<Record<string, string>>({})

  const enriched = useMemo(() => enrichRequests(requests), [requests])

  const filtered = useMemo(() => enriched.filter(r =>
    (statusFilter === 'all' || r.status === statusFilter) &&
    (typeFilter === 'all' || r.type === typeFilter) &&
    (sourceFilter === 'all' || r.source === sourceFilter)
  ), [enriched, statusFilter, typeFilter, sourceFilter])

  const columns: Column<EnrichedRequest>[] = [
    {
      key: 'title', label: 'Title', sortable: true,
      render: r => {
        const Icon = TYPE_ICONS[r.type]
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={14} style={{ color: accent }} />
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>{r.title}</span>
              {r.reporterName && (
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{r.reporterName}</div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'source', label: 'Source',
      render: r => (
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
          background: `${SOURCE_COLORS[r.source]}18`,
          color: SOURCE_COLORS[r.source],
        }}>
          {SOURCE_LABELS[r.source]}
        </span>
      ),
    },
    { key: 'priority', label: 'Priority', render: r => <StatusBadge status={r.priority} /> },
    { key: 'propertyName', label: 'Property', sortable: true, render: r => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.propertyName}</span> },
    { key: 'ownerName', label: 'Owner', sortable: true, render: r => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.ownerName}</span> },
    { key: 'date', label: 'Date', sortable: true, render: r => <span style={{ color: 'var(--text-subtle)', fontSize: 13 }}>{r.date}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    {
      key: 'id', label: '', width: '80px',
      render: r => (
        <button
          onClick={e => { e.stopPropagation(); setSelectedRequest(r) }}
          style={{ fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
        >
          Open →
        </button>
      ),
    },
  ]

  const statusTabs = [
    { key: 'all', label: 'All', count: requests.length },
    { key: 'open', label: 'Open', count: requests.filter(r => r.status === 'open').length },
    { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { key: 'resolved', label: 'Resolved', count: requests.filter(r => r.status === 'resolved').length },
  ]

  const typePills: FilterType[] = ['all', 'maintenance', 'purchase', 'inquiry']
  const sourcePills: Array<RequestSource | 'all'> = ['all', 'guest', 'staff', 'owner', 'system']

  const handleSuggestReply = async () => {
    if (!selectedRequest) return
    setSuggesting(true)
    try {
      const res = await fetch('/api/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestTitle: selectedRequest.title, requestDescription: selectedRequest.description, requestType: selectedRequest.type }),
      })
      const data = await res.json()
      setComment(data.suggestion ?? '')
    } catch {
      setComment('Thank you for bringing this to our attention. We are looking into this and will provide an update shortly.')
    } finally {
      setSuggesting(false)
    }
  }

  const updateStatus = (id: string, status: Request['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setSelectedRequest(null)
    showToast(status === 'resolved' ? 'Ticket resolved' : status === 'pending' ? 'Ticket approved' : 'Ticket declined')
  }

  const handleNewTicket = () => {
    const prop = PROPERTIES.find(p => p.id === newPropertyId)
    const newReq: Request = {
      id: `req-${Date.now()}`,
      title: newTitle || 'New ticket',
      type: newType,
      propertyId: newPropertyId,
      ownerId: prop?.ownerId ?? 'o1',
      status: 'open',
      priority: newPriority,
      date: new Date().toISOString().split('T')[0],
      description: newDescription,
      source: newSource,
      comments: [],
    }
    setRequests(prev => [newReq, ...prev])
    setNewDrawer(false)
    setNewTitle('')
    setNewDescription('')
    showToast('Ticket created')
  }

  const handleAssign = (requestId: string, staff: string) => {
    setAssignedStaff(prev => ({ ...prev, [requestId]: staff }))
    setAssigningId(null)
    showToast(`Assigned to ${staff}`)
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }

  return (
    <div>
      <PageHeader title="Tickets" subtitle="All property tickets and requests" action={
        <button onClick={() => setNewDrawer(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          <Plus size={14} /> New Ticket
        </button>
      } />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
        <Tabs tabs={statusTabs} active={statusFilter} onChange={v => setStatusFilter(v as FilterStatus)} />
        <div style={{ display: 'flex', gap: 6 }}>
          {typePills.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${typeFilter === t ? accent : 'var(--border)'}`,
                background: typeFilter === t ? `${accent}1a` : 'transparent',
                color: typeFilter === t ? accent : 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Source filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, marginTop: 8 }}>
        {sourcePills.map(s => {
          const color = s === 'all' ? accent : SOURCE_COLORS[s as RequestSource]
          const active = sourceFilter === s
          return (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${active ? color : 'var(--border)'}`,
                background: active ? `${color}1a` : 'transparent',
                color: active ? color : 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {s === 'all' ? 'All Sources' : SOURCE_LABELS[s as RequestSource]}
            </button>
          )
        })}
      </div>

      <DataTable columns={columns} data={filtered} onRowClick={r => setSelectedRequest(r)} />

      {/* Detail Drawer */}
      <AppDrawer
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest?.title ?? ''}
        subtitle={selectedRequest ? `${selectedRequest.type} • ${selectedRequest.propertyName ?? selectedRequest.propertyId}` : ''}
        width={480}
        footer={
          selectedRequest && (
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              {selectedRequest.type === 'purchase' && selectedRequest.status !== 'resolved' && <>
                <button onClick={() => updateStatus(selectedRequest.id, 'pending')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'rgba(5,150,105,0.15)', color: 'var(--status-success)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
                <button onClick={() => updateStatus(selectedRequest.id, 'open')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.12)', color: 'var(--status-danger)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Decline</button>
              </>}
              {selectedRequest.type === 'maintenance' && selectedRequest.status !== 'resolved' && (
                <div style={{ flex: 1, position: 'relative' }}>
                  {assigningId === selectedRequest.id ? (
                    <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', zIndex: 10 }}>
                      {STAFF_OPTIONS.map(s => (
                        <button key={s} onClick={() => handleAssign(selectedRequest.id, s)} style={{ display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <button onClick={() => setAssigningId(assigningId === selectedRequest.id ? null : selectedRequest.id)} style={{ width: '100%', padding: '8px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    {assignedStaff[selectedRequest.id] ? `Assigned: ${assignedStaff[selectedRequest.id]}` : 'Assign to Staff'}
                  </button>
                </div>
              )}
              <button onClick={() => updateStatus(selectedRequest.id, 'resolved')} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Resolve</button>
            </div>
          )
        }
      >
        {selectedRequest && (
          <div>
            {/* Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                ['Status', <StatusBadge key="s" status={selectedRequest.status} />],
                ['Priority', <StatusBadge key="p" status={selectedRequest.priority} />],
                ['Source', <span key="src" style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${SOURCE_COLORS[selectedRequest.source]}18`, color: SOURCE_COLORS[selectedRequest.source] }}>{SOURCE_LABELS[selectedRequest.source]}</span>],
                ['Property', PROPERTIES.find(p => p.id === selectedRequest.propertyId)?.name],
                ['Owner', OWNERS.find(o => o.id === selectedRequest.ownerId)?.name],
                ['Date', selectedRequest.date],
                ('amount' in selectedRequest && selectedRequest.amount) ? ['Amount', `${selectedRequest.amount} ${'currency' in selectedRequest ? selectedRequest.currency : ''}`] : null,
              ].filter(Boolean).map((item, i) => (
                <div key={i}>
                  <div className="label-upper" style={{ marginBottom: 4 }}>{item![0] as string}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item![1] as React.ReactNode}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <div className="label-upper" style={{ marginBottom: 8 }}>Description</div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, background: 'var(--bg-elevated)', padding: 12, borderRadius: 8 }}>
                {selectedRequest.description}
              </p>
            </div>

            {/* Comments */}
            <div className="label-upper" style={{ marginBottom: 12 }}>Comments ({selectedRequest.comments.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {selectedRequest.comments.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', padding: '20px 0' }}>No comments yet</p>
              )}
              {selectedRequest.comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: accent, flexShrink: 0 }}>
                    {c.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{c.author}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{new Date(c.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: 8, lineHeight: 1.5 }}>{c.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div className="label-upper" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>Add Reply</div>
                <button
                  onClick={handleSuggestReply}
                  disabled={suggesting}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                >
                  <Sparkles size={12} /> {suggesting ? 'Generating…' : 'Suggest Reply'}
                </button>
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write a reply..."
                style={{ width: '100%', minHeight: 80, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', outline: 'none' }}
              />
              <button
                onClick={() => { showToast('Reply sent'); setComment('') }}
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                <Send size={13} /> Send Reply
              </button>
            </div>
          </div>
        )}
      </AppDrawer>

      {/* New Ticket Drawer */}
      <AppDrawer
        open={newDrawer}
        onClose={() => setNewDrawer(false)}
        title="New Ticket"
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setNewDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleNewTicket} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Create</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Source</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['guest', 'staff', 'owner'] as RequestSource[]).map(s => (
                <button
                  key={s}
                  onClick={() => setNewSource(s)}
                  style={{
                    flex: 1, padding: '7px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${newSource === s ? SOURCE_COLORS[s] : 'var(--border)'}`,
                    background: newSource === s ? `${SOURCE_COLORS[s]}1a` : 'transparent',
                    color: newSource === s ? SOURCE_COLORS[s] : 'var(--text-muted)',
                    fontSize: 13, fontWeight: 500, textTransform: 'capitalize',
                  }}
                >
                  {SOURCE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Type</label>
            <select style={inputStyle} value={newType} onChange={e => setNewType(e.target.value as typeof newType)}>
              <option value="maintenance">Maintenance</option>
              <option value="purchase">Purchase</option>
              <option value="inquiry">Inquiry</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Property</label>
            <select style={inputStyle} value={newPropertyId} onChange={e => setNewPropertyId(e.target.value)}>
              {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Title</label>
            <input style={inputStyle} placeholder="Brief description" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Detailed description…" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Priority</label>
            <select style={inputStyle} value={newPriority} onChange={e => setNewPriority(e.target.value as typeof newPriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
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

'use client'
import { useState } from 'react'
import { MessageSquare, Wrench, ShoppingCart, HelpCircle, Send, Sparkles } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import DataTable from '@/components/shared/DataTable'
import AppDrawer from '@/components/shared/AppDrawer'
import Tabs from '@/components/shared/Tabs'
import type { Column } from '@/components/shared/DataTable'
import { REQUESTS, type Request } from '@/lib/data/requests'
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

export default function TicketsPage() {
  const { accent } = useRole()
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [selectedRequest, setSelectedRequest] = useState<(Request & { propertyName: string; ownerName: string }) | null>(null)
  const [comment, setComment] = useState('')
  const [suggesting, setSuggesting] = useState(false)

  const enriched = REQUESTS.map(r => ({
    ...r,
    propertyName: PROPERTIES.find(p => p.id === r.propertyId)?.name ?? r.propertyId,
    ownerName: OWNERS.find(o => o.id === r.ownerId)?.name ?? r.ownerId,
  }))

  const filtered = enriched.filter(r =>
    (statusFilter === 'all' || r.status === statusFilter) &&
    (typeFilter === 'all' || r.type === typeFilter)
  )

  type EnrichedRequest = typeof enriched[0]

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
            <span style={{ fontWeight: 500 }}>{r.title}</span>
          </div>
        )
      },
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
    { key: 'all', label: 'All', count: REQUESTS.length },
    { key: 'open', label: 'Open', count: REQUESTS.filter(r => r.status === 'open').length },
    { key: 'pending', label: 'Pending', count: REQUESTS.filter(r => r.status === 'pending').length },
    { key: 'resolved', label: 'Resolved', count: REQUESTS.filter(r => r.status === 'resolved').length },
  ]

  const typePills: FilterType[] = ['all', 'maintenance', 'purchase', 'inquiry']

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

  return (
    <div>
      <PageHeader title="Requests" subtitle="All property requests and tickets" action={
        <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>New Request</button>
      } />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
        <Tabs tabs={statusTabs} active={statusFilter} onChange={v => setStatusFilter(v as FilterStatus)} />
        <div style={{ display: 'flex', gap: 6 }}>
          {typePills.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
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
              {selectedRequest.type === 'purchase' && <>
                <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'rgba(5,150,105,0.15)', color: '#34d399', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
                <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Decline</button>
              </>}
              {selectedRequest.type === 'maintenance' && (
                <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Assign to Staff</button>
              )}
              <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Resolve</button>
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
                ['Property', PROPERTIES.find(p => p.id === selectedRequest.propertyId)?.name],
                ['Owner', OWNERS.find(o => o.id === selectedRequest.ownerId)?.name],
                ['Date', selectedRequest.date],
                selectedRequest.amount ? ['Amount', `${selectedRequest.amount} ${selectedRequest.currency}`] : null,
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
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                <Send size={13} /> Send Reply
              </button>
            </div>
          </div>
        )}
      </AppDrawer>
    </div>
  )
}

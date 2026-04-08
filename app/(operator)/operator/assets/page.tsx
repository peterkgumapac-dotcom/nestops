'use client'
import { useState } from 'react'
import { HardDrive, AlertTriangle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import StatCard from '@/components/shared/StatCard'
import AppDrawer from '@/components/shared/AppDrawer'
import DataTable from '@/components/shared/DataTable'
import type { Column } from '@/components/shared/DataTable'
import { ASSETS, type Asset } from '@/lib/data/assets'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'

const CATEGORIES = ['All', 'Appliance', 'Electronics', 'Furniture']
const CONDITIONS = ['All', 'excellent', 'good', 'fair', 'poor']

export default function AssetsPage() {
  const { accent } = useRole()
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [conditionFilter, setConditionFilter] = useState('All')
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([])
  const [reportDrawer, setReportDrawer] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [addDrawer, setAddDrawer] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const totalValue = ASSETS.reduce((s, a) => s + a.valueNOK, 0)
  const needAttention = ASSETS.filter(a => a.warrantyStatus === 'expired' || a.condition === 'poor').length

  const filtered = ASSETS.filter(a =>
    (categoryFilter === 'All' || a.category === categoryFilter) &&
    (conditionFilter === 'All' || a.condition === conditionFilter)
  )

  const byProperty = PROPERTIES.map(p => ({
    property: p,
    assets: filtered.filter(a => a.propertyId === p.id),
  })).filter(g => g.assets.length > 0)

  const toggleGroup = (id: string) => setCollapsedGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const columns: Column<Asset>[] = [
    { key: 'name', label: 'Item', sortable: true, render: a => <span style={{ fontWeight: 500 }}>{a.name}</span> },
    { key: 'category', label: 'Category', render: a => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.category}</span> },
    { key: 'brand', label: 'Brand/Model', render: a => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.brand} {a.model}</span> },
    { key: 'serialNumber', label: 'Serial', render: a => <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{a.serialNumber ?? '—'}</span> },
    { key: 'warrantyStatus', label: 'Warranty', render: a => a.warrantyStatus === 'none' ? <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>—</span> : <StatusBadge status={a.warrantyStatus} /> },
    { key: 'valueNOK', label: 'Value', sortable: true, render: a => <span style={{ fontSize: 13 }}>{a.valueNOK.toLocaleString()} NOK</span> },
    { key: 'condition', label: 'Condition', render: a => <span style={{ fontSize: 12, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{a.condition}</span> },
    {
      key: 'id', label: '', width: '80px',
      render: a => (
        <button
          onClick={e => { e.stopPropagation(); setSelectedAsset(a); setReportDrawer(true) }}
          style={{ fontSize: 12, color: 'var(--status-danger)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <AlertCircle size={14} />
        </button>
      ),
    },
  ]

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }

  return (
    <div>
      <PageHeader
        title="Fixed Assets"
        subtitle="Equipment and asset tracking"
        action={<button onClick={() => setAddDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add Asset</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Items" value={ASSETS.length} icon={HardDrive} />
        <StatCard label="Portfolio Value" value={`${(totalValue / 1000).toFixed(0)}K NOK`} icon={HardDrive} animate={false} />
        <StatCard label="Need Attention" value={needAttention} icon={AlertTriangle} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `1px solid ${categoryFilter === c ? accent : 'var(--border)'}`, background: categoryFilter === c ? `${accent}1a` : 'transparent', color: categoryFilter === c ? accent : 'var(--text-muted)', fontWeight: categoryFilter === c ? 500 : 400 }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {CONDITIONS.map(c => (
            <button key={c} onClick={() => setConditionFilter(c)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `1px solid ${conditionFilter === c ? accent : 'var(--border)'}`, background: conditionFilter === c ? `${accent}1a` : 'transparent', color: conditionFilter === c ? accent : 'var(--text-muted)', fontWeight: conditionFilter === c ? 500 : 400, textTransform: 'capitalize' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped by property */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {byProperty.map(({ property, assets }) => {
          const isCollapsed = collapsedGroups.includes(property.id)
          return (
            <div key={property.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <button
                onClick={() => toggleGroup(property.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer' }}
              >
                {property.imageUrl ? (
                  <img src={property.imageUrl} alt={property.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <HardDrive size={14} style={{ color: accent }} />
                  </div>
                )}
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>{property.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{assets.length} items · {assets.reduce((s, a) => s + a.valueNOK, 0).toLocaleString()} NOK</span>
                {isCollapsed ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />}
              </button>
              {!isCollapsed && <DataTable columns={columns} data={assets} />}
            </div>
          )
        })}
      </div>

      {/* Add Asset Drawer */}
      <AppDrawer
        open={addDrawer}
        onClose={() => setAddDrawer(false)}
        title="Add Asset"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAddDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { setAddDrawer(false); showToast('Asset added') }} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Save</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Asset Name</label><input style={inputStyle} placeholder="e.g. Bosch Dishwasher" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Category</label>
            <select style={inputStyle}><option>Appliance</option><option>Electronics</option><option>Furniture</option><option>Other</option></select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Property</label>
            <select style={inputStyle}>{PROPERTIES.map(p => <option key={p.id}>{p.name}</option>)}</select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Value (NOK)</label><input type="number" style={inputStyle} placeholder="0" /></div>
        </div>
      </AppDrawer>

      {/* Report Issue Drawer */}
      <AppDrawer
        open={reportDrawer}
        onClose={() => setReportDrawer(false)}
        title="Report Issue"
        subtitle={selectedAsset?.name}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setReportDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { setReportDrawer(false); showToast('Issue reported — team notified') }} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Submit Report</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Issue Type</label>
            <select style={inputStyle}>
              <option>Damaged</option>
              <option>Missing</option>
              <option>Malfunction</option>
              <option>Warranty Claim</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Priority</label>
            <select style={inputStyle}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Describe the issue..." />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Assign Contractor</label>
            <select style={inputStyle}>
              <option>— Unassigned —</option>
              <option>Lars Plumbing AS</option>
              <option>Elcon Electricians</option>
              <option>Nordic HVAC</option>
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

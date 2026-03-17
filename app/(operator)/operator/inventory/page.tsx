'use client'
import { useState } from 'react'
import { Package, ShoppingCart, Store, AlertTriangle, Plus, Sparkles } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import DataTable from '@/components/shared/DataTable'
import AppDrawer from '@/components/shared/AppDrawer'
import Tabs from '@/components/shared/Tabs'
import type { Column } from '@/components/shared/DataTable'
import { STOCK_ITEMS, PURCHASE_ORDERS, VENDORS, type StockItem, type PurchaseOrder } from '@/lib/data/inventory'
import { useRole } from '@/context/RoleContext'

const WAREHOUSES = ['Oslo Warehouse', 'Bergen Warehouse']

export default function InventoryPage() {
  const { accent } = useRole()
  const [activeTab, setActiveTab] = useState('warehouse')
  const [selectedWarehouse, setSelectedWarehouse] = useState('Oslo Warehouse')
  const [deployDrawer, setDeployDrawer] = useState(false)
  const [receiveDrawer, setReceiveDrawer] = useState(false)
  const [poDrawer, setPoDrawer] = useState(false)
  const [vendorDrawer, setVendorDrawer] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)

  const restockAlerts = STOCK_ITEMS.filter(i => i.status !== 'ok')
  const warehouseItems = STOCK_ITEMS.filter(i => i.warehouseId === 'w1')

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }

  const stockColumns: Column<StockItem>[] = [
    { key: 'name', label: 'Item', sortable: true, render: i => <span style={{ fontWeight: 500 }}>{i.name}</span> },
    { key: 'category', label: 'Category', sortable: true, render: i => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{i.category}</span> },
    { key: 'unit', label: 'Unit', render: i => <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{i.unit}</span> },
    { key: 'inStock', label: 'In Stock', sortable: true, render: i => <span style={{ fontWeight: 600 }}>{i.inStock}</span> },
    { key: 'minLevel', label: 'Min Level', render: i => <span style={{ color: 'var(--text-muted)' }}>{i.minLevel}</span> },
    { key: 'status', label: 'Status', render: i => <StatusBadge status={i.status} /> },
    {
      key: 'id', label: 'Actions', width: '140px',
      render: i => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={e => { e.stopPropagation(); setSelectedItem(i); setDeployDrawer(true) }} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, cursor: 'pointer' }}>Deploy</button>
          <button onClick={e => { e.stopPropagation(); setSelectedItem(i); setReceiveDrawer(true) }} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Receive</button>
        </div>
      ),
    },
  ]

  const poColumns: Column<PurchaseOrder>[] = [
    { key: 'poNumber', label: 'PO #', render: p => <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{p.poNumber}</span> },
    { key: 'vendor', label: 'Vendor', sortable: true },
    { key: 'total', label: 'Total', sortable: true, render: p => <span style={{ fontWeight: 500 }}>{p.total.toLocaleString()} {p.currency}</span> },
    { key: 'destination', label: 'Destination', render: p => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.destination}</span> },
    { key: 'date', label: 'Date', sortable: true, render: p => <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{p.date}</span> },
    { key: 'status', label: 'Status', render: p => <StatusBadge status={p.status} /> },
    { key: 'id', label: '', width: '60px', render: p => <button onClick={e => { e.stopPropagation(); setSelectedPO(p); setPoDrawer(true) }} style={{ fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>View →</button> },
  ]

  const tabs = [
    { key: 'warehouse', label: 'Warehouse', count: warehouseItems.length },
    { key: 'orders', label: 'Purchase Orders', count: PURCHASE_ORDERS.length },
    { key: 'vendors', label: 'Vendors', count: VENDORS.length },
    { key: 'alerts', label: 'Restock Alerts', count: restockAlerts.length },
  ]

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Warehouse stock, orders, and vendors"
        action={
          <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            <Plus size={14} style={{ display: 'inline', marginRight: 6 }} /> New Order
          </button>
        }
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'warehouse' && (
        <div>
          {/* Warehouse selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {WAREHOUSES.map(w => (
              <button key={w} onClick={() => setSelectedWarehouse(w)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: `1px solid ${selectedWarehouse === w ? accent : 'var(--border)'}`, background: selectedWarehouse === w ? `${accent}1a` : 'transparent', color: selectedWarehouse === w ? accent : 'var(--text-muted)', fontWeight: selectedWarehouse === w ? 500 : 400 }}>
                {w}
              </button>
            ))}
          </div>
          <DataTable columns={stockColumns} data={warehouseItems} />
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Create PO</button>
          </div>
          <DataTable columns={poColumns} data={PURCHASE_ORDERS} onRowClick={p => { setSelectedPO(p); setPoDrawer(true) }} />
        </div>
      )}

      {activeTab === 'vendors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setVendorDrawer(true)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Add Vendor</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {VENDORS.map(v => (
              <div key={v.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Store size={16} style={{ color: accent }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.category}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{v.contact}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{v.email}</div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{v.assignedPropertyIds.length} assigned properties</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['critical', 'out', 'low'].map(severity => {
            const items = restockAlerts.filter(i => i.status === severity)
            if (!items.length) return null
            const colors = { critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: '#f87171' }, out: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', label: '#f87171' }, low: { bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.25)', label: '#fbbf24' } }
            const c = colors[severity as keyof typeof colors]
            return (
              <div key={severity}>
                <div className="label-upper" style={{ marginBottom: 8, color: c.label }}>{severity === 'out' ? 'Out of Stock' : severity === 'critical' ? 'Critical' : 'Low Stock'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(item => (
                    <div key={item.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.inStock} / {item.minLevel} min · {item.category}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, border: 'none', background: accent, color: '#fff', cursor: 'pointer', fontWeight: 500 }}>Deploy</button>
                        <button style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Order</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Deploy Drawer */}
      <AppDrawer
        open={deployDrawer}
        onClose={() => setDeployDrawer(false)}
        title={`Deploy: ${selectedItem?.name ?? ''}`}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setDeployDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Deploy</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Quantity</label><input type="number" defaultValue={1} style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Deploy to Property</label>
            <select style={inputStyle}>
              <option>Sunset Villa</option><option>Harbor Studio</option><option>Ocean View Apt</option><option>Downtown Loft</option>
            </select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Notes</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Optional notes..." /></div>
        </div>
      </AppDrawer>

      {/* Receive Stock Drawer */}
      <AppDrawer
        open={receiveDrawer}
        onClose={() => setReceiveDrawer(false)}
        title={`Receive Stock: ${selectedItem?.name ?? ''}`}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setReceiveDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Confirm Receipt</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Quantity Received</label><input type="number" defaultValue={1} style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Received Date</label><input type="date" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Purchase Order Reference</label><input style={inputStyle} placeholder="PO-2026-XXX" /></div>
        </div>
      </AppDrawer>

      {/* PO Detail Drawer */}
      <AppDrawer
        open={poDrawer}
        onClose={() => setPoDrawer(false)}
        title={selectedPO?.poNumber ?? 'Purchase Order'}
        subtitle={selectedPO?.vendor}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setPoDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Close</button>
          </div>
        }
      >
        {selectedPO && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[['Vendor', selectedPO.vendor], ['Date', selectedPO.date], ['Destination', selectedPO.destination], ['Status', <StatusBadge key="s" status={selectedPO.status} />]].map(([k, v], i) => (
                <div key={i}>
                  <div className="label-upper" style={{ marginBottom: 4 }}>{k as string}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{v as React.ReactNode}</div>
                </div>
              ))}
            </div>
            <div className="label-upper" style={{ marginBottom: 10 }}>Line Items</div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {selectedPO.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < selectedPO.items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.qty} {item.unit} × {item.price}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{(item.qty * item.price).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPO.total.toLocaleString()} {selectedPO.currency}</span>
              </div>
            </div>
          </div>
        )}
      </AppDrawer>

      {/* Add Vendor Drawer */}
      <AppDrawer
        open={vendorDrawer}
        onClose={() => setVendorDrawer(false)}
        title="Add Vendor"
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setVendorDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Save Vendor</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Company Name</label><input style={inputStyle} placeholder="Vendor name" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Category</label><input style={inputStyle} placeholder="e.g. Consumables, Linen" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Phone</label><input style={inputStyle} type="tel" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Email</label><input style={inputStyle} type="email" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Quick Buy URL (optional)</label><input style={inputStyle} type="url" placeholder="https://" /></div>
        </div>
      </AppDrawer>
    </div>
  )
}

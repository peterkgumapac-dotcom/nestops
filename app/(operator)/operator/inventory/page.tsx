'use client'
import { useState } from 'react'
import { Package, ShoppingCart, Store, AlertTriangle, Plus, MapPin, BarChart2, Trash2, ExternalLink, X, ChevronRight, TrendingUp, Users, HardDrive, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import StatCard from '@/components/shared/StatCard'
import DataTable from '@/components/shared/DataTable'
import type { Column } from '@/components/shared/DataTable'
import Tabs from '@/components/shared/Tabs'
import { ASSETS, type Asset } from '@/lib/data/assets'
import { PROPERTIES as PROPERTY_OBJECTS } from '@/lib/data/properties'
import {
  STOCK_ITEMS, PURCHASE_ORDERS, VENDORS, STORAGE_LOCATIONS, CONSUMPTION_TEMPLATES, STAFF_WASTE, COST_RECORDS,
  getStockItemsForUser,
  type StockItem, type PurchaseOrder, type StorageLocation, type ConsumptionTemplate,
} from '@/lib/data/inventory'
import { useRole } from '@/context/RoleContext'

const PROPERTIES = ['Sunset Villa', 'Harbor Studio', 'Ocean View Apt', 'Downtown Loft']
const PROPERTY_TYPES = ['Studio', '1BR', '2BR', '3BR', '4BR+'] as const

interface CartItem { itemId: string; name: string; qty: number; unit: string; vendorId: string; vendorName: string; price: number }

const TIER_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  auto:    { bg: 'rgba(22,163,74,0.1)',  color: 'var(--status-success)', label: 'Auto-approved' },
  manager: { bg: 'rgba(37,99,235,0.1)',  color: 'var(--status-info)', label: 'Manager approval' },
  owner:   { bg: 'rgba(239,68,68,0.1)',  color: 'var(--status-danger)', label: 'Owner approval' },
}
const APPROVAL_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:           { bg: 'rgba(217,119,6,0.1)', color: 'var(--status-warning)' },
  approved:          { bg: 'rgba(22,163,74,0.1)', color: 'var(--status-success)' },
  sent:              { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  received:          { bg: 'rgba(22,163,74,0.1)', color: 'var(--status-success)' },
  cancelled:         { bg: 'rgba(107,114,128,0.1)', color: 'var(--text-subtle)' },
  changes_requested: { bg: 'rgba(239,68,68,0.1)', color: 'var(--status-danger)' },
}

export default function InventoryPage() {
  const { accent, user } = useRole()
  const STOCK_ITEMS = getStockItemsForUser(user?.id ?? 'u1')
  const [activeTab, setActiveTab] = useState('warehouse')

  // Warehouse
  const [selectedLoc, setSelectedLoc] = useState<string>('all')
  const [deployDrawer, setDeployDrawer] = useState(false)
  const [receiveDrawer, setReceiveDrawer] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [locations, setLocations] = useState<StorageLocation[]>(STORAGE_LOCATIONS)
  const [addLocDrawer, setAddLocDrawer] = useState(false)
  const [locForm, setLocForm] = useState({ name: '', type: 'central_warehouse' as StorageLocation['type'], assignedPropertyIds: [] as string[] })
  const [deployQty, setDeployQty] = useState(1)
  const [deployProp, setDeployProp] = useState(PROPERTIES[0])

  // Templates
  const [templates, setTemplates] = useState<ConsumptionTemplate[]>(CONSUMPTION_TEMPLATES)
  const [newTmplDrawer, setNewTmplDrawer] = useState(false)
  const [tmplForm, setTmplForm] = useState({ name: '', propertyType: 'Studio' as typeof PROPERTY_TYPES[number], qtys: {} as Record<string, number> })
  const [assignTmplDrawer, setAssignTmplDrawer] = useState(false)
  const [assignTmpl, setAssignTmpl] = useState<ConsumptionTemplate | null>(null)
  const [cleaningToast, setCleaningToast] = useState('')

  // Purchase Orders
  const [orders, setOrders] = useState(PURCHASE_ORDERS)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [poDrawer, setPoDrawer] = useState(false)
  const [sendModal, setSendModal] = useState(false)
  const [poApprovals, setPoApprovals] = useState<Record<string, string>>({})

  // Vendors
  const [vendorDrawer, setVendorDrawer] = useState(false)

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [cartQtys, setCartQtys] = useState<Record<string, number>>({})
  const [createPODone, setCreatePODone] = useState(false)

  // Restock run
  const [restockRunOpen, setRestockRunOpen] = useState(false)
  const [selectedRestockProps, setSelectedRestockProps] = useState<string[]>([])

  // Assets
  const [assetCategory, setAssetCategory] = useState('All')
  const [assetCondition, setAssetCondition] = useState('All')
  const [assetCollapsed, setAssetCollapsed] = useState<string[]>([])
  const [assetReportDrawer, setAssetReportDrawer] = useState(false)
  const [assetAddDrawer, setAssetAddDrawer] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  const ASSET_CATEGORIES = ['All', 'Appliance', 'Electronics', 'Furniture']
  const ASSET_CONDITIONS = ['All', 'excellent', 'good', 'fair', 'poor']
  const filteredAssets = ASSETS.filter(a =>
    (assetCategory === 'All' || a.category === assetCategory) &&
    (assetCondition === 'All' || a.condition === assetCondition)
  )
  const assetsByProperty = PROPERTY_OBJECTS.map(p => ({
    property: p,
    assets: filteredAssets.filter(a => a.propertyId === p.id),
  })).filter(g => g.assets.length > 0)
  const toggleAssetGroup = (id: string) => setAssetCollapsed(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const assetColumns: Column<Asset>[] = [
    { key: 'name', label: 'Item', sortable: true, render: a => <span style={{ fontWeight: 500 }}>{a.name}</span> },
    { key: 'category', label: 'Category', render: a => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.category}</span> },
    { key: 'brand', label: 'Brand/Model', render: a => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.brand} {a.model}</span> },
    { key: 'serialNumber', label: 'Serial', render: a => <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{a.serialNumber ?? '—'}</span> },
    { key: 'warrantyStatus', label: 'Warranty', render: a => a.warrantyStatus === 'none' ? <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>—</span> : <StatusBadge status={a.warrantyStatus} /> },
    { key: 'valueNOK', label: 'Value', sortable: true, render: a => <span style={{ fontSize: 13 }}>{a.valueNOK.toLocaleString()} NOK</span> },
    { key: 'condition', label: 'Condition', render: a => <span style={{ fontSize: 12, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{a.condition}</span> },
    { key: 'id', label: '', width: '80px', render: a => (
      <button onClick={e => { e.stopPropagation(); setSelectedAsset(a); setAssetReportDrawer(true) }} style={{ fontSize: 12, color: 'var(--status-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
        <AlertCircle size={14} />
      </button>
    )},
  ]

  // Toast
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }
  const restockAlerts = STOCK_ITEMS.filter(i => i.status !== 'ok')
  const locIdx = locations.findIndex(l => l.id === selectedLoc)
  const chunkSize = Math.ceil(STOCK_ITEMS.length / Math.max(locations.length, 1))
  const visibleItems = selectedLoc === 'all' ? STOCK_ITEMS : STOCK_ITEMS.slice(locIdx * chunkSize, (locIdx + 1) * chunkSize)
  const pendingPOs = orders.filter(p => p.approvalStatus === 'pending')

  const addToCart = (item: StockItem) => {
    const vendorId = item.vendorIds?.[0] ?? 'v1'
    const vendor = VENDORS.find(v => v.id === vendorId)
    const price = item.costs?.find(c => c.vendorId === vendorId)?.price ?? 0
    const existing = cart.find(c => c.itemId === item.id)
    if (existing) {
      setCart(prev => prev.map(c => c.itemId === item.id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart(prev => [...prev, { itemId: item.id, name: item.name, qty: 1, unit: item.unit, vendorId, vendorName: vendor?.name ?? vendorId, price }])
      setCartQtys(prev => ({ ...prev, [item.id]: 1 }))
    }
    showToast(`Added ${item.name} to cart`)
  }

  const cartTotal = cart.reduce((s, c) => s + c.qty * c.price, 0)

  const handleCreatePOs = () => {
    const byVendor: Record<string, CartItem[]> = {}
    cart.forEach(c => { byVendor[c.vendorId] = byVendor[c.vendorId] ?? []; byVendor[c.vendorId].push(c) })
    const newPOs: PurchaseOrder[] = Object.entries(byVendor).map(([vendorId, items], i) => {
      const vendor = VENDORS.find(v => v.id === vendorId)
      const total = items.reduce((s, c) => s + c.qty * c.price, 0)
      const tier = total < 500 ? 'auto' : total < 2000 ? 'manager' : 'owner'
      return {
        id: `po_new_${i}`, poNumber: `PO-2026-${50 + i}`, vendor: vendor?.name ?? vendorId, vendorId,
        items: items.map(c => ({ name: c.name, qty: c.qty, unit: c.unit, price: c.price, vendorId })),
        total, currency: 'NOK', destination: 'Oslo Warehouse', date: '2026-03-19',
        status: 'draft', approvalTier: tier, approvalStatus: tier === 'auto' ? 'approved' : 'pending', requester: 'Operator',
      }
    })
    setOrders(prev => [...newPOs, ...prev])
    setCart([])
    setCartOpen(false)
    setCreatePODone(true)
    setActiveTab('orders')
    showToast(`${newPOs.length} PO${newPOs.length > 1 ? 's' : ''} created`)
    setTimeout(() => setCreatePODone(false), 3000)
  }

  const handleSimulateDeduct = (tmpl: ConsumptionTemplate) => {
    const itemNames = tmpl.items.map(ti => {
      const item = STOCK_ITEMS.find(s => s.id === ti.stockItemId)
      return item ? `${item.name} (−${ti.qtyPerTurnover})` : ''
    }).filter(Boolean).join(', ')
    setCleaningToast(`Cleaning complete — deducted: ${itemNames}`)
    setTimeout(() => setCleaningToast(''), 4000)
  }

  const tabs = [
    { key: 'warehouse', label: 'Warehouse', count: STOCK_ITEMS.length },
    { key: 'templates', label: 'Templates', count: templates.length },
    { key: 'orders', label: 'Purchase Orders', count: orders.length },
    { key: 'vendors', label: 'Vendors', count: VENDORS.length },
    { key: 'alerts', label: 'Restock Alerts', count: restockAlerts.length },
    { key: 'analytics', label: 'Cost Analytics' },
    { key: 'waste', label: 'Waste' },
    { key: 'assets', label: 'Assets', count: ASSETS.length },
  ]

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Warehouse, templates, orders, and cost tracking"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setRestockRunOpen(true)}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Plan Restock Run
            </button>
            <button
              onClick={() => setCartOpen(true)}
              style={{ position: 'relative', padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ShoppingCart size={14} />
              Cart
              {cart.length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 800, background: '#fff', color: accent, borderRadius: 10, padding: '0 5px', minWidth: 16, textAlign: 'center' }}>
                  {cart.reduce((s, c) => s + c.qty, 0)}
                </span>
              )}
            </button>
          </div>
        }
      />

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* ── WAREHOUSE TAB ── */}
      {activeTab === 'warehouse' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button key="all" onClick={() => setSelectedLoc('all')} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: `1px solid ${selectedLoc === 'all' ? accent : 'var(--border)'}`, background: selectedLoc === 'all' ? `${accent}1a` : 'transparent', color: selectedLoc === 'all' ? accent : 'var(--text-muted)', fontWeight: selectedLoc === 'all' ? 500 : 400 }}>
                All Stock
              </button>
              {locations.map(loc => (
                <button key={loc.id} onClick={() => setSelectedLoc(loc.id)} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: `1px solid ${selectedLoc === loc.id ? accent : 'var(--border)'}`, background: selectedLoc === loc.id ? `${accent}1a` : 'transparent', color: selectedLoc === loc.id ? accent : 'var(--text-muted)', fontWeight: selectedLoc === loc.id ? 500 : 400, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={11} />
                  {loc.name}
                </button>
              ))}
            </div>
            <button onClick={() => setAddLocDrawer(true)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Plus size={12} /> Add Location
            </button>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  {['Item', 'Category', 'Unit', 'In Stock', 'Min Level', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: i < visibleItems.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{item.name}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{item.category}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-subtle)' }}>{item.unit}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{item.inStock}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-muted)' }}>{item.minLevel}</td>
                    <td style={{ padding: '12px 14px' }}><StatusBadge status={item.status} /></td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setSelectedItem(item); setDeployDrawer(true) }} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, cursor: 'pointer' }}>Deploy</button>
                        <button onClick={() => { setSelectedItem(item); setReceiveDrawer(true) }} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Receive</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TEMPLATES TAB ── */}
      {activeTab === 'templates' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button onClick={() => setNewTmplDrawer(true)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={13} /> New Template
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {templates.map(tmpl => {
              const totalQty = tmpl.items.reduce((s, ti) => s + ti.qtyPerTurnover, 0)
              return (
                <div key={tmpl.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{tmpl.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: `${accent}18`, color: accent }}>{tmpl.propertyType}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tmpl.items.length} items · {totalQty} units per turnover</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleSimulateDeduct(tmpl)} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        Mark Cleaning Done
                      </button>
                      <button onClick={() => { setAssignTmpl(tmpl); setAssignTmplDrawer(true) }} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 7, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, cursor: 'pointer' }}>
                        Assign to Property
                      </button>
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-elevated)' }}>
                          {['Item', 'Category', 'Qty / Turnover', 'Par Alert'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tmpl.items.map((ti, idx) => {
                          const item = STOCK_ITEMS.find(s => s.id === ti.stockItemId)
                          if (!item) return null
                          const remaining = Math.floor(item.inStock / ti.qtyPerTurnover)
                          const atPar = remaining <= 2
                          return (
                            <tr key={ti.stockItemId} style={{ borderTop: idx > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
                              <td style={{ padding: '9px 12px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</td>
                              <td style={{ padding: '9px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{item.category}</td>
                              <td style={{ padding: '9px 12px', fontSize: 13, fontWeight: 600 }}>{ti.qtyPerTurnover} {item.unit}</td>
                              <td style={{ padding: '9px 12px' }}>
                                {atPar && (
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: 'var(--status-danger)' }}>
                                    ~{remaining} turnovers left
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── PURCHASE ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setCartOpen(true)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Create PO</button>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  {['PO #', 'Vendor', 'Requester', 'Total', 'Approval', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((po, i) => {
                  const tier = po.approvalTier ? TIER_COLORS[po.approvalTier] : null
                  const apSt = po.approvalStatus ? APPROVAL_STATUS_COLORS[po.approvalStatus] : null
                  const overrideStatus = poApprovals[po.id]
                  const displayApSt = overrideStatus ? APPROVAL_STATUS_COLORS[overrideStatus] : apSt
                  const displayLabel = overrideStatus ?? po.approvalStatus
                  return (
                    <tr key={po.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }} onClick={() => { setSelectedPO(po); setPoDrawer(true) }}>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 13 }}>{po.poNumber}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>{po.vendor}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{po.requester ?? '—'}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{po.total.toLocaleString()} {po.currency}</td>
                      <td style={{ padding: '12px 14px' }}>
                        {tier && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: tier.bg, color: tier.color }}>{tier.label}</span>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {displayApSt && displayLabel && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: displayApSt.bg, color: displayApSt.color, textTransform: 'capitalize' }}>
                            {displayLabel.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={e => { e.stopPropagation(); setSelectedPO(po); setPoDrawer(true) }} style={{ fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>View →</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VENDORS TAB ── */}
      {activeTab === 'vendors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setVendorDrawer(true)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Add Vendor</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {VENDORS.map(v => {
              const itemsSupplied = STOCK_ITEMS.filter(i => i.vendorIds?.includes(v.id))
              return (
                <div key={v.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Store size={16} style={{ color: accent }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{v.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.category}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>{v.contact}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{v.email}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 8 }}>{v.assignedPropertyIds.length} assigned properties · {itemsSupplied.length} items</div>
                  {v.quickBuyUrl && (
                    <a
                      href={v.quickBuyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: accent, textDecoration: 'none', padding: '4px 10px', borderRadius: 6, border: `1px solid ${accent}30`, background: `${accent}08` }}
                    >
                      <ExternalLink size={11} /> Quick Buy
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RESTOCK ALERTS TAB ── */}
      {activeTab === 'alerts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button onClick={() => setRestockRunOpen(true)} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Plan Restock Run
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(['critical', 'out', 'low'] as const).map(severity => {
              const items = restockAlerts.filter(i => i.status === severity)
              if (!items.length) return null
              const colors = {
                critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: '#f87171' },
                out:      { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', label: '#f87171' },
                low:      { bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.25)',  label: '#fbbf24' },
              }
              const c = colors[severity]
              return (
                <div key={severity}>
                  <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.label }}>
                    {severity === 'out' ? 'Out of Stock' : severity === 'critical' ? 'Critical' : 'Low Stock'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map(item => {
                      const inCart = cart.some(c => c.itemId === item.id)
                      const multiVendor = (item.costs ?? []).length > 1
                      return (
                        <div key={item.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            <div>
                              <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>{item.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.inStock} / {item.minLevel} min · {item.category}</div>
                              {multiVendor && item.costs && (
                                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                  {item.costs.map(cost => {
                                    const v = VENDORS.find(vv => vv.id === cost.vendorId)
                                    const isCheapest = cost.price === Math.min(...item.costs!.map(c => c.price))
                                    return (
                                      <span key={cost.vendorId} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: `1px solid ${isCheapest ? '#16a34a' : 'var(--border)'}`, background: isCheapest ? 'rgba(22,163,74,0.08)' : 'var(--bg-elevated)', color: isCheapest ? '#16a34a' : 'var(--text-muted)' }}>
                                        {v?.name ?? cost.vendorId}: {cost.price} NOK {isCheapest ? '✓ best' : ''}
                                      </span>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button
                                onClick={() => addToCart(item)}
                                style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: 'none', background: inCart ? '#16a34a' : accent, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <ShoppingCart size={11} /> {inCart ? 'In Cart' : 'Add to Cart'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── COST ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Month-over-month */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <BarChart2 size={15} style={{ color: accent }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Month-over-Month Spend</h3>
            </div>
            {['Jan', 'Feb', 'Mar'].map(month => {
              const total = COST_RECORDS.filter(r => r.month === month).reduce((s, r) => s + r.amount, 0)
              const maxTotal = 16000
              const pct = Math.round((total / maxTotal) * 100)
              return (
                <div key={month} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{month} 2026</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{total.toLocaleString()} NOK</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: accent, borderRadius: 4, transition: 'width 0.4s' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* By Category */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Spend by Category (All Time)</h3>
            {Array.from(new Set(COST_RECORDS.map(r => r.category))).map(cat => {
              const total = COST_RECORDS.filter(r => r.category === cat).reduce((s, r) => s + r.amount, 0)
              const maxCat = 15000
              const colors: Record<string, string> = { Consumables: '#6366f1', Linen: '#ec4899', Cleaning: '#14b8a6' }
              const color = colors[cat] ?? accent
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{total.toLocaleString()} NOK</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((total / maxCat) * 100)}%`, background: color, borderRadius: 4 }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* By Property */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Spend by Property (Mar 2026)</h3>
            {Array.from(new Set(COST_RECORDS.filter(r => r.month === 'Mar').map(r => r.property))).map(prop => {
              const total = COST_RECORDS.filter(r => r.month === 'Mar' && r.property === prop).reduce((s, r) => s + r.amount, 0)
              return (
                <div key={prop} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{prop}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{total.toLocaleString()} NOK</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── WASTE TAB ── */}
      {activeTab === 'waste' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, padding: '12px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontSize: 13, color: 'var(--status-danger)' }}>Staff members with <strong>&gt;20% over expected</strong> consumption are highlighted in red.</span>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <Users size={14} style={{ color: accent }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Staff Waste Leaderboard — W11 2026</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  {['#', 'Staff', 'Item', 'Property', 'Expected', 'Actual', 'Δ%', 'Last 4 Weeks'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAFF_WASTE.map((w, i) => {
                  const delta = w.expected === 0 ? 0 : Math.round(((w.actual - w.expected) / w.expected) * 100)
                  const isOver = delta > 20
                  return (
                    <tr key={w.id} style={{ borderTop: '1px solid var(--border-subtle)', background: isOver ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: isOver ? '#ef4444' : 'var(--text-subtle)', fontWeight: isOver ? 700 : 400 }}>{i + 1}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 13, color: isOver ? '#ef4444' : 'var(--text-primary)' }}>{w.staffName}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{w.itemName}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{w.property}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13 }}>{w.expected}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: w.actual > w.expected ? '#ef4444' : 'var(--text-primary)' }}>{w.actual}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: isOver ? 'rgba(239,68,68,0.12)' : delta > 0 ? 'rgba(217,119,6,0.1)' : 'rgba(22,163,74,0.1)', color: isOver ? '#ef4444' : delta > 0 ? '#d97706' : '#16a34a' }}>
                          {delta > 0 ? '+' : ''}{delta}%
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20 }}>
                          {w.weeks.map((val, wi) => (
                            <div key={wi} style={{ width: 8, height: `${Math.max(2, Math.min(20, Math.round((val / 100) * 20)))}px`, background: val > 20 ? '#ef4444' : accent, borderRadius: 2, transition: 'height 0.3s' }} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DRAWERS ── */}

      {/* Deploy Drawer */}
      <AppDrawer open={deployDrawer} onClose={() => setDeployDrawer(false)} title={`Deploy: ${selectedItem?.name ?? ''}`}
        footer={<div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button onClick={() => setDeployDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { setDeployDrawer(false); showToast(`Deployed ${deployQty} ${selectedItem?.unit} to ${deployProp}`) }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Deploy</button>
        </div>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Quantity</label>
            <input type="number" value={deployQty} onChange={e => setDeployQty(Number(e.target.value))} min={1} style={inputStyle} />
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Deploy to Property</label>
            <select value={deployProp} onChange={e => setDeployProp(e.target.value)} style={inputStyle}>
              {PROPERTIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Notes</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Optional notes..." />
          </div>
        </div>
      </AppDrawer>

      {/* Receive Drawer */}
      <AppDrawer open={receiveDrawer} onClose={() => setReceiveDrawer(false)} title={`Receive Delivery: ${selectedItem?.name ?? ''}`}
        footer={<div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button onClick={() => setReceiveDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { setReceiveDrawer(false); showToast('Delivery logged') }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Confirm Receipt</button>
        </div>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Vendor</label>
            <select style={inputStyle}>{VENDORS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Quantity Received</label>
            <input type="number" defaultValue={1} style={inputStyle} />
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Unit Cost (NOK)</label>
            <input type="number" defaultValue={selectedItem?.costs?.[0]?.price ?? ''} style={inputStyle} />
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>PO Reference</label>
            <input style={inputStyle} placeholder="PO-2026-XXX" />
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Received Date</label>
            <input type="date" style={inputStyle} />
          </div>
        </div>
      </AppDrawer>

      {/* Add Storage Location Drawer */}
      <AppDrawer open={addLocDrawer} onClose={() => setAddLocDrawer(false)} title="Add Storage Location"
        footer={<div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button onClick={() => setAddLocDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => {
            if (!locForm.name) return
            const newLoc: StorageLocation = { id: `loc${Date.now()}`, name: locForm.name, type: locForm.type, assignedPropertyIds: locForm.assignedPropertyIds }
            setLocations(prev => [...prev, newLoc])
            setLocForm({ name: '', type: 'central_warehouse', assignedPropertyIds: [] })
            setAddLocDrawer(false)
            showToast('Location added')
          }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Save Location</button>
        </div>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Location Name</label>
            <input value={locForm.name} onChange={e => setLocForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="e.g. Bergen Warehouse 2" />
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Type</label>
            <select value={locForm.type} onChange={e => setLocForm(f => ({ ...f, type: e.target.value as StorageLocation['type'] }))} style={inputStyle}>
              <option value="central_warehouse">Central Warehouse</option>
              <option value="group_storage">Group Storage</option>
              <option value="property_closet">Property Closet</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Assigned Properties</label>
            {PROPERTIES.map(p => (
              <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={locForm.assignedPropertyIds.includes(p)} onChange={e => {
                  setLocForm(f => ({ ...f, assignedPropertyIds: e.target.checked ? [...f.assignedPropertyIds, p] : f.assignedPropertyIds.filter(x => x !== p) }))
                }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p}</span>
              </label>
            ))}
          </div>
        </div>
      </AppDrawer>

      {/* New Template Drawer */}
      <AppDrawer open={newTmplDrawer} onClose={() => setNewTmplDrawer(false)} title="New Consumption Template"
        footer={<div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button onClick={() => setNewTmplDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => {
            if (!tmplForm.name) return
            const items = Object.entries(tmplForm.qtys).filter(([, v]) => v > 0).map(([k, v]) => ({ stockItemId: k, qtyPerTurnover: v }))
            const newTmpl: ConsumptionTemplate = { id: `tmpl${Date.now()}`, name: tmplForm.name, propertyType: tmplForm.propertyType, items }
            setTemplates(prev => [...prev, newTmpl])
            setTmplForm({ name: '', propertyType: 'Studio', qtys: {} })
            setNewTmplDrawer(false)
            showToast('Template created')
          }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Create Template</button>
        </div>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Template Name</label>
            <input value={tmplForm.name} onChange={e => setTmplForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="e.g. 3BR Premium" />
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Property Type</label>
            <select value={tmplForm.propertyType} onChange={e => setTmplForm(f => ({ ...f, propertyType: e.target.value as typeof PROPERTY_TYPES[number] }))} style={inputStyle}>
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Items per Turnover</label>
            {STOCK_ITEMS.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>{item.name}</span>
                <input
                  type="number"
                  min={0}
                  value={tmplForm.qtys[item.id] ?? 0}
                  onChange={e => setTmplForm(f => ({ ...f, qtys: { ...f.qtys, [item.id]: Number(e.target.value) } }))}
                  style={{ ...inputStyle, width: 70, textAlign: 'center' }}
                />
              </div>
            ))}
          </div>
        </div>
      </AppDrawer>

      {/* Assign Template Drawer */}
      <AppDrawer open={assignTmplDrawer} onClose={() => setAssignTmplDrawer(false)} title={`Assign: ${assignTmpl?.name ?? ''}`}
        footer={<div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button onClick={() => setAssignTmplDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { setAssignTmplDrawer(false); showToast(`Template assigned`) }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Assign</button>
        </div>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Select a property to assign this consumption template to.</p>
          {PROPERTIES.map(p => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }}>
              <input type="radio" name="assign-prop" value={p} />
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p}</span>
            </label>
          ))}
        </div>
      </AppDrawer>

      {/* Vendor Drawer */}
      <AppDrawer open={vendorDrawer} onClose={() => setVendorDrawer(false)} title="Add Vendor"
        footer={<div style={{ display: 'flex', gap: 8, width: '100%' }}>
          <button onClick={() => setVendorDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { setVendorDrawer(false); showToast('Vendor added') }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Save Vendor</button>
        </div>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Company Name</label><input style={inputStyle} placeholder="Vendor name" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Category</label><input style={inputStyle} placeholder="e.g. Consumables, Linen" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Phone</label><input style={inputStyle} type="tel" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Email</label><input style={inputStyle} type="email" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Quick Buy URL (optional)</label><input style={inputStyle} type="url" placeholder="https://" /></div>
        </div>
      </AppDrawer>

      {/* PO Detail Drawer */}
      <AppDrawer open={poDrawer} onClose={() => setPoDrawer(false)} title={selectedPO?.poNumber ?? 'Purchase Order'} subtitle={selectedPO?.vendor}
        footer={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%' }}>
            {selectedPO?.approvalStatus === 'pending' && (
              <>
                <button onClick={() => {
                  if (selectedPO) {
                    setPoApprovals(p => ({ ...p, [selectedPO.id]: 'changes_requested' }))
                    setOrders(prev => prev.map(o => o.id === selectedPO.id ? { ...o, approvalStatus: 'changes_requested' } : o))
                    showToast('Changes requested')
                  }
                }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid #d97706', background: 'transparent', color: 'var(--status-warning)', fontSize: 13, cursor: 'pointer' }}>Request Changes</button>
                <button onClick={() => {
                  if (selectedPO) {
                    setPoApprovals(p => ({ ...p, [selectedPO.id]: 'approved' }))
                    setOrders(prev => prev.map(o => o.id === selectedPO.id ? { ...o, approvalStatus: 'approved' } : o))
                    showToast('PO approved')
                  }
                }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
              </>
            )}
            {(selectedPO?.approvalStatus === 'approved' || poApprovals[selectedPO?.id ?? ''] === 'approved') && (
              <button onClick={() => { setSendModal(true) }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Send PO to Vendor
              </button>
            )}
            <button onClick={() => setPoDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Close</button>
          </div>
        }
      >
        {selectedPO && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {([
                ['Vendor', selectedPO.vendor],
                ['Date', selectedPO.date],
                ['Destination', selectedPO.destination],
                ['Requester', selectedPO.requester ?? '—'],
                ['Est. Delivery', selectedPO.estimatedDelivery ?? '—'],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Approval chain */}
            {selectedPO.approvalTier && (
              <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 8 }}>Approval Chain</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {selectedPO.total < 500 ? (
                    <span style={{ fontSize: 12, color: 'var(--status-success)' }}>✓ Auto-approved (under 500 NOK)</span>
                  ) : selectedPO.total < 2000 ? (
                    <>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: `${accent}18`, color: accent, fontWeight: 600 }}>Manager</span>
                      <ChevronRight size={12} style={{ color: 'var(--text-subtle)' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Send</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: `${accent}18`, color: accent, fontWeight: 600 }}>Manager</span>
                      <ChevronRight size={12} style={{ color: 'var(--text-subtle)' }} />
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: 'var(--status-danger)', fontWeight: 600 }}>Owner</span>
                      <ChevronRight size={12} style={{ color: 'var(--text-subtle)' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Send</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 10 }}>Line Items</div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {selectedPO.items.map((item, i) => {
                const vendor = VENDORS.find(v => v.id === item.vendorId)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < selectedPO.items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.name}</span>
                      {vendor?.quickBuyUrl && (
                        <a href={vendor.quickBuyUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, fontSize: 11, color: accent, textDecoration: 'none' }}>
                          <ExternalLink size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
                        </a>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.qty} × {item.price}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{(item.qty * item.price).toLocaleString()}</span>
                  </div>
                )
              })}
              <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPO.total.toLocaleString()} {selectedPO.currency}</span>
              </div>
            </div>
          </div>
        )}
      </AppDrawer>

      {/* ── SHOPPING CART SLIDE-IN ── */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setCartOpen(false)} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 420, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Shopping Cart</span>
              <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={18} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-subtle)', fontSize: 14 }}>
                  Cart is empty. Add items from Restock Alerts.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Group by vendor */}
                  {Array.from(new Set(cart.map(c => c.vendorId))).map(vid => {
                    const vendorItems = cart.filter(c => c.vendorId === vid)
                    const vendorTotal = vendorItems.reduce((s, c) => s + c.qty * c.price, 0)
                    const tier = vendorTotal < 500 ? 'auto' : vendorTotal < 2000 ? 'manager' : 'owner'
                    const tierInfo = TIER_COLORS[tier]
                    return (
                      <div key={vid} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{vendorItems[0].vendorName}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: tierInfo.bg, color: tierInfo.color }}>{tierInfo.label}</span>
                        </div>
                        {vendorItems.map(ci => {
                          const item = STOCK_ITEMS.find(s => s.id === ci.itemId)
                          const multiVendor = (item?.costs ?? []).length > 1
                          return (
                            <div key={ci.itemId} style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: multiVendor ? 8 : 0 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ci.name}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ci.price} NOK / {ci.unit}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <input type="number" min={1} value={ci.qty} onChange={e => setCart(prev => prev.map(c => c.itemId === ci.itemId ? { ...c, qty: Number(e.target.value) } : c))}
                                    style={{ width: 52, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, textAlign: 'center' }} />
                                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 52, textAlign: 'right', color: 'var(--text-primary)' }}>{(ci.qty * ci.price).toLocaleString()}</span>
                                  <button onClick={() => setCart(prev => prev.filter(c => c.itemId !== ci.itemId))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', display: 'flex' }}>
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                              {/* Price comparison */}
                              {multiVendor && item?.costs && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  {item.costs.map(cost => {
                                    const v = VENDORS.find(vv => vv.id === cost.vendorId)
                                    const isCurrent = cost.vendorId === ci.vendorId
                                    const isCheapest = cost.price === Math.min(...item.costs!.map(c => c.price))
                                    return (
                                      <button
                                        key={cost.vendorId}
                                        onClick={() => setCart(prev => prev.map(c => c.itemId === ci.itemId ? { ...c, vendorId: cost.vendorId, vendorName: v?.name ?? cost.vendorId, price: cost.price } : c))}
                                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: `1px solid ${isCurrent ? accent : isCheapest ? '#16a34a' : 'var(--border)'}`, background: isCurrent ? `${accent}14` : isCheapest ? 'rgba(22,163,74,0.08)' : 'transparent', color: isCurrent ? accent : isCheapest ? '#16a34a' : 'var(--text-muted)', cursor: 'pointer' }}
                                      >
                                        {v?.name ?? cost.vendorId}: {cost.price} NOK
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                        <div style={{ padding: '8px 14px', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vendor subtotal</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{vendorTotal.toLocaleString()} NOK</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Estimated Total</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{cartTotal.toLocaleString()} NOK</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 14 }}>
                  {Array.from(new Set(cart.map(c => c.vendorId))).length} PO{Array.from(new Set(cart.map(c => c.vendorId))).length > 1 ? 's' : ''} will be created (grouped by vendor)
                </div>
                <button onClick={handleCreatePOs} style={{ width: '100%', padding: '11px 0', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Create Purchase Order{Array.from(new Set(cart.map(c => c.vendorId))).length > 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SEND PO MODAL ── */}
      {sendModal && selectedPO && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setSendModal(false)} />
          <div style={{ position: 'relative', background: 'var(--bg-surface)', borderRadius: 14, padding: 28, maxWidth: 480, width: '100%', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>Send PO to Vendor</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>The following email will be sent to <strong>{selectedPO.vendor}</strong>:</p>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div>To: {VENDORS.find(v => v.id === selectedPO.vendorId)?.email ?? 'vendor@example.com'}</div>
              <div>Subject: Purchase Order {selectedPO.poNumber}</div>
              <div style={{ marginTop: 8 }}>Dear {selectedPO.vendor},</div>
              <div>Please find attached PO {selectedPO.poNumber} for {selectedPO.total.toLocaleString()} NOK.</div>
              <div>Items: {selectedPO.items.map(i => `${i.qty}× ${i.name}`).join(', ')}</div>
              <div>Deliver to: {selectedPO.destination}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSendModal(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => {
                setPoApprovals(p => ({ ...p, [selectedPO.id]: 'sent' }))
                setOrders(prev => prev.map(o => o.id === selectedPO.id ? { ...o, approvalStatus: 'sent', sentAt: new Date().toISOString() } : o))
                setSendModal(false)
                setPoDrawer(false)
                showToast(`PO ${selectedPO.poNumber} sent to ${selectedPO.vendor}`)
              }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Send PO</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PLAN RESTOCK RUN MODAL ── */}
      {restockRunOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setRestockRunOpen(false)} />
          <div style={{ position: 'relative', background: 'var(--bg-surface)', borderRadius: 14, padding: 28, maxWidth: 520, width: '100%', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>Plan Restock Run</span>
              <button onClick={() => setRestockRunOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Select properties needing restock to generate a combined shopping list by vendor.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {PROPERTIES.map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${selectedRestockProps.includes(p) ? accent : 'var(--border)'}`, cursor: 'pointer', background: selectedRestockProps.includes(p) ? `${accent}08` : 'transparent' }}>
                  <input type="checkbox" checked={selectedRestockProps.includes(p)} onChange={e => setSelectedRestockProps(prev => e.target.checked ? [...prev, p] : prev.filter(x => x !== p))} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{p}</span>
                </label>
              ))}
            </div>
            {selectedRestockProps.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                  Combined Shopping List
                </div>
                {VENDORS.map(v => {
                  const items = restockAlerts.filter(i => i.vendorIds?.includes(v.id))
                  if (!items.length) return null
                  return (
                    <div key={v.id}>
                      <div style={{ padding: '8px 14px', background: 'var(--bg-elevated)', fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', borderTop: '1px solid var(--border-subtle)' }}>{v.name}</div>
                      {items.map(item => (
                        <div key={item.id} style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Need: {item.minLevel - item.inStock} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRestockRunOpen(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Close</button>
              <button onClick={() => {
                restockAlerts.forEach(item => addToCart(item))
                setRestockRunOpen(false)
                setCartOpen(true)
              }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Add All to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSETS TAB ── */}
      {activeTab === 'assets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button onClick={() => setAssetAddDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add Asset</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total Items" value={ASSETS.length} icon={HardDrive} />
            <StatCard label="Portfolio Value" value={`${(ASSETS.reduce((s, a) => s + a.valueNOK, 0) / 1000).toFixed(0)}K NOK`} icon={HardDrive} animate={false} />
            <StatCard label="Need Attention" value={ASSETS.filter(a => a.warrantyStatus === 'expired' || a.condition === 'poor').length} icon={AlertTriangle} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {ASSET_CATEGORIES.map(c => (
                <button key={c} onClick={() => setAssetCategory(c)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `1px solid ${assetCategory === c ? accent : 'var(--border)'}`, background: assetCategory === c ? `${accent}1a` : 'transparent', color: assetCategory === c ? accent : 'var(--text-muted)', fontWeight: assetCategory === c ? 500 : 400 }}>{c}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {ASSET_CONDITIONS.map(c => (
                <button key={c} onClick={() => setAssetCondition(c)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `1px solid ${assetCondition === c ? accent : 'var(--border)'}`, background: assetCondition === c ? `${accent}1a` : 'transparent', color: assetCondition === c ? accent : 'var(--text-muted)', fontWeight: assetCondition === c ? 500 : 400, textTransform: 'capitalize' }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assetsByProperty.map(({ property, assets }) => {
              const isCollapsed = assetCollapsed.includes(property.id)
              return (
                <div key={property.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => toggleAssetGroup(property.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer' }}>
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
                  {!isCollapsed && <DataTable columns={assetColumns} data={assets} />}
                </div>
              )
            })}
          </div>

          {/* Add Asset Drawer */}
          <AppDrawer open={assetAddDrawer} onClose={() => setAssetAddDrawer(false)} title="Add Asset"
            footer={<div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAssetAddDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setAssetAddDrawer(false); showToast('Asset added') }} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Save</button>
            </div>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Asset Name</label><input style={inputStyle} placeholder="e.g. Bosch Dishwasher" /></div>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Category</label>
                <select style={inputStyle}><option>Appliance</option><option>Electronics</option><option>Furniture</option><option>Other</option></select>
              </div>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Property</label>
                <select style={inputStyle}>{PROPERTY_OBJECTS.map(p => <option key={p.id}>{p.name}</option>)}</select>
              </div>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Value (NOK)</label><input type="number" style={inputStyle} placeholder="0" /></div>
            </div>
          </AppDrawer>

          {/* Report Issue Drawer */}
          <AppDrawer open={assetReportDrawer} onClose={() => setAssetReportDrawer(false)} title="Report Issue" subtitle={selectedAsset?.name}
            footer={<div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAssetReportDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setAssetReportDrawer(false); showToast('Issue reported — team notified') }} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Submit Report</button>
            </div>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Issue Type</label>
                <select style={inputStyle}><option>Damaged</option><option>Missing</option><option>Malfunction</option><option>Warranty Claim</option><option>Other</option></select>
              </div>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Priority</label>
                <select style={inputStyle}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select>
              </div>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Describe the issue..." />
              </div>
              <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Assign Contractor</label>
                <select style={inputStyle}><option>— Unassigned —</option><option>Lars Plumbing AS</option><option>Elcon Electricians</option><option>Nordic HVAC</option></select>
              </div>
            </div>
          </AppDrawer>
        </div>
      )}

      {/* Toast */}
      {(toast || cleaningToast) && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', maxWidth: 400 }}>
          {toast || cleaningToast}
        </div>
      )}
    </div>
  )
}

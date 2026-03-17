export type StockStatus = 'ok' | 'low' | 'critical' | 'out'

export interface StockItem {
  id: string
  name: string
  category: string
  unit: string
  inStock: number
  minLevel: number
  warehouseId: string
  status: StockStatus
}

export interface PurchaseOrderItem {
  name: string
  qty: number
  unit: string
  price: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  vendor: string
  items: PurchaseOrderItem[]
  total: number
  currency: string
  destination: string
  date: string
  status: 'draft' | 'ordered' | 'received' | 'cancelled'
}

export interface Vendor {
  id: string
  name: string
  category: string
  contact: string
  email: string
  assignedPropertyIds: string[]
  quickBuyUrl?: string
}

export const STOCK_ITEMS: StockItem[] = [
  { id: 'i1', name: 'Toilet Paper (12-pack)', category: 'Consumables', unit: 'pack', inStock: 3, minLevel: 5, warehouseId: 'w1', status: 'low' },
  { id: 'i2', name: 'Hand Soap', category: 'Consumables', unit: 'bottle', inStock: 0, minLevel: 4, warehouseId: 'w1', status: 'out' },
  { id: 'i3', name: 'Dishwasher Tablets', category: 'Consumables', unit: 'box', inStock: 8, minLevel: 3, warehouseId: 'w1', status: 'ok' },
  { id: 'i4', name: 'Coffee Pods (Nespresso)', category: 'Consumables', unit: 'box', inStock: 2, minLevel: 5, warehouseId: 'w1', status: 'critical' },
  { id: 'i5', name: 'Bath Towels', category: 'Linen', unit: 'piece', inStock: 12, minLevel: 10, warehouseId: 'w1', status: 'ok' },
  { id: 'i6', name: 'Hand Towels', category: 'Linen', unit: 'piece', inStock: 4, minLevel: 8, warehouseId: 'w1', status: 'critical' },
  { id: 'i7', name: 'Pillow Protectors', category: 'Linen', unit: 'piece', inStock: 16, minLevel: 10, warehouseId: 'w1', status: 'ok' },
  { id: 'i8', name: 'Cleaning Spray (Multi)', category: 'Cleaning', unit: 'bottle', inStock: 6, minLevel: 4, warehouseId: 'w1', status: 'ok' },
]

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po1', poNumber: 'PO-2026-041', vendor: 'Nordic Supply AS', date: '2026-03-10',
    items: [{ name: 'Toilet Paper (12-pack)', qty: 10, unit: 'pack', price: 129 }, { name: 'Hand Soap', qty: 12, unit: 'bottle', price: 49 }],
    total: 1878, currency: 'NOK', destination: 'Oslo Warehouse', status: 'ordered',
  },
  {
    id: 'po2', poNumber: 'PO-2026-040', vendor: 'LinenHouse Bergen', date: '2026-03-05',
    items: [{ name: 'Bath Towels', qty: 20, unit: 'piece', price: 189 }],
    total: 3780, currency: 'NOK', destination: 'Bergen Warehouse', status: 'received',
  },
  {
    id: 'po3', poNumber: 'PO-2026-039', vendor: 'Coffee Direct', date: '2026-03-01',
    items: [{ name: 'Coffee Pods (Nespresso)', qty: 20, unit: 'box', price: 89 }],
    total: 1780, currency: 'NOK', destination: 'Oslo Warehouse', status: 'draft',
  },
]

export const VENDORS: Vendor[] = [
  { id: 'v1', name: 'Nordic Supply AS', category: 'Consumables', contact: '+47 22 33 44 55', email: 'order@nordicsupply.no', assignedPropertyIds: ['p1', 'p4'] },
  { id: 'v2', name: 'LinenHouse Bergen', category: 'Linen', contact: '+47 55 66 77 88', email: 'orders@linenhouse.no', assignedPropertyIds: ['p2', 'p3'] },
  { id: 'v3', name: 'Coffee Direct', category: 'Consumables', contact: '+47 23 45 67 89', email: 'b2b@coffeedirect.no', assignedPropertyIds: ['p1', 'p2', 'p3', 'p4'] },
]

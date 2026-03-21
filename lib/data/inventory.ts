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
  vendorIds?: string[]
  costs?: { vendorId: string; price: number }[]
}

export interface PurchaseOrderItem {
  name: string
  qty: number
  unit: string
  price: number
  vendorId?: string
}

export type POApprovalTier = 'auto' | 'manager' | 'owner'
export type POApprovalStatus = 'pending' | 'approved' | 'sent' | 'received' | 'cancelled' | 'changes_requested'

export interface PurchaseOrder {
  id: string
  poNumber: string
  vendor: string
  vendorId?: string
  items: PurchaseOrderItem[]
  total: number
  currency: string
  destination: string
  date: string
  status: 'draft' | 'ordered' | 'received' | 'cancelled'
  approvalTier?: POApprovalTier
  approvalStatus?: POApprovalStatus
  requester?: string
  estimatedDelivery?: string
  sentAt?: string
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

export interface StorageLocation {
  id: string
  name: string
  type: 'property_closet' | 'group_storage' | 'central_warehouse'
  assignedPropertyIds: string[]
}

export interface TemplateItem {
  stockItemId: string
  qtyPerTurnover: number
}

export interface ConsumptionTemplate {
  id: string
  name: string
  propertyType: 'Studio' | '1BR' | '2BR' | '3BR' | '4BR+'
  items: TemplateItem[]
}

export interface WasteRecord {
  id: string
  staffId: string
  staffName: string
  itemName: string
  expected: number
  actual: number
  week: string
  property: string
  weeks: number[]
}

export interface CostRecord {
  month: string
  category: string
  amount: number
  property: string
  vendor: string
}

export const STORAGE_LOCATIONS: StorageLocation[] = [
  { id: 'loc1', name: 'Oslo Central Warehouse', type: 'central_warehouse', assignedPropertyIds: ['p1', 'p2', 'p3', 'p4'] },
  { id: 'loc2', name: 'Sunset Villa Closet', type: 'property_closet', assignedPropertyIds: ['p1'] },
  { id: 'loc3', name: 'Bergen Group Storage', type: 'group_storage', assignedPropertyIds: ['p2', 'p3'] },
]

export const STOCK_ITEMS: StockItem[] = [
  { id: 'i1', name: 'Toilet Paper (12-pack)', category: 'Consumables', unit: 'pack', inStock: 3, minLevel: 5, warehouseId: 'w1', status: 'low', vendorIds: ['v1', 'v3'], costs: [{ vendorId: 'v1', price: 129 }, { vendorId: 'v3', price: 119 }] },
  { id: 'i2', name: 'Hand Soap', category: 'Consumables', unit: 'bottle', inStock: 0, minLevel: 4, warehouseId: 'w1', status: 'out', vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 49 }] },
  { id: 'i3', name: 'Dishwasher Tablets', category: 'Consumables', unit: 'box', inStock: 8, minLevel: 3, warehouseId: 'w1', status: 'ok', vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 89 }] },
  { id: 'i4', name: 'Coffee Pods (Nespresso)', category: 'Consumables', unit: 'box', inStock: 2, minLevel: 5, warehouseId: 'w1', status: 'critical', vendorIds: ['v3'], costs: [{ vendorId: 'v3', price: 89 }] },
  { id: 'i5', name: 'Bath Towels', category: 'Linen', unit: 'piece', inStock: 12, minLevel: 10, warehouseId: 'w1', status: 'ok', vendorIds: ['v2'], costs: [{ vendorId: 'v2', price: 189 }] },
  { id: 'i6', name: 'Hand Towels', category: 'Linen', unit: 'piece', inStock: 4, minLevel: 8, warehouseId: 'w1', status: 'critical', vendorIds: ['v2'], costs: [{ vendorId: 'v2', price: 89 }] },
  { id: 'i7', name: 'Pillow Protectors', category: 'Linen', unit: 'piece', inStock: 16, minLevel: 10, warehouseId: 'w1', status: 'ok', vendorIds: ['v2'], costs: [{ vendorId: 'v2', price: 59 }] },
  { id: 'i8', name: 'Cleaning Spray (Multi)', category: 'Cleaning', unit: 'bottle', inStock: 6, minLevel: 4, warehouseId: 'w1', status: 'ok', vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 79 }] },
]

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po1', poNumber: 'PO-2026-041', vendor: 'Nordic Supply AS', vendorId: 'v1', date: '2026-03-10',
    items: [{ name: 'Toilet Paper (12-pack)', qty: 10, unit: 'pack', price: 129, vendorId: 'v1' }, { name: 'Hand Soap', qty: 12, unit: 'bottle', price: 49, vendorId: 'v1' }],
    total: 1878, currency: 'NOK', destination: 'Oslo Warehouse', status: 'ordered',
    approvalTier: 'manager', approvalStatus: 'approved', requester: 'Anna H.', estimatedDelivery: '2026-03-22',
  },
  {
    id: 'po2', poNumber: 'PO-2026-040', vendor: 'LinenHouse Bergen', vendorId: 'v2', date: '2026-03-05',
    items: [{ name: 'Bath Towels', qty: 20, unit: 'piece', price: 189, vendorId: 'v2' }],
    total: 3780, currency: 'NOK', destination: 'Bergen Warehouse', status: 'received',
    approvalTier: 'owner', approvalStatus: 'approved', requester: 'Peter K.', estimatedDelivery: '2026-03-12',
  },
  {
    id: 'po3', poNumber: 'PO-2026-039', vendor: 'Coffee Direct', vendorId: 'v3', date: '2026-03-01',
    items: [{ name: 'Coffee Pods (Nespresso)', qty: 20, unit: 'box', price: 89, vendorId: 'v3' }],
    total: 1780, currency: 'NOK', destination: 'Oslo Warehouse', status: 'draft',
    approvalTier: 'manager', approvalStatus: 'pending', requester: 'Lars E.',
  },
  {
    id: 'po4', poNumber: 'PO-2026-042', vendor: 'Nordic Supply AS', vendorId: 'v1', date: '2026-03-17',
    items: [{ name: 'Hand Soap', qty: 8, unit: 'bottle', price: 49, vendorId: 'v1' }, { name: 'Cleaning Spray (Multi)', qty: 6, unit: 'bottle', price: 79, vendorId: 'v1' }],
    total: 866, currency: 'NOK', destination: 'Oslo Warehouse', status: 'draft',
    approvalTier: 'manager', approvalStatus: 'pending', requester: 'Sofia B.',
  },
]

export const VENDORS: Vendor[] = [
  { id: 'v1', name: 'Nordic Supply AS', category: 'Consumables', contact: '+47 22 33 44 55', email: 'order@nordicsupply.no', assignedPropertyIds: ['p1', 'p4'], quickBuyUrl: 'https://nordicsupply.no/order' },
  { id: 'v2', name: 'LinenHouse Bergen', category: 'Linen', contact: '+47 55 66 77 88', email: 'orders@linenhouse.no', assignedPropertyIds: ['p2', 'p3'], quickBuyUrl: 'https://linenhouse.no/shop' },
  { id: 'v3', name: 'Coffee Direct', category: 'Consumables', contact: '+47 23 45 67 89', email: 'b2b@coffeedirect.no', assignedPropertyIds: ['p1', 'p2', 'p3', 'p4'] },
]

export const CONSUMPTION_TEMPLATES: ConsumptionTemplate[] = [
  {
    id: 'tmpl1', name: 'Studio Standard', propertyType: 'Studio',
    items: [
      { stockItemId: 'i1', qtyPerTurnover: 1 },
      { stockItemId: 'i2', qtyPerTurnover: 1 },
      { stockItemId: 'i4', qtyPerTurnover: 2 },
      { stockItemId: 'i8', qtyPerTurnover: 1 },
    ],
  },
  {
    id: 'tmpl2', name: '2BR Standard', propertyType: '2BR',
    items: [
      { stockItemId: 'i1', qtyPerTurnover: 2 },
      { stockItemId: 'i2', qtyPerTurnover: 2 },
      { stockItemId: 'i5', qtyPerTurnover: 4 },
      { stockItemId: 'i6', qtyPerTurnover: 4 },
      { stockItemId: 'i4', qtyPerTurnover: 4 },
      { stockItemId: 'i8', qtyPerTurnover: 1 },
    ],
  },
]

export const STAFF_WASTE: WasteRecord[] = [
  { id: 'wr1', staffId: 's1', staffName: 'Anna Hansen', itemName: 'Coffee Pods (Nespresso)', expected: 4, actual: 7, week: 'W11', property: 'Sunset Villa', weeks: [5, 8, 12, 75] },
  { id: 'wr2', staffId: 's4', staffName: 'Magnus Dahl', itemName: 'Cleaning Spray (Multi)', expected: 1, actual: 2, week: 'W11', property: 'Downtown Loft', weeks: [4, 8, 15, 100] },
  { id: 'wr3', staffId: 's2', staffName: 'Lars Eriksen', itemName: 'Hand Soap', expected: 2, actual: 3, week: 'W11', property: 'Harbor Studio', weeks: [0, 10, 15, 50] },
  { id: 'wr4', staffId: 's3', staffName: 'Sofia Berg', itemName: 'Toilet Paper (12-pack)', expected: 1, actual: 1, week: 'W11', property: 'Ocean View Apt', weeks: [2, 3, 0, 0] },
]

export const COST_RECORDS: CostRecord[] = [
  { month: 'Jan', category: 'Consumables', amount: 4200, property: 'Sunset Villa', vendor: 'Nordic Supply AS' },
  { month: 'Jan', category: 'Linen', amount: 6800, property: 'Harbor Studio', vendor: 'LinenHouse Bergen' },
  { month: 'Jan', category: 'Cleaning', amount: 2100, property: 'Ocean View Apt', vendor: 'Nordic Supply AS' },
  { month: 'Feb', category: 'Consumables', amount: 3800, property: 'Sunset Villa', vendor: 'Nordic Supply AS' },
  { month: 'Feb', category: 'Linen', amount: 7200, property: 'Harbor Studio', vendor: 'LinenHouse Bergen' },
  { month: 'Feb', category: 'Cleaning', amount: 1900, property: 'Downtown Loft', vendor: 'Nordic Supply AS' },
  { month: 'Mar', category: 'Consumables', amount: 5100, property: 'Sunset Villa', vendor: 'Nordic Supply AS' },
  { month: 'Mar', category: 'Linen', amount: 3780, property: 'Bergen Group', vendor: 'LinenHouse Bergen' },
  { month: 'Mar', category: 'Cleaning', amount: 2300, property: 'Ocean View Apt', vendor: 'Nordic Supply AS' },
]

// Per-persona stock visibility (user.id keys: u1=pk, u2=sj, u3=ms, u4=bl, u5=fn, u6=mc, u7=ak)
const USER_STOCK_FILTER: Record<string, string[]> = {
  u1: ['i1','i2','i3','i4','i5','i6','i7','i8'], // Operator (pk): full visibility
  u2: ['i1','i2','i3','i4','i5','i6','i7','i8'], // Owner Sarah: all
  u3: ['i1','i2','i5','i6','i8'],                  // Cleaner Maria: cleaning + linen
  u4: ['i3','i7','i8'],                             // Maintenance Bjorn: non-linen supplies
  u5: ['i3','i4','i5','i6'],                        // Guest Services Fatima: amenities + linen
  u6: ['i1','i2','i3','i4','i5','i6','i7','i8'], // Owner Michael: all
  u7: ['i1','i2','i3','i4','i5','i6','i7','i8'], // Supervisor Anna: all
}

// Per-persona stock overrides — gives each persona a distinct starting reality
const PERSONA_STOCK_SNAPSHOTS: Record<string, { id: string; inStock: number; status: StockStatus }[]> = {
  u3: [ // Maria (Cleaner) — nearly out of everything
    { id: 'i1', inStock: 2, status: 'critical' },
    { id: 'i2', inStock: 0, status: 'out' },
    { id: 'i6', inStock: 2, status: 'critical' },
  ],
  u4: [ // Bjorn (Maintenance) — low on spray, protectors critical
    { id: 'i8', inStock: 1, status: 'critical' },
    { id: 'i7', inStock: 3, status: 'low' },
    { id: 'i3', inStock: 10, status: 'ok' },
  ],
  u5: [ // Fatima (Guest Services) — coffee nearly out, towels ok
    { id: 'i4', inStock: 1, status: 'critical' },
    { id: 'i5', inStock: 18, status: 'ok' },
    { id: 'i6', inStock: 12, status: 'ok' },
  ],
}

export function getStockItemsForUser(userId: string): StockItem[] {
  const allowedIds = USER_STOCK_FILTER[userId] ?? USER_STOCK_FILTER['u1']
  const baseItems = STOCK_ITEMS.filter(i => allowedIds.includes(i.id))

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(`nestops_stock_${userId}`)
      if (saved) {
        const overrides: { id: string; inStock: number; status: StockStatus }[] = JSON.parse(saved)
        return baseItems.map(item => {
          const ov = overrides.find(o => o.id === item.id)
          return ov ? { ...item, ...ov } : item
        })
      }
    } catch { /* fall through */ }
  }

  const snapshot = PERSONA_STOCK_SNAPSHOTS[userId]
  if (snapshot) {
    return baseItems.map(item => {
      const ov = snapshot.find(o => o.id === item.id)
      return ov ? { ...item, ...ov } : item
    })
  }
  return baseItems
}

// Pre-check-in alert data (used by operator dashboard)
export const PROPERTY_CHECKINS: { property: string; date: string; stockItemIds: string[] }[] = [
  { property: 'Sunset Villa', date: '2026-03-20', stockItemIds: ['i1', 'i2', 'i4'] },
  { property: 'Harbor Studio', date: '2026-03-21', stockItemIds: ['i6'] },
]

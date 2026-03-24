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
  forGuest?: boolean
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
  // ── BATHROOM AMENITIES (restocked for each guest) ──────────────────────
  { id: 'i1',  name: 'Toilet Paper (2-roll)',  category: 'Bathroom', unit: 'pack',   inStock: 48, minLevel: 16, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 39 }] },
  { id: 'i2',  name: 'Hand Soap',              category: 'Bathroom', unit: 'bottle', inStock: 32, minLevel: 10, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 49 }] },
  { id: 'i9',  name: 'Shampoo',                category: 'Bathroom', unit: 'bottle', inStock: 36, minLevel: 10, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 35 }] },
  { id: 'i10', name: 'Conditioner',            category: 'Bathroom', unit: 'bottle', inStock: 34, minLevel: 10, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 35 }] },
  { id: 'i11', name: 'Body Wash',              category: 'Bathroom', unit: 'bottle', inStock: 28, minLevel: 8,  warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 42 }] },
  // ── KITCHEN CONSUMABLES (restocked for each guest) ─────────────────────
  { id: 'i4',  name: 'Coffee Pods (Nespresso)',category: 'Kitchen',  unit: 'sleeve', inStock: 30, minLevel: 10, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v3'], costs: [{ vendorId: 'v3', price: 89 }] },
  { id: 'i12', name: 'Sugar Sachets',          category: 'Kitchen',  unit: 'pack',   inStock: 50, minLevel: 12, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 29 }] },
  { id: 'i13', name: 'Tea Bags',               category: 'Kitchen',  unit: 'pack',   inStock: 40, minLevel: 10, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 35 }] },
  { id: 'i3',  name: 'Dishwasher Tablets',     category: 'Kitchen',  unit: 'pack',   inStock: 24, minLevel: 6,  warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 89 }] },
  { id: 'i14', name: 'Dish Soap',              category: 'Kitchen',  unit: 'bottle', inStock: 26, minLevel: 8,  warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 39 }] },
  { id: 'i15', name: 'Kitchen Roll',           category: 'Kitchen',  unit: 'roll',   inStock: 35, minLevel: 10, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 25 }] },
  { id: 'i16', name: 'Bin Liners',             category: 'Kitchen',  unit: 'pack',   inStock: 40, minLevel: 10, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 29 }] },
  // ── LINEN (changed each turnover) ──────────────────────────────────────
  { id: 'i5',  name: 'Bath Towels',            category: 'Linen',    unit: 'piece',  inStock: 40, minLevel: 16, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v2'], costs: [{ vendorId: 'v2', price: 189 }] },
  { id: 'i6',  name: 'Hand Towels',            category: 'Linen',    unit: 'piece',  inStock: 32, minLevel: 12, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v2'], costs: [{ vendorId: 'v2', price: 89 }] },
  { id: 'i17', name: 'Face Cloths',            category: 'Linen',    unit: 'piece',  inStock: 32, minLevel: 12, warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v2'], costs: [{ vendorId: 'v2', price: 49 }] },
  { id: 'i7',  name: 'Pillow Protectors',      category: 'Linen',    unit: 'piece',  inStock: 20, minLevel: 8,  warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v2'], costs: [{ vendorId: 'v2', price: 59 }] },
  { id: 'i18', name: 'Bed Linen Set',          category: 'Linen',    unit: 'set',    inStock: 20, minLevel: 8,  warehouseId: 'w1', status: 'ok', forGuest: true,  vendorIds: ['v2'], costs: [{ vendorId: 'v2', price: 349 }] },
  // ── CLEANING SUPPLIES (cleaner's tools — NOT restocked for guests) ──────
  { id: 'i8',  name: 'Cleaning Spray (Multi)', category: 'Cleaning Supplies', unit: 'bottle', inStock: 10, minLevel: 4, warehouseId: 'w1', status: 'ok', forGuest: false, vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 79 }] },
  { id: 'i19', name: 'Floor Cleaner',          category: 'Cleaning Supplies', unit: 'bottle', inStock: 8,  minLevel: 3, warehouseId: 'w1', status: 'ok', forGuest: false, vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 69 }] },
  { id: 'i20', name: 'Toilet Cleaner',         category: 'Cleaning Supplies', unit: 'bottle', inStock: 12, minLevel: 4, warehouseId: 'w1', status: 'ok', forGuest: false, vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 49 }] },
  { id: 'i21', name: 'Rubber Gloves',          category: 'Cleaning Supplies', unit: 'pair',   inStock: 20, minLevel: 6, warehouseId: 'w1', status: 'ok', forGuest: false, vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 29 }] },
  { id: 'i22', name: 'Microfibre Cloths',      category: 'Cleaning Supplies', unit: 'pack',   inStock: 15, minLevel: 4, warehouseId: 'w1', status: 'ok', forGuest: false, vendorIds: ['v1'], costs: [{ vendorId: 'v1', price: 59 }] },
  // ── UPSELL ITEMS (physical items delivered per upsell request) ──────────────
  { id: 'u1',  name: 'Travel Cot',           category: 'Upsell Items',        unit: 'piece',  inStock: 4,  minLevel: 2, warehouseId: 'w1', status: 'ok', forGuest: true  },
  { id: 'u2',  name: 'High Chair',            category: 'Upsell Items',        unit: 'piece',  inStock: 3,  minLevel: 1, warehouseId: 'w1', status: 'ok', forGuest: true  },
  { id: 'u3',  name: 'Baby Bath Seat',        category: 'Upsell Items',        unit: 'piece',  inStock: 3,  minLevel: 1, warehouseId: 'w1', status: 'ok', forGuest: true  },
  { id: 'u4',  name: 'Extra Pillow',          category: 'Upsell Items',        unit: 'piece',  inStock: 12, minLevel: 4, warehouseId: 'w1', status: 'ok', forGuest: true  },
  { id: 'u5',  name: 'Extra Blanket',         category: 'Upsell Items',        unit: 'piece',  inStock: 8,  minLevel: 3, warehouseId: 'w1', status: 'ok', forGuest: true  },
  { id: 'u6',  name: 'Air Mattress (Single)', category: 'Upsell Items',        unit: 'piece',  inStock: 4,  minLevel: 2, warehouseId: 'w1', status: 'ok', forGuest: true  },
  { id: 'u7',  name: 'Welcome Basket Kit',    category: 'Upsell Items',        unit: 'kit',    inStock: 6,  minLevel: 3, warehouseId: 'w1', status: 'ok', forGuest: true  },
  { id: 'u8',  name: 'Champagne Bottle',      category: 'Upsell Items',        unit: 'bottle', inStock: 8,  minLevel: 2, warehouseId: 'w1', status: 'ok', forGuest: true  },
  { id: 'u9',  name: 'Fruit Basket',          category: 'Upsell Items',        unit: 'basket', inStock: 5,  minLevel: 2, warehouseId: 'w1', status: 'ok', forGuest: true  },
  { id: 'u10', name: 'Beach Kit',             category: 'Upsell Items',        unit: 'set',    inStock: 3,  minLevel: 1, warehouseId: 'w1', status: 'ok', forGuest: true  },
  // ── OPERATIONS EQUIPMENT ────────────────────────────────────────────────────
  { id: 'e1',  name: 'Vacuum Bags',           category: 'Operations Equipment', unit: 'pack',  inStock: 10, minLevel: 3, warehouseId: 'w1', status: 'ok', forGuest: false },
  { id: 'e2',  name: 'Mop Heads',             category: 'Operations Equipment', unit: 'piece', inStock: 8,  minLevel: 2, warehouseId: 'w1', status: 'ok', forGuest: false },
  { id: 'e3',  name: 'Laundry Bags',          category: 'Operations Equipment', unit: 'piece', inStock: 15, minLevel: 4, warehouseId: 'w1', status: 'ok', forGuest: false },
  { id: 'e4',  name: 'Extension Cord (5m)',   category: 'Operations Equipment', unit: 'piece', inStock: 4,  minLevel: 1, warehouseId: 'w1', status: 'ok', forGuest: false },
]

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po1', poNumber: 'PO-2026-041', vendor: 'Nordic Supply AS', vendorId: 'v1', date: '2026-03-10',
    items: [{ name: 'Toilet Paper (2-roll)', qty: 10, unit: 'pack', price: 129, vendorId: 'v1' }, { name: 'Hand Soap', qty: 12, unit: 'bottle', price: 49, vendorId: 'v1' }],
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
    items: [{ name: 'Coffee Pods (Nespresso)', qty: 20, unit: 'sleeve', price: 89, vendorId: 'v3' }],
    total: 1780, currency: 'NOK', destination: 'Oslo Warehouse', status: 'draft',
    approvalTier: 'manager', approvalStatus: 'pending', requester: 'Lars E.',
  },
  {
    id: 'po4', poNumber: 'PO-2026-042', vendor: 'Nordic Supply AS', vendorId: 'v1', date: '2026-03-17',
    items: [{ name: 'Hand Soap', qty: 8, unit: 'bottle', price: 49, vendorId: 'v1' }],
    total: 392, currency: 'NOK', destination: 'Oslo Warehouse', status: 'draft',
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
      { stockItemId: 'i1',  qtyPerTurnover: 1 },  // 1 pack TP (2 rolls)
      { stockItemId: 'i2',  qtyPerTurnover: 1 },  // 1 hand soap
      { stockItemId: 'i9',  qtyPerTurnover: 1 },  // 1 shampoo
      { stockItemId: 'i10', qtyPerTurnover: 1 },  // 1 conditioner
      { stockItemId: 'i11', qtyPerTurnover: 1 },  // 1 body wash
      { stockItemId: 'i4',  qtyPerTurnover: 1 },  // 1 sleeve coffee pods
      { stockItemId: 'i12', qtyPerTurnover: 1 },  // 1 pack sugar sachets
      { stockItemId: 'i13', qtyPerTurnover: 1 },  // 1 pack tea bags
      { stockItemId: 'i3',  qtyPerTurnover: 1 },  // 1 pack dishwasher tablets
      { stockItemId: 'i16', qtyPerTurnover: 1 },  // 1 pack bin liners
      { stockItemId: 'i5',  qtyPerTurnover: 2 },  // 2 bath towels
      { stockItemId: 'i6',  qtyPerTurnover: 2 },  // 2 hand towels
      { stockItemId: 'i17', qtyPerTurnover: 2 },  // 2 face cloths
      { stockItemId: 'i18', qtyPerTurnover: 1 },  // 1 bed linen set
    ],
  },
  {
    id: 'tmpl3', name: '1BR Standard', propertyType: '1BR',
    items: [
      { stockItemId: 'i1',  qtyPerTurnover: 1 },
      { stockItemId: 'i2',  qtyPerTurnover: 1 },
      { stockItemId: 'i9',  qtyPerTurnover: 1 },
      { stockItemId: 'i10', qtyPerTurnover: 1 },
      { stockItemId: 'i11', qtyPerTurnover: 1 },
      { stockItemId: 'i4',  qtyPerTurnover: 1 },
      { stockItemId: 'i12', qtyPerTurnover: 1 },
      { stockItemId: 'i13', qtyPerTurnover: 1 },
      { stockItemId: 'i3',  qtyPerTurnover: 1 },
      { stockItemId: 'i14', qtyPerTurnover: 1 },
      { stockItemId: 'i15', qtyPerTurnover: 1 },
      { stockItemId: 'i16', qtyPerTurnover: 1 },
      { stockItemId: 'i5',  qtyPerTurnover: 2 },
      { stockItemId: 'i6',  qtyPerTurnover: 2 },
      { stockItemId: 'i17', qtyPerTurnover: 2 },
      { stockItemId: 'i7',  qtyPerTurnover: 2 },
      { stockItemId: 'i18', qtyPerTurnover: 1 },
    ],
  },
  {
    id: 'tmpl2', name: '2BR Standard', propertyType: '2BR',
    items: [
      { stockItemId: 'i1',  qtyPerTurnover: 2 },
      { stockItemId: 'i2',  qtyPerTurnover: 2 },
      { stockItemId: 'i9',  qtyPerTurnover: 2 },
      { stockItemId: 'i10', qtyPerTurnover: 2 },
      { stockItemId: 'i11', qtyPerTurnover: 2 },
      { stockItemId: 'i4',  qtyPerTurnover: 2 },
      { stockItemId: 'i12', qtyPerTurnover: 2 },
      { stockItemId: 'i13', qtyPerTurnover: 2 },
      { stockItemId: 'i3',  qtyPerTurnover: 1 },
      { stockItemId: 'i14', qtyPerTurnover: 1 },
      { stockItemId: 'i15', qtyPerTurnover: 1 },
      { stockItemId: 'i16', qtyPerTurnover: 2 },
      { stockItemId: 'i5',  qtyPerTurnover: 4 },
      { stockItemId: 'i6',  qtyPerTurnover: 4 },
      { stockItemId: 'i17', qtyPerTurnover: 4 },
      { stockItemId: 'i7',  qtyPerTurnover: 4 },
      { stockItemId: 'i18', qtyPerTurnover: 2 },
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
  u1: ['i1','i2','i3','i4','i5','i6','i7','i8','i9','i10','i11','i12','i13','i14','i15','i16','i17','i18','i19','i20','i21','i22'],
  u2: ['i1','i2','i3','i4','i5','i6','i7','i8','i9','i10','i11','i12','i13','i14','i15','i16','i17','i18','i19','i20','i21','i22'],
  u3: ['i1','i2','i3','i4','i5','i6','i9','i10','i11','i12','i13','i14','i15','i16','i17','i18'],
  u4: ['i8','i19','i20','i21','i22'],
  u5: ['i1','i2','i3','i4','i5','i6','i9','i10','i11','i12','i13','i16','i17','i18'],
  u6: ['i1','i2','i3','i4','i5','i6','i7','i8','i9','i10','i11','i12','i13','i14','i15','i16','i17','i18','i19','i20','i21','i22'],
  u7: ['i1','i2','i3','i4','i5','i6','i7','i8','i9','i10','i11','i12','i13','i14','i15','i16','i17','i18','i19','i20','i21','i22'],
}

// Per-persona stock overrides — gives each persona a distinct starting reality
const PERSONA_STOCK_SNAPSHOTS: Record<string, { id: string; inStock: number; status: StockStatus }[]> = {
  u3: [
    { id: 'i1',  inStock: 6,  status: 'low' },
    { id: 'i9',  inStock: 3,  status: 'critical' },
    { id: 'i10', inStock: 4,  status: 'low' },
    { id: 'i4',  inStock: 4,  status: 'low' },
    { id: 'i18', inStock: 5,  status: 'low' },
  ],
  u4: [
    { id: 'i8',  inStock: 1, status: 'critical' },
    { id: 'i19', inStock: 2, status: 'low' },
    { id: 'i21', inStock: 3, status: 'low' },
  ],
  u5: [
    { id: 'i4',  inStock: 2, status: 'critical' },
    { id: 'i5',  inStock: 18, status: 'ok' },
    { id: 'i6',  inStock: 12, status: 'ok' },
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

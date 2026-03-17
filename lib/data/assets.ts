export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor'
export type WarrantyStatus = 'valid' | 'expiring' | 'expired' | 'none'

export interface Asset {
  id: string
  name: string
  category: string
  brand: string
  model: string
  serialNumber?: string
  propertyId: string
  condition: AssetCondition
  warrantyExpiry?: string
  warrantyStatus: WarrantyStatus
  purchaseDate: string
  valueNOK: number
}

export const ASSETS: Asset[] = [
  { id: 'a1', name: 'Washing Machine', category: 'Appliance', brand: 'Miele', model: 'WCG360 WPS', serialNumber: 'MW-20230441', propertyId: 'p1', condition: 'good', warrantyExpiry: '2026-09-01', warrantyStatus: 'valid', purchaseDate: '2023-09-01', valueNOK: 8900 },
  { id: 'a2', name: 'Dishwasher', category: 'Appliance', brand: 'Bosch', model: 'SMS4ENI06E', serialNumber: 'BDW-20220318', propertyId: 'p1', condition: 'fair', warrantyExpiry: '2025-03-18', warrantyStatus: 'expired', purchaseDate: '2022-03-18', valueNOK: 6500 },
  { id: 'a3', name: 'Smart TV 55"', category: 'Electronics', brand: 'Samsung', model: 'QE55Q80C', serialNumber: 'ST-20240112', propertyId: 'p1', condition: 'excellent', warrantyExpiry: '2027-01-12', warrantyStatus: 'valid', purchaseDate: '2024-01-12', valueNOK: 12000 },
  { id: 'a4', name: 'Sofa (3-seater)', category: 'Furniture', brand: 'IKEA', model: 'KIVIK', propertyId: 'p1', condition: 'good', warrantyStatus: 'none', purchaseDate: '2022-06-15', valueNOK: 4500 },
  { id: 'a5', name: 'Coffee Machine', category: 'Appliance', brand: 'Nespresso', model: 'Vertuo Next', serialNumber: 'NV-20230815', propertyId: 'p2', condition: 'excellent', warrantyExpiry: '2026-08-15', warrantyStatus: 'valid', purchaseDate: '2023-08-15', valueNOK: 1800 },
  { id: 'a6', name: 'Smart TV 43"', category: 'Electronics', brand: 'LG', model: 'OLED43C3', serialNumber: 'LG-20230620', propertyId: 'p2', condition: 'good', warrantyExpiry: '2026-06-20', warrantyStatus: 'expiring', purchaseDate: '2023-06-20', valueNOK: 9500 },
  { id: 'a7', name: 'Air Conditioner', category: 'Appliance', brand: 'Mitsubishi', model: 'MSZ-AP25VG', serialNumber: 'AC-20220901', propertyId: 'p3', condition: 'good', warrantyExpiry: '2027-09-01', warrantyStatus: 'valid', purchaseDate: '2022-09-01', valueNOK: 18000 },
  { id: 'a8', name: 'Dining Table (6-seat)', category: 'Furniture', brand: 'BoConcept', model: 'Milano', propertyId: 'p3', condition: 'excellent', warrantyStatus: 'none', purchaseDate: '2023-02-10', valueNOK: 14000 },
  { id: 'a9', name: 'Refrigerator', category: 'Appliance', brand: 'Siemens', model: 'KS36VVIEP', serialNumber: 'RF-20210705', propertyId: 'p4', condition: 'good', warrantyExpiry: '2026-07-05', warrantyStatus: 'expiring', purchaseDate: '2021-07-05', valueNOK: 11000 },
  { id: 'a10', name: 'Washer/Dryer Combo', category: 'Appliance', brand: 'Electrolux', model: 'EWW1486HDW', serialNumber: 'WD-20231101', propertyId: 'p4', condition: 'excellent', warrantyExpiry: '2028-11-01', warrantyStatus: 'valid', purchaseDate: '2023-11-01', valueNOK: 9800 },
]

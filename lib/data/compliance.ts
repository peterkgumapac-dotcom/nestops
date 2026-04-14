export type ComplianceStatus = 'valid' | 'expiring' | 'expired' | 'missing'

export interface ComplianceDocument {
  id: string
  category: string
  propertyId: string
  issuer: string
  issuedDate?: string
  expiryDate?: string
  status: ComplianceStatus
  notes?: string
  fileUrl?: string
}

export const COMPLIANCE_DOCS: ComplianceDocument[] = [
  { id: 'cd1', category: 'Fire Safety Certificate', propertyId: 'p1', issuer: 'Oslo Brannvesen', issuedDate: '2024-01-15', expiryDate: '2027-01-15', status: 'valid', notes: 'Annual inspection passed' },
  { id: 'cd2', category: 'Fire Safety Certificate', propertyId: 'p2', issuer: 'Bergen Kommune', issuedDate: '2023-11-01', expiryDate: '2025-11-01', status: 'expired' },
  { id: 'cd3', category: 'Fire Safety Certificate', propertyId: 'p3', issuer: 'Stavanger Brann', issuedDate: '2025-01-10', expiryDate: '2026-07-10', status: 'expiring' },
  { id: 'cd4', category: 'Fire Safety Certificate', propertyId: 'p4', issuer: 'Oslo Brannvesen', issuedDate: '2024-06-01', expiryDate: '2026-06-01', status: 'valid' },
  { id: 'cd5', category: 'Electrical Inspection', propertyId: 'p1', issuer: 'Nelfo Certified', issuedDate: '2023-05-20', expiryDate: '2027-05-20', status: 'valid' },
  { id: 'cd6', category: 'Electrical Inspection', propertyId: 'p2', issuer: 'Elcon AS', issuedDate: '2024-08-15', expiryDate: '2027-08-15', status: 'valid' },
  { id: 'cd7', category: 'Electrical Inspection', propertyId: 'p3', issuer: 'Nelfo Certified', issuedDate: '2022-03-10', expiryDate: '2025-03-10', status: 'expired' },
  { id: 'cd8', category: 'Electrical Inspection', propertyId: 'p4', issuer: 'Elcon AS', status: 'missing' },
  { id: 'cd9', category: 'Short-Term Rental License', propertyId: 'p1', issuer: 'Oslo Kommune', issuedDate: '2024-01-01', expiryDate: '2027-01-01', status: 'valid' },
  { id: 'cd10', category: 'Short-Term Rental License', propertyId: 'p2', issuer: 'Bergen Kommune', issuedDate: '2023-06-15', expiryDate: '2026-06-15', status: 'expiring' },
  { id: 'cd11', category: 'Short-Term Rental License', propertyId: 'p3', issuer: 'Stavanger Kommune', issuedDate: '2024-03-01', expiryDate: '2027-03-01', status: 'valid' },
  { id: 'cd12', category: 'Short-Term Rental License', propertyId: 'p4', issuer: 'Oslo Kommune', status: 'missing' },
  { id: 'cd13', category: 'Building Insurance', propertyId: 'p1', issuer: 'Gjensidige', issuedDate: '2025-01-01', expiryDate: '2027-01-01', status: 'valid' },
  { id: 'cd14', category: 'Building Insurance', propertyId: 'p2', issuer: 'Tryg', issuedDate: '2024-04-01', expiryDate: '2027-04-01', status: 'valid' },
  { id: 'cd15', category: 'Building Insurance', propertyId: 'p3', issuer: 'Gjensidige', issuedDate: '2023-07-01', expiryDate: '2025-07-01', status: 'expired' },
  { id: 'cd16', category: 'Building Insurance', propertyId: 'p4', issuer: 'If Forsikring', status: 'missing' },
]

export interface Approval {
  id: string
  title: string
  property: string
  propertyId: string
  amount: number
  currency: string
  category: string
  description: string
  requestedBy: string
}

export const APPROVALS: Approval[] = [
  { id: 'a1', title: 'Emergency Plumbing Repair', property: 'Sunset Villa', propertyId: 'p1', amount: 4800, currency: 'NOK', category: 'Maintenance', description: 'Burst pipe under kitchen sink. Immediate repair required before next guest arrival.', requestedBy: 'Lars Plumbing AS' },
  { id: 'a2', title: 'Replace Dishwasher', property: 'Sunset Villa', propertyId: 'p1', amount: 9200, currency: 'NOK', category: 'Appliance', description: 'Current unit is 8 years old and leaking. Bosch SMS6ZCW00E recommended.', requestedBy: 'Peter K.' },
  { id: 'a3', title: 'New Outdoor Furniture Set', property: 'Harbor Studio', propertyId: 'p2', amount: 6400, currency: 'NOK', category: 'Furniture', description: 'Patio furniture worn out. 4-piece rattan set from Jysk would improve guest reviews.', requestedBy: 'Peter K.' },
]

export interface Owner {
  id: string
  name: string
  email: string
  phone: string
  propertyIds: string[]
  status: 'active' | 'inactive'
  joinedDate: string
}

export const OWNERS: Owner[] = [
  { id: 'o1', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+47 900 11 222', propertyIds: ['p1', 'p2'], status: 'active', joinedDate: '2023-01-15' },
  { id: 'o2', name: 'Michael Chen', email: 'michael@example.com', phone: '+47 900 33 444', propertyIds: ['p3'], status: 'active', joinedDate: '2023-04-02' },
  { id: 'o3', name: 'Emily Davis', email: 'emily@example.com', phone: '+47 900 55 666', propertyIds: ['p4'], status: 'active', joinedDate: '2023-07-18' },
  { id: 'o4', name: 'David Kim', email: 'david@example.com', phone: '+47 900 77 888', propertyIds: ['p5'], status: 'inactive', joinedDate: '2022-11-05' },
]

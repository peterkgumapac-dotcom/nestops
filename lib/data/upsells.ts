export type UpsellCategory = 'arrival' | 'departure' | 'experience' | 'transport' | 'extras'
export type ConditionField = 'stay_length' | 'booking_source' | 'checkin_day' | 'guests' | 'property_type' | 'group'
export type ConditionOperator = 'is' | 'is_not' | '>' | '<' | '>='

export interface UpsellCondition {
  id: string
  field: ConditionField
  operator: ConditionOperator
  value: string
}

export interface UpsellRule {
  id: string
  title: string
  description: string
  price: number
  currency: 'NOK' | 'USD' | 'EUR'
  category: UpsellCategory
  enabled: boolean
  targeting: 'all' | 'groups' | 'properties'
  targetGroupIds: string[]
  targetPropertyIds: string[]
  conditions: UpsellCondition[]
  imageUrl?: string
  ctaLabel?: string
  approvalType: 'auto' | 'cleaner_required'
  paymentMode:  'auto_charge' | 'auth_hold'
  cleanerVisible?: boolean  // true = appears in cleaner upsell awareness section
}

export const PROPERTY_GROUPS = [
  { id: 'g1', name: 'Oslo Portfolio',     color: '#7c3aed', propertyIds: ['p1', 'p4'] },
  { id: 'g2', name: 'Coastal Properties', color: '#059669', propertyIds: ['p2', 'p3'] },
  { id: 'g3', name: 'Mountain & Nature',  color: '#d97706', propertyIds: ['p5'] },
]

export const UPSELL_RULES: UpsellRule[] = [
  {
    id: 'ur1',
    title: 'Early Check-in (+2h)',
    description: 'Check in 2 hours before standard time',
    price: 350,
    currency: 'NOK',
    category: 'arrival',
    enabled: true,
    targeting: 'all',
    targetGroupIds: [],
    targetPropertyIds: [],
    conditions: [],
    ctaLabel: 'Book Now',
    approvalType: 'cleaner_required',
    paymentMode:  'auth_hold',
    cleanerVisible: true,
  },
  {
    id: 'ur2',
    title: 'Late Checkout (+2h)',
    description: 'Check out 2 hours after standard time',
    price: 350,
    currency: 'NOK',
    category: 'departure',
    enabled: true,
    targeting: 'all',
    targetGroupIds: [],
    targetPropertyIds: [],
    conditions: [],
    ctaLabel: 'Add to Stay',
    approvalType: 'cleaner_required',
    paymentMode:  'auth_hold',
    cleanerVisible: true,
  },
  {
    id: 'ur3',
    title: 'Airport Transfer',
    description: 'Private car transfer to/from Oslo Airport',
    price: 850,
    currency: 'NOK',
    category: 'transport',
    enabled: true,
    targeting: 'groups',
    targetGroupIds: ['g1'],
    targetPropertyIds: [],
    conditions: [],
    ctaLabel: 'Book Transfer',
    approvalType: 'auto',
    paymentMode:  'auto_charge',
    cleanerVisible: false,
  },
  {
    id: 'ur4',
    title: 'Welcome Basket',
    description: 'Local produce, wine & snacks on arrival',
    price: 250,
    currency: 'NOK',
    category: 'extras',
    enabled: true,
    targeting: 'all',
    targetGroupIds: [],
    targetPropertyIds: [],
    conditions: [
      { id: 'c1', field: 'stay_length', operator: '>=', value: '3' },
    ],
    ctaLabel: 'Add to Stay',
    approvalType: 'auto',
    paymentMode:  'auto_charge',
    cleanerVisible: true,
  },
  {
    id: 'ur5',
    title: 'Local Food Tour',
    description: 'Guided coastal food experience (3 hours)',
    price: 650,
    currency: 'NOK',
    category: 'experience',
    enabled: true,
    targeting: 'groups',
    targetGroupIds: ['g2'],
    targetPropertyIds: [],
    conditions: [
      { id: 'c2', field: 'guests', operator: '>=', value: '2' },
    ],
    ctaLabel: 'Book Tour',
    approvalType: 'auto',
    paymentMode:  'auto_charge',
    cleanerVisible: false,
  },
  {
    id: 'ur6',
    title: 'Mid-Stay Refresh',
    description: 'Linen change, towel swap & light clean',
    price: 400,
    currency: 'NOK',
    category: 'extras',
    enabled: true,
    targeting: 'all',
    targetGroupIds: [],
    targetPropertyIds: [],
    conditions: [
      { id: 'c3', field: 'stay_length', operator: '>', value: '5' },
    ],
    ctaLabel: 'Schedule Refresh',
    approvalType: 'auto',
    paymentMode:  'auto_charge',
    cleanerVisible: true,
  },
  {
    id: 'ur7',
    title: 'Ski Equipment Rental',
    description: 'Full ski gear set — skis, poles & boots for your stay',
    price: 800,
    currency: 'NOK',
    category: 'extras',
    enabled: true,
    targeting: 'groups',
    targetGroupIds: ['g3'],
    targetPropertyIds: [],
    conditions: [
      { id: 'c4', field: 'checkin_day', operator: 'is', value: 'Fri' },
    ],
    ctaLabel: 'Reserve Gear',
    approvalType: 'auto',
    paymentMode:  'auto_charge',
    cleanerVisible: false,
  },
  {
    id: 'ur8',
    title: 'Pet Fee Add-on',
    description: 'Bring your furry friend — includes pet amenity kit',
    price: 300,
    currency: 'NOK',
    category: 'extras',
    enabled: true,
    targeting: 'properties',
    targetGroupIds: [],
    targetPropertyIds: ['p2', 'p3'],
    conditions: [],
    ctaLabel: 'Add Pet',
    approvalType: 'auto',
    paymentMode:  'auto_charge',
    cleanerVisible: false,
  },
  {
    id: 'ur9',
    title: 'Baby Equipment Add-on',
    description: 'Cot, high chair, or baby bath — ready on arrival',
    price: 200,
    currency: 'NOK',
    category: 'extras',
    enabled: true,
    targeting: 'all',
    targetGroupIds: [],
    targetPropertyIds: [],
    conditions: [],
    ctaLabel: 'Add Equipment',
    approvalType: 'auto',
    paymentMode:  'auto_charge',
    cleanerVisible: true,
  },
]

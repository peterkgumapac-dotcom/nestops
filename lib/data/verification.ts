export type VerificationStatus = 'not_started' | 'in_progress' | 'verified' | 'failed' | 'overridden'
export type VerificationStep = 'id_verification' | 'selfie_match' | 'security_deposit' | 'rental_agreement' | 'house_rules' | 'payment_confirmation' | 'emergency_contact'
export type StepStatus = 'pending' | 'completed' | 'failed' | 'skipped'
export type DocumentType = 'id_front' | 'id_back' | 'selfie' | 'signed_agreement' | 'emergency_contact_form'

export interface VerificationStepRecord {
  step: VerificationStep
  status: StepStatus
  completedAt?: string
}

export interface SubmittedDocument {
  type: DocumentType
  label: string
  uploadedAt: string
  previewUrl?: string
}

export interface UpsellPurchase {
  upsellId: string
  title: string
  price: number
  currency: string
  purchasedAt: string
  category: string
}

export interface GuestVerification {
  id: string
  guestName: string
  guestEmail: string
  propertyId: string
  propertyName: string
  checkInDate: string
  checkOutDate: string
  status: VerificationStatus
  steps: VerificationStepRecord[]
  bookingSource: string
  nights: number
  sentAt?: string
  verifiedAt?: string
  portalOpenCount: number
  portalLastOpenedAt?: string
  submittedDocuments?: SubmittedDocument[]
  upsellPurchases?: UpsellPurchase[]
  guestsCount?: number
  totalAmount?: number
  currency?: string
}

export interface PropertyVerificationConfig {
  propertyId: string
  requiredSteps: VerificationStep[]
}

export const STEP_LABELS: Record<VerificationStep, string> = {
  id_verification: 'ID Verification',
  selfie_match: 'Selfie Match',
  security_deposit: 'Security Deposit',
  rental_agreement: 'Rental Agreement',
  house_rules: 'House Rules Acknowledgement',
  payment_confirmation: 'Payment Confirmation',
  emergency_contact: 'Emergency Contact',
}

export const STEP_DESCRIPTIONS: Record<VerificationStep, string> = {
  id_verification: 'Guest uploads a government-issued photo ID',
  selfie_match: 'Guest takes a selfie to match against their ID',
  security_deposit: 'Guest authorizes a hold on their payment method',
  rental_agreement: 'Guest digitally signs the rental agreement',
  house_rules: 'Guest acknowledges and accepts house rules',
  payment_confirmation: 'Final payment is confirmed before check-in',
  emergency_contact: 'Guest provides an emergency contact number',
}

export const ALL_STEPS: VerificationStep[] = [
  'id_verification',
  'selfie_match',
  'security_deposit',
  'rental_agreement',
  'house_rules',
  'payment_confirmation',
  'emergency_contact',
]

export const GUEST_VERIFICATIONS: GuestVerification[] = [
  {
    id: 'gv1',
    guestName: 'Emma Lindqvist',
    guestEmail: 'emma.lindqvist@gmail.com',
    propertyId: 'p1',
    propertyName: 'Sunset Villa',
    checkInDate: '2026-03-22',
    checkOutDate: '2026-03-27',
    status: 'verified',
    bookingSource: 'Airbnb',
    nights: 5,
    sentAt: '2026-03-15T09:00:00Z',
    verifiedAt: '2026-03-15T14:23:00Z',
    portalOpenCount: 3,
    portalLastOpenedAt: '2026-03-17T11:00:00Z',
    guestsCount: 2,
    totalAmount: 1250,
    currency: 'USD',
    submittedDocuments: [
      { type: 'id_front', label: 'Passport Front', uploadedAt: '2026-03-15T10:12:00Z', previewUrl: '/placeholders/id-front.jpg' },
      { type: 'selfie', label: 'Selfie Photo', uploadedAt: '2026-03-15T10:14:00Z', previewUrl: '/placeholders/selfie.jpg' },
      { type: 'signed_agreement', label: 'Signed Agreement', uploadedAt: '2026-03-15T14:00:00Z' },
    ],
    steps: [
      { step: 'id_verification',     status: 'completed', completedAt: '2026-03-15T10:12:00Z' },
      { step: 'selfie_match',         status: 'completed', completedAt: '2026-03-15T10:14:00Z' },
      { step: 'security_deposit',     status: 'completed', completedAt: '2026-03-15T10:20:00Z' },
      { step: 'rental_agreement',     status: 'completed', completedAt: '2026-03-15T14:00:00Z' },
      { step: 'house_rules',          status: 'completed', completedAt: '2026-03-15T14:10:00Z' },
      { step: 'payment_confirmation', status: 'completed', completedAt: '2026-03-15T14:20:00Z' },
      { step: 'emergency_contact',    status: 'completed', completedAt: '2026-03-15T14:23:00Z' },
    ],
  },
  {
    id: 'gv2',
    guestName: 'Marco Bianchi',
    guestEmail: 'marco.bianchi@outlook.com',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    checkInDate: '2026-03-24',
    checkOutDate: '2026-03-26',
    status: 'verified',
    bookingSource: 'Booking.com',
    nights: 2,
    sentAt: '2026-03-17T08:00:00Z',
    verifiedAt: '2026-03-17T16:45:00Z',
    portalOpenCount: 2,
    portalLastOpenedAt: '2026-03-18T09:00:00Z',
    guestsCount: 1,
    totalAmount: 340,
    currency: 'USD',
    submittedDocuments: [
      { type: 'id_front', label: 'ID Card Front', uploadedAt: '2026-03-17T09:30:00Z', previewUrl: '/placeholders/id-front.jpg' },
      { type: 'id_back', label: 'ID Card Back', uploadedAt: '2026-03-17T09:31:00Z', previewUrl: '/placeholders/id-back.jpg' },
      { type: 'signed_agreement', label: 'Signed Agreement', uploadedAt: '2026-03-17T16:40:00Z' },
    ],
    steps: [
      { step: 'id_verification',     status: 'completed', completedAt: '2026-03-17T09:30:00Z' },
      { step: 'selfie_match',         status: 'completed', completedAt: '2026-03-17T09:32:00Z' },
      { step: 'rental_agreement',     status: 'completed', completedAt: '2026-03-17T16:40:00Z' },
      { step: 'house_rules',          status: 'completed', completedAt: '2026-03-17T16:43:00Z' },
      { step: 'payment_confirmation', status: 'completed', completedAt: '2026-03-17T16:45:00Z' },
      { step: 'security_deposit',     status: 'skipped' },
      { step: 'emergency_contact',    status: 'skipped' },
    ],
  },
  {
    id: 'gv3',
    guestName: 'Sarah Chen',
    guestEmail: 'sarah.chen@icloud.com',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    checkInDate: '2026-03-25',
    checkOutDate: '2026-03-30',
    status: 'in_progress',
    bookingSource: 'Direct',
    nights: 5,
    sentAt: '2026-03-18T07:00:00Z',
    portalOpenCount: 1,
    portalLastOpenedAt: '2026-03-18T08:00:00Z',
    guestsCount: 3,
    totalAmount: 975,
    currency: 'USD',
    submittedDocuments: [
      { type: 'id_front', label: 'Passport Front', uploadedAt: '2026-03-18T08:15:00Z', previewUrl: '/placeholders/id-front.jpg' },
    ],
    steps: [
      { step: 'id_verification',     status: 'completed', completedAt: '2026-03-18T08:15:00Z' },
      { step: 'selfie_match',         status: 'completed', completedAt: '2026-03-18T08:18:00Z' },
      { step: 'security_deposit',     status: 'pending' },
      { step: 'rental_agreement',     status: 'pending' },
      { step: 'house_rules',          status: 'pending' },
      { step: 'payment_confirmation', status: 'pending' },
      { step: 'emergency_contact',    status: 'pending' },
    ],
  },
  {
    id: 'gv4',
    guestName: 'Tobias Mäkinen',
    guestEmail: 'tobias.m@protonmail.com',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    checkInDate: '2026-03-26',
    checkOutDate: '2026-03-28',
    status: 'failed',
    bookingSource: 'Airbnb',
    nights: 2,
    sentAt: '2026-03-16T10:00:00Z',
    portalOpenCount: 1,
    portalLastOpenedAt: '2026-03-16T11:00:00Z',
    guestsCount: 2,
    totalAmount: 480,
    currency: 'USD',
    steps: [
      { step: 'id_verification',     status: 'failed' },
      { step: 'selfie_match',         status: 'pending' },
      { step: 'security_deposit',     status: 'pending' },
      { step: 'rental_agreement',     status: 'pending' },
      { step: 'house_rules',          status: 'pending' },
      { step: 'payment_confirmation', status: 'pending' },
      { step: 'emergency_contact',    status: 'pending' },
    ],
  },
  {
    id: 'gv5',
    guestName: 'Ingrid Halvorsen',
    guestEmail: 'ingrid.h@gmail.com',
    propertyId: 'p5',
    propertyName: 'Mountain Cabin',
    checkInDate: '2026-03-28',
    checkOutDate: '2026-04-02',
    status: 'not_started',
    bookingSource: 'VRBO',
    nights: 5,
    portalOpenCount: 0,
    guestsCount: 4,
    totalAmount: 1100,
    currency: 'USD',
    steps: [
      { step: 'id_verification',     status: 'pending' },
      { step: 'selfie_match',         status: 'pending' },
      { step: 'security_deposit',     status: 'pending' },
      { step: 'rental_agreement',     status: 'pending' },
      { step: 'house_rules',          status: 'pending' },
      { step: 'payment_confirmation', status: 'pending' },
      { step: 'emergency_contact',    status: 'pending' },
    ],
  },
  {
    id: 'gv6',
    guestName: 'David Park',
    guestEmail: 'david.park@gmail.com',
    propertyId: 'p1',
    propertyName: 'Sunset Villa',
    checkInDate: '2026-04-04',
    checkOutDate: '2026-04-09',
    status: 'overridden',
    bookingSource: 'Direct',
    nights: 5,
    sentAt: '2026-03-14T11:00:00Z',
    portalOpenCount: 2,
    portalLastOpenedAt: '2026-03-14T13:00:00Z',
    guestsCount: 2,
    totalAmount: 1250,
    currency: 'USD',
    submittedDocuments: [
      { type: 'id_front', label: 'Drivers License Front', uploadedAt: '2026-03-14T12:00:00Z', previewUrl: '/placeholders/id-front.jpg' },
      { type: 'signed_agreement', label: 'Signed Agreement', uploadedAt: '2026-03-14T13:10:00Z' },
    ],
    steps: [
      { step: 'id_verification',     status: 'completed', completedAt: '2026-03-14T12:00:00Z' },
      { step: 'selfie_match',         status: 'failed' },
      { step: 'security_deposit',     status: 'completed', completedAt: '2026-03-14T13:00:00Z' },
      { step: 'rental_agreement',     status: 'completed', completedAt: '2026-03-14T13:10:00Z' },
      { step: 'house_rules',          status: 'completed', completedAt: '2026-03-14T13:12:00Z' },
      { step: 'payment_confirmation', status: 'completed', completedAt: '2026-03-14T13:15:00Z' },
      { step: 'emergency_contact',    status: 'completed', completedAt: '2026-03-14T13:18:00Z' },
    ],
  },
  {
    id: 'gv7',
    guestName: 'Lena Schulz',
    guestEmail: 'lena.schulz@web.de',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    checkInDate: '2026-03-29',
    checkOutDate: '2026-04-03',
    status: 'in_progress',
    bookingSource: 'Booking.com',
    nights: 5,
    sentAt: '2026-03-18T06:00:00Z',
    portalOpenCount: 1,
    portalLastOpenedAt: '2026-03-18T07:45:00Z',
    guestsCount: 2,
    totalAmount: 850,
    currency: 'USD',
    submittedDocuments: [
      { type: 'id_front', label: 'Passport Front', uploadedAt: '2026-03-18T07:45:00Z', previewUrl: '/placeholders/id-front.jpg' },
    ],
    steps: [
      { step: 'id_verification',     status: 'completed', completedAt: '2026-03-18T07:45:00Z' },
      { step: 'selfie_match',         status: 'pending' },
      { step: 'security_deposit',     status: 'pending' },
      { step: 'rental_agreement',     status: 'pending' },
      { step: 'house_rules',          status: 'pending' },
      { step: 'payment_confirmation', status: 'pending' },
      { step: 'emergency_contact',    status: 'pending' },
    ],
  },
  // Today's check-ins (2026-03-19)
  {
    id: 'gv8',
    guestName: 'Alex Torres',
    guestEmail: 'alex.torres@gmail.com',
    propertyId: 'p1',
    propertyName: 'Sunset Villa',
    checkInDate: '2026-03-19',
    checkOutDate: '2026-03-23',
    status: 'verified',
    bookingSource: 'Airbnb',
    nights: 4,
    sentAt: '2026-03-16T09:00:00Z',
    verifiedAt: '2026-03-17T10:30:00Z',
    portalOpenCount: 4,
    portalLastOpenedAt: '2026-03-19T07:15:00Z',
    guestsCount: 2,
    totalAmount: 920,
    currency: 'USD',
    submittedDocuments: [
      { type: 'id_front', label: 'Passport Front', uploadedAt: '2026-03-17T08:10:00Z', previewUrl: '/placeholders/id-front.jpg' },
      { type: 'id_back', label: 'Passport Back', uploadedAt: '2026-03-17T08:11:00Z', previewUrl: '/placeholders/id-back.jpg' },
      { type: 'selfie', label: 'Selfie Photo', uploadedAt: '2026-03-17T08:14:00Z', previewUrl: '/placeholders/selfie.jpg' },
      { type: 'signed_agreement', label: 'Signed Agreement', uploadedAt: '2026-03-17T10:25:00Z' },
      { type: 'emergency_contact_form', label: 'Emergency Contact Form', uploadedAt: '2026-03-17T10:29:00Z' },
    ],
    upsellPurchases: [
      { upsellId: 'u1', title: 'Early Check-in (10am)', price: 45, currency: 'USD', purchasedAt: '2026-03-17T10:30:00Z', category: 'Check-in' },
    ],
    steps: [
      { step: 'id_verification',     status: 'completed', completedAt: '2026-03-17T08:14:00Z' },
      { step: 'selfie_match',         status: 'completed', completedAt: '2026-03-17T08:16:00Z' },
      { step: 'security_deposit',     status: 'completed', completedAt: '2026-03-17T09:00:00Z' },
      { step: 'rental_agreement',     status: 'completed', completedAt: '2026-03-17T10:25:00Z' },
      { step: 'house_rules',          status: 'completed', completedAt: '2026-03-17T10:27:00Z' },
      { step: 'payment_confirmation', status: 'completed', completedAt: '2026-03-17T10:28:00Z' },
      { step: 'emergency_contact',    status: 'completed', completedAt: '2026-03-17T10:29:00Z' },
    ],
  },
  {
    id: 'gv9',
    guestName: 'Mia Kowalski',
    guestEmail: 'mia.kowalski@gmail.com',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    checkInDate: '2026-03-19',
    checkOutDate: '2026-03-22',
    status: 'verified',
    bookingSource: 'Booking.com',
    nights: 3,
    sentAt: '2026-03-16T10:00:00Z',
    verifiedAt: '2026-03-18T15:00:00Z',
    portalOpenCount: 2,
    portalLastOpenedAt: '2026-03-18T15:00:00Z',
    guestsCount: 1,
    totalAmount: 510,
    currency: 'USD',
    submittedDocuments: [
      { type: 'id_front', label: 'ID Card Front', uploadedAt: '2026-03-18T14:00:00Z', previewUrl: '/placeholders/id-front.jpg' },
      { type: 'selfie', label: 'Selfie Photo', uploadedAt: '2026-03-18T14:05:00Z', previewUrl: '/placeholders/selfie.jpg' },
      { type: 'signed_agreement', label: 'Signed Agreement', uploadedAt: '2026-03-18T14:55:00Z' },
    ],
    steps: [
      { step: 'id_verification',     status: 'completed', completedAt: '2026-03-18T14:05:00Z' },
      { step: 'selfie_match',         status: 'completed', completedAt: '2026-03-18T14:07:00Z' },
      { step: 'security_deposit',     status: 'completed', completedAt: '2026-03-18T14:30:00Z' },
      { step: 'rental_agreement',     status: 'completed', completedAt: '2026-03-18T14:55:00Z' },
      { step: 'house_rules',          status: 'completed', completedAt: '2026-03-18T14:57:00Z' },
      { step: 'payment_confirmation', status: 'completed', completedAt: '2026-03-18T14:59:00Z' },
      { step: 'emergency_contact',    status: 'skipped' },
    ],
  },
  {
    id: 'gv10',
    guestName: 'James Oduya',
    guestEmail: 'james.oduya@outlook.com',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    checkInDate: '2026-03-19',
    checkOutDate: '2026-03-21',
    status: 'in_progress',
    bookingSource: 'Direct',
    nights: 2,
    sentAt: '2026-03-17T08:00:00Z',
    portalOpenCount: 1,
    portalLastOpenedAt: '2026-03-18T19:00:00Z',
    guestsCount: 2,
    totalAmount: 380,
    currency: 'USD',
    submittedDocuments: [
      { type: 'id_front', label: 'Drivers License Front', uploadedAt: '2026-03-18T19:05:00Z', previewUrl: '/placeholders/id-front.jpg' },
    ],
    steps: [
      { step: 'id_verification',     status: 'completed', completedAt: '2026-03-18T19:05:00Z' },
      { step: 'selfie_match',         status: 'pending' },
      { step: 'security_deposit',     status: 'pending' },
      { step: 'rental_agreement',     status: 'pending' },
      { step: 'house_rules',          status: 'pending' },
      { step: 'payment_confirmation', status: 'pending' },
      { step: 'emergency_contact',    status: 'pending' },
    ],
  },
  {
    id: 'gv11',
    guestName: 'Priya Nair',
    guestEmail: 'priya.nair@gmail.com',
    propertyId: 'p5',
    propertyName: 'Mountain Cabin',
    checkInDate: '2026-03-19',
    checkOutDate: '2026-03-26',
    status: 'not_started',
    bookingSource: 'VRBO',
    nights: 7,
    sentAt: '2026-03-17T09:00:00Z',
    portalOpenCount: 0,
    guestsCount: 5,
    totalAmount: 1540,
    currency: 'USD',
    steps: [
      { step: 'id_verification',     status: 'pending' },
      { step: 'selfie_match',         status: 'pending' },
      { step: 'security_deposit',     status: 'pending' },
      { step: 'rental_agreement',     status: 'pending' },
      { step: 'house_rules',          status: 'pending' },
      { step: 'payment_confirmation', status: 'pending' },
      { step: 'emergency_contact',    status: 'pending' },
    ],
  },
  {
    id: 'gv12',
    guestName: 'Felix Hartmann',
    guestEmail: 'felix.hartmann@web.de',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    checkInDate: '2026-03-19',
    checkOutDate: '2026-03-21',
    status: 'not_started',
    bookingSource: 'Airbnb',
    nights: 2,
    sentAt: '2026-03-17T10:00:00Z',
    portalOpenCount: 0,
    guestsCount: 1,
    totalAmount: 290,
    currency: 'USD',
    steps: [
      { step: 'id_verification',     status: 'pending' },
      { step: 'selfie_match',         status: 'pending' },
      { step: 'security_deposit',     status: 'pending' },
      { step: 'rental_agreement',     status: 'pending' },
      { step: 'house_rules',          status: 'pending' },
      { step: 'payment_confirmation', status: 'pending' },
      { step: 'emergency_contact',    status: 'pending' },
    ],
  },
  {
    id: 'gv13',
    guestName: 'Yuki Tanaka',
    guestEmail: 'yuki.tanaka@gmail.com',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    checkInDate: '2026-03-19',
    checkOutDate: '2026-03-24',
    status: 'verified',
    bookingSource: 'Direct',
    nights: 5,
    sentAt: '2026-03-16T08:00:00Z',
    verifiedAt: '2026-03-17T12:00:00Z',
    portalOpenCount: 5,
    portalLastOpenedAt: '2026-03-19T06:30:00Z',
    guestsCount: 2,
    totalAmount: 875,
    currency: 'USD',
    submittedDocuments: [
      { type: 'id_front', label: 'Passport Front', uploadedAt: '2026-03-17T09:00:00Z', previewUrl: '/placeholders/id-front.jpg' },
      { type: 'id_back', label: 'Passport Back', uploadedAt: '2026-03-17T09:01:00Z', previewUrl: '/placeholders/id-back.jpg' },
      { type: 'selfie', label: 'Selfie Photo', uploadedAt: '2026-03-17T09:05:00Z', previewUrl: '/placeholders/selfie.jpg' },
      { type: 'signed_agreement', label: 'Signed Agreement', uploadedAt: '2026-03-17T11:50:00Z' },
      { type: 'emergency_contact_form', label: 'Emergency Contact Form', uploadedAt: '2026-03-17T11:55:00Z' },
    ],
    upsellPurchases: [
      { upsellId: 'u2', title: 'Airport Transfer', price: 65, currency: 'USD', purchasedAt: '2026-03-17T12:00:00Z', category: 'Transport' },
      { upsellId: 'u3', title: 'Welcome Basket', price: 38, currency: 'USD', purchasedAt: '2026-03-17T12:00:00Z', category: 'Amenities' },
    ],
    steps: [
      { step: 'id_verification',     status: 'completed', completedAt: '2026-03-17T09:05:00Z' },
      { step: 'selfie_match',         status: 'completed', completedAt: '2026-03-17T09:08:00Z' },
      { step: 'security_deposit',     status: 'completed', completedAt: '2026-03-17T10:00:00Z' },
      { step: 'rental_agreement',     status: 'completed', completedAt: '2026-03-17T11:50:00Z' },
      { step: 'house_rules',          status: 'completed', completedAt: '2026-03-17T11:52:00Z' },
      { step: 'payment_confirmation', status: 'completed', completedAt: '2026-03-17T11:55:00Z' },
      { step: 'emergency_contact',    status: 'completed', completedAt: '2026-03-17T11:58:00Z' },
    ],
  },
]

export const PROPERTY_VERIFICATION_CONFIGS: PropertyVerificationConfig[] = [
  { propertyId: 'p1', requiredSteps: ['id_verification', 'selfie_match', 'security_deposit', 'rental_agreement', 'house_rules', 'payment_confirmation', 'emergency_contact'] },
  { propertyId: 'p2', requiredSteps: ['id_verification', 'rental_agreement', 'house_rules', 'payment_confirmation'] },
  { propertyId: 'p3', requiredSteps: ['id_verification', 'selfie_match', 'security_deposit', 'rental_agreement', 'house_rules', 'payment_confirmation', 'emergency_contact'] },
  { propertyId: 'p4', requiredSteps: ['id_verification', 'selfie_match', 'security_deposit', 'rental_agreement', 'house_rules', 'payment_confirmation'] },
  { propertyId: 'p5', requiredSteps: ['id_verification', 'rental_agreement', 'house_rules', 'payment_confirmation', 'emergency_contact'] },
]

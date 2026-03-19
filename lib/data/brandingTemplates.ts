export type TemplatScope = 'portal' | 'group'

export interface BrandingTemplate {
  id: string
  name: string
  scope: TemplatScope
  targetGroupId?: string   // if scope === 'group'
  brandLogo?: string
  brandColor: string
  brandName?: string
  customDomain?: string
  stripeAccountId?: string
  requiresVerification: boolean
  // Door code access settings
  doorCodeRevealMode: 'always' | 'verified_only' | 'time_gated'
  codeRevealHoursBeforeCheckin?: number  // e.g., 2 = show code 2h before check-in
}

export interface VerificationTemplate {
  id: string
  name: string
  scope: TemplatScope
  targetGroupId?: string
  steps: string[]  // step labels
  depositAmount: number
  depositCurrency: 'NOK' | 'USD' | 'EUR'
}

export const BRANDING_TEMPLATES: BrandingTemplate[] = [
  {
    id: 'bt1',
    name: 'NestOps Default',
    scope: 'portal',
    brandColor: '#7c3aed',
    brandName: 'NestOps',
    requiresVerification: false,
    doorCodeRevealMode: 'verified_only',
  },
  {
    id: 'bt2',
    name: 'CoastalStays — Coastal Properties',
    scope: 'group',
    targetGroupId: 'g2',
    brandLogo: 'https://placehold.co/120x40/1d4ed8/ffffff?text=CoastalStays',
    brandColor: '#1d4ed8',
    brandName: 'CoastalStays',
    customDomain: 'guide.coastalstays.no',
    requiresVerification: true,
    doorCodeRevealMode: 'time_gated',
    codeRevealHoursBeforeCheckin: 2,
  },
  {
    id: 'bt3',
    name: 'Oslo Premium — Oslo Portfolio',
    scope: 'group',
    targetGroupId: 'g1',
    brandLogo: 'https://placehold.co/120x40/0f172a/f59e0b?text=OsloPremium',
    brandColor: '#f59e0b',
    brandName: 'Oslo Premium Stays',
    requiresVerification: true,
    doorCodeRevealMode: 'time_gated',
    codeRevealHoursBeforeCheckin: 3,
  },
  {
    id: 'bt4',
    name: 'Mountain & Nature',
    scope: 'group',
    targetGroupId: 'g3',
    brandColor: '#059669',
    brandName: 'Nordic Nature Stays',
    requiresVerification: false,
    doorCodeRevealMode: 'always',
  },
]

export const VERIFICATION_TEMPLATES: VerificationTemplate[] = [
  {
    id: 'vt1',
    name: 'Standard (All Properties)',
    scope: 'portal',
    steps: ['Confirm Info', 'Upload ID', 'Sign Agreement', 'House Rules', 'Security Deposit'],
    depositAmount: 3000,
    depositCurrency: 'NOK',
  },
  {
    id: 'vt2',
    name: 'Coastal Full KYC',
    scope: 'group',
    targetGroupId: 'g2',
    steps: ['Confirm Info', 'Upload ID', 'Sign Agreement', 'House Rules', 'Security Deposit'],
    depositAmount: 5000,
    depositCurrency: 'NOK',
  },
  {
    id: 'vt3',
    name: 'Oslo Premium Verification',
    scope: 'group',
    targetGroupId: 'g1',
    steps: ['Confirm Info', 'Upload ID', 'Sign Agreement', 'House Rules', 'Security Deposit'],
    depositAmount: 4000,
    depositCurrency: 'NOK',
  },
  {
    id: 'vt4',
    name: 'Light Verification (ID + Rules)',
    scope: 'portal',
    steps: ['Confirm Info', 'Upload ID', 'House Rules'],
    depositAmount: 0,
    depositCurrency: 'NOK',
  },
]

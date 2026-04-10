export interface WizardFormState {
  verificationEnabled: boolean
  requiredSteps: string[]
  doorCodeMode: 'always' | 'verified_only' | 'time_gated'
  guidebookEnabled: boolean
  linkedGuidebookId: string
  guidebookTheme: 'dark' | 'light' | 'brand'
  messagingEnabled: boolean
  channels: string[]
  autoReplyOn: boolean
  responseGoal: string
  upsellsEnabled: boolean
  starterUpsells: string[]
  smartAccessEnabled: boolean
  accessMethod: string
  autoSend: boolean
  sendTiming: string
}

export const DEFAULT_WIZARD_FORM: WizardFormState = {
  verificationEnabled: true,
  requiredSteps: ['id', 'rental_agreement', 'house_rules', 'payment'],
  doorCodeMode: 'verified_only',
  guidebookEnabled: true,
  linkedGuidebookId: '',
  guidebookTheme: 'dark',
  messagingEnabled: true,
  channels: ['in_app', 'email'],
  autoReplyOn: true,
  responseGoal: '15m',
  upsellsEnabled: true,
  starterUpsells: [],
  smartAccessEnabled: true,
  accessMethod: 'manual_code',
  autoSend: true,
  sendTiming: '24h',
}

export const LS_DRAFT_KEY = 'afterstay_portal_setup_draft'
export const LS_COMPLETE_KEY = 'afterstay_portal_setup_complete'

export const TOTAL_STEPS = 6

export interface StepProps {
  form: WizardFormState
  update: (patch: Partial<WizardFormState>) => void
  accent: string
}

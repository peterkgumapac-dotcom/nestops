export interface QuickTemplate {
  id: string
  title: string
  body: string
  category: 'greeting' | 'info' | 'issue' | 'general'
}

export interface InboxRouting {
  destination: 'operator' | 'guest_services' | 'both'
  escalationEnabled: boolean
  escalationTimeoutMin: number
}

export interface NotificationPrefs {
  emailDigest: boolean
  pushNotifications: boolean
  realTimeAlerts: boolean
  digestFrequency: 'instant' | 'hourly' | 'daily'
}

export const DEFAULT_TEMPLATES: QuickTemplate[] = [
  {
    id: 'qt1',
    title: 'Property question',
    body: 'I have a question about the property.',
    category: 'info',
  },
  {
    id: 'qt2',
    title: 'Something needs attention',
    body: "Something needs attention at the property. We'll look into it right away.",
    category: 'issue',
  },
  {
    id: 'qt3',
    title: 'Check-in help',
    body: 'I need help with check-in. Here are the instructions for accessing your property.',
    category: 'greeting',
  },
  {
    id: 'qt4',
    title: 'Recommendation request',
    body: "I'd like a recommendation. Here are our top picks for the area.",
    category: 'general',
  },
]

export const DEFAULT_ROUTING: InboxRouting = {
  destination: 'both',
  escalationEnabled: true,
  escalationTimeoutMin: 30,
}

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  emailDigest: true,
  pushNotifications: true,
  realTimeAlerts: false,
  digestFrequency: 'hourly',
}

export const ROUTING_OPTIONS = [
  { value: 'operator' as const, label: 'Operator Dashboard', description: 'Messages appear in operator inbox' },
  { value: 'guest_services' as const, label: 'Guest Services Team', description: 'Messages route to GS agents' },
  { value: 'both' as const, label: 'Both', description: 'Messages appear in both' },
]

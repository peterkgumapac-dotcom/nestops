'use client'

export interface BriefingToggles {
  countdown: boolean
  weather: boolean
  propertiestoday: boolean
  taskcount: boolean
  taskpreview: boolean
  thisweek: boolean
  accesstype: boolean
  turnaroundwarning: boolean
  othertasks: boolean
  pteStatus: boolean
  routingHint: boolean
  jobLocation: boolean
  overnightissues: boolean
  checkins: boolean
  activeissues: boolean
  pterequest: boolean
  teamstatus: boolean
  needsaction: boolean
  firstcheckin: boolean
  meetings: boolean
  supplyreminders: boolean
}

export interface BriefingPrefs {
  userId: string
  role: string
  subRole: string
  lastUpdated: string
  toggles: BriefingToggles
}

export const DEFAULT_PREFS: Record<string, Partial<BriefingToggles>> = {
  'Cleaning Team': {
    countdown: true,
    weather: true,
    propertiestoday: true,
    taskcount: true,
    taskpreview: true,
    thisweek: true,
    accesstype: true,
    turnaroundwarning: true,
    othertasks: true,
    pteStatus: false,
    routingHint: false,
    jobLocation: false,
    overnightissues: false,
    checkins: false,
    activeissues: false,
    pterequest: false,
    teamstatus: false,
    needsaction: false,
    firstcheckin: false,
    meetings: false,
    supplyreminders: true,
  },
  'Maintenance': {
    countdown: true,
    weather: true,
    propertiestoday: true,
    taskcount: true,
    taskpreview: false,
    thisweek: false,
    accesstype: true,
    turnaroundwarning: false,
    othertasks: true,
    pteStatus: true,
    routingHint: true,
    jobLocation: true,
    overnightissues: false,
    checkins: false,
    activeissues: false,
    pterequest: false,
    teamstatus: false,
    needsaction: false,
    firstcheckin: false,
    meetings: false,
    supplyreminders: false,
  },
  'Guest Services': {
    countdown: true,
    weather: false,
    propertiestoday: true,
    taskcount: false,
    taskpreview: false,
    thisweek: false,
    accesstype: false,
    turnaroundwarning: false,
    othertasks: false,
    pteStatus: false,
    routingHint: false,
    jobLocation: false,
    overnightissues: true,
    checkins: true,
    activeissues: true,
    pterequest: true,
    teamstatus: false,
    needsaction: true,
    firstcheckin: false,
    meetings: false,
    supplyreminders: false,
  },
  'operator': {
    countdown: false,
    weather: false,
    propertiestoday: false,
    taskcount: false,
    taskpreview: false,
    thisweek: false,
    accesstype: false,
    turnaroundwarning: false,
    othertasks: false,
    pteStatus: false,
    routingHint: false,
    jobLocation: false,
    overnightissues: true,
    checkins: true,
    activeissues: false,
    pterequest: false,
    teamstatus: true,
    needsaction: true,
    firstcheckin: true,
    meetings: true,
    supplyreminders: false,
  },
}

const STORAGE_KEY = 'afterstay_briefing_prefs'

export function getPrefs(
  userId: string,
  subRole: string,
  role: string,
): BriefingPrefs {
  if (typeof window === 'undefined') {
    return buildDefault(userId, subRole, role)
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const all: Record<string, BriefingPrefs> = JSON.parse(stored)
      if (all[userId]) return all[userId]
    }
  } catch { /* fall through */ }
  return buildDefault(userId, subRole, role)
}

export function savePrefs(prefs: BriefingPrefs): void {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const all: Record<string, BriefingPrefs> = stored ? JSON.parse(stored) : {}
    all[prefs.userId] = {
      ...prefs,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

export function resetPrefs(
  userId: string,
  subRole: string,
  role: string,
): BriefingPrefs {
  const defaults = buildDefault(userId, subRole, role)
  savePrefs(defaults)
  return defaults
}

function buildDefault(
  userId: string,
  subRole: string,
  role: string,
): BriefingPrefs {
  const rawKey = role === 'operator' ? 'operator' : subRole
  const key = (rawKey === 'Cleaner' || rawKey === 'Cleaning Supervisor')
    ? 'Cleaning Team'
    : rawKey
  const toggles = {
    ...DEFAULT_PREFS['Cleaning Team'],
    ...(DEFAULT_PREFS[key] ?? {}),
  } as BriefingToggles
  return {
    userId,
    role,
    subRole,
    lastUpdated: new Date().toISOString(),
    toggles,
  }
}

export const TOGGLE_LABELS: Record<
  keyof BriefingToggles,
  { label: string; description: string; roles: string[] }
> = {
  countdown:         { label: 'Countdown to shift',      description: 'Live timer before your shift starts',        roles: ['all'] },
  weather:           { label: 'Weather',                  description: 'Conditions at your first shift property',    roles: ['Cleaning Team', 'Maintenance', 'Guest Services', 'operator'] },
  propertiestoday:   { label: 'Properties today',         description: 'All cleanings or jobs scheduled today',      roles: ['Cleaning Team', 'Maintenance', 'Guest Services'] },
  taskcount:         { label: 'Task count',               description: 'Number of tasks per property',               roles: ['Cleaning Team'] },
  taskpreview:       { label: 'Task preview',             description: 'First 3 tasks listed before you start',      roles: ['Cleaning Team'] },
  thisweek:          { label: 'This week',                description: 'Mini calendar showing your weekly schedule', roles: ['Cleaning Team', 'Maintenance'] },
  accesstype:        { label: 'Access method',            description: 'Keypad / lockbox / key type shown',          roles: ['Cleaning Team', 'Maintenance'] },
  turnaroundwarning: { label: 'Turnaround warnings',      description: 'Alert when check-in window is tight',        roles: ['Cleaning Team'] },
  othertasks:        { label: 'Other tasks today',        description: 'Side tasks outside of main cleaning/jobs',   roles: ['Cleaning Team', 'Maintenance'] },
  pteStatus:         { label: 'PTE status',               description: 'Permission to enter status per job',         roles: ['Maintenance'] },
  routingHint:       { label: 'Routing hint',             description: 'Go here first suggestion for vacant props',  roles: ['Maintenance'] },
  jobLocation:       { label: 'Property location',        description: 'Area/city shown on each job card',           roles: ['Maintenance'] },
  overnightissues:   { label: 'Overnight issues',         description: 'Issues reported while you were off shift',   roles: ['Guest Services', 'operator'] },
  checkins:          { label: "Today's check-ins",        description: 'Arrivals and property readiness status',     roles: ['Guest Services', 'operator'] },
  activeissues:      { label: 'Active issues count',      description: 'Urgent / open / unresolved issue summary',   roles: ['Guest Services'] },
  pterequest:        { label: 'PTE requests',             description: 'Pending permissions needing guest contact',  roles: ['Guest Services'] },
  teamstatus:        { label: 'Team clock-in status',     description: 'Who has clocked in and who has not',         roles: ['operator'] },
  needsaction:       { label: 'Needs action',             description: 'Unassigned tasks and late staff alerts',     roles: ['Guest Services', 'operator'] },
  firstcheckin:      { label: 'First check-in countdown', description: 'Countdown to earliest arrival today',        roles: ['operator'] },
  meetings:          { label: 'Meetings today',           description: 'Scheduled meetings for the day',             roles: ['operator'] },
  supplyreminders:   { label: 'Supply reminders',         description: 'Linen and consumable delivery tasks',        roles: ['Cleaning Team'] },
}

export const ALWAYS_ON: Array<keyof BriefingToggles> = ['countdown']

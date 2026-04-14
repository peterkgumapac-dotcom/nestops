import {
  LayoutDashboard, Building2, CalendarCheck, ShieldCheck,
  ClipboardList, Ticket, Package, HardDrive,
  UserCheck, HardHat,
  BookOpen, Headphones,
  Zap, Bell, ShoppingBag,
  Settings, History,
  Home, Inbox, PlusCircle, FileText, CheckSquare,
  Wrench, Users, CreditCard, UserCircle,
  KeyRound, Smartphone,
  LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

export interface NavSection {
  label: string
  items: NavItem[]
  collapsible?: boolean
}

export const OPERATOR_NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',   href: '/operator',            icon: LayoutDashboard },
      { label: 'Properties',  href: '/operator/properties', icon: Building2 },
      { label: 'Operations',  href: '/operator/operations', icon: ClipboardList },
      { label: 'Tickets',     href: '/operator/tickets',    icon: Ticket, badge: 5 },
      { label: 'Team',        href: '/operator/team',       icon: UserCheck },
    ],
  },
  {
    label: 'Platform',
    collapsible: true,
    items: [
      { label: 'Guest Portal',     href: '/operator/guest-portal', icon: Smartphone },
      { label: 'Upsells',          href: '/operator/upsells',          icon: ShoppingBag },
      { label: 'Compliance',       href: '/operator/compliance',       icon: ShieldCheck },
      { label: 'Automations',      href: '/operator/automations',      icon: Zap },
      { label: 'Alerts',           href: '/operator/alerts',           icon: Bell },
      { label: 'Settings',         href: '/operator/settings',         icon: Settings },
    ],
  },
]

export const OWNER_NAV: NavSection[] = [
  {
    label: 'My Portfolio',
    items: [
      { label: 'My Overview',   href: '/owner',            icon: LayoutDashboard },
      { label: 'My Properties', href: '/owner/properties', icon: Building2 },
    ],
  },
  {
    label: 'Approvals',
    items: [
      { label: 'Approvals',    href: '/owner/approvals',   icon: CheckSquare, badge: 3 },
      { label: 'My Requests',  href: '/owner/requests',    icon: Inbox },
      { label: 'Maintenance',  href: '/owner/maintenance', icon: Wrench },
    ],
  },
  {
    label: 'Financials',
    items: [
      { label: 'Billing',    href: '/owner/billing',    icon: CreditCard },
      { label: 'Documents',  href: '/owner/documents',  icon: FileText },
    ],
  },
  {
    label: 'Actions',
    items: [
      { label: 'Onboard Property', href: '/owner/onboard', icon: PlusCircle },
    ],
  },
]

// ── Staff navs — subRole-specific ──────────────────────────────────────────

export const STAFF_CLEANING_NAV: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'Alerts',       href: '/app/alerts',      icon: Bell },
      { label: 'Home',         href: '/app/dashboard',   icon: Home },
      { label: 'My Cleanings', href: '/app/my-tasks',    icon: CheckSquare },
      { label: 'Work Orders',  href: '/app/work-orders', icon: Ticket },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Cleaning SOPs', href: '/app/operations', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Account', href: '/app/my-account', icon: UserCircle },
    ],
  },
]

export const STAFF_CLEANING_SUPERVISOR_NAV: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'Team Alerts',      href: '/app/alerts',      icon: Bell },
      { label: 'Home',             href: '/app/dashboard',   icon: Home },
      { label: 'Team Tasks',       href: '/app/my-tasks',    icon: CheckSquare },
      { label: 'Work Orders',      href: '/app/work-orders', icon: Ticket },
      { label: 'Upsell Approvals', href: '/app/upsells',     icon: ShoppingBag, badge: 2 },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Cleaning SOPs', href: '/app/operations', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Account', href: '/app/my-account', icon: UserCircle },
    ],
  },
]

export const STAFF_MAINTENANCE_NAV: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'Alerts',      href: '/app/alerts',      icon: Bell },
      { label: 'Home',        href: '/app/dashboard',   icon: Home },
      { label: 'My Jobs',     href: '/app/my-tasks',    icon: CheckSquare },
      { label: 'Work Orders', href: '/app/work-orders', icon: Ticket },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'SOPs', href: '/app/sops', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Account', href: '/app/my-account', icon: UserCircle },
    ],
  },
]

export const GS_AGENT_NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Guest Operations',
    items: [
      { label: 'My Queue',       href: '/app/my-guest-services',         icon: Headphones },
      { label: 'All Issues',     href: '/app/guest-services',            icon: Users },
      { label: 'Issues List',    href: '/app/guest-services/issues',     icon: Inbox },
      { label: 'Analytics',      href: '/app/guest-services/analytics',  icon: ClipboardList },
      { label: 'Work Orders',    href: '/app/work-orders',               icon: Ticket },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Properties', href: '/app/properties', icon: Building2 },
      { label: 'Inventory',  href: '/app/inventory',  icon: Package },
      { label: 'Staffing',   href: '/app/team',       icon: UserCheck },
    ],
  },
  {
    label: 'Platforms',
    items: [
      { label: 'Guest Portal',  href: '/app/guidebooks',   icon: BookOpen },
      { label: 'Verification',  href: '/app/verification', icon: ShieldCheck },
      { label: 'Upsells',       href: '/app/upsells',      icon: ShoppingBag },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Guest SOPs', href: '/app/operations', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Account', href: '/app/my-account', icon: UserCircle },
    ],
  },
]

export const GS_SUPERVISOR_NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Guest Operations',
    items: [
      { label: 'Team Queue',     href: '/app/guest-services',           icon: Users },
      { label: 'All Issues',     href: '/app/guest-services/issues',    icon: Inbox, badge: 3 },
      { label: 'Analytics',      href: '/app/guest-services/analytics', icon: ClipboardList },
      { label: 'Work Orders',    href: '/app/work-orders',              icon: Ticket },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Properties', href: '/app/properties', icon: Building2 },
      { label: 'Staffing',   href: '/app/team',       icon: UserCheck },
    ],
  },
  {
    label: 'Platforms',
    items: [
      { label: 'Guest Portal',  href: '/app/guidebooks',   icon: BookOpen },
      { label: 'Verification',  href: '/app/verification', icon: ShieldCheck },
      { label: 'Upsells',       href: '/app/upsells',      icon: ShoppingBag },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Guest SOPs', href: '/app/operations', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Account', href: '/app/my-account', icon: UserCircle },
    ],
  },
]

export const STAFF_INSPECTOR_NAV: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'Home',            href: '/app/dashboard',   icon: Home },
      { label: 'My Inspections',  href: '/app/my-tasks',    icon: CheckSquare },
      { label: 'Intake',          href: '/app/new-intake',  icon: ClipboardList },
      { label: 'Work Orders',     href: '/app/work-orders', icon: Ticket },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Inspection SOPs', href: '/app/operations', icon: FileText },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Account', href: '/app/my-account', icon: UserCircle },
    ],
  },
]

export function getStaffNav(jobRole?: string, subRole?: string): NavSection[] {
  if (jobRole === 'maintenance')    return STAFF_MAINTENANCE_NAV
  if (jobRole === 'supervisor')     return STAFF_CLEANING_SUPERVISOR_NAV
  if (jobRole === 'cleaner')        return STAFF_CLEANING_NAV
  // subRole fallback for backwards compatibility
  if (subRole?.includes('Maintenance')) return STAFF_MAINTENANCE_NAV
  if (subRole?.includes('Inspector'))   return STAFF_INSPECTOR_NAV
  if (subRole?.includes('Supervisor'))  return STAFF_CLEANING_SUPERVISOR_NAV
  return STAFF_CLEANING_NAV
}

export function getOperatorNav(accessTier: string, subRole?: string): NavSection[] {
  if (accessTier === 'guest-services') {
    if (subRole?.includes('Supervisor')) return GS_SUPERVISOR_NAV
    return GS_AGENT_NAV
  }
  return MAIN_APP_OPERATOR_NAV
}

export const MAIN_APP_OPERATOR_NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Properties',
    items: [
      { label: 'Properties', href: '/app/properties', icon: Building2 },
      { label: 'Compliance',  href: '/app/compliance',  icon: ShieldCheck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Operations',     href: '/app/operations',     icon: ClipboardList },
      { label: 'Guest Services', href: '/app/guest-services', icon: Headphones },
      { label: 'Requests',       href: '/app/tickets',        icon: Ticket, badge: 5 },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Inventory', href: '/app/inventory', icon: Package },
      { label: 'People',    href: '/app/team',      icon: UserCheck },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Guidebooks',   href: '/app/guidebooks',   icon: BookOpen },
      { label: 'Upsells',      href: '/app/upsells',      icon: ShoppingBag },
      { label: 'Verification', href: '/app/verification', icon: ShieldCheck },
      { label: 'Automations',  href: '/app/automations',  icon: Zap },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/app/settings', icon: Settings },
    ],
  },
]

export const STAFF_NAV: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'Home',   href: '/staff',            icon: Home },
      { label: 'Intake', href: '/staff/new-intake', icon: ClipboardList },
      { label: 'My Jobs', href: '/staff/jobs',      icon: CheckSquare },
      { label: 'SOPs',   href: '/staff/sops',       icon: FileText },
    ],
  },
]

export const NAV_BY_ROLE = {
  operator: OPERATOR_NAV,
  owner:    OWNER_NAV,
  staff:    STAFF_CLEANING_NAV,
  vendor:   STAFF_CLEANING_NAV,
}

export const MAIN_APP_NAV_BY_ROLE = {
  operator: MAIN_APP_OPERATOR_NAV,
  owner:    OWNER_NAV,
  staff:    STAFF_CLEANING_NAV,
  vendor:   STAFF_CLEANING_NAV,
}

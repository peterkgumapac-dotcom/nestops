import {
  LayoutDashboard, Building2, CalendarCheck, ShieldCheck,
  ClipboardList, Ticket, Package, HardDrive,
  UserCheck, HardHat,
  BookOpen, Headphones,
  Zap, Bell, ShoppingBag,
  Settings, History,
  Home, Inbox, PlusCircle, FileText, CheckSquare,
  Wrench, Users, CreditCard,
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
}

export const OPERATOR_NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/operator', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Properties',
    items: [
      { label: 'Properties',   href: '/operator/properties',   icon: Building2 },
      { label: 'Schedules',    href: '/operator/cleaning',     icon: CalendarCheck },
      { label: 'Compliance',   href: '/operator/compliance',   icon: ShieldCheck },
      { label: 'Contractors',  href: '/operator/contractors',  icon: HardHat },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Operations',     href: '/operator/operations',     icon: ClipboardList },
      { label: 'Guest Services', href: '/operator/guest-services', icon: Headphones },
      { label: 'Requests',       href: '/operator/tickets',        icon: Ticket,    badge: 5 },
      { label: 'Inventory',      href: '/operator/inventory',      icon: Package },
      { label: 'Fixed Assets',   href: '/operator/assets',         icon: HardDrive },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'Staff', href: '/operator/team', icon: UserCheck },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Guidebooks',  href: '/operator/guidebooks',  icon: BookOpen },
      { label: 'Upsells',     href: '/operator/upsells',     icon: ShoppingBag },
      { label: 'Automations', href: '/operator/automations', icon: Zap },
      { label: 'Alerts',      href: '/operator/alerts',      icon: Bell },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings',  href: '/operator/settings',   icon: Settings },
      { label: 'Changelog', href: '/operator/changelog',  icon: History },
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
    label: '',
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
      { label: 'Home',         href: '/app/dashboard',   icon: Home },
      { label: 'My Cleanings', href: '/app/my-tasks',    icon: CheckSquare },
      { label: 'Intake',       href: '/app/new-intake',  icon: ClipboardList },
      { label: 'Work Orders',  href: '/app/work-orders', icon: Ticket },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Cleaning SOPs', href: '/app/operations', icon: FileText },
    ],
  },
]

export const STAFF_MAINTENANCE_NAV: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'Home',        href: '/app/dashboard',   icon: Home },
      { label: 'My Jobs',     href: '/app/my-tasks',    icon: CheckSquare },
      { label: 'Intake',      href: '/app/new-intake',  icon: ClipboardList },
      { label: 'Work Orders', href: '/app/work-orders', icon: Ticket },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Maintenance SOPs', href: '/app/operations', icon: FileText },
    ],
  },
]

export const STAFF_GUEST_SERVICES_NAV: NavSection[] = [
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
    label: 'Properties',
    items: [
      { label: 'Properties', href: '/app/properties', icon: Building2 },
      { label: 'Inventory',  href: '/app/inventory',  icon: Package },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Guest SOPs', href: '/app/operations', icon: FileText },
    ],
  },
]

export function getStaffNav(subRole?: string): NavSection[] {
  if (subRole?.includes('Maintenance')) return STAFF_MAINTENANCE_NAV
  if (subRole?.includes('Guest'))       return STAFF_GUEST_SERVICES_NAV
  return STAFF_CLEANING_NAV
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
      { label: 'Properties',  href: '/app/properties',  icon: Building2 },
      { label: 'Schedules',   href: '/app/cleaning',    icon: CalendarCheck },
      { label: 'Compliance',  href: '/app/compliance',  icon: ShieldCheck },
      { label: 'Contractors', href: '/app/contractors', icon: HardHat },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Operations',     href: '/app/operations',     icon: ClipboardList },
      { label: 'Guest Services', href: '/app/guest-services', icon: Headphones },
      { label: 'Requests',       href: '/app/tickets',        icon: Ticket,    badge: 5 },
      { label: 'Inventory',      href: '/app/inventory',      icon: Package },
      { label: 'Fixed Assets',   href: '/app/assets',         icon: HardDrive },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'Staff', href: '/app/team', icon: UserCheck },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Guidebooks',  href: '/app/guidebooks',  icon: BookOpen },
      { label: 'Upsells',     href: '/app/upsells',     icon: ShoppingBag },
      { label: 'Automations', href: '/app/automations', icon: Zap },
      { label: 'Alerts',      href: '/app/alerts',      icon: Bell },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings',  href: '/app/settings',   icon: Settings },
      { label: 'Changelog', href: '/app/changelog',  icon: History },
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

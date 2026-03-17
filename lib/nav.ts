import {
  LayoutDashboard, Building2, CalendarCheck, ShieldCheck,
  ClipboardList, Ticket, Package, HardDrive,
  UserCheck, HardHat,
  BookOpen,
  Zap, Bell,
  Settings,
  Home, Inbox, PlusCircle, FileText, CheckSquare, ArrowLeftRight,
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
    label: 'Portfolio',
    items: [
      { label: 'Properties', href: '/operator/properties', icon: Building2 },
      { label: 'Cleaning',   href: '/operator/cleaning',   icon: CalendarCheck },
      { label: 'Compliance', href: '/operator/compliance', icon: ShieldCheck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Tasks & SOPs', href: '/operator/operations', icon: ClipboardList },
      { label: 'Requests',     href: '/operator/tickets',    icon: Ticket,    badge: 5 },
      { label: 'Inventory',    href: '/operator/inventory',  icon: Package },
      { label: 'Fixed Assets', href: '/operator/assets',     icon: HardDrive },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'Staff',       href: '/operator/team',        icon: UserCheck },
      { label: 'Contractors', href: '/operator/contractors', icon: HardHat },
    ],
  },
  {
    label: 'Guest Experience',
    items: [
      { label: 'Guidebooks', href: '/operator/guidebooks', icon: BookOpen },
    ],
  },
  {
    label: 'Automation',
    items: [
      { label: 'Automations', href: '/operator/automations', icon: Zap },
      { label: 'Alerts',      href: '/operator/alerts',      icon: Bell },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', href: '/operator/settings', icon: Settings },
    ],
  },
]

export const OWNER_NAV: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'My Overview',      href: '/owner',             icon: LayoutDashboard },
      { label: 'My Properties',    href: '/owner/properties',  icon: Building2 },
      { label: 'Approvals',        href: '/owner/approvals',   icon: CheckSquare,  badge: 3 },
      { label: 'Onboard Property', href: '/owner/onboard',     icon: PlusCircle },
      { label: 'My Requests',      href: '/owner/requests',    icon: Inbox },
      { label: 'Maintenance',      href: '/owner/maintenance', icon: Wrench },
      { label: 'Documents',        href: '/owner/documents',   icon: FileText },
      { label: 'Billing',          href: '/owner/billing',     icon: CreditCard },
    ],
  },
]

export const MAIN_APP_OPERATOR_NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Portfolio',
    items: [
      { label: 'Properties', href: '/app/properties', icon: Building2 },
      { label: 'Cleaning',   href: '/app/cleaning',   icon: CalendarCheck },
      { label: 'Compliance', href: '/app/compliance', icon: ShieldCheck },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Tasks & SOPs', href: '/app/operations', icon: ClipboardList },
      { label: 'Requests',     href: '/app/tickets',    icon: Ticket,    badge: 5 },
      { label: 'Inventory',    href: '/app/inventory',  icon: Package },
      { label: 'Fixed Assets', href: '/app/assets',     icon: HardDrive },
    ],
  },
  {
    label: 'Team',
    items: [
      { label: 'Staff',       href: '/app/team',        icon: UserCheck },
      { label: 'Contractors', href: '/app/contractors', icon: HardHat },
    ],
  },
  {
    label: 'Guest Experience',
    items: [
      { label: 'Guidebooks', href: '/app/guidebooks', icon: BookOpen },
    ],
  },
  {
    label: 'Automation',
    items: [
      { label: 'Automations', href: '/app/automations', icon: Zap },
      { label: 'Alerts',      href: '/app/alerts',      icon: Bell },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', href: '/app/settings', icon: Settings },
    ],
  },
]

export const MAIN_APP_STAFF_NAV: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'Home',      href: '/app/dashboard',  icon: Home },
      { label: 'Intake',    href: '/app/new-intake',  icon: ClipboardList },
      { label: 'My Jobs',   href: '/app/jobs',        icon: CheckSquare },
      { label: 'SOPs',      href: '/app/sops',        icon: FileText },
    ],
  },
]

export const STAFF_NAV: NavSection[] = [
  {
    label: '',
    items: [
      { label: 'Home',          href: '/staff',           icon: Home },
      { label: 'Intake',        href: '/staff/new-intake', icon: ClipboardList },
      { label: 'My Jobs',       href: '/staff/jobs',       icon: CheckSquare },
      { label: 'SOPs',          href: '/staff/sops',       icon: FileText },
      { label: 'Switch Portal', href: '/',                 icon: ArrowLeftRight },
    ],
  },
]

export const NAV_BY_ROLE = {
  operator: OPERATOR_NAV,
  owner:    OWNER_NAV,
  staff:    STAFF_NAV,
  vendor:   STAFF_NAV,
}

export const MAIN_APP_NAV_BY_ROLE = {
  operator: MAIN_APP_OPERATOR_NAV,
  owner:    OWNER_NAV,
  staff:    MAIN_APP_STAFF_NAV,
  vendor:   MAIN_APP_STAFF_NAV,
}

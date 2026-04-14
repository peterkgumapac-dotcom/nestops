import type { Reservation } from './reservations'
import type { Job } from './staff'
import type { GuestIssue } from './guestServices'
import type { Guidebook } from './guidebooks'
import type { Approval } from './approvals'
import type { UpsellApprovalRequest } from './upsellApprovals'
import type { LucideIcon } from 'lucide-react'
import {
  LogIn, LogOut, BedDouble, ClipboardList,
  Clock, AlertTriangle, Users, ShieldAlert,
  Package, CircleDollarSign, UserX,
} from 'lucide-react'

// ─── Stat Tiles ───────────────────────────────────────────────────────────────

export interface SubAlert {
  text: string
  severity: 'info' | 'warning' | 'danger'
}

export interface StatTile {
  label: string
  value: number
  icon: LucideIcon
  iconColor: string
  subAlerts: SubAlert[]
}

export function computeStatTiles(
  reservations: Reservation[],
  jobs: Job[],
  issues: GuestIssue[],
  guidebooks: Guidebook[],
  properties: { id: string }[],
  todayStr: string,
): StatTile[] {
  // Check-in time map from guidebooks
  const checkInTimeMap = new Map<string, string>()
  guidebooks.forEach(g => checkInTimeMap.set(g.propertyId, g.checkInTime))

  // ── Check-ins Today ──
  const checkins = reservations.filter(r => r.checkInDate === todayStr)
  const checkinAlerts: SubAlert[] = []

  // Cross-ref: how many need cleaning?
  const checkinPropertyIds = new Set(checkins.map(r => r.propertyId))
  const needsCleaning = jobs.filter(
    j => j.type === 'cleaning' && j.status !== 'done' && checkinPropertyIds.has(j.propertyId),
  ).length
  if (needsCleaning > 0) {
    checkinAlerts.push({ text: `${needsCleaning} unit${needsCleaning > 1 ? 's' : ''} still need cleaning`, severity: 'warning' })
  }

  // Earliest check-in time
  const checkinTimes = checkins
    .map(r => checkInTimeMap.get(r.propertyId))
    .filter((t): t is string => !!t)
    .sort()
  if (checkinTimes.length > 0 && checkinTimes[0] !== undefined) {
    const earliest = checkinTimes[0]
    if (earliest < '14:00') {
      checkinAlerts.push({ text: `1 early check-in at ${earliest}`, severity: 'info' })
    }
  }

  // ── Check-outs Today ──
  const checkouts = reservations.filter(r => r.checkOutDate === todayStr)
  const checkoutAlerts: SubAlert[] = []

  // Late check-out mentions
  const lateCheckouts = checkouts.filter(
    r => r.specialRequests?.toLowerCase().includes('late'),
  ).length
  if (lateCheckouts > 0) {
    checkoutAlerts.push({ text: `${lateCheckouts} late check-out`, severity: 'warning' })
  }

  // Shortest turnover: min gap between checkout and next checkin at same property
  const checkoutPropertyIds = checkouts.map(r => r.propertyId)
  let shortestTurnover = Infinity
  for (const propId of checkoutPropertyIds) {
    const nextCheckin = reservations
      .filter(r => r.propertyId === propId && r.checkInDate === todayStr)
      .map(r => checkInTimeMap.get(r.propertyId) ?? '15:00')
      .sort()[0]
    if (nextCheckin) {
      // Assume checkout at 11:00 default
      const checkoutHour = 11
      const [ciH] = nextCheckin.split(':').map(Number)
      const gap = (ciH ?? 15) - checkoutHour
      if (gap < shortestTurnover) shortestTurnover = gap
    }
  }
  if (shortestTurnover < Infinity && shortestTurnover <= 5) {
    checkoutAlerts.push({ text: `Shortest turnover: ${shortestTurnover}h`, severity: shortestTurnover <= 3 ? 'danger' : 'info' })
  }

  // ── Currently Staying ──
  const staying = reservations.filter(
    r => r.checkInDate <= todayStr && r.checkOutDate >= todayStr,
  )
  const stayingAlerts: SubAlert[] = []

  const stayingPropertyIds = new Set(staying.map(r => r.propertyId))
  const activeGuestIssues = issues.filter(
    i => !['resolved', 'closed'].includes(i.status) && stayingPropertyIds.has(i.propertyId),
  ).length
  if (activeGuestIssues > 0) {
    stayingAlerts.push({ text: `${activeGuestIssues} active guest issue${activeGuestIssues > 1 ? 's' : ''}`, severity: 'danger' })
  }

  const totalProperties = properties.length
  const occupancy = totalProperties > 0 ? Math.round((stayingPropertyIds.size / totalProperties) * 100) : 0
  stayingAlerts.push({ text: `${occupancy}% occupancy`, severity: 'info' })

  // ── Tasks Today ──
  const activeTasks = jobs.filter(j => j.status !== 'done')
  const taskAlerts: SubAlert[] = []

  const notStarted = activeTasks.filter(j => j.status === 'pending').length
  if (notStarted > 0) {
    taskAlerts.push({ text: `${notStarted} not started`, severity: 'warning' })
  }

  const overdue = activeTasks.filter(
    j => j.status === 'pending' && (j.priority === 'urgent' || j.priority === 'high'),
  ).length
  if (overdue > 0) {
    taskAlerts.push({ text: `${overdue} overdue`, severity: 'danger' })
  }

  return [
    { label: 'Check-ins', value: checkins.length, icon: LogIn, iconColor: '#10b981', subAlerts: checkinAlerts },
    { label: 'Check-outs', value: checkouts.length, icon: LogOut, iconColor: '#60a5fa', subAlerts: checkoutAlerts },
    { label: 'Staying', value: staying.length, icon: BedDouble, iconColor: '#a78bfa', subAlerts: stayingAlerts },
    { label: 'Tasks', value: activeTasks.length, icon: ClipboardList, iconColor: '#f59e0b', subAlerts: taskAlerts },
  ]
}

// ─── Needs Attention ──────────────────────────────────────────────────────────

export interface AttentionItem {
  id: string
  urgency: number
  icon: LucideIcon
  text: string
  severity: 'danger' | 'warning'
  actionLabel?: string
}

interface TeamMember {
  id: string
  name: string
  status: string
}

interface StockCheckin {
  date: string
  stockItemIds: string[]
}

interface StockItem {
  id: string
  status: string
}

export function computeNeedsAttention(
  jobs: Job[],
  issues: GuestIssue[],
  team: TeamMember[],
  approvals: Approval[],
  upsellApprovals: UpsellApprovalRequest[],
  stockCheckins: StockCheckin[],
  stockItems: StockItem[],
  todayStr: string,
): AttentionItem[] {
  const items: AttentionItem[] = []

  // 1. PTE pending 4+ hours (urgency: 100)
  const ptePending = jobs.filter(
    j => j.pte?.status === 'pending' && j.pte.requestedAt,
  )
  for (const j of ptePending) {
    items.push({
      id: `pte-${j.id}`,
      urgency: 100,
      icon: Clock,
      text: `PTE pending 4+ hours — ${j.title} · ${j.propertyName}`,
      severity: 'danger',
      actionLabel: 'View',
    })
  }

  // 2. Overdue tasks (urgency: 90)
  const overdueTasks = jobs.filter(
    j => j.status === 'pending' && (j.priority === 'urgent' || j.priority === 'high'),
  )
  if (overdueTasks.length > 0) {
    items.push({
      id: 'overdue-tasks',
      urgency: 90,
      icon: AlertTriangle,
      text: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} — ${overdueTasks.slice(0, 2).map(j => j.title).join(', ')}`,
      severity: 'danger',
      actionLabel: 'View tasks',
    })
  }

  // 3. Guest issues unresolved (urgency: 80)
  const unresolvedIssues = issues.filter(
    i => !['resolved', 'closed'].includes(i.status) && i.checkInDate <= todayStr && i.checkOutDate >= todayStr,
  )
  if (unresolvedIssues.length > 0) {
    items.push({
      id: 'guest-issues',
      urgency: 80,
      icon: ShieldAlert,
      text: `${unresolvedIssues.length} unresolved guest issue${unresolvedIssues.length > 1 ? 's' : ''} — ${unresolvedIssues[0]?.title ?? ''}`,
      severity: 'warning',
      actionLabel: 'View issues',
    })
  }

  // 4. Staff blocked (urgency: 70)
  const blockedStaff = team.filter(m => m.status === 'blocked')
  if (blockedStaff.length > 0) {
    items.push({
      id: 'staff-blocked',
      urgency: 70,
      icon: Users,
      text: `${blockedStaff.length} staff blocked — ${blockedStaff.map(m => m.name).join(', ')}`,
      severity: 'warning',
      actionLabel: 'View',
    })
  }

  // 5. Low stock + upcoming check-in (urgency: 60)
  const today = new Date(todayStr)
  const urgentStockCheckins = stockCheckins.filter(ci => {
    const checkinDate = new Date(ci.date)
    const hours = (checkinDate.getTime() - today.getTime()) / 3600000
    return hours <= 72 && ci.stockItemIds.some(id => {
      const item = stockItems.find(s => s.id === id)
      return item && (item.status === 'low' || item.status === 'critical' || item.status === 'out')
    })
  })
  if (urgentStockCheckins.length > 0) {
    items.push({
      id: 'low-stock',
      urgency: 60,
      icon: Package,
      text: `${urgentStockCheckins.length} check-in${urgentStockCheckins.length > 1 ? 's' : ''} with low stock in next 72h`,
      severity: 'warning',
    })
  }

  // 6. Pending approvals (urgency: 50)
  const pendingUpsells = upsellApprovals.filter(
    u => u.status === 'pending_cleaner' || u.status === 'pending_supervisor',
  )
  const totalPending = approvals.length
  if (totalPending > 0) {
    const totalNOK = approvals.reduce((s, a) => s + a.amount, 0)
    items.push({
      id: 'pending-approvals',
      urgency: 50,
      icon: CircleDollarSign,
      text: `${totalPending} pending approval${totalPending > 1 ? 's' : ''}${totalNOK > 0 ? ` · ${totalNOK.toLocaleString()} NOK` : ''}`,
      severity: 'warning',
      actionLabel: 'Review',
    })
  }

  // 7. Unassigned tasks due today (urgency: 40)
  const unassigned = jobs.filter(j => !j.staffId && j.status !== 'done')
  if (unassigned.length > 0) {
    items.push({
      id: 'unassigned-tasks',
      urgency: 40,
      icon: UserX,
      text: `${unassigned.length} unassigned task${unassigned.length > 1 ? 's' : ''} due today`,
      severity: 'warning',
    })
  }

  // Sort by urgency descending
  return items.sort((a, b) => b.urgency - a.urgency)
}

// ─── Operations Progress ──────────────────────────────────────────────────────

export interface DepartmentProgress {
  label: string
  type: string
  total: number
  completed: number
  pct: number
  color: string
}

export interface OperationsProgressData {
  overall: { total: number; completed: number; pct: number }
  departments: DepartmentProgress[]
  warnings: string[]
}

const DEPARTMENT_META: Record<string, { label: string; color: string }> = {
  cleaning: { label: 'Housekeeping', color: '#10b981' },
  maintenance: { label: 'Maintenance', color: '#f59e0b' },
  inspection: { label: 'Inspection', color: '#60a5fa' },
  guest_services: { label: 'Guest Services', color: '#a78bfa' },
  delivery: { label: 'Delivery', color: '#ec4899' },
  intake: { label: 'Intake', color: '#14b8a6' },
}

export function computeOperationsProgress(jobs: Job[]): OperationsProgressData {
  const total = jobs.length
  const completed = jobs.filter(j => j.status === 'done').length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  // Group by type
  const groups = new Map<string, { total: number; completed: number }>()
  for (const j of jobs) {
    const g = groups.get(j.type) ?? { total: 0, completed: 0 }
    g.total++
    if (j.status === 'done') g.completed++
    groups.set(j.type, g)
  }

  const departments: DepartmentProgress[] = Array.from(groups.entries())
    .map(([type, g]) => {
      const meta = DEPARTMENT_META[type] ?? { label: type, color: '#6b7280' }
      return {
        label: meta.label,
        type,
        total: g.total,
        completed: g.completed,
        pct: g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0,
        color: meta.color,
      }
    })
    .sort((a, b) => b.total - a.total)

  // Warnings
  const warnings: string[] = []
  const overdueCount = jobs.filter(j => j.status === 'pending' && (j.priority === 'urgent' || j.priority === 'high')).length
  if (overdueCount > 0) warnings.push(`${overdueCount} overdue`)
  const unassigned = jobs.filter(j => !j.staffId && j.status !== 'done').length
  if (unassigned > 0) warnings.push(`${unassigned} unassigned`)

  return { overall: { total, completed, pct }, departments, warnings }
}

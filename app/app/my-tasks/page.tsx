'use client'
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Camera, X, Check, ShoppingBag, Calendar, MapPin, Zap, Lock, Eye, EyeOff, ChevronDown, Clock, AlertTriangle, Key, Wrench, Play, Package, Timer } from 'lucide-react'
import { PROPERTY_WEATHER } from '@/lib/data/weather'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRole } from '@/context/RoleContext'
import type { UserProfile } from '@/context/RoleContext'
import { PROPERTIES } from '@/lib/data/properties'
import { getCleaningChecklist, getMaintenanceChecklist, type ChecklistItem } from '@/lib/data/checklists'
import { getPTEBadge, isAccessCodeVisible } from '@/lib/utils/pteUtils'
import { UPSELL_APPROVAL_REQUESTS, type UpsellApprovalRequest } from '@/lib/data/upsellApprovals'
import { UPSELL_RULES } from '@/lib/data/upsells'
import { RESERVATIONS } from '@/lib/data/reservations'
import { STAFF_MEMBERS } from '@/lib/data/staff'
import { STOCK_ITEMS, CONSUMPTION_TEMPLATES, STORAGE_LOCATIONS } from '@/lib/data/inventory'
import type { StockItem } from '@/lib/data/inventory'
import { PROPERTY_LIBRARIES } from '@/lib/data/propertyLibrary'
import type { JobProgress } from '@/lib/data/staff'
import CleanerApprovalSheet from '@/components/upsells/CleanerApprovalSheet'
import { PipelineMaintenanceCard } from '@/components/tasks/maintenance/PipelineMaintenanceCard'
import { ReportProblemModal, type ReportSubmission } from '@/components/tasks/cleaning/modals/ReportProblemModal'
import { RestartTaskModal } from '@/components/tasks/cleaning/modals/RestartTaskModal'
import { CleaningProgressBar } from '@/components/tasks/cleaning/CleaningProgressBar'
import { useCleaningProgress } from '@/hooks/tasks/useCleaningProgress'

const USER_TO_STAFF: Record<string, string> = { 'u3': 's5', 'u4': 's3', 'u5': 's4', 'u7': 's2' }

// ─── Today's Cleanings ────────────────────────────────────────────────────────

interface CleaningJob {
  id: string
  type: 'Turnover' | 'Deep Clean' | 'Same-day' | 'Inspection'
  property: string
  timeWindow: string
  status: 'pending' | 'in-progress' | 'done'
  assignedTo: string
  checkoutTime: string
  checkinTime: string
}

const TODAYS_CLEANINGS: CleaningJob[] = [
  { id: 'cl-001', type: 'Deep Clean', property: 'Harbor Studio',  timeWindow: '10:00–14:00', status: 'pending',     assignedTo: 'Maria S.',  checkoutTime: '10:00', checkinTime: '18:00' },
  { id: 'cl-003', type: 'Turnover',   property: 'Downtown Loft',  timeWindow: '09:00–11:00', status: 'done',        assignedTo: 'Anna K.',   checkoutTime: '09:00', checkinTime: '14:00' },
  { id: 'cl-004', type: 'Same-day',   property: 'Ocean View Apt', timeWindow: '15:00–17:00', status: 'pending',     assignedTo: 'Anna K.',   checkoutTime: '15:00', checkinTime: '16:30' },
]

// TODAYS_DELIVERIES is defined after DERIVED_DELIVERY_TASKS below

const CLEANING_TYPE_COLOR: Record<CleaningJob['type'], string> = {
  Turnover:     'var(--accent)',
  'Deep Clean': 'var(--accent)',
  'Same-day':   'var(--status-amber-fg)',
  Inspection:   'var(--accent)',
}

const CLEANING_STATUS_COLOR: Record<CleaningJob['status'], string> = {
  pending:       'var(--text-muted)',
  'in-progress': 'var(--status-green-fg)',
  done:          'var(--text-subtle)',
}

const CLEANING_STATUS_BG: Record<CleaningJob['status'], string> = {
  pending:       'var(--status-muted-bg)',
  'in-progress': 'var(--status-green-bg)',
  done:          'var(--status-muted-bg)',
}

function hasTightGap(checkoutTime: string, windowStart: string): boolean {
  const [ch, cm] = checkoutTime.split(':').map(Number)
  const [wh, wm] = windowStart.split(':').map(Number)
  const gapMins = (wh * 60 + wm) - (ch * 60 + cm)
  return gapMins < 90
}

interface TaskPTE {
  status: string
  guestName?: string
  guestCheckout?: string
  enterAfter?: string
  accessCode?: string
  notes?: string
  grantedBy?: string
  validFrom?: string
  validUntil?: string
  requestedAt?: string
}

interface TaskReservation {
  id: string
  guestName: string
  platform?: string
  checkIn: string
  checkOut: string
  nights: number
  nightsRemaining?: number
  status: string
}

interface PersonalTask {
  id: string
  title: string
  type: 'Cleaning' | 'Maintenance' | 'Inspection' | 'Content' | 'Inventory' | 'Onboarding' | 'Compliance'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'overdue' | 'today' | 'this_week' | 'upcoming' | 'completed'
  assignee: string
  propertyName: string
  propertyId: string
  propertyImage: string
  due: string
  isDeliveryTask?: boolean
  dueDisplay: string
  description?: string
  pteRequired?: boolean
  pteStatus?: 'not_required' | 'pending' | 'auto_granted' | 'granted' | 'denied'
  pte?: TaskPTE
  reservation?: TaskReservation
  upsellId?: string
  upsellItems?: { name: string; qty: number; unit: string; notes?: string }[]
  setupInstructions?: string
  linkedCleaningTaskId?: string
}

const ALL_TASKS: PersonalTask[] = [
  // Maria S. — Cleaner (s1)
  {
    id: 't1', title: 'Deep clean — Harbor Studio', type: 'Cleaning', priority: 'high', status: 'today',
    assignee: 'Maria S.', propertyId: 'p2', propertyName: 'Harbor Studio',
    propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=100&q=80',
    due: '2026-03-22', dueDisplay: 'Today 11:00',
    pteRequired: false, pteStatus: 'not_required',
    reservation: { id: 'res-004', guestName: 'Lars Eriksson', platform: 'Booking.com', checkIn: '2026-03-22', checkOut: '2026-03-26', nights: 4, status: 'confirmed' },
  },
  { id: 't9',  title: 'Turnover clean — Sunset Villa',            type: 'Cleaning',    priority: 'high',   status: 'this_week', assignee: 'Maria S.',  propertyId: 'p1', propertyName: 'Sunset Villa',    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80',  due: '2026-03-28', dueDisplay: 'Sat 10:00' },
  { id: 't10', title: 'Deep clean — Ocean View Apt',              type: 'Cleaning',    priority: 'high',   status: 'this_week', assignee: 'Maria S.',  propertyId: 'p3', propertyName: 'Ocean View Apt',  propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80',  due: '2026-03-23', dueDisplay: 'Mon 09:00' },
  { id: 't8',  title: 'Quarterly inspection — Ocean View',        type: 'Inspection',  priority: 'medium', status: 'this_week', assignee: 'Maria S.',  propertyId: 'p3', propertyName: 'Ocean View Apt',  propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80',  due: '2026-03-20', dueDisplay: 'Fri 10:00' },
  { id: 't11', title: 'Turnover clean — Downtown Loft',           type: 'Cleaning',    priority: 'medium', status: 'this_week', assignee: 'Maria S.',  propertyId: 'p4', propertyName: 'Downtown Loft',   propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80',     due: '2026-03-21', dueDisplay: 'Sat 11:00' },
  { id: 't6',  title: 'Restock toiletry kits — Sunset Villa',     type: 'Inventory',   priority: 'low',    status: 'completed', assignee: 'Maria S.',  propertyId: 'p1', propertyName: 'Sunset Villa',    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80',  due: '2026-03-18', dueDisplay: 'Completed Mar 18' },
  { id: 't-d01', title: 'Deliver extra towels + toiletries', type: 'Cleaning', priority: 'medium', status: 'today', assignee: 'Maria S.', propertyId: 'p2', propertyName: 'Harbor Studio', propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=100&q=80', due: '2026-03-23', dueDisplay: 'Today 14:00', isDeliveryTask: true },
  // Anna K. — Cleaning Supervisor (s2) — team tasks
  { id: 't12', title: 'Turnover clean — Downtown Loft',           type: 'Cleaning',    priority: 'high',   status: 'today',     assignee: 'Anna K.',   propertyId: 'p4', propertyName: 'Downtown Loft',   propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80',     due: '2026-03-22', dueDisplay: 'Today 09:00' },
  { id: 't13', title: 'Pre-arrival inspection — Harbor Studio',   type: 'Inspection',  priority: 'high',   status: 'today',     assignee: 'Anna K.',   propertyId: 'p2', propertyName: 'Harbor Studio',   propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=100&q=80', due: '2026-03-22', dueDisplay: 'Today 16:00' },
  // Bjorn L. — Maintenance
  {
    id: 't15', title: 'Fix toilet — blocked', type: 'Maintenance', priority: 'urgent', status: 'today',
    assignee: 'Bjorn L.', propertyId: 'p3', propertyName: 'Ocean View Apt',
    propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80',
    due: '2026-03-22', dueDisplay: 'Today 11:00',
    pteRequired: true, pteStatus: 'granted',
    pte: {
      status: 'granted',
      guestName: 'Sarah Okonkwo',
      guestCheckout: '2026-03-24T10:00:00',
      grantedBy: 'Fatima Ndiaye',
      validFrom: '2026-03-22T10:00:00',
      validUntil: '2026-03-22T13:00:00',
      accessCode: '9182',
      notes: 'Guest confirmed via message — enter between 10–13.',
    },
  },
  {
    id: 't4', title: 'Fix hot tub heater', type: 'Maintenance', priority: 'high', status: 'today',
    assignee: 'Bjorn L.', propertyId: 'p1', propertyName: 'Sunset Villa',
    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80',
    due: '2026-03-22', dueDisplay: 'Today 15:00',
    pteRequired: true, pteStatus: 'auto_granted',
    pte: {
      status: 'auto_granted',
      guestCheckout: '2026-03-22T11:00:00',
      notes: 'Property vacant — no active reservation',
    },
  },
  {
    id: 't5', title: 'Inspect heating system', type: 'Maintenance', priority: 'high', status: 'today',
    assignee: 'Bjorn L.', propertyId: 'p4', propertyName: 'Downtown Loft',
    propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80',
    due: '2026-03-22', dueDisplay: 'Today 12:00',
    pteRequired: true, pteStatus: 'granted',
    pte: {
      status: 'granted',
      guestName: 'Henrik Solberg',
      guestCheckout: '2026-03-22T11:00:00',
      requestedAt: '2026-03-20T07:30:00',
      grantedBy: 'Fatima Ndiaye',
      validFrom: '2026-03-22T11:00:00',
      validUntil: '2026-03-22T15:00:00',
      accessCode: '4821',
      notes: 'Access confirmed via WhatsApp — enter after 11:00',
    },
    reservation: {
      id: 'res-001', guestName: 'Henrik Solberg', platform: 'Airbnb',
      checkIn: '2026-03-18', checkOut: '2026-03-22', nights: 4, nightsRemaining: 0, status: 'checked_out',
    },
  },
  { id: 't3',  title: 'Annual fire safety check',                 type: 'Maintenance', priority: 'urgent', status: 'overdue',   assignee: 'Bjorn L.',  propertyId: 'p3', propertyName: 'Ocean View Apt',  propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80',  due: '2026-03-14', dueDisplay: '5 days overdue' },
  // Fatima N. — Guest Services
  { id: 't7',  title: 'Guest issue follow-up — Camilla Dahl',    type: 'Compliance',  priority: 'medium', status: 'today',     assignee: 'Fatima N.', propertyId: 'p4', propertyName: 'Downtown Loft',   propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80',     due: '2026-03-19', dueDisplay: 'Today 17:00' },
  { id: 't2',  title: 'Update guest welcome pack',                type: 'Content',     priority: 'medium', status: 'this_week', assignee: 'Fatima N.', propertyId: 'p1', propertyName: 'Sunset Villa',    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80',  due: '2026-03-20', dueDisplay: 'Fri 11:00' },
]

// Auto-derive delivery tasks from approved upsell approvals
const DERIVED_DELIVERY_TASKS: PersonalTask[] = UPSELL_APPROVAL_REQUESTS
  .filter(a => {
    const rule = UPSELL_RULES.find(r => r.id === a.upsellRuleId)
    return a.status === 'approved' && rule?.deliveryType === 'delivery_to_property'
  })
  .map(a => {
    const rule = UPSELL_RULES.find(r => r.id === a.upsellRuleId)!
    const reservation = RESERVATIONS.find(r => r.guestVerificationId === a.guestVerificationId)
    const checkInDate = reservation?.checkInDate ?? a.checkInDate
    const today = '2026-03-24'
    const status: PersonalTask['status'] =
      checkInDate === today ? 'today' :
      checkInDate < today ? 'overdue' : 'this_week'
    const linkedCleaning = ALL_TASKS.find(t =>
      t.propertyId === a.propertyId &&
      t.due === checkInDate &&
      t.type === 'Cleaning' &&
      !t.isDeliveryTask
    )
    const upsellItems = (rule.physicalItems ?? []).map(pi => {
      const stock = STOCK_ITEMS.find(s => s.id === pi.stockItemId)
      return { name: stock?.name ?? pi.stockItemId, qty: pi.qty, unit: stock?.unit ?? 'piece', notes: pi.notes }
    })
    const prop = PROPERTIES.find(p => p.id === a.propertyId)
    const offset = rule.schedulingOffset ?? 2
    const dueDisplay = checkInDate === today
      ? `Today — ${offset}h before check-in`
      : `${checkInDate} — before check-in`
    return {
      id: `del-${a.id}`,
      title: `${rule.title} — ${a.propertyName}`,
      type: 'Cleaning' as const,
      priority: 'medium' as const,
      status,
      assignee: 'Maria S.',
      propertyId: a.propertyId,
      propertyName: a.propertyName,
      propertyImage: prop?.imageUrl ?? '',
      due: checkInDate,
      dueDisplay,
      isDeliveryTask: true,
      upsellId: a.id,
      upsellItems,
      setupInstructions: rule.setupInstructions,
      linkedCleaningTaskId: linkedCleaning?.id,
    }
  })

const EFFECTIVE_TASKS = [...ALL_TASKS, ...DERIVED_DELIVERY_TASKS]

const TODAYS_DELIVERIES = DERIVED_DELIVERY_TASKS
  .filter(t => t.status === 'today')
  .map(t => ({
    id: t.id,
    type: 'Same-day' as CleaningJob['type'],
    property: t.propertyName,
    timeWindow: t.dueDisplay,
    status: 'pending' as const,
    assignedTo: t.assignee,
    checkoutTime: t.due,
    checkinTime: t.due,
    isDelivery: true as const,
  }))

const USER_ASSIGNEE_MAP: Record<string, string> = {
  'Maria S.': 'Maria S.', 'Bjorn L.': 'Bjorn L.', 'Fatima N.': 'Fatima N.', 'Peter K.': 'Peter K.', 'Anna K.': 'Anna K.',
}

const PRIORITY_BORDER: Record<string, string> = {
  urgent: 'var(--status-red-fg)', high: 'var(--status-amber-fg)', medium: 'var(--accent)', low: 'var(--text-muted)',
}

const STATUS_GROUPS: { key: string; label: string; color: string }[] = [
  { key: 'overdue',   label: 'Overdue',   color: 'var(--status-red-fg)' },
  { key: 'today',     label: 'Today',     color: 'var(--accent)' },
  { key: 'this_week', label: 'This Week', color: 'var(--accent)' },
  { key: 'upcoming',  label: 'Upcoming',  color: 'var(--text-muted)' },
  { key: 'completed', label: 'Completed', color: 'var(--status-green-fg)' },
]

function SheetItemRow({ item, sheetQtys, setSheetQtys, accent }: {
  item: StockItem
  sheetQtys: Record<string, number>
  setSheetQtys: React.Dispatch<React.SetStateAction<Record<string, number>>>
  accent: string
}) {
  const qty = sheetQtys[item.id] ?? 0
  const statusColor = item.status === 'ok' ? 'var(--status-green-fg)' : item.status === 'low' ? 'var(--status-amber-fg)' : item.status === 'critical' ? 'var(--status-amber-fg)' : 'var(--status-red-fg)'
  return (
    <div className="flex items-center gap-2.5 py-2.5 border-b border-[var(--border-subtle)]">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</div>
        <div className="text-xs text-[var(--text-muted)] mt-px">
          {item.inStock} in stock · <span style={{ color: statusColor }}>{item.status}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {qty === 0 ? (
          <button
            onClick={() => setSheetQtys(p => ({...p, [item.id]: 1}))}
            className="h-10 px-4 rounded-lg text-[13px] font-semibold cursor-pointer"
            style={{ border: `1px solid ${accent}`, background: `${accent}15`, color: accent }}>
            + Add
          </button>
        ) : (
          <>
            <button onClick={() => setSheetQtys(p => ({...p, [item.id]: Math.max(0, (p[item.id]??1)-1)}))}
              className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-lg cursor-pointer flex items-center justify-center">−</button>
            <span className="text-base font-semibold min-w-[28px] text-center text-[var(--text-primary)]">{qty}</span>
            <button onClick={() => setSheetQtys(p => ({...p, [item.id]: (p[item.id]??0)+1}))}
              className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-lg cursor-pointer flex items-center justify-center">+</button>
          </>
        )}
        <span className="text-[11px] text-[var(--text-muted)] min-w-[28px]">{item.unit}</span>
      </div>
    </div>
  )
}

function LibAccordionSection({ title, content, accent }: { title: string; content: string; accent: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2 border border-[var(--border)] rounded-lg overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center px-3.5 py-3 bg-transparent border-none cursor-pointer text-[13px] font-semibold text-[var(--text-primary)]">
        {title}
        <span className="text-[11px] text-[var(--text-muted)]">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="px-3.5 pb-3 text-[13px] text-[var(--text-muted)] whitespace-pre-line leading-relaxed border-t border-[var(--border-subtle)]">
          {content}
        </div>
      )}
    </div>
  )
}

export default function MyTasksPage() {
  const { accent } = useRole()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null | undefined>(undefined)
  const [userKey, setUserKey] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('today')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  // Task detail drawer state
  const [selectedTask, setSelectedTask] = useState<PersonalTask | null>(null)
  const [checklistChecked, setChecklistChecked] = useState<Record<string, boolean>>({})
  const [checklistPhotos, setChecklistPhotos] = useState<Record<string, string>>({})
  const [beforePhotos, setBeforePhotos] = useState<string[]>([])
  const [afterPhotos, setAfterPhotos] = useState<string[]>([])
  const [uploadTarget, setUploadTarget] = useState<string | null>(null)
  const [qaRating, setQaRating] = useState(0)
  const [qaNotes, setQaNotes] = useState('')
  const [toast, setToast] = useState('')
  const [showAccessCode, setShowAccessCode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upsell approval state — resolved after user loads from localStorage
  const [upsellApprovalRequests, setUpsellApprovalRequests] = useState<UpsellApprovalRequest[]>([])
  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState<UpsellApprovalRequest | null>(null)
  // Cleaner awareness — read-only, no approval actions
  const [cleanerUpsellAwareness, setCleanerUpsellAwareness] = useState<UpsellApprovalRequest[]>([])

  // Maintenance pipeline state
  const [maintProgress, setMaintProgress] = useState<Record<string, JobProgress>>({})
  const [maintBeforeDone, setMaintBeforeDone] = useState<Record<string, boolean>>({})
  const [maintAfterDone, setMaintAfterDone] = useState<Record<string, boolean>>({})
  const [maintResolution, setMaintResolution] = useState<Record<string, string>>({})

  // Maintenance drawer
  const [selectedMaintTask, setSelectedMaintTask] = useState<PersonalTask | null>(null)
  const [maintEta, setMaintEta] = useState<Record<string, string>>({})
  const [maintCodeVisible, setMaintCodeVisible] = useState<Record<string, boolean>>({})
  const [maintComments, setMaintComments] = useState<Record<string, { author: string; text: string; time: string }[]>>({})
  const [commentDraft, setCommentDraft] = useState('')
  const [pteNotified, setPteNotified] = useState<Set<string>>(new Set())
  const [vendorCategory, setVendorCategory] = useState<Record<string, string>>({})
  const [vendorName, setVendorName] = useState<Record<string, string>>({})
  const [vendorEstimate, setVendorEstimate] = useState<Record<string, string>>({})
  const [vendorNotes, setVendorNotes] = useState<Record<string, string>>({})
  const [partsNotes, setPartsNotes] = useState<Record<string, string>>({})

  // Feature 1: Collapsable groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    this_week: true,
    upcoming: true,
    completed: true,
  })

  // Feature 2: Report an Issue
  const [reportingJob, setReportingJob] = useState<CleaningJob | null>(null)
  const [restartingJob, setRestartingJob] = useState<CleaningJob | null>(null)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [delegationPending, setDelegationPending] = useState<Set<string>>(new Set())

  // Supplies Used
  const [supplyItems, setSupplyItems] = useState<{ id: string; name: string; unit: string; qty: number }[]>([])
  const [suppliesOpen, setSuppliesOpen] = useState(false)
  const [showAddSheet, setShowAddSheet]   = useState(false)
  const [sheetSearch, setSheetSearch]     = useState('')
  const [sheetQtys, setSheetQtys]         = useState<Record<string, number>>({})
  const [sheetCatOpen, setSheetCatOpen]   = useState<Record<string, boolean>>({ Bathroom: true })
  const [sheetY, setSheetY]               = useState<'partial' | 'full'>('partial')
  const [propCardOpen, setPropCardOpen]   = useState(false)
  const [propLibOpen, setPropLibOpen]     = useState(false)
  const [copiedField, setCopiedField]     = useState<string | null>(null)
  const [supplyTab, setSupplyTab] = useState('Consumables')

  // Feature 3: Start a Task
  const [jobStatuses, setJobStatuses] = useState<Record<string, 'pending' | 'in-progress' | 'done'>>({})
  const [jobStartedAt, setJobStartedAt] = useState<Record<string, string>>({})

  // Feature 4: Live clock for timer
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  // Feature 5: Add a Cleaning Task
  const [showAddCleaning, setShowAddCleaning] = useState(false)
  const [upsellsExpanded, setUpsellsExpanded] = useState(false)
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})
  const [extraCleanings, setExtraCleanings] = useState<CleaningJob[]>([])
  const [addProp, setAddProp] = useState('')
  const [addType, setAddType] = useState<CleaningJob['type']>('Turnover')
  const [addTimeStart, setAddTimeStart] = useState('')
  const [addTimeEnd, setAddTimeEnd] = useState('')

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 1500)
  }

  // Drawer cleaning job match (for progress bar + report button)
  const drawerCleaningJob = selectedTask?.type === 'Cleaning'
    ? [...TODAYS_CLEANINGS, ...extraCleanings].find(j => j.property === selectedTask.propertyName) ?? null
    : null
  const drawerJobId = drawerCleaningJob?.id ?? null
  const drawerStartedAt = drawerJobId ? (jobStartedAt[drawerJobId] ?? null) : null
  const drawerWindowMins = drawerCleaningJob
    ? (() => {
        const [ws, we] = drawerCleaningJob.timeWindow.split('–')
        const [sh, sm] = ws.split(':').map(Number)
        const [eh, em] = we.split(':').map(Number)
        return (eh * 60 + em) - (sh * 60 + sm)
      })()
    : null
  const drawerCheckInIso = drawerCleaningJob
    ? `2026-03-23T${drawerCleaningJob.checkinTime}:00`
    : null
  const drawerScheduledStartIso = drawerCleaningJob
    ? `2026-03-23T${drawerCleaningJob.timeWindow.split('–')[0]}:00`
    : null
  const drawerJobStatus = drawerJobId
    ? (jobStatuses[drawerJobId] ?? drawerCleaningJob?.status ?? 'pending')
    : 'pending'

  const cleaningProgress = useCleaningProgress({
    taskId: drawerJobId ?? 'none',
    startedAt: drawerStartedAt,
    estimatedDurationMinutes: drawerWindowMins,
    checkInTime: drawerCheckInIso,
    scheduledStartTime: drawerScheduledStartIso,
    status: drawerJobStatus,
  })

  const handleUpsellApprove = (id: string) => {
    const req = upsellApprovalRequests.find(r => r.id === id)
    setUpsellApprovalRequests(prev => prev.filter(r => r.id !== id))
    setSelectedApprovalRequest(null)
    // Persist decision so operator Guest Services portal picks it up
    try {
      const existing = JSON.parse(localStorage.getItem('afterstay_upsell_decisions') ?? '[]')
      localStorage.setItem('afterstay_upsell_decisions', JSON.stringify([
        ...existing.filter((d: {id: string}) => d.id !== id),
        { id, status: 'approved', guestName: req?.guestName, upsellTitle: req?.upsellTitle, propertyName: req?.propertyName, decidedAt: new Date().toISOString() },
      ]))
    } catch {}
    showToast('Upsell approved — guest will be notified')
  }

  const handleUpsellDecline = (id: string, notes: string) => {
    const req = upsellApprovalRequests.find(r => r.id === id)
    setUpsellApprovalRequests(prev => prev.filter(r => r.id !== id))
    setSelectedApprovalRequest(null)
    // Persist decision so operator Guest Services portal picks it up
    try {
      const existing = JSON.parse(localStorage.getItem('afterstay_upsell_decisions') ?? '[]')
      localStorage.setItem('afterstay_upsell_decisions', JSON.stringify([
        ...existing.filter((d: {id: string}) => d.id !== id),
        { id, status: 'declined', guestName: req?.guestName, upsellTitle: req?.upsellTitle, propertyName: req?.propertyName, notes, decidedAt: new Date().toISOString() },
      ]))
    } catch {}
    showToast('Upsell declined')
  }

  // Re-run user effect when persona switcher changes localStorage
  useEffect(() => {
    const handler = () => setUserKey(k => k + 1)
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('afterstay_user')
    if (stored) {
      try {
        const user: UserProfile = JSON.parse(stored)
        setCurrentUser(user)
        // Set role identifier in URL
        const params = new URLSearchParams(window.location.search)
        const roleParam = user.jobRole ?? (user.accessTier === 'guest-services' ? 'guest-services' : null)
        if (!params.get('role') && roleParam) {
          router.replace(`/app/my-tasks?role=${roleParam}`)
        }
        const isSup = user.jobRole === 'supervisor' || (user.role === 'operator' && user.accessTier === 'guest-services' && user.subRole?.includes('Supervisor'))
        const staffId = USER_TO_STAFF[user.id] ?? null
        // Only supervisor/gs-supervisor see upsell approvals; all other roles get empty list
        const requests = isSup ? UPSELL_APPROVAL_REQUESTS.filter(r =>
          r.status === 'pending_cleaner' || (r.status === 'pending_supervisor' && r.escalatedToSupervisor)
        ) : []
        setUpsellApprovalRequests(requests)
        // Cleaner upsell awareness — read-only, filtered to cleaner-relevant types + assigned properties
        if (user.jobRole === 'cleaner' && staffId) {
          const cleanerVisibleRuleIds = new Set(UPSELL_RULES.filter(r => r.cleanerVisible === true).map(r => r.id))
          const staffMember = STAFF_MEMBERS.find(m => m.id === staffId)
          const assignedPropIds = staffMember?.assignedPropertyIds ?? []
          const awareness = UPSELL_APPROVAL_REQUESTS.filter(r =>
            cleanerVisibleRuleIds.has(r.upsellRuleId) &&
            assignedPropIds.includes(r.propertyId) &&
            ['pending_cleaner', 'approved', 'auth_held'].includes(r.status)
          )
          setCleanerUpsellAwareness(awareness)
        }
      } catch {}
    } else {
      setCurrentUser(null)
    }
  }, [router, userKey])

  // Reset checklist state when task changes
  useEffect(() => {
    setChecklistChecked({})
    setChecklistPhotos({})
    setBeforePhotos([])
    setAfterPhotos([])
    setQaRating(0)
    setQaNotes('')
    setShowAccessCode(false)
    setCollapsedCategories(new Set())
    // Pre-populate supply items from consumption template (skip for delivery tasks)
    const isDelivery = selectedTask?.isDeliveryTask ?? false
    if (!isDelivery) {
      const prop = PROPERTIES.find(p => p.id === selectedTask?.propertyId)
      const beds = prop?.beds ?? 1
      const templateKey = beds <= 1 ? 'Studio' : beds <= 2 ? '1BR' : '2BR'
      const template = CONSUMPTION_TEMPLATES.find(t => t.propertyType.startsWith(templateKey))
      if (template) {
        setSupplyItems(template.items.map(ti => {
          const stock = STOCK_ITEMS.find(s => s.id === ti.stockItemId)
          return { id: ti.stockItemId, name: stock?.name ?? ti.stockItemId, unit: stock?.unit ?? 'unit', qty: ti.qtyPerTurnover }
        }))
      } else {
        setSupplyItems([])
      }
    } else {
      setSupplyItems([])
    }
    setSuppliesOpen(false)
    setShowAddSheet(false)
    setSheetSearch('')
    setSheetQtys({})
    setPropCardOpen(false)
    setPropLibOpen(false)
    setSupplyTab('Consumables')
  }, [selectedTask?.id])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // ── Hooks that must live before any early return ──────────────────────────
  // Generate checklist from task + property data
  const activeChecklist = useMemo((): ChecklistItem[] => {
    if (!selectedTask) return []
    const prop = PROPERTIES.find(p => p.id === selectedTask.propertyId)
    if (selectedTask.type === 'Cleaning') {
      return getCleaningChecklist(prop?.beds ?? 1, prop?.baths ?? 1, prop?.amenities ?? [])
    }
    if (selectedTask.type === 'Maintenance') return getMaintenanceChecklist()
    return []
  }, [selectedTask])

  // Group checklist by category
  const checklistGroups = useMemo(() => {
    const seen = new Set<string>()
    const order: string[] = []
    activeChecklist.forEach(item => { if (!seen.has(item.category)) { seen.add(item.category); order.push(item.category) } })
    return order.map(cat => ({ name: cat, items: activeChecklist.filter(i => i.category === cat) }))
  }, [activeChecklist])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadTarget) return
    const url = URL.createObjectURL(file)
    if (uploadTarget === 'before') setBeforePhotos(p => [...p, url])
    else if (uploadTarget === 'after') setAfterPhotos(p => [...p, url])
    else if (uploadTarget.startsWith('item:')) {
      const itemId = uploadTarget.slice(5)
      setChecklistPhotos(p => ({ ...p, [itemId]: url }))
    }
    e.target.value = ''
    setUploadTarget(null)
  }, [uploadTarget])

  // Loading guard — prevent flash of all tasks before user profile loads
  if (currentUser === undefined) return null

  const assigneeName = currentUser ? (USER_ASSIGNEE_MAP[currentUser.name] ?? currentUser.name) : null
  const subRole = currentUser?.subRole ?? ''
  const jobRole = currentUser?.jobRole ?? ''
  const isSupervisor    = jobRole === 'supervisor'
  const isGSSupervisor  = currentUser?.role === 'operator' && currentUser?.accessTier === 'guest-services' && (currentUser?.subRole?.includes('Supervisor') ?? false)
  const isMaintenance   = jobRole === 'maintenance'
  const isGuestServices = currentUser?.role === 'operator' && currentUser?.accessTier === 'guest-services' && !isGSSupervisor

  const filteredTasks = EFFECTIVE_TASKS.filter(task => {
    // Supervisor sees all team cleaning tasks; cleaner sees only their own
    const matchesAssignee = isSupervisor ? true : (!assigneeName || task.assignee === assigneeName)
    let matchesType = true
    if (isMaintenance) matchesType = task.type === 'Maintenance'
    else if (jobRole === 'cleaner' || isSupervisor) matchesType = task.type === 'Cleaning' || task.type === 'Inspection'
    else if (isGSSupervisor || isGuestServices) matchesType = true
    const effectiveStatus = completedIds.has(task.id) ? 'completed' : task.status
    const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesAssignee && matchesType && matchesStatus && matchesPriority
  })

  const checkedCount = activeChecklist.filter(i => checklistChecked[i.id]).length
  const totalCount = activeChecklist.length
  const progressPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  const isCleaningComplete = selectedTask?.type === 'Cleaning' && progressPct === 100
  const canSubmit = selectedTask?.type === 'Maintenance'
    ? beforePhotos.length > 0 && checkedCount === totalCount && afterPhotos.length > 0
    : isCleaningComplete
      ? qaRating > 0 && afterPhotos.length > 0
      : checkedCount > 0

  const toggleCheck = (id: string) => setChecklistChecked(prev => ({ ...prev, [id]: !prev[id] }))

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const handleStartFromDrawer = () => {
    if (!drawerCleaningJob) return
    const ts = new Date().toISOString()
    setJobStatuses(prev => ({ ...prev, [drawerCleaningJob.id]: 'in-progress' }))
    setJobStartedAt(prev => ({ ...prev, [drawerCleaningJob.id]: ts }))
  }

  const handleStopFromDrawer = () => {
    if (!drawerCleaningJob) return
    setJobStatuses(prev => ({ ...prev, [drawerCleaningJob.id]: 'pending' }))
    setJobStartedAt(prev => { const n = { ...prev }; delete n[drawerCleaningJob.id]; return n })
    showToast('Task stopped')
  }

  const triggerUpload = (target: string) => {
    setUploadTarget(target)
    fileInputRef.current?.click()
  }

  const stepperBtnCls = 'w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-base cursor-pointer flex items-center justify-center leading-none'

  const handleSubmit = () => {
    if (!selectedTask) return
    if (isCleaningComplete && qaRating > 0) {
      try {
        const existing = JSON.parse(localStorage.getItem('afterstay_qa_pending') || '[]')
        existing.push({
          id: Date.now().toString(),
          taskId: selectedTask.id,
          property: selectedTask.propertyName,
          propertyId: selectedTask.propertyId,
          cleaner: selectedTask.assignee,
          rating: qaRating,
          notes: qaNotes,
          photos: afterPhotos,
          submittedAt: new Date().toISOString(),
          qaStatus: 'pending',
        })
        localStorage.setItem('afterstay_qa_pending', JSON.stringify(existing))
      } catch {}
    }
    if (selectedTask.type === 'Cleaning' && supplyItems.length > 0) {
      try {
        const log = JSON.parse(localStorage.getItem('afterstay_supply_consumption') ?? '[]')
        log.push({
          taskId: selectedTask.id,
          property: selectedTask.propertyName,
          propertyId: selectedTask.propertyId,
          cleaner: selectedTask.assignee,
          items: supplyItems.filter(i => i.qty > 0),
          loggedAt: new Date().toISOString(),
        })
        localStorage.setItem('afterstay_supply_consumption', JSON.stringify(log))
        const overrides = JSON.parse(localStorage.getItem('afterstay_stock_overrides') ?? '{}')
        supplyItems.forEach(item => {
          overrides[item.id] = (overrides[item.id] ?? 0) + item.qty
        })
        localStorage.setItem('afterstay_stock_overrides', JSON.stringify(overrides))
      } catch {}
    }
    setCompletedIds(prev => new Set([...prev, selectedTask.id]))
    setSelectedTask(null)
    showToast(
      isCleaningComplete
        ? '✓ Submitted for QA Review'
        : selectedTask.type === 'Maintenance'
          ? '✓ Maintenance report submitted for approval'
          : `✓ Cleaning complete — ${checkedCount}/${totalCount} tasks · submitted`
    )
  }

  const statusPills = [
    { key: 'all', label: 'All' }, { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' }, { key: 'overdue', label: 'Overdue' },
    { key: 'completed', label: 'Completed' },
  ]
  const priorityPills = [
    { key: 'all', label: 'All' }, { key: 'urgent', label: 'Urgent' },
    { key: 'high', label: 'High' }, { key: 'medium', label: 'Medium' }, { key: 'low', label: 'Low' },
  ]

  const pillCls = (active: boolean) =>
    `px-4 py-2 min-h-[40px] rounded-full text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
      active
        ? 'text-[var(--accent)] border bg-[var(--accent-bg)] border-[var(--accent)]'
        : 'text-[var(--text-muted)] border border-[var(--border)] bg-transparent'
    }`

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={isMaintenance ? 'My Jobs' : isSupervisor ? "Team's Cleaning Tasks" : 'My Cleanings'}
        subtitle={isMaintenance ? 'Your assigned maintenance jobs — click to open job details' : isSupervisor ? 'All team cleaning tasks — click any task to open its checklist' : 'Your cleaning tasks — click any task to open its checklist'}
      />

      {/* Filters — scrollable on mobile */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 pills-row items-center">
          <Filter size={13} className="text-[var(--text-muted)] shrink-0" />
          {statusPills.map(p => (
            <button key={p.key} onClick={() => setStatusFilter(p.key)} className={pillCls(statusFilter === p.key)}>{p.label}</button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 pills-row">
          {priorityPills.map(p => (
            <button key={p.key} onClick={() => setPriorityFilter(p.key)} className={pillCls(priorityFilter === p.key)}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Today's Cleanings Section */}
      {(jobRole === 'cleaner' || isSupervisor) && (() => {
        const myCleanings = (isSupervisor
          ? TODAYS_CLEANINGS
          : TODAYS_CLEANINGS.filter(c => c.assignedTo === assigneeName)
        ).concat(extraCleanings.filter(c => isSupervisor || c.assignedTo === assigneeName))
        const myDeliveries = TODAYS_DELIVERIES.filter(d => isSupervisor || d.assignedTo === assigneeName)
        const allJobs = [...myCleanings, ...myDeliveries]
        if (allJobs.length === 0) return null
        return (
          <div className="section-block">
            <div className="flex items-center gap-2 mb-2.5">
              <Zap size={14} className="text-[var(--accent)]" />
              <span className="label-upper text-[var(--accent)]">
                Today&apos;s Cleanings
              </span>
              <span className="text-[11px] px-[7px] py-px rounded-[10px] bg-[var(--accent-bg)] text-[var(--accent)] font-semibold">
                {allJobs.length}
              </span>
              <button onClick={() => setShowAddCleaning(true)} className="ml-auto text-lg text-[var(--accent)] bg-transparent border-none cursor-pointer leading-none px-0.5">+</button>
            </div>
            <div className="flex flex-col gap-3">
              {allJobs.map((job, idx) => {
                const isDelivery = (job as typeof TODAYS_DELIVERIES[0]).isDelivery === true
                const [windowStart] = job.timeWindow.split('–')
                const tight = !isDelivery && hasTightGap(job.checkoutTime, windowStart)
                const effectiveStatus = jobStatuses[job.id] ?? job.status
                const statusColor = CLEANING_STATUS_COLOR[effectiveStatus]
                const matchingTask = !isDelivery && ALL_TASKS.find(t => t.propertyName === job.property && t.type === 'Cleaning')
                const startedAt = jobStartedAt[job.id]
                const [winStart, winEnd] = job.timeWindow.split('–')
                const [sh, sm] = (winStart ?? '00:00').split(':').map(Number)
                const [eh, em] = (winEnd ?? winStart ?? '00:00').split(':').map(Number)
                const windowMins = (eh * 60 + em) - (sh * 60 + sm)
                const elapsedMs = startedAt ? now.getTime() - new Date(startedAt).getTime() : 0
                const elapsedMins = Math.floor(elapsedMs / 60_000)
                const estDone = startedAt
                  ? new Date(new Date(startedAt).getTime() + windowMins * 60_000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                  : winEnd

                // Property data for image + weather + access + checklist
                const prop = PROPERTIES.find(p => p.name === job.property)
                const weather = prop ? PROPERTY_WEATHER.find(w => w.propertyId === prop.id) : null
                const accessCode = prop?.accessCodes?.[0]
                const checklist = prop ? getCleaningChecklist(prop.beds, prop.baths, prop.amenities ?? []) : []
                const isFirst = idx === 0 && !isDelivery

                // Delivery cards — compact style
                if (isDelivery) {
                  return (
                    <Card
                      key={job.id}
                      className={`p-3.5 ${effectiveStatus === 'done' ? 'opacity-60' : ''}`}
                      style={{ borderLeft: '4px solid var(--status-amber-fg)' }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-[7px] py-0.5 rounded-[10px] bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border border-[var(--status-amber-fg)]"><Package size={10} /> Delivery</span>
                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">{job.property}</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mb-2">
                        <Clock size={12} className="inline mr-1 -mt-px" />
                        {job.timeWindow}
                      </div>
                      {effectiveStatus === 'pending' ? (
                        <Button
                          onClick={e => {
                            e.stopPropagation()
                            setJobStatuses(prev => ({ ...prev, [job.id]: 'in-progress' }))
                            setJobStartedAt(prev => ({ ...prev, [job.id]: new Date().toISOString() }))
                          }}
                          className="w-full rounded-lg font-semibold bg-[var(--status-amber-fg)] hover:bg-[var(--status-amber-fg)]/80 text-white"
                        >
                          <Play size={13} className="mr-1" fill="currentColor" /> Start Delivery
                        </Button>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[10px]" style={{ background: CLEANING_STATUS_BG[effectiveStatus], color: statusColor, border: `1px solid ${statusColor}` }}>
                          {effectiveStatus === 'in-progress' ? 'In progress' : <><Check size={10} className="inline mr-0.5" /> Done</>}
                        </span>
                      )}
                    </Card>
                  )
                }

                // Cleaning cards — operator-quality
                return (
                  <Card
                    key={job.id}
                    className={`overflow-hidden p-0 ${effectiveStatus === 'done' ? 'opacity-60' : ''}`}
                  >
                    {/* Property image */}
                    {prop?.imageUrl && (
                      <img
                        src={prop.imageUrl}
                        alt={job.property}
                        className="w-full h-32 object-cover block"
                      />
                    )}

                    <div className="p-4">
                      {/* Title + badge */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[15px] font-semibold text-[var(--text-primary)]">{job.property}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isFirst
                            ? 'bg-[var(--status-blue-bg)] text-[var(--status-blue-fg)]'
                            : 'bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)]'
                        }`}>
                          {isFirst ? 'NEXT UP' : job.type}
                        </span>
                      </div>

                      {/* Time + checkout/checkin */}
                      <div className="text-xs text-[var(--text-muted)] mb-1">
                        <Clock size={12} className="inline mr-1 -mt-px" />
                        {job.timeWindow} · Out {job.checkoutTime} → In {job.checkinTime}
                        {isSupervisor && <span> · {job.assignedTo}</span>}
                      </div>

                      {/* Per-property weather */}
                      {weather && (
                        <div className="text-xs text-[var(--text-muted)] mb-1.5">
                          {weather.icon} {weather.temperature}°C · {weather.location}
                          {weather.note ? ` · ${weather.note}` : ''}
                        </div>
                      )}

                      {/* Tight turnaround */}
                      {tight && effectiveStatus !== 'done' && (
                        <div className="text-xs text-[var(--status-warning)] mb-2">
                          <AlertTriangle size={12} className="inline mr-1 -mt-px" />
                          Tight: next check-in {job.checkinTime}
                        </div>
                      )}

                      {/* Access info */}
                      {accessCode && (
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
                          <span>Access: {accessCode.label}</span>
                          <button
                            onClick={e => { e.stopPropagation(); setShowCodes(prev => ({ ...prev, [job.id]: !prev[job.id] })) }}
                            className="bg-[var(--bg-elevated)] rounded-lg px-2.5 py-1 text-[var(--status-info)] text-xs font-semibold cursor-pointer border-none"
                          >
                            {showCodes[job.id] ? (
                              <><span className="tabular-nums font-semibold">{accessCode.code}</span> <EyeOff size={13} /></>
                            ) : (
                              <>Show Code <Eye size={13} /></>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Progress bar */}
                      {checklist.length > 0 && (
                        <>
                          <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)] mb-2">
                            <div
                              className="h-full rounded-full bg-[var(--status-success)] transition-[width] duration-300"
                              style={{ width: effectiveStatus === 'done' ? '100%' : effectiveStatus === 'in-progress' ? '35%' : '0%' }}
                            />
                          </div>
                          <div className="text-xs text-[var(--text-muted)] mb-2.5">
                            {effectiveStatus === 'done' ? checklist.length : effectiveStatus === 'in-progress' ? Math.round(checklist.length * 0.35) : 0} of {checklist.length} tasks complete
                          </div>
                        </>
                      )}

                      {/* Inline checklist preview (first 3 items) */}
                      {effectiveStatus !== 'done' && checklist.length > 0 && (
                        <div className="mb-3">
                          {checklist.slice(0, 3).map((task, ti) => (
                            <div
                              key={ti}
                              className={`flex items-start gap-2 py-1.5 ${ti < 2 ? 'border-b border-[var(--border)]' : ''}`}
                            >
                              <div className="w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center border-2 border-[var(--bg-elevated)] bg-transparent" />
                              <span className="text-sm text-[var(--text-primary)]">{task.label}</span>
                            </div>
                          ))}
                          {checklist.length > 3 && (
                            <div className="text-xs text-[var(--text-subtle)] mt-1">+ {checklist.length - 3} more</div>
                          )}
                        </div>
                      )}

                      {/* Timer when in progress */}
                      {effectiveStatus === 'in-progress' && startedAt && (
                        <div className="text-[11px] text-[var(--status-green-fg)] mb-2">
                          <Timer size={12} className="inline mr-0.5 -mt-px" /> {elapsedMins >= 60 ? `${Math.floor(elapsedMins / 60)}h ${elapsedMins % 60}m` : `${elapsedMins}m`} elapsed · Est. done {estDone}
                        </div>
                      )}

                      {/* CTA — full width, purple */}
                      {effectiveStatus === 'pending' ? (
                        <Button
                          onClick={e => {
                            e.stopPropagation()
                            const ts = new Date().toISOString()
                            setJobStatuses(prev => ({ ...prev, [job.id]: 'in-progress' }))
                            setJobStartedAt(prev => ({ ...prev, [job.id]: ts }))
                          }}
                          className={`mt-1 w-full rounded-full font-semibold ${
                            isFirst
                              ? 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white'
                              : 'bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 text-white'
                          }`}
                        >
                          <Play size={13} className="mr-1" fill="currentColor" /> {isFirst ? 'Start This Clean' : 'Start Clean'}
                        </Button>
                      ) : effectiveStatus === 'in-progress' ? (
                        <div className="flex gap-2 mt-1">
                          <Button
                            onClick={() => matchingTask && setSelectedTask(matchingTask)}
                            className="flex-1 rounded-full font-semibold bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-white"
                          >
                            Resume Checklist
                          </Button>
                          <Button
                            onClick={e => { e.stopPropagation(); setReportingJob(job) }}
                            variant="outline"
                            className="rounded-lg font-medium"
                          >
                            <Wrench size={14} className="mr-1" /> Report
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-[10px]" style={{ background: CLEANING_STATUS_BG[effectiveStatus], color: statusColor, border: `1px solid ${statusColor}` }}>
                            <Check size={10} /> Done
                          </span>
                          {delegationPending.has(job.id) && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-px rounded-[10px] bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]">
                              <Clock size={10} /> Pending reassignment
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Cleaner Upsell Awareness — collapsed by default */}
      {jobRole === 'cleaner' && cleanerUpsellAwareness.length > 0 && (
        <div className="section-block">
          <button
            onClick={() => setUpsellsExpanded(prev => !prev)}
            className="flex items-center gap-2 w-full text-left bg-transparent border-none cursor-pointer p-0 mb-2.5"
          >
            <ShoppingBag size={14} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">
              {cleanerUpsellAwareness.length} upcoming upsell{cleanerUpsellAwareness.length !== 1 ? 's' : ''} — prepare only
            </span>
            <ChevronDown size={14} className={`text-[var(--text-subtle)] ml-auto transition-transform ${upsellsExpanded ? 'rotate-180' : ''}`} />
          </button>
          {upsellsExpanded && (
            <div className="flex flex-col gap-2">
              {cleanerUpsellAwareness.map(req => {
                const statusColor = req.status === 'approved' || req.status === 'auth_held' ? 'var(--status-green-fg)' : 'var(--status-amber-fg)'
                const statusLabel = req.status === 'approved' ? 'Confirmed' : req.status === 'auth_held' ? 'Confirmed' : 'Pending'
                return (
                  <Card
                    key={req.id}
                    className="p-3"
                    style={{ borderLeft: `4px solid ${statusColor}` }}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                            {req.upsellTitle}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-px rounded-[10px]" style={{ background: (req.status === 'approved' || req.status === 'auth_held') ? 'var(--status-green-bg)' : 'var(--status-amber-bg)', color: statusColor, border: `1px solid ${statusColor}` }}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <MapPin size={11} /> {req.propertyName}
                          </span>
                          <span className="text-[11px] text-[var(--text-subtle)]">·</span>
                          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                            <Calendar size={11} /> Check-in {req.checkInDate}
                          </span>
                          <span className="text-[11px] text-[var(--text-subtle)]">·</span>
                          <span className="text-xs text-[var(--text-muted)]">{req.guestName}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Upsell Approvals Section */}
      {(isSupervisor || isGSSupervisor) && upsellApprovalRequests.length > 0 && (
        <div className="section-block">
          <div className="flex items-center gap-2 mb-2.5">
            <ShoppingBag size={14} className="text-[var(--status-amber-fg)]" />
            <span className="label-upper text-[var(--status-amber-fg)]">
              Upsell Approvals
            </span>
            <span className="text-[11px] px-[7px] py-px rounded-[10px] bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] font-semibold">
              {upsellApprovalRequests.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {upsellApprovalRequests.map(req => (
              <motion.div
                key={req.id}
                layout
                onClick={() => setSelectedApprovalRequest(req)}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 cursor-pointer transition-shadow duration-150"
                onHoverStart={e => {}}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                        {req.upsellTitle}
                      </span>
                      {req.escalatedToSupervisor && (
                        <span className="text-[10px] font-semibold px-1.5 py-px rounded-[10px] bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]">
                          ⬆ Escalated — No Cleaner Assigned
                        </span>
                      )}
                      {req.calendarSignal === 'available' && (
                        <span className="text-[10px] font-semibold px-1.5 py-px rounded-[10px] bg-[var(--status-green-bg)] text-[var(--status-green-fg)] border border-[var(--status-green-fg)]">🟢 Available</span>
                      )}
                      {req.calendarSignal === 'tentative' && (
                        <span className="text-[10px] font-semibold px-1.5 py-px rounded-[10px] bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border border-[var(--status-amber-fg)]">🟡 Tentative</span>
                      )}
                      {req.calendarSignal === 'blocked' && (
                        <span className="text-[10px] font-semibold px-1.5 py-px rounded-[10px] bg-[var(--status-red-bg)] text-[var(--status-red-fg)] border border-[var(--status-red-fg)]">🔴 Blocked</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <MapPin size={11} /> {req.propertyName}
                      </span>
                      <span className="text-[11px] text-[var(--text-subtle)]">·</span>
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Calendar size={11} /> {req.checkInDate}
                      </span>
                      <span className="text-[11px] text-[var(--text-subtle)]">·</span>
                      <span className="text-xs text-[var(--text-muted)]">{req.guestName}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-[var(--accent)] font-medium">→ Review</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Task groups */}
      {filteredTasks.length === 0 ? (
        <div className="p-10 text-center text-[var(--text-subtle)] text-[13px]">
          No tasks assigned to you right now.
        </div>
      ) : (
        STATUS_GROUPS.map(group => {
          const groupTasks = filteredTasks.filter(t => (completedIds.has(t.id) ? 'completed' : t.status) === group.key)
          if (groupTasks.length === 0) return null
          return (
            <div key={group.key} className="mb-6">
              <div
                onClick={() => setCollapsedGroups(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                className="flex items-center gap-2 mb-2.5 cursor-pointer select-none"
              >
                <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: group.color }}>{group.label}</span>
                <span className="text-[11px] text-[var(--text-subtle)]">{groupTasks.length}</span>
                <ChevronDown size={13} className="text-[var(--text-subtle)] ml-auto transition-transform duration-200" style={{ transform: collapsedGroups[group.key] ? 'rotate(-90deg)' : 'none' }} />
              </div>
              {!collapsedGroups[group.key] && groupTasks.map(task => {
                // Maintenance tasks get the pipeline card design
                if (isMaintenance && task.type === 'Maintenance') {
                  return (
                    <PipelineMaintenanceCard
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      propertyName={task.propertyName}
                      assigneeName={assigneeName ?? 'Bjorn L.'}
                      priority={task.priority as 'low' | 'medium' | 'high' | 'urgent'}
                      dueDisplay={task.dueDisplay}
                      pteStatus={task.pteStatus as 'not_required' | 'auto_granted' | 'pending' | 'granted' | 'denied' | 'expired' | undefined}
                      pteValidFrom={task.pte?.validFrom}
                      pteValidUntil={task.pte?.validUntil}
                      pteGuestName={task.pte?.guestName}
                      progress={maintProgress[task.id] ?? 'assigned'}
                      onClick={() => setSelectedMaintTask(task)}
                    />
                  )
                }
                return (
                <motion.div
                  layout key={task.id}
                  onClick={() => !completedIds.has(task.id) && setSelectedTask(task)}
                  className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-2 transition-shadow duration-150 ${completedIds.has(task.id) ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[13px] font-semibold ${completedIds.has(task.id) ? 'text-[var(--text-subtle)] line-through' : 'text-[var(--text-primary)]'}`}>
                          {task.title}
                        </span>
                        {task.isDeliveryTask && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-px rounded-[10px] bg-[var(--status-amber-bg)] text-[var(--status-amber-fg)] border border-[var(--status-amber-fg)]"><Package size={10} /> Delivery</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <img src={task.propertyImage} alt="" className="w-6 h-6 rounded object-cover" />
                        <span className="text-xs text-[var(--text-muted)]">{task.propertyName}</span>
                        <span className="text-[11px] text-[var(--text-subtle)]">·</span>
                        <span className="text-xs text-[var(--text-subtle)]">{task.dueDisplay}</span>
                        {(task.type === 'Cleaning' || task.type === 'Maintenance') && !completedIds.has(task.id) && (
                          <span className="text-[11px] text-[var(--accent)] font-medium">{isMaintenance ? '→ Open job' : '→ Open checklist'}</span>
                        )}
                      </div>
                      {task.reservation && (
                        <div className="text-[11px] text-[var(--text-subtle)] mt-1">
                          Guest: {task.reservation.guestName.split(' ')[0]} {task.reservation.guestName.split(' ')[1]?.[0] ?? ''}. · Checkout {new Date(task.reservation.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={task.priority} />
                      {task.pteRequired && task.pteStatus && (() => {
                        const badge = getPTEBadge(task.pteStatus as 'not_required' | 'pending' | 'auto_granted' | 'granted' | 'denied' | 'expired')
                        const bgMap: Record<string, string> = { pending: 'var(--status-amber-bg)', granted: 'var(--status-green-bg)', auto_granted: 'var(--status-green-bg)', denied: 'var(--status-red-bg)', not_required: 'var(--status-muted-bg)' }
                        return (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap" style={{ background: bgMap[task.pteStatus] ?? 'var(--status-muted-bg)', color: badge.color }}>
                            {badge.icon} {badge.label}
                          </span>
                        )
                      })()}
                      {completedIds.has(task.id) && <span className="inline-flex items-center gap-0.5 text-[11px] text-[var(--status-green-fg)]"><Check size={10} /> Done</span>}
                    </div>
                  </div>
                </motion.div>
                )
              })}
            </div>
          )
        })
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Task Detail Drawer */}
      <AppDrawer
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title ?? ''}
        subtitle={`${selectedTask?.propertyName} · ${selectedTask?.dueDisplay}`}
        width={500}
        footer={
          <div className="w-full">
            {totalCount > 0 && (
              <div className="mb-2.5">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[var(--text-muted)]">{checkedCount} of {totalCount} complete</span>
                  <span className="text-xs font-semibold" style={{ color: progressPct === 100 ? 'var(--status-green-fg)' : accent }}>{progressPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--border)]">
                  <div className="h-full rounded-full transition-[width] duration-300" style={{ background: progressPct === 100 ? 'var(--status-green-fg)' : accent, width: `${progressPct}%` }} />
                </div>
              </div>
            )}
            {selectedTask?.type === 'Maintenance' && (
              <div className="text-[11px] text-[var(--text-muted)] mb-2">
                {beforePhotos.length === 0 && '⚠ Upload at least 1 before photo · '}
                {afterPhotos.length === 0 && checkedCount === totalCount && '⚠ Upload at least 1 after photo'}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-2.5 rounded-lg border-none text-sm font-semibold transition-colors duration-200 ${canSubmit ? 'text-white cursor-pointer' : 'text-[var(--text-muted)] cursor-not-allowed'}`}
              style={{ background: canSubmit ? accent : 'var(--border)' }}
            >
              {isCleaningComplete ? 'Submit for QA Review' : selectedTask?.type === 'Maintenance' ? 'Submit for Approval' : progressPct === 100 ? '✓ Submit Complete Clean' : 'Submit Progress Report'}
            </button>
          </div>
        }
      >
        {/* Reservation section */}
        {selectedTask?.reservation && (
          <Card className="p-3.5 mb-3.5">
            <div className="label-upper text-[var(--text-subtle)] mb-2">Connected Reservation</div>
            <div className="flex flex-col gap-1">
              <div className="text-[13px] font-semibold text-[var(--text-primary)]">👤 {selectedTask.reservation.guestName}</div>
              <div className="text-xs text-[var(--text-muted)]">
                📅 {new Date(selectedTask.reservation.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {new Date(selectedTask.reservation.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ({selectedTask.reservation.nights} nights)
              </div>
              {selectedTask.reservation.platform && (
                <div className="text-xs text-[var(--text-muted)]">🏠 {selectedTask.reservation.platform} · {selectedTask.reservation.status.replace('_', ' ')}</div>
              )}
              {selectedTask.reservation.nightsRemaining !== undefined && (
                <div className="text-xs text-[var(--text-muted)]">⏳ {selectedTask.reservation.nightsRemaining} nights remaining</div>
              )}
            </div>
          </Card>
        )}

        {/* PTE section (read-only for field staff) */}
        {selectedTask?.pteRequired && selectedTask.pteStatus && (
          <Card
            className="p-3.5 mb-3.5"
            style={{ borderColor: selectedTask.pteStatus === 'pending' ? 'var(--status-amber-fg)' : selectedTask.pteStatus === 'granted' || selectedTask.pteStatus === 'auto_granted' ? 'var(--status-green-fg)' : selectedTask.pteStatus === 'denied' ? 'var(--status-red-fg)' : 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="label-upper text-[var(--text-subtle)]">Permission to Enter</div>
              <span className="text-[11px] font-semibold" style={{ color: selectedTask.pteStatus === 'pending' ? 'var(--status-amber-fg)' : selectedTask.pteStatus === 'granted' || selectedTask.pteStatus === 'auto_granted' ? 'var(--status-green-fg)' : 'var(--status-red-fg)' }}>
                {selectedTask.pteStatus === 'pending' ? '⏳ Pending' : selectedTask.pteStatus === 'granted' ? '✓ Granted' : selectedTask.pteStatus === 'auto_granted' ? '✓ Auto-Granted' : '✗ Denied'}
              </span>
            </div>
            {selectedTask.pte?.guestName && <div className="text-xs text-[var(--text-muted)] mb-1">Guest: {selectedTask.pte.guestName}</div>}
            {selectedTask.pte?.guestCheckout && <div className="text-xs text-[var(--text-muted)] mb-1">Checkout: {new Date(selectedTask.pte.guestCheckout).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
            {selectedTask.pteStatus === 'auto_granted' && <div className="text-xs text-[var(--text-muted)] mb-1">Property is vacant — no active reservation</div>}
            {selectedTask.pte?.validFrom && <div className="text-xs text-[var(--text-muted)] mb-1">Access window: {new Date(selectedTask.pte.validFrom).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{selectedTask.pte.validUntil ? ` — ${new Date(selectedTask.pte.validUntil).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}</div>}
            {selectedTask.pte?.enterAfter && !selectedTask.pte.validFrom && <div className="text-xs text-[var(--text-muted)] mb-1">Enter after: {selectedTask.pte.enterAfter}</div>}
            {selectedTask.pte?.grantedBy && <div className="text-xs text-[var(--text-muted)] mb-1">Granted by: {selectedTask.pte.grantedBy === 'system' ? 'System (auto)' : selectedTask.pte.grantedBy}</div>}
            {/* Access code */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-[var(--text-muted)]">Access code:</span>
              {isAccessCodeVisible(selectedTask.pteStatus as 'not_required' | 'pending' | 'auto_granted' | 'granted' | 'denied' | 'expired') && selectedTask.pte?.accessCode ? (
                showAccessCode
                  ? <span className="text-[13px] font-semibold font-mono text-[var(--text-primary)] tracking-wider">{selectedTask.pte.accessCode}</span>
                  : <button onClick={() => setShowAccessCode(true)} className="text-xs text-[var(--accent)] bg-transparent border-none cursor-pointer flex items-center gap-1"><Eye size={13} /> Show Code</button>
              ) : (
                <span className="text-xs text-[var(--text-subtle)] flex items-center gap-1"><Lock size={12} /> Locked until PTE granted</span>
              )}
            </div>
            {selectedTask.pteStatus === 'pending' && (
              <div className="mt-2 text-xs text-[var(--status-amber-fg)] bg-[var(--status-amber-bg)] rounded-md px-2.5 py-1.5">
                ⚠ Waiting for Guest Services to confirm access
              </div>
            )}
            {selectedTask.pte?.notes && <div className="mt-2 text-xs text-[var(--text-muted)] italic">&ldquo;{selectedTask.pte.notes}&rdquo;</div>}
          </Card>
        )}

        {selectedTask?.type === 'Cleaning' && (
          <div>
            {/* Action bar */}
            {drawerCleaningJob && drawerJobStatus === 'pending' && (
              <button
                onClick={handleStartFromDrawer}
                className="w-full py-3 rounded-lg border-none text-white text-sm font-semibold cursor-pointer mb-3.5"
                style={{ background: accent }}
              >
                ▶ Start Task
              </button>
            )}

            {drawerJobStatus === 'in-progress' && cleaningProgress && (
              <div className="mb-3.5">
                <CleaningProgressBar
                  progress={cleaningProgress}
                  checkInTime={drawerCleaningJob?.checkinTime ?? null}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => drawerCleaningJob && setRestartingJob(drawerCleaningJob)}
                    className="flex-1 py-2 rounded-[7px] text-xs font-semibold cursor-pointer bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]"
                  >
                    ⟳ Restart
                  </button>
                  <button
                    onClick={handleStopFromDrawer}
                    className="flex-1 py-2 rounded-[7px] text-xs font-semibold cursor-pointer bg-[var(--status-muted-bg)] text-[var(--text-muted)] border border-[var(--border)]"
                  >
                    ■ Stop Task
                  </button>
                  <button
                    onClick={() => drawerCleaningJob && setReportingJob(drawerCleaningJob)}
                    className="flex-1 py-2 rounded-[7px] text-xs font-semibold cursor-pointer bg-[var(--status-red-bg)] text-[var(--status-red-fg)] border border-[var(--status-red-fg)]"
                  >
                    ⚠ Report
                  </button>
                </div>
              </div>
            )}

            {/* Property info card — expandable */}
            {(() => {
              const prop = PROPERTIES.find(p => p.id === selectedTask.propertyId)
              const lib  = PROPERTY_LIBRARIES.find(l => l.propertyId === selectedTask.propertyId)
              if (!prop) return null
              const hints = [
                lib?.wifiName    ? '📶 WiFi'    : null,
                lib?.accessCode  ? '🔑 Access'  : null,
                lib?.parkingInfo ? '🅿️ Parking' : null,
              ].filter(Boolean) as string[]
              return (
                <motion.div layout
                  transition={{ layout: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } }}
                  className="mb-4 rounded-xl overflow-hidden cursor-pointer"
                  style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}
                  onClick={() => setPropCardOpen(o => !o)}
                >
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    {prop.imageUrl && <img src={prop.imageUrl} alt="" className="w-12 h-9 rounded-[5px] object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--text-primary)]">{prop.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {prop.beds} {prop.beds === 1 ? 'bed' : 'beds'} · {prop.baths} {prop.baths === 1 ? 'bath' : 'baths'}
                        {prop.amenities && prop.amenities.length > 0 && ` · ${prop.amenities.length} special areas`}
                      </div>
                      {!propCardOpen && hints.length > 0 && (
                        <div className="text-[10px] text-[var(--text-subtle)] mt-0.5">{hints.join(' · ')}</div>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] shrink-0">{propCardOpen ? '▾' : '▸'}</span>
                  </div>
                  {propCardOpen && lib && (
                    <div className="px-3.5 py-3 border-t" style={{ borderColor: `${accent}20` }} onClick={e => e.stopPropagation()}>
                      {([
                        lib.wifiName     ? { icon:'📶', label:'WiFi',      value: lib.wifiName,         key:'wifi-ssid',  copy: true,  masked: false } : null,
                        lib.wifiPassword ? { icon:'',   label:'Password',  value: lib.wifiPassword,     key:'wifi-pw',   copy: true,  masked: true  } : null,
                        lib.accessCode   ? { icon:'🔑', label:'Door Code', value: lib.accessCode,       key:'door-code', copy: true,  masked: false } : null,
                        lib.storageLocation ? { icon:'📦', label:'Storage', value: lib.storageLocation, key:'storage', copy: false, masked: false } : null,
                        lib.cleaningNotes   ? { icon:'📝', label:'Notes',   value: lib.cleaningNotes,   key:'notes',   copy: false, masked: false } : null,
                      ] as const).filter(Boolean).map((row: any) => (
                        <div key={row.key} className="flex items-center gap-2 py-[7px] border-b border-[var(--border-subtle)]">
                          <span className="text-sm w-5 shrink-0">{row.icon}</span>
                          <span className="text-[11px] text-[var(--text-muted)] w-16 shrink-0">{row.label}</span>
                          <span className={`flex-1 text-xs text-[var(--text-primary)] ${row.key === 'door-code' ? 'font-mono' : ''}`}>
                            {row.masked ? '••••••••' : row.value}
                          </span>
                          {row.copy && (
                            <motion.button
                              animate={copiedField === row.key ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                              transition={{ duration: 0.2 }}
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(row.value, row.key) }}
                              className="text-[10px] px-2 py-[3px] rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] cursor-pointer shrink-0 min-w-[44px] min-h-[28px]"
                              style={{ color: copiedField === row.key ? 'var(--status-green-fg)' : 'var(--text-muted)' }}>
                              {copiedField === row.key ? '✓' : 'Copy'}
                            </motion.button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); setPropLibOpen(true) }}
                        className="mt-2.5 text-xs text-[var(--accent)] bg-transparent border-none cursor-pointer p-0">
                        View all property info →
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })()}

            {/* Upsell delivery items — only for delivery tasks */}
            {selectedTask.isDeliveryTask && (
              <div className="mb-4 p-3.5 bg-[var(--status-amber-bg)] border border-[var(--status-amber-fg)] rounded-xl">
                {selectedTask.upsellId && (() => {
                  const approval = UPSELL_APPROVAL_REQUESTS.find(a => a.id === selectedTask.upsellId)
                  const reservation = approval ? RESERVATIONS.find(r => r.guestVerificationId === approval.guestVerificationId) : null
                  return approval ? (
                    <div className="mb-3">
                      <div className="label-upper text-[var(--status-amber-fg)] mb-1">📦 Upsell Delivery</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {approval.guestName} · Check-in {approval.checkInDate}
                        {reservation ? ` · ${reservation.guestsCount} guest${reservation.guestsCount !== 1 ? 's' : ''}` : ''}
                      </div>
                      {selectedTask.linkedCleaningTaskId && (
                        <div className="text-[11px] text-[var(--status-green-fg)] mt-1">✓ Linked with same-day cleaning</div>
                      )}
                    </div>
                  ) : null
                })()}
                <div className="label-upper text-[var(--text-muted)] mb-2">Items to Deliver</div>
                {(selectedTask.upsellItems ?? []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-subtle)]">
                    <span className="text-sm">📦</span>
                    <span className="flex-1 text-[13px] text-[var(--text-primary)]">{item.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{item.qty} {item.unit}</span>
                  </div>
                ))}
                {selectedTask.setupInstructions && (
                  <div className="mt-3 p-2.5 bg-[var(--bg-elevated)] rounded-lg text-xs text-[var(--text-muted)] leading-normal">
                    <span className="font-semibold text-[var(--text-primary)]">Setup: </span>
                    {selectedTask.setupInstructions}
                  </div>
                )}
              </div>
            )}

            {/* Checklist by category */}
            {checklistGroups.map(group => {
              const groupChecked = group.items.filter(i => checklistChecked[i.id]).length
              const isCollapsed = collapsedCategories.has(group.name)
              return (
                <div key={group.name} className="mb-5">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(group.name)}
                    className={`w-full flex justify-between items-center bg-transparent border-none cursor-pointer py-1.5 ${isCollapsed ? 'mb-0' : 'mb-1.5'}`}
                  >
                    <span className="label-upper text-[var(--accent)]">
                      {group.name} {groupChecked}/{group.items.length}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {isCollapsed ? '▶' : '▼'}
                    </span>
                  </button>

                  {/* Items — only when expanded */}
                  {!isCollapsed && group.items.map(item => (
                    <div key={item.id} className="flex items-start gap-2.5 px-1 py-2 border-b border-[var(--border-subtle)]">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleCheck(item.id)}
                        className={`w-5 h-5 rounded-[5px] shrink-0 mt-px cursor-pointer flex items-center justify-center ${checklistChecked[item.id] ? 'bg-[var(--status-green-fg)] border-2 border-[var(--status-green-fg)]' : 'bg-transparent border-2 border-[var(--border)]'}`}
                      >
                        {checklistChecked[item.id] && <Check size={11} color="#fff" />}
                      </button>

                      {/* Label */}
                      <span className={`flex-1 text-[13px] leading-snug ${checklistChecked[item.id] ? 'text-[var(--text-subtle)] line-through' : 'text-[var(--text-primary)]'}`}>
                        {item.label}
                        {item.photoRequired && <span className="text-[10px] text-[var(--status-amber-fg)] ml-1">● photo req.</span>}
                      </span>

                      {/* Photo upload */}
                      {checklistPhotos[item.id] ? (
                        <div className="relative shrink-0">
                          <img src={checklistPhotos[item.id]} className="w-11 h-11 rounded-md object-cover border border-[var(--border)] block" alt="proof" />
                          <button
                            onClick={() => setChecklistPhotos(p => { const n = { ...p }; delete n[item.id]; return n })}
                            className="absolute -top-[5px] -right-[5px] w-4 h-4 rounded-full bg-[var(--status-red-fg)] border-2 border-[var(--bg-surface)] text-white text-[8px] cursor-pointer flex items-center justify-center leading-none"
                          >×</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerUpload(`item:${item.id}`)}
                          title="Upload photo proof"
                          className={`w-9 h-9 rounded-[7px] shrink-0 bg-transparent cursor-pointer flex items-center justify-center ${item.photoRequired ? 'border border-dashed border-[var(--status-amber-fg)] text-[var(--status-amber-fg)]' : 'border border-dashed border-[var(--border)] text-[var(--text-subtle)]'}`}
                        >
                          <Camera size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Supplies Used / Items to Deliver — collapsible */}
            {(() => {
              const isDelivery = selectedTask.isDeliveryTask ?? false
              const sectionLabel = isDelivery ? 'Items to Deliver' : 'Supplies Used'
              const stockStatusColor = (s: string) =>
                s === 'ok' ? 'var(--status-green-fg)' : s === 'low' ? 'var(--status-amber-fg)' : s === 'critical' ? 'var(--status-amber-fg)' : 'var(--status-red-fg)'
              const totalQty = supplyItems.reduce((sum, i) => sum + i.qty, 0)
              return (
                <div className="mt-2 mb-4 border border-[var(--border)] rounded-xl overflow-visible">
                  {/* Collapsible header */}
                  <button
                    onClick={() => setSuppliesOpen(o => !o)}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 bg-transparent border-none cursor-pointer"
                  >
                    <ChevronDown size={13} className="text-[var(--text-muted)] shrink-0 transition-transform duration-200" style={{ transform: suppliesOpen ? 'none' : 'rotate(-90deg)' }} />
                    <span className="label-upper text-[var(--text-muted)]">
                      {sectionLabel}
                    </span>
                    {!suppliesOpen && supplyItems.length > 0 && (
                      <span className="text-[11px] text-[var(--text-subtle)] ml-1">
                        {supplyItems.length} item{supplyItems.length !== 1 ? 's' : ''} · {totalQty} {totalQty === 1 ? 'unit' : 'units'}
                      </span>
                    )}
                    {!suppliesOpen && supplyItems.length === 0 && (
                      <span className="text-[11px] text-[var(--text-subtle)] ml-1">none logged yet</span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); setShowAddSheet(true); setSheetSearch(''); setSheetQtys({}); setSheetY('partial'); setSuppliesOpen(true) }}
                      className="ml-auto text-[11px] text-[var(--accent)] bg-transparent border-none cursor-pointer shrink-0 px-2.5 py-1"
                    >
                      + Add item
                    </button>
                  </button>

                  {/* Expanded content */}
                  {suppliesOpen && (
                    <div className="border-t border-[var(--border-subtle)] px-3.5 py-2 pb-3">
                      {supplyItems.length === 0 && (
                        <div className="text-xs text-[var(--text-subtle)] italic py-2">
                          No items logged — tap &ldquo;+ Add item&rdquo; to select from warehouse
                        </div>
                      )}
                      {supplyItems.map(item => {
                        const stockItem = STOCK_ITEMS.find(s => s.id === item.id)
                        const statusColor = stockStatusColor(stockItem?.status ?? 'ok')
                        return (
                          <div key={item.id} className="flex items-center justify-between py-[7px] border-b border-[var(--border-subtle)]">
                            <div className="flex-1 min-w-0">
                              <span className="text-[13px] text-[var(--text-primary)]">{item.name}</span>
                              {stockItem && (
                                <span className="text-[10px] ml-1.5" style={{ color: statusColor }}>
                                  ({stockItem.inStock} in stock · {stockItem.status})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => setSupplyItems(p => p.map(i => i.id === item.id ? {...i, qty: Math.max(0, i.qty - 1)} : i))} className={stepperBtnCls}>−</button>
                              <span className="text-[13px] min-w-[22px] text-center font-semibold">{item.qty}</span>
                              <button onClick={() => setSupplyItems(p => p.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i))} className={stepperBtnCls}>+</button>
                              <span className="text-[11px] text-[var(--text-muted)] min-w-[30px]">{item.unit}</span>
                              <button onClick={() => setSupplyItems(p => p.filter(i => i.id !== item.id))} className="text-sm text-[var(--text-subtle)] bg-transparent border-none cursor-pointer leading-none">×</button>
                            </div>
                          </div>
                        )
                      })}
                      {/* Available items (not yet in list) */}
                      {(() => {
                        const availableItems = STOCK_ITEMS.filter(s => s.forGuest !== false && !supplyItems.find(i => i.id === s.id))
                        if (availableItems.length === 0) return null
                        return (
                          <div className="mt-2.5 border-t border-dashed border-[var(--border-subtle)] pt-2">
                            <div className="label-upper text-[var(--text-subtle)] mb-1.5">Available</div>
                            {availableItems.map(s => (
                              <motion.div layout key={s.id} className="flex items-center justify-between py-1.5 opacity-60">
                                <span className="text-xs text-[var(--text-muted)]">
                                  {s.name} <span className="text-[var(--text-subtle)]">({s.unit})</span>
                                </span>
                                <button
                                  onClick={() => setSupplyItems(p => [...p, { id: s.id, name: s.name, unit: s.unit, qty: 1 }])}
                                  className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] text-base cursor-pointer flex items-center justify-center leading-none">
                                  +
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* QA Step — appears when all checklist items are checked */}
            {progressPct === 100 && (
              <div className="mt-2 p-4 rounded-xl" style={{ background: `${accent}08`, border: `1px solid ${accent}30` }}>
                <div className="label-upper text-[var(--accent)] mb-3.5">QA Review Required</div>

                {/* Star rating */}
                <div className="mb-3.5">
                  <div className="text-xs text-[var(--text-muted)] mb-1.5">Quality Rating</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setQaRating(star)}
                        className="text-[28px] leading-none bg-transparent border-none cursor-pointer px-[3px] py-0.5 transition-colors duration-100"
                        style={{ color: star <= qaRating ? 'var(--status-amber-fg)' : 'var(--border)' }}
                      >
                        ★
                      </button>
                    ))}
                    {qaRating > 0 && <span className="text-xs text-[var(--text-muted)] self-center ml-1">{qaRating}/5</span>}
                  </div>
                </div>

                {/* Photo upload */}
                <div className="mb-3.5">
                  <div className="text-xs text-[var(--text-muted)] mb-1.5">
                    Photos <span className="text-[var(--status-red-fg)] text-[11px]">(at least 1 required)</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {afterPhotos.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} className="w-[72px] h-[54px] rounded-lg object-cover block" style={{ border: `2px solid ${accent}` }} alt="qa" />
                        <button
                          onClick={() => setAfterPhotos(p => p.filter((_, j) => j !== i))}
                          className="absolute -top-[5px] -right-[5px] w-4 h-4 rounded-full bg-[var(--status-red-fg)] border-2 border-[var(--bg-surface)] text-white text-[8px] cursor-pointer flex items-center justify-center"
                        >×</button>
                      </div>
                    ))}
                    {afterPhotos.length < 5 && (
                      <button
                        onClick={() => triggerUpload('after')}
                        className="w-[72px] h-[54px] rounded-lg cursor-pointer flex flex-col items-center justify-center gap-[3px]"
                        style={{ border: `2px dashed ${accent}`, background: `${accent}08`, color: accent }}
                      >
                        <Camera size={16} />
                        <span className="text-[9px] font-semibold">Add</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-1.5">Notes (optional)</div>
                  <textarea
                    value={qaNotes}
                    onChange={e => setQaNotes(e.target.value)}
                    placeholder="Any notes for the operator..."
                    className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-[13px] outline-none resize-y min-h-[60px] box-border"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTask?.type === 'Maintenance' && (
          <div>
            {/* Before Photos */}
            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--status-red-fg)] mb-2.5">
                Before Photos {beforePhotos.length === 0 && <span className="font-normal text-[var(--text-muted)] normal-case tracking-normal">(required)</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {beforePhotos.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} className="w-20 h-[60px] rounded-lg object-cover border border-[var(--border)] block" alt="before" />
                    <button
                      onClick={() => setBeforePhotos(p => p.filter((_, j) => j !== i))}
                      className="absolute -top-[5px] -right-[5px] w-4 h-4 rounded-full bg-[var(--status-red-fg)] border-2 border-[var(--bg-surface)] text-white text-[8px] cursor-pointer flex items-center justify-center"
                    >×</button>
                  </div>
                ))}
                {beforePhotos.length < 5 && (
                  <button
                    onClick={() => triggerUpload('before')}
                    className="w-20 h-[60px] rounded-lg border-2 border-dashed border-[var(--status-red-fg)] bg-[var(--status-red-bg)] text-[var(--status-red-fg)] cursor-pointer flex flex-col items-center justify-center gap-[3px]"
                  >
                    <Camera size={16} />
                    <span className="text-[9px] font-semibold">Add</span>
                  </button>
                )}
              </div>
            </div>

            {/* Work Items checklist */}
            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)] mb-2.5">
                Work Items <span className="font-normal text-[var(--text-muted)] normal-case tracking-normal">{checkedCount}/{totalCount}</span>
              </div>
              {activeChecklist.map(item => (
                <div key={item.id} className="flex items-center gap-2.5 px-1 py-[9px] border-b border-[var(--border-subtle)]">
                  <button
                    onClick={() => toggleCheck(item.id)}
                    className={`w-5 h-5 rounded-[5px] shrink-0 cursor-pointer flex items-center justify-center ${checklistChecked[item.id] ? 'bg-[var(--status-green-fg)] border-2 border-[var(--status-green-fg)]' : 'bg-transparent border-2 border-[var(--border)]'}`}
                  >
                    {checklistChecked[item.id] && <Check size={11} color="#fff" />}
                  </button>
                  <span className={`flex-1 text-[13px] ${checklistChecked[item.id] ? 'text-[var(--text-subtle)] line-through' : 'text-[var(--text-primary)]'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* After Photos */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--status-green-fg)] mb-2.5">
                After Photos {afterPhotos.length === 0 && <span className="font-normal text-[var(--text-muted)] normal-case tracking-normal">(required for approval)</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {afterPhotos.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} className="w-20 h-[60px] rounded-lg object-cover border-2 border-[var(--status-green-fg)] block" alt="after" />
                    <button
                      onClick={() => setAfterPhotos(p => p.filter((_, j) => j !== i))}
                      className="absolute -top-[5px] -right-[5px] w-4 h-4 rounded-full bg-[var(--status-red-fg)] border-2 border-[var(--bg-surface)] text-white text-[8px] cursor-pointer flex items-center justify-center"
                    >×</button>
                  </div>
                ))}
                {afterPhotos.length < 5 && (
                  <button
                    onClick={() => triggerUpload('after')}
                    disabled={checkedCount < totalCount}
                    className={`w-20 h-[60px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-[3px] ${checkedCount === totalCount ? 'border-[var(--status-green-fg)] bg-[var(--status-green-bg)] text-[var(--status-green-fg)] cursor-pointer' : 'border-[var(--border)] bg-transparent text-[var(--text-subtle)] cursor-not-allowed'}`}
                  >
                    <Camera size={16} />
                    <span className="text-[9px] font-semibold">{checkedCount < totalCount ? 'Complete work first' : 'Add'}</span>
                  </button>
                )}
              </div>
              {afterPhotos.length === 0 && checkedCount < totalCount && (
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">Complete all work items before uploading after photos.</p>
              )}
            </div>
          </div>
        )}

        {selectedTask && selectedTask.type !== 'Cleaning' && selectedTask.type !== 'Maintenance' && (
          <div className="py-5">
            <div className="text-sm text-[var(--text-muted)] mb-4">
              {selectedTask.description ?? 'No additional details for this task.'}
            </div>
            <div className="bg-[var(--bg-elevated)] rounded-lg p-3 mb-4">
              <div className="text-xs text-[var(--text-muted)] mb-1">Property</div>
              <div className="text-[13px] text-[var(--text-primary)] font-medium">{selectedTask.propertyName}</div>
            </div>
            <button
              onClick={() => { setCompletedIds(p => new Set([...p, selectedTask.id])); setSelectedTask(null); showToast('Task marked complete') }}
              className="w-full py-2.5 rounded-lg border-none text-white text-sm font-semibold cursor-pointer"
              style={{ background: accent }}
            >
              Mark Complete
            </button>
          </div>
        )}
      </AppDrawer>

      {/* Add Item Bottom Sheet */}
      <AnimatePresence>
        {showAddSheet && selectedTask?.type === 'Cleaning' && (() => {
          const guestItems = STOCK_ITEMS.filter(s => s.forGuest !== false)
          const allCats = [...new Set(guestItems.map(s => s.category))]
          const FREQUENTLY_ADDED_IDS = ['i5', 'i9', 'i4', 'i18', 'i12']
          const frequentItems = guestItems.filter(s => FREQUENTLY_ADDED_IDS.includes(s.id))
          const filteredAll = sheetSearch.trim()
            ? guestItems.filter(s => s.name.toLowerCase().includes(sheetSearch.toLowerCase()))
            : null
          const addedCount = Object.values(sheetQtys).filter(q => q > 0).length
          return (
            <div
              key="add-sheet-backdrop"
              className="fixed inset-0 z-[500] bg-black/50"
              onClick={() => setShowAddSheet(false)}
            >
              <motion.div
                key="add-sheet"
                onClick={e => e.stopPropagation()}
                drag="y"
                dragConstraints={{ top: 0 }}
                dragElastic={0.1}
                onDragEnd={(_: unknown, info: { velocity: { y: number }; offset: { y: number } }) => {
                  if (info.velocity.y > 400 || info.offset.y > 200) setShowAddSheet(false)
                  else if (info.offset.y < -80) setSheetY('full')
                  else setSheetY('partial')
                }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 bg-[var(--bg-surface)] rounded-t-2xl border-t border-[var(--border)] flex flex-col transition-[height] duration-[250ms] ease-out"
                style={{ height: sheetY === 'full' ? '100dvh' : '62dvh' }}
              >
                <div className="flex justify-center pt-2.5 pb-1.5">
                  <div className="w-9 h-1 rounded-sm bg-[var(--border)]" />
                </div>
                <div className="px-4 pb-3">
                  <input
                    placeholder="🔍 Search items..."
                    value={sheetSearch}
                    onChange={e => setSheetSearch(e.target.value)}
                    className="w-full px-3 py-[9px] rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none box-border"
                  />
                </div>
                <div className="flex-1 overflow-y-auto px-4">
                  {filteredAll ? (
                    filteredAll.map(s => <SheetItemRow key={s.id} item={s} sheetQtys={sheetQtys} setSheetQtys={setSheetQtys} accent={accent} />)
                  ) : (
                    <>
                      <div className="label-upper text-[var(--text-subtle)] mb-2">Frequently Added</div>
                      {frequentItems.map(s => <SheetItemRow key={s.id} item={s} sheetQtys={sheetQtys} setSheetQtys={setSheetQtys} accent={accent} />)}
                      {allCats.map(cat => {
                        const open = sheetCatOpen[cat] ?? false
                        const items = guestItems.filter(s => s.category === cat)
                        return (
                          <div key={cat} className="mt-4">
                            <button
                              onClick={() => setSheetCatOpen(p => ({...p, [cat]: !p[cat]}))}
                              className="w-full flex justify-between items-center bg-transparent border-none cursor-pointer py-1.5 label-upper text-[var(--text-subtle)]">
                              {cat}
                              <span>{open ? '▼' : '▶'}</span>
                            </button>
                            {open && items.map(s => <SheetItemRow key={s.id} item={s} sheetQtys={sheetQtys} setSheetQtys={setSheetQtys} accent={accent} />)}
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
                <div className="px-4 py-3 pb-6">
                  <button
                    onClick={() => {
                      const itemsToAdd = Object.entries(sheetQtys).filter(([, qty]) => qty > 0)
                      itemsToAdd.forEach(([id, qty]) => {
                        const s = STOCK_ITEMS.find(x => x.id === id)
                        if (!s) return
                        setSupplyItems(p => {
                          const exists = p.find(i => i.id === id)
                          if (exists) return p.map(i => i.id === id ? {...i, qty: i.qty + qty} : i)
                          return [...p, { id: s.id, name: s.name, unit: s.unit, qty }]
                        })
                      })
                      setShowAddSheet(false)
                      setSheetQtys({})
                    }}
                    className="w-full h-[52px] rounded-xl text-[15px] font-semibold border-none cursor-pointer text-white"
                    style={{ background: accent }}>
                    {addedCount > 0 ? `Done (${addedCount} item${addedCount !== 1 ? 's' : ''} added)` : 'Done'}
                  </button>
                </div>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>

      {/* Property Library Full-Screen Sheet */}
      <AnimatePresence>
        {propLibOpen && selectedTask && (() => {
          const lib = PROPERTY_LIBRARIES.find(l => l.propertyId === selectedTask.propertyId)
          if (!lib) return null
          const libAny = lib as any
          const sections = [
            { title: 'Access',     content: lib.accessCode ? `Code: ${lib.accessCode}\n${lib.accessInstructions ?? ''}` : (lib.accessInstructions ?? '') },
            { title: 'WiFi',       content: lib.wifiName ? `SSID: ${lib.wifiName}\nPassword: ${lib.wifiPassword ?? ''}` : '' },
            { title: 'Storage',    content: libAny.storageLocation ?? '' },
            { title: 'Parking',    content: lib.parkingInfo ?? '' },
            { title: 'Notes',      content: libAny.cleaningNotes ?? lib.internalNotes ?? '' },
            { title: 'Emergency',  content: lib.emergency.contacts.map((c: { name: string; phone?: string }) => `${c.name}: ${c.phone ?? ''}`).join('\n') + (lib.emergency.nearestHospital ? `\nHospital: ${lib.emergency.nearestHospital}` : '') },
            { title: 'Appliances', content: lib.appliances.map((a: { name: string; brand?: string; notes?: string; location?: string }) => `${a.name}${a.brand ? ` (${a.brand})` : ''}: ${a.notes ?? a.location ?? ''}`).join('\n') },
          ].filter(s => s.content.trim())
          return (
            <motion.div
              key="prop-lib-sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type:'spring', damping: 25, stiffness: 280 }}
              className="fixed inset-0 z-[600] bg-[var(--bg-surface)] flex flex-col"
            >
              <div className="flex items-center px-[18px] py-4 border-b border-[var(--border)] shrink-0">
                <button onClick={() => setPropLibOpen(false)}
                  className="bg-transparent border-none text-[var(--accent)] text-[13px] font-medium cursor-pointer p-0 whitespace-nowrap">
                  ← Back to task
                </button>
                <span className="flex-1 text-sm font-semibold text-[var(--text-primary)] text-center">Property Info</span>
                <span className="w-[90px]" />
              </div>
              <div className="flex-1 overflow-y-auto px-[18px] py-4">
                {sections.map(section => (
                  <LibAccordionSection key={section.title} title={section.title} content={section.content} accent={accent} />
                ))}
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Maintenance Task Drawer */}
      {(() => {
        const mt = selectedMaintTask
        if (!mt) return null
        const taskId = mt.id
        const progress = maintProgress[taskId] ?? 'assigned'
        const eta = maintEta[taskId] ?? ''
        const resolution = maintResolution[taskId] ?? ''
        const beforeDone = maintBeforeDone[taskId] ?? false
        const afterDone = maintAfterDone[taskId] ?? false
        const comments = maintComments[taskId] ?? []
        const techName = assigneeName ?? 'Tech'

        const MAINT_STEPS = [
          { key: 'assigned', label: 'Assigned' },
          { key: 'en_route', label: 'En route' },
          { key: 'on_site',  label: 'On site' },
          { key: 'done',     label: 'Done' },
        ] as const

        const stepIdx = { assigned: 0, en_route: 1, on_site: 2, done: 3 }[progress]

        const handleSetEnRoute = () => {
          if (!eta) return
          setMaintProgress(prev => ({ ...prev, [taskId]: 'en_route' }))
          // Write live alert
          try {
            const alerts = JSON.parse(localStorage.getItem('afterstay_live_alerts') ?? '[]')
            alerts.push({
              id: `maint-enroute-${taskId}-${Date.now()}`,
              type: 'maintenance_enroute',
              severity: 'info',
              title: `${techName} en route — ${mt.propertyName}`,
              body: `ETA: ${eta}. Maintenance job: ${mt.title}`,
              propertyId: mt.propertyId,
              assignedTo: ['guest_services'],
              read: false,
              createdAt: new Date().toISOString(),
              actionRoute: '/app/my-tasks',
            })
            localStorage.setItem('afterstay_live_alerts', JSON.stringify(alerts))
          } catch {}
          // Update issue store
          try {
            const issues = JSON.parse(localStorage.getItem('afterstay_issues') ?? '[]')
            const idx = issues.findIndex((i: { propertyId: string; type: string; status: string }) =>
              i.propertyId === mt.propertyId && i.type === 'maintenance' && i.status !== 'resolved'
            )
            if (idx !== -1) {
              issues[idx].status = 'in_progress'
              issues[idx].response = `Tech en route. ETA: ${eta}`
            }
            localStorage.setItem('afterstay_issues', JSON.stringify(issues))
          } catch {}
          showToast('Guest Services notified')
        }

        const handleNotifyPTE = () => {
          setPteNotified(prev => new Set([...prev, taskId]))
          try {
            const alerts = JSON.parse(localStorage.getItem('afterstay_live_alerts') ?? '[]')
            alerts.push({
              id: `pte-followup-${taskId}-${Date.now()}`,
              type: 'pte_followup',
              severity: 'warning',
              title: `PTE still pending — ${mt.propertyName}`,
              body: `Maintenance tech assigned. Guest has not yet approved entry for ${mt.title}.`,
              propertyId: mt.propertyId,
              createdAt: new Date().toISOString(),
              read: false,
              actionRoute: '/app/my-tasks',
            })
            localStorage.setItem('afterstay_live_alerts', JSON.stringify(alerts))
          } catch {}
          showToast('Guest Services notified')
        }

        const handleResolve = (r: string) => {
          setMaintResolution(prev => ({ ...prev, [taskId]: r }))
          if (r === 'fixed' || r === 'minor') {
            setMaintProgress(prev => ({ ...prev, [taskId]: 'done' }))
            setCompletedIds(prev => new Set([...prev, taskId]))
            setSelectedMaintTask(null)
            showToast('✓ Job completed')
          }
        }

        const handleSubmitVendor = () => {
          setMaintProgress(prev => ({ ...prev, [taskId]: 'done' }))
          setCompletedIds(prev => new Set([...prev, taskId]))
          setSelectedMaintTask(null)
          showToast('✓ Work order submitted')
        }

        const handleSubmitParts = () => {
          setMaintProgress(prev => ({ ...prev, [taskId]: 'done' }))
          setCompletedIds(prev => new Set([...prev, taskId]))
          setSelectedMaintTask(null)
          showToast('✓ Parts request submitted')
        }

        const postComment = () => {
          if (!commentDraft.trim()) return
          const newComment = {
            author: techName,
            text: commentDraft.trim(),
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          }
          setMaintComments(prev => ({ ...prev, [taskId]: [...(prev[taskId] ?? []), newComment] }))
          setCommentDraft('')
        }

        // PTE panel border color
        const pteBorderColor = mt.pteStatus === 'pending' ? 'var(--status-amber-fg)'
          : mt.pteStatus === 'granted' || mt.pteStatus === 'auto_granted' ? 'var(--status-green-fg)'
          : mt.pteStatus === 'denied' ? 'var(--status-red-fg)'
          : 'var(--border)'

        return (
          <AppDrawer
            open={!!selectedMaintTask}
            onClose={() => setSelectedMaintTask(null)}
            title={mt.title}
            subtitle={`${mt.propertyName} · ${mt.dueDisplay}`}
            width={520}
          >
            {/* ── A: Pipeline bar ── */}
            <div className="flex items-center mb-5">
              {MAINT_STEPS.map((step, i) => {
                const rel = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'inactive'
                const stepCls = rel === 'done'
                  ? 'bg-[var(--status-green-bg)] text-[var(--status-green-fg)] border border-[var(--status-green-fg)]'
                  : rel === 'active'
                    ? 'bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-subtle)] border border-[var(--border-subtle)]'
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className={`${stepCls} flex-1 px-2 py-[5px] rounded-[5px] text-[10px] font-semibold text-center whitespace-nowrap`}>
                      {step.label}
                    </div>
                    {i < MAINT_STEPS.length - 1 && (
                      <div className="w-4 flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="var(--text-subtle)" strokeWidth="2"><path d="M4 8h8M9 5l3 3-3 3"/></svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── B: PTE panel ── */}
            {mt.pteRequired && mt.pteStatus && mt.pteStatus !== 'not_required' && (
              <Card className="p-3.5 mb-4" style={{ borderColor: pteBorderColor }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="label-upper text-[var(--text-subtle)]">Permission to Enter</span>
                  <span className="text-[11px] font-semibold" style={{ color: mt.pteStatus === 'pending' ? 'var(--status-amber-fg)' : mt.pteStatus === 'granted' || mt.pteStatus === 'auto_granted' ? 'var(--status-green-fg)' : 'var(--status-red-fg)' }}>
                    {mt.pteStatus === 'pending' ? '⏳ Awaiting guest approval'
                      : mt.pteStatus === 'granted' ? '✅ Granted'
                      : mt.pteStatus === 'auto_granted' ? '✅ Vacant — enter any time'
                      : '🔒 Access denied'}
                  </span>
                </div>

                {mt.pte?.guestName && <div className="text-xs text-[var(--text-muted)] mb-1">Guest: {mt.pte.guestName}</div>}
                {mt.pte?.validFrom && mt.pte?.validUntil && (
                  <div className="text-xs text-[var(--text-muted)] mb-1">
                    Access window: {new Date(mt.pte.validFrom).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} — {new Date(mt.pte.validUntil).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {mt.pte?.grantedBy && <div className="text-xs text-[var(--text-muted)] mb-1">Granted by: {mt.pte.grantedBy}</div>}
                {mt.pte?.notes && <div className="text-xs text-[var(--text-muted)] mb-2 italic">&ldquo;{mt.pte.notes}&rdquo;</div>}
                {mt.pteStatus === 'auto_granted' && <div className="text-xs text-[var(--text-muted)] mb-2">Property is vacant — no active reservation.</div>}

                {/* Access code */}
                {(mt.pteStatus === 'granted' || mt.pteStatus === 'auto_granted') && mt.pte?.accessCode && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[var(--text-muted)]">Access code:</span>
                    {maintCodeVisible[taskId] ? (
                      <span className="text-sm font-semibold font-mono text-[var(--text-primary)] tracking-widest bg-[var(--status-green-bg)] px-2.5 py-0.5 rounded-[5px]">{mt.pte.accessCode}</span>
                    ) : (
                      <button
                        onClick={() => setMaintCodeVisible(prev => ({ ...prev, [taskId]: true }))}
                        className="text-xs text-[var(--accent)] bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-md px-2.5 py-[3px] cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={12} /> Reveal Code
                      </button>
                    )}
                  </div>
                )}

                {/* Notify Guest Services button (pending only) */}
                {mt.pteStatus === 'pending' && (
                  <div className="mt-2">
                    {pteNotified.has(taskId) ? (
                      <span className="text-xs text-[var(--status-green-fg)]">✓ Guest Services notified</span>
                    ) : (
                      <button
                        onClick={handleNotifyPTE}
                        className="text-xs font-medium text-[var(--accent)] bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-md px-3 py-[5px] cursor-pointer"
                      >
                        Notify Guest Services
                      </button>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* ── C: Step content ── */}

            {/* Assigned step */}
            {progress === 'assigned' && (
              <Card className="p-3.5 mb-4 border-[var(--border-subtle)]">
                <label className="block text-xs text-[var(--text-muted)] mb-2">
                  Your estimated arrival time
                </label>
                <input
                  type="time"
                  value={eta}
                  onChange={e => setMaintEta(prev => ({ ...prev, [taskId]: e.target.value }))}
                  className="w-full px-2.5 py-2 rounded-lg text-sm font-mono bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] mb-3 box-border outline-none"
                />
                <button
                  onClick={handleSetEnRoute}
                  disabled={!eta}
                  className={`w-full py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 ${eta ? 'cursor-pointer bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]' : 'cursor-not-allowed bg-[var(--bg-elevated)] text-[var(--text-subtle)] border border-[var(--border-subtle)]'}`}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                  Set En Route
                </button>
              </Card>
            )}

            {/* En route step */}
            {progress === 'en_route' && (
              <Card className="p-3.5 mb-4 border-[var(--border-subtle)]">
                <div className="inline-flex items-center gap-1.5 mb-3.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)] font-mono">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                  ETA {eta}
                </div>
                <button
                  onClick={() => setMaintProgress(prev => ({ ...prev, [taskId]: 'on_site' }))}
                  className="w-full py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer border-none text-white flex items-center justify-center gap-2"
                  style={{ background: accent }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2C5.8 2 4 3.8 4 6c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z"/><circle cx="8" cy="6" r="1.5"/></svg>
                  I&apos;ve Arrived — Start Task
                </button>
              </Card>
            )}

            {/* On site step */}
            {progress === 'on_site' && (
              <div className="mb-4">
                {/* Photo slots */}
                <Card className="p-3.5 mb-3 border-[var(--border-subtle)]">
                  <div className="label-upper text-[var(--text-subtle)] mb-2.5">Documentation</div>
                  <div className="flex gap-2.5">
                    {[
                      { label: 'Before', done: beforeDone, onAdd: () => setMaintBeforeDone(prev => ({ ...prev, [taskId]: true })) },
                      { label: 'After',  done: afterDone,  onAdd: () => setMaintAfterDone(prev => ({ ...prev, [taskId]: true })) },
                    ].map(slot => (
                      <div key={slot.label}>
                        <div className="text-[9px] text-[var(--text-subtle)] mb-[5px] font-medium tracking-wide uppercase">{slot.label}</div>
                        <button
                          onClick={slot.done ? undefined : slot.onAdd}
                          className={`w-16 h-12 rounded-[7px] flex flex-col items-center justify-center gap-0.5 text-[9px] text-[var(--text-subtle)] ${slot.done ? 'border-[1.5px] border-solid border-[var(--status-green-fg)] bg-[var(--status-green-bg)] cursor-default' : 'border-[1.5px] border-dashed border-[var(--border)] bg-[var(--bg-elevated)] cursor-pointer'}`}
                        >
                          {slot.done ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--status-green-fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l4 4 6-7"/></svg>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="8" cy="8" r="2.5"/></svg>
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Resolution */}
                <Card className="p-3.5 border-[var(--border-subtle)]">
                  <div className="label-upper text-[var(--text-subtle)] mb-2.5">
                    How was this resolved?
                  </div>
                  <div className={`grid grid-cols-2 gap-2 ${resolution === 'needs_vendor' || resolution === 'needs_parts' ? 'mb-3' : 'mb-0'}`}>
                    {[
                      { key: 'fixed',        label: '✓ Fixed',         bg: 'var(--status-green-bg)',  color: 'var(--status-green-fg)', border: 'var(--status-green-fg)' },
                      { key: 'minor',        label: 'Minor fix',       bg: 'var(--status-green-bg)',  color: 'var(--text-muted)',      border: 'var(--border)' },
                      { key: 'needs_vendor', label: 'Needs Vendor',    bg: 'var(--accent-bg)',        color: accent,                   border: 'var(--accent-border)' },
                      { key: 'needs_parts',  label: 'Needs Parts',     bg: 'var(--status-amber-bg)',  color: 'var(--status-amber-fg)', border: 'var(--status-amber-fg)' },
                    ].map(btn => {
                      const isSelected = resolution === btn.key
                      return (
                        <button
                          key={btn.key}
                          onClick={() => handleResolve(btn.key)}
                          className="py-[9px] px-2 rounded-lg text-xs font-medium cursor-pointer text-center"
                          style={{
                            background: isSelected ? btn.bg : 'var(--bg-elevated)',
                            color: isSelected ? btn.color : 'var(--text-muted)',
                            border: isSelected ? `1px solid ${btn.border}` : '1px solid var(--border-subtle)',
                          }}
                        >
                          {btn.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Needs Vendor expanded form */}
                  {resolution === 'needs_vendor' && (
                    <div className="mt-1">
                      <div className="mb-2">
                        <label className="label-upper text-[var(--text-subtle)] block mb-1">Category <span className="text-[var(--status-red-fg)]">*</span></label>
                        <select
                          value={vendorCategory[taskId] ?? ''}
                          onChange={e => setVendorCategory(prev => ({ ...prev, [taskId]: e.target.value }))}
                          className="w-full px-2.5 py-[7px] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-xs outline-none"
                        >
                          <option value="">Select category...</option>
                          {['HVAC', 'Plumbing', 'Electrical', 'Carpentry', 'Appliance', 'General Repairs', 'Other'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="label-upper text-[var(--text-subtle)] block mb-1">Vendor name (optional)</label>
                        <input
                          value={vendorName[taskId] ?? ''}
                          onChange={e => setVendorName(prev => ({ ...prev, [taskId]: e.target.value }))}
                          placeholder="e.g. Oslo VVS AS"
                          className="w-full px-2.5 py-[7px] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-xs outline-none box-border"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="label-upper text-[var(--text-subtle)] block mb-1">Estimate NOK (optional)</label>
                        <input
                          type="number"
                          value={vendorEstimate[taskId] ?? ''}
                          onChange={e => setVendorEstimate(prev => ({ ...prev, [taskId]: e.target.value }))}
                          placeholder="0"
                          className="w-full px-2.5 py-[7px] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-xs outline-none box-border"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="label-upper text-[var(--text-subtle)] block mb-1">Notes (optional)</label>
                        <textarea
                          value={vendorNotes[taskId] ?? ''}
                          onChange={e => setVendorNotes(prev => ({ ...prev, [taskId]: e.target.value }))}
                          placeholder="Describe the issue..."
                          rows={3}
                          className="w-full px-2.5 py-[7px] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-xs outline-none resize-y box-border"
                        />
                      </div>
                      <button
                        onClick={handleSubmitVendor}
                        disabled={!vendorCategory[taskId]}
                        className={`w-full py-2.5 rounded-lg text-[13px] font-semibold border-none ${vendorCategory[taskId] ? 'cursor-pointer text-white' : 'cursor-not-allowed text-[var(--text-subtle)] bg-[var(--bg-elevated)]'}`}
                        style={{ background: vendorCategory[taskId] ? accent : undefined }}
                      >
                        Submit Work Order
                      </button>
                    </div>
                  )}

                  {/* Needs Parts expanded form */}
                  {resolution === 'needs_parts' && (
                    <div className="mt-1">
                      <div className="mb-3">
                        <label className="label-upper text-[var(--text-subtle)] block mb-1">Parts needed <span className="text-[var(--status-red-fg)]">*</span></label>
                        <textarea
                          value={partsNotes[taskId] ?? ''}
                          onChange={e => setPartsNotes(prev => ({ ...prev, [taskId]: e.target.value }))}
                          placeholder="List the parts required..."
                          rows={3}
                          className="w-full px-2.5 py-[7px] rounded-[7px] bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-xs outline-none resize-y box-border"
                        />
                      </div>
                      <button
                        onClick={handleSubmitParts}
                        disabled={!partsNotes[taskId]?.trim()}
                        className={`w-full py-2.5 rounded-lg text-[13px] font-semibold border-none ${partsNotes[taskId]?.trim() ? 'cursor-pointer text-white' : 'cursor-not-allowed text-[var(--text-subtle)] bg-[var(--bg-elevated)]'}`}
                        style={{ background: partsNotes[taskId]?.trim() ? accent : undefined }}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Done step */}
            {progress === 'done' && (
              <div className="bg-[var(--status-green-bg)] border border-[var(--status-green-fg)] rounded-xl p-4 mb-4 flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="var(--status-green-fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l4 4 6-7"/></svg>
                <div>
                  <div className="text-sm font-semibold text-[var(--status-green-fg)]">Completed</div>
                  {resolution && <div className="text-xs text-[var(--text-muted)] mt-0.5">Resolution: {resolution.replace('_', ' ')}</div>}
                </div>
              </div>
            )}

            {/* ── D: Comment section ── */}
            <div className="mt-2">
              <div className="h-px bg-[var(--border-subtle)] mb-3.5" />
              <div className="label-upper text-[var(--text-subtle)] mb-2.5">Comments</div>
              {comments.length === 0 ? (
                <div className="text-xs text-[var(--text-subtle)] italic mb-3">No comments yet.</div>
              ) : (
                <div className="flex flex-col gap-2.5 mb-3">
                  {comments.map((c, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div className="w-[30px] h-[30px] rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[11px] font-semibold text-[var(--accent)] shrink-0">
                        {c.author.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-[var(--text-primary)]">{c.author}</span>
                          <span className="text-[11px] text-[var(--text-subtle)]">{c.time}</span>
                        </div>
                        <div className="text-[13px] text-[var(--text-muted)] leading-normal">{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={commentDraft}
                  onChange={e => setCommentDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment() } }}
                  placeholder="Add a comment..."
                  className="flex-1 px-2.5 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-primary)] text-[13px] outline-none"
                />
                <button
                  onClick={postComment}
                  disabled={!commentDraft.trim()}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold ${commentDraft.trim() ? 'cursor-pointer bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]' : 'cursor-not-allowed bg-[var(--bg-elevated)] text-[var(--text-subtle)] border border-[var(--border-subtle)]'}`}
                >
                  Post
                </button>
              </div>
            </div>
          </AppDrawer>
        )
      })()}

      {/* Cleaner Approval Sheet */}
      {(isSupervisor || isGSSupervisor) && selectedApprovalRequest && (
        <CleanerApprovalSheet
          request={selectedApprovalRequest}
          open={!!selectedApprovalRequest}
          onClose={() => setSelectedApprovalRequest(null)}
          onApprove={handleUpsellApprove}
          onDecline={handleUpsellDecline}
          myDaySchedule={TODAYS_CLEANINGS.filter(c => isSupervisor ? true : c.assignedTo === assigneeName)}
        />
      )}

      {/* Feature 2: Report Problem Modal */}
      {reportingJob && (
        <ReportProblemModal
          open
          onClose={() => setReportingJob(null)}
          propertyName={reportingJob.property}
          cleanerName={assigneeName ?? 'Cleaner'}
          onSubmit={(report: ReportSubmission) => {
            const job = reportingJob
            setReportingJob(null)
            if (report.delegate && job) {
              try {
                const alerts = JSON.parse(localStorage.getItem('afterstay_live_alerts') ?? '[]')
                alerts.push({
                  id: `task-delegate-${job.id}-${Date.now()}`,
                  type: 'task_delegation_request',
                  severity: 'warning',
                  title: `Reassignment needed — ${job.property}`,
                  body: `${assigneeName ?? 'Cleaner'} reported: ${report.delegateNote || report.note || report.category}. Task needs reassignment.`,
                  propertyId: drawerCleaningJob?.id ?? job.id,
                  assignedTo: ['supervisor', 'guest_services'],
                  read: false,
                  createdAt: new Date().toISOString(),
                  actionRoute: '/app/my-tasks',
                })
                localStorage.setItem('afterstay_live_alerts', JSON.stringify(alerts))
              } catch {}
              setDelegationPending(prev => new Set([...prev, job.id]))
              showToast('Supervisor & GS notified — awaiting reassignment')
            } else {
              showToast(`Problem reported for ${job?.property}`)
            }
          }}
        />
      )}

      {restartingJob && (
        <RestartTaskModal
          open
          onClose={() => setRestartingJob(null)}
          onConfirm={() => {
            if (!restartingJob) return
            const ts = new Date().toISOString()
            setJobStartedAt(prev => ({ ...prev, [restartingJob.id]: ts }))
            setRestartingJob(null)
            showToast(`Timer restarted for ${restartingJob.property}`)
          }}
        />
      )}

      {/* Feature 5: Add Cleaning Task Modal */}
      {showAddCleaning && (
        <div
          className="fixed inset-0 bg-black/[0.38] z-[200] flex items-end"
          onClick={() => setShowAddCleaning(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-[var(--bg-card)] rounded-t-2xl px-5 pt-5 pb-8 w-full max-w-[480px] mx-auto"
          >
            <div className="text-[15px] font-semibold mb-4">Add Cleaning Task</div>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Property</label>
            <select value={addProp} onChange={e => setAddProp(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] mb-3 bg-[var(--bg-card)] text-[var(--text-primary)] text-[13px]">
              <option value=''>Select property…</option>
              {PROPERTIES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Clean Type</label>
            <select value={addType} onChange={e => setAddType(e.target.value as CleaningJob['type'])}
              className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] mb-3 bg-[var(--bg-card)] text-[var(--text-primary)] text-[13px]">
              {(['Turnover', 'Deep Clean', 'Same-day', 'Inspection'] as const).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label className="text-xs text-[var(--text-muted)] block mb-1">Time Window</label>
            <div className="flex gap-2 mb-4">
              <input type='time' value={addTimeStart} onChange={e => setAddTimeStart(e.target.value)}
                className="flex-1 px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[13px]" />
              <span className="self-center text-[var(--text-subtle)]">–</span>
              <input type='time' value={addTimeEnd} onChange={e => setAddTimeEnd(e.target.value)}
                className="flex-1 px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[13px]" />
            </div>
            <button
              disabled={!addProp || !addTimeStart || !addTimeEnd}
              onClick={() => {
                const newJob: CleaningJob = {
                  id: `cl-extra-${Date.now()}`, type: addType, property: addProp,
                  timeWindow: `${addTimeStart}–${addTimeEnd}`, status: 'pending',
                  assignedTo: assigneeName ?? 'Maria S.', checkoutTime: addTimeStart, checkinTime: addTimeEnd,
                }
                setExtraCleanings(prev => [...prev, newJob])
                setShowAddCleaning(false)
                setAddProp(''); setAddTimeStart(''); setAddTimeEnd(''); setAddType('Turnover')
                showToast('Cleaning task added')
              }}
              className="w-full py-[11px] rounded-lg border-none text-white text-sm font-semibold cursor-pointer"
              style={{ background: accent, opacity: (!addProp || !addTimeStart || !addTimeEnd) ? 0.4 : 1 }}
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[var(--status-green-fg)] text-white px-[18px] py-2.5 rounded-xl text-sm font-medium z-[999] shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
          {toast}
        </div>
      )}
    </motion.div>
  )
}

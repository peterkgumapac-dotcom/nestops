'use client'
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Camera, X, Check, ShoppingBag, Calendar, MapPin, Zap, Lock, Eye, ChevronDown } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
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

const USER_TO_STAFF: Record<string, string> = { 'u3': 's1', 'u4': 's3', 'u5': 's4', 'u7': 's2' }

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
  { id: 'cl-001', type: 'Deep Clean', property: 'Harbor Studio',  timeWindow: '11:00–14:00', status: 'pending',     assignedTo: 'Maria S.',  checkoutTime: '11:00', checkinTime: '15:00' },
  { id: 'cl-003', type: 'Turnover',   property: 'Downtown Loft',  timeWindow: '09:00–11:00', status: 'done',        assignedTo: 'Anna K.',   checkoutTime: '09:00', checkinTime: '14:00' },
  { id: 'cl-004', type: 'Same-day',   property: 'Ocean View Apt', timeWindow: '15:00–17:00', status: 'pending',     assignedTo: 'Anna K.',   checkoutTime: '15:00', checkinTime: '16:30' },
]

// TODAYS_DELIVERIES is defined after DERIVED_DELIVERY_TASKS below

const CLEANING_TYPE_COLOR: Record<CleaningJob['type'], string> = {
  Turnover:   '#7c3aed',
  'Deep Clean': '#3b82f6',
  'Same-day': '#f97316',
  Inspection: '#06b6d4',
}

const CLEANING_STATUS_COLOR: Record<CleaningJob['status'], string> = {
  pending:     '#6b7280',
  'in-progress': '#10b981',
  done:        '#374151',
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
  urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#6b7280',
}

const STATUS_GROUPS: { key: string; label: string; color: string }[] = [
  { key: 'overdue',   label: 'Overdue',   color: '#ef4444' },
  { key: 'today',     label: 'Today',     color: '#7c3aed' },
  { key: 'this_week', label: 'This Week', color: '#3b82f6' },
  { key: 'upcoming',  label: 'Upcoming',  color: '#6b7280' },
  { key: 'completed', label: 'Completed', color: '#10b981' },
]

function SheetItemRow({ item, sheetQtys, setSheetQtys, accent }: {
  item: StockItem
  sheetQtys: Record<string, number>
  setSheetQtys: React.Dispatch<React.SetStateAction<Record<string, number>>>
  accent: string
}) {
  const qty = sheetQtys[item.id] ?? 0
  const statusColor = item.status === 'ok' ? '#10b981' : item.status === 'low' ? '#d97706' : item.status === 'critical' ? '#f97316' : '#ef4444'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid var(--border-subtle)' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{item.name}</div>
        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:1 }}>
          {item.inStock} in stock · <span style={{ color: statusColor }}>{item.status}</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        {qty === 0 ? (
          <button
            onClick={() => setSheetQtys(p => ({...p, [item.id]: 1}))}
            style={{ height:40, padding:'0 16px', borderRadius:8, border:`1px solid ${accent}`, background:`${accent}15`, color: accent, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            + Add
          </button>
        ) : (
          <>
            <button onClick={() => setSheetQtys(p => ({...p, [item.id]: Math.max(0, (p[item.id]??1)-1)}))}
              style={{ width:40, height:40, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-primary)', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
            <span style={{ fontSize:16, fontWeight:700, minWidth:28, textAlign:'center', color:'var(--text-primary)' }}>{qty}</span>
            <button onClick={() => setSheetQtys(p => ({...p, [item.id]: (p[item.id]??0)+1}))}
              style={{ width:40, height:40, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-primary)', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
          </>
        )}
        <span style={{ fontSize:11, color:'var(--text-muted)', minWidth:28 }}>{item.unit}</span>
      </div>
    </div>
  )
}

function LibAccordionSection({ title, content, accent }: { title: string; content: string; accent: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom:8, border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>
        {title}
        <span style={{ fontSize:11, color:'var(--text-muted)' }}>{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div style={{ padding:'0 14px 12px', fontSize:13, color:'var(--text-muted)', whiteSpace:'pre-line', lineHeight:1.6, borderTop:'1px solid var(--border-subtle)' }}>
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
      const existing = JSON.parse(localStorage.getItem('nestops_upsell_decisions') ?? '[]')
      localStorage.setItem('nestops_upsell_decisions', JSON.stringify([
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
      const existing = JSON.parse(localStorage.getItem('nestops_upsell_decisions') ?? '[]')
      localStorage.setItem('nestops_upsell_decisions', JSON.stringify([
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
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try {
        const user: UserProfile = JSON.parse(stored)
        setCurrentUser(user)
        // Set role identifier in URL
        const params = new URLSearchParams(window.location.search)
        if (!params.get('role') && user.jobRole) {
          router.replace(`/app/my-tasks?role=${user.jobRole}`)
        }
        const isSup = user.jobRole === 'supervisor' || user.jobRole === 'gs-supervisor'
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
  const isGSSupervisor  = jobRole === 'gs-supervisor'
  const isMaintenance   = jobRole === 'maintenance'
  const isGuestServices = jobRole === 'guest-services'

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

  const stepperBtn: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--bg-elevated)', color: 'var(--text-primary)',
    fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1,
  }

  const handleSubmit = () => {
    if (!selectedTask) return
    if (isCleaningComplete && qaRating > 0) {
      try {
        const existing = JSON.parse(localStorage.getItem('nestops_qa_pending') || '[]')
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
        localStorage.setItem('nestops_qa_pending', JSON.stringify(existing))
      } catch {}
    }
    if (selectedTask.type === 'Cleaning' && supplyItems.length > 0) {
      try {
        const log = JSON.parse(localStorage.getItem('nestops_supply_consumption') ?? '[]')
        log.push({
          taskId: selectedTask.id,
          property: selectedTask.propertyName,
          propertyId: selectedTask.propertyId,
          cleaner: selectedTask.assignee,
          items: supplyItems.filter(i => i.qty > 0),
          loggedAt: new Date().toISOString(),
        })
        localStorage.setItem('nestops_supply_consumption', JSON.stringify(log))
        const overrides = JSON.parse(localStorage.getItem('nestops_stock_overrides') ?? '{}')
        supplyItems.forEach(item => {
          overrides[item.id] = (overrides[item.id] ?? 0) + item.qty
        })
        localStorage.setItem('nestops_stock_overrides', JSON.stringify(overrides))
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

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: `1px solid ${active ? accent : 'var(--border)'}`,
    background: active ? `${accent}1a` : 'transparent',
    color: active ? accent : 'var(--text-muted)',
  })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title={isMaintenance ? 'My Jobs' : isSupervisor ? "Team's Cleaning Tasks" : 'My Cleanings'}
        subtitle={isMaintenance ? 'Your assigned maintenance jobs — click to open job details' : isSupervisor ? 'All team cleaning tasks — click any task to open its checklist' : 'Your cleaning tasks — click any task to open its checklist'}
      />

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={13} style={{ color: 'var(--text-muted)' }} />
          {statusPills.map(p => (
            <button key={p.key} onClick={() => setStatusFilter(p.key)} style={pillStyle(statusFilter === p.key)}>{p.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {priorityPills.map(p => (
            <button key={p.key} onClick={() => setPriorityFilter(p.key)} style={pillStyle(priorityFilter === p.key)}>{p.label}</button>
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
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Zap size={14} style={{ color: '#7c3aed' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Today&apos;s Cleanings
              </span>
              <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: '#7c3aed20', color: '#7c3aed', fontWeight: 600 }}>
                {allJobs.length}
              </span>
              <button onClick={() => setShowAddCleaning(true)} style={{ marginLeft: 'auto', fontSize: 18, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>+</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {allJobs.map(job => {
                const isDelivery = (job as typeof TODAYS_DELIVERIES[0]).isDelivery === true
                const [windowStart] = job.timeWindow.split('–')
                const tight = !isDelivery && hasTightGap(job.checkoutTime, windowStart)
                const typeColor = isDelivery ? '#d97706' : CLEANING_TYPE_COLOR[job.type]
                const effectiveStatus = jobStatuses[job.id] ?? job.status
                const statusColor = CLEANING_STATUS_COLOR[effectiveStatus]
                const matchingTask = !isDelivery && ALL_TASKS.find(t => t.propertyName === job.property && t.type === 'Cleaning')
                // Feature 4: timer
                const startedAt = jobStartedAt[job.id]
                const [winStart, winEnd] = job.timeWindow.split('–')
                const [sh, sm] = winStart.split(':').map(Number)
                const [eh, em] = winEnd.split(':').map(Number)
                const windowMins = (eh * 60 + em) - (sh * 60 + sm)
                const elapsedMs = startedAt ? now.getTime() - new Date(startedAt).getTime() : 0
                const elapsedMins = Math.floor(elapsedMs / 60_000)
                const estDone = startedAt
                  ? new Date(new Date(startedAt).getTime() + windowMins * 60_000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                  : winEnd
                return (
                  <div
                    key={job.id}
                    onClick={() => matchingTask && effectiveStatus !== 'done' && setSelectedTask(matchingTask)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `4px solid ${typeColor}`, borderRadius: 10, padding: '12px 14px', opacity: effectiveStatus === 'done' ? 0.6 : 1, cursor: effectiveStatus === 'done' ? 'default' : 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30` }}>{isDelivery ? '📦 Delivery run' : job.type}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{job.property}</span>
                          {tight && effectiveStatus !== 'done' && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#d9770618', color: '#d97706', border: '1px solid #d9770630' }}>⚡ Tight gap</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🕐 {job.timeWindow}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
                          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Out {job.checkoutTime} → In {job.checkinTime}</span>
                          {isSupervisor && <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>· {job.assignedTo}</span>}
                        </div>
                        {effectiveStatus === 'in-progress' && startedAt && (
                          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>
                            ⏱ {elapsedMins}m elapsed · Est. done {estDone}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                        {effectiveStatus === 'pending' ? (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              const ts = new Date().toISOString()
                              setJobStatuses(prev => ({ ...prev, [job.id]: 'in-progress' }))
                              setJobStartedAt(prev => ({ ...prev, [job.id]: ts }))
                            }}
                            style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: isDelivery ? '#d97706' : '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', marginTop: 2 }}
                          >
                            ▶ Start
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`, marginTop: 2 }}>
                            {effectiveStatus === 'in-progress' ? 'In progress' : effectiveStatus === 'done' ? '✓ Done' : 'Pending'}
                          </span>
                        )}
                        {matchingTask && effectiveStatus !== 'done' && (
                          <span style={{ fontSize: 11, color: accent, fontWeight: 500 }}>→ Open checklist</span>
                        )}
                        {delegationPending.has(job.id) && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
                            background: '#7c3aed18', color: '#7c3aed', border: '1px solid #7c3aed30' }}>
                            ⏳ Pending reassignment
                          </span>
                        )}
                        {matchingTask && effectiveStatus !== 'done' && (
                          <button
                            onClick={e => { e.stopPropagation(); setReportingJob(job) }}
                            style={{ fontSize: 11, color: '#d97706', fontWeight: 500, border: '1px solid #d9770630', borderRadius: 6, padding: '2px 8px', background: '#d9770610', cursor: 'pointer' }}
                          >
                            ⚠ Report
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Cleaner Upsell Awareness — read-only, no actions */}
      {jobRole === 'cleaner' && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <ShoppingBag size={14} style={{ color: '#d97706' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Upcoming Upsells
            </span>
            {cleanerUpsellAwareness.length > 0 && (
              <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: '#d9770620', color: '#d97706', fontWeight: 600 }}>
                {cleanerUpsellAwareness.length}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 'auto', fontStyle: 'italic' }}>
              Prepare only — no action needed
            </span>
          </div>
          {cleanerUpsellAwareness.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center' }}>
              No upcoming upsell requests for your properties
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {cleanerUpsellAwareness.map(req => {
                const statusColor = req.status === 'approved' || req.status === 'auth_held' ? '#059669' : '#d97706'
                const statusLabel = req.status === 'approved' ? 'Confirmed' : req.status === 'auth_held' ? 'Confirmed' : 'Pending'
                return (
                  <div
                    key={req.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderLeft: `4px solid ${statusColor}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {req.upsellTitle}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                            {statusLabel}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                            <MapPin size={11} /> {req.propertyName}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                            <Calendar size={11} /> Check-in {req.checkInDate}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.guestName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Upsell Approvals Section */}
      {(isSupervisor || isGSSupervisor) && upsellApprovalRequests.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <ShoppingBag size={14} style={{ color: '#d97706' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Upsell Approvals
            </span>
            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: '#d9770620', color: '#d97706', fontWeight: 600 }}>
              {upsellApprovalRequests.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upsellApprovalRequests.map(req => (
              <motion.div
                key={req.id}
                layout
                onClick={() => setSelectedApprovalRequest(req)}
                style={{
                  background: 'var(--bg-card)',
                  border: req.escalatedToSupervisor ? '1px solid #7c3aed30' : '1px solid #d9770630',
                  borderLeft: req.escalatedToSupervisor ? '4px solid #7c3aed' : '4px solid #d97706',
                  borderRadius: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
                onHoverStart={e => {}}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {req.upsellTitle}
                      </span>
                      {req.escalatedToSupervisor && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#7c3aed18', color: '#7c3aed', border: '1px solid #7c3aed30' }}>
                          ⬆ Escalated — No Cleaner Assigned
                        </span>
                      )}
                      {req.calendarSignal === 'available' && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#05966918', color: '#059669', border: '1px solid #05966930' }}>🟢 Available</span>
                      )}
                      {req.calendarSignal === 'tentative' && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#d9770618', color: '#d97706', border: '1px solid #d9770630' }}>🟡 Tentative</span>
                      )}
                      {req.calendarSignal === 'blocked' && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#ef444418', color: '#ef4444', border: '1px solid #ef444430' }}>🔴 Blocked</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <MapPin size={11} /> {req.propertyName}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Calendar size={11} /> {req.checkInDate}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.guestName}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: accent, fontWeight: 500 }}>→ Review</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Task groups */}
      {filteredTasks.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
          No tasks assigned to you right now.
        </div>
      ) : (
        STATUS_GROUPS.map(group => {
          const groupTasks = filteredTasks.filter(t => (completedIds.has(t.id) ? 'completed' : t.status) === group.key)
          if (groupTasks.length === 0) return null
          return (
            <div key={group.key} style={{ marginBottom: 24 }}>
              <div
                onClick={() => setCollapsedGroups(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: group.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{group.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{groupTasks.length}</span>
                <ChevronDown size={13} style={{ color: 'var(--text-subtle)', marginLeft: 'auto', transform: collapsedGroups[group.key] ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }} />
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
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderLeft: `4px solid ${task.isDeliveryTask ? '#d97706' : PRIORITY_BORDER[task.priority]}`,
                    borderRadius: 10, padding: '14px 16px', marginBottom: 8,
                    opacity: completedIds.has(task.id) ? 0.5 : 1,
                    cursor: completedIds.has(task.id) ? 'default' : 'pointer',
                    transition: 'box-shadow 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: completedIds.has(task.id) ? 'var(--text-subtle)' : 'var(--text-primary)', textDecoration: completedIds.has(task.id) ? 'line-through' : 'none' }}>
                          {task.title}
                        </span>
                        {task.isDeliveryTask && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#d9770618', color: '#d97706', border: '1px solid #d9770630' }}>📦 Delivery</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <img src={task.propertyImage} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.propertyName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
                        <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{task.dueDisplay}</span>
                        {(task.type === 'Cleaning' || task.type === 'Maintenance') && !completedIds.has(task.id) && (
                          <span style={{ fontSize: 11, color: accent, fontWeight: 500 }}>{isMaintenance ? '→ Open job' : '→ Open checklist'}</span>
                        )}
                      </div>
                      {task.reservation && (
                        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 3 }}>
                          Guest: {task.reservation.guestName.split(' ')[0]} {task.reservation.guestName.split(' ')[1]?.[0] ?? ''}. · Checkout {new Date(task.reservation.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <StatusBadge status={task.priority} />
                      {task.pteRequired && task.pteStatus && (() => {
                        const badge = getPTEBadge(task.pteStatus as 'not_required' | 'pending' | 'auto_granted' | 'granted' | 'denied' | 'expired')
                        const bgMap: Record<string, string> = { pending: '#d9770620', granted: '#16a34a20', auto_granted: '#16a34a20', denied: '#dc262620', not_required: '#6b728020' }
                        return (
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: bgMap[task.pteStatus] ?? '#6b728020', color: badge.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {badge.icon} {badge.label}
                          </span>
                        )
                      })()}
                      {completedIds.has(task.id) && <span style={{ fontSize: 11, color: '#10b981' }}>✓ Done</span>}
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
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Task Detail Drawer */}
      <AppDrawer
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title ?? ''}
        subtitle={`${selectedTask?.propertyName} · ${selectedTask?.dueDisplay}`}
        width={500}
        footer={
          <div style={{ width: '100%' }}>
            {totalCount > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{checkedCount} of {totalCount} complete</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: progressPct === 100 ? '#10b981' : accent }}>{progressPct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--border)' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: progressPct === 100 ? '#10b981' : accent, width: `${progressPct}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}
            {selectedTask?.type === 'Maintenance' && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                {beforePhotos.length === 0 && '⚠ Upload at least 1 before photo · '}
                {afterPhotos.length === 0 && checkedCount === totalCount && '⚠ Upload at least 1 after photo'}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                background: canSubmit ? accent : 'var(--border)',
                color: canSubmit ? '#fff' : 'var(--text-muted)',
                fontSize: 14, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
            >
              {isCleaningComplete ? 'Submit for QA Review' : selectedTask?.type === 'Maintenance' ? 'Submit for Approval' : progressPct === 100 ? '✓ Submit Complete Clean' : 'Submit Progress Report'}
            </button>
          </div>
        }
      >
        {/* Reservation section */}
        {selectedTask?.reservation && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: 8 }}>Connected Reservation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>👤 {selectedTask.reservation.guestName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                📅 {new Date(selectedTask.reservation.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {new Date(selectedTask.reservation.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ({selectedTask.reservation.nights} nights)
              </div>
              {selectedTask.reservation.platform && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🏠 {selectedTask.reservation.platform} · {selectedTask.reservation.status.replace('_', ' ')}</div>
              )}
              {selectedTask.reservation.nightsRemaining !== undefined && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏳ {selectedTask.reservation.nightsRemaining} nights remaining</div>
              )}
            </div>
          </div>
        )}

        {/* PTE section (read-only for field staff) */}
        {selectedTask?.pteRequired && selectedTask.pteStatus && (
          <div style={{
            background: 'var(--bg-card)', borderRadius: 10, padding: '12px 14px', marginBottom: 14,
            border: `1px solid ${selectedTask.pteStatus === 'pending' ? '#d9770640' : selectedTask.pteStatus === 'granted' || selectedTask.pteStatus === 'auto_granted' ? '#16a34a40' : selectedTask.pteStatus === 'denied' ? '#dc262640' : 'var(--border)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)' }}>Permission to Enter</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: selectedTask.pteStatus === 'pending' ? '#d97706' : selectedTask.pteStatus === 'granted' || selectedTask.pteStatus === 'auto_granted' ? '#16a34a' : '#dc2626' }}>
                {selectedTask.pteStatus === 'pending' ? '⏳ Pending' : selectedTask.pteStatus === 'granted' ? '✓ Granted' : selectedTask.pteStatus === 'auto_granted' ? '✓ Auto-Granted' : '✗ Denied'}
              </span>
            </div>
            {selectedTask.pte?.guestName && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>Guest: {selectedTask.pte.guestName}</div>}
            {selectedTask.pte?.guestCheckout && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>Checkout: {new Date(selectedTask.pte.guestCheckout).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
            {selectedTask.pteStatus === 'auto_granted' && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>Property is vacant — no active reservation</div>}
            {selectedTask.pte?.validFrom && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>Access window: {new Date(selectedTask.pte.validFrom).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}{selectedTask.pte.validUntil ? ` — ${new Date(selectedTask.pte.validUntil).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}</div>}
            {selectedTask.pte?.enterAfter && !selectedTask.pte.validFrom && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>Enter after: {selectedTask.pte.enterAfter}</div>}
            {selectedTask.pte?.grantedBy && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>Granted by: {selectedTask.pte.grantedBy === 'system' ? 'System (auto)' : selectedTask.pte.grantedBy}</div>}
            {/* Access code */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Access code:</span>
              {isAccessCodeVisible(selectedTask.pteStatus as 'not_required' | 'pending' | 'auto_granted' | 'granted' | 'denied' | 'expired') && selectedTask.pte?.accessCode ? (
                showAccessCode
                  ? <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)', letterSpacing: 2 }}>{selectedTask.pte.accessCode}</span>
                  : <button onClick={() => setShowAccessCode(true)} style={{ fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={13} /> Show Code</button>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={12} /> Locked until PTE granted</span>
              )}
            </div>
            {selectedTask.pteStatus === 'pending' && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#d97706', background: '#d9770610', borderRadius: 6, padding: '6px 10px' }}>
                ⚠ Waiting for Guest Services to confirm access
              </div>
            )}
            {selectedTask.pte?.notes && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{selectedTask.pte.notes}"</div>}
          </div>
        )}

        {selectedTask?.type === 'Cleaning' && (
          <div>
            {/* Action bar */}
            {drawerCleaningJob && drawerJobStatus === 'pending' && (
              <button
                onClick={handleStartFromDrawer}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                  background: accent, color: '#fff',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 14,
                }}
              >
                ▶ Start Task
              </button>
            )}

            {drawerJobStatus === 'in-progress' && cleaningProgress && (
              <div style={{ marginBottom: 14 }}>
                <CleaningProgressBar
                  progress={cleaningProgress}
                  checkInTime={drawerCleaningJob?.checkinTime ?? null}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => drawerCleaningJob && setRestartingJob(drawerCleaningJob)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: 'rgba(99,102,241,0.08)', color: '#6366f1',
                      border: '1px solid rgba(99,102,241,0.2)',
                    }}
                  >
                    ⟳ Restart
                  </button>
                  <button
                    onClick={handleStopFromDrawer}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: 'rgba(107,114,128,0.08)', color: '#6b7280',
                      border: '1px solid rgba(107,114,128,0.2)',
                    }}
                  >
                    ■ Stop Task
                  </button>
                  <button
                    onClick={() => drawerCleaningJob && setReportingJob(drawerCleaningJob)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.2)',
                    }}
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
                  style={{ marginBottom: 16, background: `${accent}08`, border: `1px solid ${accent}20`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setPropCardOpen(o => !o)}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px' }}>
                    {prop.imageUrl && <img src={prop.imageUrl} alt="" style={{ width:48, height:36, borderRadius:5, objectFit:'cover', flexShrink:0 }} />}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{prop.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                        {prop.beds} bed · {prop.baths} bath
                        {prop.amenities && prop.amenities.length > 0 && ` · ${prop.amenities.length} special areas`}
                      </div>
                      {!propCardOpen && hints.length > 0 && (
                        <div style={{ fontSize:10, color:'var(--text-subtle)', marginTop:2 }}>{hints.join(' · ')}</div>
                      )}
                    </div>
                    <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0 }}>{propCardOpen ? '▾' : '▸'}</span>
                  </div>
                  {propCardOpen && lib && (
                    <div style={{ borderTop:`1px solid ${accent}20`, padding:'12px 14px' }} onClick={e => e.stopPropagation()}>
                      {([
                        lib.wifiName     ? { icon:'📶', label:'WiFi',      value: lib.wifiName,         key:'wifi-ssid',  copy: true,  masked: false } : null,
                        lib.wifiPassword ? { icon:'',   label:'Password',  value: lib.wifiPassword,     key:'wifi-pw',   copy: true,  masked: true  } : null,
                        lib.accessCode   ? { icon:'🔑', label:'Door Code', value: lib.accessCode,       key:'door-code', copy: true,  masked: false } : null,
                        lib.storageLocation ? { icon:'📦', label:'Storage', value: lib.storageLocation, key:'storage', copy: false, masked: false } : null,
                        lib.cleaningNotes   ? { icon:'📝', label:'Notes',   value: lib.cleaningNotes,   key:'notes',   copy: false, masked: false } : null,
                      ] as const).filter(Boolean).map((row: any) => (
                        <div key={row.key} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:'1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize:14, width:20, flexShrink:0 }}>{row.icon}</span>
                          <span style={{ fontSize:11, color:'var(--text-muted)', width:64, flexShrink:0 }}>{row.label}</span>
                          <span style={{ flex:1, fontSize:12, color:'var(--text-primary)', fontFamily: row.key==='door-code' ? 'monospace' : undefined }}>
                            {row.masked ? '••••••••' : row.value}
                          </span>
                          {row.copy && (
                            <motion.button
                              animate={copiedField === row.key ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                              transition={{ duration: 0.2 }}
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(row.value, row.key) }}
                              style={{ fontSize:10, padding:'3px 8px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg-elevated)', color: copiedField === row.key ? '#10b981' : 'var(--text-muted)', cursor:'pointer', flexShrink:0, minWidth:44, minHeight:28 }}>
                              {copiedField === row.key ? '✓' : 'Copy'}
                            </motion.button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); setPropLibOpen(true) }}
                        style={{ marginTop:10, fontSize:12, color: accent, background:'none', border:'none', cursor:'pointer', padding:0 }}>
                        View all property info →
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })()}

            {/* Upsell delivery items — only for delivery tasks */}
            {selectedTask.isDeliveryTask && (
              <div style={{ marginBottom: 16, padding: '12px 14px', background: '#d9770610', border: '1px solid #d9770630', borderRadius: 10 }}>
                {selectedTask.upsellId && (() => {
                  const approval = UPSELL_APPROVAL_REQUESTS.find(a => a.id === selectedTask.upsellId)
                  const reservation = approval ? RESERVATIONS.find(r => r.guestVerificationId === approval.guestVerificationId) : null
                  return approval ? (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d97706', marginBottom: 4 }}>📦 Upsell Delivery</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {approval.guestName} · Check-in {approval.checkInDate}
                        {reservation ? ` · ${reservation.guestsCount} guest${reservation.guestsCount !== 1 ? 's' : ''}` : ''}
                      </div>
                      {selectedTask.linkedCleaningTaskId && (
                        <div style={{ fontSize: 11, color: '#10b981', marginTop: 3 }}>✓ Linked with same-day cleaning</div>
                      )}
                    </div>
                  ) : null
                })()}
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>Items to Deliver</div>
                {(selectedTask.upsellItems ?? []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: 14 }}>📦</span>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{item.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.qty} {item.unit}</span>
                  </div>
                ))}
                {selectedTask.setupInstructions && (
                  <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Setup: </span>
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
                <div key={group.name} style={{ marginBottom: 20 }}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(group.name)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer',
                      padding: '6px 0', marginBottom: isCollapsed ? 0 : 6,
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: accent }}>
                      {group.name} {groupChecked}/{group.items.length}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {isCollapsed ? '▶' : '▼'}
                    </span>
                  </button>

                  {/* Items — only when expanded */}
                  {!isCollapsed && group.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 4px', borderBottom: '1px solid var(--border-subtle)' }}>
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleCheck(item.id)}
                        style={{
                          width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                          border: `2px solid ${checklistChecked[item.id] ? '#10b981' : 'var(--border)'}`,
                          background: checklistChecked[item.id] ? '#10b981' : 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {checklistChecked[item.id] && <Check size={11} color="#fff" />}
                      </button>

                      {/* Label */}
                      <span style={{
                        flex: 1, fontSize: 13, lineHeight: 1.4,
                        color: checklistChecked[item.id] ? 'var(--text-subtle)' : 'var(--text-primary)',
                        textDecoration: checklistChecked[item.id] ? 'line-through' : 'none',
                      }}>
                        {item.label}
                        {item.photoRequired && <span style={{ fontSize: 10, color: '#f97316', marginLeft: 4 }}>● photo req.</span>}
                      </span>

                      {/* Photo upload */}
                      {checklistPhotos[item.id] ? (
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={checklistPhotos[item.id]} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)', display: 'block' }} alt="proof" />
                          <button
                            onClick={() => setChecklistPhotos(p => { const n = { ...p }; delete n[item.id]; return n })}
                            style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--bg-surface)', color: '#fff', fontSize: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                          >×</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerUpload(`item:${item.id}`)}
                          title="Upload photo proof"
                          style={{
                            width: 36, height: 36, borderRadius: 7, flexShrink: 0,
                            border: `1px dashed ${item.photoRequired ? '#f97316' : 'var(--border)'}`,
                            background: 'transparent', color: item.photoRequired ? '#f97316' : 'var(--text-subtle)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
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
                s === 'ok' ? '#10b981' : s === 'low' ? '#d97706' : s === 'critical' ? '#f97316' : '#ef4444'
              const totalQty = supplyItems.reduce((sum, i) => sum + i.qty, 0)
              return (
                <div style={{ marginTop: 8, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 10, overflow: 'visible' }}>
                  {/* Collapsible header */}
                  <button
                    onClick={() => setSuppliesOpen(o => !o)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    <ChevronDown size={13} style={{ color: 'var(--text-muted)', transform: suppliesOpen ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                      {sectionLabel}
                    </span>
                    {!suppliesOpen && supplyItems.length > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 4 }}>
                        {supplyItems.length} item{supplyItems.length !== 1 ? 's' : ''} · {totalQty} {totalQty === 1 ? 'unit' : 'units'}
                      </span>
                    )}
                    {!suppliesOpen && supplyItems.length === 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 4 }}>none logged yet</span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); setShowAddSheet(true); setSheetSearch(''); setSheetQtys({}); setSheetY('partial'); setSuppliesOpen(true) }}
                      style={{ marginLeft: 'auto', fontSize: 11, color: accent, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '4px 10px' }}
                    >
                      + Add item
                    </button>
                  </button>

                  {/* Expanded content */}
                  {suppliesOpen && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '8px 14px 12px' }}>
                      {supplyItems.length === 0 && (
                        <div style={{ fontSize: 12, color: 'var(--text-subtle)', fontStyle: 'italic', padding: '8px 0' }}>
                          No items logged — tap "+ Add item" to select from warehouse
                        </div>
                      )}
                      {supplyItems.map(item => {
                        const stockItem = STOCK_ITEMS.find(s => s.id === item.id)
                        const statusColor = stockStatusColor(stockItem?.status ?? 'ok')
                        return (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.name}</span>
                              {stockItem && (
                                <span style={{ fontSize: 10, color: statusColor, marginLeft: 6 }}>
                                  ({stockItem.inStock} in stock · {stockItem.status})
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <button onClick={() => setSupplyItems(p => p.map(i => i.id === item.id ? {...i, qty: Math.max(0, i.qty - 1)} : i))} style={stepperBtn}>−</button>
                              <span style={{ fontSize: 13, minWidth: 22, textAlign: 'center', fontWeight: 600 }}>{item.qty}</span>
                              <button onClick={() => setSupplyItems(p => p.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i))} style={stepperBtn}>+</button>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 30 }}>{item.unit}</span>
                              <button onClick={() => setSupplyItems(p => p.filter(i => i.id !== item.id))} style={{ fontSize: 14, color: 'var(--text-subtle)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>×</button>
                            </div>
                          </div>
                        )
                      })}
                      {/* Available items (not yet in list) */}
                      {(() => {
                        const availableItems = STOCK_ITEMS.filter(s => s.forGuest !== false && !supplyItems.find(i => i.id === s.id))
                        if (availableItems.length === 0) return null
                        return (
                          <div style={{ marginTop: 10, borderTop: '1px dashed var(--border-subtle)', paddingTop: 8 }}>
                            <div style={{ fontSize: 10, color: 'var(--text-subtle)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Available</div>
                            {availableItems.map(s => (
                              <motion.div layout key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding: '6px 0', opacity: 0.6 }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                  {s.name} <span style={{ color:'var(--text-subtle)' }}>({s.unit})</span>
                                </span>
                                <button
                                  onClick={() => setSupplyItems(p => [...p, { id: s.id, name: s.name, unit: s.unit, qty: 1 }])}
                                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
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
              <div style={{ marginTop: 8, padding: 16, background: `${accent}08`, border: `1px solid ${accent}30`, borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, marginBottom: 14 }}>QA Review Required</div>

                {/* Star rating */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Quality Rating</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setQaRating(star)}
                        style={{ fontSize: 28, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px', color: star <= qaRating ? '#f59e0b' : 'var(--border)', transition: 'color 0.1s' }}
                      >
                        ★
                      </button>
                    ))}
                    {qaRating > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 4 }}>{qaRating}/5</span>}
                  </div>
                </div>

                {/* Photo upload */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Photos <span style={{ color: '#ef4444', fontSize: 11 }}>(at least 1 required)</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {afterPhotos.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} style={{ width: 72, height: 54, borderRadius: 8, objectFit: 'cover', border: `2px solid ${accent}`, display: 'block' }} alt="qa" />
                        <button
                          onClick={() => setAfterPhotos(p => p.filter((_, j) => j !== i))}
                          style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--bg-surface)', color: '#fff', fontSize: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >×</button>
                      </div>
                    ))}
                    {afterPhotos.length < 5 && (
                      <button
                        onClick={() => triggerUpload('after')}
                        style={{ width: 72, height: 54, borderRadius: 8, border: `2px dashed ${accent}`, background: `${accent}08`, color: accent, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
                      >
                        <Camera size={16} />
                        <span style={{ fontSize: 9, fontWeight: 600 }}>Add</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Notes (optional)</div>
                  <textarea
                    value={qaNotes}
                    onChange={e => setQaNotes(e.target.value)}
                    placeholder="Any notes for the operator..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTask?.type === 'Maintenance' && (
          <div>
            {/* Before Photos */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ef4444', marginBottom: 10 }}>
                Before Photos {beforePhotos.length === 0 && <span style={{ fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>(required)</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {beforePhotos.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)', display: 'block' }} alt="before" />
                    <button
                      onClick={() => setBeforePhotos(p => p.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--bg-surface)', color: '#fff', fontSize: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                  </div>
                ))}
                {beforePhotos.length < 5 && (
                  <button
                    onClick={() => triggerUpload('before')}
                    style={{ width: 80, height: 60, borderRadius: 8, border: `2px dashed #ef4444`, background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
                  >
                    <Camera size={16} />
                    <span style={{ fontSize: 9, fontWeight: 600 }}>Add</span>
                  </button>
                )}
              </div>
            </div>

            {/* Work Items checklist */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accent, marginBottom: 10 }}>
                Work Items <span style={{ fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>{checkedCount}/{totalCount}</span>
              </div>
              {activeChecklist.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 4px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => toggleCheck(item.id)}
                    style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${checklistChecked[item.id] ? '#10b981' : 'var(--border)'}`,
                      background: checklistChecked[item.id] ? '#10b981' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {checklistChecked[item.id] && <Check size={11} color="#fff" />}
                  </button>
                  <span style={{
                    flex: 1, fontSize: 13,
                    color: checklistChecked[item.id] ? 'var(--text-subtle)' : 'var(--text-primary)',
                    textDecoration: checklistChecked[item.id] ? 'line-through' : 'none',
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* After Photos */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10b981', marginBottom: 10 }}>
                After Photos {afterPhotos.length === 0 && <span style={{ fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>(required for approval)</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {afterPhotos.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover', border: '2px solid #10b981', display: 'block' }} alt="after" />
                    <button
                      onClick={() => setAfterPhotos(p => p.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--bg-surface)', color: '#fff', fontSize: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                  </div>
                ))}
                {afterPhotos.length < 5 && (
                  <button
                    onClick={() => triggerUpload('after')}
                    disabled={checkedCount < totalCount}
                    style={{ width: 80, height: 60, borderRadius: 8, border: `2px dashed ${checkedCount === totalCount ? '#10b981' : 'var(--border)'}`, background: checkedCount === totalCount ? 'rgba(16,185,129,0.05)' : 'transparent', color: checkedCount === totalCount ? '#10b981' : 'var(--text-subtle)', cursor: checkedCount === totalCount ? 'pointer' : 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
                  >
                    <Camera size={16} />
                    <span style={{ fontSize: 9, fontWeight: 600 }}>{checkedCount < totalCount ? 'Complete work first' : 'Add'}</span>
                  </button>
                )}
              </div>
              {afterPhotos.length === 0 && checkedCount < totalCount && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Complete all work items before uploading after photos.</p>
              )}
            </div>
          </div>
        )}

        {selectedTask && selectedTask.type !== 'Cleaning' && selectedTask.type !== 'Maintenance' && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
              {selectedTask.description ?? 'No additional details for this task.'}
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Property</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{selectedTask.propertyName}</div>
            </div>
            <button
              onClick={() => { setCompletedIds(p => new Set([...p, selectedTask.id])); setSelectedTask(null); showToast('Task marked complete') }}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
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
              style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(0,0,0,0.5)' }}
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
                style={{
                  position:'absolute', bottom:0, left:0, right:0,
                  height: sheetY === 'full' ? '100dvh' : '62dvh',
                  background:'var(--bg-surface)', borderRadius:'16px 16px 0 0',
                  borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column',
                  transition: 'height 0.25s ease',
                }}
              >
                <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 6px' }}>
                  <div style={{ width:36, height:4, borderRadius:2, background:'var(--border)' }} />
                </div>
                <div style={{ padding:'0 16px 12px' }}>
                  <input
                    placeholder="🔍 Search items..."
                    value={sheetSearch}
                    onChange={e => setSheetSearch(e.target.value)}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-primary)', fontSize:14, outline:'none', boxSizing:'border-box' as const }}
                  />
                </div>
                <div style={{ flex:1, overflowY:'auto', padding:'0 16px' }}>
                  {filteredAll ? (
                    filteredAll.map(s => <SheetItemRow key={s.id} item={s} sheetQtys={sheetQtys} setSheetQtys={setSheetQtys} accent={accent} />)
                  ) : (
                    <>
                      <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-subtle)', marginBottom:8 }}>Frequently Added</div>
                      {frequentItems.map(s => <SheetItemRow key={s.id} item={s} sheetQtys={sheetQtys} setSheetQtys={setSheetQtys} accent={accent} />)}
                      {allCats.map(cat => {
                        const open = sheetCatOpen[cat] ?? false
                        const items = guestItems.filter(s => s.category === cat)
                        return (
                          <div key={cat} style={{ marginTop: 16 }}>
                            <button
                              onClick={() => setSheetCatOpen(p => ({...p, [cat]: !p[cat]}))}
                              style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', background:'none', border:'none', cursor:'pointer', padding:'6px 0', fontSize:10, fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'0.08em', color:'var(--text-subtle)' }}>
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
                <div style={{ padding:'12px 16px 24px' }}>
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
                    style={{ width:'100%', height:52, borderRadius:12, background: accent, color:'#fff', fontSize:15, fontWeight:700, border:'none', cursor:'pointer' }}>
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
              style={{ position:'fixed', inset:0, zIndex:600, background:'var(--bg-surface)', display:'flex', flexDirection:'column' }}
            >
              <div style={{ display:'flex', alignItems:'center', padding:'16px 18px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
                <button onClick={() => setPropLibOpen(false)}
                  style={{ background:'none', border:'none', color: accent, fontSize:13, fontWeight:500, cursor:'pointer', padding:0, whiteSpace:'nowrap' as const }}>
                  ← Back to task
                </button>
                <span style={{ flex:1, fontSize:14, fontWeight:700, color:'var(--text-primary)', textAlign:'center' }}>Property Info</span>
                <span style={{ width:90 }} />
              </div>
              <div style={{ flex:1, overflowY:'auto', padding:'16px 18px' }}>
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
            const alerts = JSON.parse(localStorage.getItem('nestops_live_alerts') ?? '[]')
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
            localStorage.setItem('nestops_live_alerts', JSON.stringify(alerts))
          } catch {}
          // Update issue store
          try {
            const issues = JSON.parse(localStorage.getItem('nestops_issues') ?? '[]')
            const idx = issues.findIndex((i: { propertyId: string; type: string; status: string }) =>
              i.propertyId === mt.propertyId && i.type === 'maintenance' && i.status !== 'resolved'
            )
            if (idx !== -1) {
              issues[idx].status = 'in_progress'
              issues[idx].response = `Tech en route. ETA: ${eta}`
            }
            localStorage.setItem('nestops_issues', JSON.stringify(issues))
          } catch {}
          showToast('Guest Services notified')
        }

        const handleNotifyPTE = () => {
          setPteNotified(prev => new Set([...prev, taskId]))
          try {
            const alerts = JSON.parse(localStorage.getItem('nestops_live_alerts') ?? '[]')
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
            localStorage.setItem('nestops_live_alerts', JSON.stringify(alerts))
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
        const pteBorderColor = mt.pteStatus === 'pending' ? 'rgba(239,159,39,0.35)'
          : mt.pteStatus === 'granted' || mt.pteStatus === 'auto_granted' ? 'rgba(29,158,117,0.35)'
          : mt.pteStatus === 'denied' ? 'rgba(226,75,74,0.35)'
          : 'rgba(255,255,255,0.10)'

        return (
          <AppDrawer
            open={!!selectedMaintTask}
            onClose={() => setSelectedMaintTask(null)}
            title={mt.title}
            subtitle={`${mt.propertyName} · ${mt.dueDisplay}`}
            width={520}
          >
            {/* ── A: Pipeline bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              {MAINT_STEPS.map((step, i) => {
                const rel = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'inactive'
                const style: React.CSSProperties = rel === 'done'
                  ? { background: 'rgba(29,158,117,0.10)', color: '#15d492', border: '1px solid rgba(29,158,117,0.22)' }
                  : rel === 'active'
                    ? { background: 'rgba(55,138,221,0.10)', color: '#378ADD', border: '1px solid rgba(55,138,221,0.22)' }
                    : { background: '#161b26', color: '#5a5f6b', border: '1px solid rgba(255,255,255,0.07)' }
                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ ...style, flex: 1, padding: '5px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {step.label}
                    </div>
                    {i < MAINT_STEPS.length - 1 && (
                      <div style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#5a5f6b" strokeWidth="2"><path d="M4 8h8M9 5l3 3-3 3"/></svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── B: PTE panel ── */}
            {mt.pteRequired && mt.pteStatus && mt.pteStatus !== 'not_required' && (
              <div style={{ background: '#111722', border: `1px solid ${pteBorderColor}`, borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5a5f6b' }}>Permission to Enter</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: mt.pteStatus === 'pending' ? '#ef9f27' : mt.pteStatus === 'granted' || mt.pteStatus === 'auto_granted' ? '#15d492' : '#e24b4a' }}>
                    {mt.pteStatus === 'pending' ? '⏳ Awaiting guest approval'
                      : mt.pteStatus === 'granted' ? '✅ Granted'
                      : mt.pteStatus === 'auto_granted' ? '✅ Vacant — enter any time'
                      : '🔒 Access denied'}
                  </span>
                </div>

                {mt.pte?.guestName && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 3 }}>Guest: {mt.pte.guestName}</div>}
                {mt.pte?.validFrom && mt.pte?.validUntil && (
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 3 }}>
                    Access window: {new Date(mt.pte.validFrom).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} — {new Date(mt.pte.validUntil).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {mt.pte?.grantedBy && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 3 }}>Granted by: {mt.pte.grantedBy}</div>}
                {mt.pte?.notes && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, fontStyle: 'italic' }}>"{mt.pte.notes}"</div>}
                {mt.pteStatus === 'auto_granted' && <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Property is vacant — no active reservation.</div>}

                {/* Access code */}
                {(mt.pteStatus === 'granted' || mt.pteStatus === 'auto_granted') && mt.pte?.accessCode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>Access code:</span>
                    {maintCodeVisible[taskId] ? (
                      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: '#e8e6e1', letterSpacing: 3, background: 'rgba(29,158,117,0.10)', padding: '2px 10px', borderRadius: 5 }}>{mt.pte.accessCode}</span>
                    ) : (
                      <button
                        onClick={() => setMaintCodeVisible(prev => ({ ...prev, [taskId]: true }))}
                        style={{ fontSize: 12, color: '#378ADD', background: 'rgba(55,138,221,0.10)', border: '1px solid rgba(55,138,221,0.22)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Eye size={12} /> Reveal Code
                      </button>
                    )}
                  </div>
                )}

                {/* Notify Guest Services button (pending only) */}
                {mt.pteStatus === 'pending' && (
                  <div style={{ marginTop: 8 }}>
                    {pteNotified.has(taskId) ? (
                      <span style={{ fontSize: 12, color: '#15d492' }}>✓ Guest Services notified</span>
                    ) : (
                      <button
                        onClick={handleNotifyPTE}
                        style={{ fontSize: 12, fontWeight: 500, color: '#378ADD', background: 'rgba(55,138,221,0.10)', border: '1px solid rgba(55,138,221,0.22)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
                      >
                        Notify Guest Services
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── C: Step content ── */}

            {/* Assigned step */}
            {progress === 'assigned' && (
              <div style={{ background: '#111722', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
                  Your estimated arrival time
                </label>
                <input
                  type="time"
                  value={eta}
                  onChange={e => setMaintEta(prev => ({ ...prev, [taskId]: e.target.value }))}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 8, fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
                    background: '#0f1219', border: '1px solid rgba(255,255,255,0.10)', color: '#e8e6e1',
                    marginBottom: 12, boxSizing: 'border-box', outline: 'none',
                  }}
                />
                <button
                  onClick={handleSetEnRoute}
                  disabled={!eta}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: eta ? 'pointer' : 'not-allowed',
                    background: eta ? 'rgba(55,138,221,0.15)' : '#161b26',
                    color: eta ? '#378ADD' : '#5a5f6b',
                    border: eta ? '1px solid rgba(55,138,221,0.30)' : '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                  Set En Route
                </button>
              </div>
            )}

            {/* En route step */}
            {progress === 'en_route' && (
              <div style={{ background: '#111722', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14,
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: 'rgba(55,138,221,0.10)', color: '#378ADD', border: '1px solid rgba(55,138,221,0.22)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                  ETA {eta}
                </div>
                <button
                  onClick={() => setMaintProgress(prev => ({ ...prev, [taskId]: 'on_site' }))}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', border: 'none', background: '#1D9E75', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2C5.8 2 4 3.8 4 6c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z"/><circle cx="8" cy="6" r="1.5"/></svg>
                  I&apos;ve Arrived — Start Task
                </button>
              </div>
            )}

            {/* On site step */}
            {progress === 'on_site' && (
              <div style={{ marginBottom: 16 }}>
                {/* Photo slots */}
                <div style={{ background: '#111722', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5a5f6b', marginBottom: 10 }}>Documentation</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {[
                      { label: 'Before', done: beforeDone, onAdd: () => setMaintBeforeDone(prev => ({ ...prev, [taskId]: true })) },
                      { label: 'After',  done: afterDone,  onAdd: () => setMaintAfterDone(prev => ({ ...prev, [taskId]: true })) },
                    ].map(slot => (
                      <div key={slot.label}>
                        <div style={{ fontSize: 9, color: '#5a5f6b', marginBottom: 5, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{slot.label}</div>
                        <button
                          onClick={slot.done ? undefined : slot.onAdd}
                          style={{
                            width: 64, height: 48, borderRadius: 7,
                            border: slot.done ? '1.5px solid rgba(29,158,117,0.22)' : '1.5px dashed rgba(255,255,255,0.12)',
                            background: slot.done ? 'rgba(29,158,117,0.10)' : '#161b26',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            gap: 2, cursor: slot.done ? 'default' : 'pointer', fontSize: 9, color: '#5a5f6b',
                          }}
                        >
                          {slot.done ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#15d492" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l4 4 6-7"/></svg>
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
                </div>

                {/* Resolution */}
                <div style={{ background: '#111722', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5a5f6b', marginBottom: 10 }}>
                    How was this resolved?
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: resolution === 'needs_vendor' || resolution === 'needs_parts' ? 12 : 0 }}>
                    {[
                      { key: 'fixed',        label: '✓ Fixed',         bg: 'rgba(29,158,117,0.10)',  color: '#15d492', border: 'rgba(29,158,117,0.22)' },
                      { key: 'minor',        label: 'Minor fix',       bg: 'rgba(29,158,117,0.07)',  color: '#9ca3af', border: 'rgba(255,255,255,0.12)' },
                      { key: 'needs_vendor', label: 'Needs Vendor',    bg: 'rgba(55,138,221,0.10)',  color: '#378ADD', border: 'rgba(55,138,221,0.22)' },
                      { key: 'needs_parts',  label: 'Needs Parts',     bg: 'rgba(239,159,39,0.10)',  color: '#ef9f27', border: 'rgba(239,159,39,0.22)' },
                    ].map(btn => {
                      const isSelected = resolution === btn.key
                      return (
                        <button
                          key={btn.key}
                          onClick={() => handleResolve(btn.key)}
                          style={{
                            padding: '9px 8px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                            cursor: 'pointer', textAlign: 'center',
                            background: isSelected ? btn.bg : '#161b26',
                            color: isSelected ? btn.color : '#9ca3af',
                            border: isSelected ? `1px solid ${btn.border}` : '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          {btn.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Needs Vendor expanded form */}
                  {resolution === 'needs_vendor' && (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5a5f6b', display: 'block', marginBottom: 4 }}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                        <select
                          value={vendorCategory[taskId] ?? ''}
                          onChange={e => setVendorCategory(prev => ({ ...prev, [taskId]: e.target.value }))}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 7, background: '#0f1219', border: '1px solid rgba(255,255,255,0.10)', color: '#e8e6e1', fontSize: 12, outline: 'none' }}
                        >
                          <option value="">Select category...</option>
                          {['HVAC', 'Plumbing', 'Electrical', 'Carpentry', 'Appliance', 'General Repairs', 'Other'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5a5f6b', display: 'block', marginBottom: 4 }}>Vendor name (optional)</label>
                        <input
                          value={vendorName[taskId] ?? ''}
                          onChange={e => setVendorName(prev => ({ ...prev, [taskId]: e.target.value }))}
                          placeholder="e.g. Oslo VVS AS"
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 7, background: '#0f1219', border: '1px solid rgba(255,255,255,0.10)', color: '#e8e6e1', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5a5f6b', display: 'block', marginBottom: 4 }}>Estimate NOK (optional)</label>
                        <input
                          type="number"
                          value={vendorEstimate[taskId] ?? ''}
                          onChange={e => setVendorEstimate(prev => ({ ...prev, [taskId]: e.target.value }))}
                          placeholder="0"
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 7, background: '#0f1219', border: '1px solid rgba(255,255,255,0.10)', color: '#e8e6e1', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5a5f6b', display: 'block', marginBottom: 4 }}>Notes (optional)</label>
                        <textarea
                          value={vendorNotes[taskId] ?? ''}
                          onChange={e => setVendorNotes(prev => ({ ...prev, [taskId]: e.target.value }))}
                          placeholder="Describe the issue..."
                          rows={3}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 7, background: '#0f1219', border: '1px solid rgba(255,255,255,0.10)', color: '#e8e6e1', fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                      </div>
                      <button
                        onClick={handleSubmitVendor}
                        disabled={!vendorCategory[taskId]}
                        style={{
                          width: '100%', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                          cursor: vendorCategory[taskId] ? 'pointer' : 'not-allowed',
                          background: vendorCategory[taskId] ? '#1D9E75' : '#161b26',
                          color: vendorCategory[taskId] ? '#fff' : '#5a5f6b',
                          border: 'none',
                        }}
                      >
                        Submit Work Order
                      </button>
                    </div>
                  )}

                  {/* Needs Parts expanded form */}
                  {resolution === 'needs_parts' && (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5a5f6b', display: 'block', marginBottom: 4 }}>Parts needed <span style={{ color: '#ef4444' }}>*</span></label>
                        <textarea
                          value={partsNotes[taskId] ?? ''}
                          onChange={e => setPartsNotes(prev => ({ ...prev, [taskId]: e.target.value }))}
                          placeholder="List the parts required..."
                          rows={3}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 7, background: '#0f1219', border: '1px solid rgba(255,255,255,0.10)', color: '#e8e6e1', fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                      </div>
                      <button
                        onClick={handleSubmitParts}
                        disabled={!partsNotes[taskId]?.trim()}
                        style={{
                          width: '100%', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                          cursor: partsNotes[taskId]?.trim() ? 'pointer' : 'not-allowed',
                          background: partsNotes[taskId]?.trim() ? '#1D9E75' : '#161b26',
                          color: partsNotes[taskId]?.trim() ? '#fff' : '#5a5f6b',
                          border: 'none',
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Done step */}
            {progress === 'done' && (
              <div style={{ background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.22)', borderRadius: 10, padding: '16px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="#15d492" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l4 4 6-7"/></svg>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15d492' }}>Completed</div>
                  {resolution && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Resolution: {resolution.replace('_', ' ')}</div>}
                </div>
              </div>
            )}

            {/* ── D: Comment section ── */}
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 0 14px' }} />
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5a5f6b', marginBottom: 10 }}>Comments</div>
              {comments.length === 0 ? (
                <div style={{ fontSize: 12, color: '#5a5f6b', fontStyle: 'italic', marginBottom: 12 }}>No comments yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                  {comments.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(55,138,221,0.15)', border: '1px solid rgba(55,138,221,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#378ADD', flexShrink: 0 }}>
                        {c.author.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#e8e6e1' }}>{c.author}</span>
                          <span style={{ fontSize: 11, color: '#5a5f6b' }}>{c.time}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.5 }}>{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={commentDraft}
                  onChange={e => setCommentDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment() } }}
                  placeholder="Add a comment..."
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: '#0f1219', border: '1px solid rgba(255,255,255,0.10)', color: '#e8e6e1', fontSize: 13, outline: 'none' }}
                />
                <button
                  onClick={postComment}
                  disabled={!commentDraft.trim()}
                  style={{ padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: commentDraft.trim() ? 'pointer' : 'not-allowed', background: commentDraft.trim() ? 'rgba(55,138,221,0.15)' : '#161b26', color: commentDraft.trim() ? '#378ADD' : '#5a5f6b', border: commentDraft.trim() ? '1px solid rgba(55,138,221,0.30)' : '1px solid rgba(255,255,255,0.07)' }}
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
                const alerts = JSON.parse(localStorage.getItem('nestops_live_alerts') ?? '[]')
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
                localStorage.setItem('nestops_live_alerts', JSON.stringify(alerts))
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
          style={{ position: 'fixed', inset: 0, background: '#00000060', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setShowAddCleaning(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', borderRadius: '16px 16px 0 0', padding: '20px 20px 32px', width: '100%', maxWidth: 480, margin: '0 auto' }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Add Cleaning Task</div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Property</label>
            <select value={addProp} onChange={e => setAddProp(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 12, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }}>
              <option value=''>Select property…</option>
              {PROPERTIES.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Clean Type</label>
            <select value={addType} onChange={e => setAddType(e.target.value as CleaningJob['type'])}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 12, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }}>
              {(['Turnover', 'Deep Clean', 'Same-day', 'Inspection'] as const).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Time Window</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input type='time' value={addTimeStart} onChange={e => setAddTimeStart(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }} />
              <span style={{ alignSelf: 'center', color: 'var(--text-subtle)' }}>–</span>
              <input type='time' value={addTimeEnd} onChange={e => setAddTimeEnd(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }} />
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
              style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!addProp || !addTimeStart || !addTimeEnd) ? 0.4 : 1 }}
            >
              Add Task
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#10b981', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </motion.div>
  )
}

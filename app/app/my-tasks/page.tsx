'use client'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Filter, Camera, X, Check, ShoppingBag, Calendar, MapPin, Zap } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { useRole } from '@/context/RoleContext'
import type { UserProfile } from '@/context/RoleContext'
import { PROPERTIES } from '@/lib/data/properties'
import { getCleaningChecklist, getMaintenanceChecklist, type ChecklistItem } from '@/lib/data/checklists'
import { UPSELL_APPROVAL_REQUESTS, type UpsellApprovalRequest } from '@/lib/data/upsellApprovals'
import CleanerApprovalSheet from '@/components/upsells/CleanerApprovalSheet'

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
  { id: 'cl-001', type: 'Turnover',   property: 'Harbor Studio',  timeWindow: '10:00–12:00', status: 'in-progress', assignedTo: 'Maria S.',  checkoutTime: '10:00', checkinTime: '15:00' },
  { id: 'cl-002', type: 'Deep Clean', property: 'Sunset Villa',   timeWindow: '13:00–16:00', status: 'pending',     assignedTo: 'Maria S.',  checkoutTime: '12:00', checkinTime: '17:00' },
  { id: 'cl-003', type: 'Turnover',   property: 'Downtown Loft',  timeWindow: '09:00–11:00', status: 'done',        assignedTo: 'Anna K.',   checkoutTime: '09:00', checkinTime: '14:00' },
  { id: 'cl-004', type: 'Same-day',   property: 'Ocean View Apt', timeWindow: '15:00–17:00', status: 'pending',     assignedTo: 'Anna K.',   checkoutTime: '15:00', checkinTime: '16:30' },
]

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
  dueDisplay: string
  description?: string
}

const ALL_TASKS: PersonalTask[] = [
  // Maria S. — Cleaner (s1)
  { id: 't1',  title: 'Turnover clean — Harbor Studio',           type: 'Cleaning',    priority: 'high',   status: 'today',     assignee: 'Maria S.',  propertyId: 'p2', propertyName: 'Harbor Studio',  propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=100&q=80', due: '2026-03-19', dueDisplay: 'Today 10:00' },
  { id: 't9',  title: 'Turnover clean — Sunset Villa',            type: 'Cleaning',    priority: 'high',   status: 'today',     assignee: 'Maria S.',  propertyId: 'p1', propertyName: 'Sunset Villa',    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80',  due: '2026-03-19', dueDisplay: 'Today 13:00' },
  { id: 't10', title: 'Deep clean — Ocean View Apt',              type: 'Cleaning',    priority: 'high',   status: 'today',     assignee: 'Maria S.',  propertyId: 'p3', propertyName: 'Ocean View Apt',  propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80',  due: '2026-03-19', dueDisplay: 'Today 15:00' },
  { id: 't8',  title: 'Quarterly inspection — Ocean View',        type: 'Inspection',  priority: 'medium', status: 'this_week', assignee: 'Maria S.',  propertyId: 'p3', propertyName: 'Ocean View Apt',  propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80',  due: '2026-03-20', dueDisplay: 'Fri 10:00' },
  { id: 't11', title: 'Turnover clean — Downtown Loft',           type: 'Cleaning',    priority: 'medium', status: 'this_week', assignee: 'Maria S.',  propertyId: 'p4', propertyName: 'Downtown Loft',   propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80',     due: '2026-03-21', dueDisplay: 'Sat 11:00' },
  { id: 't6',  title: 'Restock toiletry kits — Sunset Villa',     type: 'Inventory',   priority: 'low',    status: 'completed', assignee: 'Maria S.',  propertyId: 'p1', propertyName: 'Sunset Villa',    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80',  due: '2026-03-18', dueDisplay: 'Completed Mar 18' },
  // Anna K. — Cleaning Supervisor (s2) — team tasks
  { id: 't12', title: 'Turnover clean — Downtown Loft',           type: 'Cleaning',    priority: 'high',   status: 'today',     assignee: 'Anna K.',   propertyId: 'p4', propertyName: 'Downtown Loft',   propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80',     due: '2026-03-19', dueDisplay: 'Today 09:00' },
  { id: 't13', title: 'Pre-arrival inspection — Harbor Studio',   type: 'Inspection',  priority: 'high',   status: 'today',     assignee: 'Anna K.',   propertyId: 'p2', propertyName: 'Harbor Studio',   propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=100&q=80', due: '2026-03-19', dueDisplay: 'Today 16:00' },
  // Bjorn L. — Maintenance
  { id: 't4',  title: 'Fix bathroom extractor fan',               type: 'Maintenance', priority: 'high',   status: 'today',     assignee: 'Bjorn L.',  propertyId: 'p2', propertyName: 'Harbor Studio',   propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=100&q=80', due: '2026-03-19', dueDisplay: 'Today 14:00' },
  { id: 't5',  title: 'Inspect heating system',                   type: 'Maintenance', priority: 'high',   status: 'today',     assignee: 'Bjorn L.',  propertyId: 'p4', propertyName: 'Downtown Loft',   propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80',     due: '2026-03-19', dueDisplay: 'Today 12:00' },
  { id: 't3',  title: 'Annual fire safety check',                 type: 'Compliance',  priority: 'urgent', status: 'overdue',   assignee: 'Bjorn L.',  propertyId: 'p3', propertyName: 'Ocean View Apt',  propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80',  due: '2026-03-14', dueDisplay: '5 days overdue' },
  // Fatima N. — Guest Services
  { id: 't7',  title: 'Guest issue follow-up — Camilla Dahl',    type: 'Compliance',  priority: 'medium', status: 'today',     assignee: 'Fatima N.', propertyId: 'p4', propertyName: 'Downtown Loft',   propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80',     due: '2026-03-19', dueDisplay: 'Today 17:00' },
  { id: 't2',  title: 'Update guest welcome pack',                type: 'Content',     priority: 'medium', status: 'this_week', assignee: 'Fatima N.', propertyId: 'p1', propertyName: 'Sunset Villa',    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80',  due: '2026-03-20', dueDisplay: 'Fri 11:00' },
]

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

export default function MyTasksPage() {
  const { accent } = useRole()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upsell approval state — resolved after user loads from localStorage
  const [upsellApprovalRequests, setUpsellApprovalRequests] = useState<UpsellApprovalRequest[]>([])
  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState<UpsellApprovalRequest | null>(null)

  const handleUpsellApprove = (id: string) => {
    setUpsellApprovalRequests(prev => prev.filter(r => r.id !== id))
    setSelectedApprovalRequest(null)
    showToast('Upsell approved — guest will be notified')
  }

  const handleUpsellDecline = (id: string, notes: string) => {
    setUpsellApprovalRequests(prev => prev.filter(r => r.id !== id))
    setSelectedApprovalRequest(null)
    showToast('Upsell declined')
  }

  useEffect(() => {
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try {
        const user: UserProfile = JSON.parse(stored)
        setCurrentUser(user)
        const isSup = user.subRole?.includes('Supervisor')
        const cleanerId = 's1'
        const supervisorId = 's2'
        const requests = UPSELL_APPROVAL_REQUESTS.filter(r => {
          if (isSup) {
            return r.status === 'pending_cleaner' || (r.status === 'pending_supervisor' && r.escalatedToSupervisor)
          }
          return (r.status === 'pending_cleaner' && r.assignedCleanerId === cleanerId) ||
            (r.status === 'pending_supervisor' && r.escalatedToSupervisor && r.supervisorId === supervisorId)
        })
        setUpsellApprovalRequests(requests)
      } catch {}
    }
  }, [])

  // Reset checklist state when task changes
  useEffect(() => {
    setChecklistChecked({})
    setChecklistPhotos({})
    setBeforePhotos([])
    setAfterPhotos([])
    setQaRating(0)
    setQaNotes('')
  }, [selectedTask?.id])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const assigneeName = currentUser ? (USER_ASSIGNEE_MAP[currentUser.name] ?? currentUser.name) : null
  const subRole = currentUser?.subRole ?? ''
  const isSupervisor = subRole.includes('Supervisor')

  const filteredTasks = useMemo(() => {
    return ALL_TASKS.filter(task => {
      // Supervisor sees all team cleaning tasks; cleaner sees only their own
      const matchesAssignee = isSupervisor ? true : (!assigneeName || task.assignee === assigneeName)
      let matchesType = true
      if (subRole.includes('Maintenance')) matchesType = task.type === 'Maintenance'
      else if (subRole.includes('Cleaning') || subRole.includes('Cleaner') || isSupervisor) matchesType = task.type === 'Cleaning' || task.type === 'Inspection'
      const effectiveStatus = completedIds.has(task.id) ? 'completed' : task.status
      const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      return matchesAssignee && matchesType && matchesStatus && matchesPriority
    })
  }, [assigneeName, subRole, isSupervisor, statusFilter, priorityFilter, completedIds])

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

  const triggerUpload = (target: string) => {
    setUploadTarget(target)
    fileInputRef.current?.click()
  }

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
        title={isSupervisor ? "Team's Cleaning Tasks" : "My Tasks"}
        subtitle={isSupervisor ? "All team cleaning tasks — click any task to open its checklist" : "Tasks assigned to you — click any task to open its checklist"}
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
      {(subRole.includes('Cleaning') || subRole.includes('Cleaner') || isSupervisor) && (() => {
        const myCleanings = isSupervisor
          ? (statusFilter === 'today' || statusFilter === 'all' ? TODAYS_CLEANINGS : TODAYS_CLEANINGS)
          : TODAYS_CLEANINGS.filter(c => c.assignedTo === assigneeName)
        if (myCleanings.length === 0) return null
        return (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Zap size={14} style={{ color: '#7c3aed' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Today&apos;s Cleanings
              </span>
              <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: '#7c3aed20', color: '#7c3aed', fontWeight: 600 }}>
                {myCleanings.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myCleanings.map(job => {
                const [windowStart] = job.timeWindow.split('–')
                const tight = hasTightGap(job.checkoutTime, windowStart)
                const typeColor = CLEANING_TYPE_COLOR[job.type]
                const statusColor = CLEANING_STATUS_COLOR[job.status]
                return (
                  <div key={job.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `4px solid ${typeColor}`, borderRadius: 10, padding: '12px 14px', opacity: job.status === 'done' ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30` }}>{job.type}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{job.property}</span>
                          {tight && job.status !== 'done' && (
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10, background: '#d9770618', color: '#d97706', border: '1px solid #d9770630' }}>⚡ Tight gap</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🕐 {job.timeWindow}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
                          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Out {job.checkoutTime} → In {job.checkinTime}</span>
                          {isSupervisor && <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>· {job.assignedTo}</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`, flexShrink: 0, marginTop: 2 }}>
                        {job.status === 'in-progress' ? 'In progress' : job.status === 'done' ? '✓ Done' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Upsell Approvals Section */}
      {isSupervisor && upsellApprovalRequests.length > 0 && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: group.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{group.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{groupTasks.length}</span>
              </div>
              {groupTasks.map(task => (
                <motion.div
                  layout key={task.id}
                  onClick={() => !completedIds.has(task.id) && setSelectedTask(task)}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderLeft: `4px solid ${PRIORITY_BORDER[task.priority]}`,
                    borderRadius: 10, padding: '14px 16px', marginBottom: 8,
                    opacity: completedIds.has(task.id) ? 0.5 : 1,
                    cursor: completedIds.has(task.id) ? 'default' : 'pointer',
                    transition: 'box-shadow 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: completedIds.has(task.id) ? 'var(--text-subtle)' : 'var(--text-primary)', textDecoration: completedIds.has(task.id) ? 'line-through' : 'none' }}>
                          {task.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <img src={task.propertyImage} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.propertyName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>·</span>
                        <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{task.dueDisplay}</span>
                        {(task.type === 'Cleaning' || task.type === 'Maintenance') && !completedIds.has(task.id) && (
                          <span style={{ fontSize: 11, color: accent, fontWeight: 500 }}>→ Open checklist</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <StatusBadge status={task.priority} />
                      {completedIds.has(task.id) && <span style={{ fontSize: 11, color: '#10b981' }}>✓ Done</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
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
        {selectedTask?.type === 'Cleaning' && (
          <div>
            {/* Property info banner */}
            {(() => {
              const prop = PROPERTIES.find(p => p.id === selectedTask.propertyId)
              return prop ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: `${accent}08`, border: `1px solid ${accent}20`, borderRadius: 8, marginBottom: 16 }}>
                  {prop.imageUrl && <img src={prop.imageUrl} alt="" style={{ width: 48, height: 36, borderRadius: 5, objectFit: 'cover', flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{prop.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {prop.beds} bed · {prop.baths} bath
                      {prop.amenities && prop.amenities.length > 0 && ` · ${prop.amenities.length} special areas`}
                    </div>
                  </div>
                </div>
              ) : null
            })()}

            {/* Checklist by category */}
            {checklistGroups.map(group => {
              const groupChecked = group.items.filter(i => checklistChecked[i.id]).length
              const groupDone = groupChecked === group.items.length
              return (
                <div key={group.name} style={{ marginBottom: 20 }}>
                  {/* Category header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: groupDone ? '#10b981' : accent,
                      padding: '0 6px', whiteSpace: 'nowrap',
                    }}>
                      {group.name} {groupDone ? '✓' : `${groupChecked}/${group.items.length}`}
                    </span>
                    <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                  </div>

                  {/* Items */}
                  {group.items.map(item => (
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

      {/* Cleaner Approval Sheet */}
      {selectedApprovalRequest && (
        <CleanerApprovalSheet
          request={selectedApprovalRequest}
          open={!!selectedApprovalRequest}
          onClose={() => setSelectedApprovalRequest(null)}
          onApprove={handleUpsellApprove}
          onDecline={handleUpsellDecline}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#10b981', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </motion.div>
  )
}

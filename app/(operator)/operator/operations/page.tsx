'use client'
import { Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
  CheckSquare, FileText, CalendarCheck, Video,
  List, Table2, LayoutGrid, Calendar,
  ChevronLeft, ChevronRight, Check, Search,
  Plus, MoreHorizontal, X,
} from 'lucide-react'
import {
  DndContext, DragEndEvent, closestCorners, useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import TaskSheet from '@/components/shared/TaskSheet'
import { useRole } from '@/context/RoleContext'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'tasks' | 'sops' | 'cleaning' | 'meetings'
type BoardView = 'kanban' | 'list' | 'table' | 'calendar'
type SopStatus = 'draft' | 'pending' | 'approved'
type SopFilterStatus = 'all' | SopStatus

interface KanbanTask {
  id: string
  title: string
  type: string
  priority: 'high' | 'medium' | 'low'
  assignee: string
  due: string
  columnId: string
}

interface SopRow {
  id: string
  title: string
  category: string
  status: SopStatus
  lastUpdated: string
  acknowledged: number
  total: number
  body: string
}

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  attendees: string[]
  status: 'upcoming' | 'in_progress' | 'done'
  actionItems: { id: string; text: string; assignee: string; done: boolean }[]
  agenda: string
  notes: string
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const BOARDS = [
  { id: 'b1', name: 'Property Operations' },
  { id: 'b2', name: 'Onboarding Pipeline' },
  { id: 'b3', name: 'Maintenance Projects' },
]

const COLUMNS = [
  { id: 'todo',       label: 'To Do',       color: '#7878a0' },
  { id: 'inprogress', label: 'In Progress',  color: '#7c3aed' },
  { id: 'done',       label: 'Done',         color: '#059669' },
]

const INITIAL_TASKS: KanbanTask[] = [
  { id: 't1', title: 'Update guest welcome pack',  type: 'Content',    priority: 'medium', assignee: 'Maria S.',  due: '2026-03-20', columnId: 'todo' },
  { id: 't2', title: 'Fix bathroom extractor fan', type: 'Maintenance',priority: 'high',   assignee: 'Bjorn L.',  due: '2026-03-18', columnId: 'todo' },
  { id: 't3', title: 'Deep clean — Harbor Studio', type: 'Cleaning',   priority: 'high',   assignee: 'Fatima N.', due: '2026-03-17', columnId: 'inprogress' },
  { id: 't4', title: 'Owner onboarding — Kim',     type: 'Onboarding', priority: 'medium', assignee: 'Ivan P.',   due: '2026-03-22', columnId: 'inprogress' },
  { id: 't5', title: 'Restock toiletry kits',      type: 'Inventory',  priority: 'low',    assignee: 'Maria S.',  due: '2026-03-15', columnId: 'done' },
  { id: 't6', title: 'Submit compliance docs',     type: 'Compliance', priority: 'medium', assignee: 'Bjorn L.',  due: '2026-03-14', columnId: 'done' },
]

const SOPS: SopRow[] = [
  { id: 'sop-1', title: 'Guest Check-In Procedure',   category: 'Operations',   status: 'approved', lastUpdated: '2026-03-01', acknowledged: 8,  total: 10, body: 'Confirm booking details 24 hours before arrival. Send check-in instructions. Verify the lockbox code is active and tested. Complete the pre-arrival inspection checklist.' },
  { id: 'sop-2', title: 'Linen Change Protocol',       category: 'Housekeeping', status: 'approved', lastUpdated: '2026-02-15', acknowledged: 10, total: 10, body: 'Strip all bedding and towels after each checkout. Use the correct washing programme for each fabric type. Replace with freshly laundered sets.' },
  { id: 'sop-3', title: 'Maintenance Escalation Flow', category: 'Maintenance',  status: 'pending',  lastUpdated: '2026-03-10', acknowledged: 0,  total: 10, body: 'For minor issues, log via NestOps and mark priority. For urgent issues (flooding, no heating), call the operator directly and submit a high-priority ticket immediately.' },
  { id: 'sop-4', title: 'Lost & Found Policy',         category: 'Operations',   status: 'draft',    lastUpdated: '2026-03-14', acknowledged: 0,  total: 10, body: 'All found items must be logged in NestOps within 24 hours. Photograph and tag items. Store in designated lost property area. Notify guest via messaging.' },
]

const MEETINGS: Meeting[] = [
  {
    id: 'm1', title: 'Weekly Ops Standup', date: '2026-03-19', time: '09:00', status: 'upcoming',
    attendees: ['Peter K.', 'Maria S.', 'Bjorn L.'],
    agenda: '1. Review open tickets\n2. Upcoming checkouts this week\n3. Inventory restock status',
    notes: '',
    actionItems: [
      { id: 'a1', text: 'Order extra linen sets for Sunset Villa', assignee: 'Maria S.', done: false },
      { id: 'a2', text: 'Follow up on extractor fan repair', assignee: 'Bjorn L.', done: false },
    ],
  },
  {
    id: 'm2', title: 'Owner Onboarding — Kim Portfolio', date: '2026-03-21', time: '14:00', status: 'upcoming',
    attendees: ['Peter K.', 'David K.'],
    agenda: '1. Property overview\n2. Operational expectations\n3. Reporting cadence',
    notes: '',
    actionItems: [
      { id: 'a3', text: 'Send property onboarding checklist', assignee: 'Peter K.', done: false },
    ],
  },
  {
    id: 'm3', title: 'Q1 Performance Review', date: '2026-03-10', time: '10:00', status: 'done',
    attendees: ['Peter K.', 'Maria S.', 'Fatima N.', 'Bjorn L.'],
    agenda: 'Review Q1 metrics, occupancy, guest satisfaction scores.',
    notes: 'Strong Q1 overall. Harbor Studio underperformed — marketing to investigate. Cleaning scores improved 12%.',
    actionItems: [
      { id: 'a4', text: 'Draft Q2 marketing strategy for Harbor Studio', assignee: 'Peter K.', done: true },
      { id: 'a5', text: 'Update cleaning SOPs with new feedback', assignee: 'Maria S.', done: true },
    ],
  },
]

const PROPERTIES_CLEANING = [
  { id: 'p1', name: 'Sunset Villa' },
  { id: 'p2', name: 'Harbor Studio' },
  { id: 'p3', name: 'Ocean View Apt' },
  { id: 'p4', name: 'Downtown Loft' },
  { id: 'p5', name: 'Mountain Cabin' },
]

interface CleaningJob {
  propId: string; day: number; label: string; color: string
  cleaner?: string; timeWindow?: string; checklistTemplate?: string
  status?: 'scheduled' | 'in_progress' | 'done'; gapHrs?: number
}

const CLEANING_JOBS_SEED: CleaningJob[] = [
  { propId: 'p1', day: 1, label: 'Deep Clean', color: '#7c3aed', cleaner: 'Maria S.',  timeWindow: '10:00–14:00', checklistTemplate: 'Full Turnover',    status: 'scheduled',  gapHrs: 2.5 },
  { propId: 'p2', day: 0, label: 'Turnover',   color: '#059669', cleaner: 'Fatima N.', timeWindow: '11:00–13:00', checklistTemplate: 'Standard Turnover', status: 'in_progress', gapHrs: 1.2 },
  { propId: 'p3', day: 2, label: 'Inspection', color: '#d97706', cleaner: 'Bjorn L.',  timeWindow: '09:00–10:30', checklistTemplate: 'Pre-Inspection',    status: 'scheduled' },
  { propId: 'p4', day: 4, label: 'Turnover',   color: '#059669', cleaner: 'Maria S.',  timeWindow: '12:00–14:00', checklistTemplate: 'Standard Turnover', status: 'scheduled',  gapHrs: 0.8 },
  { propId: 'p5', day: 3, label: 'Deep Clean', color: '#7c3aed', cleaner: 'Fatima N.', timeWindow: '10:00–14:00', checklistTemplate: 'Seasonal Deep Clean', status: 'done' },
  { propId: 'p1', day: 5, label: 'Turnover',   color: '#059669', cleaner: 'Maria S.',  timeWindow: '11:00–13:00', checklistTemplate: 'Standard Turnover', status: 'scheduled' },
  { propId: 'p3', day: 6, label: 'Turnover',   color: '#059669', cleaner: 'Fatima N.', timeWindow: '11:00–13:00', checklistTemplate: 'Standard Turnover', status: 'scheduled' },
]

const CLEANING_TEMPLATES = ['Full Turnover', 'Mid-Stay Refresh', 'Deep Clean', 'Inspection', 'Standard Turnover', 'Pre-Inspection', 'Seasonal Deep Clean']
const STAFF_NAMES = ['Maria S.', 'Fatima N.', 'Bjorn L.', 'Ivan P.']

const SOP_STATUS_MAP: Record<SopStatus, 'draft' | 'pending' | 'published'> = {
  draft: 'draft', pending: 'pending', approved: 'published',
}

const ACK_DATA = [
  { id: '1', name: 'Maria Santos',  status: 'done'    as const, date: '2026-03-02' },
  { id: '2', name: 'Bjorn Larsen',  status: 'done'    as const, date: '2026-03-03' },
  { id: '3', name: 'Fatima Ndiaye', status: 'pending' as const, date: '—' },
  { id: '4', name: 'Ivan Petrov',   status: 'pending' as const, date: '—' },
]

// ─── Kanban ────────────────────────────────────────────────────────────────────

function SortableCard({ task, accent }: { task: KanbanTask; accent: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
    >
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, cursor: 'grab', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 6 }}>{task.type}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.4 }}>{task.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <StatusBadge status={task.priority} />
          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{task.assignee}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 6 }}>{task.due}</div>
      </div>
    </div>
  )
}

function KanbanCol({ col, tasks, accent }: { col: typeof COLUMNS[0]; tasks: KanbanTask[]; accent: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div style={{ flex: '0 0 280px', background: 'var(--bg-elevated)', borderRadius: 10, padding: 12, border: isOver ? `1px solid ${col.color}` : '1px solid transparent', transition: 'border 0.15s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: `${col.color}18`, color: col.color }}>{tasks.length}</span>
      </div>
      <div ref={setNodeRef} style={{ minHeight: 80 }}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(t => <SortableCard key={t.id} task={t} accent={accent} />)}
        </SortableContext>
      </div>
    </div>
  )
}

// ─── Calendar View (Tasks) ────────────────────────────────────────────────────

function CalendarTaskView({ accent }: { accent: string }) {
  const [offset, setOffset] = useState(0)
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const year = date.getFullYear(), month = date.getMonth()
  const monthName = date.toLocaleString('default', { month: 'long' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayDate = now.getDate()
  const isCurrentMonth = offset === 0
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setOffset(o => o - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><ChevronLeft size={18} /></button>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{monthName} {year}</span>
        <button onClick={() => setOffset(o => o + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><ChevronRight size={18} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
        {days.map(d => <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, i) => (
          <div key={i} style={{ minHeight: 72, padding: '6px 8px', borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border-subtle)' : 'none', borderBottom: i < cells.length - 7 ? '1px solid var(--border-subtle)' : 'none', background: day && isCurrentMonth && day === todayDate ? `${accent}08` : 'transparent' }}>
            {day && <span style={{ fontSize: 12, fontWeight: isCurrentMonth && day === todayDate ? 700 : 400, color: isCurrentMonth && day === todayDate ? accent : 'var(--text-muted)' }}>{day}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Cleaning Calendar ────────────────────────────────────────────────────────

function CleaningCalendar({ accent, jobs, onCellClick, onJobClick }: {
  accent: string
  jobs: CleaningJob[]
  onCellClick: (propId: string, dayIdx: number) => void
  onJobClick: (job: CleaningJob) => void
}) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '10px 16px', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', borderRight: '1px solid var(--border)' }}>Property</div>
        {days.map((d, i) => (
          <div key={i} style={{ padding: '10px 0', textAlign: 'center', fontSize: 11, fontWeight: 500, color: d.toDateString() === now.toDateString() ? accent : 'var(--text-muted)', borderRight: i < 6 ? '1px solid var(--border-subtle)' : 'none', background: d.toDateString() === now.toDateString() ? `${accent}08` : 'transparent' }}>
            <div>{dayNames[d.getDay()]}</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: d.toDateString() === now.toDateString() ? accent : 'var(--text-primary)' }}>{d.getDate()}</div>
          </div>
        ))}
      </div>
      {PROPERTIES_CLEANING.map((prop, pi) => (
        <div key={prop.id} style={{ display: 'grid', gridTemplateColumns: '140px repeat(7, 1fr)', borderBottom: pi < PROPERTIES_CLEANING.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
          <div style={{ padding: '10px 16px', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', borderRight: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>{prop.name}</div>
          {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
            const job = jobs.find(j => j.propId === prop.id && j.day === dayIdx)
            const isToday = days[dayIdx].toDateString() === now.toDateString()
            const gapColor = job?.gapHrs !== undefined ? (job.gapHrs < 1.5 ? '#ef4444' : '#f59e0b') : null
            return (
              <div
                key={dayIdx}
                onClick={() => !job && onCellClick(prop.id, dayIdx)}
                style={{ padding: '8px 6px', borderRight: dayIdx < 6 ? '1px solid var(--border-subtle)' : 'none', minHeight: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, background: isToday ? `${accent}04` : 'transparent', cursor: job ? 'default' : 'pointer' }}
              >
                {job ? (
                  <div onClick={e => { e.stopPropagation(); onJobClick(job) }} style={{ cursor: 'pointer' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 12, background: `${job.color}22`, color: job.color, whiteSpace: 'nowrap', display: 'inline-block' }}>
                      {job.label}
                    </span>
                    {job.cleaner && <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2, paddingLeft: 2 }}>{job.cleaner}</div>}
                    {gapColor && job.gapHrs !== undefined && job.gapHrs < 3 && (
                      <div style={{ fontSize: 9, fontWeight: 700, color: gapColor, paddingLeft: 2 }}>{job.gapHrs}h gap</div>
                    )}
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }} className="cell-add">
                    <span style={{ fontSize: 18, color: 'var(--text-subtle)' }}>+</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── Main Operations Page (with useSearchParams) ──────────────────────────────

function OperationsContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const validTabs: Tab[] = ['tasks', 'sops', 'cleaning', 'meetings']
  const initialTab: Tab = validTabs.includes(tabParam as Tab) ? (tabParam as Tab) : 'tasks'

  const { accent } = useRole()
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [activeBoard, setActiveBoard] = useState('b1')
  const [boardView, setBoardView] = useState<BoardView>('kanban')
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_TASKS)
  const [sopFilter, setSopFilter] = useState<SopFilterStatus>('all')
  const [sopSearch, setSopSearch] = useState('')
  const [selectedSop, setSelectedSop] = useState<SopRow | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null)
  const [taskDialog, setTaskDialog] = useState(false)
  const [newSopSheet, setNewSopSheet] = useState(false)
  const [meetingSheet, setMeetingSheet] = useState(false)

  // Cleaning schedule state
  const [cleaningJobs, setCleaningJobs] = useState<CleaningJob[]>(CLEANING_JOBS_SEED)
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [scheduleTemplate, setScheduleTemplate] = useState(CLEANING_TEMPLATES[0])
  const [schedulePropId, setSchedulePropId] = useState(PROPERTIES_CLEANING[0].id)
  const [scheduleDayIdx, setScheduleDayIdx] = useState(0)
  const [scheduleStaff, setScheduleStaff] = useState(STAFF_NAMES[0])
  const [scheduleTime, setScheduleTime] = useState('10:00')
  const [detailJob, setDetailJob] = useState<CleaningJob | null>(null)
  const [cleaningToast, setCleaningToast] = useState('')

  const showCleaningToast = (msg: string) => { setCleaningToast(msg); setTimeout(() => setCleaningToast(''), 3000) }

  const openScheduleDrawer = (propId?: string, dayIdx?: number) => {
    if (propId) setSchedulePropId(propId)
    if (dayIdx !== undefined) setScheduleDayIdx(dayIdx)
    setScheduleDrawerOpen(true)
  }

  const handleSaveSchedule = () => {
    const newJob: CleaningJob = {
      propId: schedulePropId, day: scheduleDayIdx,
      label: scheduleTemplate, color: scheduleTemplate.includes('Deep') ? '#7c3aed' : scheduleTemplate === 'Inspection' || scheduleTemplate === 'Pre-Inspection' ? '#d97706' : '#059669',
      cleaner: scheduleStaff, timeWindow: `${scheduleTime}–${scheduleTime}`, checklistTemplate: scheduleTemplate, status: 'scheduled',
    }
    setCleaningJobs(prev => [...prev.filter(j => !(j.propId === schedulePropId && j.day === scheduleDayIdx)), newJob])
    setScheduleDrawerOpen(false)
    showCleaningToast('Cleaning scheduled')
  }

  // DnD
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const taskId = active.id as string
    const overId = over.id as string
    const isColumn = COLUMNS.some(c => c.id === overId)
    const targetColumnId = isColumn ? overId : tasks.find(t => t.id === overId)?.columnId
    if (!targetColumnId) return
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: targetColumnId } : t))
  }

  // Filtered SOPs
  const filteredSops = SOPS.filter(s =>
    (sopFilter === 'all' || s.status === sopFilter) &&
    (sopSearch === '' || s.title.toLowerCase().includes(sopSearch.toLowerCase()))
  )

  const sopPills: { key: SopFilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'pending', label: 'Pending Approval' },
    { key: 'approved', label: 'Approved' },
  ]

  // Tab definitions
  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'tasks',    label: 'Tasks',    icon: <CheckSquare size={14} />,  badge: tasks.filter(t => t.columnId !== 'done').length },
    { key: 'sops',     label: 'SOPs',     icon: <FileText size={14} />,     badge: SOPS.filter(s => s.acknowledged < s.total).length },
    { key: 'cleaning', label: 'Cleaning', icon: <CalendarCheck size={14} /> },
    { key: 'meetings', label: 'Meetings', icon: <Video size={14} />,        badge: MEETINGS.filter(m => m.status === 'upcoming').length },
  ]

  const boardViewButtons: { key: BoardView; icon: React.ReactNode }[] = [
    { key: 'kanban',   icon: <LayoutGrid size={15} /> },
    { key: 'list',     icon: <List size={15} /> },
    { key: 'table',    icon: <Table2 size={15} /> },
    { key: 'calendar', icon: <Calendar size={15} /> },
  ]

  const topAction = () => {
    if (activeTab === 'tasks')    return <button onClick={() => setTaskDialog(true)}         style={btnStyle(accent)}>+ New Task</button>
    if (activeTab === 'sops')     return <button onClick={() => setNewSopSheet(true)}        style={btnStyle(accent)}>+ New SOP</button>
    if (activeTab === 'cleaning') return <button onClick={() => openScheduleDrawer()}        style={btnStyle(accent)}>Schedule Cleaning</button>
    if (activeTab === 'meetings') return <button onClick={() => setMeetingSheet(true)}       style={btnStyle(accent)}>+ New Meeting</button>
    return null
  }

  // List view for tasks
  const ListTaskView = () => {
    const groups = [
      { label: 'To Do',       tasks: tasks.filter(t => t.columnId === 'todo') },
      { label: 'In Progress', tasks: tasks.filter(t => t.columnId === 'inprogress') },
      { label: 'Done',        tasks: tasks.filter(t => t.columnId === 'done') },
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {groups.map(g => (
          <div key={g.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{g.label} · {g.tasks.length}</div>
            {g.tasks.map((t, i) => (
              <div key={t.id} onClick={() => setSelectedTask(t)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < g.tasks.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.type}</span>
                <StatusBadge status={t.priority} />
                <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{t.assignee}</span>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{t.due}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // Table view for tasks
  const TableTaskView = () => (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
            {['Title', 'Type', 'Status', 'Priority', 'Assignee', 'Due Date'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, i) => (
            <tr key={t.id} onClick={() => setSelectedTask(t)} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }}>
              <td style={{ padding: '11px 14px', fontWeight: 500, color: 'var(--text-primary)' }}>{t.title}</td>
              <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>{t.type}</td>
              <td style={{ padding: '11px 14px' }}><StatusBadge status={t.columnId === 'todo' ? 'open' : t.columnId === 'inprogress' ? 'in_progress' : 'done'} /></td>
              <td style={{ padding: '11px 14px' }}><StatusBadge status={t.priority} /></td>
              <td style={{ padding: '11px 14px', color: 'var(--text-muted)' }}>{t.assignee}</td>
              <td style={{ padding: '11px 14px', color: 'var(--text-subtle)' }}>{t.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Operations" subtitle="Tasks, SOPs, and team procedures in one place" action={topAction()} />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
              fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === t.key ? `2px solid ${accent}` : '2px solid transparent',
              marginBottom: -1, position: 'relative',
            }}
          >
            {t.icon} {t.label}
            {t.badge ? (
              <span style={{ padding: '1px 6px', borderRadius: 20, background: `${accent}18`, color: accent, fontSize: 11, fontWeight: 600 }}>{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ── Tasks Tab ── */}
      {activeTab === 'tasks' && (
        <div>
          {/* Board selector + view switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
              {BOARDS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setActiveBoard(b.id)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                    border: `1px solid ${activeBoard === b.id ? accent : 'var(--border)'}`,
                    background: activeBoard === b.id ? `${accent}1a` : 'transparent',
                    color: activeBoard === b.id ? accent : 'var(--text-muted)',
                  }}
                >{b.name}</button>
              ))}
            </div>
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 8, padding: 3, gap: 2, border: '1px solid var(--border)', flexShrink: 0 }}>
              {boardViewButtons.map(b => (
                <button
                  key={b.key}
                  onClick={() => setBoardView(b.key)}
                  title={b.key}
                  style={{ padding: '5px 9px', borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', background: boardView === b.key ? accent : 'transparent', color: boardView === b.key ? '#fff' : 'var(--text-muted)', transition: 'background 0.15s, color 0.15s' }}
                >{b.icon}</button>
              ))}
            </div>
          </div>

          {boardView === 'kanban' && (
            <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
              <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
                <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
                  {COLUMNS.map(col => (
                    <KanbanCol
                      key={col.id}
                      col={col}
                      tasks={tasks.filter(t => t.columnId === col.id)}
                      accent={accent}
                    />
                  ))}
                </DndContext>
              </div>
            </div>
          )}
          {boardView === 'list'     && <ListTaskView />}
          {boardView === 'table'    && <TableTaskView />}
          {boardView === 'calendar' && <CalendarTaskView accent={accent} />}
        </div>
      )}

      {/* ── SOPs Tab ── */}
      {activeTab === 'sops' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {sopPills.map(p => (
                <button key={p.key} onClick={() => setSopFilter(p.key)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${sopFilter === p.key ? accent : 'var(--border)'}`, background: sopFilter === p.key ? `${accent}1a` : 'transparent', color: sopFilter === p.key ? accent : 'var(--text-muted)' }}>
                  {p.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={sopSearch} onChange={e => setSopSearch(e.target.value)} placeholder="Search SOPs..." style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 6, paddingBottom: 6, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', width: 200 }} />
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            {filteredSops.map((sop, i) => (
              <div key={sop.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < filteredSops.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }} onClick={() => setSelectedSop(sop)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{sop.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: `${accent}14`, color: accent }}>{sop.category}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{sop.lastUpdated}</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: sop.acknowledged === sop.total ? '#34d399' : 'var(--text-muted)' }}>
                  {sop.acknowledged}/{sop.total} ack.
                </div>
                <StatusBadge status={SOP_STATUS_MAP[sop.status]} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {sop.status === 'draft' && <button style={pillBtn('#d97706')} onClick={e => e.stopPropagation()}>Submit for Approval</button>}
                  {sop.status === 'pending' && <>
                    <button style={pillBtn('#34d399')} onClick={e => e.stopPropagation()}>Approve</button>
                    <button style={pillBtn('#f87171')} onClick={e => e.stopPropagation()}>Request Changes</button>
                  </>}
                  {sop.status === 'approved' && <button style={pillBtn(accent)} onClick={e => e.stopPropagation()}>View Ack.</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Cleaning Tab ── */}
      {activeTab === 'cleaning' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Week of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-subtle)' }}>
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>● &lt;3h gap</span>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>● &lt;1.5h gap</span>
            </div>
          </div>
          <CleaningCalendar
            accent={accent}
            jobs={cleaningJobs}
            onCellClick={(propId, dayIdx) => openScheduleDrawer(propId, dayIdx)}
            onJobClick={job => { setDetailJob(job); setDetailDrawerOpen(true) }}
          />
        </div>
      )}

      {/* ── Meetings Tab ── */}
      {activeTab === 'meetings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MEETINGS.map(m => (
            <div key={m.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => setSelectedMeeting(m)}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Video size={18} style={{ color: accent }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.date} · {m.time} · {m.attendees.join(', ')}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {m.actionItems.filter(a => !a.done).length > 0 && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(217,119,6,0.15)', color: '#fbbf24' }}>
                    {m.actionItems.filter(a => !a.done).length} actions
                  </span>
                )}
                <StatusBadge status={m.status === 'upcoming' ? 'scheduled' : m.status === 'in_progress' ? 'in_progress' : 'done'} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SOP Detail Sheet ── */}
      <Sheet open={!!selectedSop} onOpenChange={open => { if (!open) setSelectedSop(null) }}>
        <SheetContent side="right" style={{ maxWidth: 520, width: '100%' }}>
          <SheetHeader>
            <SheetTitle>{selectedSop?.title}</SheetTitle>
          </SheetHeader>
          {selectedSop && (
            <div style={{ padding: '0 16px', overflowY: 'auto', flex: 1 }}>
              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, marginTop: 4 }}>
                {(['Draft', 'Pending Approval', 'Approved'] as const).map((step, i) => {
                  const activeStep = selectedSop.status === 'draft' ? 0 : selectedSop.status === 'pending' ? 1 : 2
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'unset' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, background: i < activeStep ? accent : i === activeStep ? `${accent}22` : 'var(--bg-elevated)', color: i < activeStep ? '#fff' : i === activeStep ? accent : 'var(--text-subtle)', border: i === activeStep ? `2px solid ${accent}` : '2px solid transparent' }}>
                          {i < activeStep ? <Check size={10} /> : i + 1}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: i === activeStep ? 600 : 400, color: i === activeStep ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
                      </div>
                      {i < 2 && <div style={{ flex: 1, height: 2, background: i < activeStep ? accent : 'var(--border)', margin: '0 8px' }} />}
                    </div>
                  )
                })}
              </div>
              <div className="label-upper" style={{ marginBottom: 8 }}>Content</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, background: 'var(--bg-elevated)', padding: 12, borderRadius: 8, marginBottom: 16 }}>{selectedSop.body}</p>
              <div className="label-upper" style={{ marginBottom: 8 }}>Acknowledgements ({selectedSop.acknowledged}/{selectedSop.total})</div>
              {ACK_DATA.map(row => (
                <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: accent, flexShrink: 0 }}>{row.name.split(' ').map(n => n[0]).join('')}</div>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{row.name}</span>
                  <StatusBadge status={row.status} />
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── New SOP Sheet ── */}
      <Sheet open={newSopSheet} onOpenChange={setNewSopSheet}>
        <SheetContent side="right">
          <SheetHeader><SheetTitle>New SOP</SheetTitle></SheetHeader>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input placeholder="SOP title" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle}><option>Operations</option><option>Housekeeping</option><option>Maintenance</option><option>Safety</option></select>
            </div>
            <div>
              <label style={labelStyle}>Body</label>
              <textarea placeholder="Write the SOP content..." style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }} />
            </div>
          </div>
          <SheetFooter>
            <button onClick={() => setNewSopSheet(false)} style={ghostBtn}>Cancel</button>
            <button style={btnStyle(accent)}>Save Draft</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Meeting Detail Sheet ── */}
      <Sheet open={!!selectedMeeting} onOpenChange={open => { if (!open) setSelectedMeeting(null) }}>
        <SheetContent side="right" style={{ maxWidth: 480, width: '100%' }}>
          <SheetHeader><SheetTitle>{selectedMeeting?.title}</SheetTitle></SheetHeader>
          {selectedMeeting && (
            <div style={{ padding: '0 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><div className="label-upper" style={{ marginBottom: 4 }}>Date</div><div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedMeeting.date}</div></div>
                <div><div className="label-upper" style={{ marginBottom: 4 }}>Time</div><div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedMeeting.time}</div></div>
                <div><div className="label-upper" style={{ marginBottom: 4 }}>Status</div><StatusBadge status={selectedMeeting.status === 'upcoming' ? 'scheduled' : selectedMeeting.status === 'in_progress' ? 'in_progress' : 'done'} /></div>
                <div><div className="label-upper" style={{ marginBottom: 4 }}>Attendees</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedMeeting.attendees.join(', ')}</div></div>
              </div>
              <div>
                <div className="label-upper" style={{ marginBottom: 8 }}>Agenda</div>
                <textarea defaultValue={selectedMeeting.agenda} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
              </div>
              <div>
                <div className="label-upper" style={{ marginBottom: 8 }}>Action Items</div>
                {selectedMeeting.actionItems.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${a.done ? accent : 'var(--border)'}`, background: a.done ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {a.done && <Check size={10} color="#fff" />}
                    </div>
                    <span style={{ flex: 1, fontSize: 13, color: a.done ? 'var(--text-subtle)' : 'var(--text-primary)', textDecoration: a.done ? 'line-through' : 'none' }}>{a.text}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{a.assignee}</span>
                  </div>
                ))}
              </div>
              {selectedMeeting.notes && (
                <div>
                  <div className="label-upper" style={{ marginBottom: 8 }}>Notes</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{selectedMeeting.notes}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── New Task Dialog ── */}
      <Dialog open={taskDialog} onOpenChange={setTaskDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={labelStyle}>Title</label><input placeholder="Task title" style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={labelStyle}>Type</label><select style={inputStyle}><option>Maintenance</option><option>Cleaning</option><option>Onboarding</option><option>Compliance</option></select></div>
              <div><label style={labelStyle}>Priority</label><select style={inputStyle}><option>High</option><option>Medium</option><option>Low</option></select></div>
            </div>
            <div><label style={labelStyle}>Due Date</label><input type="date" style={inputStyle} /></div>
          </div>
          <DialogFooter>
            <DialogClose render={<button style={ghostBtn} />}>Cancel</DialogClose>
            <button onClick={() => setTaskDialog(false)} style={btnStyle(accent)}>Create Task</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New Meeting Sheet ── */}
      <Sheet open={meetingSheet} onOpenChange={setMeetingSheet}>
        <SheetContent side="right">
          <SheetHeader><SheetTitle>New Meeting</SheetTitle></SheetHeader>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={labelStyle}>Title</label><input placeholder="Meeting title" style={inputStyle} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label style={labelStyle}>Date</label><input type="date" style={inputStyle} /></div>
              <div><label style={labelStyle}>Time</label><input type="time" style={inputStyle} /></div>
            </div>
            <div><label style={labelStyle}>Agenda</label><textarea placeholder="Meeting agenda..." style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} /></div>
          </div>
          <SheetFooter>
            <button onClick={() => setMeetingSheet(false)} style={ghostBtn}>Cancel</button>
            <button style={btnStyle(accent)}>Create Meeting</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Schedule Cleaning Drawer ── */}
      <Sheet open={scheduleDrawerOpen} onOpenChange={setScheduleDrawerOpen}>
        <SheetContent side="right" style={{ maxWidth: 440, width: '100%' }}>
          <SheetHeader><SheetTitle>Schedule Cleaning</SheetTitle></SheetHeader>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Checklist Template</label>
              <select value={scheduleTemplate} onChange={e => setScheduleTemplate(e.target.value)} style={inputStyle}>
                {CLEANING_TEMPLATES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Property</label>
              <select value={schedulePropId} onChange={e => setSchedulePropId(e.target.value)} style={inputStyle}>
                {PROPERTIES_CLEANING.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Day</label>
              <select value={scheduleDayIdx} onChange={e => setScheduleDayIdx(Number(e.target.value))} style={inputStyle}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Assigned Staff</label>
              <select value={scheduleStaff} onChange={e => setScheduleStaff(e.target.value)} style={inputStyle}>
                {STAFF_NAMES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <SheetFooter>
            <button onClick={() => setScheduleDrawerOpen(false)} style={ghostBtn}>Cancel</button>
            <button onClick={handleSaveSchedule} style={btnStyle(accent)}>Save Cleaning</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Cleaning Detail Drawer ── */}
      <Sheet open={detailDrawerOpen} onOpenChange={open => { if (!open) setDetailDrawerOpen(false) }}>
        <SheetContent side="right" style={{ maxWidth: 440, width: '100%' }}>
          <SheetHeader><SheetTitle>{detailJob?.label ?? 'Cleaning Detail'}</SheetTitle></SheetHeader>
          {detailJob && (
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Property',           value: PROPERTIES_CLEANING.find(p => p.id === detailJob.propId)?.name ?? detailJob.propId },
                { label: 'Type',               value: detailJob.label },
                { label: 'Cleaner',            value: detailJob.cleaner ?? 'Unassigned' },
                { label: 'Time Window',        value: detailJob.timeWindow ?? '—' },
                { label: 'Checklist Template', value: detailJob.checklistTemplate ?? '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: detailJob.status === 'done' ? '#10b98118' : detailJob.status === 'in_progress' ? '#3b82f618' : `${accent}18`, color: detailJob.status === 'done' ? '#10b981' : detailJob.status === 'in_progress' ? '#3b82f6' : accent, textTransform: 'capitalize' }}>
                  {detailJob.status?.replace('_', ' ') ?? 'Scheduled'}
                </span>
              </div>
              {detailJob.gapHrs !== undefined && detailJob.gapHrs < 3 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: detailJob.gapHrs < 1.5 ? '#ef444412' : '#f59e0b12', border: `1px solid ${detailJob.gapHrs < 1.5 ? '#ef444430' : '#f59e0b30'}`, borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: detailJob.gapHrs < 1.5 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                    ⚠ {detailJob.gapHrs}h turnover gap — {detailJob.gapHrs < 1.5 ? 'critical' : 'tight'}
                  </span>
                </div>
              )}
            </div>
          )}
          <SheetFooter>
            <button onClick={() => setDetailDrawerOpen(false)} style={ghostBtn}>Close</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {cleaningToast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {cleaningToast}
        </div>
      )}

      {/* ── Task Detail Sheet ── */}
      <TaskSheet
        task={selectedTask ? {
          id: selectedTask.id,
          title: selectedTask.title,
          type: selectedTask.type,
          priority: selectedTask.priority,
          assignee: selectedTask.assignee,
          due: selectedTask.due,
          columnId: selectedTask.columnId,
        } : null}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onMarkComplete={(id) => {
          setTasks(prev => prev.map(t => t.id === id ? { ...t, columnId: 'done' } : t))
          setSelectedTask(null)
        }}
      />
    </motion.div>
  )
}

// ─── Style helpers ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }
const ghostBtn: React.CSSProperties = { padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }
const btnStyle = (accent: string): React.CSSProperties => ({ padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' })
const pillBtn = (color: string): React.CSSProperties => ({ padding: '4px 10px', borderRadius: 6, border: `1px solid ${color}`, background: `${color}14`, color, fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' as const })

// ─── Export ────────────────────────────────────────────────────────────────────

export default function OperationsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: 'var(--text-muted)' }}>Loading...</div>}>
      <OperationsContent />
    </Suspense>
  )
}

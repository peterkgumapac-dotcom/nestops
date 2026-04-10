'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { Building2, Sparkles, CalendarCheck, AlertTriangle, Clock, CheckCircle, ChevronRight } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import { PROPERTIES } from '@/lib/data/properties'
import { STOCK_ITEMS, PURCHASE_ORDERS, PROPERTY_CHECKINS } from '@/lib/data/inventory'
import { GUEST_ISSUES, getActiveIssues } from '@/lib/data/guestServices'
import { APPROVALS, type Approval } from '@/lib/data/approvals'
import { JOBS } from '@/lib/data/staff'
import { REQUESTS } from '@/lib/data/requests'
import { COMPLIANCE_DOCS } from '@/lib/data/compliance'
import { ASSETS } from '@/lib/data/assets'
import { UPSELL_APPROVAL_REQUESTS } from '@/lib/data/upsellApprovals'
import { useRole } from '@/context/RoleContext'
import { FEED_ITEMS, filterFeed, type FeedTab } from '@/lib/data/activityFeed'
import OperationsKanban from './_components/OperationsKanban'
import ScheduledRail from './_components/ScheduledRail'
import OperatorPanelAside from '@/components/shared/OperatorPanelAside'
import PageHeader from '@/components/shared/PageHeader'

// ─── Team clock status (6 members) ───────────────────────────────────────────
const TEAM_CLOCK_STATUS = [
  { id: 'km', name: 'Kim',    initials: 'KM', avatarBg: 'var(--accent)',  role: 'Cleaning',       property: 'Ocean View Apt', status: 'active',  task: 'Turnover clean',          clockTime: '09:05' },
  { id: 'nm', name: 'Nameda', initials: 'NM', avatarBg: '#7c3aed',         role: 'Guest Services', property: 'Remote',         status: 'busy',    task: 'Handling guest request',  clockTime: '08:55' },
  { id: 'ar', name: 'Aron',   initials: 'AR', avatarBg: 'var(--status-info)',   role: 'Maintenance',    property: 'Harbor Studio',  status: 'active',  task: 'Fixing AC unit',          clockTime: '09:15' },
  { id: 'jo', name: 'Jonas',  initials: 'JO', avatarBg: 'var(--status-warning)',  role: 'Cleaning',       property: 'Sunset Villa',   status: 'blocked', task: 'Waiting for supplies',    clockTime: null },
  { id: 'ka', name: 'Kasper', initials: 'KA', avatarBg: 'var(--text-subtle)', role: 'Cleaning',       property: 'Downtown Loft',  status: 'idle',    task: 'Starts at 14:00',         clockTime: null },
  { id: 'la', name: 'Lars',   initials: 'LA', avatarBg: '#e97575',         role: 'Maintenance',    property: 'Garden Suite',   status: 'active',  task: 'Deep clean in progress',  clockTime: '08:40' },
]

function fmtCountdown(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 600): number {
  const [val, setVal] = useState(0)
  const startRef = useRef<number | null>(null)
  useEffect(() => {
    if (target === 0) return
    startRef.current = null
    let raf: number
    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

// ─── Collapsible (kept for QA sheet compatibility) ────────────────────────────
interface CollapsibleProps {
  title: string
  meta?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  liveMode?: boolean
}
function Collapsible({ title, meta, defaultOpen = true, children, liveMode = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)
  if (liveMode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: open ? '1 1 0' : '0 0 auto', minHeight: 0, overflow: 'hidden', borderBottom: '1px solid var(--border)', transition: 'flex 0.22s ease' }}>
        <div className="coll-header" onClick={() => setOpen(o => !o)}>
          <ChevronRight className={`coll-chevron${open ? ' open' : ''}`} />
          <span className="coll-title">{title}</span>
          {meta && <span className="coll-meta" style={{ marginLeft: 6 }}>{meta}</span>}
        </div>
        <div className={`coll-live-body${open ? '' : ' closed'}`} style={{ overflowY: 'auto' }}>{children}</div>
      </div>
    )
  }
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="coll-header" onClick={() => setOpen(o => !o)}>
        <ChevronRight className={`coll-chevron${open ? ' open' : ''}`} />
        <span className="coll-title">{title}</span>
        {meta && <span className="coll-meta" style={{ marginLeft: 6 }}>{meta}</span>}
      </div>
      <div className={`coll-body${open ? '' : ' closed'}`}>
        <div className="coll-body-inner">{children}</div>
      </div>
    </div>
  )
}

interface FieldReport {
  id: string; property: string; issueType: string; urgency: 'Urgent' | 'Standard'
  description: string; reporter: string; time: string
}
interface QaPendingItem {
  id: string; taskId: string; property: string; propertyId: string; cleaner: string
  rating: number; notes: string; photos: string[]; submittedAt: string
  qaStatus: 'pending' | 'approved' | 'redo'
}

export default function OperatorDashboard() {
  const { accent } = useRole()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>(APPROVALS)
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([])
  const [ownerWorkOrders, setOwnerWorkOrders] = useState<{ id: string; title: string; property: string; requestedBy: string }[]>([])
  const [qaPending, setQaPending] = useState<QaPendingItem[]>([])
  const [qaReviewItem, setQaReviewItem] = useState<QaPendingItem | null>(null)
  const [toast, setToast] = useState('')
  const [feedTab, setFeedTab] = useState<FeedTab>('all')
  const [pendingPOApprovals, setPendingPOApprovals] = useState(
    PURCHASE_ORDERS.filter(po => po.approvalTier === 'manager' && po.approvalStatus === 'pending')
  )
  const [countdownSec, setCountdownSec] = useState(285)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    try { const s = localStorage.getItem('afterstay_field_reports'); if (s) setFieldReports(JSON.parse(s)) } catch {}
    try { const s = localStorage.getItem('afterstay_owner_work_orders'); if (s) setOwnerWorkOrders(JSON.parse(s)) } catch {}
    try { const s = localStorage.getItem('afterstay_qa_pending'); if (s) setQaPending(JSON.parse(s)) } catch {}
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCountdownSec(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleQaAction = (id: string, action: 'approved' | 'redo') => {
    const updated = qaPending.map(q => q.id === id ? { ...q, qaStatus: action } : q).filter(q => q.qaStatus === 'pending')
    setQaPending(updated)
    try { localStorage.setItem('afterstay_qa_pending', JSON.stringify(updated)) } catch {}
    setQaReviewItem(null)
    showToast(action === 'approved' ? 'Cleaning approved' : 'Flag sent — cleaner notified to redo')
  }

  // ─── Derived data ─────────────────────────────────────────────────────────────
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const lowStock = STOCK_ITEMS.filter(i => i.status === 'low' || i.status === 'critical' || i.status === 'out')
  const pendingUpsells = UPSELL_APPROVAL_REQUESTS.filter(r => r.status === 'pending_cleaner' || r.status === 'pending_supervisor')
  const checkInJobs = JOBS.filter(j => j.checkinTime)
  const lateMembers = TEAM_CLOCK_STATUS.filter(m => m.status === 'blocked')
  const onShift = TEAM_CLOCK_STATUS.filter(m => m.status === 'active')
  const totalApprovalAmt = pendingApprovals.reduce((s, a) => s + a.amount, 0)
  const activeCleans = JOBS.filter(j => j.type === 'cleaning' && j.status === 'in_progress').length
  const overdueCount = JOBS.filter(j => j.status === 'pending' && j.priority === 'urgent').length

  const today = new Date('2026-03-21')
  const urgentCheckins = PROPERTY_CHECKINS.filter(ci => {
    const checkin = new Date(ci.date)
    const hours = (checkin.getTime() - today.getTime()) / 3600000
    return hours <= 72 && ci.stockItemIds.some(id => {
      const item = STOCK_ITEMS.find(s => s.id === id)
      return item && (item.status === 'low' || item.status === 'critical' || item.status === 'out')
    })
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const cProps   = useCountUp(mounted ? PROPERTIES.length       : 0)
  const cCleans  = useCountUp(mounted ? activeCleans            : 0)
  const cCheckin = useCountUp(mounted ? checkInJobs.length      : 0)
  const cReq     = useCountUp(mounted ? activeIssues.length     : 0)
  const cOver    = useCountUp(mounted ? overdueCount            : 0)
  const cApprove = useCountUp(mounted ? pendingApprovals.length : 0)

  const [topView, setTopView] = useState<'kanban' | 'classic'>('classic')
  const [dashView, setDashView] = useState<'work' | 'portfolio'>('work')
  const [workFilter, setWorkFilter] = useState<'all' | 'task' | 'ticket' | 'approval' | 'overdue'>('all')

  interface WorkItem {
    id: string
    type: 'task' | 'ticket' | 'approval' | 'compliance'
    title: string
    property: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    dueDate?: string
    status: string
    href: string
  }

  const todayStr = '2026-03-25'

  const workItems = useMemo((): WorkItem[] => {
    const items: WorkItem[] = []
    JOBS.filter(j => j.status !== 'done').forEach(j => {
      items.push({ id: `j-${j.id}`, type: 'task', title: j.title, property: j.propertyName, priority: j.priority, status: j.status, href: '/operator/operations' })
    })
    REQUESTS.filter(r => r.status !== 'resolved').forEach(r => {
      const prop = PROPERTIES.find(p => p.id === r.propertyId)?.name ?? r.propertyId
      items.push({ id: `r-${r.id}`, type: 'ticket', title: r.title, property: prop, priority: r.priority, dueDate: r.date, status: r.status, href: r.source === 'guest' ? '/operator/tickets?source=guest' : '/operator/tickets' })
    })
    GUEST_ISSUES.filter(i => !['resolved', 'closed'].includes(i.status)).forEach(i => {
      const priorityMap: Record<string, WorkItem['priority']> = { low: 'low', medium: 'medium', high: 'high', critical: 'urgent' }
      items.push({ id: `gi-${i.id}`, type: 'ticket', title: i.title, property: i.propertyName, priority: priorityMap[i.severity] ?? 'medium', status: i.status, href: '/operator/tickets?source=guest' })
    })
    APPROVALS.filter(a => (a as any).status === 'pending' || !(a as any).status).forEach(a => {
      items.push({ id: `ap-${a.id}`, type: 'approval', title: a.title, property: a.property, priority: 'high', status: 'pending', href: '/operator/properties' })
    })
    COMPLIANCE_DOCS.filter(d => d.status === 'expired' || d.status === 'missing' || d.status === 'expiring').forEach(d => {
      const prop = PROPERTIES.find(p => p.id === d.propertyId)?.name ?? d.propertyId
      items.push({ id: `cd-${d.id}`, type: 'compliance', title: d.category, property: prop, priority: (d.status === 'expired' || d.status === 'missing') ? 'urgent' : 'high', status: d.status, href: '/operator/compliance' })
    })
    return items
  }, [])

  const filteredWork = useMemo(() => {
    if (workFilter === 'all') return workItems
    if (workFilter === 'overdue') return workItems.filter(i => i.dueDate && i.dueDate < todayStr)
    return workItems.filter(i => i.type === workFilter)
  }, [workItems, workFilter])

  const workCounts = useMemo(() => ({
    all: workItems.length,
    task: workItems.filter(i => i.type === 'task').length,
    ticket: workItems.filter(i => i.type === 'ticket').length,
    approval: workItems.filter(i => i.type === 'approval').length,
    overdue: workItems.filter(i => i.dueDate && i.dueDate < todayStr).length,
  }), [workItems])

  function computeHealthScore(propertyId: string): { score: number; pills: string[] } {
    const openTickets = REQUESTS.filter(r => r.propertyId === propertyId && r.status !== 'resolved').length
    const guestIssues = GUEST_ISSUES.filter(i => i.propertyId === propertyId && !['resolved', 'closed'].includes(i.status)).length
    const overdueMaintenance = JOBS.filter(j => j.propertyId === propertyId && j.type === 'maintenance' && j.status === 'pending').length
    const compDocs = COMPLIANCE_DOCS.filter(d => d.propertyId === propertyId)
    const expiredDocs = compDocs.filter(d => d.status === 'expired' || d.status === 'missing').length
    const expiringDocs = compDocs.filter(d => d.status === 'expiring').length
    const poorAssets = ASSETS.filter(a => a.propertyId === propertyId && (a.condition === 'fair' || a.condition === 'poor')).length
    let score = 100
    score -= openTickets * 8
    score -= guestIssues * 10
    score -= overdueMaintenance * 12
    score -= expiredDocs * 15
    score -= expiringDocs * 5
    score -= poorAssets * 3
    score = Math.max(0, Math.min(100, score))
    const pills: string[] = []
    if (openTickets + guestIssues > 0) pills.push(`${openTickets + guestIssues} open tickets`)
    if (expiredDocs > 0) pills.push(`${expiredDocs} expired doc${expiredDocs > 1 ? 's' : ''}`)
    if (expiringDocs > 0) pills.push(`${expiringDocs} expiring soon`)
    if (poorAssets > 0) pills.push(`${poorAssets} asset issue${poorAssets > 1 ? 's' : ''}`)
    return { score, pills }
  }

  function scoreColor(score: number): string {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#ef4444'
    return '#ef4444'
  }

  const PRIORITY_COLORS: Record<string, string> = { low: '#6b7280', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' }
  const TYPE_LABELS: Record<string, string> = { task: 'Task', ticket: 'Ticket', approval: 'Approval', compliance: 'Compliance' }
  const TYPE_BADGE_STYLE: Record<string, { bg: string; fg: string }> = {
    task:       { bg: 'rgba(55,138,221,0.15)',  fg: '#378ADD' },
    ticket:     { bg: 'rgba(239,159,39,0.15)',  fg: '#ef9f27' },
    approval:   { bg: 'rgba(16,185,129,0.15)',  fg: '#10b981' },
    compliance: { bg: 'rgba(124,58,237,0.15)',  fg: '#a78bfa' },
  }
  const WORK_FILTER_LABELS: Record<string, string> = { all: 'All', task: 'Tasks', ticket: 'Tickets', approval: 'Approvals', overdue: 'Overdue' }

  function feedDotColor(type: string) {
    if (type === 'blocked') return 'var(--status-danger)'
    if (type === 'in_progress') return 'var(--accent)'
    if (type === 'en_route') return 'var(--accent-light)'
    return 'var(--text-subtle)'
  }
  function feedStatusStyle(type: string) {
    if (type === 'in_progress') return { bg: 'var(--status-info-bg)', fg: 'var(--status-info)', label: 'In progress' }
    if (type === 'blocked')     return { bg: 'var(--status-danger-bg)',  fg: 'var(--status-danger)',  label: 'Blocked' }
    return null
  }
  const feedBlocked = filterFeed(FEED_ITEMS, 'all').filter(i => i.type === 'blocked').length
  const feedActive  = filterFeed(FEED_ITEMS, 'all').filter(i => i.type === 'in_progress').length

  function statusDotColor(status: string) {
    if (status === 'active')  return 'var(--accent)'
    if (status === 'blocked') return 'var(--status-danger)'
    if (status === 'busy')    return 'var(--status-warning)'
    return 'var(--text-subtle)'
  }
  function statusTaskColor(status: string) {
    if (status === 'active')  return 'var(--accent)'
    if (status === 'blocked') return 'var(--status-danger)'
    return 'var(--text-muted)'
  }

  const STAT_CARDS = [
    { count: cProps,   label: 'Live properties', icon: Building2,     glow: 'var(--status-info)',    sub: 'All quiet' },
    { count: cCleans,  label: 'Cleans running',  icon: Sparkles,      glow: 'var(--text-muted)',     sub: 'In progress' },
    { count: cCheckin, label: 'Guests arriving', icon: CalendarCheck, glow: 'var(--accent)',         sub: 'Today' },
    { count: cReq,     label: 'Guests waiting',  icon: AlertTriangle, glow: 'var(--status-warning)', sub: activeIssues.length > 0 ? 'On you' : 'All clear' },
    { count: cOver,    label: 'Tasks slipped',   icon: Clock,         glow: overdueCount > 0 ? 'var(--status-danger)' : 'var(--text-subtle)', sub: overdueCount > 0 ? `${overdueCount} urgent` : 'None' },
    { count: cApprove, label: 'Your sign-off',   icon: CheckCircle,   glow: pendingApprovals.length > 0 ? 'var(--accent)' : 'var(--text-subtle)', sub: pendingApprovals.length > 0 ? 'Pending' : 'None' },
  ]

  if (!mounted) return (
    <div style={{ padding: 24 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 48, borderRadius: 8, background: 'var(--bg-card)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────────
  // Tab switcher — Kanban (new revamp) vs Classic (legacy rich dashboard)
  const ViewTabs = (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, marginBottom: 18 }}>
      {(['kanban', 'classic'] as const).map(v => (
        <button
          key={v}
          onClick={() => setTopView(v)}
          style={{
            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
            background: topView === v ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: topView === v ? '#fff' : 'rgba(255,255,255,0.55)',
          }}
        >
          {v === 'kanban' ? 'Tasks' : 'Overview'}
        </button>
      ))}
    </div>
  )

  const PulseBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 300, maxHeight: 380, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="live-dot" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>PULSE</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {feedBlocked > 0 && <span style={{ fontSize: 11, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>{feedBlocked} blocked</span>}
          {feedActive > 0 && <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{feedActive} active</span>}
        </div>
      </div>
      <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 8, padding: 2, marginBottom: 12, gap: 1 }}>
        {(['all', 'in_progress', 'issues', 'completed'] as const).map(tab => (
          <button key={tab} onClick={() => setFeedTab(tab)} style={{
            flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            border: 'none',
            background: feedTab === tab ? 'var(--bg-card)' : 'transparent',
            color: feedTab === tab ? 'var(--text-primary)' : 'var(--text-subtle)',
            textTransform: 'capitalize', letterSpacing: '.04em',
            transition: 'background 0.12s, color 0.12s',
          }}>
            {tab === 'in_progress' ? 'Active' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filterFeed(FEED_ITEMS, feedTab).map((item, i, arr) => {
          const statusInfo = feedStatusStyle(item.type)
          const initials = item.actor.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <div key={item.id} className="feed-item-enter" style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.actor}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-subtle)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{item.time}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>{item.action}{item.detail ? ` · ${item.detail}` : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>{item.property}</div>
                </div>
              </div>
              {item.progress !== undefined && (
                <div style={{ marginLeft: 32, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--border-subtle)' }}>
                    <div style={{ width: `${item.progress}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{item.progress}%</span>
                </div>
              )}
              {statusInfo && (
                <div style={{ marginLeft: 32 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: statusInfo.bg, color: statusInfo.fg }}>{statusInfo.label}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  if (topView === 'kanban') {
    return (
      <OperatorPanelAside slot={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', minHeight: 0 }}>
          {PulseBlock}
          <ScheduledRail />
        </div>
      }>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {ViewTabs}
          <OperationsKanban />
        </div>
      </OperatorPanelAside>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ═══ CENTER COLUMN ══════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {ViewTabs}

        {/* A. Live Ticker */}
        <div style={{ background: 'var(--bg-elevated)', height: 36, borderRadius: 8, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 8, background: 'var(--bg-elevated)', zIndex: 1, borderRight: '1px solid var(--border)' }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>LIVE</span>
          </div>
          <div style={{ flex: 1, marginLeft: 52, overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
            <div style={{ display: 'inline-flex', gap: 28, whiteSpace: 'nowrap', animation: 'ticker 28s linear infinite' }}>
              {[...FEED_ITEMS.slice(0, 4), ...FEED_ITEMS.slice(0, 4)].map((item, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.actor}</span>
                  <span>{item.action}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* B. Page Heading */}
        <PageHeader title={`${greeting}, Peter`} subtitle={dateStr} />

        {/* C. Stat Grid 3×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {STAT_CARDS.map(({ count, label, icon: Icon, sub }) => (
            <div
              key={label}
              className="kpi-tile"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px 14px 12px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Icon size={16} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                <div style={{ fontSize: 26, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>{count}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* D. Alert Banners */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {urgentCheckins.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--status-warning-bg)', borderLeft: '3px solid var(--status-warning)', borderRadius: 8, border: '1px solid var(--status-warning)' }}>
              <span className="pulse-urgent" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-warning)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--status-warning)' }}>Pre-check-in Stock Alert</div>
                <div style={{ fontSize: 11, color: 'var(--status-warning)', opacity: 0.8, marginTop: 1 }}>
                  {urgentCheckins.map(ci => {
                    const lowItems = ci.stockItemIds.map(id => STOCK_ITEMS.find(s => s.id === id)).filter(i => i && i.status !== 'ok').map(i => i!.name)
                    const hrs = Math.round((new Date(ci.date).getTime() - today.getTime()) / 3600000)
                    return `${ci.property} in ${hrs}h — ${lowItems.join(', ')}`
                  }).join(' · ')}
                </div>
              </div>
              <button style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'transparent', color: 'var(--status-warning)', border: '1px solid var(--status-warning)', cursor: 'pointer', flexShrink: 0 }}>View</button>
            </div>
          )}
          {activeIssues.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--status-danger-bg)', borderLeft: '3px solid var(--status-danger)', borderRadius: 8, border: '1px solid var(--status-danger)' }}>
              <span className="pulse-urgent" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-danger)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--status-danger)' }}>PTE pending 4+ hours — Inspect heating system</div>
                <div style={{ fontSize: 11, color: 'var(--status-danger)', opacity: 0.7, marginTop: 1 }}>Downtown Loft · Guest Services not yet responded</div>
              </div>
              <button style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--status-danger)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}>View Task</button>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'var(--accent-bg)', borderLeft: '3px solid var(--accent)', borderRadius: 8, border: '1px solid var(--accent-border)' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 7 5.5 10.5 12 3.5"/></svg>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>1 task auto-granted PTE · Properties vacant — no guest access needed</span>
          </div>
        </div>

        {/* E. Portfolio Bar */}
        <div style={{ background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '.08em', flexShrink: 0 }}>PORTFOLIO</span>
          {PROPERTIES.map(p => {
            const { score } = computeHealthScore(p.id)
            const color = scoreColor(score)
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{p.name.split(' ')[0]}</span>
              </div>
            )
          })}
        </div>

        {/* F. Team on shift — horizontal strip matching Pulse row grammar */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Team on shift</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{TEAM_CLOCK_STATUS.filter(m => m.status === 'active').length} active · {TEAM_CLOCK_STATUS.filter(m => m.status === 'blocked').length} blocked</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 20px' }}>
            {TEAM_CLOCK_STATUS.map(member => (
              <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: member.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                    {member.initials}
                  </div>
                  <span style={{ position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderRadius: '50%', background: statusDotColor(member.status), border: '2px solid var(--bg-card)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>· {member.role}</span></div>
                  <div style={{ fontSize: 11, color: statusTaskColor(member.status), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.task}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* G. Tab Row + Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: 'var(--bg-elevated)', borderRadius: 20, padding: 3, border: '1px solid var(--border)' }}>
            {(['work', 'portfolio'] as const).map(v => (
              <button key={v} onClick={() => setDashView(v)} style={{
                padding: '4px 16px', borderRadius: 18, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: 'none',
                background: dashView === v ? accent : 'transparent',
                color: dashView === v ? '#fff' : 'var(--text-muted)',
                transition: 'background 0.15s, color 0.15s',
              }}>
                {v === 'work' ? 'My Work' : 'Portfolio'}
              </button>
            ))}
          </div>
          {dashView === 'work' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'task', 'ticket', 'approval', 'overdue'] as const).map(f => (
                <button key={f} onClick={() => setWorkFilter(f)} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${workFilter === f ? accent : 'var(--border)'}`,
                  background: workFilter === f ? `${accent}1a` : 'transparent',
                  color: workFilter === f ? accent : 'var(--text-muted)',
                }}>
                  {WORK_FILTER_LABELS[f]}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '0 5px', borderRadius: 8, background: workFilter === f ? `${accent}30` : 'var(--bg-elevated)', color: workFilter === f ? accent : 'var(--text-subtle)' }}>
                    {workCounts[f]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* H. Work Table OR Portfolio Health */}
        {dashView === 'work' ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            {filteredWork.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-subtle)' }}>No items in this category</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                      {['Type', 'Title', 'Property', 'Priority', 'Status'].map(h => (
                        <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWork.map((item, i) => (
                      <tr
                        key={item.id}
                        style={{ borderBottom: i < filteredWork.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', borderLeft: `3px solid ${PRIORITY_COLORS[item.priority]}`, background: item.priority === 'urgent' ? 'rgba(239,68,68,0.04)' : 'transparent' }}
                        onClick={() => { if (typeof window !== 'undefined') window.location.href = item.href }}
                        onMouseEnter={e => (e.currentTarget.style.background = item.priority === 'urgent' ? 'rgba(239,68,68,0.07)' : 'var(--bg-elevated)')}
                        onMouseLeave={e => (e.currentTarget.style.background = item.priority === 'urgent' ? 'rgba(239,68,68,0.04)' : 'transparent')}
                      >
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: TYPE_BADGE_STYLE[item.type]?.bg ?? 'var(--bg-elevated)', color: TYPE_BADGE_STYLE[item.type]?.fg ?? 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                            {TYPE_LABELS[item.type]}
                          </span>
                        </td>
                        <td style={{ padding: '9px 14px', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 220 }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                        </td>
                        <td style={{ padding: '9px 14px', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.property}</td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: PRIORITY_COLORS[item.priority] }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: PRIORITY_COLORS[item.priority], flexShrink: 0 }} />
                            {item.priority}
                          </span>
                        </td>
                        <td style={{ padding: '9px 14px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {PROPERTIES.map(prop => {
              const { score, pills } = computeHealthScore(prop.id)
              const color = scoreColor(score)
              const circumference = 2 * Math.PI * 24
              const dashOffset = circumference * (1 - score / 100)
              return (
                <Link key={prop.id} href="/operator/properties" style={{ textDecoration: 'none' }}>
                  <div
                    style={{ borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-card)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, transition: 'border-color 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = color)}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)')}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prop.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
                        <svg width="56" height="56" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
                          <circle cx="28" cy="28" r="24" fill="none" stroke={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 28 28)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color }}>{score}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 4 }}>{score >= 80 ? 'Healthy' : score >= 50 ? 'Watch' : 'Alert'}</div>
                        {pills.length === 0 ? (
                          <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>No issues</div>
                        ) : pills.slice(0, 3).map((pill, i) => (
                          <div key={i} style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {pill}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </div>
      {/* ═══ end CENTER COLUMN ═══════════════════════════════════════════════════ */}

      {/* ═══ RIGHT PANEL ════════════════════════════════════════════════════════ */}
      <aside style={{ display: isMobile ? 'none' : 'flex', width: 300, minWidth: 300, flexShrink: 0, flexDirection: 'column', gap: 16, padding: '24px 24px 24px 0', overflowY: 'auto', height: '100%' }}>

        {/* I. Pulse */}
        {PulseBlock}

        {/* J. Today's Check-ins */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Today&apos;s Check-ins</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>1 ready · 1 at risk</span>
          </div>
          {checkInJobs.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No check-ins scheduled today</div>
          ) : checkInJobs.map((job, i) => {
            const isAtRisk = i === 1
            return (
              <div key={i} style={{ paddingTop: i > 0 ? 8 : 0, paddingBottom: 8, borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.propertyName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.reservation?.guestName ?? 'Guest'}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: isAtRisk ? 'var(--status-warning-bg)' : 'var(--accent-bg)', color: isAtRisk ? 'var(--status-warning)' : 'var(--accent)', border: `1px solid ${isAtRisk ? 'var(--status-warning)' : 'var(--accent-border)'}`, flexShrink: 0 }}>
                    {isAtRisk ? 'At risk' : 'Ready'}
                  </span>
                </div>
                {isAtRisk && <div style={{ fontSize: 10, color: 'var(--status-warning)', marginTop: 3 }}>Cleaning finishes at 17:00</div>}
              </div>
            )
          })}
        </div>

        {/* K. Owner Approvals */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Owner Approvals</span>
            {pendingApprovals.length > 0 && (
              <span style={{ fontSize: 10, color: 'var(--status-warning)', fontFamily: 'var(--font-mono)' }}>{totalApprovalAmt.toLocaleString()} NOK · {pendingApprovals.length}</span>
            )}
          </div>
          {pendingApprovals.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>No pending approvals</div>
          ) : pendingApprovals.map((a, i) => (
            <div key={a.id} style={{ paddingBottom: 12, marginBottom: i < pendingApprovals.length - 1 ? 12 : 0, borderBottom: i < pendingApprovals.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{a.amount.toLocaleString()} {a.currency}</span>
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 8 }}>{a.property} · {a.category}</div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={() => { setPendingApprovals(p => p.filter(x => x.id !== a.id)); showToast('Approved — owner notified') }} style={{ flex: 1, height: 26, borderRadius: 5, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                <button onClick={() => showToast('Invoiced later')} style={{ flex: 1, height: 26, borderRadius: 5, border: '1px solid var(--status-info)', background: 'var(--status-info-bg)', color: 'var(--status-info)', fontSize: 11, cursor: 'pointer' }}>Invoice Later</button>
                <button onClick={() => showToast('Follow-up sent')} style={{ flex: 1, height: 26, borderRadius: 5, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Follow-Up</button>
              </div>
            </div>
          ))}
        </div>

      </aside>
      {/* ═══ end RIGHT PANEL ════════════════════════════════════════════════════ */}

      {/* QA Review Sheet */}
      <Sheet open={!!qaReviewItem} onOpenChange={open => { if (!open) setQaReviewItem(null) }}>
        <SheetContent side="right" style={{ maxWidth: 440, width: '100%' }}>
          <SheetHeader><SheetTitle>QA Review — {qaReviewItem?.property}</SheetTitle></SheetHeader>
          {qaReviewItem && (
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Cleaner</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{qaReviewItem.cleaner}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Rating</div>
                  <div style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1 }}>
                    {'★'.repeat(qaReviewItem.rating)}<span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - qaReviewItem.rating)}</span>
                  </div>
                </div>
              </div>
              {qaReviewItem.photos.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Photos</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {qaReviewItem.photos.map((url, i) => (
                      <img key={i} src={url} style={{ width: 90, height: 68, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} alt="qa" />
                    ))}
                  </div>
                </div>
              )}
              {qaReviewItem.notes && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Notes</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, background: 'var(--bg-elevated)', padding: 10, borderRadius: 8 }}>{qaReviewItem.notes}</p>
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Submitted {new Date(qaReviewItem.submittedAt).toLocaleString()}</div>
            </div>
          )}
          <SheetFooter>
            <button onClick={() => qaReviewItem && handleQaAction(qaReviewItem.id, 'redo')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid var(--status-danger)', background: 'transparent', color: 'var(--status-danger)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Flag for Redo</button>
            <button onClick={() => qaReviewItem && handleQaAction(qaReviewItem.id, 'approved')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

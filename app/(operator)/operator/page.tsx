'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, CalendarCheck, AlertTriangle, Clock, Wrench, CircleDollarSign } from 'lucide-react'
import { computeStatTiles, computeNeedsAttention, computeOperationsProgress } from '@/lib/data/dashboardAggregates'
import { USE_SCALE_DATA, SCALE_PROPERTIES, SCALE_RESERVATIONS, SCALE_JOBS, SCALE_ISSUES } from '@/lib/data/mockScale'
import StatTileRow from '@/components/dashboard/StatTileRow'
import NeedsAttentionPanel from '@/components/dashboard/NeedsAttentionPanel'
import OperationsProgress from '@/components/dashboard/OperationsProgress'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import { PROPERTIES } from '@/lib/data/properties'
import { STOCK_ITEMS, PROPERTY_CHECKINS } from '@/lib/data/inventory'
import { GUEST_ISSUES, getActiveIssues } from '@/lib/data/guestServices'
import { APPROVALS, type Approval } from '@/lib/data/approvals'
import { JOBS } from '@/lib/data/staff'
import { REQUESTS } from '@/lib/data/requests'
import { COMPLIANCE_DOCS } from '@/lib/data/compliance'
import { ASSETS } from '@/lib/data/assets'
import { RESERVATIONS } from '@/lib/data/reservations'
import { UPSELL_APPROVAL_REQUESTS } from '@/lib/data/upsellApprovals'
import { STAFF_MEMBERS } from '@/lib/data/staff'
import { GUIDEBOOKS } from '@/lib/data/guidebooks'
import { useRole } from '@/context/RoleContext'
import { FEED_ITEMS, filterFeed, type FeedTab } from '@/lib/data/activityFeed'
import OperationsKanban from './_components/OperationsKanban'
import ScheduledRail from './_components/ScheduledRail'
import OperatorPanelAside from '@/components/shared/OperatorPanelAside'
import PageHeader from '@/components/shared/PageHeader'
import IntentCard from './_components/IntentCard'

// ─── Team clock status (6 members) ───────────────────────────────────────────
const TEAM_CLOCK_STATUS = [
  { id: 's5', name: 'Maria',   initials: 'MS', avatarBg: 'var(--accent)',       role: 'Cleaning',       property: 'Ocean View Apt', status: 'active',  task: 'Turnover clean',          clockTime: '09:05' },
  { id: 's4', name: 'Fatima',  initials: 'FN', avatarBg: '#7c3aed',            role: 'Guest Services', property: 'Remote',         status: 'busy',    task: 'Handling guest request',  clockTime: '08:55' },
  { id: 's3', name: 'Bjorn',   initials: 'BL', avatarBg: 'var(--status-info)', role: 'Maintenance',    property: 'Harbor Studio',  status: 'active',  task: 'Fixing AC unit',          clockTime: '09:15' },
  { id: 's1', name: 'Johan',   initials: 'JL', avatarBg: 'var(--status-warning)', role: 'Cleaning',    property: 'Sunset Villa',   status: 'blocked', task: 'Waiting for supplies',    clockTime: null },
  { id: 's2', name: 'Anna',    initials: 'AK', avatarBg: 'var(--text-subtle)',  role: 'Inspector',      property: 'Downtown Loft',  status: 'idle',    task: 'Starts at 14:00',         clockTime: null },
  { id: 's6', name: 'Ivan',    initials: 'IP', avatarBg: '#e97575',            role: 'Cleaning',       property: 'Garden Suite',   status: 'active',  task: 'Deep clean in progress',  clockTime: '08:40' },
]

const SEVERITY_STYLE: Record<string, { bg: string; fg: string }> = {
  critical: { bg: 'rgba(239,68,68,0.15)', fg: '#ef4444' },
  high:     { bg: 'rgba(249,115,22,0.15)', fg: '#f97316' },
  medium:   { bg: 'rgba(245,158,11,0.15)', fg: '#f59e0b' },
  low:      { bg: 'rgba(107,114,128,0.15)', fg: '#6b7280' },
}

const PRIORITY_DOT: Record<string, string> = {
  urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#6b7280',
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
  const [qaPending, setQaPending] = useState<QaPendingItem[]>([])
  const [qaReviewItem, setQaReviewItem] = useState<QaPendingItem | null>(null)
  const [toast, setToast] = useState('')
  const [feedTab, setFeedTab] = useState<FeedTab>('all')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    try { const s = localStorage.getItem('afterstay_qa_pending'); if (s) setQaPending(JSON.parse(s)) } catch {}
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleQaAction = (id: string, action: 'approved' | 'redo') => {
    const updated = qaPending.map(q => q.id === id ? { ...q, qaStatus: action } : q).filter(q => q.qaStatus === 'pending')
    setQaPending(updated)
    try { localStorage.setItem('afterstay_qa_pending', JSON.stringify(updated)) } catch {}
    setQaReviewItem(null)
    showToast(action === 'approved' ? 'Cleaning approved' : 'Flag sent — cleaner notified to redo')
  }

  // ─── Scale data toggle ────────────────────────────────────────────────────────
  const DATA_PROPERTIES = USE_SCALE_DATA ? SCALE_PROPERTIES : PROPERTIES
  const DATA_RESERVATIONS = USE_SCALE_DATA ? SCALE_RESERVATIONS : RESERVATIONS
  const DATA_JOBS = USE_SCALE_DATA ? SCALE_JOBS : JOBS
  const DATA_ISSUES = USE_SCALE_DATA ? SCALE_ISSUES : GUEST_ISSUES
  // ─── Derived data ─────────────────────────────────────────────────────────────
  const activeIssues = getActiveIssues(DATA_ISSUES)

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

  // Date label for Operations Progress
  const now = new Date()
  const opsDateLabel = `Today, ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · ${now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`

  // Relative time helper for Pulse feed
  function relativeTime(timeStr: string): string {
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const [h, m] = timeStr.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) return timeStr
    const itemMinutes = h * 60 + m
    const diff = nowMinutes - itemMinutes
    if (diff < 0 || diff > 120) return timeStr
    if (diff < 1) return 'just now'
    if (diff === 1) return '1 min ago'
    return `${diff} min ago`
  }

  const [topView, setTopView] = useState<'kanban' | 'classic'>('classic')
  const [dashView, setDashView] = useState<'work' | 'portfolio'>('work')

  const todayStr = '2026-04-14'
  const tomorrowStr = '2026-04-15'

  // ─── Dashboard aggregates ────────────────────────────────────────────────────
  const statTiles = useMemo(
    () => computeStatTiles(DATA_RESERVATIONS, DATA_JOBS, DATA_ISSUES, GUIDEBOOKS, DATA_PROPERTIES, todayStr),
    [DATA_RESERVATIONS, DATA_JOBS, DATA_ISSUES, DATA_PROPERTIES],
  )

  const attentionItems = useMemo(
    () => computeNeedsAttention(
      DATA_JOBS, DATA_ISSUES,
      TEAM_CLOCK_STATUS, pendingApprovals,
      UPSELL_APPROVAL_REQUESTS, PROPERTY_CHECKINS, STOCK_ITEMS,
      todayStr,
    ),
    [DATA_JOBS, DATA_ISSUES, pendingApprovals, PROPERTY_CHECKINS, STOCK_ITEMS],
  )

  const opsProgress = useMemo(
    () => computeOperationsProgress(DATA_JOBS),
    [DATA_JOBS],
  )

  // ─── Intent-based data memos ──────────────────────────────────────────────────

  // Cross-reference maps
  const propertyCheckInTimes = useMemo(() => {
    const map = new Map<string, string>()
    GUIDEBOOKS.forEach(g => map.set(g.propertyId, g.checkInTime))
    return map
  }, [])

  const propertyIssueMap = useMemo(() => {
    const map = new Map<string, typeof activeIssues>()
    activeIssues.forEach(issue => {
      const list = map.get(issue.propertyId) ?? []
      map.set(issue.propertyId, [...list, issue])
    })
    return map
  }, [activeIssues])

  const guestUpsellMap = useMemo(() => {
    const pending = UPSELL_APPROVAL_REQUESTS.filter(u => u.status === 'pending_cleaner' || u.status === 'pending_supervisor')
    const map = new Map<string, typeof pending>()
    pending.forEach(u => {
      const list = map.get(u.guestName) ?? []
      map.set(u.guestName, [...list, u])
    })
    return map
  }, [])

  const todayCheckins = useMemo(
    () => DATA_RESERVATIONS.filter(r => r.checkInDate === todayStr),
    [DATA_RESERVATIONS],
  )

  const todayCheckouts = useMemo(
    () => DATA_RESERVATIONS.filter(r => r.checkOutDate === todayStr),
    [DATA_RESERVATIONS],
  )

  const tomorrowActivity = useMemo(() => {
    const ins = DATA_RESERVATIONS.filter(r => r.checkInDate === tomorrowStr).map(r => ({ ...r, direction: 'IN' as const }))
    const outs = DATA_RESERVATIONS.filter(r => r.checkOutDate === tomorrowStr).map(r => ({ ...r, direction: 'OUT' as const }))
    return [...ins, ...outs]
  }, [DATA_RESERVATIONS])

  const maintenancePending = useMemo(() => {
    return DATA_JOBS.filter(j => j.type === 'maintenance' && j.status !== 'done').map(j => {
      const staff = STAFF_MEMBERS.find(s => s.id === j.staffId)
      return { ...j, staffName: staff?.name }
    })
  }, [DATA_JOBS])

  const guestsWithIssues = useMemo(() => {
    const currentResPropIds = new Set(
      DATA_RESERVATIONS.filter(r => r.checkInDate <= todayStr && r.checkOutDate >= todayStr).map(r => r.propertyId),
    )
    return activeIssues
      .filter(i => currentResPropIds.has(i.propertyId))
      .map(issue => {
        const res = DATA_RESERVATIONS.find(r => r.propertyId === issue.propertyId && r.checkInDate <= todayStr && r.checkOutDate >= todayStr)
        return { ...issue, guestName: issue.guestName || res?.guestName || 'Guest' }
      })
  }, [activeIssues])

  const pendingUpsells = useMemo(
    () => UPSELL_APPROVAL_REQUESTS.filter(u => u.status === 'pending_cleaner' || u.status === 'pending_supervisor'),
    [],
  )

  const totalApprovalAmt = pendingApprovals.reduce((s, a) => s + a.amount, 0)

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
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
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

  if (!mounted) return (
    <div style={{ padding: 24 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 48, borderRadius: 8, background: 'var(--bg-card)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────────
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
    <div className="pulse-card" style={{ display: 'flex', flexDirection: 'column', minHeight: 300, maxHeight: 380, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
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
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              style={{
                padding: '10px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', flexDirection: 'column', gap: 4,
                borderLeft: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
                paddingLeft: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.actor}</span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-subtle)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{relativeTime(item.time)}</span>
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
            </motion.div>
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

  // ─── Intent card row renderer helpers ─────────────────────────────────────────
  const RowDivider = () => <div style={{ borderBottom: '1px solid var(--border)' }} />

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : '100%', overflow: isMobile ? 'visible' : 'hidden' }}>

      {/* ═══ CENTER COLUMN ══════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '20px 24px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {ViewTabs}

        {/* A. Page Heading */}
        <PageHeader title={`${greeting}, Peter`} subtitle={dateStr} />

        {/* B. Stat Tiles */}
        <StatTileRow tiles={statTiles} />

        {/* C. Tab Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
        </div>

        {/* D. Intent Cards (My Work) OR Portfolio Health */}
        {dashView === 'work' ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>

            {/* 1. Check-ins Today */}
            <IntentCard icon={CalendarCheck} iconColor="#10b981" title="Check-ins Today" count={todayCheckins.length} index={0}>
              {todayCheckins.map((r, i) => {
                const checkInTime = propertyCheckInTimes.get(r.propertyId) ?? '15:00'
                const hasIssues = propertyIssueMap.has(r.propertyId)
                const linkedUpsells = guestUpsellMap.get(r.guestName)
                return (
                  <div key={r.id}>
                    {i > 0 && <RowDivider />}
                    <div style={{ padding: '8px 0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{r.propertyName}</span>
                          {hasIssues && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                              <AlertTriangle size={9} /> Issue
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.guestName}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{r.guestsCount} guest{r.guestsCount > 1 ? 's' : ''}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>{r.bookingSource}</span>
                        </div>
                        {r.specialRequests && (
                          <div style={{ fontSize: 10, color: 'var(--status-warning)', marginTop: 2 }}>{r.specialRequests}</div>
                        )}
                        {linkedUpsells && linkedUpsells.map(u => (
                          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                            <Sparkles size={10} style={{ color: '#a78bfa' }} />
                            <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 500 }}>{u.upsellTitle}</span>
                            <span style={{ fontSize: 10, color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>{u.price.toLocaleString()} NOK</span>
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{checkInTime}</span>
                    </div>
                  </div>
                )
              })}
            </IntentCard>

            {/* 2. Check-outs Today */}
            <IntentCard icon={CalendarCheck} iconColor="#60a5fa" title="Check-outs Today" count={todayCheckouts.length} index={1}>
              {todayCheckouts.map((r, i) => (
                <div key={r.id}>
                  {i > 0 && <RowDivider />}
                  <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{r.propertyName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.guestName}</span>
                  </div>
                </div>
              ))}
            </IntentCard>

            {/* 3. Tomorrow */}
            <IntentCard icon={Clock} iconColor="var(--text-muted)" title="Tomorrow" count={tomorrowActivity.length} index={2}>
              {tomorrowActivity.map((r, i) => (
                <div key={`${r.id}-${r.direction}`}>
                  {i > 0 && <RowDivider />}
                  <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                      background: r.direction === 'IN' ? 'rgba(16,185,129,0.15)' : 'rgba(96,165,250,0.15)',
                      color: r.direction === 'IN' ? '#10b981' : '#60a5fa',
                    }}>{r.direction}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{r.propertyName}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.guestName}</span>
                  </div>
                </div>
              ))}
            </IntentCard>

            {/* 4. Maintenance Pending */}
            <IntentCard icon={Wrench} iconColor="#f59e0b" title="Maintenance Pending" count={maintenancePending.length} index={3}>
              {maintenancePending.map((j, i) => (
                <div key={j.id}>
                  {i > 0 && <RowDivider />}
                  <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: PRIORITY_DOT[j.priority] ?? '#6b7280', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{j.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{j.propertyName}</span>
                        {j.staffName && <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{j.staffName}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{j.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </IntentCard>

            {/* 5. For Approval */}
            <IntentCard
              icon={CircleDollarSign}
              iconColor="#10b981"
              title="For Approval"
              count={pendingApprovals.length}
              subtitle={pendingApprovals.length > 0 ? `${totalApprovalAmt.toLocaleString()} NOK` : undefined}
              index={4}
            >
              {pendingApprovals.map((a, i) => (
                <div key={a.id}>
                  {i > 0 && <RowDivider />}
                  <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{a.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.property}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{a.category}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{a.amount.toLocaleString()} NOK</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPendingApprovals(p => p.filter(x => x.id !== a.id)); showToast('Approved — owner notified') }}
                      style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    >Approve</button>
                  </div>
                </div>
              ))}
            </IntentCard>

            {/* 6. Guests with Issues */}
            <IntentCard icon={AlertTriangle} iconColor="#ef4444" title="Guests with Issues" count={guestsWithIssues.length} index={5}>
              {guestsWithIssues.map((issue, i) => {
                const sev = SEVERITY_STYLE[issue.severity] ?? SEVERITY_STYLE.medium
                return (
                  <div key={issue.id}>
                    {i > 0 && <RowDivider />}
                    <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{issue.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{issue.propertyName}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{issue.guestName}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: sev.bg, color: sev.fg, textTransform: 'uppercase' }}>{issue.severity}</span>
                    </div>
                  </div>
                )
              })}
            </IntentCard>

            {/* 7. Upsell Requests */}
            <IntentCard icon={Sparkles} iconColor="#a78bfa" title="Upsell Requests" count={pendingUpsells.length} index={6}>
              {pendingUpsells.map((u, i) => (
                <div key={u.id}>
                  {i > 0 && <RowDivider />}
                  <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{u.upsellTitle}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.guestName}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{u.propertyName}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{u.price.toLocaleString()} NOK</span>
                  </div>
                </div>
              ))}
            </IntentCard>

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

        {/* E. Needs Attention */}
        <NeedsAttentionPanel items={attentionItems} />

        {/* F. Operations Progress */}
        <OperationsProgress data={opsProgress} dateLabel={opsDateLabel} />

        {/* G. Pulse — inline on mobile only */}
        {isMobile && PulseBlock}

        {/* H. Team on shift — compact avatar strip */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0 }}>Team</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {TEAM_CLOCK_STATUS.map((member, i) => (
              <div key={member.id} title={`${member.name} — ${member.task}`} style={{ position: 'relative', marginLeft: i > 0 ? -6 : 0, zIndex: TEAM_CLOCK_STATUS.length - i }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: member.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', border: '2px solid var(--bg-card)' }}>
                  {member.initials}
                </div>
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: statusDotColor(member.status), border: '2px solid var(--bg-card)' }} />
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
            {TEAM_CLOCK_STATUS.filter(m => m.status === 'active').length} active
            {TEAM_CLOCK_STATUS.filter(m => m.status === 'blocked').length > 0 && <span style={{ color: 'var(--status-danger)' }}> · {TEAM_CLOCK_STATUS.filter(m => m.status === 'blocked').length} blocked</span>}
          </span>
          <Link href="/operator/team" style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}>View all</Link>
        </div>

      </div>
      {/* ═══ end CENTER COLUMN ═══════════════════════════════════════════════════ */}

      {/* ═══ RIGHT PANEL — desktop aside / mobile stacked ═══════════════════════ */}
      {!isMobile && (
        <aside className="dash-aside" style={{ display: 'flex', width: 300, minWidth: 300, flexShrink: 0, flexDirection: 'column', gap: 16, padding: '24px 24px 24px 0', overflowY: 'auto', height: '100%' }}>
          {PulseBlock}
        </aside>
      )}
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

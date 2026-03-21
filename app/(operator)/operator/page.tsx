'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import { PROPERTIES } from '@/lib/data/properties'
import { STOCK_ITEMS, PURCHASE_ORDERS, PROPERTY_CHECKINS } from '@/lib/data/inventory'
import { GUEST_ISSUES, getActiveIssues } from '@/lib/data/guestServices'
import { APPROVALS, type Approval } from '@/lib/data/approvals'
import { JOBS } from '@/lib/data/staff'
import { UPSELL_APPROVAL_REQUESTS } from '@/lib/data/upsellApprovals'
import { useRole } from '@/context/RoleContext'
import { FEED_ITEMS, filterFeed, type FeedTab } from '@/lib/data/activityFeed'

// ─── Color constants ──────────────────────────────────────────────────────────
const C = {
  green:       '#1D9E75',
  greenBg:     'rgba(29,158,117,0.08)',
  greenBorder: 'rgba(29,158,117,0.2)',
  red:         '#e24b4a',
  redBg:       'rgba(226,75,74,0.08)',
  redBorder:   'rgba(226,75,74,0.2)',
  amber:       '#ef9f27',
  amberBg:     'rgba(239,159,39,0.08)',
  amberBorder: 'rgba(239,159,39,0.2)',
  blue:        '#378ADD',
  blueBg:      'rgba(55,138,221,0.08)',
} as const

// ─── Team clock status ────────────────────────────────────────────────────────
const TEAM_CLOCK_STATUS = [
  { id: 'ms', name: 'Maria S.',  initials: 'MS', avatarBg: '#1D9E75', role: 'Cleaning',      property: 'Ocean View Apt', clockedIn: true,  late: false, clockTime: '09:05' },
  { id: 'bl', name: 'Bjorn L.', initials: 'BL', avatarBg: '#e24b4a', role: 'Maintenance',   property: 'Sunset Villa',   clockedIn: false, late: true,  lateMin: 349 },
  { id: 'fn', name: 'Fatima N.',initials: 'FN', avatarBg: '#7c3aed', role: 'Guest Services', property: 'Remote',         clockedIn: true,  late: false, clockTime: '08:55' },
  { id: 'jl', name: 'Johan L.', initials: 'JL', avatarBg: '#6b7280', role: 'Cleaning',      property: 'Harbor Studio',  clockedIn: false, late: false, startsAt: '14:00' },
]

function fmtCountdown(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
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
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
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
  // Collapsible state
  const [teamOpen, setTeamOpen] = useState(true)
  const [lastNightOpen, setLastNightOpen] = useState(false)
  const [checkinOpen, setCheckinOpen] = useState(true)
  const [feedOpen, setFeedOpen] = useState(true)
  const [approvalsOpen, setApprovalsOpen] = useState(true)
  const [countdownSec, setCountdownSec] = useState(285)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    try { const s = localStorage.getItem('nestops_field_reports'); if (s) setFieldReports(JSON.parse(s)) } catch {}
    try { const s = localStorage.getItem('nestops_owner_work_orders'); if (s) setOwnerWorkOrders(JSON.parse(s)) } catch {}
    try { const s = localStorage.getItem('nestops_qa_pending'); if (s) setQaPending(JSON.parse(s)) } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCountdownSec(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleQaAction = (id: string, action: 'approved' | 'redo') => {
    const updated = qaPending.map(q => q.id === id ? { ...q, qaStatus: action } : q).filter(q => q.qaStatus === 'pending')
    setQaPending(updated)
    try { localStorage.setItem('nestops_qa_pending', JSON.stringify(updated)) } catch {}
    setQaReviewItem(null)
    showToast(action === 'approved' ? '✓ Cleaning approved' : 'Flag sent — cleaner notified to redo')
  }

  // ─── Derived data ────────────────────────────────────────────────────────────
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const lowStock = STOCK_ITEMS.filter(i => i.status === 'low' || i.status === 'critical' || i.status === 'out')
  const pendingUpsells = UPSELL_APPROVAL_REQUESTS.filter(r => r.status === 'pending_cleaner' || r.status === 'pending_supervisor')
  const checkInJobs = JOBS.filter(j => j.checkinTime)
  const lateMembers = TEAM_CLOCK_STATUS.filter(m => m.late)
  const onShift = TEAM_CLOCK_STATUS.filter(m => m.clockedIn)
  const totalApprovalAmt = pendingApprovals.reduce((s, a) => s + a.amount, 0)

  // Pre-check-in stock alert
  const today = new Date('2026-03-21')
  const urgentCheckins = PROPERTY_CHECKINS.filter(ci => {
    const checkin = new Date(ci.date)
    const hours = (checkin.getTime() - today.getTime()) / 3600000
    return hours <= 72 && ci.stockItemIds.some(id => {
      const item = STOCK_ITEMS.find(s => s.id === id)
      return item && (item.status === 'low' || item.status === 'critical' || item.status === 'out')
    })
  })

  // Greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // Stat pills
  const PILLS = [
    { label: 'Properties',  value: PROPERTIES.length,         color: C.green,  bg: C.greenBg,  border: C.greenBorder, href: '/operator/properties' },
    { label: 'Check-ins',   value: checkInJobs.length,        color: C.green,  bg: C.greenBg,  border: C.greenBorder, href: '/operator/team' },
    { label: 'Issues',      value: activeIssues.length,       color: activeIssues.length > 0 ? C.amber : C.green, bg: activeIssues.length > 0 ? C.amberBg : C.greenBg, border: activeIssues.length > 0 ? C.amberBorder : C.greenBorder, href: '/operator/guest-services/issues' },
    { label: 'Upsells',     value: pendingUpsells.length,     color: pendingUpsells.length > 0 ? C.amber : C.green, bg: pendingUpsells.length > 0 ? C.amberBg : C.greenBg, border: pendingUpsells.length > 0 ? C.amberBorder : C.greenBorder, href: '/operator/guest-services/upsells' },
    { label: 'Low stock',   value: lowStock.length,           color: lowStock.length > 0 ? C.red : C.green, bg: lowStock.length > 0 ? C.redBg : C.greenBg, border: lowStock.length > 0 ? C.redBorder : C.greenBorder, href: '/operator/inventory' },
    { label: 'POs pending', value: pendingPOApprovals.length, color: pendingPOApprovals.length > 0 ? C.amber : C.green, bg: pendingPOApprovals.length > 0 ? C.amberBg : C.greenBg, border: pendingPOApprovals.length > 0 ? C.amberBorder : C.greenBorder, href: '/operator/inventory' },
  ]

  if (!mounted) return (
    <div style={{ padding: 24 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 48, borderRadius: 8, background: 'var(--bg-card)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100%' }}>

      {/* 2-column layout — stacks on mobile */}
      <div style={{
        display: isMobile ? 'flex' : 'grid',
        flexDirection: isMobile ? 'column' : undefined,
        gridTemplateColumns: isMobile ? undefined : '1fr 320px',
        flex: isMobile ? undefined : 1,
        overflow: isMobile ? 'visible' : 'hidden',
        gap: 16,
      }}>

        {/* ═══ LEFT COLUMN — action ════════════════════════════════════════════ */}
        <div style={{ overflowY: isMobile ? 'visible' : 'auto', paddingRight: isMobile ? 0 : 4, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Greeting */}
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{greeting}, Peter</div>
            <div style={{ fontSize: 12, color: 'var(--text-subtle)', fontFamily: 'monospace', marginTop: 3 }}>{dateStr}</div>
          </div>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 4 : 0 }}>
            {PILLS.map(p => (
              <Link key={p.label} href={p.href} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 20,
                background: p.bg, border: `1px solid ${p.border}`,
                textDecoration: 'none', flexShrink: 0,
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: p.color }}>{p.value}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.label}</span>
              </Link>
            ))}
          </div>

          {/* Stock alert banner (amber) */}
          {urgentCheckins.length > 0 && (
            <Link href="/operator/inventory?tab=alerts" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: C.amberBg, border: `1px solid ${C.amberBorder}`,
              borderLeft: `3px solid ${C.amber}`,
              borderRadius: 8, textDecoration: 'none',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: C.amber,
                flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.amber }}>Pre-check-in Stock Alert — </span>
                <span style={{ fontSize: 12, color: C.amber, opacity: 0.8 }}>
                  {urgentCheckins.map(ci => {
                    const lowItems = ci.stockItemIds
                      .map(id => STOCK_ITEMS.find(s => s.id === id))
                      .filter(i => i && i.status !== 'ok')
                      .map(i => i!.name)
                    const hrs = Math.round((new Date(ci.date).getTime() - today.getTime()) / 3600000)
                    return `${ci.property} in ${hrs}h — ${lowItems.join(', ')}`
                  }).join(' · ')}
                </span>
              </div>
              <ChevronRight size={14} color={C.amber} style={{ flexShrink: 0 }} />
            </Link>
          )}

          {/* PTE Alert (red) */}
          {activeIssues.length > 0 && (
            <div style={{
              padding: '10px 14px',
              background: C.redBg, border: `1px solid ${C.redBorder}`,
              borderLeft: `3px solid ${C.red}`,
              borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.red }}>PTE pending 4+ hours — Inspect heating system</div>
                <div style={{ fontSize: 11, color: C.red, opacity: 0.7, marginTop: 2 }}>Downtown Loft · Guest Services not yet responded</div>
              </div>
              <Link href="/operator/guest-services/issues" style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                background: C.redBg, border: `1px solid ${C.redBorder}`,
                color: C.red, textDecoration: 'none', flexShrink: 0,
              }}>View Task</Link>
            </div>
          )}

          {/* PTE Success (green) */}
          <div style={{
            padding: '8px 14px',
            background: C.greenBg, border: `1px solid ${C.greenBorder}`,
            borderLeft: `3px solid ${C.green}`,
            borderRadius: 8,
          }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: C.green }}>✓ 1 task auto-granted PTE · Properties vacant — no guest access needed</span>
          </div>

          {/* Needs Action */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.amber, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Needs Action</span>
            </div>
            {/* Noise complaint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Noise complaint at Sunset Villa</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Reported 02:30 · Unassigned</div>
              </div>
              <button
                onClick={() => showToast('Task assigned — team notified')}
                style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.amber}`, background: C.amberBg, color: C.amber, cursor: 'pointer', flexShrink: 0 }}
              >Assign Now</button>
            </div>
            {/* Late members */}
            {lateMembers.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < lateMembers.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{m.name} has not clocked in</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {m.role} · {m.property} · {'lateMin' in m ? `${(m as { lateMin: number }).lateMin} min late` : 'Late'}
                  </div>
                </div>
                <button
                  onClick={() => showToast(`Reminder sent to ${m.name}`)}
                  style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, border: `1px solid ${C.amber}`, background: C.amberBg, color: C.amber, cursor: 'pointer', flexShrink: 0 }}
                >Send Reminder</button>
              </div>
            ))}
          </div>

          {/* Team Today — collapsible */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <button
              onClick={() => setTeamOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: teamOpen ? '1px solid var(--border)' : 'none' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>Team Today</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{onShift.length} on shift · {lateMembers.length} late</span>
              <ChevronRight size={13} style={{ color: 'var(--text-subtle)', transform: teamOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {teamOpen && TEAM_CLOCK_STATUS.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: i < TEAM_CLOCK_STATUS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {m.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.role} · {m.property}</div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {m.clockedIn && 'clockTime' in m
                    ? <span style={{ fontSize: 11, fontWeight: 500, color: C.green }}>Clocked in {(m as { clockTime: string }).clockTime}</span>
                    : m.late
                    ? <span style={{ fontSize: 11, fontWeight: 500, color: C.red }}>{'lateMin' in m ? `${(m as { lateMin: number }).lateMin} min late` : 'Late'}</span>
                    : 'startsAt' in m
                    ? <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Starts {(m as { startsAt: string }).startsAt}</span>
                    : null}
                </div>
                {m.late && (
                  <button
                    onClick={() => showToast(`Reminder sent to ${m.name}`)}
                    style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, border: `1px solid ${C.amber}`, background: C.amberBg, color: C.amber, cursor: 'pointer', flexShrink: 0 }}
                  >Remind</button>
                )}
              </div>
            ))}
          </div>

          {/* Last Night Incidents — collapsible */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <button
              onClick={() => setLastNightOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: lastNightOpen ? '1px solid var(--border)' : 'none' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>Last Night</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>2 incidents</span>
              <ChevronRight size={13} style={{ color: 'var(--text-subtle)', transform: lastNightOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {lastNightOpen && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', flexShrink: 0, width: 40 }}>02:30</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>Noise complaint</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Downtown Loft</div>
                  </div>
                  <button
                    onClick={() => showToast('Task assigned')}
                    style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5, border: `1px solid ${C.amber}`, background: C.amberBg, color: C.amber, cursor: 'pointer', flexShrink: 0 }}
                  >Assign Now</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', flexShrink: 0, width: 40 }}>04:15</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>Hot water pressure low</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sunset Villa</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.green, flexShrink: 0 }}>✓ Assigned</span>
                </div>
              </>
            )}
          </div>

          {/* My Tasks */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>My Tasks</span>
              <Link href="/operator/team" style={{ fontSize: 11, color: accent, textDecoration: 'none' }}>View all →</Link>
            </div>
            {[
              { title: 'Review QA submissions',      sub: 'Ocean View Apt · Cleaning' },
              { title: 'Approve PO #PO-2024-008',    sub: 'Comfort Systems Nordic · 12,500 NOK' },
              { title: 'Follow up guest complaint',  sub: 'Downtown Loft · High priority' },
            ].map((task, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid var(--border)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Meetings */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Meetings</span>
            </div>
            {[
              { time: '10:00', title: 'Ops standup' },
              { time: '14:00', title: 'Owner onboarding call' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', borderBottom: i < 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)', flexShrink: 0, width: 42 }}>{m.time}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{m.title}</span>
              </div>
            ))}
          </div>

          {/* QA Pending — only when data exists */}
          {qaPending.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>QA Pending</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{qaPending.length}</span>
              </div>
              {qaPending.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: i < qaPending.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{item.property}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.cleaner}</div>
                  </div>
                  <span style={{ fontSize: 12, color: '#f59e0b' }}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                  <button
                    onClick={() => setQaReviewItem(item)}
                    style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}
                  >Review</button>
                </div>
              ))}
            </div>
          )}

          {/* Pending POs — only when data exists */}
          {pendingPOApprovals.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Pending POs</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{pendingPOApprovals.length}</span>
              </div>
              {pendingPOApprovals.slice(0, 3).map((po, i) => (
                <div key={po.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: i < Math.min(pendingPOApprovals.length, 3) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{po.poNumber}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{po.vendor}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>{po.total.toLocaleString()} {po.currency}</span>
                  <button
                    onClick={() => { setPendingPOApprovals(p => p.filter(x => x.id !== po.id)); showToast(`PO ${po.poNumber} approved`) }}
                    style={{ height: 26, padding: '0 10px', borderRadius: 5, border: 'none', background: '#16a34a1a', color: '#34d399', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >Approve</button>
                  <button
                    onClick={() => { setPendingPOApprovals(p => p.filter(x => x.id !== po.id)); showToast('Changes requested') }}
                    style={{ height: 26, padding: '0 10px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}
                  >Changes</button>
                </div>
              ))}
            </div>
          )}

          {/* Field Reports — only when data exists */}
          {fieldReports.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Field Reports</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{fieldReports.length}</span>
              </div>
              {fieldReports.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: i < fieldReports.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{r.issueType}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.property} · {r.reporter}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: r.urgency === 'Urgent' ? '#ef444418' : '#6b728018', color: r.urgency === 'Urgent' ? '#ef4444' : '#6b7280' }}>{r.urgency}</span>
                </div>
              ))}
            </div>
          )}

          {/* Work orders from owner (localStorage) */}
          {ownerWorkOrders.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Owner Work Orders</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{ownerWorkOrders.length}</span>
              </div>
              {ownerWorkOrders.map((wo, i) => (
                <div key={wo.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: i < ownerWorkOrders.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{wo.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{wo.property} · {wo.requestedBy}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#ef444418', color: '#ef4444' }}>Owner</span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ═══ RIGHT COLUMN — monitor rail ═════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: isMobile ? 'visible' : 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>

          {/* ── Section 1: Today's Check-Ins ─────────────────────────────────── */}
          <div style={{ flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setCheckinOpen(o => !o)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>Today&apos;s Check-ins</span>
              <span style={{ fontSize: 10, color: countdownSec < 60 ? C.red : 'var(--text-muted)', fontFamily: 'monospace', fontWeight: countdownSec < 60 ? 700 : 400 }}>
                {fmtCountdown(countdownSec)}
              </span>
              <ChevronRight size={13} style={{ color: 'var(--text-subtle)', transform: checkinOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {checkinOpen && (
              <div style={{ padding: '0 14px 10px' }}>
                {checkInJobs.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>No check-ins scheduled today</div>
                ) : checkInJobs.map((job, i) => {
                  const isAtRisk = i === 1
                  return (
                    <div key={i} style={{ padding: '8px 0', borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.propertyName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.reservation?.guestName ?? 'Guest'}</div>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                          background: isAtRisk ? C.amberBg : C.greenBg,
                          color: isAtRisk ? C.amber : C.green,
                          border: `1px solid ${isAtRisk ? C.amberBorder : C.greenBorder}`,
                          flexShrink: 0,
                        }}>
                          {isAtRisk ? 'At risk' : 'Ready'}
                        </span>
                      </div>
                      {isAtRisk && (
                        <div style={{ fontSize: 10, color: C.amber, marginTop: 4 }}>⚠ Cleaning finishes at 17:00</div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Section 2: Live Feed ──────────────────────────────────────────── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            flex: (!isMobile && feedOpen) ? '1 1 0' : '0 0 auto',
            overflow: isMobile ? 'visible' : 'hidden',
            minHeight: 0,
            borderBottom: '1px solid var(--border)',
          }}>
            <button
              onClick={() => setFeedOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, width: '100%' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>Live Feed</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}` }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                LIVE
              </span>
              <ChevronRight size={13} style={{ color: 'var(--text-subtle)', transform: feedOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {feedOpen && (
              <>
                {/* Feed tabs */}
                <div style={{ display: 'flex', gap: 2, padding: '0 10px 8px', flexShrink: 0 }}>
                  {(['all', 'in_progress', 'issues'] as FeedTab[]).map(tab => (
                    <button key={tab} onClick={() => setFeedTab(tab)} style={{
                      flex: 1, padding: '4px 0', fontSize: 10, fontWeight: feedTab === tab ? 600 : 400,
                      borderRadius: 5, border: 'none', cursor: 'pointer',
                      background: feedTab === tab ? `${accent}18` : 'transparent',
                      color: feedTab === tab ? accent : 'var(--text-muted)',
                    }}>
                      {tab === 'all' ? 'All' : tab === 'in_progress' ? 'In Progress' : 'Issues'}
                    </button>
                  ))}
                </div>
                {/* Feed items */}
                <div style={{ overflowY: 'auto', flex: 1, maxHeight: isMobile ? 360 : undefined }}>
                  {filterFeed(FEED_ITEMS, feedTab).map((item, i, arr) => {
                    const isRich = item.type === 'in_progress' || item.type === 'blocked' || item.type === 'en_route'
                    return (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 4 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {isRich ? (
                            <>
                              <div style={{ fontSize: 11, lineHeight: 1.4 }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.actor}</span>
                                <span style={{ color: 'var(--text-muted)' }}> — {item.action} {item.property}</span>
                                {item.detail && <span style={{ color: 'var(--text-subtle)' }}> · {item.detail}</span>}
                              </div>
                              {item.statusLabel && <div style={{ fontSize: 10, fontWeight: 600, color: item.color, marginTop: 2 }}>{item.statusLabel}</div>}
                              {item.type === 'in_progress' && item.progress !== undefined && (
                                <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${item.progress}%`, background: item.color, borderRadius: 2 }} />
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ fontSize: 11, lineHeight: 1.4 }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.actor}</span>
                              <span style={{ color: 'var(--text-muted)' }}> {item.action}</span>
                              {item.detail && <span style={{ color: 'var(--text-muted)' }}> — {item.detail} · {item.property}</span>}
                            </div>
                          )}
                          <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>{item.time}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Section 3: Owner Approvals ────────────────────────────────────── */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: (!isMobile && approvalsOpen) ? 320 : 'none', overflow: isMobile ? 'visible' : 'hidden' }}>
            <button
              onClick={() => setApprovalsOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, width: '100%' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>Owner Approvals</span>
              {pendingApprovals.length > 0 && (
                <span style={{ fontSize: 10, color: C.amber, flexShrink: 0 }}>
                  {totalApprovalAmt.toLocaleString()} NOK · {pendingApprovals.length}
                </span>
              )}
              <ChevronRight size={13} style={{ color: 'var(--text-subtle)', transform: approvalsOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {approvalsOpen && (
              <div style={{ overflowY: 'auto', flex: 1, borderTop: '1px solid var(--border)' }}>
                {pendingApprovals.length === 0 ? (
                  <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>✓ No pending approvals</div>
                ) : pendingApprovals.map((a, i) => (
                  <div key={a.id} style={{ padding: '10px 14px', borderBottom: i < pendingApprovals.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.amber, flexShrink: 0 }}>{a.amount.toLocaleString()} {a.currency}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{a.property} · {a.category}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => { setPendingApprovals(p => p.filter(x => x.id !== a.id)); showToast('Approved — owner notified') }}
                        style={{ flex: 1, height: 26, borderRadius: 5, border: 'none', background: '#16a34a1a', color: '#34d399', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                      >Approve</button>
                      <button
                        onClick={() => showToast('Invoiced later')}
                        style={{ flex: 1, height: 26, borderRadius: 5, border: `1px solid ${C.blue}40`, background: C.blueBg, color: C.blue, fontSize: 11, cursor: 'pointer' }}
                      >Invoice Later</button>
                      <button
                        onClick={() => showToast('Follow-up sent')}
                        style={{ flex: 1, height: 26, borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}
                      >Follow-Up</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

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
                  <div style={{ fontSize: 18, color: '#f59e0b', lineHeight: 1 }}>
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
            <button onClick={() => qaReviewItem && handleQaAction(qaReviewItem.id, 'redo')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Flag for Redo</button>
            <button onClick={() => qaReviewItem && handleQaAction(qaReviewItem.id, 'approved')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

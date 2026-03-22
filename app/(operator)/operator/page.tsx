'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
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

// ─── Team clock status ────────────────────────────────────────────────────────
const TEAM_CLOCK_STATUS = [
  { id: 'ms', name: 'Maria S.',  initials: 'MS', avatarBg: 'var(--n-green)',  role: 'Cleaning',      property: 'Ocean View Apt', clockedIn: true,  late: false, clockTime: '09:05' },
  { id: 'bl', name: 'Bjorn L.',  initials: 'BL', avatarBg: 'var(--n-red)',    role: 'Maintenance',   property: 'Sunset Villa',   clockedIn: false, late: true,  lateMin: 349 },
  { id: 'fn', name: 'Fatima N.', initials: 'FN', avatarBg: '#7c3aed',         role: 'Guest Services', property: 'Remote',         clockedIn: true,  late: false, clockTime: '08:55' },
  { id: 'jl', name: 'Johan L.',  initials: 'JL', avatarBg: 'var(--n-text3)',  role: 'Cleaning',      property: 'Harbor Studio',  clockedIn: false, late: false, startsAt: '14:00' },
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
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setVal(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

// ─── Collapsible component ────────────────────────────────────────────────────
interface CollapsibleProps {
  title: string
  meta?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  liveMode?: boolean // flex:1 grow mode for Live Feed
}
function Collapsible({ title, meta, defaultOpen = true, children, liveMode = false }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen)
  if (liveMode) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        flex: open ? '1 1 0' : '0 0 auto',
        minHeight: 0, overflow: 'hidden',
        borderBottom: '1px solid var(--n-border)',
        transition: 'flex 0.22s ease',
      }}>
        <div className="coll-header" onClick={() => setOpen(o => !o)}>
          <ChevronRight className={`coll-chevron${open ? ' open' : ''}`} />
          <span className="coll-title">{title}</span>
          {meta && <span className="coll-meta" style={{ marginLeft: 6 }}>{meta}</span>}
        </div>
        <div className={`coll-live-body${open ? '' : ' closed'}`} style={{ overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    )
  }
  return (
    <div style={{ borderBottom: '1px solid var(--n-border)' }}>
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
    showToast(action === 'approved' ? 'Cleaning approved' : 'Flag sent — cleaner notified to redo')
  }

  // ─── Derived data ─────────────────────────────────────────────────────────────
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const lowStock = STOCK_ITEMS.filter(i => i.status === 'low' || i.status === 'critical' || i.status === 'out')
  const pendingUpsells = UPSELL_APPROVAL_REQUESTS.filter(r => r.status === 'pending_cleaner' || r.status === 'pending_supervisor')
  const checkInJobs = JOBS.filter(j => j.checkinTime)
  const lateMembers = TEAM_CLOCK_STATUS.filter(m => m.late)
  const onShift = TEAM_CLOCK_STATUS.filter(m => m.clockedIn)
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

  // Count-up targets (only animate after mount)
  const cProps   = useCountUp(mounted ? PROPERTIES.length     : 0)
  const cCleans  = useCountUp(mounted ? activeCleans          : 0)
  const cCheckin = useCountUp(mounted ? checkInJobs.length    : 0)
  const cReq     = useCountUp(mounted ? activeIssues.length   : 0)
  const cOver    = useCountUp(mounted ? overdueCount          : 0)
  const cApprove = useCountUp(mounted ? pendingApprovals.length : 0)

  // ─── Feed status helpers ──────────────────────────────────────────────────────
  function feedDotColor(type: string) {
    if (type === 'blocked') return 'var(--n-red)'
    if (type === 'in_progress') return 'var(--n-green)'
    if (type === 'en_route') return 'var(--n-green2)'
    return 'var(--n-text3)'
  }
  function feedStatusStyle(type: string) {
    if (type === 'in_progress') return { bg: 'var(--n-blue-bg)', fg: 'var(--n-blue)', label: 'In progress' }
    if (type === 'blocked')     return { bg: 'var(--n-red-bg)',  fg: 'var(--n-red)',  label: 'Blocked' }
    return null
  }
  const feedBlocked = filterFeed(FEED_ITEMS, 'all').filter(i => i.type === 'blocked').length
  const feedActive  = filterFeed(FEED_ITEMS, 'all').filter(i => i.type === 'in_progress').length

  if (!mounted) return (
    <div style={{ padding: 24 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 48, borderRadius: 8, background: 'var(--bg-card)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="dash-grid" style={{ flex: 1 }}>

        {/* ═══ LEFT COLUMN ═══════════════════════════════════════════════════════ */}
        <div className="dash-left">

          {/* Greeting */}
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--n-text)', letterSpacing: '-0.02em' }}>{greeting}, Peter</div>
            <div style={{ fontSize: 11, color: 'var(--n-text3)', fontFamily: 'var(--n-mono)', marginTop: 3 }}>{dateStr}</div>
          </div>

          {/* Stat pills — single row, count-up */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 2 }} className="pills-row">
            {/* props */}
            <Link href="/operator/properties" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: 'var(--n-bg3)', border: '1px solid var(--n-border)', textDecoration: 'none', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--n-mono)', color: 'var(--n-text)' }}>{cProps}</span>
              <span style={{ fontSize: 10, color: 'var(--n-text3)' }}>props</span>
            </Link>
            {/* cleans */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: 'var(--n-bg3)', border: '1px solid var(--n-border)', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--n-mono)', color: 'var(--n-text)' }}>{cCleans}</span>
              <span style={{ fontSize: 10, color: 'var(--n-text3)' }}>cleans</span>
            </div>
            {/* check-ins */}
            <Link href="/operator/team" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: 'var(--n-green-bg)', border: '1px solid var(--n-green-border)', textDecoration: 'none', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--n-mono)', color: 'var(--n-green)' }}>{cCheckin}</span>
              <span style={{ fontSize: 10, color: 'var(--n-green)' }}>check-ins</span>
            </Link>
            {/* requests */}
            <Link href="/operator/guest-services/issues" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: activeIssues.length > 0 ? 'var(--n-amber-bg)' : 'var(--n-bg3)', border: `1px solid ${activeIssues.length > 0 ? 'var(--n-amber-border)' : 'var(--n-border)'}`, textDecoration: 'none', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--n-mono)', color: activeIssues.length > 0 ? 'var(--n-amber)' : 'var(--n-text)' }}>{cReq}</span>
              <span style={{ fontSize: 10, color: activeIssues.length > 0 ? 'var(--n-amber)' : 'var(--n-text3)' }}>requests</span>
            </Link>
            {/* overdue */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: overdueCount > 0 ? 'var(--n-red-bg)' : 'var(--n-bg3)', border: `1px solid ${overdueCount > 0 ? 'var(--n-red-border)' : 'var(--n-border)'}`, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--n-mono)', color: overdueCount > 0 ? 'var(--n-red)' : 'var(--n-text)' }}>{cOver}</span>
              <span style={{ fontSize: 10, color: overdueCount > 0 ? 'var(--n-red)' : 'var(--n-text3)' }}>overdue</span>
            </div>
            {/* approvals */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 20, background: pendingApprovals.length > 0 ? 'var(--n-amber-bg)' : 'var(--n-bg3)', border: `1px solid ${pendingApprovals.length > 0 ? 'var(--n-amber-border)' : 'var(--n-border)'}`, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--n-mono)', color: pendingApprovals.length > 0 ? 'var(--n-amber)' : 'var(--n-text)' }}>{cApprove}</span>
              <span style={{ fontSize: 10, color: pendingApprovals.length > 0 ? 'var(--n-amber)' : 'var(--n-text3)' }}>approvals</span>
            </div>
            {/* Portfolio link — pushed right */}
            <Link href="/operator/properties" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '3px 8px', borderRadius: 20, background: 'transparent', border: '1px solid var(--n-border)', textDecoration: 'none', flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: 'var(--n-text2)' }}>Portfolio</span>
              <ChevronRight size={11} style={{ color: 'var(--n-text3)', marginLeft: 2 }} />
            </Link>
          </div>

          {/* Alert banner — stock alert (amber) */}
          {urgentCheckins.length > 0 && (
            <Link href="/operator/inventory?tab=alerts" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px',
              background: 'var(--n-amber-bg)', border: '1px solid var(--n-amber-border)',
              borderLeft: '3px solid var(--n-amber)',
              borderRadius: 6, textDecoration: 'none',
            }}>
              <span className="pulse-urgent" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--n-amber)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--n-amber)' }}>Pre-check-in Stock Alert — </span>
                <span style={{ fontSize: 12, color: 'var(--n-amber)', opacity: 0.8 }}>
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
              <ChevronRight size={14} style={{ color: 'var(--n-amber)', flexShrink: 0 }} />
            </Link>
          )}

          {/* PTE Alert (red) */}
          {activeIssues.length > 0 && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--n-red-bg)', border: '1px solid var(--n-red-border)',
              borderLeft: '3px solid var(--n-red)',
              borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="pulse-urgent" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--n-red)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--n-red)' }}>PTE pending 4+ hours — Inspect heating system</div>
                <div style={{ fontSize: 11, color: 'var(--n-red)', opacity: 0.7, marginTop: 2 }}>Downtown Loft · Guest Services not yet responded</div>
              </div>
              <Link href="/operator/guest-services/issues" style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                background: 'var(--n-red)', color: '#fff', textDecoration: 'none', flexShrink: 0,
              }}>View Task</Link>
            </div>
          )}

          {/* PTE Success (green) */}
          <div style={{
            padding: '8px 12px',
            background: 'var(--n-green-bg)', border: '1px solid var(--n-green-border)',
            borderLeft: '3px solid var(--n-green)',
            borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--n-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 7 5.5 10.5 12 3.5"/></svg>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-green)' }}>1 task auto-granted PTE · Properties vacant — no guest access needed</span>
          </div>

          {/* Needs Action */}
          <div style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '9px 12px', borderBottom: '1px solid var(--n-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--n-amber)', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--n-text3)' }}>Needs Action</span>
            </div>
            {/* Noise complaint */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid var(--n-border)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--n-text)' }}>Noise complaint at Sunset Villa</div>
                <div style={{ fontSize: 11, color: 'var(--n-text2)', marginTop: 2 }}>Reported 02:30 · Unassigned</div>
              </div>
              <button
                onClick={() => showToast('Task assigned — team notified')}
                style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--n-amber-border)', background: 'var(--n-amber-bg)', color: 'var(--n-amber)', cursor: 'pointer', flexShrink: 0 }}
              >Assign Now</button>
            </div>
            {/* Late members */}
            {lateMembers.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: i < lateMembers.length - 1 ? '1px solid var(--n-border)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--n-text)' }}>{m.name} has not clocked in</div>
                  <div style={{ fontSize: 11, color: 'var(--n-text2)', marginTop: 2 }}>
                    {m.role} · {m.property} · {'lateMin' in m ? `${(m as { lateMin: number }).lateMin} min late` : 'Late'}
                  </div>
                </div>
                <button
                  onClick={() => showToast(`Reminder sent to ${m.name}`)}
                  style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--n-amber-border)', background: 'var(--n-amber-bg)', color: 'var(--n-amber)', cursor: 'pointer', flexShrink: 0 }}
                >Send Reminder</button>
              </div>
            ))}
          </div>

          {/* Team Today — collapsible */}
          <div style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8, overflow: 'hidden' }}>
            <Collapsible
              title="Team Today"
              meta={`${onShift.length} on shift · ${lateMembers.length} late`}
              defaultOpen={true}
            >
              {TEAM_CLOCK_STATUS.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: i < TEAM_CLOCK_STATUS.length - 1 ? '1px solid var(--n-border)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {m.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--n-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text2)' }}>{m.role} · {m.property}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.clockedIn ? 'var(--n-green2)' : m.late ? 'var(--n-red)' : 'var(--n-text3)' }} />
                    <span style={{ fontSize: 11, color: m.late ? 'var(--n-red)' : 'var(--n-text2)' }}>
                      {m.clockedIn && 'clockTime' in m
                        ? `${(m as { clockTime: string }).clockTime}`
                        : m.late
                        ? `${'lateMin' in m ? (m as { lateMin: number }).lateMin : '?'}m late`
                        : 'startsAt' in m
                        ? `Starts ${(m as { startsAt: string }).startsAt}`
                        : '—'}
                    </span>
                  </div>
                  {m.late && (
                    <button
                      onClick={() => showToast(`Reminder sent to ${m.name}`)}
                      style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, border: '1px solid var(--n-border2)', background: 'transparent', color: 'var(--n-text2)', cursor: 'pointer', flexShrink: 0 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--n-amber)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--n-amber)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--n-border2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--n-text2)' }}
                    >Remind</button>
                  )}
                </div>
              ))}
            </Collapsible>
          </div>

          {/* Last Night Incidents — collapsible, default closed */}
          <div style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8, overflow: 'hidden' }}>
            <Collapsible title="Last Night" meta="2 incidents" defaultOpen={false}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid var(--n-border)' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--n-mono)', color: 'var(--n-text2)', flexShrink: 0, width: 38 }}>02:30</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text)' }}>Noise complaint</div>
                  <div style={{ fontSize: 11, color: 'var(--n-text2)' }}>Downtown Loft</div>
                </div>
                <button
                  onClick={() => showToast('Task assigned')}
                  style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--n-amber-border)', background: 'var(--n-amber-bg)', color: 'var(--n-amber)', cursor: 'pointer', flexShrink: 0 }}
                >Assign</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--n-mono)', color: 'var(--n-text2)', flexShrink: 0, width: 38 }}>04:15</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text)' }}>Hot water pressure low</div>
                  <div style={{ fontSize: 11, color: 'var(--n-text2)' }}>Sunset Villa</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--n-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 6 4.5 9 10.5 2.5"/></svg>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--n-green)', flexShrink: 0 }}>Assigned</span>
              </div>
            </Collapsible>
          </div>

          {/* My Tasks */}
          <div style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderBottom: '1px solid var(--n-border)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--n-text3)' }}>My Tasks</span>
              <Link href="/operator/team" style={{ fontSize: 11, color: accent, textDecoration: 'none' }}>View all</Link>
            </div>
            {[
              { title: 'Review QA submissions',     sub: 'Ocean View Apt · Cleaning' },
              { title: 'Approve PO #PO-2024-008',   sub: 'Comfort Systems Nordic · 12,500 NOK' },
              { title: 'Follow up guest complaint', sub: 'Downtown Loft · High priority' },
            ].map((task, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: i < 2 ? '1px solid var(--n-border)' : 'none' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--n-border2)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text)' }}>{task.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--n-text2)' }}>{task.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Meetings */}
          <div style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '9px 12px', borderBottom: '1px solid var(--n-border)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--n-text3)' }}>Meetings</span>
            </div>
            {[
              { time: '10:00', title: 'Ops standup' },
              { time: '14:00', title: 'Owner onboarding call' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderBottom: i < 1 ? '1px solid var(--n-border)' : 'none' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--n-mono)', color: 'var(--n-text2)', flexShrink: 0, width: 38 }}>{m.time}</span>
                <span style={{ fontSize: 12, color: 'var(--n-text)' }}>{m.title}</span>
              </div>
            ))}
          </div>

          {/* QA Pending */}
          {qaPending.length > 0 && (
            <div style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', borderBottom: '1px solid var(--n-border)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--n-text3)' }}>QA Pending</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'var(--n-bg3)', color: 'var(--n-text2)', border: '1px solid var(--n-border2)' }}>{qaPending.length}</span>
              </div>
              {qaPending.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < qaPending.length - 1 ? '1px solid var(--n-border)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text)' }}>{item.property}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text2)' }}>{item.cleaner}</div>
                  </div>
                  <button
                    onClick={() => setQaReviewItem(item)}
                    style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}
                  >Review</button>
                </div>
              ))}
            </div>
          )}

          {/* Pending POs */}
          {pendingPOApprovals.length > 0 && (
            <div style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', borderBottom: '1px solid var(--n-border)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--n-text3)' }}>Pending POs</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'var(--n-bg3)', color: 'var(--n-text2)', border: '1px solid var(--n-border2)' }}>{pendingPOApprovals.length}</span>
              </div>
              {pendingPOApprovals.slice(0, 3).map((po, i) => (
                <div key={po.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < Math.min(pendingPOApprovals.length, 3) - 1 ? '1px solid var(--n-border)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--n-text)', fontFamily: 'var(--n-mono)' }}>{po.poNumber}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text2)' }}>{po.vendor}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--n-text)', flexShrink: 0, fontFamily: 'var(--n-mono)' }}>{po.total.toLocaleString()} {po.currency}</span>
                  <button
                    onClick={() => { setPendingPOApprovals(p => p.filter(x => x.id !== po.id)); showToast(`PO ${po.poNumber} approved`) }}
                    style={{ height: 26, padding: '0 10px', borderRadius: 5, border: 'none', background: 'var(--n-green-bg)', color: 'var(--n-green)', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >Approve</button>
                  <button
                    onClick={() => { setPendingPOApprovals(p => p.filter(x => x.id !== po.id)); showToast('Changes requested') }}
                    style={{ height: 26, padding: '0 10px', borderRadius: 5, border: '1px solid var(--n-border)', background: 'transparent', color: 'var(--n-text2)', fontSize: 11, cursor: 'pointer', flexShrink: 0 }}
                  >Changes</button>
                </div>
              ))}
            </div>
          )}

          {/* Field Reports */}
          {fieldReports.length > 0 && (
            <div style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', borderBottom: '1px solid var(--n-border)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--n-text3)' }}>Field Reports</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'var(--n-bg3)', color: 'var(--n-text2)', border: '1px solid var(--n-border2)' }}>{fieldReports.length}</span>
              </div>
              {fieldReports.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < fieldReports.length - 1 ? '1px solid var(--n-border)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text)' }}>{r.issueType}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text2)' }}>{r.property} · {r.reporter}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: r.urgency === 'Urgent' ? 'var(--n-red-bg)' : 'var(--n-bg3)', color: r.urgency === 'Urgent' ? 'var(--n-red)' : 'var(--n-text3)' }}>{r.urgency}</span>
                </div>
              ))}
            </div>
          )}

          {/* Owner Work Orders */}
          {ownerWorkOrders.length > 0 && (
            <div style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', borderBottom: '1px solid var(--n-border)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--n-text3)' }}>Owner Work Orders</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: 'var(--n-bg3)', color: 'var(--n-text2)', border: '1px solid var(--n-border2)' }}>{ownerWorkOrders.length}</span>
              </div>
              {ownerWorkOrders.map((wo, i) => (
                <div key={wo.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < ownerWorkOrders.length - 1 ? '1px solid var(--n-border)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--n-text)' }}>{wo.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--n-text2)' }}>{wo.property} · {wo.requestedBy}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: 'var(--n-red-bg)', color: 'var(--n-red)' }}>Owner</span>
                </div>
              ))}
            </div>
          )}

        </div>
        {/* ═══ end LEFT COLUMN ═══════════════════════════════════════════════════ */}

        {/* ═══ RIGHT COLUMN — monitor zone ═══════════════════════════════════════ */}
        <div className="dash-right" style={{ background: 'var(--n-card)', border: '1px solid var(--n-border)', borderRadius: 8 }}>

          {/* Check-ins */}
          <Collapsible
            title="Today's Check-ins"
            meta={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--n-text2)' }}>1 ready · 1 at risk ·</span>
                <span style={{
                  fontFamily: 'var(--n-mono)', fontSize: 11,
                  color: countdownSec < 60 ? 'var(--n-red)' : 'var(--n-amber)',
                  fontWeight: countdownSec < 60 ? 700 : 400,
                }}>
                  {fmtCountdown(countdownSec)}
                </span>
              </span>
            }
            defaultOpen={true}
          >
            {checkInJobs.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--n-text2)', padding: '10px 12px' }}>No check-ins scheduled today</div>
            ) : checkInJobs.map((job, i) => {
              const isAtRisk = i === 1
              return (
                <div key={i} style={{ padding: '8px 12px', borderTop: i > 0 ? '1px solid var(--n-border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--n-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.propertyName}</div>
                      <div style={{ fontSize: 11, color: 'var(--n-text2)' }}>{job.reservation?.guestName ?? 'Guest'}</div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                      background: isAtRisk ? 'var(--n-amber-bg)' : 'var(--n-green-bg)',
                      color: isAtRisk ? 'var(--n-amber)' : 'var(--n-green)',
                      border: `1px solid ${isAtRisk ? 'var(--n-amber-border)' : 'var(--n-green-border)'}`,
                      flexShrink: 0,
                    }}>
                      {isAtRisk ? 'At risk' : 'Ready'}
                    </span>
                  </div>
                  {isAtRisk && (
                    <div style={{ fontSize: 10, color: 'var(--n-amber)', marginTop: 4 }}>Cleaning finishes at 17:00</div>
                  )}
                </div>
              )
            })}
          </Collapsible>

          {/* Live Feed — liveMode: flex:1 grow */}
          <Collapsible
            title="Live Feed"
            meta={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="live-dot" />
                <span style={{ color: 'var(--n-text2)' }}>{feedBlocked} blocked · {feedActive} active</span>
              </span>
            }
            defaultOpen={true}
            liveMode
          >
            {/* Feed tabs */}
            <div style={{ display: 'flex', gap: 2, padding: '6px 8px', flexShrink: 0, borderBottom: '1px solid var(--n-border)' }}>
              {(['all', 'in_progress', 'issues'] as FeedTab[]).map(tab => (
                <button key={tab} onClick={() => setFeedTab(tab)} style={{
                  flex: 1, padding: '4px 0', fontSize: 10, fontWeight: feedTab === tab ? 600 : 400,
                  borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: feedTab === tab ? `${accent}18` : 'transparent',
                  color: feedTab === tab ? accent : 'var(--n-text3)',
                }}>
                  {tab === 'all' ? 'All' : tab === 'in_progress' ? 'In Progress' : 'Issues'}
                </button>
              ))}
            </div>
            {/* Feed items */}
            {filterFeed(FEED_ITEMS, feedTab).map((item, i, arr) => {
              const dot = feedDotColor(item.type)
              const status = feedStatusStyle(item.type)
              const isEnRoute = item.type === 'en_route'
              return (
                <div key={item.id} className="feed-item-enter" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 12px', borderBottom: i < arr.length - 1 ? '1px solid var(--n-border)' : 'none' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600, color: 'var(--n-text)' }}>{item.actor}</span>
                      <span style={{ color: 'var(--n-text2)' }}> — {item.action} {item.property}</span>
                      {item.detail && <span style={{ color: 'var(--n-text3)' }}> · {item.detail}</span>}
                    </div>
                    {item.type === 'in_progress' && item.progress !== undefined && (
                      <div style={{ marginTop: 5, height: 3, borderRadius: 2, background: 'var(--n-bg3)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${item.progress}%`, background: 'linear-gradient(90deg,var(--n-green),var(--n-green2))', borderRadius: 2 }} />
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: 'var(--n-text3)', marginTop: 3 }}>{item.time}</div>
                  </div>
                  {status && (
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: status.bg, color: status.fg, flexShrink: 0, alignSelf: 'flex-start' }}>
                      {status.label}
                    </span>
                  )}
                  {isEnRoute && (
                    <span style={{ fontSize: 10, color: 'var(--n-green2)', flexShrink: 0, alignSelf: 'flex-start', fontWeight: 600 }}>En route</span>
                  )}
                </div>
              )
            })}
          </Collapsible>

          {/* Owner Approvals */}
          <Collapsible
            title="Owner Approvals"
            meta={
              pendingApprovals.length > 0
                ? <span style={{ color: 'var(--n-amber)', fontFamily: 'var(--n-mono)' }}>
                    {totalApprovalAmt.toLocaleString()} NOK · {pendingApprovals.length}
                  </span>
                : undefined
            }
            defaultOpen={true}
          >
            {pendingApprovals.length === 0 ? (
              <div style={{ padding: '12px', fontSize: 12, color: 'var(--n-text2)', textAlign: 'center' }}>No pending approvals</div>
            ) : pendingApprovals.map((a, i) => (
              <div key={a.id} style={{ padding: '10px 12px', borderBottom: i < pendingApprovals.length - 1 ? '1px solid var(--n-border)' : 'none', borderLeft: '2px solid var(--n-amber)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--n-text)', flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--n-amber)', flexShrink: 0, fontFamily: 'var(--n-mono)' }}>{a.amount.toLocaleString()} {a.currency}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--n-text2)', marginBottom: 8 }}>{a.property} · {a.category}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => { setPendingApprovals(p => p.filter(x => x.id !== a.id)); showToast('Approved — owner notified') }}
                    style={{ flex: 1, height: 26, borderRadius: 5, border: 'none', background: 'var(--n-green)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >Approve</button>
                  <button
                    onClick={() => showToast('Invoiced later')}
                    style={{ flex: 1, height: 26, borderRadius: 5, border: '1px solid var(--n-blue-border)', background: 'var(--n-blue-bg)', color: 'var(--n-blue)', fontSize: 11, cursor: 'pointer' }}
                  >Invoice Later</button>
                  <button
                    onClick={() => showToast('Follow-up sent')}
                    style={{ flex: 1, height: 26, borderRadius: 5, border: '1px solid var(--n-border2)', background: 'transparent', color: 'var(--n-text2)', fontSize: 11, cursor: 'pointer' }}
                  >Follow-Up</button>
                </div>
              </div>
            ))}
          </Collapsible>

        </div>
        {/* ═══ end RIGHT COLUMN ══════════════════════════════════════════════════ */}

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
            <button onClick={() => qaReviewItem && handleQaAction(qaReviewItem.id, 'redo')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid var(--n-red)', background: 'transparent', color: 'var(--n-red)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Flag for Redo</button>
            <button onClick={() => qaReviewItem && handleQaAction(qaReviewItem.id, 'approved')} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: 'var(--n-green)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--n-green)', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

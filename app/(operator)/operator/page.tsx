'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, ChevronDown, ChevronUp, ChevronRight,
  Star, ShoppingCart, X,
} from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { REQUESTS } from '@/lib/data/requests'
import { PROPERTIES } from '@/lib/data/properties'
import { STOCK_ITEMS, PURCHASE_ORDERS, PROPERTY_CHECKINS } from '@/lib/data/inventory'
import { GUEST_ISSUES, getActiveIssues, getTotalRefunds, getRedFlagProperties, fmtNok } from '@/lib/data/guestServices'
import { APPROVALS, type Approval } from '@/lib/data/approvals'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import { UPSELL_APPROVAL_REQUESTS } from '@/lib/data/upsellApprovals'
import { useRole } from '@/context/RoleContext'

// ─── Team clock status (same as staff dashboard) ────────────────────────────
const TEAM_CLOCK_STATUS = [
  { id: 'ms', name: 'Maria S.',  initials: 'MS', avatarBg: '#d97706', role: 'Cleaning',       property: 'Ocean View Apt', clockedIn: true,  late: false },
  { id: 'bl', name: 'Bjorn L.', initials: 'BL', avatarBg: '#0ea5e9', role: 'Maintenance',    property: 'Sunset Villa',   clockedIn: false, late: true  },
  { id: 'fn', name: 'Fatima N.',initials: 'FN', avatarBg: '#ec4899', role: 'Guest Services',  property: 'Remote',         clockedIn: true,  late: false },
  { id: 'jl', name: 'Johan L.', initials: 'JL', avatarBg: '#6b7280', role: 'Cleaning',       property: 'Harbor Studio',  clockedIn: false, late: false },
]

// ─── Activity feed data ──────────────────────────────────────────────────────
const ACTIVITY_ITEMS = [
  { time: '2 min ago', actor: 'Anna Hansen', action: 'marked task complete', detail: 'Cleaning — Sunset Villa', color: '#10b981' },
  { time: '14 min ago', actor: 'Lars Eriksen', action: 'logged a guest issue', detail: 'Noise complaint — Harbor Studio', color: '#ef4444' },
  { time: '31 min ago', actor: 'Sofia Berg', action: 'submitted field report', detail: 'Broken window latch — Ocean View Apt', color: '#d97706' },
  { time: '1h ago', actor: 'Operator', action: 'approved refund', detail: '750 NOK — Downtown Loft', color: '#6366f1' },
  { time: '2h ago', actor: 'Magnus Dahl', action: 'clocked in', detail: 'Staff portal', color: '#7c3aed' },
]

interface FieldReport {
  id: string; property: string; issueType: string; urgency: 'Urgent' | 'Standard'; description: string; reporter: string; time: string
}
interface QaPendingItem {
  id: string; taskId: string; property: string; propertyId: string; cleaner: string; rating: number; notes: string; photos: string[]; submittedAt: string; qaStatus: 'pending' | 'approved' | 'redo'
}

// ─── Accordion section ───────────────────────────────────────────────────────
function AccordionSection({ id, title, count, open, onToggle, children }: {
  id: string; title: string; count: number; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', height: 40, display: 'flex', alignItems: 'center', gap: 8,
          padding: '0 16px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: open ? '1px solid var(--border)' : 'none',
        }}
      >
        {open ? <ChevronUp size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />}
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        {count > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {count}
          </span>
        )}
      </button>
      {open && <div style={{ padding: '12px 16px' }}>{children}</div>}
    </div>
  )
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
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [pendingPOApprovals, setPendingPOApprovals] = useState(
    PURCHASE_ORDERS.filter(po => po.approvalTier === 'manager' && po.approvalStatus === 'pending')
  )

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    try { const s = localStorage.getItem('nestops_field_reports'); if (s) setFieldReports(JSON.parse(s)) } catch {}
    try { const s = localStorage.getItem('nestops_owner_work_orders'); if (s) setOwnerWorkOrders(JSON.parse(s)) } catch {}
    try { const s = localStorage.getItem('nestops_qa_pending'); if (s) setQaPending(JSON.parse(s)) } catch {}
    setMounted(true)
  }, [])

  const handleQaAction = (id: string, action: 'approved' | 'redo') => {
    const updated = qaPending.map(q => q.id === id ? { ...q, qaStatus: action } : q).filter(q => q.qaStatus === 'pending')
    setQaPending(updated)
    try { localStorage.setItem('nestops_qa_pending', JSON.stringify(updated)) } catch {}
    setQaReviewItem(null)
    showToast(action === 'approved' ? '✓ Cleaning approved' : 'Flag sent — cleaner notified to redo')
  }

  // ─── Derived counts ────────────────────────────────────────────────────────
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const totalRefunds = getTotalRefunds(GUEST_ISSUES)
  const redFlags = getRedFlagProperties(GUEST_ISSUES)
  const lowStock = STOCK_ITEMS.filter(i => i.status === 'low' || i.status === 'critical' || i.status === 'out')
  const pendingUpsells = UPSELL_APPROVAL_REQUESTS.filter(r => r.status === 'pending_cleaner' || r.status === 'pending_supervisor')

  // Check-ins / check-outs from JOBS
  const checkInJobs = JOBS.filter(j => j.checkinTime)
  const checkOutJobs = JOBS.filter(j => j.checkoutTime)
  const checkInNames = [...new Set(checkInJobs.map(j => j.propertyName))].join(', ')
  const checkOutNames = [...new Set(checkOutJobs.map(j => j.propertyName))].join(', ')

  if (!mounted) return (
    <div style={{ padding: 24 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 48, borderRadius: 8, background: 'var(--bg-card)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )

  // ─── KPI chips ─────────────────────────────────────────────────────────────
  const KPI_CHIPS = [
    { label: 'Open Issues',       value: activeIssues.length,       dot: activeIssues.length > 0 ? '#ef4444' : '#10b981',  href: '/operator/guest-services/issues' },
    { label: 'Owner Approvals',   value: pendingApprovals.length,   dot: pendingApprovals.length > 0 ? '#d97706' : '#10b981', href: '/owner/approvals' },
    { label: 'Check-ins Today',   value: checkInJobs.length,        dot: '#10b981',                                          href: '/operator/team' },
    { label: 'Check-outs Today',  value: checkOutJobs.length,       dot: '#d97706',                                          href: '/operator/team' },
    { label: 'Upsell Requests',   value: pendingUpsells.length,     dot: pendingUpsells.length > 0 ? '#d97706' : '#10b981', href: '/operator/upsells' },
    { label: 'Pending POs',       value: pendingPOApprovals.length, dot: pendingPOApprovals.length > 0 ? '#d97706' : '#10b981', href: '/operator/inventory' },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Operations overview" />

      {/* ─── KPI Chips ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, marginTop: 4 }}>
        {KPI_CHIPS.map(chip => (
          <Link
            key={chip.label}
            href={chip.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: 48, padding: '10px 16px', borderRadius: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              textDecoration: 'none', flex: '1 1 130px', minWidth: 120,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = chip.dot)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: chip.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{chip.value}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.2 }}>{chip.label}</span>
          </Link>
        ))}
      </div>

      {/* ─── Pre-check-in Stock Alert ──────────────────────────────────────── */}
      {(() => {
        const today = new Date('2026-03-19')
        const urgentCheckins = PROPERTY_CHECKINS.filter(ci => {
          const checkin = new Date(ci.date)
          const hours = (checkin.getTime() - today.getTime()) / 3600000
          return hours <= 72 && ci.stockItemIds.some(id => {
            const item = STOCK_ITEMS.find(s => s.id === id)
            return item && (item.status === 'low' || item.status === 'critical' || item.status === 'out')
          })
        })
        if (!urgentCheckins.length) return null
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, marginBottom: 20 }}>
            <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>Pre-check-in Stock Alert — </span>
              <span style={{ fontSize: 13, color: '#ef4444' }}>
                {urgentCheckins.map(ci => {
                  const lowItems = ci.stockItemIds.map(id => STOCK_ITEMS.find(s => s.id === id)).filter(i => i && i.status !== 'ok').map(i => i!.name)
                  const checkin = new Date(ci.date)
                  const hours = Math.round((checkin.getTime() - today.getTime()) / 3600000)
                  return `${ci.property} check-in in ${hours}h — low: ${lowItems.join(', ')}`
                }).join(' · ')}
              </span>
            </div>
            <Link href="/operator/inventory?tab=alerts" style={{ fontSize: 12, color: '#ef4444', textDecoration: 'none', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
              Restock →
            </Link>
          </div>
        )
      })()}

      {/* ─── Outer layout: main + activity sidebar ─────────────────────────── */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Main 2-col grid ────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Owner Approvals compact list */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Owner Approvals</span>
                  {pendingApprovals.length > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10, background: accent, color: '#fff' }}>
                      {pendingApprovals.length}
                    </span>
                  )}
                </div>
                <Link href="/owner/approvals" style={{ fontSize: 12, color: accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                  Owner portal <ChevronRight size={12} />
                </Link>
              </div>

              {pendingApprovals.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  ✓ No pending owner approvals
                </div>
              ) : (
                <div>
                  {pendingApprovals.slice(0, 5).map((a, i) => (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        height: 44, borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.property} · {a.category}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {a.amount.toLocaleString()} {a.currency}
                      </span>
                      <button
                        onClick={() => { setPendingApprovals(p => p.filter(x => x.id !== a.id)); showToast('Approved — owner notified') }}
                        style={{ height: 28, width: 60, borderRadius: 6, border: 'none', background: '#16a34a1a', color: '#34d399', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                      >✓</button>
                      <button
                        onClick={() => { setPendingApprovals(p => p.filter(x => x.id !== a.id)); showToast('Dismissed') }}
                        style={{ height: 28, width: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      ><X size={12} /></button>
                    </div>
                  ))}
                  {pendingApprovals.length > 5 && (
                    <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                      <Link href="/owner/approvals" style={{ fontSize: 12, color: accent, textDecoration: 'none' }}>
                        View all {pendingApprovals.length} →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Today's Operations card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>

              {/* Sub-section A: Today's Schedule */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>Today&apos;s Schedule</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 32 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)', width: 76, flexShrink: 0 }}>Check-ins</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981', flexShrink: 0 }}>{checkInJobs.length}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{checkInNames || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 32 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)', width: 76, flexShrink: 0 }}>Check-outs</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#d97706', flexShrink: 0 }}>{checkOutJobs.length}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{checkOutNames || '—'}</span>
                </div>
              </div>

              {/* Sub-section B: Upsell Requests */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Upsell Requests</span>
                  {pendingUpsells.length > 3 && (
                    <Link href="/operator/upsells" style={{ fontSize: 11, color: accent, textDecoration: 'none' }}>View all →</Link>
                  )}
                </div>
                {pendingUpsells.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)', padding: '4px 0' }}>No pending upsell requests</div>
                ) : (
                  pendingUpsells.slice(0, 3).map(req => (
                    <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: '0 0 auto', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.upsellTitle}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.propertyName}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-subtle)', flexShrink: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.guestName}</span>
                      <Link href="/operator/upsells" style={{ fontSize: 11, color: '#d97706', textDecoration: 'none', fontWeight: 600, flexShrink: 0 }}>Review →</Link>
                    </div>
                  ))
                )}
              </div>

              {/* Sub-section C: Pending POs */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Pending POs</span>
                  {pendingPOApprovals.length > 3 && (
                    <Link href="/operator/inventory" style={{ fontSize: 11, color: accent, textDecoration: 'none' }}>View all →</Link>
                  )}
                </div>
                {pendingPOApprovals.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)', padding: '4px 0' }}>No pending POs</div>
                ) : (
                  pendingPOApprovals.slice(0, 3).map(po => (
                    <div key={po.id} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', flexShrink: 0 }}>{po.poNumber}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{po.vendor}{po.requester ? ` · ${po.requester}` : ''}</span>
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
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Who's Online — Staff Strip ──────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            height: 56, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '0 16px',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', flexShrink: 0 }}>On Duty</span>
            <div style={{ display: 'flex', gap: 16, flex: 1, overflowX: 'auto' }}>
              {TEAM_CLOCK_STATUS.slice(0, 6).map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: member.avatarBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {member.initials}
                    </div>
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 8, height: 8, borderRadius: '50%',
                      background: member.clockedIn ? '#10b981' : member.late ? '#ef4444' : '#6b7280',
                      border: '1px solid var(--bg-card)',
                    }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: member.late ? '#d97706' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>{member.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{member.role}</div>
                  </div>
                </div>
              ))}
              {TEAM_CLOCK_STATUS.length > 6 && (
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>+{TEAM_CLOCK_STATUS.length - 6} more</div>
              )}
            </div>
            <Link href="/operator/team?tab=daily" style={{ fontSize: 12, color: accent, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
              Full view <ChevronRight size={12} />
            </Link>
          </div>

          {/* ── Secondary Accordions (below fold) ──────────────────────────── */}
          <div>
            {/* Open Issues */}
            <AccordionSection id="issues" title="Open Issues" count={activeIssues.length} open={openSection === 'issues'} onToggle={() => setOpenSection(s => s === 'issues' ? null : 'issues')}>
              {activeIssues.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>No open issues</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {activeIssues.slice(0, 8).map((issue, i) => (
                    <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < activeIssues.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{issue.propertyName} · {issue.assignedTo ?? 'Unassigned'}</div>
                      </div>
                      <StatusBadge status={issue.severity} />
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            {/* Low Stock */}
            <AccordionSection id="stock" title="Low Stock" count={lowStock.length} open={openSection === 'stock'} onToggle={() => setOpenSection(s => s === 'stock' ? null : 'stock')}>
              {lowStock.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>All stock levels OK</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {lowStock.map((item, i) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: i < lowStock.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.inStock} / {item.minLevel} {item.unit}</div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            {/* Guest Issues */}
            <AccordionSection id="guest" title="Guest Issues" count={activeIssues.length} open={openSection === 'guest'} onToggle={() => setOpenSection(s => s === 'guest' ? null : 'guest')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Active issues', value: activeIssues.length, color: activeIssues.length > 3 ? '#ef4444' : 'var(--text-primary)' },
                  { label: 'Total refunded', value: fmtNok(totalRefunds), color: 'var(--text-primary)' },
                  { label: 'Flagged properties', value: redFlags.length, color: redFlags.length > 0 ? '#ef4444' : '#10b981' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
                  </div>
                ))}
                <Link href="/operator/guest-services" style={{ fontSize: 12, color: accent, textDecoration: 'none', marginTop: 4 }}>View guest services →</Link>
              </div>
            </AccordionSection>

            {/* Work Orders */}
            <AccordionSection
              id="workorders"
              title="Work Orders"
              count={REQUESTS.filter(r => r.status !== 'resolved').length + ownerWorkOrders.length}
              open={openSection === 'workorders'}
              onToggle={() => setOpenSection(s => s === 'workorders' ? null : 'workorders')}
            >
              {REQUESTS.filter(r => r.status !== 'resolved').length === 0 && ownerWorkOrders.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>No open work orders</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[...ownerWorkOrders.slice(0, 3).map(wo => ({ title: wo.title, sub: `${wo.property} · ${wo.requestedBy}`, tag: 'Owner Approval', tagColor: '#ef4444' })),
                    ...REQUESTS.filter(r => r.status !== 'resolved').slice(0, 3).map(r => {
                      const prop = PROPERTIES.find(p => p.id === r.propertyId)
                      return { title: r.title, sub: `${prop?.name ?? r.propertyId} · ${r.type}`, tag: r.requiresOwnerApproval ? 'Owner Approval' : 'Operator', tagColor: r.requiresOwnerApproval ? '#ef4444' : accent }
                    }),
                  ].map((wo, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wo.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{wo.sub}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: `${wo.tagColor}18`, color: wo.tagColor, flexShrink: 0 }}>{wo.tag}</span>
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            {/* Field Reports — only when data exists */}
            {fieldReports.length > 0 && (
              <AccordionSection id="field" title="Field Reports" count={fieldReports.length} open={openSection === 'field'} onToggle={() => setOpenSection(s => s === 'field' ? null : 'field')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {fieldReports.map((r, i) => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < fieldReports.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{r.issueType}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.property} · {r.reporter}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: r.urgency === 'Urgent' ? '#ef444418' : '#6b728018', color: r.urgency === 'Urgent' ? '#ef4444' : '#6b7280' }}>{r.urgency}</span>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}

            {/* QA Pending — only when data exists */}
            {qaPending.length > 0 && (
              <AccordionSection id="qa" title="QA Pending" count={qaPending.length} open={openSection === 'qa'} onToggle={() => setOpenSection(s => s === 'qa' ? null : 'qa')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {qaPending.map((item, i) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < qaPending.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.property}</div>
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
              </AccordionSection>
            )}
          </div>
        </div>

        {/* ── ACTIVITY SIDEBAR ─────────────────────────────────────────────── */}
        <div style={{
          width: 280, flexShrink: 0,
          position: 'sticky', top: 0,
          height: 'calc(100vh - 52px)',
          overflowY: 'auto',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            position: 'sticky', top: 0,
            background: 'var(--bg-card)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Activity</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: '#10b98118', color: '#10b981', border: '1px solid #10b98130' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Live
            </span>
          </div>

          {/* Feed items */}
          <div style={{ padding: '4px 0' }}>
            {ACTIVITY_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 16px',
                  borderBottom: i < ACTIVITY_ITEMS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  minHeight: 48,
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.actor}</span>
                    <span style={{ color: 'var(--text-muted)' }}> {item.action}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>— {item.detail}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>{item.time}</div>
                </div>
              </div>
            ))}
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

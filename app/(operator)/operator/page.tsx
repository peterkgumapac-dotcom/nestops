'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Users, Ticket, Package, AlertTriangle, Headphones, ChevronRight, CheckCircle, ShieldAlert, Wrench, ClipboardList, FileText, Star, ChevronDown, ChevronUp, Activity } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import DataTable from '@/components/shared/DataTable'
import type { Column } from '@/components/shared/DataTable'
import { REQUESTS } from '@/lib/data/requests'
import { OWNERS } from '@/lib/data/owners'
import { PROPERTIES } from '@/lib/data/properties'
import { STOCK_ITEMS } from '@/lib/data/inventory'
import { GUEST_ISSUES, getActiveIssues, getTotalRefunds, getRedFlagProperties, fmtNok } from '@/lib/data/guestServices'
import { APPROVALS, type Approval } from '@/lib/data/approvals'
import { COMPLIANCE_DOCS } from '@/lib/data/compliance'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import { useRole } from '@/context/RoleContext'

const recentRequests = REQUESTS.slice(0, 5).map(r => ({
  ...r,
  propertyName: PROPERTIES.find(p => p.id === r.propertyId)?.name ?? r.propertyId,
  ownerName: OWNERS.find(o => o.id === r.ownerId)?.name ?? r.ownerId,
}))

type RequestRow = typeof recentRequests[0]

interface FieldReport {
  id: string
  property: string
  issueType: string
  urgency: 'Urgent' | 'Standard'
  description: string
  reporter: string
  time: string
}

interface QaPendingItem {
  id: string
  taskId: string
  property: string
  propertyId: string
  cleaner: string
  rating: number
  notes: string
  photos: string[]
  submittedAt: string
  qaStatus: 'pending' | 'approved' | 'redo'
}

export default function OperatorDashboard() {
  const { accent } = useRole()
  const [mounted, setMounted] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>(APPROVALS)
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([])
  const [ownerWorkOrders, setOwnerWorkOrders] = useState<{id:string; title:string; property:string; requestedBy:string; requestedDate:string}[]>([])
  const [qaPending, setQaPending] = useState<QaPendingItem[]>([])
  const [qaReviewItem, setQaReviewItem] = useState<QaPendingItem | null>(null)
  const [toast, setToast] = useState('')
  const [activityOpen, setActivityOpen] = useState(true)
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // Read field reports, owner work orders, and QA pending from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nestops_field_reports')
      if (stored) setFieldReports(JSON.parse(stored))
    } catch {}
    try {
      const wo = localStorage.getItem('nestops_owner_work_orders')
      if (wo) setOwnerWorkOrders(JSON.parse(wo))
    } catch {}
    try {
      const qa = localStorage.getItem('nestops_qa_pending')
      if (qa) setQaPending(JSON.parse(qa))
    } catch {}
    setMounted(true)
  }, [])

  const handleQaAction = (id: string, action: 'approved' | 'redo') => {
    const updated = qaPending.map(q => q.id === id ? { ...q, qaStatus: action } : q).filter(q => q.qaStatus === 'pending')
    setQaPending(updated)
    try { localStorage.setItem('nestops_qa_pending', JSON.stringify(updated)) } catch {}
    setQaReviewItem(null)
    showToast(action === 'approved' ? '✓ Cleaning approved' : 'Flag sent — cleaner notified to redo')
  }

  const columns: Column<RequestRow>[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'type', label: 'Type', render: r => <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)', fontSize: 13 }}>{r.type}</span> },
    { key: 'propertyName', label: 'Property', sortable: true },
    { key: 'ownerName', label: 'Owner', sortable: true },
    { key: 'date', label: 'Date', sortable: true, render: r => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.date}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'priority', label: 'Priority', render: r => <StatusBadge status={r.priority} /> },
  ]

  const lowStock   = STOCK_ITEMS.filter(i => i.status === 'low' || i.status === 'critical' || i.status === 'out')
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const totalRefunds = getTotalRefunds(GUEST_ISSUES)
  const redFlags     = getRedFlagProperties(GUEST_ISSUES)
  const complianceAlerts = COMPLIANCE_DOCS.filter(d => d.status === 'expired' || d.status === 'expiring' || d.status === 'missing')
  const todayJobs = JOBS.filter(j => j.status !== 'done').slice(0, 5)

  const handleDismissApproval = (id: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id))
    showToast('Approval dismissed')
  }

  const handleApproveApproval = (id: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id))
    showToast('Approved — owner notified')
  }

  if (!mounted) return (
    <div style={{ padding: 24 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 80, borderRadius: 10, background: 'var(--bg-card)', marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Operations overview" />

      {/* Quick Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Open Issues', value: activeIssues.length, href: '/operator/guest-services/issues', color: activeIssues.length > 3 ? '#ef4444' : accent },
          { label: 'Pending Approvals', value: pendingApprovals.length, href: '/operator/approvals', color: pendingApprovals.length > 0 ? '#d97706' : accent },
          { label: 'Cleanings Today', value: todayJobs.length, href: '/operator/team', color: accent },
          { label: 'Low Stock', value: lowStock.length, href: '/operator/inventory', color: lowStock.length > 0 ? '#f97316' : accent },
        ].map(({ label, value, href, color }) => (
          <Link
            key={label}
            href={href}
            style={{
              display: 'flex', flexDirection: 'column', gap: 4,
              padding: '12px 14px', borderRadius: 10,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              textDecoration: 'none', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = color)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
          >
            <span style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
          </Link>
        ))}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Properties" value={PROPERTIES.length} icon={Building2} subtitle="Across all owners" />
        <StatCard label="Active Owners" value={OWNERS.filter(o => o.status === 'active').length} icon={Users} subtitle="Currently managing" />
        <StatCard label="Open Requests" value={REQUESTS.filter(r => r.status === 'open').length} icon={Ticket} subtitle="Awaiting action" />
        <StatCard label="Low Stock Items" value={lowStock.length} icon={Package} subtitle="Needs restocking" />
        <StatCard label="Active Issues" value={activeIssues.length} icon={Headphones} subtitle="Guest issues open" />
        <StatCard label="Pending Approvals" value={pendingApprovals.length} icon={CheckCircle} subtitle="Owner decisions" />
        <StatCard label="Compliance Alerts" value={complianceAlerts.length} icon={ShieldAlert} subtitle="Docs expiring/missing" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, minWidth: 280 }}>
          {/* Recent requests table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Recent Requests</h2>
              <a href="/operator/tickets" style={{ fontSize: 13, color: accent, textDecoration: 'none' }}>View all →</a>
            </div>
            <DataTable columns={columns} data={recentRequests} />
          </div>

          {/* Owner Approvals Panel */}
          <div style={{ background: `${accent}08`, border: `1px solid ${accent}28`, borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={15} style={{ color: accent }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Owner Approvals
                  {pendingApprovals.length > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: accent, color: '#fff' }}>
                      {pendingApprovals.length}
                    </span>
                  )}
                </h3>
              </div>
              <a href="/owner/approvals" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: accent, textDecoration: 'none' }}>
                Owner portal <ChevronRight size={12} />
              </a>
            </div>
            {pendingApprovals.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                ✓ No pending owner approvals
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendingApprovals.map(a => (
                  <div key={a.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{a.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.property} · {a.category}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{a.amount.toLocaleString()} {a.currency}</div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 8px' }}>{a.description}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleApproveApproval(a.id)} style={{ flex: 1, padding: '6px', borderRadius: 6, border: 'none', background: '#16a34a1a', color: '#34d399', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => handleDismissApproval(a.id)} style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Dismiss</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flexShrink: 0, width: 320, minWidth: 0 }}>
          {/* Owners summary */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Owners</h3>
            {OWNERS.map(owner => (
              <div key={owner.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: accent, flexShrink: 0 }}>
                  {owner.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{owner.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{owner.propertyIds.length} {owner.propertyIds.length === 1 ? 'property' : 'properties'}</div>
                </div>
                <StatusBadge status={owner.status} />
              </div>
            ))}
          </div>

          {/* Today's Jobs */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={14} style={{ color: accent }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Today&apos;s Jobs</h3>
              </div>
              <Link href="/operator/team" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: accent, textDecoration: 'none' }}>
                View all <ChevronRight size={12} />
              </Link>
            </div>
            {todayJobs.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>✓ All jobs complete</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayJobs.map(job => {
                  const staff = STAFF_MEMBERS.find(s => s.id === job.staffId)
                  const priorityColors: Record<string, string> = { urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#6b7280' }
                  return (
                    <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.propertyName} · {job.dueTime}</div>
                        {staff && <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 1 }}>{staff.name}</div>}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: `${priorityColors[job.priority]}18`, color: priorityColors[job.priority], textTransform: 'capitalize', flexShrink: 0 }}>
                        {job.priority}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Work Orders */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} style={{ color: accent }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Work Orders</h3>
              </div>
              <Link href="/app/work-orders" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: accent, textDecoration: 'none' }}>
                View all <ChevronRight size={12} />
              </Link>
            </div>
            {REQUESTS.filter(r => r.status !== 'resolved').length === 0 && ownerWorkOrders.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No open work orders</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ownerWorkOrders.slice(0, 3).map(wo => (
                  <div key={wo.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{wo.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.12)', color: '#ef4444', whiteSpace: 'nowrap', flexShrink: 0 }}>Owner Approval</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{wo.property} · {wo.requestedBy}</div>
                  </div>
                ))}
                {REQUESTS.filter(r => r.status !== 'resolved').slice(0, 3).map(r => {
                  const prop = PROPERTIES.find(p => p.id === r.propertyId)
                  return (
                    <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{r.title}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: r.requiresOwnerApproval ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.12)', color: r.requiresOwnerApproval ? '#ef4444' : accent, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {r.requiresOwnerApproval ? 'Owner Approval' : 'Operator'}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{prop?.name ?? r.propertyId} · {r.type}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Field Reports */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClipboardList size={14} style={{ color: accent }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Field Reports</h3>
              </div>
              {fieldReports.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: '#ef444420', color: '#ef4444' }}>
                  {fieldReports.length} today
                </span>
              )}
            </div>
            {fieldReports.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                No field reports submitted today
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fieldReports.map(r => (
                  <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{r.issueType}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: r.urgency === 'Urgent' ? '#ef444418' : '#6b728018', color: r.urgency === 'Urgent' ? '#ef4444' : '#6b7280' }}>
                        {r.urgency}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.property} · {r.reporter} · {r.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QA Pending */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={14} style={{ color: '#f59e0b' }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  QA Pending
                  {qaPending.length > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: '#f59e0b20', color: '#f59e0b' }}>
                      {qaPending.length}
                    </span>
                  )}
                </h3>
              </div>
            </div>
            {qaPending.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No cleaning reviews pending</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {qaPending.map(item => (
                  <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{item.property}</span>
                      <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.cleaner}</span>
                      <button
                        onClick={() => setQaReviewItem(item)}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, cursor: 'pointer', fontWeight: 500 }}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low stock */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <AlertTriangle size={14} style={{ color: '#f87171' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Low Stock</h3>
            </div>
            {lowStock.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.inStock} / {item.minLevel} {item.unit}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>

          {/* Guest Services widget */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Headphones size={14} style={{ color: accent }} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Guest Issues</h3>
              </div>
              <Link href="/operator/guest-services" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: accent, textDecoration: 'none' }}>
                View <ChevronRight size={12} />
              </Link>
            </div>

            {redFlags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#ef444412', border: '1px solid #ef444430', borderRadius: 7, marginBottom: 10 }}>
                <AlertTriangle size={13} color="#ef4444" />
                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                  {redFlags.length} {redFlags.length === 1 ? 'property' : 'properties'} flagged
                </span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Active issues', value: activeIssues.length, color: activeIssues.length > 3 ? '#ef4444' : 'var(--text-primary)' },
                { label: 'Total refunded', value: fmtNok(totalRefunds), color: 'var(--text-primary)' },
                { label: 'Flagged properties', value: redFlags.length, color: redFlags.length > 0 ? '#ef4444' : '#10b981' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Activity Feed */}
      <div style={{ marginTop: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <button
          onClick={() => setActivityOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '14px 16px',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: activityOpen ? '1px solid var(--border)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} style={{ color: accent }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Activity Feed</span>
            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 10, background: `${accent}20`, color: accent, fontWeight: 600 }}>Live</span>
          </div>
          {activityOpen ? <ChevronUp size={15} style={{ color: 'var(--text-subtle)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-subtle)' }} />}
        </button>

        {activityOpen && (
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { time: '2 min ago', actor: 'Anna Hansen', action: 'marked task complete', detail: 'Cleaning — Sunset Villa', color: '#10b981' },
              { time: '14 min ago', actor: 'Lars Eriksen', action: 'logged a guest issue', detail: 'Noise complaint — Harbor Studio', color: '#ef4444' },
              { time: '31 min ago', actor: 'Sofia Berg', action: 'submitted field report', detail: 'Broken window latch — Ocean View Apt', color: '#d97706' },
              { time: '1h ago', actor: 'Operator', action: 'approved refund', detail: '750 NOK — Downtown Loft', color: '#6366f1' },
              { time: '2h ago', actor: 'Magnus Dahl', action: 'clocked in', detail: 'Staff portal', color: accent },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{item.actor}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}> {item.action} </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>— {item.detail}</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)', flexShrink: 0 }}>{item.time}</span>
              </div>
            ))}
          </div>
        )}
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
                    {'★'.repeat(qaReviewItem.rating)}
                    <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - qaReviewItem.rating)}</span>
                  </div>
                </div>
              </div>
              {qaReviewItem.photos.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Photos</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {qaReviewItem.photos.map((url, i) => (
                      <img key={i} src={url} style={{ width: 90, height: 68, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} alt="qa photo" />
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
            <button
              onClick={() => qaReviewItem && handleQaAction(qaReviewItem.id, 'redo')}
              style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Flag for Redo
            </button>
            <button
              onClick={() => qaReviewItem && handleQaAction(qaReviewItem.id, 'approved')}
              style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Approve
            </button>
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

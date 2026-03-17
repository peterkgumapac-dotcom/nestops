'use client'
import { motion } from 'framer-motion'
import { Building2, Users, Ticket, Package, AlertTriangle, CheckSquare, Clock, Star, CalendarCheck, ChevronRight, Bell } from 'lucide-react'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { REQUESTS } from '@/lib/data/requests'
import { STOCK_ITEMS } from '@/lib/data/inventory'

const TODAY_CLEANINGS = [
  { id: 'c1', property: 'Sunset Villa',    type: 'Checkout clean',  time: '10:00', staff: 'Maria S.',   status: 'scheduled' as const },
  { id: 'c2', property: 'Harbor Studio',   type: 'Mid-stay clean',  time: '13:00', staff: 'Maria S.',   status: 'in_progress' as const },
  { id: 'c3', property: 'Downtown Loft',   type: 'Checkout clean',  time: '15:00', staff: 'Bjorn L.',   status: 'scheduled' as const },
]

const TODAY_TASKS = [
  { id: 't1', title: 'Replace towels — Sunset Villa',    priority: 'medium' as const, assignee: 'Maria S.',   due: 'Today 11:00' },
  { id: 't2', title: 'Fix leaking faucet — Harbor Studio', priority: 'high' as const,  assignee: 'Bjorn L.',  due: 'Today 14:00' },
  { id: 't3', title: 'Restock minibar — Downtown Loft',  priority: 'low'  as const,  assignee: 'Fatima N.', due: 'Today 16:00' },
]

const OVERDUE = [
  { id: 'o1', title: 'Annual fire safety check — Ocean View', daysOverdue: 3, assignee: 'Bjorn L.' },
  { id: 'o2', title: 'Deep clean after guest complaint',      daysOverdue: 1, assignee: 'Maria S.' },
]

const PENDING_APPROVALS = [
  { id: 'a1', title: 'Emergency plumbing repair',   property: 'Harbor Studio', amount: 4800, owner: 'Sarah J.' },
  { id: 'a2', title: 'Replace dishwasher',          property: 'Sunset Villa',  amount: 9200, owner: 'Sarah J.' },
  { id: 'a3', title: 'New outdoor furniture set',   property: 'Ocean View Apt', amount: 6400, owner: 'Michael C.' },
]

const PRIORITY_COLORS: Record<string, string> = {
  high: '#f87171', medium: '#fb923c', low: '#34d399', urgent: '#f43f5e',
}

function SectionHeader({ title, href, linkLabel = 'View all' }: { title: string; href?: string; linkLabel?: string }) {
  const { accent } = useRole()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
      {href && <Link href={href} style={{ fontSize: 13, color: accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>{linkLabel} <ChevronRight size={13} /></Link>}
    </div>
  )
}

export default function AppDashboard() {
  const { accent, role, user } = useRole()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const displayName = user?.name?.split(' ')[0] ?? (role === 'operator' ? 'Peter' : 'there')

  const openRequests = REQUESTS.filter(r => r.status === 'open').length
  const lowStock = STOCK_ITEMS.filter(i => i.status === 'low' || i.status === 'critical' || i.status === 'out')
  const activeProperties = PROPERTIES.filter(p => p.status === 'live').length

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

      {/* Alert bar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <Bell size={14} style={{ color: '#f87171', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
          <strong>2 overdue tasks</strong> and <strong>3 pending owner approvals</strong> need your attention today.
        </span>
        <Link href="/app/operations" style={{ marginLeft: 'auto', fontSize: 12, color: accent, textDecoration: 'none', whiteSpace: 'nowrap' }}>Review →</Link>
      </motion.div>

      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          {greeting}, {displayName} 👋
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {role === 'operator'
            ? `Here's what's happening across your ${PROPERTIES.length} properties today.`
            : `Here are your assignments for today.`}
        </p>
      </div>

      {/* Row 1 stat cards — operator only */}
      {role === 'operator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 16 }}>
          <StatCard label="Active Properties" value={activeProperties} icon={Building2} subtitle={`of ${PROPERTIES.length} total`} />
          <StatCard label="Active Owners" value={OWNERS.filter(o => o.status === 'active').length} icon={Users} subtitle="Currently managing" />
          <StatCard label="Open Requests" value={openRequests} icon={Ticket} subtitle="Awaiting action" />
          <StatCard label="Low Stock" value={lowStock.length} icon={Package} subtitle="Needs restocking" />
        </div>
      )}

      {/* Row 2 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Today's Cleanings" value={TODAY_CLEANINGS.length} icon={CalendarCheck} subtitle="Scheduled" animate={false} />
        <StatCard label="Today's Tasks" value={TODAY_TASKS.length} icon={CheckSquare} subtitle="Assigned" animate={false} />
        <StatCard label="Overdue" value={OVERDUE.length} icon={Clock} subtitle="Needs attention" animate={false} />
        {role === 'operator' && <StatCard label="Pending Approvals" value={PENDING_APPROVALS.length} icon={Star} subtitle="From owners" animate={false} />}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: role === 'operator' ? '1fr 1fr' : '1fr', gap: 24, marginBottom: 24 }}>
        {/* Today's Cleanings */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <SectionHeader title="Today's Cleanings" href="/app/cleaning" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TODAY_CLEANINGS.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.status === 'in_progress' ? accent : '#94a3b8', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.property}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.type} · {c.staff}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.time}</div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <SectionHeader title="Today's Tasks" href="/app/operations" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TODAY_TASKS.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[t.priority] ?? '#94a3b8', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.assignee}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.due}</div>
                <StatusBadge status={t.priority} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: role === 'operator' ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* Overdue */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: 16 }}>
          <SectionHeader title="Overdue" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {OVERDUE.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{o.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.assignee}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#f87171', whiteSpace: 'nowrap' }}>{o.daysOverdue}d overdue</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals — operator only */}
        {role === 'operator' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
            <SectionHeader title="Pending Approvals" href="/app/tickets" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PENDING_APPROVALS.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.property} · {a.owner}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{a.amount.toLocaleString()} NOK</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Requests */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginTop: 24 }}>
        <SectionHeader title="Recent Requests" href="/app/tickets" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Property', 'Owner', 'Date', 'Status', 'Priority'].map(h => (
                  <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {REQUESTS.slice(0, 5).map((r, i) => {
                const prop = PROPERTIES.find(p => p.id === r.propertyId)
                const owner = OWNERS.find(o => o.id === r.ownerId)
                return (
                  <tr key={r.id} style={{ borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{r.title}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{prop?.name ?? r.propertyId}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{owner?.name ?? r.ownerId}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.date}</td>
                    <td style={{ padding: '10px 12px' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '10px 12px' }}><StatusBadge status={r.priority} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  )
}

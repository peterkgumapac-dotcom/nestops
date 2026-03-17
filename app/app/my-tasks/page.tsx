'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Filter, AlertTriangle, Clock } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { useRole } from '@/context/RoleContext'
import type { UserProfile } from '@/context/RoleContext'

interface PersonalTask {
  id: string
  title: string
  type: 'Cleaning' | 'Maintenance' | 'Inspection' | 'Content' | 'Inventory' | 'Onboarding' | 'Compliance'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'overdue' | 'today' | 'this_week' | 'upcoming' | 'completed'
  assignee: string
  propertyName: string
  propertyImage: string
  due: string
  dueDisplay: string
  description?: string
}

const ALL_TASKS: PersonalTask[] = [
  { id: 't1', title: 'Deep clean — Harbor Studio', type: 'Cleaning', priority: 'high', status: 'today', assignee: 'Maria S.', propertyName: 'Harbor Studio', propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=100&q=80', due: '2026-03-17', dueDisplay: 'Today 13:00' },
  { id: 't2', title: 'Update guest welcome pack', type: 'Content', priority: 'medium', status: 'this_week', assignee: 'Maria S.', propertyName: 'Sunset Villa', propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80', due: '2026-03-20', dueDisplay: 'Thu 11:00' },
  { id: 't3', title: 'Annual fire safety check', type: 'Compliance', priority: 'urgent', status: 'overdue', assignee: 'Bjorn L.', propertyName: 'Ocean View Apt', propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80', due: '2026-03-14', dueDisplay: '3 days overdue' },
  { id: 't4', title: 'Fix bathroom extractor fan', type: 'Maintenance', priority: 'high', status: 'today', assignee: 'Bjorn L.', propertyName: 'Harbor Studio', propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=100&q=80', due: '2026-03-17', dueDisplay: 'Today 14:00' },
  { id: 't5', title: 'Inspect heating system', type: 'Maintenance', priority: 'high', status: 'today', assignee: 'Bjorn L.', propertyName: 'Downtown Loft', propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80', due: '2026-03-17', dueDisplay: 'Today 12:00' },
  { id: 't6', title: 'Restock toiletry kits', type: 'Inventory', priority: 'low', status: 'completed', assignee: 'Maria S.', propertyName: 'Sunset Villa', propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&q=80', due: '2026-03-15', dueDisplay: 'Completed Mar 15' },
  { id: 't7', title: 'Guest issue follow-up — Camilla Dahl', type: 'Compliance', priority: 'medium', status: 'today', assignee: 'Fatima N.', propertyName: 'Downtown Loft', propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&q=80', due: '2026-03-17', dueDisplay: 'Today 17:00' },
  { id: 't8', title: 'Quarterly inspection — Ocean View', type: 'Inspection', priority: 'medium', status: 'this_week', assignee: 'Maria S.', propertyName: 'Ocean View Apt', propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=100&q=80', due: '2026-03-19', dueDisplay: 'Thu 10:00' },
]

const USER_ASSIGNEE_MAP: Record<string, string> = {
  'Maria S.': 'Maria S.',
  'Bjorn L.': 'Bjorn L.',
  'Fatima N.': 'Fatima N.',
  'Peter K.': 'Peter K.',
}

const PRIORITY_BORDER: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#3b82f6',
  low: '#6b7280',
}

const STATUS_GROUPS: { key: string; label: string; color: string }[] = [
  { key: 'overdue',   label: 'Overdue',    color: '#ef4444' },
  { key: 'today',     label: 'Today',      color: '#7c3aed' },
  { key: 'this_week', label: 'This Week',  color: '#3b82f6' },
  { key: 'upcoming',  label: 'Upcoming',   color: '#6b7280' },
  { key: 'completed', label: 'Completed',  color: '#10b981' },
]

export default function MyTasksPage() {
  const { accent } = useRole()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)) } catch {}
    }
  }, [])

  const markComplete = (taskId: string) => {
    setCompletedIds(prev => new Set([...prev, taskId]))
  }

  const assigneeName = currentUser ? (USER_ASSIGNEE_MAP[currentUser.name] ?? currentUser.name) : null

  const filteredTasks = useMemo(() => {
    return ALL_TASKS.filter(task => {
      const matchesAssignee = !assigneeName || task.assignee === assigneeName
      const effectiveStatus = completedIds.has(task.id) ? 'completed' : task.status
      const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      return matchesAssignee && matchesStatus && matchesPriority
    })
  }, [assigneeName, statusFilter, priorityFilter, completedIds])

  const statusPills = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'completed', label: 'Completed' },
  ]

  const priorityPills = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="My Tasks" subtitle="All tasks assigned to you" />

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={13} style={{ color: 'var(--text-muted)' }} />
          {statusPills.map(p => (
            <button
              key={p.key}
              onClick={() => setStatusFilter(p.key)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${statusFilter === p.key ? accent : 'var(--border)'}`,
                background: statusFilter === p.key ? `${accent}1a` : 'transparent',
                color: statusFilter === p.key ? accent : 'var(--text-muted)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {priorityPills.map(p => (
            <button
              key={p.key}
              onClick={() => setPriorityFilter(p.key)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${priorityFilter === p.key ? accent : 'var(--border)'}`,
                background: priorityFilter === p.key ? `${accent}1a` : 'transparent',
                color: priorityFilter === p.key ? accent : 'var(--text-muted)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task groups */}
      {filteredTasks.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
          No tasks assigned to you right now.
        </div>
      ) : (
        STATUS_GROUPS.map(group => {
          const groupTasks = filteredTasks.filter(t => {
            const effectiveStatus = completedIds.has(t.id) ? 'completed' : t.status
            return effectiveStatus === group.key
          })
          if (groupTasks.length === 0) return null
          return (
            <div key={group.key} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: group.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {group.label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{groupTasks.length}</span>
              </div>
              {groupTasks.map(task => (
                <motion.div
                  layout
                  key={task.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderLeft: `4px solid ${PRIORITY_BORDER[task.priority]}`,
                    borderRadius: 10,
                    padding: '14px 16px',
                    marginBottom: 8,
                    opacity: completedIds.has(task.id) ? 0.5 : 1,
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
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <StatusBadge status={task.priority} />
                      {!completedIds.has(task.id) && (
                        <button
                          onClick={() => markComplete(task.id)}
                          style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          Mark Complete
                        </button>
                      )}
                      {completedIds.has(task.id) && (
                        <span style={{ fontSize: 11, color: '#10b981' }}>✓ Done</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        })
      )}
    </motion.div>
  )
}

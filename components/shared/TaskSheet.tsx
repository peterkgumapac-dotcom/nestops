'use client'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { X, Check } from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import StatusBadge from '@/components/shared/StatusBadge'

interface TaskItem {
  id: string
  title: string
  type: string
  priority: 'high' | 'medium' | 'low' | 'urgent'
  assignee: string
  due: string
  columnId?: string
  propertyName?: string
  description?: string
}

interface TaskSheetProps {
  task: TaskItem | null
  open: boolean
  onClose: () => void
  onMarkComplete?: (id: string) => void
}

const TYPE_CHECKLIST: Record<string, string[]> = {
  Cleaning: [
    'Strip and replace all bed linens',
    'Clean and disinfect all bathrooms',
    'Vacuum and mop all floors',
    'Wipe all kitchen surfaces and appliances',
    'Restock toiletries and consumables',
    'Check and report any damage',
    'Take before/after photos',
    'Lock up and confirm access code',
  ],
  Maintenance: [
    'Diagnose and document the issue',
    'Take photos of problem area',
    'Source parts or tools needed',
    'Complete repair',
    'Test fix is working',
    'Clean up work area',
    'Update notes with what was done',
    'Notify operator of completion',
  ],
  Inspection: [
    'Check all rooms against checklist',
    'Test all appliances',
    'Check smoke and CO detectors',
    'Document any issues with photos',
    'Submit inspection report',
  ],
}

export default function TaskSheet({ task, open, onClose, onMarkComplete }: TaskSheetProps) {
  const { accent } = useRole()
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<{ text: string; by: string; at: string }[]>([])
  const [completed, setCompleted] = useState(false)

  const checklist = TYPE_CHECKLIST[task?.type ?? ''] ?? []
  const progress = checklist.length > 0 ? Math.round((checkedItems.size / checklist.length) * 100) : 0

  const toggleItem = (i: number) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i); else next.add(i)
      return next
    })
  }

  const addComment = () => {
    if (!comment.trim()) return
    setComments(prev => [...prev, {
      text: comment,
      by: 'You',
      at: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }])
    setComment('')
  }

  const handleMarkComplete = () => {
    setCompleted(true)
    if (task && onMarkComplete) onMarkComplete(task.id)
    setTimeout(onClose, 1000)
  }

  if (!task) return null

  return (
    <Sheet open={open} onOpenChange={isOpen => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        style={{
          width: 480, maxWidth: '90vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', padding: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
            <SheetTitle style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: 1 }}>
              {task.title}
            </SheetTitle>
            <SheetClose style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={15} color="var(--text-muted)" />
            </SheetClose>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${accent}18`, color: accent }}>{task.type}</span>
            <StatusBadge status={task.priority} />
            {task.columnId && <StatusBadge status={task.columnId === 'todo' ? 'open' : task.columnId === 'inprogress' ? 'in_progress' : 'done'} />}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Details */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 10 }}>Details</div>
            {[
              { label: 'Property', value: task.propertyName ?? '—' },
              { label: 'Assignee', value: task.assignee },
              { label: 'Due', value: task.due },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Checklist */}
          {checklist.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Checklist</div>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{checkedItems.size}/{checklist.length} complete</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: accent, borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
              {checklist.map((item, i) => (
                <div
                  key={i}
                  onClick={() => toggleItem(i)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checkedItems.has(i) ? accent : 'var(--border)'}`, background: checkedItems.has(i) ? accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {checkedItems.has(i) && <Check size={10} color="#fff" />}
                  </div>
                  <span style={{ fontSize: 13, color: checkedItems.has(i) ? 'var(--text-subtle)' : 'var(--text-primary)', textDecoration: checkedItems.has(i) ? 'line-through' : 'none' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Comments */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 10 }}>Activity</div>
            {comments.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 10 }}>No comments yet.</div>
            )}
            {comments.map((c, i) => (
              <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{c.by}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{c.at}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{c.text}</p>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addComment()}
                placeholder="Add a comment..."
                style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
              />
              <button onClick={addComment} style={{ padding: '8px 14px', borderRadius: 6, background: accent, color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>Post</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {completed ? (
            <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 600, fontSize: 14 }}>✓ Task marked complete</div>
          ) : (
            <button
              onClick={handleMarkComplete}
              style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Mark Complete
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

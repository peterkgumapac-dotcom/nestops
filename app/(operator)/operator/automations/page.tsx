'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, CheckCircle, AlertCircle, MoreHorizontal, X, Plus } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import { useRole } from '@/context/RoleContext'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'

interface Automation {
  id: string
  name: string
  trigger: string
  action: string
  active: boolean
  properties: string[]
  lastTriggered: string
}

const AUTOMATIONS: Automation[] = [
  { id: 'a1', name: 'Post-Checkout Cleaning',      trigger: 'Guest checkout',               action: 'Create cleaning task → Assign to cleaning staff, due 2hrs after checkout', active: true,  properties: ['All properties'],                              lastTriggered: '2 hours ago' },
  { id: 'a2', name: 'Urgent Maintenance Alert',    trigger: 'Maintenance request (Urgent)',  action: 'Send Slack alert to operator → Assign contractor',                        active: true,  properties: ['All properties'],                              lastTriggered: '1 day ago' },
  { id: 'a3', name: 'Low Stock Restock Reminder',  trigger: 'Inventory falls below minimum', action: 'Send alert to operator → Create purchase task',                          active: true,  properties: ['All warehouses'],                              lastTriggered: '3 days ago' },
  { id: 'a4', name: 'SOP Acknowledgement Nudge',   trigger: 'SOP published + 48hrs',         action: 'Send reminder notification to unacknowledged staff',                     active: true,  properties: ['All SOPs'],                                    lastTriggered: '5 days ago' },
  { id: 'a5', name: 'Pre-Arrival Inspection',      trigger: '24hrs before guest check-in',   action: 'Create inspection task → Assign to maintenance staff',                   active: false, properties: ['Sunset Villa', 'Harbor Studio', '+2 more'],    lastTriggered: 'Never' },
]

const TEMPLATES = [
  { name: 'Guest Checkout → Deep Clean',              icon: '🧹' },
  { name: 'New Booking → Send Welcome SOP to Staff',  icon: '📋' },
  { name: 'Compliance Expiry → Owner Notification',   icon: '⚠️' },
  { name: 'Long Vacancy → Schedule Inspection',       icon: '🔍' },
  { name: 'Bad Review → Create Follow-up Task',       icon: '⭐' },
  { name: 'Seasonal Changeover Checklist',            icon: '🗓️' },
  { name: 'Post-Checkout Review Request',             icon: '⭐' },
  { name: '5★ Review Follow-up + Referral',           icon: '🙏' },
]

const TRIGGER_OPTIONS = [
  'Guest checks out', 'Guest checks in', 'Booking is created', 'Booking is cancelled',
  'Task is completed', 'Task is overdue', 'Request is submitted',
  'Inventory falls below minimum', 'SOP is published',
  'Compliance document expires', 'Property is vacant for X days', 'Manual trigger',
]

const ACTION_TYPES = [
  'Create task', 'Send Slack message', 'Send email notification',
  'Send in-app notification', 'Update task status', 'Assign staff member',
]

interface ConditionRow { id: string; field: string; operator: string; value: string }
interface ActionRow    { id: string; type: string }

const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

export default function AutomationsPage() {
  const { accent } = useRole()
  const [automations, setAutomations] = useState<Automation[]>(AUTOMATIONS)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [conditions, setConditions] = useState<ConditionRow[]>([])
  const [actions, setActions] = useState<ActionRow[]>([{ id: 'act1', type: 'Create task' }])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [builderName, setBuilderName] = useState('')
  const [nameError, setNameError] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const toggleActive = (id: string) => setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))

  const addCondition = () => setConditions(prev => [...prev, { id: Date.now().toString(), field: 'Property', operator: 'is', value: '' }])
  const removeCondition = (id: string) => setConditions(prev => prev.filter(c => c.id !== id))
  const addAction = () => { if (actions.length < 3) setActions(prev => [...prev, { id: Date.now().toString(), type: 'Create task' }]) }
  const removeAction = (id: string) => setActions(prev => prev.filter(a => a.id !== id))

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Automations"
        subtitle="Set up rules that run your operations automatically"
        action={<button onClick={() => { setNameError(''); setBuilderOpen(true) }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>+ New Automation</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Active"             value={automations.filter(a => a.active).length}  icon={Zap} />
        <StatCard label="Triggered This Week" value={14}                                        icon={Clock} animate={false} />
        <StatCard label="Time Saved (hrs)"    value={23}                                        icon={CheckCircle} animate={false} />
        <StatCard label="Pending Review"      value={1}                                         icon={AlertCircle} />
      </div>

      {/* Active Automations */}
      <div style={{ marginBottom: 32 }}>
        <div className="label-upper" style={{ marginBottom: 14 }}>Active Automations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {automations.map(auto => (
            <div key={auto.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: auto.active ? `${accent}18` : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={16} style={{ color: auto.active ? accent : 'var(--text-subtle)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{auto.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-subtle)' }}>When:</span> {auto.trigger} &nbsp;→&nbsp; <span style={{ color: 'var(--text-subtle)' }}>Then:</span> {auto.action}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {auto.properties.map(p => (
                    <span key={p} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{p}</span>
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>· Last triggered: {auto.lastTriggered}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {/* Toggle */}
                <button
                  onClick={() => toggleActive(auto.id)}
                  style={{ width: 36, height: 20, borderRadius: 10, border: 'none', background: auto.active ? accent : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: auto.active ? 19 : 3, transition: 'left 0.2s' }} />
                </button>
                {!auto.active && (
                  <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 500 }}>Paused</span>
                )}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === auto.id ? null : auto.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex' }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {openMenuId === auto.id && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10, width: 120 }}>
                      {['Edit', 'Duplicate', 'Delete'].map(a => (
                        <button key={a} onClick={() => setOpenMenuId(null)} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: 'none', background: 'transparent', color: a === 'Delete' ? '#f87171' : 'var(--text-muted)', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>{a}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div>
        <div className="label-upper" style={{ marginBottom: 14 }}>Automation Templates</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {TEMPLATES.map(t => (
            <div key={t.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, opacity: 0.7, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>{t.name}</div>
                <button onClick={() => { setBuilderName(t.name); setNameError(''); setBuilderOpen(true) }} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Use Template</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Builder Sheet */}
      <Sheet open={builderOpen} onOpenChange={setBuilderOpen}>
        <SheetContent side="right" style={{ maxWidth: 560, width: '100%' }}>
          <SheetHeader><SheetTitle>New Automation</SheetTitle></SheetHeader>
          <div style={{ padding: '0 16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>Automation Name</label>
              <input
                value={builderName}
                onChange={e => { setBuilderName(e.target.value); if (e.target.value.trim()) setNameError('') }}
                placeholder="e.g. Post-Checkout Cleaning"
                style={{ ...inputStyle, borderColor: nameError ? '#ef4444' : undefined }}
              />
              {nameError && <span style={{ color: 'var(--status-danger)', fontSize: 12, marginTop: 4, display: 'block' }}>{nameError}</span>}
            </div>

            {/* Active toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Active</span>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: accent, cursor: 'pointer', position: 'relative' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: 19 }} />
              </div>
            </div>

            {/* Trigger */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14 }}>
              <div className="label-upper" style={{ marginBottom: 10 }}>When this happens…</div>
              <select style={inputStyle}>
                {TRIGGER_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Conditions */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="label-upper">But only if…</div>
                <button onClick={addCondition} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Plus size={12} /> Add Condition
                </button>
              </div>
              {conditions.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>No conditions — automation runs for all cases.</div>}
              {conditions.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <select style={{ ...inputStyle, flex: 1 }}>
                    {['Property', 'Priority', 'Task type', 'Staff role', 'Stay length'].map(f => <option key={f}>{f}</option>)}
                  </select>
                  <select style={{ ...inputStyle, flex: '0 0 80px' }}>
                    {['is', 'is not', '>', '<'].map(o => <option key={o}>{o}</option>)}
                  </select>
                  <input placeholder="Value" style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={() => removeCondition(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', flexShrink: 0 }}><X size={14} /></button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="label-upper">Then do this…</div>
                {actions.length < 3 && (
                  <button onClick={addAction} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Plus size={12} /> Add Action
                  </button>
                )}
              </div>
              {actions.map((a, i) => (
                <div key={a.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', width: 16 }}>{i + 1}</span>
                    <select
                      value={a.type}
                      onChange={e => setActions(prev => prev.map(x => x.id === a.id ? { ...x, type: e.target.value } : x))}
                      style={{ ...inputStyle, flex: 1 }}
                    >
                      {ACTION_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    {actions.length > 1 && <button onClick={() => removeAction(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', flexShrink: 0 }}><X size={14} /></button>}
                  </div>
                  {a.type === 'Create task' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 22 }}>
                      <input placeholder="Task title" style={inputStyle} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <select style={inputStyle}><option>Maintenance</option><option>Cleaning</option><option>Inspection</option></select>
                        <select style={inputStyle}><option>High</option><option>Medium</option><option>Low</option></select>
                      </div>
                    </div>
                  )}
                  {a.type === 'Send Slack message' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 22 }}>
                      <input placeholder="#channel" style={inputStyle} />
                      <textarea placeholder="Message template... use {{property_name}}, {{date}}" style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
                    </div>
                  )}
                  {(a.type === 'Send email notification' || a.type === 'Send in-app notification') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 22 }}>
                      <select style={inputStyle}><option>Operator</option><option>All Staff</option><option>Cleaning Team</option><option>Maintenance Team</option></select>
                      <input placeholder="Message" style={inputStyle} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <SheetFooter>
            <button onClick={() => setBuilderOpen(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { setBuilderOpen(false); setNameError(''); showToast('Draft saved') }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${accent}`, background: 'transparent', color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save Draft</button>
            <button onClick={() => {
              if (!builderName.trim()) { setNameError('Automation name is required'); return }
              const name = builderName.trim()
              setAutomations(prev => [{ id: Date.now().toString(), name, trigger: 'Manual trigger', action: 'Custom action', active: true, properties: ['All properties'], lastTriggered: 'Never' }, ...prev])
              setBuilderOpen(false); setBuilderName(''); setNameError(''); showToast('Automation activated')
            }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Activate</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </motion.div>
  )
}

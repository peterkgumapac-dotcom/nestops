'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Users, ShoppingBag, AlertTriangle } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { useRole } from '@/context/RoleContext'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { UPSELL_APPROVAL_REQUESTS } from '@/lib/data/upsellApprovals'

interface AlertRule {
  id: string
  name: string
  trigger: string
  channel: string
  recipients: string
  active: boolean
}

interface Integration {
  id: string
  name: string
  emoji: string
  description: string
  category: string
  connected: boolean
  detail?: string
}

const ALERT_RULES: AlertRule[] = [
  { id: 'r1', name: 'Urgent Request',          trigger: 'Request priority = Urgent',                          channel: 'Slack #maintenance',        recipients: 'Operator + Contractors',  active: true },
  { id: 'r2', name: 'Low Stock Critical',       trigger: 'Stock level = 0',                                    channel: 'Email',                     recipients: 'Operator',                active: true },
  { id: 'r3', name: 'SOP Overdue',             trigger: 'SOP unacknowledged 72hrs',                           channel: 'In-app',                    recipients: 'Assigned staff',          active: true },
  { id: 'r4', name: 'Compliance Expiry',        trigger: 'Doc expires in 30 days',                             channel: 'Email',                     recipients: 'Operator + Owner',        active: true },
  { id: 'r5', name: 'Task Overdue',            trigger: 'Task past due date',                                 channel: 'Slack + In-app',            recipients: 'Assignee',                active: false },
  { id: 'r6', name: 'Upsell Approval — ECO',   trigger: 'Early check-in upsell · same-day check-in',          channel: 'In-app · Guest Services',   recipients: 'Operator + Guest Services', active: true },
  { id: 'r7', name: 'Upsell Approval — LCO',   trigger: 'Late check-out upsell · same-day check-out',         channel: 'In-app · Guest Services',   recipients: 'Operator + Guest Services', active: true },
  { id: 'r8', name: 'Upsell Escalation — No Cleaner', trigger: 'Upsell approval requested · no cleaner assigned to property', channel: 'In-app · Field Team',       recipients: 'Cleaning & Maintenance Supervisor', active: true },
]

const INTEGRATIONS: Integration[] = [
  { id: 'slack',     name: 'Slack',      emoji: '💬', description: 'Send alerts to your workspace',   category: 'Communication', connected: true,  detail: '#nestops-alerts' },
  { id: 'sendgrid',  name: 'SendGrid',   emoji: '✉️', description: 'Transactional email alerts',      category: 'Communication', connected: false },
  { id: 'hostaway',  name: 'Hostaway',   emoji: '🏠', description: 'Sync bookings and calendars',     category: 'PMS',           connected: false },
  { id: 'guesty',    name: 'Guesty',     emoji: '🏠', description: 'Sync bookings and calendars',     category: 'PMS',           connected: false },
  { id: 'breezeway', name: 'Breezeway',  emoji: '🧹', description: 'Cleaning and inspection sync',    category: 'Operations',    connected: false },
  { id: 'suiteop',   name: 'SuiteOp',    emoji: '🔒', description: 'Guest verification + access',     category: 'Operations',    connected: false },
  { id: 'stripe',    name: 'Stripe',     emoji: '💳', description: 'Security deposits + payments',    category: 'Payments',      connected: false },
]

const TRIGGER_OPTIONS = [
  'Request priority = Urgent', 'Stock level = 0', 'SOP unacknowledged after X hrs',
  'Compliance doc expires in X days', 'Task is overdue', 'Booking is cancelled',
  'Property vacant for X days', 'Guest checks in', 'Guest checks out',
  'Early check-in upsell purchased · same-day check-in',
  'Late check-out upsell purchased · same-day check-out',
]

const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

export default function AlertsPage() {
  const { accent } = useRole()
  const [rules, setRules] = useState<AlertRule[]>(ALERT_RULES)
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS)
  const [ruleSheet, setRuleSheet] = useState(false)
  const [slackSheet, setSlackSheet] = useState(false)
  const [connectDialog, setConnectDialog] = useState<Integration | null>(null)
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null)
  const [slackMappings, setSlackMappings] = useState([['Maintenance alerts', '#maintenance'], ['Low stock', '#inventory'], ['Compliance', '#compliance'], ['General', '#nestops-alerts']])
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const toggleRule = (id: string) => setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
  const deleteRule = (id: string) => { setRules(prev => prev.filter(r => r.id !== id)); showToast('Alert rule deleted') }
  const disconnectIntegration = (id: string) => { setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: false, detail: undefined } : i)); showToast('Integration disconnected') }

  const categories = ['Communication', 'PMS', 'Operations', 'Payments']

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Alerts & Integrations"
        subtitle="Configure how and where NestOps notifies your team"
      />

      {/* ── Field Team Alerts (live panel) ── */}
      {(() => {
        const escalated = UPSELL_APPROVAL_REQUESTS.filter(r => r.escalatedToSupervisor && r.status === 'pending_supervisor')
        if (escalated.length === 0) return null
        return (
          <div style={{ marginBottom: 24, background: 'var(--bg-card)', border: '1px solid #7c3aed30', borderLeft: '4px solid #7c3aed', borderRadius: 10, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Users size={14} style={{ color: '#7c3aed' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Field Team — Supervisor Action Required</span>
              <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 10, background: '#7c3aed20', color: '#7c3aed', fontWeight: 600 }}>{escalated.length}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>Cleaning &amp; Maintenance</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {escalated.map(req => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {req.upsellTitle} — {req.guestName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {req.propertyName} · Check-in {req.checkInDate} · No cleaner assigned
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>${req.price}</span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: '#f59e0b18', color: '#d97706', border: '1px solid #f59e0b30', fontWeight: 600 }}>
                      {req.calendarSignal === 'tentative' ? '🟡 Tentative' : req.calendarSignal === 'blocked' ? '🔴 Blocked' : '🟢 Available'}
                    </span>
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: '#7c3aed14', color: '#7c3aed', border: '1px solid #7c3aed30', fontWeight: 600 }}>⬆ Escalated</span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic' }}>
              These requests appear in My Tasks for the assigned field supervisor. Assign a cleaner to re-route to the cleaning team.
            </p>
          </div>
        )
      })()}

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, alignItems: 'start' }}>

        {/* ── Left: Alert Rules ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="label-upper">Alert Rules</div>
            <button onClick={() => setRuleSheet(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              <Plus size={12} /> New Alert Rule
            </button>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Trigger', 'Channel', 'Recipients', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < rules.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td style={{ padding: '11px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{r.name}</td>
                    <td style={{ padding: '11px 12px', color: 'var(--text-muted)' }}>{r.trigger}</td>
                    <td style={{ padding: '11px 12px', color: 'var(--text-muted)' }}>{r.channel}</td>
                    <td style={{ padding: '11px 12px', color: 'var(--text-muted)' }}>{r.recipients}</td>
                    <td style={{ padding: '11px 12px' }}>
                      <button
                        onClick={() => toggleRule(r.id)}
                        style={{ width: 32, height: 18, borderRadius: 9, border: 'none', background: r.active ? accent : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
                      >
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: r.active ? 17 : 3, transition: 'left 0.2s' }} />
                      </button>
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => { setEditingRule(r); setRuleSheet(true) }} style={{ padding: '3px 8px', borderRadius: 5, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 11, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => deleteRule(r.id)} style={{ padding: '3px 8px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: '#f87171', fontSize: 11, cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right: Integrations ── */}
        <div>
          <div className="label-upper" style={{ marginBottom: 14 }}>Connected Integrations</div>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{cat}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {integrations.filter(i => i.category === cat).map(intg => (
                  <div key={intg.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{intg.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{intg.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{intg.description}</div>
                        {intg.connected && intg.detail && (
                          <div style={{ fontSize: 11, color: '#34d399', marginTop: 4 }}>● Connected · {intg.detail}</div>
                        )}
                        {!intg.connected && (
                          <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>○ Not connected</div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {intg.connected ? (
                        <>
                          <button onClick={() => intg.id === 'slack' && setSlackSheet(true)} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 12, cursor: 'pointer' }}>Configure</button>
                          <button onClick={() => disconnectIntegration(intg.id)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: '#f87171', fontSize: 12, cursor: 'pointer' }}>Disconnect</button>
                        </>
                      ) : (
                        <button onClick={() => setConnectDialog(intg)} style={{ padding: '5px 12px', borderRadius: 7, border: 'none', background: accent, color: '#fff', fontSize: 12, cursor: 'pointer' }}>Connect</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Alert Rule Builder Sheet ── */}
      <Sheet open={ruleSheet} onOpenChange={setRuleSheet}>
        <SheetContent side="right">
          <SheetHeader><SheetTitle>{editingRule ? 'Edit Alert Rule' : 'New Alert Rule'}</SheetTitle></SheetHeader>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={labelStyle}>Alert Name</label><input placeholder="e.g. Urgent Request Alert" style={inputStyle} /></div>
            <div><label style={labelStyle}>Trigger Event</label>
              <select style={inputStyle}>{TRIGGER_OPTIONS.map(t => <option key={t}>{t}</option>)}</select>
            </div>
            <div>
              <label style={labelStyle}>Notification Channels</label>
              {['Slack', 'Email', 'SMS', 'In-app notification'].map(ch => (
                <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  {ch}
                </label>
              ))}
            </div>
            <div>
              <label style={labelStyle}>Recipients</label>
              <select style={inputStyle}><option>Operator</option><option>All Staff</option><option>Cleaning Team</option><option>Maintenance Team</option><option>Property Owner</option></select>
            </div>
            <div><label style={labelStyle}>Message Template</label>
              <textarea placeholder="Alert message... use {{property_name}}, {{date}}" style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
            </div>
            <div><label style={labelStyle}>Cooldown — don&apos;t send again within</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" defaultValue={24} style={{ ...inputStyle, width: 80 }} />
                <select style={{ ...inputStyle, flex: 1 }}><option>hours</option><option>minutes</option><option>days</option></select>
              </div>
            </div>
          </div>
          <SheetFooter>
            <button onClick={() => { setRuleSheet(false); setEditingRule(null) }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { setRuleSheet(false); setEditingRule(null); showToast('Alert rule saved') }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Slack Configure Sheet ── */}
      <Sheet open={slackSheet} onOpenChange={setSlackSheet}>
        <SheetContent side="right">
          <SheetHeader><SheetTitle>Configure Slack</SheetTitle></SheetHeader>
          <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={labelStyle}>Workspace</label><input value="NestOps Team" readOnly style={{ ...inputStyle, color: 'var(--text-muted)' }} /></div>
            <div><label style={labelStyle}>Default Alert Channel</label><input defaultValue="#nestops-alerts" style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Channel Mapping</label>
              {slackMappings.map(([type, channel], idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 140, flexShrink: 0 }}>{type}</span>
                  <input defaultValue={channel} style={{ ...inputStyle, flex: 1 }} />
                </div>
              ))}
              <button onClick={() => setSlackMappings(prev => [...prev, ['New alert', '#channel']])} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: accent, background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}>
                <Plus size={12} /> Add mapping
              </button>
            </div>
            <button onClick={() => showToast('Test message sent to #nestops-alerts')} style={{ padding: '9px 0', borderRadius: 8, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 13, cursor: 'pointer' }}>
              Send Test Message
            </button>
          </div>
          <SheetFooter>
            <button onClick={() => setSlackSheet(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { setSlackSheet(false); showToast('Slack configuration saved') }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ── Connect Integration Dialog ── */}
      <Dialog open={!!connectDialog} onOpenChange={open => { if (!open) setConnectDialog(null) }}>
        <DialogContent>
          {connectDialog && (
            <>
              <DialogHeader>
                <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{connectDialog.emoji}</span> {connectDialog.name}
                </DialogTitle>
              </DialogHeader>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{connectDialog.description}</p>
              <div>
                <label style={labelStyle}>API Key</label>
                <input placeholder="Paste your API key here" style={inputStyle} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', fontStyle: 'italic' }}>This is a demo — no real connection is made.</p>
              <DialogFooter>
                <DialogClose render={<button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }} />}>Cancel</DialogClose>
                <button onClick={() => setConnectDialog(null)} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Connect</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </motion.div>
  )
}

'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wrench, Phone, Star, Plus, Link2, Copy, Check, Send, ExternalLink,
  Clock, FileText, Camera, Upload, MessageSquare, Timer, CheckCircle,
  AlertCircle, Building2, Mail,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { useRole } from '@/context/RoleContext'

type ContractorStatus = 'active' | 'inactive' | 'onboarding' | 'pending_review'

interface Contractor {
  id: string
  name: string
  specialty: string
  phone: string
  email: string
  rating: number
  status: ContractorStatus
  onboardingLink?: string
  onboardingStep?: number  // 0-5
}

interface WorkOrder {
  id: string
  contractorId: string
  title: string
  property: string
  description: string
  status: 'issued' | 'in_progress' | 'completed' | 'pending_review'
  token: string
  issuedDate: string
  photos: string[]
  timeStarted?: string
  timeCompleted?: string
  notes: string
  invoiceUploaded: boolean
}

const INITIAL_CONTRACTORS: Contractor[] = [
  { id: 'c1', name: 'Lars Plumbing AS', specialty: 'Plumbing', phone: '+47 900 12 345', email: 'lars@plumbing.no', rating: 4.8, status: 'active' },
  { id: 'c2', name: 'Elcon Electricians', specialty: 'Electrical', phone: '+47 900 23 456', email: 'contact@elcon.no', rating: 4.9, status: 'active' },
  { id: 'c3', name: 'CleanPro Bergen', specialty: 'Cleaning', phone: '+47 900 34 567', email: 'info@cleanpro.no', rating: 4.6, status: 'active' },
  { id: 'c4', name: 'Nordic HVAC', specialty: 'HVAC', phone: '+47 900 45 678', email: 'service@nordichvac.no', rating: 4.7, status: 'onboarding', onboardingLink: 'nestops.io/onboard/nordic-hvac-x9k2', onboardingStep: 2 },
  { id: 'c5', name: 'Tømrer Hansen', specialty: 'Carpentry', phone: '+47 900 56 789', email: 'hansen@tomrer.no', rating: 4.5, status: 'inactive' },
]

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  { id: 'wo1', contractorId: 'c1', title: 'Fix leaking bathroom pipe', property: 'Sunset Villa', description: 'Guest reported water leak under bathroom sink. Needs immediate inspection and repair.', status: 'completed', token: 'wo-tok-7f3a', issuedDate: '2026-03-18', photos: [], timeStarted: '09:15', timeCompleted: '11:30', notes: 'Replaced P-trap and tightened fittings. No further leaks observed.', invoiceUploaded: true },
  { id: 'wo2', contractorId: 'c4', title: 'Annual HVAC service', property: 'Harbor Studio', description: 'Annual service and filter replacement for the Mitsubishi heat pump unit.', status: 'in_progress', token: 'wo-tok-2b8c', issuedDate: '2026-03-20', photos: [], timeStarted: '10:00', notes: '', invoiceUploaded: false },
  { id: 'wo3', contractorId: 'c2', title: 'Replace faulty circuit breaker', property: 'Downtown Loft', description: 'Circuit breaker for bedroom circuit is tripping repeatedly. Requires certified electrician.', status: 'issued', token: 'wo-tok-4d1e', issuedDate: '2026-03-20', photos: [], notes: '', invoiceUploaded: false },
]

const ONBOARDING_STEPS = ['Business Info', 'Insurance Upload', 'Business Permit', 'Payment Method', 'Legal Docs', 'Digital Signature']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

const WO_STATUS_CONFIG = {
  issued:         { label: 'Issued',          color: '#6366f1', bg: '#6366f115' },
  in_progress:    { label: 'In Progress',      color: '#d97706', bg: '#d9770615' },
  completed:      { label: 'Completed',        color: '#10b981', bg: '#10b98115' },
  pending_review: { label: 'Pending Review',   color: '#d97706', bg: '#d9770615' },
}

type Tab = 'directory' | 'onboarding' | 'work_orders'

export default function ContractorsPage() {
  const { accent } = useRole()
  const [tab, setTab] = useState<Tab>('directory')
  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS)
  const [addDrawer, setAddDrawer] = useState(false)
  const [woDrawer, setWoDrawer] = useState<WorkOrder | null>(null)
  const [newWoDrawer, setNewWoDrawer] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  // Add contractor form
  const [newName, setNewName] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')

  // New work order form
  const [woContractor, setWoContractor] = useState('')
  const [woTitle, setWoTitle] = useState('')
  const [woProperty, setWoProperty] = useState('')
  const [woDesc, setWoDesc] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(`https://${link}`).catch(() => showToast('Copy failed — try manually'))
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const sendOnboardingLink = (id: string) => {
    const link = `nestops.io/onboard/${id}-${Math.random().toString(36).slice(2, 6)}`
    setContractors(prev => prev.map(c => c.id === id ? { ...c, status: 'onboarding', onboardingLink: link, onboardingStep: 0 } : c))
    showToast('Onboarding link sent')
  }

  const approveContractor = (id: string) => {
    setContractors(prev => prev.map(c => c.id === id ? { ...c, status: 'active', onboardingStep: 5 } : c))
    showToast('Contractor activated')
  }

  const handleAddContractor = () => {
    if (!newName.trim()) return
    const id = 'c' + (contractors.length + 1)
    setContractors(prev => [...prev, { id, name: newName.trim(), specialty: newSpecialty.trim() || 'General', phone: newPhone.trim(), email: newEmail.trim(), rating: 5.0, status: 'active' }])
    setNewName(''); setNewSpecialty(''); setNewPhone(''); setNewEmail('')
    setAddDrawer(false)
    showToast('Contractor added')
  }

  const issueWorkOrder = () => {
    if (!woTitle.trim() || !woContractor) return
    const token = 'wo-tok-' + Math.random().toString(36).slice(2, 6)
    const id = 'wo' + (workOrders.length + 1)
    setWorkOrders(prev => [...prev, {
      id, contractorId: woContractor, title: woTitle, property: woProperty, description: woDesc,
      status: 'issued', token, issuedDate: new Date().toISOString().slice(0, 10),
      photos: [], notes: '', invoiceUploaded: false,
    }])
    setWoTitle(''); setWoContractor(''); setWoProperty(''); setWoDesc('')
    setNewWoDrawer(false)
    showToast('Work order issued')
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'directory', label: 'Directory' },
    { key: 'onboarding', label: 'Onboarding' },
    { key: 'work_orders', label: 'Work Orders' },
  ]

  const activeContractors = contractors.filter(c => c.status === 'active')
  const onboardingContractors = contractors.filter(c => c.status === 'onboarding' || c.status === 'pending_review')

  return (
    <div>
      <PageHeader
        title="Contractors"
        subtitle="Directory · Self-service onboarding · Work orders"
        action={
          tab === 'directory' ? (
            <button onClick={() => setAddDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Add Contractor</button>
          ) : tab === 'work_orders' ? (
            <button onClick={() => setNewWoDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Issue Work Order</button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'var(--bg-elevated)', borderRadius: 10, width: 'fit-content', marginBottom: 24 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: tab === t.key ? 'var(--bg-card)' : 'transparent',
              color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DIRECTORY TAB ── */}
      {tab === 'directory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {contractors.map(c => (
            <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Wrench size={18} style={{ color: accent }} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.specialty}</div>
                </div>
                <StatusBadge status={c.status === 'pending_review' ? 'pending' : c.status} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                <Phone size={11} /> {c.phone}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{c.email}</div>
              <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.rating}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>/ 5.0</span>
                </div>
                {c.status !== 'onboarding' && c.status !== 'pending_review' && (
                  <button
                    onClick={() => sendOnboardingLink(c.id)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `1px solid ${accent}40`, background: `${accent}10`, color: accent, cursor: 'pointer', fontWeight: 500 }}
                  >
                    Send Onboarding Link
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ONBOARDING TAB ── */}
      {tab === 'onboarding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {onboardingContractors.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
              No contractors currently onboarding. Send an onboarding link from the Directory tab.
            </div>
          ) : (
            onboardingContractors.map(c => (
              <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={16} style={{ color: accent }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.specialty} · {c.email}</div>
                  </div>
                  <StatusBadge status={c.status === 'pending_review' ? 'pending' : c.status} />
                </div>

                {/* Progress steps */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Onboarding Progress — Step {(c.onboardingStep ?? 0) + 1} of {ONBOARDING_STEPS.length}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {ONBOARDING_STEPS.map((step, i) => {
                      const done = i < (c.onboardingStep ?? 0)
                      const current = i === (c.onboardingStep ?? 0)
                      return (
                        <div key={step} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: done ? '#10b98115' : current ? `${accent}15` : 'var(--bg-elevated)',
                          color: done ? '#10b981' : current ? accent : 'var(--text-subtle)',
                          border: `1px solid ${done ? '#10b98130' : current ? `${accent}40` : 'var(--border)'}`,
                        }}>
                          {done ? <Check size={10} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: current ? accent : 'var(--text-subtle)' }} />}
                          {step}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Onboarding link */}
                {c.onboardingLink && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: 12 }}>
                    <Link2 size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      https://{c.onboardingLink}
                    </span>
                    <button
                      onClick={() => copyLink(c.onboardingLink!, c.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: `1px solid var(--border)`, background: 'var(--bg-card)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {copied === c.id ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: `1px solid ${accent}40`, background: `${accent}10`, fontSize: 11, fontWeight: 600, color: accent, cursor: 'pointer' }}>
                      <Send size={11} /> Resend
                    </button>
                  </div>
                )}

                {(c.onboardingStep ?? 0) >= ONBOARDING_STEPS.length - 1 && (
                  <button
                    onClick={() => approveContractor(c.id)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <CheckCircle size={14} /> Approve & Activate
                  </button>
                )}
              </div>
            ))
          )}

          {/* All contractors with no onboarding link */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Contractors ({activeContractors.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeContractors.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <CheckCircle size={14} color="#10b981" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.specialty}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#10b98115', color: '#10b981' }}>Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── WORK ORDERS TAB ── */}
      {tab === 'work_orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {workOrders.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
              No work orders yet.
            </div>
          ) : (
            workOrders.map(wo => {
              const contractor = contractors.find(c => c.id === wo.contractorId)
              const cfg = WO_STATUS_CONFIG[wo.status]
              return (
                <div
                  key={wo.id}
                  onClick={() => setWoDrawer(wo)}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{wo.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{wo.property} · {contractor?.name}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wo.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-subtle)' }}>
                      <Link2 size={11} />
                      <span style={{ fontFamily: 'monospace', fontSize: 11 }}>Token: {wo.token}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-subtle)' }}>
                      <Clock size={11} /> Issued {wo.issuedDate}
                    </div>
                    {wo.invoiceUploaded && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#10b981' }}>
                        <FileText size={11} /> Invoice uploaded
                      </div>
                    )}
                    {wo.photos.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: accent }}>
                        <Camera size={11} /> {wo.photos.length} photos
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── ADD CONTRACTOR DRAWER ── */}
      <AppDrawer
        open={addDrawer}
        onClose={() => setAddDrawer(false)}
        title="Add Contractor"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAddDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleAddContractor} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Name</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Company or person name" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Specialty</label><input value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} placeholder="e.g. Plumbing, Electrical" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Phone</label><input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+47 900 00 000" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Email</label><input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="email@company.no" style={inputStyle} /></div>
        </div>
      </AppDrawer>

      {/* ── ISSUE WORK ORDER DRAWER ── */}
      <AppDrawer
        open={newWoDrawer}
        onClose={() => setNewWoDrawer(false)}
        title="Issue Work Order"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setNewWoDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={issueWorkOrder} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Issue</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Contractor</label>
            <select value={woContractor} onChange={e => setWoContractor(e.target.value)} style={{ ...inputStyle }}>
              <option value="">Select contractor…</option>
              {contractors.filter(c => c.status === 'active').map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.specialty}</option>
              ))}
            </select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Job Title</label><input value={woTitle} onChange={e => setWoTitle(e.target.value)} placeholder="e.g. Fix leaking pipe" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Property</label><input value={woProperty} onChange={e => setWoProperty(e.target.value)} placeholder="e.g. Sunset Villa" style={inputStyle} /></div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Description</label>
            <textarea value={woDesc} onChange={e => setWoDesc(e.target.value)} placeholder="Describe the work required…" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 8, background: `${accent}08`, border: `1px solid ${accent}20` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: accent, marginBottom: 4 }}>Tokenized Link — No Login Required</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>A unique work order link is generated and emailed to the contractor. They can update status, upload photos, add notes, and submit an invoice without creating an account.</div>
          </div>
        </div>
      </AppDrawer>

      {/* ── WORK ORDER DETAIL DRAWER ── */}
      {woDrawer && (
        <AppDrawer
          open={true}
          onClose={() => setWoDrawer(null)}
          title={woDrawer.title}
          footer={
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setWoDrawer(null)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Close</button>
              {woDrawer.status === 'completed' && (
                <button
                  onClick={() => {
                    setWorkOrders(prev => prev.map(w => w.id === woDrawer.id ? { ...w, status: 'pending_review' } : w))
                    setWoDrawer(null)
                    showToast('Marked for review')
                  }}
                  style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Verify & Close
                </button>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Property</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{woDrawer.property}</div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Description</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{woDrawer.description}</div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Contractor Access Link</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: accent }}>https://nestops.io/work/{woDrawer.token}</span>
                <button
                  onClick={() => copyLink(`nestops.io/work/${woDrawer.token}`, woDrawer.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {copied === woDrawer.id ? <Check size={10} /> : <Copy size={10} />}
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Time Started</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{woDrawer.timeStarted ?? '—'}</div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Time Completed</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{woDrawer.timeCompleted ?? '—'}</div>
              </div>
            </div>
            {woDrawer.notes && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Contractor Notes</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{woDrawer.notes}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: woDrawer.invoiceUploaded ? '#10b98110' : 'var(--bg-elevated)', border: `1px solid ${woDrawer.invoiceUploaded ? '#10b98130' : 'var(--border)'}`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: woDrawer.invoiceUploaded ? '#10b981' : 'var(--text-subtle)', fontWeight: 600 }}>
                  {woDrawer.invoiceUploaded ? '✓ Invoice Uploaded' : 'No Invoice Yet'}
                </div>
              </div>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: woDrawer.photos.length > 0 ? '#10b98110' : 'var(--bg-elevated)', border: `1px solid ${woDrawer.photos.length > 0 ? '#10b98130' : 'var(--border)'}`, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: woDrawer.photos.length > 0 ? '#10b981' : 'var(--text-subtle)', fontWeight: 600 }}>
                  {woDrawer.photos.length > 0 ? `✓ ${woDrawer.photos.length} Photos` : 'No Photos Yet'}
                </div>
              </div>
            </div>
          </div>
        </AppDrawer>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

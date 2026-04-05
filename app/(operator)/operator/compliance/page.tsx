'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, AlertTriangle, Clock, FileX, ChevronDown, ChevronRight,
  Plus, Upload, Sparkles, Send, X, CheckCircle, FileText, Building2,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import AppDrawer from '@/components/shared/AppDrawer'
import { useRole } from '@/context/RoleContext'
import { COMPLIANCE_DOCS, type ComplianceDocument } from '@/lib/data/compliance'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'

const STATUS_CONFIG = {
  valid:    { label: 'Valid',    color: '#10b981', bg: '#10b98115', border: '#10b98130' },
  expiring: { label: 'Expiring', color: '#d97706', bg: '#d9770615', border: '#d9770630' },
  expired:  { label: 'Expired',  color: '#ef4444', bg: '#ef444415', border: '#ef444430' },
  missing:  { label: 'Missing',  color: '#6b7280', bg: '#6b728015', border: '#6b728030' },
}

const CATEGORIES = [
  { key: 'Fire Safety Certificate',   icon: '🔥', label: 'Fire Safety' },
  { key: 'Electrical Inspection',     icon: '⚡', label: 'Electrical Inspection' },
  { key: 'Short-Term Rental License', icon: '🏠', label: 'STR License' },
  { key: 'Building Insurance',        icon: '🛡️', label: 'Building Insurance' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

export default function CompliancePage() {
  const { accent } = useRole()
  const [docs, setDocs] = useState<ComplianceDocument[]>(COMPLIANCE_DOCS)
  const [expanded, setExpanded] = useState<string[]>(['Fire Safety Certificate'])
  const [requestDrawer, setRequestDrawer] = useState<{ open: boolean; propertyId: string; category: string }>({ open: false, propertyId: '', category: '' })
  const [addDrawer, setAddDrawer] = useState<{ open: boolean; propertyId: string; category: string }>({ open: false, propertyId: '', category: '' })
  const [draftEmail, setDraftEmail] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [toast, setToast] = useState('')

  // Add doc form state
  const [docName, setDocName] = useState('')
  const [docIssuer, setDocIssuer] = useState('')
  const [docExpiry, setDocExpiry] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const expired  = docs.filter(d => d.status === 'expired').length
  const expiring = docs.filter(d => d.status === 'expiring').length
  const missing  = docs.filter(d => d.status === 'missing').length
  const valid    = docs.filter(d => d.status === 'valid').length
  const categories = CATEGORIES.length

  const toggleCategory = (key: string) => {
    setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const openRequest = (propertyId: string, category: string) => {
    setDraftEmail('')
    setRequestDrawer({ open: true, propertyId, category })
  }

  const openAdd = (propertyId: string, category: string) => {
    setDocName(''); setDocIssuer(''); setDocExpiry(''); setDocFile(null)
    setAddDrawer({ open: true, propertyId, category })
  }

  const draftWithAI = async () => {
    const property = PROPERTIES.find(p => p.id === requestDrawer.propertyId)
    const owner    = OWNERS.find(o => o.id === property?.ownerId)
    if (!property || !owner) return
    setDrafting(true)
    await new Promise(r => setTimeout(r, 900))
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    setDraftEmail(
`Subject: Urgent: ${requestDrawer.category} Required — ${property.name}

Dear ${owner.name},

I hope this message finds you well. I'm writing regarding ${property.name} at ${property.address}, ${property.city}.

Our compliance records show that the ${requestDrawer.category} for this property is currently ${docs.find(d => d.propertyId === property.id && d.category === requestDrawer.category)?.status ?? 'missing or expired'}.

This is a legal requirement for operating a short-term rental in Norway. Failure to maintain a valid certificate may result in:
• Suspension of the STR listing
• Fines of up to 15,000 NOK from the local authority
• Liability exposure in the event of an incident

Could you please arrange for the updated document to be sent through as soon as possible? If you need assistance coordinating with the relevant authority or inspector, please let me know and we can arrange this on your behalf.

Deadline: We require this document within 14 days of today, ${today}.

Best regards,
AfterStay Property Management`)
    setDrafting(false)
  }

  const sendRequest = () => {
    setRequestDrawer({ open: false, propertyId: '', category: '' })
    showToast('Request sent to owner')
  }

  const saveDocument = () => {
    if (!docName.trim() || !docExpiry) return
    const id = 'cd' + (docs.length + 1)
    setDocs(prev => [...prev, {
      id,
      category: addDrawer.category,
      propertyId: addDrawer.propertyId,
      issuer: docIssuer.trim() || 'Unknown',
      expiryDate: docExpiry,
      status: 'valid',
    }])
    setAddDrawer({ open: false, propertyId: '', category: '' })
    showToast('Document added')
  }

  const requestProperty  = PROPERTIES.find(p => p.id === requestDrawer.propertyId)
  const requestOwner     = OWNERS.find(o => o.id === requestProperty?.ownerId)

  return (
    <div>
      <PageHeader
        title="Compliance"
        subtitle="Portfolio-wide certificate and document tracking"
      />

      {/* Alert banner */}
      {(expired > 0 || missing > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            marginBottom: 24, background: '#ef444412', border: '1px solid #ef444430',
            borderRadius: 10,
          }}
        >
          <AlertTriangle size={16} color="#ef4444" />
          <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
            {expired} expired · {missing} missing —&nbsp;
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            immediate action required to maintain listing compliance
          </span>
        </motion.div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Categories"    value={categories} icon={ShieldCheck}   subtitle="Document types tracked" />
        <StatCard label="Expired"       value={expired}    icon={AlertTriangle}  subtitle="Need immediate renewal" animate={false} />
        <StatCard label="Expiring Soon" value={expiring}   icon={Clock}          subtitle="Within 90 days" animate={false} />
        <StatCard label="Missing"       value={missing}    icon={FileX}          subtitle="Not yet uploaded" animate={false} />
      </div>

      {/* Category accordions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {CATEGORIES.map(cat => {
          const catDocs = docs.filter(d => d.category === cat.key)
          const isOpen  = expanded.includes(cat.key)
          const catExpired  = catDocs.filter(d => d.status === 'expired').length
          const catExpiring = catDocs.filter(d => d.status === 'expiring').length
          const catMissing  = catDocs.filter(d => d.status === 'missing').length
          const hasBadge    = catExpired > 0 || catExpiring > 0 || catMissing > 0

          return (
            <div key={cat.key} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <button
                onClick={() => toggleCategory(cat.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 20px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{cat.label}</span>
                {hasBadge && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {catExpired > 0  && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: STATUS_CONFIG.expired.bg,  color: STATUS_CONFIG.expired.color  }}>{catExpired} expired</span>}
                    {catExpiring > 0 && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: STATUS_CONFIG.expiring.bg, color: STATUS_CONFIG.expiring.color }}>{catExpiring} expiring</span>}
                    {catMissing > 0  && <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: STATUS_CONFIG.missing.bg,  color: STATUS_CONFIG.missing.color  }}>{catMissing} missing</span>}
                  </div>
                )}
                {!hasBadge && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: STATUS_CONFIG.valid.bg, color: STATUS_CONFIG.valid.color }}>All valid</span>
                )}
                {isOpen ? <ChevronDown size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} /> : <ChevronRight size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ borderTop: '1px solid var(--border)' }}>
                      {PROPERTIES.map(prop => {
                        const doc = catDocs.find(d => d.propertyId === prop.id)
                        const cfg = doc ? STATUS_CONFIG[doc.status] : STATUS_CONFIG.missing
                        const status = doc?.status ?? 'missing'

                        return (
                          <div
                            key={prop.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 14,
                              padding: '14px 20px',
                              borderBottom: '1px solid var(--border-subtle)',
                            }}
                          >
                            <Building2 size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{prop.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
                                {doc?.issuer && `${doc.issuer} · `}
                                {doc?.expiryDate
                                  ? `Expires ${new Date(doc.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                  : 'No document on file'}
                              </div>
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                              flexShrink: 0,
                            }}>
                              {cfg.label}
                            </span>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              {(status === 'expired' || status === 'missing' || status === 'expiring') && (
                                <button
                                  onClick={() => openRequest(prop.id, cat.key)}
                                  style={{
                                    padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                    border: `1px solid ${accent}40`, background: `${accent}12`, color: accent,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                  }}
                                >
                                  <Send size={11} /> Request from Owner
                                </button>
                              )}
                              <button
                                onClick={() => openAdd(prop.id, cat.key)}
                                style={{
                                  padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                  border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}
                              >
                                <Upload size={11} /> Add Document
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Request from Owner drawer */}
      <AppDrawer
        open={requestDrawer.open}
        onClose={() => setRequestDrawer({ open: false, propertyId: '', category: '' })}
        title={`Request from Owner — ${requestDrawer.category}`}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setRequestDrawer({ open: false, propertyId: '', category: '' })} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={sendRequest} disabled={!draftEmail} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: draftEmail ? accent : 'var(--bg-elevated)', color: draftEmail ? '#fff' : 'var(--text-subtle)', fontSize: 13, fontWeight: 600, cursor: draftEmail ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={14} /> Send to Owner
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {requestProperty && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{requestProperty.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{requestProperty.address}, {requestProperty.city}</div>
              {requestOwner && <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>Owner: {requestOwner.name} · {requestOwner.email}</div>}
            </div>
          )}

          <button
            onClick={draftWithAI}
            disabled={drafting}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
              borderRadius: 8, border: `1px solid ${accent}40`, background: `${accent}12`,
              color: accent, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Sparkles size={15} />
            {drafting ? 'Drafting…' : 'Draft with AI'}
          </button>

          {draftEmail && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Email Draft (review before sending)</label>
              <textarea
                value={draftEmail}
                onChange={e => setDraftEmail(e.target.value)}
                rows={14}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }}
              />
            </div>
          )}
        </div>
      </AppDrawer>

      {/* Add Document drawer */}
      <AppDrawer
        open={addDrawer.open}
        onClose={() => setAddDrawer({ open: false, propertyId: '', category: '' })}
        title="Add Document"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAddDrawer({ open: false, propertyId: '', category: '' })} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={saveDocument} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Save Document
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
            {addDrawer.category} · {PROPERTIES.find(p => p.id === addDrawer.propertyId)?.name}
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Document Name</label>
            <input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. Fire Safety Certificate 2025" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Issuing Authority</label>
            <input value={docIssuer} onChange={e => setDocIssuer(e.target.value)} placeholder="e.g. Oslo Brannvesen" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Expiry Date</label>
            <input type="date" value={docExpiry} onChange={e => setDocExpiry(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Upload File (PDF / Image)</label>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '20px 0', borderRadius: 8, border: '2px dashed var(--border)',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13,
              background: docFile ? `${accent}08` : 'transparent',
            }}>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
              {docFile ? (
                <><FileText size={16} style={{ color: accent }} /><span style={{ color: accent }}>{docFile.name}</span></>
              ) : (
                <><Upload size={16} /><span>Click to upload</span></>
              )}
            </label>
          </div>
        </div>
      </AppDrawer>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

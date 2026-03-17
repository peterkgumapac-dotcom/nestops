'use client'
import { useState } from 'react'
import { ShieldCheck, AlertTriangle, ChevronDown, ChevronRight, FileText, Sparkles } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import StatCard from '@/components/shared/StatCard'
import AppDrawer from '@/components/shared/AppDrawer'
import { COMPLIANCE_DOCS } from '@/lib/data/compliance'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'

export default function CompliancePage() {
  const { accent } = useRole()
  const [expanded, setExpanded] = useState<string[]>([])
  const [requestDrawer, setRequestDrawer] = useState(false)
  const [addDrawer, setAddDrawer] = useState(false)
  const [draftingEmail, setDraftingEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<typeof COMPLIANCE_DOCS[0] | null>(null)

  const categories = [...new Set(COMPLIANCE_DOCS.map(d => d.category))]
  const expired = COMPLIANCE_DOCS.filter(d => d.status === 'expired')
  const expiring = COMPLIANCE_DOCS.filter(d => d.status === 'expiring')
  const missing = COMPLIANCE_DOCS.filter(d => d.status === 'missing')

  const toggleCategory = (cat: string) => {
    setExpanded(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  const handleDraftEmail = async () => {
    if (!selectedDoc) return
    setDraftingEmail(true)
    const prop = PROPERTIES.find(p => p.id === selectedDoc.propertyId)
    try {
      const res = await fetch('/api/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: selectedDoc.category, propertyName: prop?.name ?? selectedDoc.propertyId, status: selectedDoc.status }),
      })
      const data = await res.json()
      setEmailSubject(data.subject ?? `Action Required: ${selectedDoc.category} — ${prop?.name}`)
      setEmailBody(data.body ?? '')
    } catch {
      setEmailSubject(`Action Required: ${selectedDoc.category} — ${prop?.name}`)
      setEmailBody(`Dear Owner,\n\nWe are writing to inform you that the ${selectedDoc.category} for ${prop?.name} requires your immediate attention.\n\nPlease provide the updated document at your earliest convenience.\n\nBest regards,\nNestOps Team`)
    } finally {
      setDraftingEmail(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }

  return (
    <div>
      <PageHeader
        title="Compliance"
        subtitle="Regulatory documents and certifications"
        action={
          <button onClick={() => setAddDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Add Document
          </button>
        }
      />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Categories" value={categories.length} icon={ShieldCheck} />
        <StatCard label="Expired" value={expired.length} icon={AlertTriangle} />
        <StatCard label="Expiring Soon" value={expiring.length} icon={AlertTriangle} />
        <StatCard label="Missing" value={missing.length} icon={FileText} />
      </div>

      {/* Alert banners */}
      {expired.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: '#f87171', fontWeight: 500 }}>{expired.length} expired document{expired.length > 1 ? 's' : ''} — immediate action required</span>
        </div>
      )}
      {expiring.length > 0 && (
        <div style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: '#fbbf24', fontWeight: 500 }}>{expiring.length} document{expiring.length > 1 ? 's' : ''} expiring within 60 days</span>
        </div>
      )}

      {/* Accordion by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map(cat => {
          const docs = COMPLIANCE_DOCS.filter(d => d.category === cat)
          const isOpen = expanded.includes(cat)
          const hasIssues = docs.some(d => d.status === 'expired' || d.status === 'missing' || d.status === 'expiring')
          return (
            <div key={cat} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <button
                onClick={() => toggleCategory(cat)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                {isOpen ? <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>{cat}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{docs.length} properties</span>
                {hasIssues && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />}
              </button>
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {docs.map(doc => {
                    const prop = PROPERTIES.find(p => p.id === doc.propertyId)
                    return (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{prop?.name ?? doc.propertyId}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{doc.issuer}</div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-subtle)', minWidth: 80 }}>{doc.issuedDate ?? '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-subtle)', minWidth: 80 }}>{doc.expiryDate ?? '—'}</div>
                        <StatusBadge status={doc.status} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Edit</button>
                          <button
                            onClick={() => { setSelectedDoc(doc); setRequestDrawer(true) }}
                            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: 'none', background: `${accent}1a`, color: accent, cursor: 'pointer', fontWeight: 500 }}
                          >
                            Request
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Request from Owner Drawer */}
      <AppDrawer
        open={requestDrawer}
        onClose={() => { setRequestDrawer(false); setEmailSubject(''); setEmailBody('') }}
        title="Request from Owner"
        subtitle={selectedDoc ? `${selectedDoc.category} — ${PROPERTIES.find(p => p.id === selectedDoc?.propertyId)?.name}` : ''}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setRequestDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Send Request</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleDraftEmail}
              disabled={draftingEmail}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              <Sparkles size={13} /> {draftingEmail ? 'Drafting…' : 'Draft with AI'}
            </button>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>To</label>
            <input style={inputStyle} placeholder="owner@example.com" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Subject</label>
            <input style={inputStyle} value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Subject line" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Message</label>
            <textarea style={{ ...inputStyle, minHeight: 160, resize: 'vertical' }} value={emailBody} onChange={e => setEmailBody(e.target.value)} placeholder="Email body..." />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Request by date</label>
            <input type="date" style={inputStyle} />
          </div>
        </div>
      </AppDrawer>

      {/* Add Document Drawer */}
      <AppDrawer
        open={addDrawer}
        onClose={() => setAddDrawer(false)}
        title="Add Document"
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setAddDrawer(false)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
            <button style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Save</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Category</label><input style={inputStyle} placeholder="e.g. Fire Safety Certificate" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Property</label>
            <select style={inputStyle}>
              {PROPERTIES.map(p => <option key={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Issuer</label><input style={inputStyle} placeholder="Issuing authority" /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Issue Date</label><input type="date" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Expiry Date</label><input type="date" style={inputStyle} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Upload Document</label>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '30px 20px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13, cursor: 'pointer' }}>
              Click to upload or drag and drop
            </div>
          </div>
        </div>
      </AppDrawer>
    </div>
  )
}

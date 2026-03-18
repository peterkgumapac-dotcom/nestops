'use client'
import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { useRole } from '@/context/RoleContext'

const DOCUMENTS = [
  { id: 'd1', name: 'Management Agreement 2024',      property: 'Sunset Villa',  expiry: '2026-12-31', status: 'active'   as const, size: '1.2 MB' },
  { id: 'd2', name: 'Property Insurance Certificate', property: 'Sunset Villa',  expiry: '2026-01-01', status: 'expired'  as const, size: '0.8 MB' },
  { id: 'd3', name: 'Q4 2025 Revenue Report',         property: 'Sunset Villa',  expiry: null,         status: 'active'   as const, size: '2.1 MB' },
  { id: 'd4', name: 'Management Agreement 2024',      property: 'Harbor Studio', expiry: '2026-12-31', status: 'active'   as const, size: '1.1 MB' },
  { id: 'd5', name: 'Short-Term Rental Permit',       property: 'Harbor Studio', expiry: '2026-06-30', status: 'pending'  as const, size: '0.5 MB' },
]

const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

export default function DocumentsPage() {
  const { accent } = useRole()
  const [requestDocDrawer, setRequestDocDrawer] = useState(false)
  const [docType, setDocType] = useState('Lease Agreement')
  const [docNotes, setDocNotes] = useState('')
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleRequestSubmit = () => {
    showToast('Document request submitted')
    setRequestDocDrawer(false)
    setDocType('Lease Agreement')
    setDocNotes('')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Documents"
        subtitle="Contracts, insurance, and compliance documents"
        action={
          <button
            onClick={() => setRequestDocDrawer(true)}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}
          >
            Request Document
          </button>
        }
      />

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
              {['Document', 'Property', 'Expiry', 'Status', 'Download'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCUMENTS.map((doc, i) => (
              <tr key={doc.id} style={{ borderBottom: i < DOCUMENTS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>{doc.size}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 16px', color: 'var(--text-muted)' }}>{doc.property}</td>
                <td style={{ padding: '13px 16px', color: doc.expiry && doc.expiry < '2026-04-01' ? '#f87171' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {doc.expiry ?? '—'}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <StatusBadge status={doc.status} />
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <Download size={13} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AppDrawer
        open={requestDocDrawer}
        onClose={() => setRequestDocDrawer(false)}
        title="Request Document"
        subtitle="Submit a request for a specific document from the operations team"
        footer={
          <>
            <button
              onClick={() => setRequestDocDrawer(false)}
              style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={handleRequestSubmit}
              style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Submit Request
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Document Type</label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              style={inputStyle}
            >
              {['Lease Agreement', 'Insurance Certificate', 'Inspection Report', 'Compliance Certificate', 'Other'].map(opt => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={docNotes}
              onChange={e => setDocNotes(e.target.value)}
              placeholder="Any additional details about the document you need…"
              style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
            />
          </div>
        </div>
      </AppDrawer>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </motion.div>
  )
}

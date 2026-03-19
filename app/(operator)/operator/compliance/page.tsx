'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Info, X } from 'lucide-react'

export default function ComplianceRedirect() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    router.replace('/operator/properties')
    const t1 = setTimeout(() => setVisible(true), 100)
    const t2 = setTimeout(() => setVisible(false), 5100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [router])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      maxWidth: 480, width: 'calc(100vw - 48px)',
    }}>
      <Info size={15} style={{ color: '#3b82f6', flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>
        Compliance documents are now managed per property. Select a property to view its compliance status.
      </span>
      <button
        onClick={() => setVisible(false)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 2, display: 'flex' }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

'use client'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function RestartTaskModal({ open, onClose, onConfirm }: Props) {
  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
    }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: '#111827', borderRadius: '16px 16px 0 0',
          padding: 24, paddingBottom: 40,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          Restart Task?
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 24 }}>
          This will reset the timer back to now. Any logged progress will remain.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: '#ef4444', color: '#fff', border: 'none',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Yes, Restart Timer
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: 'transparent', color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

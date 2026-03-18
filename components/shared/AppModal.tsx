'use client'
import { useEffect, useRef, ReactNode } from 'react'
import { X } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

interface AppModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  variant?: 'default' | 'danger'
  children?: ReactNode
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function AppModal({ open, onClose, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, variant = 'default', children }: AppModalProps) {
  const { accent } = useRole()
  const modalRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Focus trap: save trigger, focus first element on open; restore on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (focusable && focusable.length > 0) {
        focusable[0].focus()
      }
    } else {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
      triggerRef.current = null
    }
  }, [open])

  if (!open) return null

  const confirmBg = variant === 'danger' ? '#ef4444' : accent

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'relative',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 24,
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <h3 className="heading" style={{ fontSize: 16, color: 'var(--text-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>
        {description && <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>{description}</p>}
        {children && <div style={{ marginBottom: 20 }}>{children}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm?.(); onClose() }}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: confirmBg,
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

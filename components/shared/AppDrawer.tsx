'use client'
import { useEffect, useRef, ReactNode } from 'react'
import { X } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

interface AppDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  width?: number
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function AppDrawer({ open, onClose, title, subtitle, children, footer, width = 420 }: AppDrawerProps) {
  const { accent } = useRole()
  const drawerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Focus trap: save trigger, focus first element on open; restore on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
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

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />
      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <h2 className="heading" style={{ fontSize: 16, color: 'var(--text-primary)' }}>{title}</h2>
            {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  )
}

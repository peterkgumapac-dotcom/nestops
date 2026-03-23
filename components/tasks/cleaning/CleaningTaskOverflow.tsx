'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  onRestart: () => void
  onAddConsumables: () => void
  onReportProblem: () => void
  onLogMaintenance: () => void
}

export function CleaningTaskOverflow({ onRestart, onAddConsumables, onReportProblem, onLogMaintenance }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleItem = (fn: () => void) => {
    setOpen(false)
    fn()
  }

  const menuItems = [
    { label: 'Restart Task', icon: '↺', action: onRestart, danger: true },
    { label: 'Add Consumables', icon: '📦', action: onAddConsumables },
    { label: 'Report a Problem', icon: '⚠️', action: onReportProblem },
    { label: 'Log Maintenance Issue', icon: '🔧', action: onLogMaintenance },
    null, // separator
    { label: 'View Task History', icon: '📋', action: () => {} },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: 36, height: 36, borderRadius: 8,
          background: open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)', fontSize: 18,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}
        aria-label="Task options"
      >
        ···
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 42, zIndex: 200,
          background: '#1f2937', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          minWidth: 220, overflow: 'hidden',
        }}>
          {menuItems.map((item, i) =>
            item === null ? (
              <div key={`sep-${i}`} style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />
            ) : (
              <button
                key={item.label}
                onClick={() => handleItem(item.action)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '11px 16px',
                  background: 'none', border: 'none',
                  color: item.danger ? '#f87171' : 'rgba(255,255,255,0.8)',
                  fontSize: 14, cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

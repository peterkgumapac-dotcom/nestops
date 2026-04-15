'use client'

import { useState, useRef, useEffect } from 'react'
import { RotateCcw, Package, AlertTriangle, Wrench, ClipboardList, MoreHorizontal } from 'lucide-react'

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
    { label: 'Restart Task', icon: RotateCcw, action: onRestart, danger: true },
    { label: 'Add Consumables', icon: Package, action: onAddConsumables },
    { label: 'Report a Problem', icon: AlertTriangle, action: onReportProblem },
    { label: 'Log Maintenance Issue', icon: Wrench, action: onLogMaintenance },
    null, // separator
    { label: 'View Task History', icon: ClipboardList, action: () => {} },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] transition-colors"
        style={{
          background: open ? 'var(--bg-elevated)' : 'var(--bg-card)',
          color: 'var(--text-muted)',
        }}
        aria-label="Task options"
      >
        <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[42px] z-[200] min-w-[220px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          {menuItems.map((item, i) =>
            item === null ? (
              <div key={`sep-${i}`} className="mx-0 my-0.5 h-px bg-[var(--border)]" />
            ) : (
              <button
                key={item.label}
                onClick={() => handleItem(item.action)}
                className="flex w-full items-center gap-2.5 border-none bg-transparent px-4 py-[11px] text-left text-sm transition-colors hover:bg-[var(--bg-card)]"
                style={{
                  color: item.danger ? 'var(--status-red-fg)' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: item.danger ? 'var(--status-red-fg)' : 'var(--text-muted)' }} />
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

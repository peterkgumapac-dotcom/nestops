'use client'

import { motion } from 'framer-motion'
import { useCallback, useId } from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

export default function ToggleSwitch({ checked, onChange, disabled = false, label }: ToggleSwitchProps) {
  const id = useId()

  const handleToggle = useCallback(() => {
    if (!disabled) onChange(!checked)
  }, [checked, disabled, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleToggle()
      }
    },
    [handleToggle],
  )

  return (
    <div className="inline-flex items-center gap-2">
      {label && (
        <label htmlFor={id} className="text-sm text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: checked ? 'var(--accent)' : 'var(--bg-elevated)',
        }}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm"
          style={{
            marginLeft: checked ? 22 : 2,
          }}
        />
      </button>
    </div>
  )
}

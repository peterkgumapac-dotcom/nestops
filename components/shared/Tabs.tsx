'use client'
import { useState } from 'react'
import { useRole } from '@/context/RoleContext'

export interface Tab {
  key: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  const { accent } = useRole()

  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        marginBottom: 20,
        gap: 0,
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            style={{
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? accent : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: isActive ? `2px solid ${accent}` : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'color 0.15s ease, border-color 0.15s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: isActive ? `${accent}22` : 'var(--bg-elevated)',
                  color: isActive ? accent : 'var(--text-subtle)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

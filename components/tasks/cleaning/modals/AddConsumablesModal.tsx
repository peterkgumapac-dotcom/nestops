'use client'

import { useState } from 'react'
import type { StockItem } from '@/lib/data/inventory'

interface Props {
  open: boolean
  onClose: () => void
  items: StockItem[]
  onSubmit: (selections: { itemId: string; itemName: string; qty: number }[]) => void
}

export function AddConsumablesModal({ open, onClose, items, onSubmit }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  if (!open) return null

  const setQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const next = Math.max(0, (prev[id] ?? 0) + delta)
      return { ...prev, [id]: next }
    })
  }

  const handleSubmit = () => {
    const selections = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({
        itemId,
        itemName: items.find(i => i.id === itemId)?.name ?? itemId,
        qty,
      }))
    if (selections.length > 0) onSubmit(selections)
    setQuantities({})
    onClose()
  }

  const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0)

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
          padding: 24, paddingBottom: 40, maxHeight: '80vh', overflowY: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Log Consumables Used</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px 0' }}>
            No inventory items available
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {items.map(item => {
              const qty = quantities[item.id] ?? 0
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 12,
                  background: qty > 0 ? 'rgba(217,119,6,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${qty > 0 ? 'rgba(217,119,6,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {item.inStock} {item.unit} in stock
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={() => setQty(item.id, -1)}
                      disabled={qty === 0}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: qty === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
                        fontSize: 18, cursor: qty === 0 ? 'default' : 'pointer', lineHeight: 1,
                        opacity: qty === 0 ? 0.4 : 1,
                      }}
                    >−</button>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', minWidth: 20, textAlign: 'center' }}>
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(item.id, 1)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.4)',
                        color: '#fbbf24', fontSize: 18, cursor: 'pointer', lineHeight: 1,
                      }}
                    >+</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={totalSelected === 0}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: totalSelected > 0 ? '#d97706' : 'rgba(255,255,255,0.08)',
            color: totalSelected > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
            border: 'none', fontSize: 15, fontWeight: 700, cursor: totalSelected > 0 ? 'pointer' : 'default',
          }}
        >
          {totalSelected > 0 ? `Log ${totalSelected} item${totalSelected !== 1 ? 's' : ''}` : 'Select items to log'}
        </button>
      </div>
    </div>
  )
}

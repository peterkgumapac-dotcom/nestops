'use client'
import { motion } from 'framer-motion'
import type { StatTile } from '@/lib/data/dashboardAggregates'

interface StatTileRowProps {
  tiles: StatTile[]
}

const severityColor: Record<string, string> = {
  info: 'var(--text-muted)',
  warning: 'var(--status-warning)',
  danger: 'var(--status-danger)',
}

export default function StatTileRow({ tiles }: StatTileRowProps) {
  return (
    <div className="stat-tile-grid">
      {tiles.map((tile, i) => {
        const Icon = tile.icon
        return (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Top row: icon + number */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: `${tile.iconColor}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} strokeWidth={1.5} style={{ color: tile.iconColor }} />
              </div>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {tile.value}
              </span>
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-muted)',
                letterSpacing: '0.02em',
              }}
            >
              {tile.label}
            </span>

            {/* Sub-alerts */}
            {tile.subAlerts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
                {tile.subAlerts.map((alert, j) => (
                  <span
                    key={j}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: severityColor[alert.severity] ?? 'var(--text-muted)',
                      lineHeight: 1.4,
                    }}
                  >
                    {alert.text}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

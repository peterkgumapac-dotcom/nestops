'use client'
import { PROPERTIES } from '@/lib/data/properties'
import { getPTEBadge } from '@/lib/utils/pteUtils'
import type { Job } from '@/lib/data/staff'

interface MaintenanceTaskCardProps {
  job: Job
  isFirst: boolean
  showPteStatus?: boolean
  showRoutingHint?: boolean
  showLocation?: boolean
  showAccessCode?: boolean
  codeVisible: boolean
  onToggleCode: () => void
}

export function MaintenanceTaskCard({
  job,
  isFirst,
  showPteStatus,
  showRoutingHint,
  showLocation,
  showAccessCode,
  codeVisible,
  onToggleCode,
}: MaintenanceTaskCardProps) {
  const prop = PROPERTIES.find(p => p.id === job.propertyId)
  const pteInfo = job.pteStatus ? getPTEBadge(job.pteStatus) : null
  const accessCode = prop?.accessCodes?.[0]?.code ?? 'Check SuiteOp'

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{job.title}</span>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: isFirst ? '#0ea5e920' : '#d9770620', color: isFirst ? '#38bdf8' : '#fbbf24', flexShrink: 0, marginLeft: 8 }}>
          {isFirst ? 'NEXT UP' : 'LATER'}
        </span>
      </div>

      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
        {job.propertyName}
        {' · '}
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#0ea5e920', color: '#38bdf8', textTransform: 'uppercase' }}>
          {job.type.replace('_', ' ')}
        </span>
      </div>

      {showPteStatus && pteInfo && job.pteStatus !== 'not_required' && (
        <div style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 6, background: `${pteInfo.color}20`, color: pteInfo.color }}>
          {pteInfo.icon} {pteInfo.label}
        </div>
      )}

      {showRoutingHint && isFirst && (
        <div style={{ fontSize: 12, color: '#34d399', marginBottom: 4 }}>
          📍 Go here first
        </div>
      )}

      {showLocation && prop?.city && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
          📌 {prop.city}
        </div>
      )}

      {showAccessCode && (
        codeVisible ? (
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: 8, display: 'inline-block', marginBottom: 4 }}>
            🔑 {accessCode}
          </div>
        ) : (
          <button
            onClick={onToggleCode}
            style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', marginBottom: 4 }}
          >
            Show Code 👁
          </button>
        )
      )}
    </div>
  )
}

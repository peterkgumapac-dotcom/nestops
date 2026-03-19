'use client'

interface StaffMember {
  id: string; name: string; initials: string; role: string
  property: string; clockedIn: boolean; clockInTime: string
  shiftStart: string; late: boolean
}

interface Props {
  staff: StaffMember[]
  accent: string
}

const AVATAR_COLORS: Record<string, string> = {
  ms: '#d97706',
  fn: '#ec4899',
  bl: '#0ea5e9',
  ip: '#7c3aed',
}

export default function StaffOnDuty({ staff, accent: _accent }: Props) {
  const clockedInCount = staff.filter(s => s.clockedIn).length

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>👥 Staff On Duty</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
          {clockedInCount}/{staff.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {staff.map((s, i) => {
          const avatarBg = AVATAR_COLORS[s.id] ?? '#6b7280'

          let statusDot = '#6b7280'
          let statusText = `Starts ${s.shiftStart}`
          if (s.clockedIn) { statusDot = '#059669'; statusText = s.clockInTime }
          else if (s.late) { statusDot = '#dc2626'; statusText = 'Late' }

          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingTop: 9,
                paddingBottom: 9,
                borderBottom: i < staff.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {/* Avatar */}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
                {s.initials}
              </div>

              {/* Name + role */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.role} · {s.property}</div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusDot }} />
                <span style={{ fontSize: 11, color: statusDot === '#dc2626' ? '#dc2626' : 'var(--text-muted)', fontWeight: statusDot === '#dc2626' ? 600 : 400 }}>{statusText}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

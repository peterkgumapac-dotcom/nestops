'use client'
import { useState } from 'react'

const GREEN2 = '#15d492'
const RED = '#e24b4a'
const PURPLE = '#7c3aed'

const THREADS = [
  { id: 'bjorn', name: 'Bjorn L.', initials: 'BL', color: RED, online: false, time: '1:52 PM', ctx: ['Sunset Villa', 'Maintenance'], preview: "i cant make it. can we do tomorrow?", unread: true },
  { id: 'fatima', name: 'Fatima N.', initials: 'FN', color: PURPLE, online: true, time: '10:08 AM', ctx: ['Harbor Studio'], preview: 'Linen delivery confirmed — ETA 09:45', unread: true },
  { id: 'maria', name: 'Maria S.', initials: 'MS', color: '#1D9E75', online: true, time: '9:05 AM', ctx: ['Ocean View Apt', 'Cleaning'], preview: 'Clocked in — starting turnover now 👍', unread: false },
  { id: 'johan', name: 'Johan L.', initials: 'JL', color: '#5a5f6b', online: false, time: 'Yesterday', ctx: ['Harbor Studio'], preview: 'Deep clean done — photos attached', unread: false },
]

interface Props {
  currentUserId: string
  onSelectThread: (userId: string) => void
}

export function ChatThreadList({ currentUserId, onSelectThread }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = [
    { label: 'Team', badge: 2 },
    { label: 'Tasks', badge: 1 },
    { label: 'Properties', badge: 0 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '13px 14px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Team chat</span>
          <button style={{ fontSize: 10, fontWeight: 500, padding: '4px 10px', borderRadius: 6, background: 'rgba(29,158,117,0.10)', color: GREEN2, border: '1px solid rgba(29,158,117,0.22)', cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(29,158,117,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(29,158,117,0.10)')}
          >+ New</button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 8, padding: 3, marginBottom: 11 }}>
          {tabs.map((t, i) => (
            <button key={t.label} onClick={() => setActiveTab(i)}
              style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 500, textAlign: 'center', cursor: 'pointer', borderRadius: 5, border: i === activeTab ? '1px solid var(--border)' : 'none', background: i === activeTab ? 'var(--bg-elevated)' : 'transparent', color: i === activeTab ? 'var(--text-primary)' : 'var(--text-subtle)', fontFamily: 'system-ui,sans-serif', transition: 'all .12s' }}
            >
              {t.label}
              {t.badge > 0 && <span style={{ display: 'inline-block', background: RED, color: '#fff', fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 8, marginLeft: 3, fontFamily: 'monospace' }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Thread list */}
      <div style={{ padding: '0 6px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', flex: 1 }}>
        {THREADS.map(t => (
          <div key={t.id} onClick={() => onSelectThread(t.id)}
            style={{ display: 'flex', gap: 9, padding: '9px 8px', borderRadius: 10, cursor: 'pointer', background: t.unread ? 'rgba(255,255,255,0.03)' : 'transparent', transition: 'background .12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
            onMouseLeave={e => (e.currentTarget.style.background = t.unread ? 'rgba(255,255,255,0.03)' : 'transparent')}
          >
            {/* Avatar */}
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0, position: 'relative' }}>
              {t.initials}
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: t.online ? GREEN2 : '#5a5f6b', border: '2px solid var(--bg-elevated)' }} />
            </div>
            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{t.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{t.time}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 3, flexWrap: 'wrap' }}>
                {t.ctx.map(c => (
                  <span key={c} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-subtle)' }}>{c}</span>
                ))}
              </div>
              <div style={{ fontSize: 11, color: t.unread ? 'var(--text-muted)' : 'var(--text-subtle)', fontWeight: t.unread ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.preview}
              </div>
            </div>
            {t.unread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN2, flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
    </div>
  )
}

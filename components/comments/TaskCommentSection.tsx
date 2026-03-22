'use client'
import { useState, useEffect } from 'react'

const GREEN = '#1D9E75', GREEN2 = '#15d492', GBG = 'rgba(29,158,117,0.10)', GBORDER = 'rgba(29,158,117,0.22)'
const BLUE = '#378ADD', BBG = 'rgba(55,138,221,0.10)'
const RED = '#e24b4a'
const AMBER = '#ef9f27'
const PURPLE = '#7c3aed'

interface Reaction { emoji: string; count: number; mine?: boolean }
interface Attachment { type: 'image' | 'doc'; name?: string; size?: string }

interface Comment {
  id: string
  authorInitials: string
  authorColor: string
  authorName: string
  role: string
  time: string
  text: string
  mentions?: string[]
  reactions: Reaction[]
  attachments?: Attachment[]
}

interface SysEvent { id: string; text: string; color: string }
type FeedItem = { kind: 'comment'; data: Comment } | { kind: 'event'; data: SysEvent }

const INITIAL_FEED: FeedItem[] = [
  { kind: 'event', data: { id: 'e1', text: 'Task created · Harbor Studio · 09:00', color: BLUE } },
  {
    kind: 'comment',
    data: {
      id: 'c1', authorInitials: 'JL', authorColor: GREEN, authorName: 'Johan L.', role: 'Cleaning staff', time: '09:15',
      text: "Arrived at Harbor Studio. Linen delivery isn't here yet — supplier said between 09:00 and 10:00. Can't start without fresh linens. Going to start on bathrooms and kitchen first.",
      reactions: [{ emoji: '👍', count: 2, mine: true }, { emoji: '✅', count: 1 }],
    },
  },
  {
    kind: 'comment',
    data: {
      id: 'c2', authorInitials: 'FN', authorColor: PURPLE, authorName: 'Fatima N.', role: 'Guest services', time: '09:32',
      text: '@Johan L. called the supplier — running 45 min late, ETA now 09:45. Also flagging @Peter K. — guest check-in is 14:00 so we still have time but it\'s tight.',
      mentions: ['Johan L.', 'Peter K.'],
      reactions: [{ emoji: '👀', count: 1 }],
    },
  },
  { kind: 'event', data: { id: 'e2', text: 'Status changed to Blocked · Johan L. · 09:35', color: RED } },
  {
    kind: 'comment',
    data: {
      id: 'c3', authorInitials: 'JL', authorColor: GREEN, authorName: 'Johan L.', role: 'Cleaning staff', time: '10:02',
      text: 'Delivery just arrived. Photos below — everything checks out. Starting linens now. Attaching delivery receipt.',
      reactions: [{ emoji: '✅', count: 1, mine: true }],
      attachments: [{ type: 'image' }, { type: 'image' }, { type: 'image' }, { type: 'doc', name: 'delivery_receipt.pdf', size: '84 KB' }],
    },
  },
]

const TEAM = [
  { id: 's1', initials: 'JL', name: 'Johan L.', role: 'Cleaning · Harbor Studio', color: GREEN, online: true },
  { id: 's4', initials: 'FN', name: 'Fatima N.', role: 'Guest services · Remote', color: PURPLE, online: true },
  { id: 's3', initials: 'BL', name: 'Bjorn L.', role: 'Maintenance · Sunset Villa', color: RED, online: false },
]

interface Props { taskId: string; propertyId: string }

export function TaskCommentSection({ taskId, propertyId }: Props) {
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED)
  const [draft, setDraft] = useState('')
  const [openBell, setOpenBell] = useState<string | null>(null)
  const [showMention, setShowMention] = useState(false)
  const [staged, setStaged] = useState<string[]>(['inspection_photo.jpg'])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!(e.target as Element).closest('.ncs-bell')) setOpenBell(null)
      if (!(e.target as Element).closest('.ncs-mention') && !(e.target as Element).closest('.ncs-textarea'))
        setShowMention(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggleReaction(commentId: string, emoji: string) {
    setFeed(prev => prev.map(item => {
      if (item.kind !== 'comment' || item.data.id !== commentId) return item
      const reactions = item.data.reactions.map(r =>
        r.emoji !== emoji ? r : r.mine ? { ...r, count: r.count - 1, mine: false } : { ...r, count: r.count + 1, mine: true }
      )
      return { ...item, data: { ...item.data, reactions } }
    }))
  }

  function submit() {
    if (!draft.trim() && staged.length === 0) return
    const c: Comment = {
      id: `c${Date.now()}`, authorInitials: 'PK', authorColor: `linear-gradient(135deg,${GREEN},#0a7a5a)`,
      authorName: 'Peter K.', role: 'Operator',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      text: draft, reactions: [],
      attachments: staged.length ? staged.map(f => ({ type: 'doc' as const, name: f })) : undefined,
    }
    setFeed(prev => [...prev, { kind: 'comment', data: c }])
    setDraft('')
    setStaged([])
  }

  function renderText(c: Comment) {
    if (!c.mentions?.length) return <>{c.text}</>
    const parts: React.ReactNode[] = []
    let rem = c.text
    for (const m of c.mentions) {
      const idx = rem.indexOf(`@${m}`)
      if (idx === -1) continue
      parts.push(rem.slice(0, idx))
      parts.push(<span key={m} style={{ display: 'inline-flex', alignItems: 'center', background: BBG, color: BLUE, borderRadius: 4, padding: '0 5px', fontWeight: 500, fontSize: 11.5, cursor: 'pointer' }}>@{m}</span>)
      rem = rem.slice(idx + m.length + 1)
    }
    parts.push(rem)
    return <>{parts}</>
  }

  const btnBase: React.CSSProperties = { width: 25, height: 25, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-subtle)', border: 'none', background: 'transparent', fontSize: 11, fontWeight: 600, fontFamily: 'system-ui,sans-serif', transition: 'all .12s' }

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        Comments
        <span style={{ fontFamily: 'monospace' }}>{feed.filter(f => f.kind === 'comment').length}</span>
      </div>

      {feed.map(item => {
        if (item.kind === 'event') {
          const ev = item.data
          return (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <div style={{ fontSize: 10, color: 'var(--text-subtle)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                {ev.text}
              </div>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          )
        }

        const c = item.data
        return (
          <div key={c.id}
            style={{ display: 'flex', gap: 10, marginBottom: 14 }}
            onMouseEnter={e => { const el = e.currentTarget.querySelector<HTMLElement>('.ncs-actions'); if (el) el.style.opacity = '1' }}
            onMouseLeave={e => { const el = e.currentTarget.querySelector<HTMLElement>('.ncs-actions'); if (el) el.style.opacity = '0' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.authorColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff', flexShrink: 0, marginTop: 2 }}>
              {c.authorInitials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{c.authorName}</span>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)', padding: '1px 6px', borderRadius: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>{c.role}</span>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'monospace', marginLeft: 'auto' }}>{c.time}</span>
                {/* Bell */}
                <div className="ncs-bell" style={{ position: 'relative', marginLeft: 4 }}>
                  <button
                    onClick={() => setOpenBell(openBell === c.id ? null : c.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, cursor: 'pointer', color: openBell === c.id ? AMBER : 'var(--text-subtle)', border: 'none', background: 'transparent' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1.5a5 5 0 015 5c0 3 1.5 4 1.5 4h-13S3 9.5 3 6.5a5 5 0 015-5z"/><path d="M6.5 10.5a1.5 1.5 0 003 0"/></svg>
                  </button>
                  {openBell === c.id && (
                    <div style={{ position: 'absolute', right: 0, top: 22, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, padding: 4, zIndex: 30, width: 160, boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
                      {['Remind me', 'Alert Fatima N.', 'Alert operator'].map(opt => (
                        <div key={opt} onClick={() => setOpenBell(null)}
                          style={{ padding: '7px 10px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 6 }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >{opt}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '0 10px 10px 10px', padding: '9px 11px' }}>
                {renderText(c)}
              </div>

              {/* Attachments */}
              {c.attachments && (
                <>
                  {c.attachments.filter(a => a.type === 'image').length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                      {c.attachments.filter(a => a.type === 'image').map((_, i) => (
                        <div key={i} style={{ width: 76, height: 56, borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        </div>
                      ))}
                    </div>
                  )}
                  {c.attachments.filter(a => a.type === 'doc').map((a, i) => (
                    <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', marginTop: 6, maxWidth: 200 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 5, background: BBG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke={BLUE} strokeWidth="1.5"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{a.name}</div>
                        {a.size && <div style={{ fontSize: 9, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{a.size}</div>}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Reactions */}
              <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {c.reactions.map(r => (
                  <button key={r.emoji} onClick={() => toggleReaction(c.id, r.emoji)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, border: `1px solid ${r.mine ? GBORDER : 'var(--border)'}`, background: r.mine ? GBG : 'var(--bg-elevated)', fontSize: 11, cursor: 'pointer', color: r.mine ? GREEN2 : 'var(--text-muted)', fontFamily: 'system-ui,sans-serif' }}
                  >
                    {r.emoji} <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 600 }}>{r.count}</span>
                  </button>
                ))}
                <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 20, border: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer', color: 'var(--text-subtle)', fontFamily: 'system-ui,sans-serif' }}>+</button>
              </div>

              {/* Hover actions */}
              <div className="ncs-actions" style={{ display: 'flex', gap: 2, marginTop: 4, opacity: 0, transition: 'opacity .12s' }}>
                {['Reply', 'React', 'Edit'].map(a => (
                  <button key={a} style={{ fontSize: 10, color: 'var(--text-subtle)', padding: '2px 7px', borderRadius: 4, cursor: 'pointer', border: 'none', background: 'transparent', fontFamily: 'system-ui,sans-serif' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-subtle)' }}
                  >{a}</button>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {/* @mention dropdown */}
      {showMention && (
        <div className="ncs-mention" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, margin: '0 0 6px' }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-subtle)', padding: '4px 9px 6px' }}>Team members</div>
          {TEAM.map((m, i) => (
            <div key={m.id} onClick={() => { setDraft(d => d.replace(/@\w*$/, `@${m.name} `)); setShowMention(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 6, cursor: 'pointer', background: i === 0 ? 'var(--bg-elevated)' : 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = i === 0 ? 'var(--bg-elevated)' : 'transparent')}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{m.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{m.role}</div>
              </div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.online ? GREEN2 : 'var(--text-subtle)' }} />
            </div>
          ))}
        </div>
      )}

      {/* Composer */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${GREEN},#0a7a5a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff', flexShrink: 0, marginTop: 2 }}>PK</div>
        <div style={{ flex: 1, minWidth: 0, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 11, overflow: 'hidden' }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = GBORDER)}
          onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '7px 9px', borderBottom: '1px solid var(--border)' }}>
            {[['B', {}], ['I', { fontStyle: 'italic' as const }], ['S', { textDecoration: 'line-through' as const }]].map(([label, extra]) => (
              <button key={label as string} style={{ ...btnBase, ...(extra as object) }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-subtle)' }}
              >{label as string}</button>
            ))}
            <div style={{ width: 1, height: 15, background: 'var(--border)', margin: '0 3px' }} />
            <button style={btnBase}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-subtle)' }}
            ><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4L1 8l4 4M11 4l4 4-4 4"/></svg></button>
            <div style={{ width: 1, height: 15, background: 'var(--border)', margin: '0 3px' }} />
            <button style={{ ...btnBase, color: BLUE }} onClick={() => setShowMention(true)}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            ><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3"/><path d="M11 8a3 3 0 006 0 6 6 0 10-2.5 4.8"/></svg></button>
          </div>

          {/* Staged files */}
          {staged.length > 0 && (
            <div style={{ display: 'flex', gap: 6, padding: '6px 12px', flexWrap: 'wrap' }}>
              {staged.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, background: 'var(--bg-page)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
                  {f}
                  <button onClick={() => setStaged(s => s.filter(x => x !== f))} style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: 9, fontFamily: 'system-ui,sans-serif', padding: 0 }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <textarea className="ncs-textarea" value={draft}
            onChange={e => { setDraft(e.target.value); setShowMention(/@\w*$/.test(e.target.value)) }}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit() }}
            placeholder="Add a comment… type @ to mention someone" rows={2}
            style={{ width: '100%', padding: '10px 12px', minHeight: 60, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'system-ui,sans-serif' }}
          />

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderTop: '1px solid var(--border)' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, fontSize: 11, color: 'var(--text-subtle)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13.5 8.5L8 14a4 4 0 01-5.6-5.7l6-6a2.5 2.5 0 013.5 3.6L6 11.5a1 1 0 01-1.4-1.4L10 4.7"/></svg>
              Attach
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>⌘ + Enter</span>
              <button onClick={submit} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, background: GREEN, color: '#fff', fontSize: 11.5, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.background = GREEN2)}
                onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8h12M9 4l5 4-5 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

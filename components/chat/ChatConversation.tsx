'use client'
import { useState } from 'react'

const GREEN = '#1D9E75', GREEN2 = '#15d492', GBORDER = 'rgba(29,158,117,0.22)'
const RED = '#e24b4a'

interface Message {
  id: string
  text: string
  time: string
  isMe: boolean
  ctxChip?: string
  readReceipt?: boolean
}

interface Thread {
  id: string
  name: string
  initials: string
  color: string
  ctx: string
  status?: string
  messages: Message[]
}

const THREADS: Record<string, Thread> = {
  bjorn: {
    id: 'bjorn', name: 'Bjorn L.', initials: 'BL', color: RED,
    ctx: 'Maintenance · Sunset Villa', status: '349 min late',
    messages: [
      { id: 'm1', text: 'hey bjorn, heater issue at unit 4B. guest is out 10–2. can you swing by?', time: '9:22 AM', isMe: true, ctxChip: 'Heater repair · Downtown Loft', readReceipt: true },
      { id: 'm2', text: 'hey which property again lol i have 3 jobs today 😅', time: '10:15 AM', isMe: false },
      { id: 'm3', text: 'downtown loft unit 4B, 2nd floor. out 10–2', time: '10:17 AM', isMe: true, readReceipt: true },
      { id: 'm4', text: "i cant make it. can we do tomorrow?", time: '1:52 PM', isMe: false },
    ],
  },
  fatima: {
    id: 'fatima', name: 'Fatima N.', initials: 'FN', color: 'var(--status-purple-fg)',
    ctx: 'Guest services · Harbor Studio',
    messages: [
      { id: 'm1', text: 'Linen delivery confirmed — ETA 09:45', time: '10:08 AM', isMe: false },
    ],
  },
  guest_sarah: {
    id: 'guest_sarah', name: 'Sarah K.', initials: 'SK', color: '#e67e22',
    ctx: 'Guest · Ocean View Apt',
    messages: [
      { id: 'm1', text: 'Hi, what time can I check in today?', time: '11:30 AM', isMe: false },
      { id: 'm2', text: 'Hi Sarah! Check-in is from 3 PM. I can arrange early check-in at 1 PM if needed — just let me know!', time: '11:32 AM', isMe: true, readReceipt: true },
      { id: 'm3', text: '1 PM would be perfect! How much is it?', time: '11:35 AM', isMe: false },
    ],
  },
  guest_thomas: {
    id: 'guest_thomas', name: 'Thomas B.', initials: 'TB', color: '#3498db',
    ctx: 'Guest · Sunset Villa',
    messages: [
      { id: 'm1', text: 'Hi there! I saw you offer a welcome basket — I\'d like to add one please.', time: '10:15 AM', isMe: false },
      { id: 'm2', text: 'Great choice Thomas! I\'ve added the welcome basket (250 NOK). It\'ll be ready when you arrive. 🧺', time: '10:18 AM', isMe: true, readReceipt: true },
    ],
  },
  guest_emma: {
    id: 'guest_emma', name: 'Emma L.', initials: 'EL', color: '#9b59b6',
    ctx: 'Guest · Harbor Studio',
    messages: [
      { id: 'm1', text: 'The Wi-Fi password isn\'t working. I\'ve tried it several times.', time: '3:20 PM', isMe: false },
      { id: 'm2', text: 'Sorry about that Emma! The password was recently changed. The new one is: HarborStudio2026. Let me know if it works!', time: '3:24 PM', isMe: true, readReceipt: true },
      { id: 'm3', text: 'That worked, thank you!', time: '3:26 PM', isMe: false },
    ],
  },
  guest_anders: {
    id: 'guest_anders', name: 'Anders M.', initials: 'AM', color: '#1abc9c',
    ctx: 'Guest · Downtown Loft',
    messages: [
      { id: 'm1', text: 'Thanks for a wonderful stay! The apartment was spotless and the location is unbeatable. 🙏', time: '10:00 AM', isMe: false },
      { id: 'm2', text: 'Thank you Anders, we\'re so glad you enjoyed it! Don\'t forget to leave a review — it really helps. Safe travels!', time: '10:15 AM', isMe: true, readReceipt: true },
    ],
  },
}

interface Props {
  currentUserId: string
  otherUserId: string
  onBack: () => void
}

export function ChatConversation({ currentUserId, otherUserId, onBack }: Props) {
  const thread = THREADS[otherUserId] ?? THREADS.bjorn
  const [messages, setMessages] = useState<Message[]>(thread.messages)
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return
    setMessages(prev => [...prev, {
      id: `m${Date.now()}`, text: input,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isMe: true, readReceipt: false,
    }])
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '11px 13px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-subtle)', border: 'none', background: 'transparent' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-subtle)' }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 4l-4 4 4 4"/></svg>
        </button>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: thread.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{thread.initials}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }}>{thread.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {thread.ctx}{thread.status && <> · <span style={{ color: RED }}>{thread.status}</span></>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 11, display: 'flex', flexDirection: 'column', gap: 4, scrollbarWidth: 'none' }}>
        <div style={{ alignSelf: 'center', fontSize: 10, color: 'var(--text-subtle)', background: 'var(--bg-card)', padding: '3px 10px', borderRadius: 8, margin: '3px 0' }}>
          Today · {thread.ctx}
        </div>

        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.isMe ? 'flex-end' : 'flex-start' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', maxWidth: '85%', flexDirection: m.isMe ? 'row-reverse' : 'row' }}>
              {!m.isMe && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: thread.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{thread.initials}</div>
              )}
              <div style={{
                padding: '7px 10px', borderRadius: 12, fontSize: 11.5, lineHeight: 1.5, color: m.isMe ? '#fff' : 'var(--text-primary)',
                background: m.isMe ? GREEN : 'var(--bg-card)',
                borderBottomRightRadius: m.isMe ? 3 : 12, borderBottomLeftRadius: m.isMe ? 12 : 3,
              }}>
                {m.ctxChip && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)', marginBottom: 4 }}>
                    {m.ctxChip}
                  </div>
                )}
                <div>{m.text}</div>
              </div>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-subtle)', fontFamily: 'monospace', padding: '1px 3px', textAlign: m.isMe ? 'right' : 'left' }}>
              {m.time}{m.readReceipt ? ' ✓✓' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '9px 11px 11px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, padding: '7px 9px' }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = GBORDER)}
          onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={`Message ${thread.name.split(' ')[0]}…`} rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'system-ui,sans-serif', fontSize: 12, color: 'var(--text-primary)', resize: 'none', height: 18, lineHeight: 1.5 }}
          />
          <button onClick={send} style={{ width: 26, height: 26, borderRadius: 6, background: GREEN, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.background = GREEN2)}
            onMouseLeave={e => (e.currentTarget.style.background = GREEN)}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5"><path d="M2 8h12M9 4l5 4-5 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

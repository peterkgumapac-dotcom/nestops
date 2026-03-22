'use client'
import { useState } from 'react'
import { ChatThreadList } from './ChatThreadList'
import { ChatConversation } from './ChatConversation'

const GREEN = '#1D9E75', GREEN2 = '#15d492'
const RED = '#e24b4a'

export function ChatBubble() {
  const [open, setOpen] = useState(false)
  const [activeThread, setActiveThread] = useState<string | null>(null)

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 84, right: 20, width: 320, height: 480,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 14, overflow: 'hidden', zIndex: 200,
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Slide: thread list or conversation */}
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            {/* Thread list */}
            <div style={{ position: 'absolute', inset: 0, transition: 'transform .22s cubic-bezier(.4,0,.2,1)', transform: activeThread ? 'translateX(-100%)' : 'translateX(0)' }}>
              <ChatThreadList currentUserId="me" onSelectThread={id => setActiveThread(id)} />
            </div>
            {/* Conversation */}
            <div style={{ position: 'absolute', inset: 0, transition: 'transform .22s cubic-bezier(.4,0,.2,1)', transform: activeThread ? 'translateX(0)' : 'translateX(100%)' }}>
              {activeThread && (
                <ChatConversation currentUserId="me" otherUserId={activeThread} onBack={() => setActiveThread(null)} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bubble button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 20, width: 52, height: 52,
          borderRadius: '50%', background: open ? 'var(--bg-card)' : GREEN,
          border: open ? '1px solid var(--border)' : 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 201, boxShadow: open ? 'none' : '0 4px 20px rgba(0,0,0,0.35)',
          transition: 'all .2s',
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = GREEN2 }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = GREEN }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        )}
        {/* Unread badge */}
        {!open && (
          <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: RED, border: '2px solid var(--bg-page)', fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>3</div>
        )}
      </button>
    </>
  )
}

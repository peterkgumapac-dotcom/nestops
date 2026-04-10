'use client'

import { useState } from 'react'
import PageHeader from '@/components/shared/PageHeader'
import GuestServicesNav from '@/components/guest-services/GuestServicesNav'
import { ChatThreadList } from '@/components/chat/ChatThreadList'
import { ChatConversation } from '@/components/chat/ChatConversation'
import { MessageCircle } from 'lucide-react'

export default function MessagingInboxPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null)

  return (
    <div>
      <PageHeader
        title="Messaging"
        subtitle="Guest and team conversations"
      />
      <GuestServicesNav />

      <div
        className="overflow-hidden rounded-xl border border-[var(--border)]"
        style={{ height: 'calc(100vh - 240px)', minHeight: 480, display: 'flex' }}
      >
        {/* Left sidebar — thread list */}
        <div
          className="shrink-0 border-r border-[var(--border)]"
          style={{ width: 320, background: 'var(--bg-elevated)' }}
        >
          <ChatThreadList
            currentUserId="operator"
            onSelectThread={setSelectedThread}
          />
        </div>

        {/* Right — conversation or empty state */}
        <div className="flex-1" style={{ background: 'var(--bg-elevated)' }}>
          {selectedThread ? (
            <ChatConversation
              currentUserId="operator"
              otherUserId={selectedThread}
              onBack={() => setSelectedThread(null)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--text-subtle)]">
              <MessageCircle className="h-10 w-10 opacity-30" />
              <span className="text-sm">Select a conversation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

interface Props {
  currentUserId: string
  onSelectThread: (userId: string) => void
}

// TODO: Step 19 implementation
export function ChatThreadList({ currentUserId, onSelectThread }: Props) {
  return <div data-slot="chat-thread-list" />
}

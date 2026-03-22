'use client'

interface Props {
  currentUserId: string
  otherUserId: string
  onBack: () => void
}

// TODO: Step 19-20 implementation
export function ChatConversation({ currentUserId, otherUserId, onBack }: Props) {
  return <div data-slot="chat-conversation" />
}

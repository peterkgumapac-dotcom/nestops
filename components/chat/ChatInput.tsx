'use client'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

// TODO: Step 19 implementation — auto-resize textarea
export function ChatInput({ onSend, disabled }: Props) {
  return <div data-slot="chat-input" />
}

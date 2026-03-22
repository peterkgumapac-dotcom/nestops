'use client'

interface Props {
  commentId: string
  taskId: string
  propertyId: string
  content: string
  assigneeId?: string
  currentUserId: string
}

// TODO: Step 16 implementation
export function BellIcon({ commentId, taskId, propertyId, content, assigneeId, currentUserId }: Props) {
  return <div data-slot="bell-icon" />
}

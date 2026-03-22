'use client'

interface Props {
  taskId: string
  propertyId: string
}

// TODO: Step 11 — display, Step 18 — wired to Supabase
export function TaskCommentSection({ taskId, propertyId }: Props) {
  return <div data-slot="task-comment-section" />
}

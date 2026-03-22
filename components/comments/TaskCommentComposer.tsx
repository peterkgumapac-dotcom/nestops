'use client'

interface Props {
  taskId: string
  propertyId: string
  authorId: string
  onSubmit?: () => void
}

// TODO: Step 12 — rich contenteditable + toolbar
export function TaskCommentComposer({ taskId, propertyId, authorId, onSubmit }: Props) {
  return <div data-slot="task-comment-composer" />
}

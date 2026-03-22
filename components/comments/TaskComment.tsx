'use client'

import { type TaskComment } from '@/lib/supabase/comments'

interface Props {
  comment: TaskComment
  currentUserId: string
}

// TODO: Step 11 implementation
export function TaskCommentItem({ comment, currentUserId }: Props) {
  return <div data-slot="task-comment" data-id={comment.id} />
}

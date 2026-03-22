'use client'

interface Props {
  commentId: string
  currentUserId: string
}

// TODO: Step 15 implementation
export function CommentReactions({ commentId, currentUserId }: Props) {
  return <div data-slot="comment-reactions" />
}

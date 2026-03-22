'use client'

import { type TaskComment } from '@/lib/supabase/comments'

interface Props {
  comment: TaskComment
}

// TODO: Step 17 implementation
export function SystemEventMarker({ comment }: Props) {
  return <div data-slot="system-event-marker" />
}

'use client'

import { type ResolutionType } from '@/lib/supabase/tasks'

interface Props {
  taskId: string
  beforePhotoUrls: string[]
  afterPhotoUrls: string[]
  onResolved: (type: ResolutionType) => void
}

// TODO: Step 8 implementation
export function ResolutionSelector({ taskId, beforePhotoUrls, afterPhotoUrls, onResolved }: Props) {
  return <div data-slot="resolution-selector" />
}

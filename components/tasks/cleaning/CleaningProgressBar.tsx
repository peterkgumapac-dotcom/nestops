'use client'

import { type CleaningProgress } from '@/hooks/tasks/useCleaningProgress'

interface Props {
  progress: CleaningProgress
}

export function CleaningProgressBar({ progress }: Props) {
  // TODO: Step 3 implementation
  return <div data-slot="cleaning-progress-bar" />
}

'use client'

import { type MentionUser } from '@/lib/supabase/mentions'

interface Props {
  results: MentionUser[]
  selectedIndex: number
  onSelect: (user: MentionUser) => void
  anchorRect?: DOMRect
}

// TODO: Step 13 implementation
export function MentionDropdown({ results, selectedIndex, onSelect, anchorRect }: Props) {
  return <div data-slot="mention-dropdown" />
}

'use client'

import { useState, useCallback } from 'react'
import { searchTeamMembers, type MentionUser } from '@/lib/supabase/mentions'

export function useMentionSearch(propertyId: string) {
  const [results, setResults] = useState<MentionUser[]>([])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const search = useCallback(
    async (q: string) => {
      setQuery(q)
      if (!q) { setResults([]); return }
      const data = await searchTeamMembers(propertyId, q)
      setResults(data)
      setOpen(data.length > 0)
    },
    [propertyId]
  )

  function close() {
    setOpen(false)
    setResults([])
    setQuery('')
  }

  return { results, open, query, search, close }
}

'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface Reaction {
  emoji: string
  count: number
  mine: boolean
}

export function useCommentReactions(commentId: string, currentUserId: string) {
  const [reactions, setReactions] = useState<Reaction[]>([])

  async function load() {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
      .from('task_comment_reactions')
      .select('emoji, user_id')
      .eq('comment_id', commentId)
    if (!data) return
    const map = new Map<string, { count: number; mine: boolean }>()
    for (const r of data) {
      const entry = map.get(r.emoji) ?? { count: 0, mine: false }
      entry.count++
      if (r.user_id === currentUserId) entry.mine = true
      map.set(r.emoji, entry)
    }
    setReactions(Array.from(map.entries()).map(([emoji, v]) => ({ emoji, ...v })))
  }

  useEffect(() => {
    load()
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`reactions:${commentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_comment_reactions', filter: `comment_id=eq.${commentId}` },
        () => load()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [commentId, currentUserId])

  async function toggle(emoji: string) {
    const supabase = getSupabaseBrowserClient()
    const existing = reactions.find((r) => r.emoji === emoji && r.mine)

    // Optimistic update
    setReactions((prev) =>
      prev
        .map((r) => {
          if (r.emoji !== emoji) return r
          return existing
            ? { ...r, count: r.count - 1, mine: false }
            : { ...r, count: r.count + 1, mine: true }
        })
        .filter((r) => r.count > 0)
    )
    if (!existing && !reactions.find((r) => r.emoji === emoji)) {
      setReactions((prev) => [...prev, { emoji, count: 1, mine: true }])
    }

    try {
      if (existing) {
        await supabase
          .from('task_comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUserId)
          .eq('emoji', emoji)
      } else {
        await supabase
          .from('task_comment_reactions')
          .insert({ comment_id: commentId, user_id: currentUserId, emoji })
      }
    } catch {
      // revert on error
      load()
    }
  }

  return { reactions, toggle }
}

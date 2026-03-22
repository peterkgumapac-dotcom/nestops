'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { getUnreadCount } from '@/lib/supabase/chat'

export function useUnreadCount(recipientId: string) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!recipientId) return

    getUnreadCount(recipientId).then(setCount)

    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`unread:${recipientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `recipient_id=eq.${recipientId}`,
        },
        () => getUnreadCount(recipientId).then(setCount)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [recipientId])

  return count
}

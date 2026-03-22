'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { getDirectMessages, type ChatMessage } from '@/lib/supabase/chat'

export function useChatMessages(currentUserId: string, otherUserId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  const channelName = [currentUserId, otherUserId].sort().join(':')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDirectMessages(currentUserId, otherUserId)
      setMessages(data)
    } finally {
      setLoading(false)
    }
  }, [currentUserId, otherUserId])

  useEffect(() => {
    load()

    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`chat:direct:${channelName}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const msg = payload.new as ChatMessage
          const isRelevant =
            (msg.sender_id === currentUserId && msg.recipient_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.recipient_id === currentUserId)
          if (isRelevant) {
            setMessages((prev) => [...prev, msg])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, otherUserId, channelName, load])

  function optimisticAdd(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg])
  }

  return { messages, loading, optimisticAdd }
}

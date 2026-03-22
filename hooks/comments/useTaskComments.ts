'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { getTaskComments, type TaskComment } from '@/lib/supabase/comments'

export function useTaskComments(taskId: string) {
  const [comments, setComments] = useState<TaskComment[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTaskComments(taskId)
      setComments(data)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    load()

    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`task-comments:${taskId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments((prev) => [...prev, payload.new as TaskComment])
          } else if (payload.eventType === 'UPDATE') {
            setComments((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as TaskComment) : c))
            )
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [taskId, load])

  function optimisticAdd(comment: TaskComment) {
    setComments((prev) => [...prev, comment])
  }

  function optimisticRemove(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  return { comments, loading, reload: load, optimisticAdd, optimisticRemove }
}

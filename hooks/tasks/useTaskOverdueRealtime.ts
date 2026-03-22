'use client'

import { useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function useTaskOverdueRealtime(
  taskId: string,
  onOverdue: () => void
) {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`task-overdue:${taskId}`)
      .on('broadcast', { event: 'overdue' }, () => onOverdue())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [taskId, onOverdue])
}

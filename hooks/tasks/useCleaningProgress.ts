'use client'

import { useState, useEffect, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export type ProgressState = 'ontrack' | 'approaching' | 'overdue' | 'done'

export interface CleaningProgress {
  percent: number
  state: ProgressState
  bufferMinutes: number
  estimatedEndTime: Date
  isLateStart: boolean
  lateStartMinutes: number
  elapsedMinutes: number
}

interface UseCleaningProgressOptions {
  taskId: string
  startedAt: string | null
  estimatedDurationMinutes: number | null
  checkInTime: string | null   // ISO string for scheduled check-in
  scheduledStartTime: string | null
  status: string
}

export function useCleaningProgress({
  taskId,
  startedAt,
  estimatedDurationMinutes,
  checkInTime,
  scheduledStartTime,
  status,
}: UseCleaningProgressOptions): CleaningProgress | null {
  const [progress, setProgress] = useState<CleaningProgress | null>(null)
  const overdueFiredfRef = useRef(false)

  function compute(): CleaningProgress | null {
    if (!startedAt || !estimatedDurationMinutes) return null

    if (status === 'done') {
      return {
        percent: 100,
        state: 'done',
        bufferMinutes: 0,
        estimatedEndTime: new Date(startedAt),
        isLateStart: false,
        lateStartMinutes: 0,
        elapsedMinutes: 0,
      }
    }

    const now = Date.now()
    const start = new Date(startedAt).getTime()
    const elapsedMs = now - start
    const elapsedMinutes = elapsedMs / 60_000
    const percent = Math.min(
      Math.round((elapsedMinutes / estimatedDurationMinutes) * 100),
      150
    )

    let state: ProgressState
    if (percent >= 100) state = 'overdue'
    else if (percent >= 80) state = 'approaching'
    else state = 'ontrack'

    const estimatedEndTime = new Date(start + estimatedDurationMinutes * 60_000)
    const bufferMinutes = checkInTime
      ? (new Date(checkInTime).getTime() - estimatedEndTime.getTime()) / 60_000
      : 0

    const isLateStart = scheduledStartTime
      ? start > new Date(scheduledStartTime).getTime() + 5 * 60_000
      : false
    const lateStartMinutes = scheduledStartTime && isLateStart
      ? (start - new Date(scheduledStartTime).getTime()) / 60_000
      : 0

    return { percent, state, bufferMinutes, estimatedEndTime, isLateStart, lateStartMinutes, elapsedMinutes }
  }

  useEffect(() => {
    const tick = () => {
      const result = compute()
      setProgress(result)

      // Broadcast overdue event once via Supabase Realtime
      if (result?.state === 'overdue' && !overdueFiredfRef.current) {
        overdueFiredfRef.current = true
        const supabase = getSupabaseBrowserClient()
        supabase.channel(`task-overdue:${taskId}`).send({
          type: 'broadcast',
          event: 'overdue',
          payload: { taskId },
        })
      }
    }

    tick()
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, estimatedDurationMinutes, checkInTime, scheduledStartTime, status])

  return progress
}

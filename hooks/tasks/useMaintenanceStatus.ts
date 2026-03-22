'use client'

import { useState } from 'react'
import { updateTask, type MaintenanceStatus } from '@/lib/supabase/tasks'
import { postSystemEvent } from '@/lib/supabase/comments'

const TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus | null> = {
  assigned: 'en_route',
  en_route: 'on_site',
  on_site: 'in_progress',
  in_progress: 'done',
  done: null,
}

const EVENT_COLOR: Record<MaintenanceStatus, 'blue' | 'amber' | 'green'> = {
  assigned: 'blue',
  en_route: 'amber',
  on_site: 'blue',
  in_progress: 'blue',
  done: 'green',
}

export function useMaintenanceStatus(taskId: string, userId: string) {
  const [loading, setLoading] = useState(false)

  async function advance(
    current: MaintenanceStatus,
    extra?: { eta?: string }
  ): Promise<MaintenanceStatus | null> {
    const next = TRANSITIONS[current]
    if (!next) return null
    setLoading(true)
    try {
      await updateTask(taskId, {
        maintenance_status: next,
        ...(extra?.eta ? { eta: extra.eta } : {}),
        ...(next === 'done' ? { completed_at: new Date().toISOString() } : {}),
      })
      const label: Record<MaintenanceStatus, string> = {
        assigned: 'Assigned',
        en_route: 'En route',
        on_site: 'On site',
        in_progress: 'In progress',
        done: 'Done',
      }
      const etaNote = extra?.eta
        ? ` · ETA ${new Date(extra.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : ''
      await postSystemEvent(
        taskId,
        userId,
        `Status changed to ${label[next]}${etaNote}`,
        `maintenance_status_${next}`,
        EVENT_COLOR[next]
      )
      return next
    } finally {
      setLoading(false)
    }
  }

  return { advance, loading }
}

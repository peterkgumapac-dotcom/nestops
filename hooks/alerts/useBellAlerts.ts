'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface BellAlert {
  id: string
  created_at: string
  source_comment_id?: string
  task_id?: string
  property_id?: string
  triggered_by: string
  target_user_id: string
  content: string
  read_at?: string
  snoozed_until?: string
  alert_type: 'self' | 'assignee' | 'operator'
}

export function useBellAlerts(userId: string) {
  const [alerts, setAlerts] = useState<BellAlert[]>([])
  const unread = alerts.filter((a) => !a.read_at).length

  useEffect(() => {
    if (!userId) return
    const supabase = getSupabaseBrowserClient()

    supabase
      .from('bell_alerts')
      .select('*')
      .eq('target_user_id', userId)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setAlerts(data as BellAlert[]) })

    const channel = supabase
      .channel(`bell:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bell_alerts', filter: `target_user_id=eq.${userId}` },
        (payload) => setAlerts((prev) => [payload.new as BellAlert, ...prev])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  async function markRead(alertId: string) {
    const supabase = getSupabaseBrowserClient()
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, read_at: new Date().toISOString() } : a
      )
    )
    await supabase
      .from('bell_alerts')
      .update({ read_at: new Date().toISOString() })
      .eq('id', alertId)
  }

  async function insertAlert(payload: Omit<BellAlert, 'id' | 'created_at'>) {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from('bell_alerts').insert(payload)
    if (error) throw error
  }

  return { alerts, unread, markRead, insertAlert }
}

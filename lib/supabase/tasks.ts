import { getSupabaseBrowserClient } from './client'

export type TaskType = 'cleaning' | 'maintenance'
export type MaintenanceStatus = 'assigned' | 'en_route' | 'on_site' | 'in_progress' | 'done'
export type ResolutionType = 'minor_fix' | 'fixed' | 'needs_vendor' | 'needs_parts'

export interface TaskUpdate {
  task_type?: TaskType
  estimated_duration_minutes?: number
  started_at?: string
  completed_at?: string
  actual_duration_minutes?: number
  restart_count?: number
  restart_reason?: string
  late_start_reason?: string
  delay_reason?: string
  delay_reported_at?: string
  maintenance_status?: MaintenanceStatus
  eta?: string
  resolution_type?: ResolutionType
  before_photo_urls?: string[]
  after_photo_urls?: string[]
  follow_up_required?: boolean
  status?: string
}

export async function updateTask(taskId: string, update: TaskUpdate) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(update)
    .eq('id', taskId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTask(taskId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()
  if (error) throw error
  return data
}

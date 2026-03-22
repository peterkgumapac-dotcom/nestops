import { getSupabaseBrowserClient } from './client'

export type SystemEventColor = 'blue' | 'amber' | 'red' | 'green'

export interface TaskComment {
  id: string
  created_at: string
  updated_at: string
  task_id: string
  author_id: string
  content: string
  content_html?: string
  parent_id?: string
  edited_at?: string
  is_system_event: boolean
  system_event_type?: string
  system_event_color?: SystemEventColor
}

export interface CommentInsert {
  task_id: string
  author_id: string
  content: string
  content_html?: string
  parent_id?: string
  is_system_event?: boolean
  system_event_type?: string
  system_event_color?: SystemEventColor
}

export async function getTaskComments(taskId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as TaskComment[]
}

export async function insertComment(comment: CommentInsert) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('task_comments')
    .insert(comment)
    .select()
    .single()
  if (error) throw error
  return data as TaskComment
}

export async function updateComment(commentId: string, content: string, contentHtml?: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('task_comments')
    .update({ content, content_html: contentHtml, edited_at: new Date().toISOString() })
    .eq('id', commentId)
    .select()
    .single()
  if (error) throw error
  return data as TaskComment
}

export async function postSystemEvent(
  taskId: string,
  authorId: string,
  text: string,
  eventType: string,
  color: SystemEventColor
) {
  return insertComment({
    task_id: taskId,
    author_id: authorId,
    content: text,
    is_system_event: true,
    system_event_type: eventType,
    system_event_color: color,
  })
}

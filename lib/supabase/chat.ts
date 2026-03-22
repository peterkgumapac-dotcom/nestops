import { getSupabaseBrowserClient } from './client'

export type ThreadType = 'direct' | 'property' | 'task'

export interface ChatMessage {
  id: string
  created_at: string
  sender_id: string
  recipient_id?: string
  property_id?: string
  task_id?: string
  content: string
  read_at?: string
  thread_type: ThreadType
}

export interface ChatMessageInsert {
  sender_id: string
  recipient_id?: string
  property_id?: string
  task_id?: string
  content: string
  thread_type: ThreadType
}

export async function sendMessage(msg: ChatMessageInsert) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(msg)
    .select()
    .single()
  if (error) throw error
  return data as ChatMessage
}

export async function getDirectMessages(userId1: string, userId2: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_type', 'direct')
    .or(
      `and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),` +
      `and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`
    )
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as ChatMessage[]
}

export async function markMessagesRead(messageIds: string[]) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase
    .from('chat_messages')
    .update({ read_at: new Date().toISOString() })
    .in('id', messageIds)
  if (error) throw error
}

export async function getUnreadCount(recipientId: string): Promise<number> {
  const supabase = getSupabaseBrowserClient()
  const { count, error } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', recipientId)
    .is('read_at', null)
  if (error) throw error
  return count ?? 0
}

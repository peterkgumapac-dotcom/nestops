import { getSupabaseBrowserClient } from './client'

export interface MentionUser {
  id: string
  full_name: string
  avatar_url?: string
  role?: string
}

export async function searchTeamMembers(
  propertyId: string,
  query: string
): Promise<MentionUser[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role')
    .ilike('full_name', `${query}%`)
    .limit(5)
  if (error) throw error
  return (data ?? []) as MentionUser[]
}

export async function insertMentions(
  commentId: string,
  userIds: string[]
) {
  if (!userIds.length) return
  const supabase = getSupabaseBrowserClient()
  const rows = userIds.map((id) => ({
    comment_id: commentId,
    mentioned_user_id: id,
  }))
  const { error } = await supabase.from('comment_mentions').insert(rows)
  if (error) throw error
}

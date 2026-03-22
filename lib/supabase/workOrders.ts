import { getSupabaseBrowserClient } from './client'

export type WorkOrderType = 'vendor' | 'parts'
export type WorkOrderStatus =
  | 'pending_operator'
  | 'pending_owner'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'complete'

export interface WorkOrderInsert {
  task_id: string
  property_id: string
  created_by: string
  type: WorkOrderType
  vendor_name?: string
  description: string
  notes?: string
  total_estimate?: number
  before_photo_urls?: string[]
  after_photo_urls?: string[]
  document_urls?: string[]
}

export async function insertWorkOrder(wo: WorkOrderInsert) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('work_orders')
    .insert({ ...wo, status: 'pending_operator' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateWorkOrderStatus(
  workOrderId: string,
  status: WorkOrderStatus,
  extra?: Record<string, unknown>
) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('work_orders')
    .update({ status, ...extra })
    .eq('id', workOrderId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUnfinishedWorkOrders() {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      tasks(title, property_id, properties(name)),
      created_by_profile:profiles(full_name, avatar_url)
    `)
    .in('status', ['pending_operator', 'pending_owner', 'in_progress'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getOperatorApprovalThreshold(operatorId: string): Promise<number> {
  const supabase = getSupabaseBrowserClient()
  const { data } = await supabase
    .from('operator_settings')
    .select('work_order_owner_approval_threshold')
    .eq('operator_id', operatorId)
    .single()
  return data?.work_order_owner_approval_threshold ?? 5000
}

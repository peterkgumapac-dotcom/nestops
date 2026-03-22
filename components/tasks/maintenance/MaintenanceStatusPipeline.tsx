'use client'

import { type MaintenanceStatus } from '@/lib/supabase/tasks'

interface Props {
  status: MaintenanceStatus
}

// TODO: Step 5 implementation
export function MaintenanceStatusPipeline({ status }: Props) {
  return <div data-slot="maintenance-status-pipeline" data-status={status} />
}

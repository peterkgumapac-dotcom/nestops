'use client'
import { useState } from 'react'
import { PROPERTIES } from '@/lib/data/properties'
import type { Job, JobProgress } from '@/lib/data/staff'
import { PipelineMaintenanceCard } from './PipelineMaintenanceCard'

interface MaintenanceTaskCardProps {
  job: Job
  showPteStatus?: boolean
  showLocation?: boolean
  showAccessCode?: boolean
  codeVisible: boolean
  onToggleCode: () => void
}

export function MaintenanceTaskCard({ job }: MaintenanceTaskCardProps) {
  const prop = PROPERTIES.find(p => p.id === job.propertyId)
  const [progress] = useState<JobProgress>(job.jobProgress ?? 'assigned')

  return (
    <PipelineMaintenanceCard
      id={job.id}
      title={job.title}
      propertyName={prop?.name ?? job.propertyName}
      assigneeName="Bjorn L."
      priority={job.priority}
      dueDisplay={job.dueTime}
      pteStatus={job.pteStatus}
      pteValidFrom={job.pte?.validFrom}
      pteValidUntil={job.pte?.validUntil}
      pteGuestName={job.pte?.guestName}
      progress={progress}
    />
  )
}

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
  const [progress, setProgress] = useState<JobProgress>(job.jobProgress ?? 'assigned')
  const [beforeDone, setBeforeDone] = useState(false)
  const [afterDone, setAfterDone] = useState(false)
  const [resolution, setResolution] = useState('')

  return (
    <PipelineMaintenanceCard
      id={job.id}
      title={job.title}
      propertyName={prop?.name ?? job.propertyName}
      assigneeName="Bjorn L."
      priority={job.priority}
      dueDisplay={job.dueTime}
      pteStatus={job.pteStatus}
      progress={progress}
      onProgressChange={setProgress}
      beforeDone={beforeDone}
      afterDone={afterDone}
      onBeforePhoto={() => setBeforeDone(true)}
      onAfterPhoto={() => setAfterDone(true)}
      resolution={resolution}
      onResolve={(r) => {
        setResolution(r)
        if (r === 'minor' || r === 'fixed') setProgress('done')
      }}
    />
  )
}

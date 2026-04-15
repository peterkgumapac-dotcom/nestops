'use client'
import type { PulseScene } from '@/lib/data/pulseScenes'
import SourceNode from './SourceNode'
import PropagationLines from './PropagationLines'
import RoleNode from './RoleNode'
import ResolutionBar from './ResolutionBar'

interface PropagationPanelProps {
  scene: PulseScene
  actedRoles: Record<string, boolean>
  onRoleAct: (roleId: string) => void
}

export default function PropagationPanel({ scene, actedRoles, onRoleAct }: PropagationPanelProps) {
  const allActed = scene.roles.every(r => actedRoles[r.id])

  return (
    <div className="flex flex-col gap-3 mt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
          Event Propagation
        </span>
      </div>

      <SourceNode source={scene.source} />

      <PropagationLines severity={scene.severity} roleCount={scene.roles.length} />

      {/* Role nodes 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {scene.roles.map((role, i) => (
          <RoleNode
            key={role.id}
            role={role}
            index={i}
            acted={!!actedRoles[role.id]}
            onAct={() => onRoleAct(role.id)}
          />
        ))}
      </div>

      <ResolutionBar visible={allActed} />
    </div>
  )
}

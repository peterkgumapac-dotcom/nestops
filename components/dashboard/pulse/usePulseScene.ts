'use client'
import { useState, useCallback, useMemo } from 'react'
import { PULSE_SCENES, type Severity, type PulseScene } from '@/lib/data/pulseScenes'

interface PulseSceneState {
  severity: Severity
  scene: PulseScene
  actedRoles: Record<string, boolean>
  setSeverity: (s: Severity) => void
  onRoleAct: (roleId: string) => void
}

export function usePulseScene(initialSeverity: Severity = 'red'): PulseSceneState {
  const [severity, setSeverityRaw] = useState<Severity>(initialSeverity)
  const [actedRoles, setActedRoles] = useState<Record<string, boolean>>({})

  const scene = PULSE_SCENES[severity]

  const setSeverity = useCallback((s: Severity) => {
    setSeverityRaw(s)
    setActedRoles({}) // reset actions on severity change
  }, [])

  const onRoleAct = useCallback((roleId: string) => {
    setActedRoles(prev => ({ ...prev, [roleId]: true }))
  }, [])

  return useMemo(() => ({
    severity,
    scene,
    actedRoles,
    setSeverity,
    onRoleAct,
  }), [severity, scene, actedRoles, setSeverity, onRoleAct])
}

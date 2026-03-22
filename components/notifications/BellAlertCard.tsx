'use client'

import { type BellAlert } from '@/hooks/alerts/useBellAlerts'

interface Props {
  alert: BellAlert
  onRead: (id: string) => void
}

// TODO: Step 23 implementation
export function BellAlertCard({ alert, onRead }: Props) {
  return <div data-slot="bell-alert-card" />
}

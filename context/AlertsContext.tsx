'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export type AlertType = 'urgent' | 'warning' | 'info'
export type AlertRole = 'cleaner' | 'supervisor' | 'operator'

export interface Alert {
  id: string
  type: AlertType
  title: string
  body: string
  targetRoles: AlertRole[]
  propertyName?: string
  createdAt: Date
  dismissed: boolean
  actionLabel?: string
  actionRoute?: string
}

interface AlertsContextType {
  alerts: Alert[]
  dismissAlert: (id: string) => void
  dismissAll: () => void
  getAlertsForRole: (role: AlertRole) => Alert[]
}

const AlertsContext = createContext<AlertsContextType | null>(null)

const SEED_ALERTS: Alert[] = [
  {
    id: 'a-001',
    type: 'urgent',
    title: 'Tight turnaround — Ocean View Apt',
    body: 'Checkout at 10:00, check-in at 15:00. Only 5h window. Ensure cleaning is complete by 13:30.',
    targetRoles: ['cleaner', 'supervisor'],
    propertyName: 'Ocean View Apt',
    createdAt: new Date(),
    dismissed: false,
    actionLabel: 'View Cleaning',
    actionRoute: '/app/my-tasks',
  },
  {
    id: 'a-002',
    type: 'warning',
    title: 'Upsell approval pending — Late Checkout',
    body: 'Downtown Loft — Lena Hoffmann. No cleaner assigned. Requires supervisor action.',
    targetRoles: ['supervisor'],
    propertyName: 'Downtown Loft',
    createdAt: new Date(),
    dismissed: false,
    actionLabel: 'Review Upsell',
    actionRoute: '/app/my-tasks',
  },
  {
    id: 'a-003',
    type: 'info',
    title: 'Shift starts in 30 minutes',
    body: 'Your shift at Sunset Villa begins at 14:00. Check your task list.',
    targetRoles: ['cleaner'],
    propertyName: 'Sunset Villa',
    createdAt: new Date(),
    dismissed: false,
  },
]

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(SEED_ALERTS)

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a))
  }

  const dismissAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, dismissed: true })))
  }

  const getAlertsForRole = (role: AlertRole): Alert[] => {
    return alerts.filter(a => a.targetRoles.includes(role))
  }

  return (
    <AlertsContext.Provider value={{ alerts, dismissAlert, dismissAll, getAlertsForRole }}>
      {children}
    </AlertsContext.Provider>
  )
}

export function useAlerts(): AlertsContextType {
  const ctx = useContext(AlertsContext)
  if (!ctx) throw new Error('useAlerts must be used inside AlertsProvider')
  return ctx
}

'use client'

interface Props {
  taskId: string
}

// TODO: Shared by cleaning + maintenance — Step 11
export function TaskHistoryLog({ taskId }: Props) {
  return <div data-slot="task-history-log" />
}

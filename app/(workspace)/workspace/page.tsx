import { redirect } from 'next/navigation'

export default function WorkspaceRedirect() {
  redirect('/operator/operations?tab=tasks')
}

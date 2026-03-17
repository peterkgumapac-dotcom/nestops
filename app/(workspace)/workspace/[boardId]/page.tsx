import { redirect } from 'next/navigation'

export default function BoardRedirect() {
  redirect('/operator/operations?tab=tasks')
}

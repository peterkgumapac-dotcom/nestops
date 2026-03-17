import { redirect } from 'next/navigation'

export default function CleaningRedirect() {
  redirect('/operator/operations?tab=cleaning')
}

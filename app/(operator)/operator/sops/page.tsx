import { redirect } from 'next/navigation'

export default function SopsRedirect() {
  redirect('/operator/operations?tab=sops')
}

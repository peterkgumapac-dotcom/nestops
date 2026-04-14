import { redirect } from 'next/navigation'

export default function GuestPortalRedirect() {
  redirect('/operator/guest-experience')
}

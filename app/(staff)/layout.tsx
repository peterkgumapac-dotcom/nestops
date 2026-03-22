import AppShell from '@/components/shared/AppShell'
import { ChatBubble } from '@/components/chat/ChatBubble'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <>
        {children}
        <ChatBubble />
      </>
    </AppShell>
  )
}

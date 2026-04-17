'use client'
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MessageSquare, Check } from 'lucide-react'
import type { Guidebook } from '@/lib/data/guidebooks'
import type { GuestVerification } from '@/lib/data/verification'
import BottomSheet from './BottomSheet'
import { issueStore } from '@/lib/guest/issueStore'
import { useGuestTheme } from '@/lib/guest/theme-context'

const QUICK_TEMPLATES = [
  'I have a question about the property.',
  'Something needs attention.',
  'I need help with check-in.',
  'I\'d like a recommendation.',
]

interface Props {
  open: boolean
  onClose: () => void
  guidebook: Guidebook
  verification?: GuestVerification | null
}

export default function ContactHostSheet({ open, onClose, guidebook, verification }: Props) {
  const { theme: G } = useGuestTheme()
  const reduced = useReducedMotion()
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const guestName = verification?.guestName ?? 'Guest'
  const phone = guidebook.operatorPhone

  function handleSend() {
    issueStore.addIssue({
      type: 'inquiry',
      guestName,
      propertyId: guidebook.propertyId,
      propertyName: guidebook.propertyName,
      category: 'inquiry',
      urgency: 'normal',
      description: message,
      photos: [],
    })
    setSent(true)
  }

  function handleClose() {
    setSent(false)
    setMessage('')
    onClose()
  }

  const whatsappText = encodeURIComponent(
    `Hi, I'm ${guestName} staying at ${guidebook.propertyName}. `
  )

  return (
    <BottomSheet open={open} onClose={handleClose} title="Contact Host">
      {phone && (
        <a
          href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', borderRadius: 14, marginBottom: 16,
            background: '#25D36618', border: '1px solid #25D36630',
            textDecoration: 'none', color: G.text,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>WhatsApp</div>
            <div style={{ fontSize: 13, color: G.textMuted }}>Chat directly with your host</div>
          </div>
        </a>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: G.textMuted, marginBottom: 8 }}>
          Quick message
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {QUICK_TEMPLATES.map(t => (
            <button
              key={t}
              onClick={() => setMessage(t)}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12,
                background: message === t ? G.text : G.bg,
                color: message === t ? '#fff' : G.textBody,
                border: `1px solid ${G.border}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Write your message..."
          rows={4}
          style={{
            width: '100%', padding: '10px 12px',
            border: `1px solid ${G.border}`, borderRadius: 10,
            background: G.bg, color: G.text, fontSize: 14,
            resize: 'vertical', fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={reduced ? {} : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', borderRadius: 12,
              background: G.green + '18', color: G.green,
              fontSize: 14, fontWeight: 600,
            }}
          >
            <Check size={16} /> Message sent. We&apos;ll respond shortly.
          </motion.div>
        ) : (
          <button
            key="send"
            onClick={handleSend}
            disabled={!message.trim()}
            style={{
              width: '100%', padding: '13px',
              background: message.trim() ? G.text : G.border,
              color: message.trim() ? '#fff' : G.textMuted,
              border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 600,
              cursor: message.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <MessageSquare size={16} /> Send Message
          </button>
        )}
      </AnimatePresence>
    </BottomSheet>
  )
}

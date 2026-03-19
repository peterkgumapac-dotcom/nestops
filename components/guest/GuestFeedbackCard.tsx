'use client'
import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Star, X } from 'lucide-react'
import type { GuestVerification } from '@/lib/data/verification'
import { feedbackStore } from '@/lib/guest/feedbackStore'
import { G } from '@/lib/guest/theme'

interface Props {
  guidebookId: string
  verification: GuestVerification
}

export default function GuestFeedbackCard({ guidebookId, verification }: Props) {
  const reduced = useReducedMotion()
  const [state, setState] = useState(feedbackStore.get(guidebookId))
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [thumbsDown, setThumbsDown] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const now = Date.now()
  const checkIn = new Date(verification.checkInDate).getTime()
  const checkOut = new Date(verification.checkOutDate).getTime()
  const postCheckout = now > checkOut
  const midStay = now > checkIn + 24 * 60 * 60 * 1000 && now < checkOut

  if (state.dismissed) return null
  if (postCheckout && state.postCheckoutSubmitted) return null
  if (midStay && state.midStaySubmitted) return null
  if (!midStay && !postCheckout) return null

  function dismiss() {
    feedbackStore.set(guidebookId, { dismissed: true })
    setState(prev => ({ ...prev, dismissed: true }))
  }

  function submitMidStay(positive: boolean) {
    feedbackStore.set(guidebookId, { midStaySubmitted: true })
    setSubmitted(true)
  }

  function submitPostCheckout() {
    feedbackStore.set(guidebookId, { postCheckoutSubmitted: true, rating })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <motion.div
        initial={reduced ? {} : { scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          margin: '0 16px', padding: '20px',
          background: G.green + '12', border: `1px solid ${G.green}30`,
          borderRadius: 16, textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28 }}>🙏</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: G.green, margin: '8px 0 0' }}>
          Thank you for your feedback!
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{
        margin: '0 16px',
        background: G.surface, border: `1px solid ${G.border}`,
        borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        padding: '20px',
        position: 'relative',
      }}
    >
      <button
        onClick={dismiss}
        style={{
          position: 'absolute', top: 14, right: 14,
          background: 'none', border: 'none', cursor: 'pointer',
          color: G.textMuted, padding: 4,
        }}
      >
        <X size={16} />
      </button>

      {midStay ? (
        <>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: G.text, margin: '0 0 6px' }}>
            How&apos;s everything so far?
          </h3>
          <p style={{ fontSize: 14, color: G.textMuted, margin: '0 0 16px' }}>
            We&apos;d love to make sure your stay is perfect.
          </p>

          {thumbsDown ? (
            <div>
              <textarea
                placeholder="Tell us what we can improve..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{
                  width: '100%', minHeight: 80, padding: '10px 12px',
                  border: `1px solid ${G.border}`, borderRadius: 10,
                  background: G.bg, color: G.text, fontSize: 14,
                  resize: 'vertical', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => submitMidStay(false)}
                style={{
                  marginTop: 10, width: '100%', padding: '12px',
                  background: G.green, color: '#fff',
                  border: 'none', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Send feedback
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => submitMidStay(true)}
                style={{
                  flex: 1, padding: '14px', borderRadius: 12,
                  background: G.green + '14', border: `1px solid ${G.green}30`,
                  color: G.green, fontSize: 24, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ThumbsUp size={22} />
              </button>
              <button
                onClick={() => setThumbsDown(true)}
                style={{
                  flex: 1, padding: '14px', borderRadius: 12,
                  background: G.red + '14', border: `1px solid ${G.red}30`,
                  color: G.red, fontSize: 24, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ThumbsDown size={22} />
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, color: G.text, margin: '0 0 6px' }}>
            How was your stay?
          </h3>
          <p style={{ fontSize: 14, color: G.textMuted, margin: '0 0 16px' }}>
            Your feedback helps future guests.
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <motion.button
                key={s}
                onHoverStart={() => setHovered(s)}
                onHoverEnd={() => setHovered(0)}
                onClick={() => setRating(s)}
                animate={!reduced ? { scale: s <= (hovered || rating) ? 1.15 : 1 } : {}}
                transition={{ duration: 0.15, delay: (s - 1) * 0.05 }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 4,
                }}
              >
                <Star
                  size={32}
                  fill={s <= (hovered || rating) ? '#f59e0b' : 'none'}
                  color={s <= (hovered || rating) ? '#f59e0b' : G.border}
                />
              </motion.button>
            ))}
          </div>

          <textarea
            placeholder="Any additional comments? (optional)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{
              width: '100%', minHeight: 70, padding: '10px 12px',
              border: `1px solid ${G.border}`, borderRadius: 10,
              background: G.bg, color: G.text, fontSize: 14,
              resize: 'vertical', fontFamily: 'inherit',
              boxSizing: 'border-box', marginBottom: 12,
            }}
          />

          <button
            onClick={submitPostCheckout}
            disabled={!rating}
            style={{
              width: '100%', padding: '12px',
              background: rating ? G.green : G.border,
              color: rating ? '#fff' : G.textMuted,
              border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              cursor: rating ? 'pointer' : 'default',
            }}
          >
            Submit review
          </button>
        </>
      )}
    </motion.div>
  )
}

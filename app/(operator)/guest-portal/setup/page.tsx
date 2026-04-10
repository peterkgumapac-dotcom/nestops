'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import {
  type WizardFormState,
  DEFAULT_WIZARD_FORM,
  LS_DRAFT_KEY,
  LS_COMPLETE_KEY,
  TOTAL_STEPS,
} from './types'
import VerificationStep from './steps/VerificationStep'
import GuidebookStep from './steps/GuidebookStep'
import MessagingStep from './steps/MessagingStep'
import UpsellsStep from './steps/UpsellsStep'
import SmartAccessStep from './steps/SmartAccessStep'
import ReviewStep from './steps/ReviewStep'

const STEP_LABELS = ['Verification', 'Guidebook', 'Messaging', 'Upsells', 'Smart Access', 'Review']

const stepVariants = {
  enter: (d: number) => ({ opacity: 0, x: d > 0 ? 30 : -30 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d > 0 ? -20 : 20 }),
}

export default function PortalSetupPage() {
  const { accent } = useRole()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<WizardFormState>(DEFAULT_WIZARD_FORM)
  const [direction, setDirection] = useState(1)
  const [success, setSuccess] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setStep(parsed.step ?? 1)
        setForm(parsed.form ?? DEFAULT_WIZARD_FORM)
      }
    } catch { /* ignore */ }
  }, [])

  const save = useCallback((nextStep: number, nextForm: WizardFormState) => {
    try {
      localStorage.setItem(LS_DRAFT_KEY, JSON.stringify({ step: nextStep, form: nextForm }))
    } catch { /* ignore */ }
  }, [])

  const update = useCallback((patch: Partial<WizardFormState>) => {
    setForm(prev => {
      const next = { ...prev, ...patch }
      // Persist on every change
      try {
        localStorage.setItem(LS_DRAFT_KEY, JSON.stringify({ step, form: next }))
      } catch { /* ignore */ }
      return next
    })
  }, [step])

  const next = () => {
    const ns = Math.min(step + 1, TOTAL_STEPS)
    setDirection(1)
    save(ns, form)
    setStep(ns)
  }

  const back = () => {
    const ns = Math.max(step - 1, 1)
    setDirection(-1)
    setStep(ns)
  }

  const skip = () => next()

  const handleActivate = () => {
    setSuccess(true)
    try {
      localStorage.removeItem(LS_DRAFT_KEY)
      localStorage.setItem(LS_COMPLETE_KEY, 'true')
    } catch { /* ignore */ }
    setTimeout(() => router.push('/guest-portal'), 2000)
  }

  const handleSaveExit = () => {
    save(step, form)
    router.push('/guest-portal')
  }

  const progress = (step / TOTAL_STEPS) * 100

  const renderStep = () => {
    if (success) {
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600"
          >
            <Check size={36} color="#fff" />
          </motion.div>
          <div className="text-xl font-bold text-[var(--text-primary)] mb-2">Portal Activated!</div>
          <div className="text-sm text-[var(--text-muted)]">Redirecting to your Guest Portal configuration…</div>
        </motion.div>
      )
    }

    const stepProps = { form, update, accent }

    switch (step) {
      case 1: return <VerificationStep {...stepProps} />
      case 2: return <GuidebookStep {...stepProps} />
      case 3: return <MessagingStep {...stepProps} />
      case 4: return <UpsellsStep {...stepProps} />
      case 5: return <SmartAccessStep {...stepProps} />
      case 6: return (
        <ReviewStep
          form={form}
          accent={accent}
          onEdit={() => { setDirection(-1); setStep(1) }}
          onActivate={handleActivate}
        />
      )
      default: return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-6 py-4"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-[7px] text-xs font-bold text-white"
            style={{ background: accent }}
          >
            N
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">AfterStay</span>
          <span className="text-sm text-[var(--text-subtle)]">/ Portal Setup</span>
        </div>
        <div className="flex items-center gap-4">
          {!success && (
            <span className="text-sm text-[var(--text-muted)]">
              Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
            </span>
          )}
          <button
            onClick={handleSaveExit}
            className="rounded-lg border border-[var(--border)] bg-transparent px-3.5 py-1.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)]"
          >
            Save & Exit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {!success && (
        <div className="h-[3px] shrink-0" style={{ background: 'var(--border)' }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full rounded-sm"
            style={{ background: accent }}
          />
        </div>
      )}

      {/* Step content */}
      <div className="flex flex-1 justify-center overflow-y-auto px-6 pb-28 pt-12">
        <div className="w-full max-w-[640px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={success ? 'success' : step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer nav */}
      {!success && step < TOTAL_STEPS && (
        <div
          className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 border-t border-[var(--border)] px-6 py-4"
          style={{ background: 'var(--bg-surface)' }}
        >
          {step > 1 && (
            <button
              onClick={back}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-transparent px-5 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)]"
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <button
            onClick={next}
            className="flex items-center gap-1.5 rounded-lg px-7 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: accent }}
          >
            Continue <ArrowRight size={15} />
          </button>
          <button
            onClick={skip}
            className="text-sm text-[var(--text-subtle)] transition-colors hover:text-[var(--text-muted)]"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  )
}

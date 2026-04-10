'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Template } from './templates'

type Device = 'phone' | 'tablet' | 'desktop'

const DEVICE_SIZES: Record<Device, { w: number; h: number }> = {
  phone: { w: 375, h: 812 },
  tablet: { w: 768, h: 1024 },
  desktop: { w: 1280, h: 800 },
}

const DEVICE_META: { key: Device; icon: typeof Smartphone; label: string }[] = [
  { key: 'phone', icon: Smartphone, label: 'Phone' },
  { key: 'tablet', icon: Tablet, label: 'Tablet' },
  { key: 'desktop', icon: Monitor, label: 'Desktop' },
]

interface PreviewModalProps {
  template: Template
  device: Device
  onDeviceChange: (d: Device) => void
  onClose: () => void
  onUse: () => void
}

export default function PreviewModal({
  template,
  device,
  onDeviceChange,
  onClose,
  onUse,
}: PreviewModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [handleEscape])

  const size = DEVICE_SIZES[device]
  const bezelRadius = device === 'phone' ? 'rounded-[48px]' : 'rounded-2xl'

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Contained modal panel */}
        <div
          className="flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-white">
                  {template.name}
                </h2>
                <Badge variant="secondary">{template.tagline}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500">
                Preview — this is what your guests will see
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Device switcher */}
              <div className="flex gap-1">
                {DEVICE_META.map(({ key, icon: Icon, label }) => (
                  <Button
                    key={key}
                    variant={device === key ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7"
                    onClick={() => onDeviceChange(key)}
                  >
                    <Icon className="size-3.5" />
                    <span className="sr-only">{label}</span>
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(template.previewUrl, '_blank', 'noopener')
                }
              >
                <ExternalLink className="size-3.5" />
                Open in new tab
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                className="text-zinc-400 hover:text-white"
                onClick={onClose}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Preview area */}
          <div className="flex flex-1 items-center justify-center overflow-auto bg-zinc-900/50 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={device}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`relative overflow-hidden ${bezelRadius} border-[3px] border-zinc-700 bg-black shadow-2xl`}
                style={{
                  width: Math.min(size.w, typeof window !== 'undefined' ? window.innerWidth - 120 : size.w),
                  height: Math.min(size.h, typeof window !== 'undefined' ? window.innerHeight - 240 : size.h),
                }}
              >
                <iframe
                  src={template.previewUrl}
                  title={`${template.name} preview`}
                  className="h-full w-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-3">
            <span className="text-xs text-zinc-500">
              {template.features.length} features included
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={onUse}>
                <Check data-icon="inline-start" className="size-3.5" />
                Use this template
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export type { Device }

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Settings2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import ToggleSwitch from '@/components/ui/toggle-switch'
import Link from 'next/link'

interface ModuleCardProps {
  icon: LucideIcon
  title: string
  description: string
  accentColor: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
  stats: { label: string }[]
  configContent: React.ReactNode
  manageLink?: { href: string; label: string }
  comingSoon?: boolean
}

export default function ModuleCard({
  icon: Icon,
  title,
  description,
  accentColor,
  enabled,
  onToggle,
  stats,
  configContent,
  manageLink,
  comingSoon,
}: ModuleCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      <motion.div
        animate={{ opacity: enabled ? 1 : 0.6 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <Card
          className="relative overflow-hidden transition-all duration-200 hover:-translate-y-px hover:shadow-md"
          style={{
            borderLeftWidth: enabled ? 4 : 1,
            borderLeftColor: enabled ? accentColor : undefined,
          }}
        >
          <CardContent className="flex flex-col gap-3 p-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                    color: accentColor,
                  }}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-2">
                    {description}
                  </p>
                </div>
              </div>
              <ToggleSwitch checked={enabled} onChange={onToggle} />
            </div>

            {/* Stats bar */}
            {enabled && stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 rounded-lg bg-[var(--bg-page)] px-3 py-2 text-xs text-[var(--text-muted)]"
              >
                {stats.map((stat, i) => (
                  <span key={stat.label} className="flex items-center gap-3">
                    {i > 0 && <span className="text-[var(--border)]">&middot;</span>}
                    <span>{stat.label}</span>
                  </span>
                ))}
              </motion.div>
            )}

            {/* Actions */}
            {enabled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-end gap-3"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSheetOpen(true)}
                >
                  <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                  Configure
                </Button>
                {manageLink && !comingSoon && (
                  <Link
                    href={manageLink.href}
                    className="text-xs font-medium text-[var(--accent)] hover:underline"
                  >
                    {manageLink.label} &rarr;
                  </Link>
                )}
                {comingSoon && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <span className="rounded-full bg-[var(--bg-surface)] px-2 py-0.5">
                      Coming soon
                    </span>
                  </span>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Config Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                  color: accentColor,
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <SheetTitle>{title}</SheetTitle>
                <SheetDescription>{description}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4 pb-6">
            {configContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

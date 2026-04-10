'use client'

import Image from 'next/image'
import { Check, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Template } from './templates'

const MAX_VISIBLE_FEATURES = 4

interface TemplateCardProps {
  template: Template
  isActive: boolean
  onPreview: () => void
  onUse: () => void
}

export default function TemplateCard({
  template,
  isActive,
  onPreview,
  onUse,
}: TemplateCardProps) {
  const visibleFeatures = template.features.slice(0, MAX_VISIBLE_FEATURES)
  const extraCount = template.features.length - MAX_VISIBLE_FEATURES

  return (
    <Card className="group flex flex-col overflow-hidden transition-colors hover:border-lime-500/40">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-[var(--bg-surface)]">
        <Image
          src={template.thumbnail}
          alt={`${template.name} template preview`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isActive && (
          <Badge variant="success" className="absolute top-3 right-3">
            Active
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {template.name}
            </h3>
            <Badge variant="secondary">{template.tagline}</Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {template.description}
          </p>
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-1">
          {visibleFeatures.map((f) => (
            <li
              key={f}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"
            >
              <Check className="size-3 text-[var(--status-green-fg)]" />
              {f}
            </li>
          ))}
          {extraCount > 0 && (
            <li className="text-xs text-[var(--text-subtle)]">
              +{extraCount} more
            </li>
          )}
        </ul>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onPreview}>
            <Eye data-icon="inline-start" className="size-3.5" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-lime-500 text-black hover:bg-lime-400"
            onClick={onUse}
            disabled={isActive}
          >
            {isActive ? 'Active' : 'Use Template'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

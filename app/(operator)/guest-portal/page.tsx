'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '@/components/shared/PageHeader'
import Tabs from '@/components/shared/Tabs'
import { TEMPLATES, type Template } from './components/templates'
import TemplateCard from './components/TemplateCard'
import PreviewModal, { type Device } from './components/PreviewModal'
import CustomizationPanel from './components/CustomizationPanel'
import VerificationPanel from './components/VerificationPanel'
import GuidebookPanel from './components/GuidebookPanel'
import MessagingPanel from './components/MessagingPanel'
import UpsellsPanel from './components/UpsellsPanel'
import SmartAccessPanel from './components/SmartAccessPanel'
import SetupBanner from './components/SetupBanner'

const PAGE_TABS = [
  { key: 'templates', label: 'Templates', count: 3 },
  { key: 'customize', label: 'Customize' },
  { key: 'modules', label: 'Modules', count: 5 },
]

export default function GuestPortalPage() {
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [activeTemplateId, setActiveTemplateId] = useState<Template['id']>('default')
  const [device, setDevice] = useState<Device>('phone')
  const [activeTab, setActiveTab] = useState('templates')

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <PageHeader
        title="Guest Portal"
        subtitle="Configure what your guests see when they open their portal link."
      />

      <SetupBanner />

      {/* Sticky tab bar */}
      <div className="sticky top-0 z-10 -mx-6 px-6 backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-page) 80%, transparent)' }}>
        <Tabs tabs={PAGE_TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab panels — display:none preserves form state */}
      <div style={{ display: activeTab === 'templates' ? 'block' : 'none' }}>
        <motion.div
          key="templates"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isActive={t.id === activeTemplateId}
                onPreview={() => {
                  setDevice('phone')
                  setPreviewTemplate(t)
                }}
                onUse={() => setActiveTemplateId(t.id)}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ display: activeTab === 'customize' ? 'block' : 'none' }}>
        <motion.div
          key="customize"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <CustomizationPanel activeTemplateId={activeTemplateId} />
        </motion.div>
      </div>

      <div style={{ display: activeTab === 'modules' ? 'block' : 'none' }}>
        <motion.div
          key="modules"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <VerificationPanel />
            <GuidebookPanel />
            <MessagingPanel />
            <UpsellsPanel />
            <SmartAccessPanel />
          </div>
        </motion.div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          template={previewTemplate}
          device={device}
          onDeviceChange={setDevice}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => {
            setActiveTemplateId(previewTemplate.id)
            setPreviewTemplate(null)
          }}
        />
      )}
    </div>
  )
}

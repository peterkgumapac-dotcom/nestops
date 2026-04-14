'use client'
import { useState } from 'react'
import { Building2, Wifi, Package, Camera, FileText, CheckCircle } from 'lucide-react'
import { PROPERTIES } from '@/lib/data/properties'
import { STAFF_MEMBERS } from '@/lib/data/staff'
import { useRole } from '@/context/RoleContext'
import PageHeader from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const CURRENT_STAFF = STAFF_MEMBERS[0]
const MY_PROPERTIES = PROPERTIES.filter(p => CURRENT_STAFF.assignedPropertyIds.includes(p.id))

const STEPS = [
  { label: 'Select Property', icon: Building2 },
  { label: 'Property Details', icon: Wifi },
  { label: 'Assets', icon: Package },
  { label: 'Photos', icon: Camera },
  { label: 'Notes', icon: FileText },
  { label: 'Review', icon: CheckCircle },
]

const inputClasses = 'w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent-border)] transition-colors'
const labelClasses = 'text-xs font-medium text-[var(--text-muted)] mb-1.5 block'

export default function NewIntakePage() {
  const { accent } = useRole()
  const [step, setStep] = useState(0)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)

  return (
    <div className="max-w-[640px]">
      <PageHeader
        title="Property Intake"
        subtitle={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step].label}`}
      />

      {/* Progress bar */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 h-1 rounded-full transition-colors duration-300"
            style={{ background: i <= step ? accent : 'var(--border)' }}
          />
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div>
          <h2 className="heading text-base font-semibold text-[var(--text-primary)] mb-4">Select Property</h2>
          <div className="grid grid-cols-2 gap-3">
            {MY_PROPERTIES.map(p => (
              <Card
                key={p.id}
                onClick={() => setSelectedProperty(p.id)}
                className={`card p-4 cursor-pointer transition-all duration-200 ${
                  selectedProperty === p.id ? 'ring-2' : ''
                }`}
                style={{
                  borderColor: selectedProperty === p.id ? accent : undefined,
                  background: selectedProperty === p.id ? `${accent}0d` : undefined,
                  ...(selectedProperty === p.id ? { '--tw-ring-color': accent } as React.CSSProperties : {}),
                }}
              >
                <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{p.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{p.city}</div>
                <div className="text-xs text-[var(--text-subtle)] mt-1 capitalize">{p.status}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <h2 className="heading text-base font-semibold text-[var(--text-primary)]">Property Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClasses}>Property Type</label><select className={inputClasses}><option>Apartment</option><option>Villa</option><option>Studio</option><option>Cabin</option></select></div>
            <div><label className={labelClasses}>Lock Code</label><input className={inputClasses} placeholder="••••" type="password" /></div>
          </div>
          <div><label className={labelClasses}>Access Instructions</label><textarea className={`${inputClasses} min-h-[80px] resize-y`} placeholder="How to access the property..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClasses}>WiFi Network</label><input className={inputClasses} placeholder="Network name" /></div>
            <div><label className={labelClasses}>WiFi Password</label><input className={inputClasses} placeholder="Password" /></div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="heading text-base font-semibold text-[var(--text-primary)] mb-4">Appliances & Assets</h2>
          <Card className="p-4 mb-3">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={labelClasses}>Item Name</label><input className={inputClasses} placeholder="e.g. Washing Machine" /></div>
              <div><label className={labelClasses}>Brand</label><input className={inputClasses} placeholder="e.g. Miele" /></div>
              <div><label className={labelClasses}>Model</label><input className={inputClasses} placeholder="Model number" /></div>
              <div><label className={labelClasses}>Condition</label><select className={inputClasses}><option>Excellent</option><option>Good</option><option>Fair</option><option>Poor</option></select></div>
              <div><label className={labelClasses}>Serial Number</label><input className={inputClasses} placeholder="Optional" /></div>
              <div><label className={labelClasses}>Approx. Value (NOK)</label><input type="number" className={inputClasses} /></div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">Add Item</Button>
          </Card>
          <Button variant="ghost" size="sm" className="text-[var(--accent)]">+ Add Another Item</Button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="heading text-base font-semibold text-[var(--text-primary)] mb-4">Photos</h2>
          <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-10 text-center cursor-pointer mb-4 hover:border-[var(--accent-border)] transition-colors">
            <Camera size={32} className="text-[var(--text-subtle)] mx-auto mb-2" strokeWidth={1} />
            <div className="text-sm text-[var(--text-muted)] mb-1">Drag & drop photos or click to upload</div>
            <div className="text-xs text-[var(--text-subtle)]">JPG, PNG up to 10MB each</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Exterior', 'Other'].map(room => (
              <button
                key={room}
                className="px-3 py-1.5 rounded-full text-xs cursor-pointer border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] transition-colors"
              >
                {room}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <h2 className="heading text-base font-semibold text-[var(--text-primary)]">Notes & Issues</h2>
          <div><label className={labelClasses}>General Notes</label><textarea className={`${inputClasses} min-h-[100px] resize-y`} placeholder="Any general notes about the property condition…" /></div>
          <div><label className={labelClasses}>Issue Type</label>
            <select className={inputClasses}><option>— No issues —</option><option>Minor damage</option><option>Maintenance needed</option><option>Missing item</option><option>Safety concern</option></select>
          </div>
          <div><label className={labelClasses}>Issue Description</label><textarea className={`${inputClasses} min-h-[80px] resize-y`} placeholder="Describe any issues found…" /></div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="heading text-base font-semibold text-[var(--text-primary)] mb-4">Review & Submit</h2>
          <div className="flex flex-col gap-3">
            {STEPS.slice(0, 5).map((s) => (
              <Card key={s.label} className="p-3 flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${accent}1a` }}
                >
                  <s.icon size={13} className="text-[var(--accent)]" />
                </div>
                <span className="flex-1 text-sm text-[var(--text-primary)]">{s.label}</span>
                <span className="text-xs text-[var(--status-green-fg)]">&#10003; Complete</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-7">
        <Button variant="outline" size="default">Save Draft</Button>
        <div className="flex-1" />
        {step > 0 && (
          <Button onClick={() => setStep(s => s - 1)} variant="outline" size="default">&larr; Back</Button>
        )}
        <Button
          onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : undefined}
          className="rounded-full px-6"
          size="default"
        >
          {step === STEPS.length - 1 ? 'Submit Intake' : 'Next \u2192'}
        </Button>
      </div>
    </div>
  )
}

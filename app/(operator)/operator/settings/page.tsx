'use client'
import PageHeader from '@/components/shared/PageHeader'
import Tabs from '@/components/shared/Tabs'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'
import {
  getPrefs, savePrefs, resetPrefs,
  TOGGLE_LABELS, ALWAYS_ON,
} from '@/lib/data/briefingPrefs'
import type { BriefingPrefs, BriefingToggles } from '@/lib/data/briefingPrefs'

export default function SettingsPage() {
  const { accent, user } = useRole()
  const [activeTab, setActiveTab] = useState('brand')
  const [briefingPrefs, setBriefingPrefs] = useState<BriefingPrefs | null>(null)

  useEffect(() => {
    if (!user) return
    const p = getPrefs(user.id, user.subRole ?? '', user.role)
    setBriefingPrefs(p)
  }, [user])

  const tabs = [
    { key: 'brand', label: 'Brand' },
    { key: 'warehouses', label: 'Warehouses' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'integrations', label: 'Integrations' },
    { key: 'briefing', label: 'Briefing' },
  ]

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)' as const,
    fontSize: 14,
    outline: 'none',
  }

  const labelStyle = { fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' as const }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Platform configuration" />
      <div style={{ maxWidth: 600 }}>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'brand' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div><label style={labelStyle}>Company Name</label><input style={inputStyle} defaultValue="NestOps Management" /></div>
            <div><label style={labelStyle}>Primary Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: accent, border: '1px solid var(--border)' }} />
                <input style={{ ...inputStyle, flex: 1 }} defaultValue={accent} />
              </div>
            </div>
            <div><label style={labelStyle}>Support Email</label><input style={inputStyle} defaultValue="support@nestops.no" type="email" /></div>
            <div><label style={labelStyle}>Website</label><input style={inputStyle} defaultValue="https://nestops.no" /></div>
            <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: 'fit-content' }}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'warehouses' && (
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Oslo Warehouse', 'Bergen Warehouse'].map(w => (
                <div key={w} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{w}</div>
                    <div style={{ fontSize: 12 }}>Active</div>
                  </div>
                  <button style={{ fontSize: 13, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Email alerts for new requests', 'Low stock notifications', 'Compliance expiry reminders', 'New owner onboarding alerts'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item}</span>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: accent, cursor: 'pointer', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 3, top: 3, width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'Guesty', desc: 'PMS integration', connected: true },
              { name: 'Breezeway', desc: 'Operations platform', connected: true },
              { name: 'NoiseAware', desc: 'Noise monitoring', connected: false },
              { name: 'Hostaway', desc: 'Channel manager', connected: false },
            ].map(intg => (
              <div key={intg.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{intg.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{intg.desc}</div>
                </div>
                <button style={{ padding: '6px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer', border: intg.connected ? '1px solid var(--border)' : 'none', background: intg.connected ? 'transparent' : accent, color: intg.connected ? 'var(--text-muted)' : '#fff', fontWeight: 500 }}>
                  {intg.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'briefing' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              Choose what appears on your daily briefing screen. Changes are saved instantly.
            </p>

            {!briefingPrefs || !user ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading preferences…</div>
            ) : (
              <>
                {Object.entries(TOGGLE_LABELS)
                  .filter(([key, meta]) =>
                    !ALWAYS_ON.includes(key as keyof BriefingToggles) &&
                    (meta.roles.includes('all') ||
                      meta.roles.includes(
                        user.role === 'operator'
                          ? 'operator'
                          : user.subRole ?? ''
                      ))
                  )
                  .map(([key, meta]) => {
                    const toggleKey = key as keyof BriefingToggles
                    const isOn = briefingPrefs.toggles[toggleKey]
                    return (
                      <div key={key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                            {meta.label}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {meta.description}
                          </div>
                        </div>
                        {/* Toggle switch */}
                        <div
                          onClick={() => {
                            const updated: BriefingPrefs = {
                              ...briefingPrefs,
                              toggles: {
                                ...briefingPrefs.toggles,
                                [toggleKey]: !isOn,
                              },
                            }
                            setBriefingPrefs(updated)
                            savePrefs(updated)
                          }}
                          style={{
                            width: 44, height: 24,
                            borderRadius: 12,
                            background: isOn ? accent : 'var(--border)',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            flexShrink: 0,
                            marginLeft: 20,
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: 2,
                            left: isOn ? 22 : 2,
                            width: 20, height: 20,
                            borderRadius: '50%',
                            background: 'white',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          }} />
                        </div>
                      </div>
                    )
                  })}

                <button
                  onClick={() => {
                    const reset = resetPrefs(user.id, user.subRole ?? '', user.role)
                    setBriefingPrefs(reset)
                  }}
                  style={{
                    marginTop: 24,
                    padding: '10px 20px',
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Reset to defaults
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

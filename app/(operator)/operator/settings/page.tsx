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

const INITIAL_INTEGRATIONS = [
  { id: 'guesty',     name: 'Guesty',     desc: 'PMS integration',       connected: true },
  { id: 'breezeway',  name: 'Breezeway',  desc: 'Operations platform',   connected: true },
  { id: 'noiseaware', name: 'NoiseAware', desc: 'Noise monitoring',      connected: false },
  { id: 'hostaway',   name: 'Hostaway',   desc: 'Channel manager',       connected: false },
]

const INITIAL_WAREHOUSES = [
  { id: 'w1', name: 'Oslo Warehouse',   address: 'Industrigata 14, Oslo' },
  { id: 'w2', name: 'Bergen Warehouse', address: 'Laksevåg 3, Bergen' },
]

export default function SettingsPage() {
  const { accent, user } = useRole()
  const [activeTab, setActiveTab] = useState('brand')
  const [briefingPrefs, setBriefingPrefs] = useState<BriefingPrefs | null>(null)
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // Brand tab
  const [companyName, setCompanyName] = useState('NestOps Management')
  const [supportEmail, setSupportEmail] = useState('support@nestops.no')
  const [website, setWebsite] = useState('https://nestops.no')

  // Warehouses tab
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES)
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null)
  const [editWarehouseName, setEditWarehouseName] = useState('')
  const [editWarehouseAddress, setEditWarehouseAddress] = useState('')

  // Integrations tab
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS)

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

  const startEditWarehouse = (w: typeof INITIAL_WAREHOUSES[0]) => {
    setEditingWarehouseId(w.id)
    setEditWarehouseName(w.name)
    setEditWarehouseAddress(w.address)
  }

  const saveWarehouse = (id: string) => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, name: editWarehouseName, address: editWarehouseAddress } : w))
    setEditingWarehouseId(null)
    showToast('Warehouse updated')
  }

  const toggleIntegration = (id: string, connected: boolean) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !connected } : i))
    showToast(connected ? 'Integration disconnected' : 'Integration connected')
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Platform configuration" />
      <div style={{ maxWidth: 600 }}>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'brand' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div><label style={labelStyle}>Company Name</label><input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
            <div><label style={labelStyle}>Primary Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: accent, border: '1px solid var(--border)' }} />
                <input style={{ ...inputStyle, flex: 1 }} defaultValue={accent} />
              </div>
            </div>
            <div><label style={labelStyle}>Support Email</label><input style={inputStyle} value={supportEmail} onChange={e => setSupportEmail(e.target.value)} type="email" /></div>
            <div><label style={labelStyle}>Website</label><input style={inputStyle} value={website} onChange={e => setWebsite(e.target.value)} /></div>
            <button onClick={() => showToast('Brand settings saved')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: 'fit-content' }}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'warehouses' && (
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {warehouses.map(w => (
                <div key={w.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                  {editingWarehouseId === w.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input style={inputStyle} value={editWarehouseName} onChange={e => setEditWarehouseName(e.target.value)} placeholder="Warehouse name" />
                      <input style={inputStyle} value={editWarehouseAddress} onChange={e => setEditWarehouseAddress(e.target.value)} placeholder="Address" />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setEditingWarehouseId(null)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={() => saveWarehouse(w.id)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{w.name}</div>
                        <div style={{ fontSize: 12 }}>{w.address}</div>
                      </div>
                      <button onClick={() => startEditWarehouse(w)} style={{ fontSize: 13, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                    </div>
                  )}
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
            {integrations.map(intg => (
              <div key={intg.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{intg.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{intg.desc}</div>
                </div>
                <button
                  onClick={() => toggleIntegration(intg.id, intg.connected)}
                  style={{ padding: '6px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer', border: intg.connected ? '1px solid var(--border)' : 'none', background: intg.connected ? 'transparent' : accent, color: intg.connected ? 'var(--text-muted)' : '#fff', fontWeight: 500 }}
                >
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

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

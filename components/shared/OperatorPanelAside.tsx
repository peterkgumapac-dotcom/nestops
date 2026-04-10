'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Wraps a page's main content and portals a sibling aside into the
 * shell's `.operator-panel` grid. The panel's `:has(.panel-aside)` rule
 * flips its grid to 3 columns automatically.
 */
export default function OperatorPanelAside({
  children,
  slot,
}: {
  children: React.ReactNode
  slot: React.ReactNode
}) {
  const [panel, setPanel] = useState<Element | null>(null)

  useEffect(() => {
    setPanel(document.querySelector('.operator-panel'))
  }, [])

  return (
    <>
      {children}
      {panel ? createPortal(<div className="panel-aside">{slot}</div>, panel) : null}
    </>
  )
}

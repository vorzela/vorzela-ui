import * as React from 'react'
import { createPortal } from 'react-dom'

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/** Renders children into `document.body`. SSR-safe. */
export function Portal({
  children,
  container,
}: {
  children: React.ReactNode
  container?: HTMLElement | null
}) {
  const mounted = React.useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  )
  if (!mounted) return null
  return createPortal(children, container ?? document.body)
}

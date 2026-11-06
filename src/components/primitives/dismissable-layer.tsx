import * as React from 'react'

import styles from './primitives.module.scss'

/**
 * Calls `onDismiss` on Escape or an outside pointer press. Nested layers can
 * opt out by preventing the event default.
 */
export function DismissableLayer({
  children,
  onDismiss,
  enabled = true,
}: {
  children: React.ReactNode
  onDismiss: () => void
  enabled?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      onDismiss()
    }
    const onPointerDown = (event: PointerEvent) => {
      const node = ref.current
      if (!node || node.contains(event.target as Node)) return
      onDismiss()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [enabled, onDismiss])

  return (
    <div ref={ref} className={styles.layer}>
      {children}
    </div>
  )
}

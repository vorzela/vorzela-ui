/**
 * components/ui/drawer.tsx
 *
 * Slide-over drawer — focus-trapped, scroll-lock safe.
 */
import { X } from 'lucide-react'
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { useLatest } from '~/hooks/use-latest'
import { cx } from '~/lib/cx'
import { lockBodyScroll, trapFocus } from '~/lib/overlay'
import styles from './drawer.module.scss'

export type DrawerSide = 'left' | 'right'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  'aria-label'?: string
  hideClose?: boolean
  /** Slide-in edge. Default: left. */
  side?: DrawerSide
  className?: string
  children?: React.ReactNode
}

export function Drawer({
  open,
  onClose,
  title,
  'aria-label': ariaLabel,
  hideClose,
  side = 'left',
  className,
  children,
}: DrawerProps) {
  const titleId = React.useId()
  const [panel, setPanel] = React.useState<HTMLDivElement | null>(null)
  const onCloseRef = useLatest(onClose)

  React.useEffect(() => {
    if (!open || !panel) return
    const unlock = lockBodyScroll()
    const releaseTrap = trapFocus(panel, () => onCloseRef.current())
    return () => {
      releaseTrap()
      unlock()
    }
  }, [open, panel, onCloseRef])

  if (!open) return null

  const fromLeft = side === 'left'

  return (
    <Portal>
      <div
        className={styles.overlay}
        aria-hidden="true"
        onClick={() => onCloseRef.current()}
      />

      <div
        ref={setPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? (ariaLabel ?? 'Drawer') : undefined}
        tabIndex={-1}
        className={cx(
          styles.panel,
          fromLeft ? styles.sideLeft : styles.sideRight,
          className,
        )}
      >
        <div className={styles.header}>
          {title ? (
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          ) : null}

          {hideClose ? null : (
            <button
              type="button"
              className={styles.close}
              onClick={() => onCloseRef.current()}
              aria-label="Close drawer"
            >
              <X aria-hidden />
            </button>
          )}
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </Portal>
  )
}

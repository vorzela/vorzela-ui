/**
 * components/ui/sheet.tsx
 *
 * Slide-over sheet — four edges, focus-trapped, scroll-lock safe.
 */
import { X } from 'lucide-react'
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { useLatest } from '~/hooks/use-latest'
import { cx } from '~/lib/cx'
import { lockBodyScroll, trapFocus } from '~/lib/overlay'
import styles from './sheet.module.scss'

export type SheetSide = 'top' | 'right' | 'bottom' | 'left'

const SIDE: Record<SheetSide, string> = {
  top: styles.sideTop,
  right: styles.sideRight,
  bottom: styles.sideBottom,
  left: styles.sideLeft,
}

export interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  'aria-label'?: string
  side?: SheetSide
  hideClose?: boolean
  className?: string
  headerClassName?: string
  bodyClassName?: string
  footer?: React.ReactNode
  children?: React.ReactNode
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  'aria-label': ariaLabel,
  side = 'right',
  hideClose,
  className,
  headerClassName,
  bodyClassName,
  footer,
  children,
}: SheetProps) {
  const titleId = React.useId()
  const descId = React.useId()
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

  const hasHeader = Boolean(title) || Boolean(description) || !hideClose

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
        aria-describedby={description ? descId : undefined}
        aria-label={!title ? (ariaLabel ?? 'Sheet') : undefined}
        tabIndex={-1}
        className={cx(styles.panel, SIDE[side], className)}
      >
        {hasHeader ? (
          <div className={cx(styles.header, headerClassName)}>
            <div className={styles.heading}>
              {title ? (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              ) : null}

              {description ? (
                <p id={descId} className={styles.description}>
                  {description}
                </p>
              ) : null}
            </div>

            {hideClose ? null : (
              <button
                type="button"
                className={styles.close}
                onClick={() => onCloseRef.current()}
                aria-label="Close"
              >
                <X aria-hidden />
              </button>
            )}
          </div>
        ) : null}

        <div className={cx(styles.body, bodyClassName)}>{children}</div>

        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </Portal>
  )
}

export { Sheet as SideSheet }

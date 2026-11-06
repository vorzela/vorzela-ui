/**
 * components/ui/modal.tsx
 *
 * Centred dialog — focus-trapped, scroll-lock safe.
 */
import { X } from 'lucide-react'
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { useLatest } from '~/hooks/use-latest'
import { cx } from '~/lib/cx'
import { lockBodyScroll, trapFocus } from '~/lib/overlay'
import styles from './modal.module.scss'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

const SIZE: Record<ModalSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
  full: styles.sizeFull,
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  /** Required for a11y when `title` is omitted. */
  'aria-label'?: string
  size?: ModalSize
  hideClose?: boolean
  className?: string
  children?: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({
  open,
  onClose,
  title,
  'aria-label': ariaLabel,
  size = 'md',
  hideClose,
  className,
  children,
  footer,
}: ModalProps) {
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

  return (
    <Portal>
      <div className={styles.root}>
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
          aria-label={!title ? (ariaLabel ?? 'Dialog') : undefined}
          tabIndex={-1}
          className={cx(styles.panel, SIZE[size], className)}
          onClick={(event) => event.stopPropagation()}
        >
          {title || !hideClose ? (
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
                  aria-label="Close"
                >
                  <X aria-hidden />
                </button>
              )}
            </div>
          ) : null}

          <div className={styles.body}>{children}</div>

          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </div>
      </div>
    </Portal>
  )
}

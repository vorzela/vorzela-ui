/**
 * components/ui/alert-dialog.tsx
 *
 * Confirmation dialog — focus-trapped, scroll-lock safe.
 */
import * as React from 'react'

import { Portal } from '~/components/primitives/portal'
import { useLatest } from '~/hooks/use-latest'
import { cx } from '~/lib/cx'
import { lockBodyScroll, trapFocus } from '~/lib/overlay'
import { Button } from './button'
import styles from './alert-dialog.module.scss'

export interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  cancelText?: string
  actionText?: string
  onAction?: () => void
  onCancel?: () => void
  destructive?: boolean
  className?: string
  children?: React.ReactNode
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'Cancel',
  actionText = 'Continue',
  onAction,
  onCancel,
  destructive = false,
  className,
  children,
}: AlertDialogProps) {
  const titleId = React.useId()
  const descId = React.useId()
  const [panel, setPanel] = React.useState<HTMLDivElement | null>(null)
  const onOpenChangeRef = useLatest(onOpenChange)

  React.useEffect(() => {
    if (!open || !panel) return
    const unlock = lockBodyScroll()
    const releaseTrap = trapFocus(panel, () =>
      onOpenChangeRef.current(false),
    )
    return () => {
      releaseTrap()
      unlock()
    }
  }, [open, panel, onOpenChangeRef])

  if (!open) return null

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleAction = () => {
    onAction?.()
  }

  return (
    <Portal>
      <div className={styles.root}>
        <div
          className={styles.overlay}
          aria-hidden="true"
          onClick={handleCancel}
        />

        <div
          ref={setPanel}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={cx(styles.panel, className)}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={styles.content}>
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

            {children}
          </div>

          <div className={styles.actions}>
            <Button variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'primary'}
              onClick={handleAction}
            >
              {actionText}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export { AlertDialog as ConfirmationDialog }

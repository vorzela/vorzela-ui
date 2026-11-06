import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './alert.module.scss'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const VARIANT: Record<AlertVariant, string> = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
}

const ICON: Record<AlertVariant, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
}

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant
  title?: React.ReactNode
  /** Hide the tone icon. */
  hideIcon?: boolean
  /** Render a close button. The caller owns visibility. */
  onDismiss?: () => void
  dismissLabel?: string
}

export function Alert({
  variant = 'info',
  title,
  hideIcon = false,
  onDismiss,
  dismissLabel = 'Dismiss',
  className,
  children,
  ...props
}: AlertProps) {
  const Icon = ICON[variant]

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cx(styles.root, VARIANT[variant], className)}
      {...props}
    >
      {hideIcon ? null : (
        <span className={styles.icon}>
          <Icon aria-hidden />
        </span>
      )}

      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.description}>{children}</div> : null}
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className={styles.dismiss}
        >
          <X aria-hidden />
        </button>
      ) : null}
    </div>
  )
}

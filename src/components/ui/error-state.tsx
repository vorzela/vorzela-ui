import type { ReactNode } from 'react'
import { CircleAlert, RotateCcw } from 'lucide-react'

import { cx } from '~/lib/cx'
import { Button } from './button'
import styles from './error-state.module.scss'

export interface ErrorStateProps {
  title?: ReactNode
  description?: ReactNode
  onRetry?: () => void
  retryLabel?: string
  className?: string
  children?: ReactNode
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'The section could not be loaded. Try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
  children,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cx(styles.root, className)}>
      <span className={styles.icon}>
        <CircleAlert aria-hidden />
      </span>
      <div className={styles.copy}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
      {children}
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw aria-hidden />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

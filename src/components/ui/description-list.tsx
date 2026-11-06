import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './description-list.module.scss'

export interface DescriptionListProps {
  children: ReactNode
  className?: string
  columns?: 1 | 2 | 3
}

/**
 * Definition list.
 *
 * Columns follow the viewport, but each pair also measures its own cell: the
 * term and value sit side by side only when the column has room, and stack
 * otherwise. Tracks use `minmax(0, 1fr)` so a long value wraps instead of
 * pushing the list out of its card.
 */
export function DescriptionList({
  children,
  className,
  columns = 1,
}: DescriptionListProps) {
  return (
    <dl
      className={cx(
        styles.root,
        columns === 2 && styles.columns2,
        columns === 3 && styles.columns3,
        className,
      )}
    >
      {children}
    </dl>
  )
}

export interface DescriptionItemProps {
  term: ReactNode
  children: ReactNode
  className?: string
}

export function DescriptionItem({
  term,
  children,
  className,
}: DescriptionItemProps) {
  return (
    <div className={cx(styles.item, className)}>
      <dt className={styles.term}>{term}</dt>
      <dd className={styles.value}>{children}</dd>
    </div>
  )
}

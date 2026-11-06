import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './bento-grid.module.scss'

export interface BentoGridProps {
  children: ReactNode
  className?: string
}

/**
 * Bento mosaic.
 *
 * Column count follows the grid's own width (container queries), not the
 * viewport: one column in a narrow card, two once there is room, and the four
 * column mosaic — with the `colSpan`/`rowSpan` tile sizes — only when the grid
 * is wide enough for them. Rows hug their content until the four column
 * layout, so short tiles do not sit in oversized empty boxes.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={styles.container}>
      <div className={cx(styles.grid, className)}>{children}</div>
    </div>
  )
}

const COL_SPAN = {
  1: '',
  2: styles.colSpan2,
  3: styles.colSpan3,
  4: styles.colSpan4,
} as const

const ROW_SPAN = {
  1: '',
  2: styles.rowSpan2,
  3: styles.rowSpan3,
} as const

export interface BentoItemProps {
  children: ReactNode
  className?: string
  colSpan?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2 | 3
}

export function BentoItem({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
}: BentoItemProps) {
  return (
    <div
      className={cx(
        styles.item,
        COL_SPAN[colSpan],
        ROW_SPAN[rowSpan],
        className,
      )}
    >
      {children}
    </div>
  )
}

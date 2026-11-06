import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './charts.module.scss'

/** Floating tooltip positioned inside a chart container. */
export function ChartTooltip({
  x,
  y,
  width,
  children,
  className,
}: {
  x: number
  y: number
  width: number
  children: ReactNode
  className?: string
}) {
  const flip = x > width * 0.65

  return (
    <div
      role="status"
      className={cx(styles.tooltip, className)}
      style={{
        left: flip ? undefined : x + 12,
        right: flip ? width - x + 12 : undefined,
        top: Math.max(4, y - 12),
      }}
    >
      {children}
    </div>
  )
}

import * as React from 'react'

import { useReducedMotion } from '~/hooks/use-reduced-motion'
import { cx } from '~/lib/cx'
import styles from './primitives.module.scss'

/** Fade and rise on mount. Exits are intentionally not animated. */
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 240,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}) {
  const reduced = useReducedMotion()

  return (
    <div
      className={cx(styles.fade, reduced && styles.fadeReduced, className)}
      style={
        {
          '--vz-fade-duration': `${reduced ? 0 : duration}ms`,
          '--vz-fade-delay': `${reduced ? 0 : delay}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

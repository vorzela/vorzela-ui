import type { CSSProperties, ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './marquee.module.scss'

export interface MarqueeProps {
  children: ReactNode
  /** Seconds for one full loop. */
  speed?: number
  pauseOnHover?: boolean
  reverse?: boolean
  className?: string
}

/** CSS-only marquee. Duplicated content is hidden from assistive tech. */
export function Marquee({
  children,
  speed = 30,
  pauseOnHover = true,
  reverse = false,
  className,
}: MarqueeProps) {
  return (
    <div
      className={cx(
        styles.root,
        pauseOnHover && styles.pauseOnHover,
        className,
      )}
      style={{ '--marquee-duration': `${speed}s` } as CSSProperties}
    >
      <div className={cx(styles.track, reverse && styles.reverse)}>
        <div className={styles.group}>{children}</div>
        <div className={styles.group} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}

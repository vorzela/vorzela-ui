import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './primitives.module.scss'

/** First focusable control on the page; jumps to main content. */
export function SkipLink({
  href = '#main',
  children = 'Skip to content',
  className,
}: {
  href?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <a href={href} className={cx(styles.skip, className)}>
      {children}
    </a>
  )
}

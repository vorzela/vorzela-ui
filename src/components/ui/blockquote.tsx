import type { HTMLAttributes, ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './blockquote.module.scss'

export interface BlockquoteProps extends HTMLAttributes<HTMLQuoteElement> {
  cite?: ReactNode
  tone?: 'default' | 'accent'
}

/** Editorial pull quote with an optional attribution. */
export function Blockquote({
  cite,
  tone = 'default',
  className,
  children,
  ...props
}: BlockquoteProps) {
  return (
    <blockquote
      className={cx(styles.root, tone === 'accent' && styles.accent, className)}
      {...props}
    >
      <div className={styles.body}>{children}</div>
      {cite ? <footer className={styles.cite}>{cite}</footer> : null}
    </blockquote>
  )
}

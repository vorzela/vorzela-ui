import type { HTMLAttributes } from 'react'

import { cx } from '~/lib/cx'
import styles from './kbd.module.scss'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  size?: 'sm' | 'md'
}

/** A single key cap. Wrap several in a `role="group"` for shortcuts. */
export function Kbd({ size = 'md', className, ...props }: KbdProps) {
  return (
    <kbd
      className={cx(styles.root, size === 'sm' && styles.sm, className)}
      {...props}
    />
  )
}

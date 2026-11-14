import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './icon.module.scss'

export interface IconProps {
  children: ReactNode
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Decorative or labelled icon wrapper. */
export function Icon({ children, label, size = 'md', className }: IconProps) {
  return (
    <span
      className={cx(styles.root, styles[size], className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </span>
  )
}

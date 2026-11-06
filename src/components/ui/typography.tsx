import type { HTMLAttributes, ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './typography.module.scss'

/** Inline code fragment. */
export function Code({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <code className={cx(styles.code, className)} {...props} />
}

/** Highlighted search match or emphasis. */
export function Highlight({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <mark className={cx(styles.highlight, className)} {...props} />
}

const SIZES = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
} as const

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: keyof typeof SIZES
  children: ReactNode
}

/** Semantic heading with a decoupled visual size. */
export function Heading({
  as: Tag = 'h2',
  size = 'md',
  className,
  ...props
}: HeadingProps) {
  return (
    <Tag className={cx(styles.heading, SIZES[size], className)} {...props} />
  )
}

import type { CSSProperties } from 'react'

import { cx } from '~/lib/cx'
import styles from './skeleton.module.scss'

export type SkeletonVariant = 'block' | 'text' | 'rect' | 'circle'

const VARIANT: Record<SkeletonVariant, string> = {
  block: styles.block,
  text: styles.text,
  rect: styles.rect,
  circle: styles.circle,
}

export interface SkeletonProps {
  variant?: SkeletonVariant
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  className?: string
}

/** A layout-stable placeholder. Marked `aria-hidden`; pair with live status copy. */
export function Skeleton({
  variant = 'block',
  width,
  height,
  className,
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cx(styles.root, VARIANT[variant], className)}
      style={{ width, height }}
    />
  )
}

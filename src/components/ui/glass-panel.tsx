import type { HTMLAttributes } from 'react'

import { cx } from '~/lib/cx'
import styles from './glass-panel.module.scss'

export type GlassBlur = 'sm' | 'md' | 'lg'
export type GlassTone = 'auto' | 'light' | 'dark'

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Backdrop blur strength. */
  blur?: GlassBlur
  /** Force a light/dark glass tint instead of following the theme. */
  tone?: GlassTone
}

/**
 * Translucent surface with a backdrop blur. Falls back to an opaque card when
 * `backdrop-filter` is unavailable.
 */
export function GlassPanel({
  blur = 'md',
  tone = 'auto',
  className,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cx(
        styles.root,
        blur === 'sm' && styles.blurSm,
        blur === 'lg' && styles.blurLg,
        tone === 'light' && styles.light,
        tone === 'dark' && styles.dark,
        className,
      )}
      {...props}
    />
  )
}

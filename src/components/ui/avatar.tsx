import * as React from 'react'

import { cx } from '~/lib/cx'
import styles from './avatar.module.scss'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarPresence = 'online' | 'busy' | 'away' | 'offline'

const SIZE: Record<AvatarSize, string> = {
  xs: styles.xs,
  sm: styles.sm,
  md: '',
  lg: styles.lg,
  xl: styles.xl,
}

const PRESENCE: Record<AvatarPresence, string> = {
  online: styles.online,
  busy: styles.busy,
  away: styles.away,
  offline: styles.offline,
}

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize
  /** Rounded square instead of a circle. */
  square?: boolean
  presence?: AvatarPresence
}

/** Circular identity badge. Compose with `AvatarImage` and `AvatarFallback`. */
export function Avatar({
  size = 'md',
  square = false,
  presence,
  className,
  children,
  ...props
}: AvatarProps) {
  return (
    <span
      className={cx(styles.root, SIZE[size], square && styles.square, className)}
      {...props}
    >
      {children}
      {presence ? (
        <span
          className={cx(styles.status, PRESENCE[presence])}
          aria-label={`Status: ${presence}`}
          role="img"
        />
      ) : null}
    </span>
  )
}

export function AvatarImage({
  className,
  alt = '',
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={alt} className={cx(styles.image, className)} {...props} />
}

export function AvatarFallback({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span aria-hidden className={cx(styles.fallback, className)} {...props}>
      {children}
    </span>
  )
}

/** Derive up to two initials from a display name. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

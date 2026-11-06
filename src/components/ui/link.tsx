import { ExternalLink } from 'lucide-react'
import type { AnchorHTMLAttributes } from 'react'

import { cx } from '~/lib/cx'
import { safeHref } from '~/lib/security'
import styles from './link.module.scss'

export type LinkVariant = 'default' | 'standalone' | 'quiet'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant
  disabled?: boolean
  external?: boolean
}

/** Text link with safe href handling and an optional external marker. */
export function Link({
  variant = 'default',
  disabled = false,
  external = false,
  className,
  children,
  href,
  ...props
}: LinkProps) {
  const safe = disabled ? undefined : safeHref(href)

  return (
    <a
      {...props}
      href={safe}
      aria-disabled={disabled || undefined}
      rel={external ? 'noopener noreferrer' : props.rel}
      target={external ? '_blank' : props.target}
      className={cx(
        styles.root,
        variant === 'standalone' && styles.standalone,
        variant === 'quiet' && styles.quiet,
        disabled && styles.disabled,
        className,
      )}
    >
      {children}
      {external ? (
        <span className={styles.icon}>
          <ExternalLink aria-hidden />
        </span>
      ) : null}
    </a>
  )
}

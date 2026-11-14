import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './nav-icon.module.scss'

export interface NavIconProps {
  icon: ReactNode
  label: string
  active?: boolean
  href?: string
  onClick?: () => void
  className?: string
}

/** Compact icon + label navigation target. */
export function NavIcon({ icon, label, active, href, onClick, className }: NavIconProps) {
  const content = (
    <>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </>
  )
  const classes = cx(styles.root, active && styles.active, className)

  return href ? (
    <a className={classes} href={href} aria-current={active ? 'page' : undefined}>
      {content}
    </a>
  ) : (
    <button type="button" className={classes} onClick={onClick} aria-current={active ? 'page' : undefined}>
      {content}
    </button>
  )
}

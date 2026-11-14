import type { ReactNode } from 'react'

import { Portal } from '~/components/primitives/portal'
import { cx } from '~/lib/cx'
import styles from './layer.module.scss'

export interface LayerProps {
  children?: ReactNode
  className?: string
  mount?: HTMLElement | null
  portal?: boolean
}

/** Positioning layer; portals to the body by default. */
export function Layer({ children, className, mount, portal = true }: LayerProps) {
  const content = <div className={cx(styles.root, className)}>{children}</div>
  return portal ? <Portal container={mount}>{content}</Portal> : content
}

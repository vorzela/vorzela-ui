import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './result.module.scss'

export type ResultTone = 'success' | 'info' | 'warning' | 'error'

const TONE: Record<ResultTone, string> = {
  success: styles.success,
  info: styles.info,
  warning: styles.warning,
  error: styles.error,
}

const ICON: Record<ResultTone, LucideIcon> = {
  success: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  error: CircleAlert,
}

export interface ResultProps {
  tone?: ResultTone
  title: string
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

/** Full-section outcome state for success, empty, error and warning pages. */
export function Result({
  tone = 'info',
  title,
  description,
  actions,
  className,
}: ResultProps) {
  const Icon = ICON[tone]

  return (
    <section className={cx(styles.root, TONE[tone], className)}>
      <span className={styles.icon}>
        <Icon aria-hidden />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {description ? <p className={styles.description}>{description}</p> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  )
}

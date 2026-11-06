import * as React from 'react'
import { CircleCheck, Info, Lightbulb, TriangleAlert } from 'lucide-react'

import { cx } from '~/lib/cx'
import styles from './callout.module.scss'

export type CalloutTone = 'info' | 'tip' | 'success' | 'warning'

const TONE = {
  info: { tone: styles.info, icon: Info },
  tip: { tone: styles.tip, icon: Lightbulb },
  success: { tone: styles.success, icon: CircleCheck },
  warning: { tone: styles.warning, icon: TriangleAlert },
} as const

export interface CalloutProps {
  tone?: CalloutTone
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Callout({
  tone = 'info',
  title,
  children,
  className,
}: CalloutProps) {
  const config = TONE[tone]
  const Icon = config.icon

  return (
    <div className={cx(styles.root, config.tone, className)}>
      <Icon className={styles.icon} aria-hidden />
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}

import * as React from 'react'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react'

import { cx } from '~/lib/cx'
import styles from './banner.module.scss'

export type BannerTone = 'info' | 'success' | 'warning' | 'danger'

const TONE = {
  info: { tone: styles.info, icon: Info },
  success: { tone: styles.success, icon: CircleCheck },
  warning: { tone: styles.warning, icon: TriangleAlert },
  danger: { tone: styles.danger, icon: CircleX },
} as const

export interface BannerProps {
  tone?: BannerTone
  title?: React.ReactNode
  children?: React.ReactNode
  action?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function Banner({
  tone = 'info',
  title,
  children,
  action,
  dismissible = false,
  onDismiss,
  className,
}: BannerProps) {
  const [visible, setVisible] = React.useState(true)

  if (!visible) return null

  const config = TONE[tone]
  const Icon = config.icon

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx(styles.root, config.tone, className)}
    >
      <Icon className={styles.icon} aria-hidden />
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        {children ? <div className={styles.content}>{children}</div> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
      {dismissible ? (
        <button
          type="button"
          onClick={() => {
            setVisible(false)
            onDismiss?.()
          }}
          aria-label="Dismiss banner"
          className={styles.dismiss}
        >
          <X aria-hidden />
        </button>
      ) : null}
    </div>
  )
}

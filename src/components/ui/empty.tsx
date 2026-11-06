import type { ReactNode } from 'react'

import { cx } from '~/lib/cx'
import { Button } from './button'
import styles from './empty.module.scss'

export interface EmptyProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void; className?: string }
  className?: string
  iconClassName?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function Empty({
  icon,
  title,
  description,
  action,
  className,
  iconClassName,
  titleClassName,
  descriptionClassName,
}: EmptyProps) {
  return (
    <div className={cx(styles.root, className)}>
      {icon ? (
        <div className={cx(styles.icon, iconClassName)}>{icon}</div>
      ) : null}
      <h3 className={cx(styles.title, titleClassName)}>{title}</h3>
      {description ? (
        <p className={cx(styles.description, descriptionClassName)}>
          {description}
        </p>
      ) : null}
      {action ? (
        <Button
          className={cx(styles.action, action.className)}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}

import type { HTMLAttributes, ReactNode } from 'react'

import { cx } from '~/lib/cx'
import styles from './list.module.scss'

export interface ListProps extends HTMLAttributes<HTMLUListElement> {}

/** Bordered list container for settings rows, activity and pickers. */
export function List({ className, ...props }: ListProps) {
  return <ul className={cx(styles.root, className)} {...props} />
}

export interface ListItemProps
  extends Omit<HTMLAttributes<HTMLLIElement>, 'title'> {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  trailing?: ReactNode
  href?: string
}

export function ListItem({
  icon,
  title,
  description,
  trailing,
  href,
  className,
  ...props
}: ListItemProps) {
  const content = (
    <>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.content}>
        <span className={styles.title}>{title}</span>
        {description ? (
          <span className={styles.description}>{description}</span>
        ) : null}
      </span>
      {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
    </>
  )

  if (href) {
    return (
      <li>
        <a href={href} className={cx(styles.item, className)}>
          {content}
        </a>
      </li>
    )
  }

  return (
    <li className={cx(styles.item, className)} {...props}>
      {content}
    </li>
  )
}

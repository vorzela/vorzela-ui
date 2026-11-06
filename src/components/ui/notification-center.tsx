import * as React from 'react'
import { Bell, CheckCheck } from 'lucide-react'

import { cx } from '~/lib/cx'
import { Button } from './button'
import { Empty } from './empty'
import styles from './notification-center.module.scss'

export type Notification = {
  id: string
  title: React.ReactNode
  description?: React.ReactNode
  time?: string
  read?: boolean
  icon?: React.ReactNode
  onSelect?: () => void
}

export function NotificationCenter({
  notifications,
  onMarkAllRead,
  label = 'Notifications',
  className,
}: {
  notifications: Notification[]
  onMarkAllRead?: () => void
  label?: string
  className?: string
}) {
  const unread = notifications.filter((item) => !item.read).length

  return (
    <section aria-label={label} className={cx(styles.root, className)}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <Bell className={styles.bell} aria-hidden />
          <h2 className={styles.title}>{label}</h2>
          {unread ? <span className={styles.count}>{unread}</span> : null}
        </div>
        {unread && onMarkAllRead ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            className={styles.markAll}
          >
            <CheckCheck aria-hidden />
            Mark all read
          </Button>
        ) : null}
      </header>

      {notifications.length === 0 ? (
        <Empty
          title="All caught up"
          description="New notifications will appear here."
          className={styles.empty}
        />
      ) : (
        <ul className={styles.list} aria-live="polite">
          {notifications.map((item) => (
            <li key={item.id} className={styles.listItem}>
              <button
                type="button"
                onClick={item.onSelect}
                className={cx(styles.item, !item.read && styles.itemUnread)}
              >
                <span className={styles.avatar}>
                  {item.icon ?? <Bell aria-hidden />}
                </span>
                <span className={styles.body}>
                  <span className={styles.titleRow}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    {!item.read ? (
                      <>
                        <span aria-hidden className={styles.dot} />
                        <span className={styles.srOnly}>Unread</span>
                      </>
                    ) : null}
                  </span>
                  {item.description ? (
                    <span className={styles.description}>{item.description}</span>
                  ) : null}
                  {item.time ? (
                    <span className={styles.time}>{item.time}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
